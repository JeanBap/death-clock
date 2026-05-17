// ============================================
// STATE
// ============================================
const state = {
  currentPage: 'home',
  currentQuestion: 0,
  answers: {},
  result: null,
  bucketList: [],
  goals: [],
  currentTab: 'factors',
  longevityGoal: null,
  userTier: 'free',
  savedProfile: null,
  supaUser: null
};

// ============================================
// SUPABASE CLIENT
// ============================================
const SUPABASE_URL = 'https://tosyulolriavzgkpwzrn.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvc3l1bG9scmlhdnpna3B3enJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzE0NzIsImV4cCI6MjA5NDM0NzQ3Mn0.LVxiplL8DGVB481AXiEDVGWplfXprMPK_zR8A__6j7M';
let supaClient = null;
try { supaClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON); } catch(e) { console.warn('Supabase init failed:', e); }
// Single project: all Death Clock data lives on upsideshare (tosyulolriavzgkpwzrn)
const socialClient = supaClient;

// ============================================
// DATA PERSISTENCE LAYER
// ============================================
const DataStore = {
  // Determine storage mode
  isCloud() { return state.userTier !== 'free' && supaClient && state.supaUser; },

  // Save all user data
  async save() {
    const data = {
      answers: state.answers,
      result: state.result ? { ...state.result, deathDate: state.result.deathDate.getTime(), dob: state.result.dob.getTime() } : null,
      bucketList: state.bucketList,
      longevityGoal: state.longevityGoal,
      deathyState: getDeathyState(),
      socialCircle: JSON.parse(localStorage.getItem('dc_social_circle') || '[]'),
      inviteCode: localStorage.getItem('dc_invite_code') || '',
      referralCount: parseInt(localStorage.getItem('dc_referral_count') || '0'),
      emailPrefs: JSON.parse(localStorage.getItem('dc_email_prefs') || '{}'),
      notifEnabled: localStorage.getItem('dc_notif_enabled') === 'true',
      soundOff: localStorage.getItem('dc_sound_off') === 'true',
      tier: state.userTier,
      savedAt: new Date().toISOString()
    };

    // Always save to localStorage (offline fallback)
    try { localStorage.setItem('deathclock_profile', JSON.stringify(data)); } catch(e) {}

    // If paid + authenticated, also sync to Supabase
    if (this.isCloud()) {
      try {
        const { data: existing } = await supaClient.from('dc_profiles').select('id').eq('user_id', state.supaUser.id).single();
        const row = {
          user_id: state.supaUser.id,
          email: state.supaUser.email,
          answers: data.answers,
          result: data.result,
          bucket_list: data.bucketList,
          longevity_goal: data.longevityGoal,
          deathy_state: data.deathyState,
          social_circle: data.socialCircle,
          invite_code: data.inviteCode,
          referral_count: data.referralCount,
          tier: data.tier,
          email_prefs: data.emailPrefs,
          notification_enabled: data.notifEnabled,
          sound_enabled: !data.soundOff
        };
        if (existing) {
          await supaClient.from('dc_profiles').update(row).eq('user_id', state.supaUser.id);
        } else {
          await supaClient.from('dc_profiles').insert(row);
        }
        return 'cloud';
      } catch(e) { console.warn('Cloud save failed, local saved:', e); return 'local'; }
    }
    return 'local';
  },

  // Load user data
  async load() {
    // Try cloud first if paid + auth
    if (this.isCloud()) {
      try {
        const { data: profile } = await supaClient.from('dc_profiles').select('*').eq('user_id', state.supaUser.id).single();
        if (profile) {
          this._applyProfile(profile, true);
          return 'cloud';
        }
      } catch(e) { console.warn('Cloud load failed:', e); }
    }
    // Fallback to localStorage
    try {
      const saved = localStorage.getItem('deathclock_profile');
      if (!saved) return false;
      const profile = JSON.parse(saved);
      this._applyProfile(profile, false);
      return 'local';
    } catch(e) { return false; }
  },

  _applyProfile(p, isCloud) {
    if (isCloud) {
      state.answers = p.answers || {};
      state.bucketList = p.bucket_list || [];
      state.longevityGoal = p.longevity_goal;
      state.userTier = p.tier || 'free';
      if (p.result) {
        state.result = { ...p.result, deathDate: new Date(p.result.deathDate), dob: new Date(p.result.dob) };
        if (state.result.factors) state.result.factors.sort((a, b) => a.impact - b.impact);
      }
      if (p.deathy_state) saveDeathyState(p.deathy_state);
      if (p.social_circle) localStorage.setItem('dc_social_circle', JSON.stringify(p.social_circle));
      if (p.invite_code) localStorage.setItem('dc_invite_code', p.invite_code);
      if (p.referral_count) localStorage.setItem('dc_referral_count', String(p.referral_count));
      if (p.email_prefs) localStorage.setItem('dc_email_prefs', JSON.stringify(p.email_prefs));
      if (p.notification_enabled) localStorage.setItem('dc_notif_enabled', 'true');
      localStorage.setItem('dc_sound_off', p.sound_enabled === false ? 'true' : 'false');
    } else {
      state.answers = p.answers || {};
      state.bucketList = p.bucketList || [];
      state.longevityGoal = p.longevityGoal;
      state.userTier = p.tier || state.userTier;
      if (p.result) {
        state.result = { ...p.result, deathDate: new Date(p.result.deathDate || p.result.deathDate), dob: new Date(p.result.dob || p.result.dob) };
        if (state.result.factors) state.result.factors.sort((a, b) => a.impact - b.impact);
      }
    }
    if (state.result) {
      document.getElementById('navDash')?.classList.remove('hidden');
      document.getElementById('navPrice')?.classList.remove('hidden');
      const cta = document.getElementById('navCta');
      if (cta) cta.textContent = 'Recalculate';
    }
  },

  // Log a habit to Supabase (paid only)
  async logHabit(habitKey, daysAdded) {
    if (!this.isCloud()) return;
    try {
      const { data: profile } = await supaClient.from('dc_profiles').select('id').eq('user_id', state.supaUser.id).single();
      if (profile) {
        await supaClient.from('dc_habit_log').insert({ profile_id: profile.id, habit_key: habitKey, days_added: daysAdded });
      }
    } catch(e) {}
  }
};

