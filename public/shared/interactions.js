// ============================================
// GHOST INTERACTIONS: Haunts, Battles, Graffiti
// ============================================

// ===== HAUNT ACTIONS =====
const HAUNT_ACTIONS = {
  boo: {
    name: 'Boo!',
    emoji: '👻',
    xp: 5,
    messages: [
      '{sender} jumped out from behind a curtain and screamed BOO at {target}!',
      '{sender} materialised inside {target}\'s ribcage. Awkward.',
      '{sender} whispered "{target}... I see dead people" right into their ear.',
      '{sender} replaced all of {target}\'s mirrors with haunted ones.',
      '{sender} left ectoplasm in {target}\'s slippers. Classic.'
    ],
    animation: 'ghost-shake'
  },
  possess: {
    name: 'Possess',
    emoji: '😈',
    xp: 10,
    messages: [
      '{sender} possessed {target} and made them eat a salad. The horror.',
      '{sender} took control of {target}\'s body and signed up for a marathon.',
      '{sender} possessed {target} and forced them to drink 8 glasses of water.',
      '{sender} hijacked {target}\'s limbs and did 50 push-ups. {target} is confused and sore.',
      '{sender} possessed {target} and threw away their cigarettes. Brutal.'
    ],
    animation: 'ghost-possess'
  },
  curse: {
    name: 'Curse',
    emoji: '💀',
    xp: 8,
    messages: [
      '{sender} cursed {target} to stub their toe every morning for a week.',
      '{sender} hexed {target}\'s wifi to buffer during every important video call.',
      '{sender} cursed {target}\'s alarm clock to go off 5 minutes early. Pure evil.',
      '{sender} placed a curse: {target}\'s phone will always be at 3% battery.',
      '{sender} cursed {target} to always pick the slowest checkout line.'
    ],
    animation: 'ghost-curse'
  },
  tickle: {
    name: 'Tickle',
    emoji: '🤭',
    xp: 3,
    messages: [
      '{sender} tickled {target} with ghostly fingers. They laughed so hard they snorted.',
      '{sender} deployed spectral tickle tentacles on {target}. It was super effective.',
      '{sender} found {target}\'s ticklish spot. It\'s behind the left knee.',
      '{sender} tickled {target} until they fell off their chair. Ghosts can be jerks.',
      '{sender} gave {target} the phantom tickle. They\'re still twitching.'
    ],
    animation: 'ghost-tickle'
  },
  haunt: {
    name: 'Full Haunt',
    emoji: '🏚️',
    xp: 15,
    messages: [
      '{sender} went full poltergeist on {target}\'s room. Furniture is on the ceiling now.',
      '{sender} haunted {target} so hard their Fitbit recorded it as cardio.',
      '{sender} appeared at the foot of {target}\'s bed at 3am. They didn\'t sleep for a week.',
      '{sender} made all of {target}\'s doors slam simultaneously. The neighbours called an exorcist.',
      '{sender} rearranged all of {target}\'s furniture 2 inches to the left. Maximum chaos.'
    ],
    animation: 'ghost-fullhaunt'
  }
};

// ===== BATTLE SYSTEM =====
const BATTLE_MOVES = [
  { name: 'Spectral Slap', emoji: '👋', baseDmg: 10, type: 'physical', desc: 'A ghostly backhand from beyond the grave' },
  { name: 'Ectoplasm Blast', emoji: '💚', baseDmg: 15, type: 'magic', desc: 'Spray them with concentrated ghost goo' },
  { name: 'Soul Drain', emoji: '🌀', baseDmg: 12, type: 'dark', desc: 'Suck out a little bit of their life force' },
  { name: 'Phantom Punch', emoji: '👊', baseDmg: 18, type: 'physical', desc: 'An uppercut that phases through dimensions' },
  { name: 'Wail of Despair', emoji: '😱', baseDmg: 8, type: 'magic', desc: 'A scream so existential it does psychological damage' },
  { name: 'Grave Dirt Throw', emoji: '🪦', baseDmg: 6, type: 'physical', desc: 'Scoop some cemetery dirt and fling it' },
  { name: 'Chain Rattle', emoji: '⛓️', baseDmg: 14, type: 'dark', desc: 'The classic ghost move. Never gets old.' },
  { name: 'Possession Strike', emoji: '😈', baseDmg: 20, type: 'dark', desc: 'Briefly possess them and make them slap themselves' }
];

