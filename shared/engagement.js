// ============================================
// ENGAGEMENT: Random Events, Shop, Rewards, Birthdays
// ============================================

// ===== EQUIPMENT SHOP =====
const GHOST_SHOP = {
  hats: [
    { id: 'tophat', name: 'Top Hat', emoji: '🎩', price: 8, desc: 'Distinguished haunting' },
    { id: 'crown', name: 'Crown', emoji: '👑', price: 25, desc: 'King of the dead' },
    { id: 'horns', name: 'Devil Horns', emoji: '😈', price: 12, desc: 'Extra spooky' },
    { id: 'halo', name: 'Halo', emoji: '😇', price: 15, desc: 'Ironic for a ghost' },
    { id: 'witch', name: 'Witch Hat', emoji: '🧙', price: 10, desc: 'Classic undead fashion' },
    { id: 'santa', name: 'Santa Hat', emoji: '🎅', price: 20, desc: 'Seasonal haunting' },
    { id: 'pirate', name: 'Pirate Hat', emoji: '🏴‍☠️', price: 14, desc: 'Arrr from beyond' }
  ],
  weapons: [
    { id: 'scythe', name: 'Mini Scythe', emoji: '⚔️', price: 20, desc: '+3 ATK in battles', stat: { attack: 3 } },
    { id: 'wand', name: 'Ghost Wand', emoji: '🪄', price: 15, desc: '+2 ATK, +1 SPD', stat: { attack: 2, speed: 1 } },
    { id: 'chain', name: 'Rattling Chain', emoji: '⛓️', price: 12, desc: '+2 DEF in battles', stat: { defense: 2 } },
    { id: 'lantern', name: 'Soul Lantern', emoji: '🏮', price: 18, desc: '+5 HP', stat: { hp: 5 } },
    { id: 'orb', name: 'Ecto Orb', emoji: '🔮', price: 30, desc: '+3 ATK, +2 DEF', stat: { attack: 3, defense: 2 } },
    { id: 'trident', name: 'Spectral Trident', emoji: '🔱', price: 40, desc: '+5 ATK, +2 SPD', stat: { attack: 5, speed: 2 } }
  ],
  decor: [
    { id: 'candles', name: 'Haunted Candles', emoji: '🕯️', price: 5, desc: 'Spooky ambience' },
    { id: 'cobwebs', name: 'Cobweb Set', emoji: '🕸️', price: 4, desc: 'Classic decor' },
    { id: 'pumpkins', name: 'Pumpkin Patch', emoji: '🎃', price: 7, desc: 'Forever Halloween' },
    { id: 'bats', name: 'Bat Colony', emoji: '🦇', price: 10, desc: 'They swoop around' },
    { id: 'cauldron', name: 'Bubbling Cauldron', emoji: '🧪', price: 15, desc: 'Green mist effect' },
    { id: 'throne', name: 'Bone Throne', emoji: '💀', price: 35, desc: 'Sit in dead luxury' },
    { id: 'portal', name: 'Nether Portal', emoji: '🌀', price: 50, desc: 'Swirling void' },
    { id: 'disco', name: 'Ghost Disco Ball', emoji: '🪩', price: 22, desc: 'Party in the afterlife' }
  ],
  abilities: [
    { id: 'double_xp', name: 'Double XP (24h)', emoji: '⚡', price: 20, desc: '2x XP for 24 hours', duration: 86400000 },
    { id: 'shield', name: 'Ghost Shield (12h)', emoji: '🛡️', price: 10, desc: 'Block haunts for 12h', duration: 43200000 },
    { id: 'lucky', name: 'Lucky Charm (24h)', emoji: '🍀', price: 15, desc: '2x daily spin rewards', duration: 86400000 },
    { id: 'mega_boo', name: 'Mega Boo (1 use)', emoji: '💥', price: 8, desc: 'Super haunt: 50 XP', uses: 1 },
    { id: 'gift_wrap', name: 'Gift Wrap (3 uses)', emoji: '🎁', price: 6, desc: 'Gift coins to friends', uses: 3 },
    { id: 'revive', name: 'Quick Revive', emoji: '💚', price: 12, desc: 'Full HP in next battle', uses: 1 }
  ]
};

