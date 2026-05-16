// ============================================
// QUICK WINS: NPC Ghosts, Leaderboard, Notifications, Limited Items
// ============================================

// ===== 1. NPC GHOSTS (solo mode filler) =====
const NPC_GHOSTS = [
  { id: 'npc_reaper', name: 'Grim Jr.', emoji: '💀', personality: 'edgy', lines: ['Tick tock...', 'Your time draws near.', 'I brought cookies.', 'Death is just a vibe.'], xpDrop: [1, 3] },
  { id: 'npc_casper', name: 'Friendly Phil', emoji: '🫠', personality: 'friendly', lines: ['Hey friend!', 'Nice mansion!', 'Wanna haunt together?', 'I love being dead!'], xpDrop: [1, 2] },
  { id: 'npc_witch', name: 'Hex Martha', emoji: '🧙‍♀️', personality: 'sassy', lines: ['Stirring my cauldron...', 'Your aura is... beige.', 'I hexed the WiFi.', 'Broom parking only.'], xpDrop: [2, 4] },
  { id: 'npc_pirate', name: 'Captain Bones', emoji: '🏴‍☠️', personality: 'loud', lines: ['ARRR!', 'Where be the treasure?', 'Shiver me ectoplasm!', 'Dead men tell tales actually.'], xpDrop: [1, 5] },
  { id: 'npc_cat', name: 'Ghost Cat', emoji: '🐱', personality: 'aloof', lines: ['...', '*knocks vase off table*', '*stares judgmentally*', 'Meow.', '*phases through wall*'], xpDrop: [1, 2] }
];

const NPC_AUTO_ACTIONS = [
  '{npc} floated through the ceiling and dropped {n} coins on the floor.',
  '{npc} challenged a moth to a duel and lost. Embarrassing.',
  '{npc} rearranged the furniture again. Classic poltergeist behaviour.',
  '{npc} wrote "{line}" on the wall in ectoplasm.',
  '{npc} scared a spider. The spider was unimpressed.',
  '{npc} tried to eat a biscuit. It went right through them.',
  '{npc} played the mansion organ at 3am. Nobody was amused.'
];

function getNpcGhostsForMansion() {
  // Show NPCs when group has fewer than 4 real members
  const realCount = state.currentGroup?.members?.length || 0;
  const npcsNeeded = Math.max(0, Math.min(5, 4 - realCount));
  // Always show at least 2 NPCs for atmosphere
  const showCount = Math.max(2, npcsNeeded);
  return NPC_GHOSTS.slice(0, showCount);
}

function renderNpcGhosts() {
  const container = document.getElementById('mansionGhosts');
  if (!container) return;
  const npcs = getNpcGhostsForMansion();
  npcs.forEach((npc, i) => {
    // Check if NPC already rendered
    if (document.getElementById(npc.id)) return;
    const ghost = document.createElement('div');
    ghost.id = npc.id;
    ghost.className = 'mansion-ghost npc-ghost';
    ghost.style.cssText = 'position:absolute; cursor:pointer; transition:all 0.3s; opacity:0.6;';
    // Distribute across mansion width
    const x = 15 + (i * 18) + Math.random() * 8;
    const y = 30 + Math.random() * 30;
    ghost.style.left = x + '%';
    ghost.style.top = y + '%';
    ghost.innerHTML = '<div style="font-size:1.8rem; filter:grayscale(0.3);" title="' + npc.name + ' (NPC)">' + npc.emoji + '</div>'
      + '<div style="font-size:0.6rem; color:var(--text3); text-align:center; margin-top:2px;">' + npc.name + '</div>';
    ghost.onclick = () => showNpcMenu(npc);
    container.appendChild(ghost);
  });
  // Start NPC idle animations
  startNpcIdleLoop();
}