const BATTLE_COMMENTARY = {
  miss: [
    'Whoosh! That went right through them. Oh wait, everything goes through them.',
    'Dodged! {defender} floated left just in time.',
    'A swing and a miss! Even in death, some things never change.',
    '{attacker} tried but {defender} phased out of existence briefly.'
  ],
  hit: [
    'Direct hit! {defender} flickered violently!',
    'SMACK! {defender}\'s ectoplasm splattered everywhere!',
    'Ouch! {defender} lost some spectral integrity!',
    '{attacker} connects! {defender} is looking more transparent than usual.'
  ],
  critical: [
    'CRITICAL HIT! {defender}\'s ghost nearly dissipated!',
    'DEVASTATING! {defender} was temporarily sent to the shadow realm!',
    'BRUTAL! That knocked {defender}\'s haunting license clean off!',
    'OVERKILL! Even the other ghosts felt that one!'
  ],
  ko: [
    '{defender} has been temporarily banished! They\'ll respawn after a good nap.',
    '{defender}\'s ghost ran away screaming. Ironic.',
    '{defender} was defeated! They\'ll float back eventually. Ghosts can\'t actually die again. Right?',
    'K.O.! {defender} dissolved into mist. Very dramatic exit.'
  ],
  win: [
    '{winner} stands victorious! Their ghost glows with stolen life force.',
    '{winner} wins! +{xp} XP and eternal bragging rights.',
    'The battle is over! {winner} proved that not all ghosts are created equal.',
    '{winner} is the ultimate haunter! {loser} should probably go haunt somewhere easier.'
  ]
};

function getGhostBattleStats(profile) {
  const le = profile.life_expectancy || 75;
  const score = profile.life_score || 50;
  return {
    hp: Math.round(le * 1.5),
    attack: Math.round(score / 5) + 5,
    defense: Math.round((100 - score) / 10) + 2,
    speed: Math.round(Math.random() * 5 + (le > 80 ? 8 : 5)),
    name: profile.display_name || profile.username || 'Ghost',
    color: profile.ghost_color || '#00ff88',
    eyes: profile.ghost_eye_style || 'normal',
    id: profile.id
  };
}

function simulateBattleTurn(attacker, defender, move) {
  const hitChance = 0.7 + (attacker.speed - defender.speed) * 0.02;
  const hit = Math.random() < hitChance;
  if (!hit) return { hit: false, damage: 0, critical: false };

  const critChance = 0.15;
  const critical = Math.random() < critChance;
  let damage = move.baseDmg + attacker.attack - defender.defense;
  if (critical) damage = Math.round(damage * 1.8);
  damage = Math.max(1, Math.round(damage + (Math.random() * 6 - 3)));
  return { hit: true, damage, critical };
}

function runFullBattle(attacker, defender) {
  const log = [];
  let aHP = attacker.hp;
  let dHP = defender.hp;
  let round = 0;
  const maxRounds = 10;

  while (aHP > 0 && dHP > 0 && round < maxRounds) {
    round++;
    // Attacker moves
    const aMove = BATTLE_MOVES[Math.floor(Math.random() * BATTLE_MOVES.length)];
    const aResult = simulateBattleTurn(attacker, defender, aMove);
    if (aResult.hit) dHP -= aResult.damage;
    log.push({ round, who: attacker.name, move: aMove, result: aResult, targetHP: Math.max(0, dHP) });

    if (dHP <= 0) break;

    // Defender retaliates
    const dMove = BATTLE_MOVES[Math.floor(Math.random() * BATTLE_MOVES.length)];
    const dResult = simulateBattleTurn(defender, attacker, dMove);
    if (dResult.hit) aHP -= dResult.damage;
    log.push({ round, who: defender.name, move: dMove, result: dResult, targetHP: Math.max(0, aHP) });
  }

  const winner = dHP <= 0 ? attacker : (aHP <= 0 ? defender : (aHP > dHP ? attacker : defender));
  const loser = winner === attacker ? defender : attacker;
  const xpEarned = winner === attacker ? 25 : 10; // Less XP if you lost
  return { log, winner, loser, xpEarned, rounds: round };
}