// Auth state listener
if (supaClient) {
  supaClient.auth.onAuthStateChange((event, session) => {
    state.supaUser = session?.user || null;
    state.socialUser = session?.user || null;
    if (session?.user) {
      updateProfileUI();
      loadSocialProfile();
      if (state.userTier !== 'free') DataStore.load();
      document.getElementById('navMansion')?.classList.remove('hidden');
    }
  });
  // Check existing session
  supaClient.auth.getSession().then(({ data }) => {
    state.supaUser = data?.session?.user || null;
    state.socialUser = data?.session?.user || null;
    if (state.supaUser) {
      updateProfileUI();
      loadSocialProfile();
      document.getElementById('navMansion')?.classList.remove('hidden');
    }
  });
}

function updateProfileUI() {
  const btn = document.getElementById('profileBtn');
  if (btn && state.supaUser) {
    btn.textContent = state.supaUser.email?.split('@')[0] || 'Profile';
    btn.classList.remove('hidden');
  }
  // Toggle auth sections
  const loggedOut = document.getElementById('authLoggedOut');
  const loggedIn = document.getElementById('authLoggedIn');
  if (state.supaUser) {
    if (loggedOut) loggedOut.classList.add('hidden');
    if (loggedIn) loggedIn.classList.remove('hidden');
    // Populate profile info
    const name = document.getElementById('profileName');
    const email = document.getElementById('profileEmail');
    if (name) name.textContent = state.supaUser.email?.split('@')[0] || 'Ghost';
    if (email) email.textContent = state.supaUser.email || '';
    // Populate stats from state
    const yearsLeft = document.getElementById('profileYearsLeft');
    const daysAdded = document.getElementById('profileDaysAdded');
    const score = document.getElementById('profileScore');
    if (yearsLeft && state.deathAge) yearsLeft.textContent = Math.max(0, Math.round(state.deathAge - (state.age || 30)));
    if (daysAdded) daysAdded.textContent = state.totalDaysAdded || 0;
    if (score && state.lifeScore) score.textContent = state.lifeScore;
    // Sync status
    const syncStatus = document.getElementById('profileSyncStatus');
    if (syncStatus) syncStatus.textContent = state.userTier !== 'free' ? 'Cloud sync active' : 'Data saved locally (upgrade for cloud sync)';
    // Tier badge
    const tier = document.getElementById('profileTier');
    if (tier) tier.textContent = (state.userTier || 'free').toUpperCase();
  } else {
    if (loggedOut) loggedOut.classList.remove('hidden');
    if (loggedIn) loggedIn.classList.add('hidden');
    if (btn) { btn.textContent = 'Profile'; }
  }
}