// ===== RANDOM EVENTS =====
const RANDOM_EVENTS = [
  { id: 'treasure', emoji: '💰', title: 'Treasure Found!', msg: 'You found {n} coins behind a loose brick!', coins: [2, 5], chance: 0.15 },
  { id: 'ghost_cat', emoji: '🐱', title: 'Ghost Cat!', msg: 'A spectral cat rubbed against your legs. +{n} XP', xp: [3, 8], chance: 0.12 },
  { id: 'earthquake', emoji: '💀', title: 'Mansion Shakes!', msg: 'The whole mansion trembled. Everyone got 1 free coin.', coins: [1, 1], chance: 0.08 },
  { id: 'mirror', emoji: '🪞', title: 'Haunted Mirror', msg: 'You gazed into a mirror and saw your living self. Creepy. +{n} XP', xp: [5, 10], chance: 0.10 },
  { id: 'visitor', emoji: '👤', title: 'Living Visitor!', msg: 'A mortal wandered in and screamed. Free entertainment. +{n} coins', coins: [1, 3], chance: 0.10 },
  { id: 'party', emoji: '🎉', title: 'Ghost Party!', msg: 'All ghosts in the mansion are partying! +{n} XP to everyone.', xp: [5, 15], chance: 0.05 },
  { id: 'thief', emoji: '🦝', title: 'Spectral Raccoon', msg: 'A ghost raccoon stole 1 coin but dropped {n} XP!', xp: [8, 12], coinLoss: 1, chance: 0.07 },
  { id: 'fountain', emoji: '⛲', title: 'Wishing Fountain', msg: 'You tossed a coin in the fountain. It came back as {n}!', coins: [2, 6], coinLoss: 1, chance: 0.08 },
  { id: 'duel', emoji: '⚡', title: 'Lightning Strike!', msg: 'Lightning hit the mansion! Your ghost glows brighter. +{n} XP', xp: [10, 20], chance: 0.04 },
  { id: 'recipe', emoji: '📜', title: 'Ancient Recipe', msg: 'You found a longevity potion recipe on the wall. +{n} XP', xp: [5, 8], chance: 0.10 }
];

// ===== DAILY SPIN =====
const SPIN_REWARDS = [
  { label: '1 🪙', coins: 1, weight: 30 },
  { label: '2 🪙', coins: 2, weight: 25 },
  { label: '5 🪙', coins: 5, weight: 15 },
  { label: '10 🪙', coins: 10, weight: 5 },
  { label: '5 XP', xp: 5, weight: 20 },
  { label: '15 XP', xp: 15, weight: 10 },
  { label: '30 XP', xp: 30, weight: 3 },
  { label: '🎩 Random Hat', item: 'hat', weight: 2 }
];

// ===== STREAK REWARDS =====
const STREAK_BONUSES = [
  { days: 3, reward: '5 coins', coins: 5, msg: '🔥 3-day streak! +5 bonus coins' },
  { days: 7, reward: '15 coins', coins: 15, msg: '🔥🔥 7-day streak! +15 bonus coins' },
  { days: 14, reward: '30 coins + item', coins: 30, item: true, msg: '🔥🔥🔥 14-day streak! +30 coins + mystery item!' },
  { days: 30, reward: '100 coins + rare', coins: 100, rare: true, msg: '💀🔥 30-DAY STREAK! +100 coins + rare equipment!' }
];

// ===== BIRTHDAY =====
const BIRTHDAY_DECORATIONS = ['🎂', '🎈', '🎊', '🎉', '🥳', '🎁', '🍰', '✨', '🎆', '🎇'];

// ===== FRIEND INTERACTIONS =====
const FRIEND_ACTIONS = [
  { id: 'gift', emoji: '🎁', name: 'Gift Coins', cost: 0, desc: 'Send coins to a friend' },
  { id: 'poke', emoji: '👉', name: 'Poke', cost: 0, desc: 'Remind them to visit', xp: 2 },
  { id: 'highfive', emoji: '🙌', name: 'High Five', cost: 0, desc: 'Celebrate together', xp: 3 },
  { id: 'combo_haunt', emoji: '👻👻', name: 'Combo Haunt', cost: 2, desc: 'Haunt together for 2x XP', xp: 20 }
];