// ===== INTERACTION UI =====

function showGhostActionMenu(targetId, targetName, targetColor, targetEyes, targetLE, clickX, clickY) {
  // Remove any existing menu
  const old = document.getElementById('ghostActionMenu');
  if (old) old.remove();

  const menu = document.createElement('div');
  menu.id = 'ghostActionMenu';
  menu.style.cssText = 'position:fixed; z-index:2000; background:var(--bg2); border:1px solid var(--border); border-radius:12px; padding:8px; min-width:180px; box-shadow:0 8px 32px rgba(0,0,0,0.6);';

  // Position near click but keep on screen
  const x = Math.min(clickX, window.innerWidth - 200);
  const y = Math.min(clickY, window.innerHeight - 350);
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';

  let html = '<div style="padding:4px 8px; font-size:0.75rem; color:var(--text3); text-transform:uppercase; letter-spacing:1px;">Haunt ' + escHtml(targetName) + '</div>';

  Object.keys(HAUNT_ACTIONS).forEach(key => {
    const a = HAUNT_ACTIONS[key];
    const cost = (typeof HAUNT_COSTS !== 'undefined' && HAUNT_COSTS[key]) ? HAUNT_COSTS[key] : 1;
    html += '<button onclick="doHauntAction(\'' + key + '\', \'' + targetId + '\', \'' + escHtml(targetName) + '\')" '
      + 'style="display:block; width:100%; text-align:left; padding:8px 12px; background:none; border:none; color:var(--text); font-size:0.9rem; cursor:pointer; border-radius:8px; transition:background 0.2s;" '
      + 'onmouseover="this.style.background=\'var(--surface)\'" onmouseout="this.style.background=\'none\'">'
      + a.emoji + ' ' + a.name + ' <span style="color:var(--text3); font-size:0.75rem;">' + cost + '🪙 +' + a.xp + 'xp</span></button>';
  });

  html += '<div style="border-top:1px solid var(--border); margin:4px 0;"></div>';
  html += '<button onclick="startGhostBattle(\'' + targetId + '\', \'' + escHtml(targetName) + '\')" '
    + 'style="display:block; width:100%; text-align:left; padding:8px 12px; background:none; border:none; color:var(--accent); font-size:0.9rem; cursor:pointer; border-radius:8px; font-weight:700; transition:background 0.2s;" '
    + 'onmouseover="this.style.background=\'var(--surface)\'" onmouseout="this.style.background=\'none\'">'
    + '⚔️ Challenge to Battle! <span style="color:var(--text3); font-size:0.75rem;">3🪙 +25xp</span></button>';

  html += '<button onclick="showCreateChallengeModal(\'' + targetId + '\', \'' + escHtml(targetName) + '\')" '
    + 'style="display:block; width:100%; text-align:left; padding:8px 12px; background:none; border:none; color:var(--gold); font-size:0.9rem; cursor:pointer; border-radius:8px; font-weight:700; transition:background 0.2s;" '
    + 'onmouseover="this.style.background=\'var(--surface)\'" onmouseout="this.style.background=\'none\'">'
    + '🪙 Dare Challenge <span style="color:var(--text3); font-size:0.75rem;">bet coins</span></button>';

  // Friend interactions
  html += '<div style="border-top:1px solid var(--border); margin:4px 0;"></div>';
  html += '<div style="padding:4px 8px; font-size:0.7rem; color:var(--text3); text-transform:uppercase; letter-spacing:1px;">Social</div>';

  html += '<button onclick="pokeGhost(\'' + targetId + '\', \'' + escHtml(targetName) + '\'); document.getElementById(\'ghostActionMenu\')?.remove();" '
    + 'style="display:block; width:100%; text-align:left; padding:8px 12px; background:none; border:none; color:var(--text); font-size:0.9rem; cursor:pointer; border-radius:8px; transition:background 0.2s;" '
    + 'onmouseover="this.style.background=\'var(--surface)\'" onmouseout="this.style.background=\'none\'">'
    + '👉 Poke <span style="color:var(--text3); font-size:0.75rem;">+2xp</span></button>';

  html += '<button onclick="highFiveGhost(\'' + targetId + '\', \'' + escHtml(targetName) + '\'); document.getElementById(\'ghostActionMenu\')?.remove();" '
    + 'style="display:block; width:100%; text-align:left; padding:8px 12px; background:none; border:none; color:var(--text); font-size:0.9rem; cursor:pointer; border-radius:8px; transition:background 0.2s;" '
    + 'onmouseover="this.style.background=\'var(--surface)\'" onmouseout="this.style.background=\'none\'">'
    + '🙌 High Five <span style="color:var(--text3); font-size:0.75rem;">+3xp</span></button>';

  html += '<button onclick="comboHaunt(\'' + targetId + '\', \'' + escHtml(targetName) + '\'); document.getElementById(\'ghostActionMenu\')?.remove();" '
    + 'style="display:block; width:100%; text-align:left; padding:8px 12px; background:none; border:none; color:var(--accent2); font-size:0.9rem; cursor:pointer; border-radius:8px; font-weight:700; transition:background 0.2s;" '
    + 'onmouseover="this.style.background=\'var(--surface)\'" onmouseout="this.style.background=\'none\'">'
    + '👻💥 Combo Haunt <span style="color:var(--text3); font-size:0.75rem;">2🪙 +20xp</span></button>';

  html += '<button onclick="promptGiftCoins(\'' + targetId + '\', \'' + escHtml(targetName) + '\'); document.getElementById(\'ghostActionMenu\')?.remove();" '
    + 'style="display:block; width:100%; text-align:left; padding:8px 12px; background:none; border:none; color:var(--green); font-size:0.9rem; cursor:pointer; border-radius:8px; transition:background 0.2s;" '
    + 'onmouseover="this.style.background=\'var(--surface)\'" onmouseout="this.style.background=\'none\'">'
    + '🎁 Gift Coins <span style="color:var(--text3); font-size:0.75rem;">send 🪙</span></button>';

  menu.innerHTML = html;
  document.body.appendChild(menu);

  // Close on click outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', closeMenu); }
    });
  }, 100);
}