// ============================================
// AUTH GUARD - redirect unauthenticated users
// ============================================
function requireAuth() {
  if (!supaClient) return;
  const protectedPages = ['/mansion.html', '/groups.html', '/dashboard.html'];
  const currentPath = window.location.pathname;
  if (!protectedPages.some(p => currentPath.endsWith(p))) return;

  supaClient.auth.getSession().then(({ data }) => {
    if (!data?.session?.user) {
      window.location.href = '/profile.html?redirect=' + encodeURIComponent(currentPath);
    }
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', requireAuth);
} else {
  requireAuth();
}


// ============================================
// ACCOUNT DELETION (GDPR Art. 17)
// ============================================
async function deleteAccount() {
  if (!supaClient || !state.supaUser) return;
  const confirmed = confirm('This will permanently delete your account and all data. This cannot be undone. Are you sure?');
  if (!confirmed) return;
  const doubleConfirm = confirm('FINAL WARNING: All your progress, habits, ghost coins, and social connections will be deleted forever. Type-confirm by clicking OK.');
  if (!doubleConfirm) return;

  try {
    const userId = state.supaUser.id;
    // Delete user data from all tables
    await supaClient.from('dc_profiles').delete().eq('user_id', userId);
    await supaClient.from('dc_habit_log').delete().eq('user_id', userId);
    await supaClient.from('dc_social_profiles').delete().eq('user_id', userId);
    await supaClient.from('dc_groups').delete().eq('owner_id', userId);
    await supaClient.from('dc_group_members').delete().eq('user_id', userId);
    await supaClient.from('ghost_interactions').delete().eq('actor_id', userId);
    await supaClient.from('ghost_challenges').delete().eq('challenger_id', userId);
    await supaClient.from('ghost_challenges').delete().eq('challenged_id', userId);
    // Clear local storage
    localStorage.clear();
    // Sign out
    await supaClient.auth.signOut();
    alert("Account deleted successfully. We are sorry to see you go.");
    window.location.href = '/';
  } catch (e) {
    console.warn('Delete account error:', e);
    alert('Error deleting account. Please contact support.');
  }
}

// ============================================
// COOKIE CONSENT
// ============================================

function acceptCookies(level) {
  const consent = { level, timestamp: new Date().toISOString() };
  try { localStorage.setItem('dc_cookie_consent', JSON.stringify(consent)); } catch(e) {}
  document.getElementById('cookieBanner').classList.add('hidden');
}

function checkCookieConsent() {
  try {
    const consent = localStorage.getItem('dc_cookie_consent');
    if (!consent) {
      document.getElementById('cookieBanner').classList.remove('hidden');
    }
  } catch(e) {
    // localStorage not available, show banner
    document.getElementById('cookieBanner').classList.remove('hidden');
  }
}



function escHtml(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }


// ============================================
// NAV TIMER BAR
// ============================================

function updateNavTimer() {
  if (!state.result) return;
  const bar = document.getElementById('deathyTimerBar');
  if (!bar) return;
  bar.classList.add('active');

  const now = new Date();
  const diff = state.result.deathDate - now;
  if (diff <= 0) {
    document.getElementById('navTimer').textContent = 'TIME IS UP';
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  document.getElementById('navTimer').textContent =
    d.toLocaleString() + 'd ' + String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');

  // Ghost health display
  const params = getDeathyParams();
  const hScore = calcDeathyHealth(params);
  const g = state.longevityGoal;
  const totalScore = Math.min(100, hScore + Math.min(20, ((g && g.totalDaysAdded)||0)*0.5));
  const healthEl = document.getElementById('navGhostHealth');
  if (healthEl) {
    const color = totalScore >= 70 ? 'var(--green)' : totalScore >= 40 ? 'var(--gold)' : 'var(--accent)';
    healthEl.style.color = color;
    healthEl.textContent = Math.round(totalScore) + '/100';
  }

  // Walking Deathy mini ghost - changes based on health
  const walker = document.getElementById('deathyWalker');
  if (walker && !walker.hasChildNodes()) {
    const ghostColor = totalScore >= 70 ? '#4ecca3' : totalScore >= 40 ? '#f0c040' : '#e94560';
    const eyeStyle = totalScore >= 70 ? 'happy' : totalScore >= 40 ? 'neutral' : 'sad';
    const timerAccessories = typeof getGhostAccessories === 'function' ? getGhostAccessories() : '';
    walker.innerHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="90" rx="22" ry="4" fill="rgba(255,255,255,0.05)"/>
      <path d="M25,55 Q25,15 50,15 Q75,15 75,55 L75,75 Q70,70 65,75 Q60,70 55,75 Q50,70 45,75 Q40,70 35,75 Q30,70 25,75 Z" fill="${ghostColor}" opacity="0.9"/>
      ${eyeStyle === 'happy' ?
        '<circle cx="38" cy="42" r="4" fill="#0a0a0f"/><circle cx="62" cy="42" r="4" fill="#0a0a0f"/><path d="M38,52 Q50,62 62,52" stroke="#0a0a0f" stroke-width="2.5" fill="none" stroke-linecap="round"/>' :
        eyeStyle === 'neutral' ?
        '<circle cx="38" cy="42" r="4" fill="#0a0a0f"/><circle cx="62" cy="42" r="4" fill="#0a0a0f"/><line x1="40" y1="55" x2="60" y2="55" stroke="#0a0a0f" stroke-width="2.5" stroke-linecap="round"/>' :
        '<circle cx="38" cy="44" r="4" fill="#0a0a0f"/><circle cx="62" cy="44" r="4" fill="#0a0a0f"/><path d="M38,58 Q50,50 62,58" stroke="#0a0a0f" stroke-width="2.5" fill="none" stroke-linecap="round"/>'}
      <circle cx="40" cy="40" r="1.5" fill="rgba(255,255,255,0.7)"/>
      ${timerAccessories}
    </svg>`;

    // Use sport/habit-specific animation
    const ghostAnim = typeof getGhostAnimClass === 'function' ? getGhostAnimClass(totalScore, {}) : 'ghostFloat 4s ease-in-out infinite';
    walker.style.animation = ghostAnim;
  }
}

const DEATHY_TIMER_PHRASES = {
  healthy: [
    "Keep it up, I'm practically glowing!",
    "At this rate I'll outlive the sun.",
    "My ghost glow-up is real.",
    "Other ghosts are jealous of me.",
    "You're making death look good.",
    "I'm the healthiest ghost in town.",
    "Even the Reaper's impressed."
  ],
  ok: [
    "Not bad... but not great either.",
    "I've seen worse. I've seen better.",
    "Room for improvement, human.",
    "Meh. Could be glowier.",
    "You're a solid C+. Aim higher.",
    "I'm fading just a little bit.",
    "One more salad wouldn't kill you."
  ],
  bad: [
    "I can see my own bones. Help.",
    "This is fine. Everything's fine.",
    "My ghost insurance just went up.",
    "The Reaper keeps texting me.",
    "I'm decomposing in real-time.",
    "Please. Literally anything healthy."
  ]
};

let deathyPhraseIdx = 0;
let deathyPhraseTimer = 0;

function rotateDeathyPhrase() {
  const bubble = document.getElementById('deathySpeechBubble');
  if (!bubble || !state.result) return;
  const params = getDeathyParams();
  const hScore = calcDeathyHealth(params);
  const g = state.longevityGoal;
  const totalScore = Math.min(100, hScore + Math.min(20, ((g && g.totalDaysAdded)||0)*0.5));
  const bucket = totalScore >= 70 ? 'healthy' : totalScore >= 40 ? 'ok' : 'bad';
  const phrases = DEATHY_TIMER_PHRASES[bucket];
  deathyPhraseIdx = (deathyPhraseIdx + 1) % phrases.length;
  bubble.style.opacity = '0';
  setTimeout(() => {
    bubble.textContent = phrases[deathyPhraseIdx];
    bubble.style.opacity = '0.8';
    bubble.style.transition = 'opacity 0.5s';
  }, 300);
}

setInterval(updateNavTimer, 1000);
setInterval(rotateDeathyPhrase, 8000);
// Run once immediately if result exists
if (state.result) {
  setTimeout(updateNavTimer, 100);
  setTimeout(rotateDeathyPhrase, 500);
}


// ============================================


function showToast(msg) {
  const sr = document.getElementById('srAnnounce'); if (sr) sr.textContent = msg;
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:var(--surface);border:1px solid var(--green);color:var(--green);padding:12px 24px;border-radius:8px;z-index:99999;font-size:0.9rem;animation:deathyFadeIn 0.3s ease;';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}


// ============================================
// TIER + PAYWALL
// ============================================

function loadUserTier() {
  try {
    const tier = localStorage.getItem('deathclock_tier');
    if (tier) state.userTier = tier;
  } catch(e) {}
}

function showPaywall(feature) {
  document.getElementById('modal').classList.remove('hidden');
  let featureText = 'This feature';
  if (feature === 'save') featureText = 'Saving your profile';
  else if (feature === 'unlimited_habits') featureText = 'Unlimited habit tracking';

  document.getElementById('modalContent').innerHTML = `
    <h3 style="color:var(--gold); margin-bottom:12px;">Upgrade to Premium</h3>
    <p style="color:var(--text2); margin-bottom:20px;">${featureText} requires a Premium subscription. Save your profile, track unlimited habits, and get clinical test recommendations.</p>
    <div style="background:var(--bg2); padding:20px; border-radius:var(--radius); margin-bottom:20px; border:1px solid var(--gold);">
      <div style="font-size:1.5rem; font-weight:800; color:var(--gold);">$4.99<span style="font-size:0.85rem; color:var(--text3);">/month</span></div>
      <ul style="text-align:left; margin-top:12px; color:var(--text2); font-size:0.9rem; list-style:none; padding:0;">
        <li style="margin-bottom:6px;">&#10003; Save & reload your profile across devices</li>
        <li style="margin-bottom:6px;">&#10003; Unlimited habit tracking</li>
        <li style="margin-bottom:6px;">&#10003; Unlimited bucket list items</li>
        <li style="margin-bottom:6px;">&#10003; Clinical test recommendations</li>
        <li style="margin-bottom:6px;">&#10003; Export your full longevity report</li>
        <li style="margin-bottom:6px;">&#10003; Ghost evolution & personalised Deathy</li>
      </ul>
    </div>
    <div class="form-actions" style="flex-direction:column; gap:8px;">
      <button class="btn-gold" onclick="startStripeCheckout('premium')" style="width:100%; padding:14px; font-size:1rem;">Pay $4.99/mo with Stripe</button>
      <button class="btn-secondary" onclick="closeModal()" style="width:100%;">Maybe Later</button>
    </div>
    <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-top:16px;">
      <img src="https://cdn.brandfetch.io/idxAg10C0L/theme/dark/symbol.svg" alt="Stripe" style="height:20px; opacity:0.6;">
      <span style="font-size:0.7rem; color:var(--text3);">Secured by Stripe. Cancel anytime.</span>
    </div>
  `;
}

function startStripeCheckout(tier) {
  // Stripe Payment Links - replace with your actual Stripe payment link IDs
  const links = {
    premium: 'https://buy.stripe.com/aFa14m1Fd02Q1eLfSqgMw01',
    pro_plus: 'https://buy.stripe.com/test_PLACEHOLDER_PRO',
    deep_dive: 'https://buy.stripe.com/test_PLACEHOLDER_DEEP',
    lifetime: 'https://buy.stripe.com/dRm7sKerZ6re0aH49IgMw03',
    death_pool: 'https://buy.stripe.com/test_PLACEHOLDER_POOL'
  };
  const url = links[tier];
  if (url && !url.includes('PLACEHOLDER')) {
    // Add client reference for webhook matching
    const email = localStorage.getItem('dc_user_email') || '';
    const sep = url.includes('?') ? '&' : '?';
    window.location.href = url + sep + 'prefilled_email=' + encodeURIComponent(email) + '&client_reference_id=' + (localStorage.getItem('dc_invite_code') || 'none');
  } else {
    // Fallback: demo mode until Stripe links are configured
    upgradeTier(tier);
  }
}


// Handle Stripe payment return

(function checkPaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('payment') === 'success') {
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
    // Upgrade user
    if (!state.userTier || state.userTier === 'free') {
      state.userTier = 'premium';
      try { localStorage.setItem('deathclock_tier', 'premium'); } catch(e) {}
    }
    // Show success toast
    setTimeout(() => {
      const toast = document.createElement('div');
      toast.className = 'motivation-toast great';
      toast.innerHTML = '<strong>Payment successful!</strong> Welcome to Premium. All features unlocked.';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 5000);
    }, 500);
  }
})();


// ============================================
// NAVIGATION (multi-page)
// ============================================
function showPage(page) {
  const pageMap = {
    home: '/',
    quiz: '/',
    dashboard: '/dashboard.html',
    profile: '/profile.html',
    groups: '/groups.html',
    mansion: '/mansion.html',
    pricing: '/pricing.html',
    about: '/about.html',
    privacy: '/privacy.html',
    terms: '/terms.html',
    cookies: '/cookies.html'
  };
  const target = pageMap[page];
  if (target && !window.location.pathname.endsWith(target) && target !== window.location.pathname) {
    window.location.href = target + (page === 'quiz' ? '#quiz' : '');
    return;
  }
  // Same page navigation (for quiz sections on index)
  if (typeof localShowPage === 'function') localShowPage(page);
}

// Shared init
document.addEventListener('DOMContentLoaded', function() {
  loadUserTier();
  checkCookieConsent();
  if (typeof pageInit === 'function') pageInit();
});

function upgradeTier(tier) {
  state.userTier = tier;
  try { localStorage.setItem('deathclock_tier', tier); } catch(e) {}
  closeModal();
  // Show confirmation
  const existing = document.querySelector('.motivation-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'motivation-toast great';
  toast.textContent = 'Welcome to Premium! Death just got a lot further away.';
  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
  // Re-render current page
  if (state.currentPage === 'dashboard') renderDashboard();
}


// ============================================
// PROFILE PERSISTENCE
// ============================================
function saveGoalState() {
  try { localStorage.setItem('deathclock_goals', JSON.stringify(state.longevityGoal)); } catch(e) {}
}

function loadGoalState() {
  try {
    const saved = localStorage.getItem('deathclock_goals');
    if (saved) state.longevityGoal = JSON.parse(saved);
  } catch(e) {}
}

function saveProfile() {
  if (!state.result) { showToast('Complete the calculator first.'); return; }
  if (state.userTier === 'free') {
    showPaywall('save');
    return;
  }
  DataStore.save().then(mode => {
    if (mode === 'cloud') {
      showToast('Profile synced to the cloud! Your ghost follows you everywhere now.');
    } else {
      showToast('Profile saved locally. Sign in to sync across devices.');
    }
  }).catch(() => showToast('Save failed. Try again.'));
}

function loadProfile() {
  // Sync load from localStorage for initial render (async cloud load happens via DataStore)
  try {
    const saved = localStorage.getItem('deathclock_profile');
    if (!saved) return false;
    const profile = JSON.parse(saved);
    state.answers = profile.answers || {};
    state.bucketList = profile.bucketList || profile.bucket_list || [];
    state.longevityGoal = profile.longevityGoal || profile.longevity_goal || null;
    state.userTier = profile.tier || state.userTier;
    if (profile.result) {
      state.result = {
        ...profile.result,
        deathDate: new Date(profile.result.deathDate),
        dob: new Date(profile.result.dob)
      };
      if (state.result.factors) state.result.factors.sort((a, b) => a.impact - b.impact);
      document.getElementById('navDash')?.classList.remove('hidden');
      document.getElementById('navPrice')?.classList.remove('hidden');
      const cta = document.getElementById('navCta');
      if (cta) cta.textContent = 'Recalculate';
    }
    return true;
  } catch(e) { return false; }
}