// ===== CORE FUNCTIONS =====

async function getMyInventory() {
  const user = await getSocialSession();
  if (!user) return { hats: [], weapons: [], decor: [], abilities: [], equipped: {} };
  const { data } = await socialClient.from('dc_ghost_coins')
    .select('inventory, equipped_items, visit_streak, last_visit, last_spin')
    .eq('user_id', user.id).single();
  return {
    hats: data?.inventory?.hats || [],
    weapons: data?.inventory?.weapons || [],
    decor: data?.inventory?.decor || [],
    abilities: data?.inventory?.abilities || [],
    equipped: data?.equipped_items || {},
    streak: data?.visit_streak || 0,
    lastVisit: data?.last_visit,
    lastSpin: data?.last_spin
  };
}

async function buyShopItem(category, itemId) {
  const items = GHOST_SHOP[category];
  if (!items) return;
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  const user = await getSocialSession();
  if (!user) { showToast('Sign in first!'); return; }

  const balance = await getMyCoins();
  if (balance < item.price) {
    showToast('🪙 Need ' + item.price + ' coins (have ' + balance + ')');
    return;
  }

  // Deduct coins
  const spent = await deductCoins(item.price);
  if (!spent) return;

  // Add to inventory
  const { data: current } = await socialClient.from('dc_ghost_coins')
    .select('inventory').eq('user_id', user.id).single();
  const inv = current?.inventory || { hats: [], weapons: [], decor: [], abilities: [] };

  if (category === 'abilities') {
    // Abilities stack with uses/expiry
    const existing = inv.abilities.find(a => a.id === itemId);
    if (existing && item.uses) {
      existing.uses = (existing.uses || 0) + item.uses;
    } else {
      inv.abilities.push({ id: itemId, purchasedAt: Date.now(), uses: item.uses || 0, expiresAt: item.duration ? Date.now() + item.duration : null });
    }
  } else {
    if (!inv[category]) inv[category] = [];
    if (!inv[category].includes(itemId)) {
      inv[category].push(itemId);
    } else {
      // Already own it, refund
      await addCoins(item.price, 'refund');
      showToast('You already own ' + item.emoji + ' ' + item.name + '!');
      return;
    }
  }

  await socialClient.from('dc_ghost_coins').update({ inventory: inv, updated_at: new Date().toISOString() }).eq('user_id', user.id);
  showToast(item.emoji + ' ' + item.name + ' purchased!');
  updateCoinDisplay();
  if (typeof renderShop === 'function') renderShop();
}

async function equipItem(category, itemId) {
  const user = await getSocialSession();
  if (!user) return;
  const { data: current } = await socialClient.from('dc_ghost_coins')
    .select('equipped_items').eq('user_id', user.id).single();
  const equipped = current?.equipped_items || {};
  equipped[category] = itemId;
  await socialClient.from('dc_ghost_coins').update({ equipped_items: equipped, updated_at: new Date().toISOString() }).eq('user_id', user.id);
  showToast('Equipped!');
}

// ===== DAILY SPIN =====

function canSpin(lastSpin) {
  if (!lastSpin) return true;
  const today = new Date().toISOString().slice(0, 10);
  return lastSpin !== today;
}

function weightedRandom(rewards) {
  const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const r of rewards) {
    rand -= r.weight;
    if (rand <= 0) return r;
  }
  return rewards[0];
}

