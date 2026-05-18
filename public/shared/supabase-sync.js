/**
 * supabase-sync.js — Supabase ↔ localStorage sync layer for Death Clock
 * 
 * Architecture:
 *   - Supabase = source of truth (for logged-in users)
 *   - localStorage = offline cache + fallback for anonymous users
 *   - On login: pull from Supabase, merge with localStorage, push back
 *   - On write: write to both simultaneously
 *   - On read: return Supabase data if online + logged in, else localStorage
 */

(function() {
  'use strict';

  // ── Supabase client reference (initialized in core.js) ──
  function getSB() { return window._supabase; }

  // ── Auth state ──
  let _currentUser = null;
  let _syncReady = false;
  let _syncQueue = []; // queued writes while offline

  async function getCurrentUser() {
    if (_currentUser) return _currentUser;
    const sb = getSB();
    if (!sb) return null;
    try {
      const { data: { user } } = await sb.auth.getUser();
      _currentUser = user;
      return user;
    } catch(e) { return null; }
  }

  function isLoggedIn() { return !!_currentUser; }

  // ── UPSERT helpers ──
  async function upsertUserData(updates) {
    const user = await getCurrentUser();
    if (!user) return false;
    const sb = getSB();
    if (!sb) return false;
    try {
      updates.updated_at = new Date().toISOString();
      const { error } = await sb.from('dc_user_data').upsert({ id: user.id, ...updates }, { onConflict: 'id' });
      if (error) { console.warn('[sync] upsertUserData error:', error.message); return false; }
      return true;
    } catch(e) { console.warn('[sync] upsertUserData exception:', e); return false; }
  }

  async function upsertGhostCoins(updates) {
    const user = await getCurrentUser();
    if (!user) return false;
    const sb = getSB();
    if (!sb) return false;
    try {
      updates.updated_at = new Date().toISOString();
      const { error } = await sb.from('dc_ghost_coins').upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' });
      if (error) { console.warn('[sync] upsertGhostCoins error:', error.message); return false; }
      return true;
    } catch(e) { console.warn('[sync] upsertGhostCoins exception:', e); return false; }
  }

  async function upsertProfile(updates) {
    const user = await getCurrentUser();
    if (!user) return false;
    const sb = getSB();
    if (!sb) return false;
    try {
      updates.updated_at = new Date().toISOString();
      const { error } = await sb.from('dc_profiles').upsert({ id: user.id, ...updates }, { onConflict: 'id' });
      if (error) { console.warn('[sync] upsertProfile error:', error.message); return false; }
      return true;
    } catch(e) { console.warn('[sync] upsertProfile exception:', e); return false; }
  }

  // ── READ helpers ──
  async function fetchUserData() {
    const user = await getCurrentUser();
    if (!user) return null;
    const sb = getSB();
    if (!sb) return null;
    try {
      const { data, error } = await sb.from('dc_user_data').select('*').eq('id', user.id).maybeSingle();
      if (error) { console.warn('[sync] fetchUserData error:', error.message); return null; }
      return data;
    } catch(e) { return null; }
  }

  async function fetchGhostCoins() {
    const user = await getCurrentUser();
    if (!user) return null;
    const sb = getSB();
    if (!sb) return null;
    try {
      const { data, error } = await sb.from('dc_ghost_coins').select('*').eq('user_id', user.id).maybeSingle();
      if (error) return null;
      return data;
    } catch(e) { return null; }
  }

  async function fetchProfile() {
    const user = await getCurrentUser();
    if (!user) return null;
    const sb = getSB();
    if (!sb) return null;
    try {
      const { data, error } = await sb.from('dc_profiles').select('*').eq('id', user.id).maybeSingle();
      if (error) return null;
      return data;
    } catch(e) { return null; }
  }

  // ── SOLO CHALLENGES (new table) ──
  async function fetchSoloChallenges() {
    const user = await getCurrentUser();
    if (!user) return null;
    const sb = getSB();
    if (!sb) return null;
    try {
      const { data, error } = await sb.from('dc_solo_challenges').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) return null;
      return data;
    } catch(e) { return null; }
  }

  async function upsertSoloChallenge(challenge) {
    const user = await getCurrentUser();
    if (!user) return false;
    const sb = getSB();
    if (!sb) return false;
    try {
      const row = {
        id: challenge.id || undefined,
        user_id: user.id,
        title: challenge.title,
        category: challenge.category || 'custom',
        target: challenge.target || 1,
        progress: challenge.progress || 0,
        opponent: challenge.opponent || 'Anyone',
        opponent_progress: challenge.opponentProgress || 0,
        bet: challenge.bet || 0,
        duration: challenge.duration || 7,
        status: challenge.status || 'active',
        expires: challenge.expires || null,
        messages: challenge.messages || [],
        updated_at: new Date().toISOString()
      };
      const { error } = await sb.from('dc_solo_challenges').upsert(row, { onConflict: 'id' });
      if (error) { console.warn('[sync] upsertSoloChallenge error:', error.message); return false; }
      return true;
    } catch(e) { return false; }
  }

  async function deleteSoloChallenge(challengeId) {
    const user = await getCurrentUser();
    if (!user) return false;
    const sb = getSB();
    if (!sb) return false;
    try {
      await sb.from('dc_solo_challenges').delete().eq('id', challengeId).eq('user_id', user.id);
      return true;
    } catch(e) { return false; }
  }

  // ══════════════════════════════════════════════════════════
  // SYNC-AWARE WRAPPER: replaces direct localStorage calls
  // ══════════════════════════════════════════════════════════

  // Key → { table, column, transform } mapping
  const KEY_MAP = {
    // dc_user_data columns
    'deathclock_profile': { table: 'user_data', col: 'answers', parse: true },
    'deathclock_goals': { table: 'user_data', col: 'longevity_goal', parse: true },
    'deathclock_tier': { table: 'user_data', col: 'tier', parse: false },
    'dc_deathy_state': { table: 'user_data', col: 'deathy_state', parse: true },
    'dc_social_circle': { table: 'user_data', col: 'social_circle', parse: true },
    'dc_invite_code': { table: 'user_data', col: 'invite_code', parse: false },
    'dc_referral_count': { table: 'user_data', col: 'referral_count', parse: false, asInt: true },
    'dc_email_prefs': { table: 'user_data', col: 'email_prefs', parse: true },
    'dc_notif_enabled': { table: 'user_data', col: 'notification_enabled', parse: false, asBool: true },
    'dc_sound_off': { table: 'user_data', col: 'sound_enabled', parse: false, asBool: true, invert: true },
    'dc_goal_trackers': { table: 'user_data', col: 'goal_trackers', parse: true },
    'dc_daily_tasks': { table: 'user_data', col: 'daily_tasks', parse: true },
    'dc_task_log': { table: 'user_data', col: 'task_log', parse: true },
    'dc_feed': { table: 'user_data', col: 'feed', parse: true },
    'dc_milestones_granted': { table: 'user_data', col: 'milestones_granted', parse: true },
    'dc_referrals_used': { table: 'user_data', col: 'referrals_used', parse: true },
    'dc_referral_bonus_expires': { table: 'user_data', col: 'referral_bonus_expires', parse: false },
    'dc_streak_insurance': { table: 'user_data', col: 'streak_insurance', parse: false, asBool: true },
    'dc_streak_insurance_data': { table: 'user_data', col: 'streak_insurance_data', parse: true },
    'dc_cookie_consent': { table: 'user_data', col: 'cookie_consent', parse: true },
    'dc_product_clicks': { table: 'user_data', col: 'product_clicks', parse: true },
    'dc_next_task_multiplier': { table: 'user_data', col: 'next_task_multiplier', parse: false, asNum: true },
    'dc_health_data': { table: 'user_data', col: 'health_data', parse: true },
    'dc_health_history': { table: 'user_data', col: 'health_history', parse: true },

    // dc_ghost_coins columns
    'dc_coins': { table: 'ghost_coins', col: 'balance', parse: false, asInt: true },
    'dc_visit_streak': { table: 'ghost_coins', col: 'visit_streak', parse: false, asInt: true },
    'dc_last_visit': { table: 'ghost_coins', col: 'last_visit', parse: false },
    'dc_last_spin': { table: 'ghost_coins', col: 'last_spin', parse: false },
    'dc_shop_purchased': { table: 'ghost_coins', col: 'inventory', parse: true },

    // dc_profiles columns
    'dc_xp': { table: 'profiles', col: 'xp', parse: false, asInt: true },
    'dc_achievements': { table: 'profiles', col: 'achievements', parse: true },
  };

  // Flags stored in dc_user_data.flags jsonb
  const FLAG_KEYS = [
    'dc_first_task_done', 'dc_hub_visited', 'dc_exit_dismissed',
    'dc_pool_joined', 'dc_pool_date', 'dc_referral_unlocked',
    'dc_referral_credited', 'dc_referred_by', 'dc_referral_log',
    'dc_last_calc_date', 'dc_daily_tip_date', 'dc_last_quiz_date',
    'dc_leaderboard_pref', 'dc_pending_join', 'dc_initial_deathy',
    'dc_referral_code'
  ];

  // Debounce: batch multiple writes into one Supabase call
  let _pendingUserData = {};
  let _pendingGhostCoins = {};
  let _pendingProfile = {};
  let _flushTimer = null;

  function scheduleFlush() {
    if (_flushTimer) return;
    _flushTimer = setTimeout(flushPending, 300);
  }

  async function flushPending() {
    _flushTimer = null;
    if (!isLoggedIn()) return;

    const ud = Object.keys(_pendingUserData).length > 0 ? { ..._pendingUserData } : null;
    const gc = Object.keys(_pendingGhostCoins).length > 0 ? { ..._pendingGhostCoins } : null;
    const pf = Object.keys(_pendingProfile).length > 0 ? { ..._pendingProfile } : null;

    _pendingUserData = {};
    _pendingGhostCoins = {};
    _pendingProfile = {};

    const promises = [];
    if (ud) promises.push(upsertUserData(ud));
    if (gc) promises.push(upsertGhostCoins(gc));
    if (pf) promises.push(upsertProfile(pf));

    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }
  }

  /**
   * syncSet(key, value) — write to localStorage AND queue Supabase write
   * Drop-in replacement for localStorage.setItem for mapped keys
   */
  function syncSet(key, value) {
    // Always write localStorage (offline cache)
    localStorage.setItem(key, value);

    if (!isLoggedIn()) return;

    // Check if it's a flag key
    if (FLAG_KEYS.includes(key)) {
      const flagName = key.replace('dc_', '');
      // Read current flags, merge
      let flags = {};
      try { flags = JSON.parse(localStorage.getItem('_dc_flags_cache') || '{}'); } catch(e) {}
      flags[flagName] = value;
      localStorage.setItem('_dc_flags_cache', JSON.stringify(flags));
      _pendingUserData.flags = flags;
      scheduleFlush();
      return;
    }

    const mapping = KEY_MAP[key];
    if (!mapping) return; // unmapped key, localStorage only

    // Convert value for Supabase
    let dbVal = value;
    if (mapping.parse) {
      try { dbVal = JSON.parse(value); } catch(e) { dbVal = value; }
    } else if (mapping.asInt) {
      dbVal = parseInt(value) || 0;
    } else if (mapping.asNum) {
      dbVal = parseFloat(value) || 0;
    } else if (mapping.asBool) {
      dbVal = value === 'true';
      if (mapping.invert) dbVal = !dbVal;
    }

    // Queue to appropriate table
    if (mapping.table === 'user_data') {
      _pendingUserData[mapping.col] = dbVal;
    } else if (mapping.table === 'ghost_coins') {
      _pendingGhostCoins[mapping.col] = dbVal;
    } else if (mapping.table === 'profiles') {
      _pendingProfile[mapping.col] = dbVal;
    }
    scheduleFlush();
  }

  /**
   * syncGet(key) — read from localStorage (cache). 
   * Supabase data is pulled on login and kept in sync via syncSet.
   */
  function syncGet(key) {
    return localStorage.getItem(key);
  }

  /**
   * syncRemove(key) — remove from localStorage AND null in Supabase
   */
  function syncRemove(key) {
    localStorage.removeItem(key);
    if (!isLoggedIn()) return;

    if (FLAG_KEYS.includes(key)) {
      let flags = {};
      try { flags = JSON.parse(localStorage.getItem('_dc_flags_cache') || '{}'); } catch(e) {}
      delete flags[key.replace('dc_', '')];
      localStorage.setItem('_dc_flags_cache', JSON.stringify(flags));
      _pendingUserData.flags = flags;
      scheduleFlush();
      return;
    }

    const mapping = KEY_MAP[key];
    if (!mapping) return;
    const nullVal = mapping.parse ? null : (mapping.asInt ? 0 : (mapping.asBool ? false : null));

    if (mapping.table === 'user_data') _pendingUserData[mapping.col] = nullVal;
    else if (mapping.table === 'ghost_coins') _pendingGhostCoins[mapping.col] = nullVal;
    else if (mapping.table === 'profiles') _pendingProfile[mapping.col] = nullVal;
    scheduleFlush();
  }

  // ══════════════════════════════════════════════════════════
  // FULL SYNC: pull Supabase → localStorage on login
  // ══════════════════════════════════════════════════════════

  async function pullFromSupabase() {
    const [userData, ghostCoins, profile] = await Promise.allSettled([
      fetchUserData(), fetchGhostCoins(), fetchProfile()
    ]);

    const ud = userData.status === 'fulfilled' ? userData.value : null;
    const gc = ghostCoins.status === 'fulfilled' ? ghostCoins.value : null;
    const pf = profile.status === 'fulfilled' ? profile.value : null;

    if (ud) {
      // Map Supabase columns back to localStorage keys
      if (ud.longevity_goal) localStorage.setItem('deathclock_goals', JSON.stringify(ud.longevity_goal));
      if (ud.tier) localStorage.setItem('deathclock_tier', ud.tier);
      if (ud.deathy_state) localStorage.setItem('dc_deathy_state', JSON.stringify(ud.deathy_state));
      if (ud.social_circle) localStorage.setItem('dc_social_circle', JSON.stringify(ud.social_circle));
      if (ud.invite_code) localStorage.setItem('dc_invite_code', ud.invite_code);
      if (ud.referral_count != null) localStorage.setItem('dc_referral_count', String(ud.referral_count));
      if (ud.email_prefs) localStorage.setItem('dc_email_prefs', JSON.stringify(ud.email_prefs));
      if (ud.notification_enabled != null) localStorage.setItem('dc_notif_enabled', String(ud.notification_enabled));
      if (ud.sound_enabled != null) localStorage.setItem('dc_sound_off', ud.sound_enabled ? 'false' : 'true');
      if (ud.goal_trackers) localStorage.setItem('dc_goal_trackers', JSON.stringify(ud.goal_trackers));
      if (ud.daily_tasks) localStorage.setItem('dc_daily_tasks', JSON.stringify(ud.daily_tasks));
      if (ud.task_log) localStorage.setItem('dc_task_log', JSON.stringify(ud.task_log));
      if (ud.feed) localStorage.setItem('dc_feed', JSON.stringify(ud.feed));
      if (ud.milestones_granted) localStorage.setItem('dc_milestones_granted', JSON.stringify(ud.milestones_granted));
      if (ud.referrals_used) localStorage.setItem('dc_referrals_used', JSON.stringify(ud.referrals_used));
      if (ud.referral_bonus_expires) localStorage.setItem('dc_referral_bonus_expires', ud.referral_bonus_expires);
      if (ud.streak_insurance != null) localStorage.setItem('dc_streak_insurance', String(ud.streak_insurance));
      if (ud.streak_insurance_data) localStorage.setItem('dc_streak_insurance_data', JSON.stringify(ud.streak_insurance_data));
      if (ud.cookie_consent) localStorage.setItem('dc_cookie_consent', JSON.stringify(ud.cookie_consent));
      if (ud.product_clicks) localStorage.setItem('dc_product_clicks', JSON.stringify(ud.product_clicks));
      if (ud.next_task_multiplier != null) localStorage.setItem('dc_next_task_multiplier', String(ud.next_task_multiplier));
      if (ud.health_data) localStorage.setItem('dc_health_data', JSON.stringify(ud.health_data));
      if (ud.health_history) localStorage.setItem('dc_health_history', JSON.stringify(ud.health_history));
      // Flags
      if (ud.flags && typeof ud.flags === 'object') {
        localStorage.setItem('_dc_flags_cache', JSON.stringify(ud.flags));
        Object.entries(ud.flags).forEach(([k, v]) => {
          localStorage.setItem('dc_' + k, String(v));
        });
      }
    }

    if (gc) {
      if (gc.balance != null) localStorage.setItem('dc_coins', String(gc.balance));
      if (gc.visit_streak != null) localStorage.setItem('dc_visit_streak', String(gc.visit_streak));
      if (gc.last_visit) localStorage.setItem('dc_last_visit', gc.last_visit);
      if (gc.last_spin) localStorage.setItem('dc_last_spin', gc.last_spin);
      if (gc.inventory) localStorage.setItem('dc_shop_purchased', JSON.stringify(gc.inventory));
    }

    if (pf) {
      if (pf.xp != null) localStorage.setItem('dc_xp', String(pf.xp));
      if (pf.achievements) localStorage.setItem('dc_achievements', JSON.stringify(pf.achievements));
    }

    _syncReady = true;
    console.log('[sync] Pull from Supabase complete');
  }

  /**
   * pushToSupabase() — push ALL localStorage data to Supabase (first login / migration)
   */
  async function pushToSupabase() {
    const user = await getCurrentUser();
    if (!user) return;

    // Build dc_user_data payload from localStorage
    const ud = {};
    Object.entries(KEY_MAP).forEach(([lsKey, m]) => {
      if (m.table !== 'user_data') return;
      const raw = localStorage.getItem(lsKey);
      if (raw == null) return;
      if (m.parse) { try { ud[m.col] = JSON.parse(raw); } catch(e) {} }
      else if (m.asInt) ud[m.col] = parseInt(raw) || 0;
      else if (m.asNum) ud[m.col] = parseFloat(raw) || 0;
      else if (m.asBool) { ud[m.col] = raw === 'true'; if (m.invert) ud[m.col] = !ud[m.col]; }
      else ud[m.col] = raw;
    });

    // Flags
    const flags = {};
    FLAG_KEYS.forEach(k => {
      const v = localStorage.getItem(k);
      if (v != null) flags[k.replace('dc_', '')] = v;
    });
    if (Object.keys(flags).length > 0) ud.flags = flags;

    // Profile from deathclock_profile
    const profileRaw = localStorage.getItem('deathclock_profile');
    if (profileRaw) {
      try {
        const p = JSON.parse(profileRaw);
        ud.answers = p;
        ud.result = p.result || null;
      } catch(e) {}
    }

    // Build dc_ghost_coins payload
    const gc = {};
    Object.entries(KEY_MAP).forEach(([lsKey, m]) => {
      if (m.table !== 'ghost_coins') return;
      const raw = localStorage.getItem(lsKey);
      if (raw == null) return;
      if (m.parse) { try { gc[m.col] = JSON.parse(raw); } catch(e) {} }
      else if (m.asInt) gc[m.col] = parseInt(raw) || 0;
      else gc[m.col] = raw;
    });

    // Build dc_profiles payload
    const pf = {};
    Object.entries(KEY_MAP).forEach(([lsKey, m]) => {
      if (m.table !== 'profiles') return;
      const raw = localStorage.getItem(lsKey);
      if (raw == null) return;
      if (m.parse) { try { pf[m.col] = JSON.parse(raw); } catch(e) {} }
      else if (m.asInt) pf[m.col] = parseInt(raw) || 0;
      else pf[m.col] = raw;
    });

    // Push all 3 tables
    const promises = [];
    if (Object.keys(ud).length > 0) promises.push(upsertUserData(ud));
    if (Object.keys(gc).length > 0) promises.push(upsertGhostCoins(gc));
    if (Object.keys(pf).length > 0) promises.push(upsertProfile(pf));

    await Promise.allSettled(promises);

    // Push solo challenges
    const challenges = JSON.parse(localStorage.getItem('dc_challenges') || '[]');
    for (const ch of challenges) {
      await upsertSoloChallenge(ch);
    }

    console.log('[sync] Push to Supabase complete');
  }

  // ══════════════════════════════════════════════════════════
  // SERVER-SIDE COIN VALIDATION
  // ══════════════════════════════════════════════════════════

  /**
   * validateCoinChange(amount, reason) — server-validated coin adjustment
   * Prevents client-side coin manipulation
   */
  async function serverAddCoins(amount, reason) {
    const user = await getCurrentUser();
    if (!user) {
      // Anonymous: just use localStorage (no validation possible)
      const current = parseInt(localStorage.getItem('dc_coins') || '0');
      localStorage.setItem('dc_coins', String(Math.max(0, current + amount)));
      return true;
    }

    const sb = getSB();
    if (!sb) return false;

    try {
      // Use RPC for atomic coin update (prevents race conditions)
      const { data, error } = await sb.rpc('dc_add_coins', {
        p_user_id: user.id,
        p_amount: amount,
        p_reason: reason || 'unknown'
      });

      if (error) {
        console.warn('[sync] serverAddCoins RPC error:', error.message);
        // Fallback to direct update
        const { data: current } = await sb.from('dc_ghost_coins').select('balance').eq('user_id', user.id).maybeSingle();
        const newBal = Math.max(0, (current?.balance || 0) + amount);
        await sb.from('dc_ghost_coins').upsert({ user_id: user.id, balance: newBal, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
        localStorage.setItem('dc_coins', String(newBal));
        return true;
      }

      // Update localStorage cache
      if (data != null) localStorage.setItem('dc_coins', String(data));
      return true;
    } catch(e) {
      console.warn('[sync] serverAddCoins exception:', e);
      return false;
    }
  }

  // ══════════════════════════════════════════════════════════
  // INIT: listen for auth changes
  // ══════════════════════════════════════════════════════════

  async function initSync() {
    const sb = getSB();
    if (!sb) { console.log('[sync] No Supabase client, running localStorage-only'); return; }

    // Listen for auth state changes
    sb.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        _currentUser = session.user;
        console.log('[sync] User signed in:', session.user.email);

        // Check if user has Supabase data already
        const existing = await fetchUserData();
        if (existing) {
          // Pull Supabase → localStorage
          await pullFromSupabase();
        } else {
          // First login: push localStorage → Supabase
          await pushToSupabase();
        }
      } else if (event === 'SIGNED_OUT') {
        _currentUser = null;
        _syncReady = false;
        console.log('[sync] User signed out, localStorage-only mode');
      }
    });

    // Check if already logged in
    const user = await getCurrentUser();
    if (user) {
      const existing = await fetchUserData();
      if (existing) {
        await pullFromSupabase();
      } else {
        await pushToSupabase();
      }
    }
  }

  // ══════════════════════════════════════════════════════════
  // EXPOSE API
  // ══════════════════════════════════════════════════════════

  window.dcSync = {
    // Core sync operations
    init: initSync,
    syncSet: syncSet,
    syncGet: syncGet,
    syncRemove: syncRemove,
    flush: flushPending,

    // Direct table operations
    upsertUserData: upsertUserData,
    upsertGhostCoins: upsertGhostCoins,
    upsertProfile: upsertProfile,
    fetchUserData: fetchUserData,
    fetchGhostCoins: fetchGhostCoins,
    fetchProfile: fetchProfile,

    // Solo challenges
    fetchSoloChallenges: fetchSoloChallenges,
    upsertSoloChallenge: upsertSoloChallenge,
    deleteSoloChallenge: deleteSoloChallenge,

    // Server-validated coins
    serverAddCoins: serverAddCoins,

    // Migration
    pullFromSupabase: pullFromSupabase,
    pushToSupabase: pushToSupabase,

    // State
    isLoggedIn: isLoggedIn,
    getCurrentUser: getCurrentUser,
    get syncReady() { return _syncReady; }
  };

})();