async function doHauntAction(actionKey, targetId, targetName) {
  const menu = document.getElementById('ghostActionMenu');
  if (menu) menu.remove();

  const user = await getSocialSession();
  if (!user || !state.currentGroup) { showToast('Sign in and join a group first!'); return; }

  // Check + deduct coins
  if (typeof spendHauntCoins === 'function') {
    const spent = await spendHauntCoins(actionKey);
    if (!spent) {
      showToast('🪙 Not enough coins! Get your daily free coins or buy more.');
      if (typeof showBuyCoinsModal === 'function') showBuyCoinsModal();
      return;
    }
  }

  const action = HAUNT_ACTIONS[actionKey];
  const senderName = state.socialProfile?.display_name || state.socialProfile?.username || 'A ghost';
  const msg = action.messages[Math.floor(Math.random() * action.messages.length)]
    .replace(/\{sender\}/g, senderName)
    .replace(/\{target\}/g, targetName);

  // Save to Supabase
  try {
    await socialClient.from('dc_ghost_interactions').insert({
      group_id: state.currentGroup.id,
      sender_id: user.id,
      target_id: targetId,
      action_type: actionKey,
      message_text: msg,
      xp_earned: action.xp
    });
  } catch(e) { console.error('Haunt save error:', e); }

  // Accumulate XP
  if (typeof addXP === 'function') addXP(action.xp);

  // Show animation
  playHauntAnimation(action.animation, action.emoji);
  showToast(action.emoji + ' ' + msg);

  // Add to activity feed
  addToActivityFeed(action.emoji, msg);
}

function playHauntAnimation(animClass, emoji) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); font-size:6rem; z-index:3000; pointer-events:none; animation:hauntPop 1.2s ease-out forwards;';
  el.textContent = emoji;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

// ===== BATTLE UI =====