async function doDailySpin() {
  const user = await getSocialSession();
  if (!user) { showToast('Sign in first!'); return null; }

  await ensureCoinRow();
  const { data } = await socialClient.from('dc_ghost_coins')
    .select('last_spin, inventory').eq('user_id', user.id).single();

  if (!canSpin(data?.last_spin)) {
    showToast('Already spun today! Come back tomorrow.');
    return null;
  }

  // Check for lucky charm (2x)
  const hasLucky = (data?.inventory?.abilities || []).some(a => a.id === 'lucky' && a.expiresAt > Date.now());
  const reward = weightedRandom(SPIN_REWARDS);
  const multiplier = hasLucky ? 2 : 1;

  // Apply reward
  if (reward.coins) {
    await addCoins(reward.coins * multiplier, 'daily_spin');
  }
  if (reward.xp) {
    await addXP(reward.xp * multiplier);
  }
  if (reward.item === 'hat') {
    const unowned = GHOST_SHOP.hats.filter(h => !(data?.inventory?.hats || []).includes(h.id));
    if (unowned.length > 0) {
      const randomHat = unowned[Math.floor(Math.random() * unowned.length)];
      const inv = data?.inventory || { hats: [], weapons: [], decor: [], abilities: [] };
      inv.hats.push(randomHat.id);
      await socialClient.from('dc_ghost_coins').update({ inventory: inv }).eq('user_id', user.id);
      reward.hatName = randomHat.emoji + ' ' + randomHat.name;
    } else {
      // All hats owned, give coins instead
      await addCoins(10, 'spin_hat_fallback');
      reward.label = '10 🪙 (all hats owned!)';
    }
  }

  // Mark spin used
  await socialClient.from('dc_ghost_coins').update({ last_spin: new Date().toISOString().slice(0, 10) }).eq('user_id', user.id);

  return { reward, multiplier, hasLucky };
}

// ===== RANDOM EVENTS =====

async function triggerRandomEvent() {
  // Only trigger once per visit (tracked in sessionStorage)
  if (sessionStorage.getItem('dc_event_triggered')) return null;

  for (const event of RANDOM_EVENTS) {
    if (Math.random() < event.chance) {
      sessionStorage.setItem('dc_event_triggered', '1');
      const user = await getSocialSession();
      if (!user) return null;

      let amount = 0;
      if (event.coins) {
        amount = event.coins[0] + Math.floor(Math.random() * (event.coins[1] - event.coins[0] + 1));
        if (event.coinLoss) await deductCoins(event.coinLoss);
        await addCoins(amount, 'random_event_' + event.id);
      }
      if (event.xp) {
        amount = event.xp[0] + Math.floor(Math.random() * (event.xp[1] - event.xp[0] + 1));
        await addXP(amount);
      }

      return { ...event, amount };
    }
  }
  return null;
}

// ===== VISIT STREAK =====

async function updateVisitStreak() {
  const user = await getSocialSession();
  if (!user) return 0;
  await ensureCoinRow();

  const { data } = await socialClient.from('dc_ghost_coins')
    .select('visit_streak, last_visit').eq('user_id', user.id).single();

  const today = new Date().toISOString().slice(0, 10);
  const lastVisit = data?.last_visit;
  let streak = data?.visit_streak || 0;

  if (lastVisit === today) return streak; // Already counted today

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (lastVisit === yesterday) {
    streak++;
  } else if (lastVisit && lastVisit !== today) {
    streak = 1; // Broken streak
  } else {
    streak = 1;
  }

  await socialClient.from('dc_ghost_coins').update({
    visit_streak: streak,
    last_visit: today,
    updated_at: new Date().toISOString()
  }).eq('user_id', user.id);

  // Check streak bonuses
  for (const bonus of STREAK_BONUSES) {
    if (streak === bonus.days) {
      await addCoins(bonus.coins, 'streak_bonus_' + bonus.days);
      showToast(bonus.msg);
      break;
    }
  }

  return streak;
}

// ===== BIRTHDAY =====

function checkBirthday() {
  // Check if today is user's birthday from quiz answers
  const dob = state.answers?.dob || localStorage.getItem('dc_dob');
  if (!dob) return false;
  const today = new Date();
  const birth = new Date(dob);
  return today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();
}

function getBirthdayGhosts() {
  // Check group members whose birthday is today
  if (!state.currentGroup || !state.groupMembers) return [];
  const today = new Date();
  return (state.groupMembers || []).filter(m => {
    if (!m.dob) return false;
    const d = new Date(m.dob);
    return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  });
}