let npcIdleInterval = null;
function startNpcIdleLoop() {
  if (npcIdleInterval) return;
  npcIdleInterval = setInterval(() => {
    const npcs = getNpcGhostsForMansion();
    const npc = npcs[Math.floor(Math.random() * npcs.length)];
    const el = document.getElementById(npc.id);
    if (!el) return;
    // Wiggle animation
    el.style.transform = 'translateY(' + (Math.random() * 6 - 3) + 'px) rotate(' + (Math.random() * 4 - 2) + 'deg)';
    setTimeout(() => { if (el) el.style.transform = ''; }, 1500);
    // Occasionally speak
    if (Math.random() < 0.3) {
      const bubble = document.getElementById('npcBubble_' + npc.id);
      if (bubble) bubble.remove();
      const line = npc.lines[Math.floor(Math.random() * npc.lines.length)];
      const b = document.createElement('div');
      b.id = 'npcBubble_' + npc.id;
      b.style.cssText = 'position:absolute; top:-24px; left:50%; transform:translateX(-50%); background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:3px 8px; font-size:0.65rem; color:var(--text2); white-space:nowrap; z-index:5; animation:fadeIn 0.3s;';
      b.textContent = line;
      el.style.position = 'relative';
      el.appendChild(b);
      setTimeout(() => { if (b.parentElement) b.remove(); }, 3000);
    }
  }, 5000);
}

function showNpcMenu(npc) {
  const existing = document.getElementById('npcActionMenu');
  if (existing) existing.remove();
  const menu = document.createElement('div');
  menu.id = 'npcActionMenu';
  menu.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:var(--bg2); border:1px solid var(--border); border-radius:12px; padding:20px; z-index:1001; min-width:260px; box-shadow:0 10px 40px rgba(0,0,0,0.5);';
  menu.innerHTML = '<div style="text-align:center; margin-bottom:12px;">'
    + '<div style="font-size:2.5rem;">' + npc.emoji + '</div>'
    + '<div style="font-weight:700; margin-top:4px;">' + npc.name + '</div>'
    + '<div style="font-size:0.75rem; color:var(--text3);">NPC Ghost - ' + npc.personality + '</div>'
    + '</div>'
    + '<div style="display:grid; gap:6px;">'
    + '<button class="btn-primary btn-sm" onclick="interactWithNpc(\'' + npc.id + '\',\'chat\')">💬 Chat</button>'
    + '<button class="btn-secondary btn-sm" onclick="interactWithNpc(\'' + npc.id + '\',\'haunt\')">👻 Haunt (+' + npc.xpDrop[0] + '-' + npc.xpDrop[1] + ' XP)</button>'
    + '<button class="btn-secondary btn-sm" onclick="interactWithNpc(\'' + npc.id + '\',\'dare\')">⚔️ Dare (costs 1 coin)</button>'
    + '</div>'
    + '<button class="btn-secondary btn-sm" onclick="this.parentElement.remove()" style="width:100%; margin-top:10px;">Close</button>';
  document.body.appendChild(menu);
}

async function interactWithNpc(npcId, action) {
  const npc = NPC_GHOSTS.find(n => n.id === npcId);
  if (!npc) return;
  const menu = document.getElementById('npcActionMenu');
  if (menu) menu.remove();

  if (action === 'chat') {
    const line = npc.lines[Math.floor(Math.random() * npc.lines.length)];
    showToast(npc.emoji + ' ' + npc.name + ': "' + line + '"');
    if (typeof addXP === 'function') await addXP(1, 'npc_chat');
    queueNotification({ type: 'npc_chat', from: npc.name, emoji: npc.emoji, msg: npc.name + ' says: "' + line + '"' });
  } else if (action === 'haunt') {
    const xp = npc.xpDrop[0] + Math.floor(Math.random() * (npc.xpDrop[1] - npc.xpDrop[0] + 1));
    showToast('👻 You haunted ' + npc.name + '! +' + xp + ' XP');
    if (typeof addXP === 'function') await addXP(xp, 'npc_haunt');
    addNpcActivity(npc.name + ' got haunted and ' + (Math.random() > 0.5 ? 'screamed' : 'laughed'));
  } else if (action === 'dare') {
    if (typeof getMyCoins === 'function') {
      const coins = await getMyCoins();
      if (coins < 1) { showToast('Need 1 coin!'); return; }
    }
    if (typeof addCoins === 'function') await addCoins(-1, 'npc_dare_bet');
    // 60% win rate vs NPCs
    const win = Math.random() < 0.6;
    if (win) {
      const prize = 2 + Math.floor(Math.random() * 3);
      if (typeof addCoins === 'function') await addCoins(prize, 'npc_dare_win');
      showToast('⚔️ You beat ' + npc.name + '! Won ' + prize + ' coins!');
      if (typeof addXP === 'function') await addXP(5, 'npc_dare_win');
    } else {
      showToast('💀 ' + npc.name + ' won the dare! You lost 1 coin.');
    }
    if (typeof updateCoinDisplay === 'function') updateCoinDisplay();
  }
}