async function startGhostBattle(targetId, targetName) {
  const menu = document.getElementById('ghostActionMenu');
  if (menu) menu.remove();

  const user = await getSocialSession();
  if (!user || !state.currentGroup) { showToast('Sign in first!'); return; }

  // Check + deduct coins
  if (typeof spendBattleCoins === 'function') {
    const spent = await spendBattleCoins();
    if (!spent) {
      showToast('🪙 Not enough coins for battle! Need 3 coins.');
      if (typeof showBuyCoinsModal === 'function') showBuyCoinsModal();
      return;
    }
  }

  // Fetch both profiles
  const { data: profiles } = await socialClient.from('dc_profiles')
    .select('*').in('id', [user.id, targetId]);

  if (!profiles || profiles.length < 2) { showToast('Could not load battle data'); return; }

  const myProfile = profiles.find(p => p.id === user.id);
  const theirProfile = profiles.find(p => p.id === targetId);
  if (!myProfile || !theirProfile) { showToast('Profile not found'); return; }

  const attacker = getGhostBattleStats(myProfile);
  const defender = getGhostBattleStats(theirProfile);
  const battle = runFullBattle(attacker, defender);

  // Save to Supabase
  const iWon = battle.winner.id === user.id;
  try {
    await socialClient.from('dc_ghost_interactions').insert({
      group_id: state.currentGroup.id,
      sender_id: user.id,
      target_id: targetId,
      action_type: 'battle',
      message_text: battle.winner.name + ' defeated ' + battle.loser.name + ' in ' + battle.rounds + ' rounds!',
      battle_data: { log: battle.log, winner: battle.winner.name, loser: battle.loser.name, rounds: battle.rounds },
      xp_earned: iWon ? 25 : 10
    });
  } catch(e) { console.error('Battle save error:', e); }

  // Accumulate XP
  if (typeof addXP === 'function') addXP(iWon ? 25 : 10);

  showBattleModal(attacker, defender, battle);
}