// ===== FRIEND GIFTING =====

async function giftCoins(targetId, targetName, amount) {
  if (!amount || amount < 1 || amount > 50) { showToast('Gift 1-50 coins'); return; }
  const user = await getSocialSession();
  if (!user) return;
  if (user.id === targetId) { showToast('Cannot gift yourself!'); return; }

  const balance = await getMyCoins();
  if (balance < amount) { showToast('Not enough coins!'); return; }

  await deductCoins(amount);
  // Add to recipient
  const { data: recipientData } = await socialClient.from('dc_ghost_coins')
    .select('balance').eq('user_id', targetId).single();
  if (recipientData) {
    await socialClient.from('dc_ghost_coins').update({
      balance: (recipientData.balance || 0) + amount,
      updated_at: new Date().toISOString()
    }).eq('user_id', targetId);
  }

  // Log interaction
  await socialClient.from('dc_ghost_interactions').insert({
    group_id: state.currentGroup?.id,
    sender_id: user.id,
    target_id: targetId,
    action_type: 'gift',
    message_text: (state.socialProfile?.display_name || 'A ghost') + ' gifted ' + amount + ' coins to ' + targetName + '!',
    xp_earned: 5
  });

  await addXP(5);
  showToast('🎁 Sent ' + amount + ' coins to ' + targetName + '!');
  updateCoinDisplay();
}

async function pokeGhost(targetId, targetName) {
  const user = await getSocialSession();
  if (!user || !state.currentGroup) return;

  await socialClient.from('dc_ghost_interactions').insert({
    group_id: state.currentGroup.id,
    sender_id: user.id,
    target_id: targetId,
    action_type: 'poke',
    message_text: (state.socialProfile?.display_name || 'A ghost') + ' poked ' + targetName + '! 👉',
    xp_earned: 2
  });

  await addXP(2);
  showToast('👉 Poked ' + targetName + '!');
}

async function highFiveGhost(targetId, targetName) {
  const user = await getSocialSession();
  if (!user || !state.currentGroup) return;

  await socialClient.from('dc_ghost_interactions').insert({
    group_id: state.currentGroup.id,
    sender_id: user.id,
    target_id: targetId,
    action_type: 'highfive',
    message_text: (state.socialProfile?.display_name || 'A ghost') + ' high-fived ' + targetName + '! 🙌',
    xp_earned: 3
  });

  await addXP(3);
  showToast('🙌 High-fived ' + targetName + '!');
}

async function comboHaunt(targetId, targetName) {
  const user = await getSocialSession();
  if (!user || !state.currentGroup) return;

  const spent = await deductCoins(2);
  if (!spent) { showToast('Need 2 coins for combo haunt!'); return; }

  const messages = [
    '{sender} and their ghost squad haunted {target} in formation!',
    '{sender} summoned a ghost tornado around {target}!',
    '{sender} did a synchronized spook with nearby ghosts on {target}!',
    '{sender} unleashed a MEGA HAUNT on {target}! The chandelier exploded!'
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)]
    .replace('{sender}', state.socialProfile?.display_name || 'A ghost')
    .replace('{target}', targetName);

  await socialClient.from('dc_ghost_interactions').insert({
    group_id: state.currentGroup.id,
    sender_id: user.id,
    target_id: targetId,
    action_type: 'combo_haunt',
    message_text: msg,
    xp_earned: 20
  });

  await addXP(20);
  playHauntAnimation('ghost-fullhaunt', '👻💥👻');
  showToast('💥 COMBO HAUNT! +20 XP');
}

// ===== UI RENDERERS =====