function addNpcActivity(msg) {
  const feed = document.getElementById('activityFeed');
  if (!feed) return;
  const div = document.createElement('div');
  div.style.cssText = 'padding:8px; border-bottom:1px solid var(--border); font-size:0.8rem; color:var(--text2); opacity:0; transition:opacity 0.3s;';
  div.textContent = '🤖 ' + msg;
  feed.prepend(div);
  setTimeout(() => div.style.opacity = '1', 50);
}

// NPC auto-activity in the feed
function npcAutoActivity() {
  const npcs = getNpcGhostsForMansion();
  if (!npcs.length) return;
  const npc = npcs[Math.floor(Math.random() * npcs.length)];
  const template = NPC_AUTO_ACTIONS[Math.floor(Math.random() * NPC_AUTO_ACTIONS.length)];
  const line = npc.lines[Math.floor(Math.random() * npc.lines.length)];
  const msg = template.replace('{npc}', npc.name).replace('{n}', Math.floor(Math.random() * 3) + 1).replace('{line}', line);
  addNpcActivity(msg);
}

// ===== 2. WEEKLY XP LEADERBOARD =====

function getWeekKey() {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return now.getFullYear() + '_W' + week;
}

async function loadLeaderboard() {
  const container = document.getElementById('leaderboardContent');
  if (!container) return;
  const weekKey = getWeekKey();
  // Load from localStorage weekly XP tracking
  const weeklyXpKey = 'dc_weekly_xp_' + weekKey;

  // Try loading group leaderboard from Supabase
  try {
    const groupId = state.currentGroup?.id;
    if (!groupId) {
      container.innerHTML = '<p style="color:var(--text3); font-size:0.8rem;">Join a group to see the leaderboard</p>';
      return;
    }
    const { data: members } = await socialClient.from('dc_ghost_coins')
      .select('user_id, weekly_xp, display_name')
      .eq('group_id', groupId)
      .order('weekly_xp', { ascending: false })
      .limit(10);

    // Fallback: use total_xp if weekly_xp column missing
    let leaderboard = members || [];
    if (!leaderboard.length) {
      // Try total_xp as fallback
      const { data: fallback } = await socialClient.from('dc_group_members')
        .select('user_id, display_name')
        .eq('group_id', groupId)
        .limit(10);
      leaderboard = (fallback || []).map(m => ({ ...m, weekly_xp: 0 }));
    }

    // Include NPC ghosts in leaderboard for fun
    const npcs = getNpcGhostsForMansion();
    npcs.forEach(npc => {
      leaderboard.push({ user_id: npc.id, display_name: npc.name, weekly_xp: Math.floor(Math.random() * 40) + 5, isNpc: true });
    });

    // Sort combined
    leaderboard.sort((a, b) => (b.weekly_xp || 0) - (a.weekly_xp || 0));

    const medals = ['🥇', '🥈', '🥉'];
    let html = '<div style="font-size:0.7rem; color:var(--text3); margin-bottom:8px;">Week ' + weekKey.split('_')[1] + ' - Resets Monday</div>';
    leaderboard.slice(0, 8).forEach((entry, i) => {
      const medal = i < 3 ? medals[i] : (i + 1) + '.';
      const isMe = entry.user_id === state.supaUser?.id;
      const npcTag = entry.isNpc ? ' <span style="font-size:0.6rem; color:var(--text3);">(NPC)</span>' : '';
      html += '<div style="display:flex; justify-content:space-between; align-items:center; padding:4px 8px; border-radius:6px; margin:2px 0;'
        + (isMe ? ' background:rgba(233,69,96,0.1); border:1px solid var(--accent);' : '') + '">'
        + '<span style="font-size:0.8rem;">' + medal + ' ' + escHtml(entry.display_name || 'Ghost') + npcTag + '</span>'
        + '<span style="font-size:0.75rem; font-weight:700; color:var(--gold);">' + (entry.weekly_xp || 0) + ' XP</span>'
        + '</div>';
    });
    // Prize reminder
    html += '<div style="margin-top:8px; padding:6px 8px; background:rgba(240,192,64,0.1); border-radius:6px; font-size:0.7rem; color:var(--gold);">'
      + '🏆 Weekly prizes: 🥇 20 coins | 🥈 10 coins | 🥉 5 coins</div>';
    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = '<p style="color:var(--text3); font-size:0.8rem;">Leaderboard unavailable</p>';
  }
}