function showBattleModal(attacker, defender, battle) {
  const overlay = document.createElement('div');
  overlay.id = 'battleModal';
  overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:2000; display:flex; align-items:center; justify-content:center; animation:fadeIn 0.3s;';

  let aHP = attacker.hp;
  let dHP = defender.hp;

  // Build battle log HTML
  let logHtml = '';
  battle.log.forEach((entry, i) => {
    const isAttacker = entry.who === attacker.name;
    const target = isAttacker ? defender.name : attacker.name;
    let text;
    if (!entry.result.hit) {
      text = BATTLE_COMMENTARY.miss[Math.floor(Math.random() * BATTLE_COMMENTARY.miss.length)]
        .replace('{attacker}', entry.who).replace('{defender}', target);
    } else if (entry.result.critical) {
      text = BATTLE_COMMENTARY.critical[Math.floor(Math.random() * BATTLE_COMMENTARY.critical.length)]
        .replace('{attacker}', entry.who).replace('{defender}', target);
    } else {
      text = BATTLE_COMMENTARY.hit[Math.floor(Math.random() * BATTLE_COMMENTARY.hit.length)]
        .replace('{attacker}', entry.who).replace('{defender}', target);
    }

    logHtml += '<div style="padding:6px 0; border-bottom:1px solid var(--border); font-size:0.85rem; animation:fadeIn 0.3s; animation-delay:' + (i * 0.4) + 's; animation-fill-mode:both;">'
      + '<span style="color:' + (isAttacker ? 'var(--green)' : 'var(--accent)') + '; font-weight:700;">' + escHtml(entry.who) + '</span> used '
      + entry.move.emoji + ' <strong>' + entry.move.name + '</strong>'
      + (entry.result.hit ? ' &mdash; <span style="color:' + (entry.result.critical ? 'var(--gold)' : 'var(--accent2)') + ';">' + entry.result.damage + ' dmg' + (entry.result.critical ? ' CRIT!' : '') + '</span>' : ' &mdash; <span style="color:var(--text3);">MISS!</span>')
      + '<div style="font-size:0.8rem; color:var(--text3); font-style:italic;">' + escHtml(text) + '</div></div>';
  });

  // Winner announcement
  const winText = BATTLE_COMMENTARY.win[Math.floor(Math.random() * BATTLE_COMMENTARY.win.length)]
    .replace('{winner}', battle.winner.name).replace('{loser}', battle.loser.name).replace('{xp}', battle.xpEarned);

  overlay.innerHTML = '<div style="background:var(--bg2); border:1px solid var(--border); border-radius:16px; padding:32px; max-width:550px; width:90%; max-height:80vh; overflow-y:auto;">'
    + '<h3 style="text-align:center; margin-bottom:16px;">⚔️ Ghost Battle! ⚔️</h3>'
    // Combatants
    + '<div style="display:flex; justify-content:space-around; align-items:center; margin-bottom:20px;">'
    + '<div style="text-align:center;">' + buildMansionGhostSVG(attacker.color, attacker.eyes, 50) + '<div style="font-weight:700; color:var(--green); margin-top:4px;">' + escHtml(attacker.name) + '</div><div style="font-size:0.8rem; color:var(--text3);">HP: ' + attacker.hp + ' | ATK: ' + attacker.attack + '</div></div>'
    + '<div style="font-size:2rem; animation:pulse 1s infinite;">⚔️</div>'
    + '<div style="text-align:center;">' + buildMansionGhostSVG(defender.color, defender.eyes, 50) + '<div style="font-weight:700; color:var(--accent); margin-top:4px;">' + escHtml(defender.name) + '</div><div style="font-size:0.8rem; color:var(--text3);">HP: ' + defender.hp + ' | ATK: ' + defender.attack + '</div></div>'
    + '</div>'
    // Battle log
    + '<div style="background:var(--bg); border-radius:8px; padding:12px; margin-bottom:16px; max-height:250px; overflow-y:auto;">' + logHtml + '</div>'
    // Winner
    + '<div style="text-align:center; padding:16px; background:linear-gradient(135deg, rgba(240,192,64,0.15), rgba(78,204,163,0.1)); border-radius:12px; margin-bottom:16px;">'
    + '<div style="font-size:2rem; margin-bottom:8px;">🏆</div>'
    + '<div style="font-size:1.1rem; font-weight:700; color:var(--gold);">' + escHtml(battle.winner.name) + ' WINS!</div>'
    + '<div style="font-size:0.9rem; color:var(--text2); margin-top:4px;">' + escHtml(winText) + '</div></div>'
    + '<button class="btn-primary" onclick="document.getElementById(\'battleModal\').remove()" style="width:100%;">Close</button>'
    + '</div>';

  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// ===== GRAFFITI WALL =====

async function loadWallMessages() {
  if (!state.currentGroup) return [];
  const { data } = await socialClient.from('dc_ghost_interactions')
    .select('*').eq('group_id', state.currentGroup.id).eq('action_type', 'wall_message')
    .order('created_at', { ascending: false }).limit(20);
  return data || [];
}

async function postWallMessage() {
  const input = document.getElementById('wallMessageInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text || text.length > 140) { showToast('Message must be 1-140 characters'); return; }

  const user = await getSocialSession();
  if (!user || !state.currentGroup) { showToast('Sign in and join a group first!'); return; }

  try {
    await socialClient.from('dc_ghost_interactions').insert({
      group_id: state.currentGroup.id,
      sender_id: user.id,
      target_id: null,
      action_type: 'wall_message',
      message_text: text,
      xp_earned: 3
    });
    input.value = '';
    showToast('👻 Message scratched into the wall!');
    renderGraffitiWall();
  } catch(e) {
    showToast('Error: ' + e.message);
  }
}

async function renderGraffitiWall() {
  const container = document.getElementById('graffitiWall');
  if (!container) return;

  const messages = await loadWallMessages();
  if (!messages.length) {
    container.innerHTML = '<p style="color:var(--text3); text-align:center; font-style:italic; padding:20px;">The walls are bare... Be the first ghost to leave your mark!</p>';
    return;
  }

  // Fetch sender profiles
  const senderIds = [...new Set(messages.map(m => m.sender_id))];
  const { data: profiles } = await socialClient.from('dc_profiles')
    .select('id, display_name, username, ghost_color').in('id', senderIds);
  const profileMap = {};
  (profiles || []).forEach(p => profileMap[p.id] = p);

  let html = '';
  messages.forEach((m, i) => {
    const p = profileMap[m.sender_id] || {};
    const name = p.display_name || p.username || 'Anonymous Ghost';
    const color = p.ghost_color || '#00ff88';
    const angle = (Math.random() * 6 - 3).toFixed(1);
    const timeAgo = getTimeAgo(m.created_at);

    html += '<div style="background:var(--bg); border:1px solid var(--border); border-radius:8px; padding:10px 14px; transform:rotate(' + angle + 'deg); transition:transform 0.2s;" onmouseover="this.style.transform=\'rotate(0deg) scale(1.05)\'" onmouseout="this.style.transform=\'rotate(' + angle + 'deg)\'">'
      + '<div style="font-size:0.95rem; color:' + color + '; font-family:\'Courier New\',monospace; text-shadow:0 0 8px ' + color + '40;">' + escHtml(m.message_text) + '</div>'
      + '<div style="font-size:0.7rem; color:var(--text3); margin-top:4px;">- ' + escHtml(name) + ' &middot; ' + timeAgo + '</div>'
      + '</div>';
  });

  container.innerHTML = html;
}

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  return days + 'd ago';
}

// ===== ACTIVITY FEED =====

const activityFeedItems = [];

function addToActivityFeed(emoji, text) {
  activityFeedItems.unshift({ emoji, text, time: new Date() });
  if (activityFeedItems.length > 20) activityFeedItems.pop();
  renderActivityFeed();
}

async function loadActivityFeed() {
  if (!state.currentGroup) return;
  const { data } = await socialClient.from('dc_ghost_interactions')
    .select('*').eq('group_id', state.currentGroup.id)
    .order('created_at', { ascending: false }).limit(15);

  if (!data || !data.length) return;

  const senderIds = [...new Set(data.map(m => m.sender_id).filter(Boolean))];
  const targetIds = [...new Set(data.map(m => m.target_id).filter(Boolean))];
  const allIds = [...new Set([...senderIds, ...targetIds])];
  const { data: profiles } = await socialClient.from('dc_profiles')
    .select('id, display_name, username').in('id', allIds);
  const pm = {};
  (profiles || []).forEach(p => pm[p.id] = p.display_name || p.username || 'Ghost');

  const container = document.getElementById('activityFeed');
  if (!container) return;

  let html = '';
  data.forEach(item => {
    const action = HAUNT_ACTIONS[item.action_type];
    const emoji = action ? action.emoji : (item.action_type === 'battle' ? '⚔️' : (item.action_type === 'wall_message' ? '🖊️' : '👻'));
    const text = item.message_text || (pm[item.sender_id] + ' did something spooky');
    const timeAgo = getTimeAgo(item.created_at);

    html += '<div style="padding:8px 0; border-bottom:1px solid var(--border); font-size:0.85rem;">'
      + '<span style="font-size:1.1rem;">' + emoji + '</span> '
      + '<span style="color:var(--text2);">' + escHtml(text) + '</span>'
      + '<span style="color:var(--text3); font-size:0.75rem; float:right;">' + timeAgo + '</span>'
      + '</div>';
  });

  container.innerHTML = html || '<p style="color:var(--text3); font-style:italic;">No activity yet. Start haunting!</p>';
}

function renderActivityFeed() {
  loadActivityFeed();
}

// ===== FRIEND GIFT PROMPT =====
function promptGiftCoins(targetId, targetName) {
  const amount = prompt('How many coins to gift ' + targetName + '? (1-50)');
  if (!amount) return;
  const n = parseInt(amount);
  if (isNaN(n) || n < 1 || n > 50) { showToast('Enter 1-50'); return; }
  if (typeof giftCoins === 'function') giftCoins(targetId, targetName, n);
}

// ===== CSS ANIMATIONS =====
(function injectInteractionCSS() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes hauntPop {
      0% { opacity:0; transform:translate(-50%,-50%) scale(0.3); }
      30% { opacity:1; transform:translate(-50%,-50%) scale(1.3); }
      100% { opacity:0; transform:translate(-50%,-80%) scale(0.8); }
    }
    @keyframes ghostShake {
      0%,100% { transform:translateX(0); }
      25% { transform:translateX(-8px) rotate(-5deg); }
      75% { transform:translateX(8px) rotate(5deg); }
    }
    .ghost-action-glow {
      animation: ghostActionGlow 1s ease-out;
    }
    @keyframes ghostActionGlow {
      0% { filter:drop-shadow(0 0 20px var(--accent)) brightness(2); }
      100% { filter:none; }
    }
  `;
  document.head.appendChild(style);
})();