function renderShop() {
  const container = document.getElementById('shopContent');
  if (!container) return;

  getMyInventory().then(inv => {
    let html = '<div style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap;">'
      + '<button class="btn-sm shop-tab active" onclick="switchShopTab(\'hats\')">🎩 Hats</button>'
      + '<button class="btn-sm shop-tab" onclick="switchShopTab(\'weapons\')">⚔️ Weapons</button>'
      + '<button class="btn-sm shop-tab" onclick="switchShopTab(\'decor\')">🕯️ Decor</button>'
      + '<button class="btn-sm shop-tab" onclick="switchShopTab(\'abilities\')">⚡ Abilities</button>'
      + '</div>';

    html += '<div id="shopGrid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:10px;">';
    GHOST_SHOP.hats.forEach(item => {
      const owned = inv.hats.includes(item.id);
      const equipped = inv.equipped?.hats === item.id;
      html += renderShopItem(item, 'hats', owned, equipped);
    });
    html += '</div>';
    container.innerHTML = html;
  });
}

function renderShopItem(item, category, owned, equipped) {
  const border = equipped ? 'var(--gold)' : (owned ? 'var(--green)' : 'var(--border)');
  const action = owned
    ? (equipped ? '' : 'onclick="equipItem(\'' + category + '\', \'' + item.id + '\')"')
    : 'onclick="buyShopItem(\'' + category + '\', \'' + item.id + '\')"';
  const label = equipped ? '<span style="color:var(--gold); font-size:0.7rem;">EQUIPPED</span>'
    : (owned ? '<span style="color:var(--green); font-size:0.7rem;">OWNED</span>'
    : '<span style="color:var(--text2); font-size:0.8rem; font-weight:700;">' + item.price + ' 🪙</span>');

  return '<div style="background:var(--surface); border:1px solid ' + border + '; border-radius:10px; padding:12px; text-align:center; cursor:pointer; transition:all 0.2s;" '
    + action + ' '
    + 'onmouseover="this.style.transform=\'translateY(-2px)\'; this.style.boxShadow=\'0 4px 12px rgba(0,0,0,0.3)\'" '
    + 'onmouseout="this.style.transform=\'none\'; this.style.boxShadow=\'none\'">'
    + '<div style="font-size:2rem;">' + item.emoji + '</div>'
    + '<div style="font-size:0.8rem; font-weight:700; margin:4px 0;">' + item.name + '</div>'
    + '<div style="font-size:0.7rem; color:var(--text3); margin-bottom:4px;">' + item.desc + '</div>'
    + label + '</div>';
}

function switchShopTab(category) {
  document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');

  getMyInventory().then(inv => {
    const grid = document.getElementById('shopGrid');
    if (!grid) return;
    let html = '';
    GHOST_SHOP[category].forEach(item => {
      const owned = (inv[category] || []).includes(item.id);
      const equipped = inv.equipped?.[category] === item.id;
      html += renderShopItem(item, category, owned, equipped);
    });
    grid.innerHTML = html;
  });
}

function renderSpinWheel() {
  const container = document.getElementById('spinWheelArea');
  if (!container) return;

  getMyInventory().then(inv => {
    const canSpinNow = canSpin(inv.lastSpin);
    const streakDisplay = inv.streak || 0;

    container.innerHTML = '<div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">'
      + '<div style="text-align:center;">'
      + '<div style="font-size:3rem; animation:' + (canSpinNow ? 'pulse 2s infinite' : 'none') + '; cursor:' + (canSpinNow ? 'pointer' : 'default') + '; opacity:' + (canSpinNow ? '1' : '0.4') + ';" '
      + (canSpinNow ? 'onclick="spinTheWheel()"' : '') + '>🎰</div>'
      + '<div style="font-size:0.8rem; color:var(--text2); margin-top:4px;">' + (canSpinNow ? 'Tap to spin!' : 'Spun today ✓') + '</div>'
      + '</div>'
      + '<div>'
      + '<div style="font-size:0.85rem; color:var(--text2);">🔥 Visit Streak: <strong style="color:var(--gold);">' + streakDisplay + ' days</strong></div>'
      + '<div style="font-size:0.75rem; color:var(--text3); margin-top:2px;">Next bonus at ' + getNextStreakTarget(streakDisplay) + ' days</div>'
      + '</div>'
      + '</div>';
  });
}

function getNextStreakTarget(current) {
  for (const b of STREAK_BONUSES) {
    if (current < b.days) return b.days;
  }
  return '30+';
}