// Weekly XP reset check + prize distribution
async function checkWeeklyReset() {
  const weekKey = getWeekKey();
  const lastWeek = localStorage.getItem('dc_last_week_key');
  if (lastWeek && lastWeek !== weekKey) {
    // New week! Check if we won prizes last week
    const lastRank = parseInt(localStorage.getItem('dc_last_week_rank') || '99');
    if (lastRank === 0) {
      if (typeof addCoins === 'function') await addCoins(20, 'leaderboard_1st');
      queueNotification({ type: 'prize', emoji: '🥇', msg: 'You won 1st place last week! +20 coins' });
    } else if (lastRank === 1) {
      if (typeof addCoins === 'function') await addCoins(10, 'leaderboard_2nd');
      queueNotification({ type: 'prize', emoji: '🥈', msg: 'You got 2nd place last week! +10 coins' });
    } else if (lastRank === 2) {
      if (typeof addCoins === 'function') await addCoins(5, 'leaderboard_3rd');
      queueNotification({ type: 'prize', emoji: '🥉', msg: 'You got 3rd place last week! +5 coins' });
    }
  }
  localStorage.setItem('dc_last_week_key', weekKey);
}

// Track weekly XP locally (addXP hooks into this)
function trackWeeklyXP(amount) {
  const weekKey = 'dc_weekly_xp_' + getWeekKey();
  const current = parseInt(localStorage.getItem(weekKey) || '0');
  localStorage.setItem(weekKey, (current + amount).toString());
}

// ===== 3. NOTIFICATION TOASTS (next-visit queue) =====

function getNotificationQueue() {
  try { return JSON.parse(localStorage.getItem('dc_notification_queue') || '[]'); }
  catch { return []; }
}

function queueNotification(notification) {
  const queue = getNotificationQueue();
  queue.push({ ...notification, ts: Date.now() });
  // Keep max 20 queued
  if (queue.length > 20) queue.shift();
  localStorage.setItem('dc_notification_queue', JSON.stringify(queue));
}

function showQueuedNotifications() {
  const queue = getNotificationQueue();
  if (!queue.length) return;
  // Clear queue
  localStorage.setItem('dc_notification_queue', '[]');
  // Show notifications one by one with delay
  let delay = 500;
  queue.slice(0, 5).forEach((notif, i) => {
    setTimeout(() => showNotificationToast(notif), delay + (i * 1500));
  });
  // If more than 5, show summary
  if (queue.length > 5) {
    setTimeout(() => showToast('...and ' + (queue.length - 5) + ' more things happened while you were gone!'), delay + 7500);
  }
}