async function spinTheWheel() {
  const result = await doDailySpin();
  if (!result) return;

  const { reward, multiplier, hasLucky } = result;
  const luckyText = hasLucky ? ' (🍀 2x LUCKY!)' : '';
  let msg = '🎰 ';

  if (reward.coins) msg += 'Won ' + (reward.coins * multiplier) + ' coins!' + luckyText;
  else if (reward.xp) msg += 'Won ' + (reward.xp * multiplier) + ' XP!' + luckyText;
  else if (reward.hatName) msg += 'Won ' + reward.hatName + '!' + luckyText;
  else msg += reward.label + luckyText;

  // Animate
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); font-size:3rem; z-index:3000; pointer-events:none; animation:hauntPop 1.5s ease-out forwards; text-align:center;';
  el.innerHTML = '🎰<br><span style="font-size:1.2rem; color:var(--gold);">' + msg + '</span>';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);

  showToast(msg);
  renderSpinWheel();
  updateCoinDisplay();
}

function showRandomEventPopup(event) {
  if (!event) return;
  const msg = event.msg.replace('{n}', event.amount);
  const popup = document.createElement('div');
  popup.style.cssText = 'position:fixed; top:20%; left:50%; transform:translateX(-50%); background:var(--bg2); border:2px solid var(--gold); border-radius:16px; padding:24px 32px; z-index:2500; animation:fadeIn 0.4s; text-align:center; box-shadow:0 8px 40px rgba(0,0,0,0.6);';
  popup.innerHTML = '<div style="font-size:3rem; margin-bottom:8px;">' + event.emoji + '</div>'
    + '<div style="font-size:1.1rem; font-weight:700; color:var(--gold); margin-bottom:8px;">' + event.title + '</div>'
    + '<div style="font-size:0.9rem; color:var(--text2);">' + msg + '</div>'
    + '<button class="btn-primary btn-sm" onclick="this.parentElement.remove()" style="margin-top:16px;">Nice!</button>';
  document.body.appendChild(popup);
  setTimeout(() => { if (popup.parentElement) popup.remove(); }, 8000);
}

function renderBirthdayBanner(name) {
  const banner = document.getElementById('birthdayBanner');
  if (!banner) return;
  const decos = BIRTHDAY_DECORATIONS.sort(() => Math.random() - 0.5).slice(0, 6).join(' ');
  banner.innerHTML = '<div style="background:linear-gradient(135deg, rgba(240,192,64,0.2), rgba(233,69,96,0.1)); border:1px solid var(--gold); border-radius:12px; padding:16px; text-align:center; animation:pulse 3s infinite;">'
    + '<div style="font-size:1.5rem;">' + decos + '</div>'
    + '<div style="font-size:1.1rem; font-weight:700; color:var(--gold); margin:8px 0;">🎂 Happy Death-day, ' + escHtml(name) + '! 🎂</div>'
    + '<div style="font-size:0.85rem; color:var(--text2);">The mansion is decorated in your honour. +25 bonus coins!</div>'
    + '</div>';
  banner.classList.remove('hidden');
}

// ===== ENGAGEMENT INIT =====

async function initEngagement() {
  const user = await getSocialSession();
  if (!user) return;

  // Update visit streak
  await updateVisitStreak();

  // Check birthday
  if (checkBirthday()) {
    const name = state.socialProfile?.display_name || state.supaUser?.email?.split('@')[0] || 'Ghost';
    renderBirthdayBanner(name);
    // Give birthday bonus (once per year)
    const birthdayKey = 'dc_birthday_' + new Date().getFullYear();
    if (!localStorage.getItem(birthdayKey)) {
      await addCoins(25, 'birthday_bonus');
      localStorage.setItem(birthdayKey, '1');
      showToast('🎂 Happy Birthday! +25 coins!');
    }
  }

  // Random event
  const event = await triggerRandomEvent();
  if (event) {
    setTimeout(() => showRandomEventPopup(event), 2000);
  }

  // Render spin wheel
  renderSpinWheel();

  // Render shop
  renderShop();
}