function showNotificationToast(notif) {
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed; top:80px; right:16px; background:var(--bg2); border:1px solid var(--gold); border-radius:12px; padding:12px 16px; z-index:1050; max-width:300px; animation:slideIn 0.3s; box-shadow:0 4px 20px rgba(0,0,0,0.3); display:flex; align-items:center; gap:10px;';
  const emoji = notif.emoji || '👻';
  const msg = notif.msg || 'Something happened in the mansion!';
  toast.innerHTML = '<span style="font-size:1.5rem;">' + emoji + '</span>'
    + '<div style="flex:1;">'
    + '<div style="font-size:0.8rem; font-weight:600; color:var(--text);">' + (notif.type === 'haunt' ? 'You were haunted!' : notif.type === 'prize' ? 'Prize!' : 'Mansion News') + '</div>'
    + '<div style="font-size:0.75rem; color:var(--text2); margin-top:2px;">' + msg + '</div>'
    + '</div>'
    + '<span onclick="this.parentElement.remove()" style="cursor:pointer; color:var(--text3); font-size:0.8rem;">✕</span>';
  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentElement) toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 5000);
}

// When someone haunts the current user, queue it for them
function queueHauntNotification(senderName, action) {
  queueNotification({
    type: 'haunt',
    emoji: action === 'possess' ? '😈' : action === 'curse' ? '💀' : '👻',
    msg: senderName + ' ' + action + 'ed you while you were away!',
    from: senderName
  });
}

// ===== 4. LIMITED-TIME SHOP ITEMS =====

const LIMITED_ITEMS = [
  // Rotating weekly items
  { id: 'lt_golden_skull', name: 'Golden Skull', emoji: '💀✨', price: 45, category: 'hats', desc: 'RARE - This week only!', rotationType: 'weekly' },
  { id: 'lt_fire_scythe', name: 'Fire Scythe', emoji: '🔥⚔️', price: 60, category: 'weapons', desc: 'LEGENDARY +7 ATK', stat: { attack: 7 }, rotationType: 'weekly' },
  { id: 'lt_rainbow_trail', name: 'Rainbow Trail', emoji: '🌈', price: 35, category: 'decor', desc: 'Leave a rainbow when you float', rotationType: 'weekly' },
  { id: 'lt_triple_xp', name: 'Triple XP (8h)', emoji: '⚡⚡⚡', price: 40, category: 'abilities', desc: '3x XP for 8 hours!', duration: 28800000, rotationType: 'weekly' },
  // Seasonal items (month-specific)
  { id: 'lt_valentines', name: 'Love Potion', emoji: '💕', price: 30, category: 'abilities', desc: 'Double coins from friends', duration: 86400000, month: 1 },
  { id: 'lt_shamrock', name: 'Lucky Shamrock', emoji: '☘️', price: 25, category: 'hats', desc: '4x spin luck', month: 2 },
  { id: 'lt_bunny', name: 'Ghost Bunny', emoji: '🐰👻', price: 20, category: 'decor', desc: 'Hops around your spot', month: 3 },
  { id: 'lt_firework', name: 'Firework Pack', emoji: '🎆', price: 30, category: 'decor', desc: 'Explodes on click', month: 6 },
  { id: 'lt_pumpkin_king', name: 'Pumpkin King Crown', emoji: '🎃👑', price: 50, category: 'hats', desc: 'LEGENDARY Halloween exclusive', month: 9 },
  { id: 'lt_snow_globe', name: 'Snow Globe', emoji: '🌨️', price: 35, category: 'decor', desc: 'Covers your area in snow', month: 11 },
  { id: 'lt_candy_cane', name: 'Candy Cane Scythe', emoji: '🍬⚔️', price: 55, category: 'weapons', desc: '+6 ATK, festive!', stat: { attack: 6 }, month: 11 }
];

function getActiveLimitedItems() {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed
  const dayOfWeek = now.getDay();
  const weekOfYear = Math.ceil(((now - new Date(now.getFullYear(), 0, 1)) / 86400000) / 7);

  const active = [];

  LIMITED_ITEMS.forEach(item => {
    if (item.rotationType === 'weekly') {
      // Rotate 2 weekly items based on week number
      const slot = weekOfYear % 4; // 4 weekly items, show 2 per week
      const idx = LIMITED_ITEMS.filter(i => i.rotationType === 'weekly').indexOf(item);
      if (idx === slot || idx === (slot + 1) % 4) {
        active.push({ ...item, expiresLabel: getTimeUntilMonday() });
      }
    } else if (item.month !== undefined && item.month === currentMonth) {
      active.push({ ...item, expiresLabel: getDaysLeftInMonth() + ' days left' });
    }
  });
  return active;
}

function getTimeUntilMonday() {
  const now = new Date();
  const day = now.getDay();
  const daysUntilMon = day === 0 ? 1 : 8 - day;
  if (daysUntilMon <= 1) return 'Expires today!';
  return daysUntilMon + ' days left';
}

function getDaysLeftInMonth() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate();
}

function renderLimitedShop() {
  const container = document.getElementById('limitedShopContent');
  if (!container) return;
  const items = getActiveLimitedItems();
  if (!items.length) {
    container.innerHTML = '<p style="color:var(--text3); font-size:0.8rem; font-style:italic;">No limited items right now. Check back soon!</p>';
    return;
  }
  let html = '';
  items.forEach(item => {
    html += '<div style="display:flex; align-items:center; gap:8px; padding:8px; background:linear-gradient(135deg, rgba(240,192,64,0.05), rgba(233,69,96,0.05)); border:1px solid var(--gold); border-radius:8px; margin-bottom:6px;">'
      + '<span style="font-size:1.3rem;">' + item.emoji + '</span>'
      + '<div style="flex:1; min-width:0;">'
      + '<div style="font-size:0.8rem; font-weight:700;">' + item.name + '</div>'
      + '<div style="font-size:0.65rem; color:var(--text3);">' + item.desc + '</div>'
      + '<div style="font-size:0.6rem; color:var(--accent); font-weight:600;">⏰ ' + item.expiresLabel + '</div>'
      + '</div>'
      + '<button class="btn-primary btn-sm" style="white-space:nowrap; font-size:0.7rem;" onclick="buyLimitedItem(\'' + item.id + '\')">' + item.price + ' 🪙</button>'
      + '</div>';
  });
  container.innerHTML = html;
}

async function buyLimitedItem(itemId) {
  const item = LIMITED_ITEMS.find(i => i.id === itemId);
  if (!item) return;
  // Use existing buyShopItem logic adapted for limited items
  const user = await getSocialSession();
  if (!user) { showToast('Sign in first!'); return; }
  if (typeof getMyCoins === 'function') {
    const coins = await getMyCoins();
    if (coins < item.price) { showToast('Not enough coins! Need ' + item.price); return; }
  }
  // Deduct coins
  if (typeof addCoins === 'function') await addCoins(-item.price, 'limited_shop_' + item.id);
  // Add to inventory
  const inv = await getMyInventory();
  const cat = item.category || 'decor';
  if (!inv[cat]) inv[cat] = [];
  if (inv[cat].includes(item.id)) { showToast('Already own this!'); return; }
  inv[cat].push(item.id);
  // Save inventory
  await socialClient.from('dc_ghost_coins')
    .update({ inventory: { hats: inv.hats, weapons: inv.weapons, decor: inv.decor, abilities: inv.abilities } })
    .eq('user_id', user.id);
  showToast('🎉 Got ' + item.emoji + ' ' + item.name + '!');
  if (typeof updateCoinDisplay === 'function') updateCoinDisplay();
  renderLimitedShop();
}

// ===== INIT ALL QUICK WINS =====

async function initQuickWins() {
  // 1. Render NPC ghosts
  renderNpcGhosts();
  // Start NPC auto-activity every 20s
  setInterval(npcAutoActivity, 20000);

  // 2. Load leaderboard
  await checkWeeklyReset();
  loadLeaderboard();

  // 3. Show queued notifications
  showQueuedNotifications();

  // 4. Render limited-time shop
  renderLimitedShop();
}

// Hook into XP additions to track weekly
const _origAddXP = typeof addXP === 'function' ? addXP : null;
if (_origAddXP) {
  window._baseAddXP = _origAddXP;
}
// We'll patch after load via initQuickWins
