// ============================================
// GHOST COINS + HEALTH DARE CHALLENGES
// ============================================

const COIN_PACKS = [
  { coins: 10, price: '€2.99', url: 'https://buy.stripe.com/14AdR897FaHu5v17lUgMw06', perCoin: '€0.30' },
  { coins: 25, price: '€5.99', url: 'https://buy.stripe.com/4gM8wO0B98zm2iPeOmgMw07', perCoin: '€0.24', badge: 'Popular' },
  { coins: 50, price: '€9.99', url: 'https://buy.stripe.com/aFafZgfw34j64qXbCagMw08', perCoin: '€0.20', badge: 'Best Value' },
  { coins: 100, price: '€14.99', url: 'https://buy.stripe.com/cNi28qdnV5nag9F49IgMw09', perCoin: '€0.15', badge: 'Whale' }
];

const DARE_TEMPLATES = [
  { text: 'Do 50 pushups today', category: 'fitness', difficulty: 'medium' },
  { text: 'Drink 8 glasses of water today', category: 'health', difficulty: 'easy' },
  { text: 'Walk 10,000 steps today', category: 'fitness', difficulty: 'medium' },
  { text: 'No sugar for 24 hours', category: 'diet', difficulty: 'hard' },
  { text: 'Meditate for 15 minutes', category: 'mental', difficulty: 'easy' },
  { text: 'Go to bed before 10pm tonight', category: 'sleep', difficulty: 'medium' },
  { text: 'Eat 5 servings of vegetables today', category: 'diet', difficulty: 'medium' },
  { text: 'Do a 30-minute run', category: 'fitness', difficulty: 'hard' },
  { text: 'No phone for 2 hours', category: 'mental', difficulty: 'hard' },
  { text: 'Take a cold shower', category: 'health', difficulty: 'hard' },
  { text: 'Stretch for 20 minutes', category: 'fitness', difficulty: 'easy' },
  { text: 'No alcohol for 48 hours', category: 'health', difficulty: 'medium' },
  { text: 'Cook a healthy meal from scratch', category: 'diet', difficulty: 'medium' },
  { text: 'Do 100 squats throughout the day', category: 'fitness', difficulty: 'hard' },
  { text: 'Journal for 10 minutes', category: 'mental', difficulty: 'easy' },
  { text: 'Walk instead of drive somewhere today', category: 'fitness', difficulty: 'easy' },
  { text: 'No processed food for 24 hours', category: 'diet', difficulty: 'hard' },
  { text: 'Do a plank for 2 minutes total', category: 'fitness', difficulty: 'medium' },
  { text: 'Call a friend or family member', category: 'mental', difficulty: 'easy' },
  { text: 'Floss your teeth (yes, really)', category: 'health', difficulty: 'easy' }
];

const CHALLENGE_FEE_RATE = 0.20; // 20% rake

// ===== COIN BALANCE =====

async function getMyCoins() {
  const user = await getSocialSession();
  if (!user) return 0;
  const { data } = await socialClient.from('dc_ghost_coins').select('balance').eq('user_id', user.id).single();
  return data?.balance || 0;
}

async function ensureCoinRow() {
  const user = await getSocialSession();
  if (!user) return;
  const { data } = await socialClient.from('dc_ghost_coins').select('user_id').eq('user_id', user.id).single();
  if (!data) {
    await socialClient.from('dc_ghost_coins').insert({ user_id: user.id, balance: 0 });
  }
}

async function addCoins(amount, reason) {
  const user = await getSocialSession();
  if (!user) return;
  await ensureCoinRow();
  const { data: current } = await socialClient.from('dc_ghost_coins').select('balance, total_won').eq('user_id', user.id).single();
  const newBal = (current?.balance || 0) + amount;
  const newWon = (current?.total_won || 0) + amount;
  await socialClient.from('dc_ghost_coins').update({ balance: newBal, total_won: newWon, updated_at: new Date().toISOString() }).eq('user_id', user.id);
  updateCoinDisplay(newBal);
}

async function deductCoins(amount) {
  const user = await getSocialSession();
  if (!user) return false;
  await ensureCoinRow();
  const { data: current } = await socialClient.from('dc_ghost_coins').select('balance, total_lost, total_fees_paid').eq('user_id', user.id).single();
  const bal = current?.balance || 0;
  if (bal < amount) return false;
  await socialClient.from('dc_ghost_coins').update({
    balance: bal - amount,
    total_lost: (current?.total_lost || 0) + amount,
    updated_at: new Date().toISOString()
  }).eq('user_id', user.id);
  updateCoinDisplay(bal - amount);
  return true;
}

function updateCoinDisplay(balance) {
  const el = document.getElementById('coinBalance');
  if (el) el.textContent = balance;
  const el2 = document.getElementById('coinBalanceNav');
  if (el2) el2.textContent = '🪙 ' + balance;
}

// ===== BUY COINS MODAL =====

function showBuyCoinsModal() {
  const old = document.getElementById('buyCoinsModal');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.id = 'buyCoinsModal';
  overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:2000; display:flex; align-items:center; justify-content:center; animation:fadeIn 0.3s;';

  let packsHtml = '';
  COIN_PACKS.forEach(p => {
    const badge = p.badge ? '<span style="position:absolute; top:-8px; right:-8px; background:var(--gold); color:#1a1a2e; font-size:0.65rem; padding:2px 6px; border-radius:8px; font-weight:700;">' + p.badge + '</span>' : '';
    packsHtml += '<div style="position:relative; background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; text-align:center; cursor:pointer; transition:all 0.2s;" '
      + 'onmouseover="this.style.borderColor=\'var(--gold)\'; this.style.transform=\'translateY(-2px)\'" '
      + 'onmouseout="this.style.borderColor=\'var(--border)\'; this.style.transform=\'none\'" '
      + 'onclick="buyCoins(\'' + p.url + '\', ' + p.coins + ')">'
      + badge
      + '<div style="font-size:2rem; margin-bottom:4px;">🪙</div>'
      + '<div style="font-size:1.3rem; font-weight:800; color:var(--gold);">' + p.coins + '</div>'
      + '<div style="font-size:0.8rem; color:var(--text3);">Ghost Coins</div>'
      + '<div style="font-size:1.1rem; font-weight:700; color:var(--green); margin-top:8px;">' + p.price + '</div>'
      + '<div style="font-size:0.7rem; color:var(--text3);">' + p.perCoin + '/coin</div>'
      + '</div>';
  });

  overlay.innerHTML = '<div style="background:var(--bg2); border:1px solid var(--border); border-radius:16px; padding:32px; max-width:500px; width:90%;">'
    + '<h3 style="text-align:center; margin-bottom:8px;">🪙 Buy Ghost Coins</h3>'
    + '<p style="text-align:center; color:var(--text2); font-size:0.85rem; margin-bottom:20px;">Use coins to create health dare challenges. 20% fee per challenge goes to the Reaper.</p>'
    + '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">' + packsHtml + '</div>'
    + '<p style="text-align:center; color:var(--text3); font-size:0.75rem; margin-bottom:16px;">After payment, return to this page and click "Verify Purchase" to credit your coins.</p>'
    + '<div style="display:flex; gap:8px;">'
    + '<button class="btn-secondary" onclick="document.getElementById(\'buyCoinsModal\').remove()" style="flex:1;">Cancel</button>'
    + '<button class="btn-green btn-sm" onclick="verifyPurchase()" style="flex:1;">Verify Purchase</button>'
    + '</div></div>';

  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

function buyCoins(url, coins) {
  localStorage.setItem('dc_pending_coins', coins);
  window.open(url, '_blank');
}

async function verifyPurchase() {
  const pending = localStorage.getItem('dc_pending_coins');
  if (!pending) { showToast('No pending purchase found'); return; }

  const coins = parseInt(pending);
  const user = await getSocialSession();
  if (!user) { showToast('Sign in first!'); return; }

  await ensureCoinRow();
  const { data: current } = await socialClient.from('dc_ghost_coins')
    .select('balance, total_purchased').eq('user_id', user.id).single();

  const newBal = (current?.balance || 0) + coins;
  await socialClient.from('dc_ghost_coins').update({
    balance: newBal,
    total_purchased: (current?.total_purchased || 0) + coins,
    updated_at: new Date().toISOString()
  }).eq('user_id', user.id);

  // Log purchase
  await socialClient.from('dc_coin_purchases').insert({
    user_id: user.id,
    coins: coins,
    amount_paid_cents: COIN_PACKS.find(p => p.coins === coins)?.price ? parseInt(COIN_PACKS.find(p => p.coins === coins).price.replace(/[^0-9]/g, '')) : 0
  });

  localStorage.removeItem('dc_pending_coins');
  updateCoinDisplay(newBal);
  showToast('🪙 ' + coins + ' Ghost Coins added! Balance: ' + newBal);

  const modal = document.getElementById('buyCoinsModal');
  if (modal) modal.remove();
}

// ===== CREATE CHALLENGE =====

function showCreateChallengeModal(targetId, targetName) {
  const old = document.getElementById('challengeModal');
  if (old) old.remove();

  // Random dare suggestions
  const suggestions = [];
  const shuffled = [...DARE_TEMPLATES].sort(() => Math.random() - 0.5);
  for (let i = 0; i < 4; i++) suggestions.push(shuffled[i]);

  let suggestHtml = '';
  suggestions.forEach(s => {
    const diffColor = s.difficulty === 'easy' ? 'var(--green)' : (s.difficulty === 'hard' ? 'var(--accent)' : 'var(--gold)');
    suggestHtml += '<button onclick="document.getElementById(\'challengeDareText\').value=\'' + s.text + '\'" '
      + 'style="display:block; width:100%; text-align:left; padding:8px 12px; background:var(--bg); border:1px solid var(--border); border-radius:8px; color:var(--text); font-size:0.85rem; cursor:pointer; margin-bottom:6px; transition:border-color 0.2s;" '
      + 'onmouseover="this.style.borderColor=\'var(--gold)\'" onmouseout="this.style.borderColor=\'var(--border)\'">'
      + s.text + ' <span style="color:' + diffColor + '; font-size:0.7rem; font-weight:700;">' + s.difficulty.toUpperCase() + '</span></button>';
  });

  const overlay = document.createElement('div');
  overlay.id = 'challengeModal';
  overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:2000; display:flex; align-items:center; justify-content:center; animation:fadeIn 0.3s;';

  overlay.innerHTML = '<div style="background:var(--bg2); border:1px solid var(--border); border-radius:16px; padding:32px; max-width:480px; width:90%; max-height:85vh; overflow-y:auto;">'
    + '<h3 style="margin-bottom:4px;">⚔️ Challenge ' + escHtml(targetName) + '</h3>'
    + '<p style="color:var(--text2); font-size:0.85rem; margin-bottom:16px;">Dare them to do something healthy. Bet Ghost Coins on it!</p>'
    // Dare text
    + '<label style="font-size:0.8rem; color:var(--text3); display:block; margin-bottom:4px;">The Dare:</label>'
    + '<input type="text" id="challengeDareText" placeholder="e.g. Do 100 pushups today" maxlength="200" class="username-input" style="margin-bottom:12px;">'
    // Suggestions
    + '<div style="margin-bottom:16px;">'
    + '<p style="font-size:0.75rem; color:var(--text3); margin-bottom:6px;">Or pick a dare:</p>'
    + suggestHtml
    + '</div>'
    // Bet amount
    + '<label style="font-size:0.8rem; color:var(--text3); display:block; margin-bottom:4px;">Bet Amount (Ghost Coins):</label>'
    + '<div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">'
    + '<input type="number" id="challengeBetAmount" min="1" max="100" value="5" style="width:80px; padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg); color:var(--text); font-size:1.1rem; text-align:center;">'
    + '<span style="color:var(--text2); font-size:0.85rem;">🪙</span>'
    + '</div>'
    + '<div id="challengeFeeInfo" style="font-size:0.8rem; color:var(--text3); margin-bottom:16px;">Fee: 1 🪙 (20%) | Total cost: 6 🪙</div>'
    // Duration
    + '<label style="font-size:0.8rem; color:var(--text3); display:block; margin-bottom:4px;">Time Limit:</label>'
    + '<select id="challengeDuration" style="padding:10px; border-radius:8px; border:1px solid var(--border); background:var(--bg); color:var(--text); font-size:0.9rem; width:100%; margin-bottom:16px;">'
    + '<option value="24">24 hours</option>'
    + '<option value="48" selected>48 hours</option>'
    + '<option value="72">72 hours</option>'
    + '<option value="168">1 week</option>'
    + '</select>'
    // Balance
    + '<div style="background:var(--surface); padding:12px; border-radius:8px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">'
    + '<span style="color:var(--text2); font-size:0.85rem;">Your balance:</span>'
    + '<span style="font-weight:700; color:var(--gold); font-size:1.1rem;" id="challengeBalance">-- 🪙</span>'
    + '</div>'
    // Buttons
    + '<div style="display:flex; gap:8px;">'
    + '<button class="btn-secondary" onclick="document.getElementById(\'challengeModal\').remove()" style="flex:1;">Cancel</button>'
    + '<button class="btn-primary" onclick="submitChallenge(\'' + targetId + '\', \'' + escHtml(targetName) + '\')" style="flex:1;">⚔️ Send Challenge</button>'
    + '</div>'
    + '<p style="text-align:center; margin-top:12px;"><a href="#" onclick="showBuyCoinsModal(); return false;" style="color:var(--gold); font-size:0.85rem;">Need more coins? Buy here</a></p>'
    + '</div>';

  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  // Load balance
  getMyCoins().then(bal => {
    const el = document.getElementById('challengeBalance');
    if (el) el.textContent = bal + ' 🪙';
  });

  // Fee calculator
  const betInput = document.getElementById('challengeBetAmount');
  if (betInput) {
    betInput.addEventListener('input', () => {
      const bet = parseInt(betInput.value) || 0;
      const fee = Math.max(1, Math.ceil(bet * CHALLENGE_FEE_RATE));
      const total = bet + fee;
      const feeEl = document.getElementById('challengeFeeInfo');
      if (feeEl) feeEl.textContent = 'Fee: ' + fee + ' 🪙 (20%) | Total cost: ' + total + ' 🪙';
    });
  }
}

async function submitChallenge(targetId, targetName) {
  const dareText = document.getElementById('challengeDareText')?.value?.trim();
  const betAmount = parseInt(document.getElementById('challengeBetAmount')?.value) || 0;
  const duration = parseInt(document.getElementById('challengeDuration')?.value) || 48;

  if (!dareText) { showToast('Write a dare first!'); return; }
  if (betAmount < 1) { showToast('Minimum bet is 1 coin'); return; }
  if (betAmount > 100) { showToast('Maximum bet is 100 coins'); return; }

  const fee = Math.max(1, Math.ceil(betAmount * CHALLENGE_FEE_RATE));
  const totalCost = betAmount + fee;

  const user = await getSocialSession();
  if (!user || !state.currentGroup) { showToast('Sign in and join a group!'); return; }

  // Check balance
  const balance = await getMyCoins();
  if (balance < totalCost) {
    showToast('Not enough coins! Need ' + totalCost + ' 🪙 (have ' + balance + ')');
    return;
  }

  // Deduct coins (bet + fee)
  await ensureCoinRow();
  const { data: current } = await socialClient.from('dc_ghost_coins')
    .select('balance, total_lost, total_fees_paid').eq('user_id', user.id).single();
  await socialClient.from('dc_ghost_coins').update({
    balance: (current?.balance || 0) - totalCost,
    total_lost: (current?.total_lost || 0) + betAmount,
    total_fees_paid: (current?.total_fees_paid || 0) + fee,
    updated_at: new Date().toISOString()
  }).eq('user_id', user.id);

  // Create challenge
  const expiresAt = new Date(Date.now() + duration * 3600000).toISOString();
  const { error } = await socialClient.from('dc_challenges').insert({
    group_id: state.currentGroup.id,
    challenger_id: user.id,
    challenged_id: targetId,
    dare_text: dareText,
    bet_amount: betAmount,
    fee_amount: fee,
    status: 'pending',
    expires_at: expiresAt
  });

  if (error) {
    showToast('Error: ' + error.message);
    // Refund on failure
    await socialClient.from('dc_ghost_coins').update({
      balance: current?.balance || 0,
      total_lost: current?.total_lost || 0,
      total_fees_paid: current?.total_fees_paid || 0
    }).eq('user_id', user.id);
    return;
  }

  document.getElementById('challengeModal')?.remove();
  showToast('⚔️ Challenge sent to ' + targetName + '! Bet: ' + betAmount + ' 🪙');
  updateCoinDisplay((current?.balance || 0) - totalCost);
  loadChallenges();
}

// ===== ACCEPT / REJECT CHALLENGE =====

async function acceptChallenge(challengeId) {
  const user = await getSocialSession();
  if (!user) return;

  // Get challenge details
  const { data: ch } = await socialClient.from('dc_challenges').select('*').eq('id', challengeId).single();
  if (!ch || ch.status !== 'pending') { showToast('Challenge no longer available'); return; }
  if (ch.challenged_id !== user.id) { showToast('This challenge is not for you'); return; }

  // Check if expired
  if (new Date(ch.expires_at) < new Date()) {
    await socialClient.from('dc_challenges').update({ status: 'expired' }).eq('id', challengeId);
    showToast('Challenge expired!');
    loadChallenges();
    return;
  }

  // Deduct coins from accepter (match the bet, no extra fee)
  const balance = await getMyCoins();
  if (balance < ch.bet_amount) {
    showToast('Not enough coins! Need ' + ch.bet_amount + ' 🪙 (have ' + balance + ')');
    return;
  }

  await ensureCoinRow();
  const { data: current } = await socialClient.from('dc_ghost_coins')
    .select('balance, total_lost').eq('user_id', user.id).single();
  await socialClient.from('dc_ghost_coins').update({
    balance: (current?.balance || 0) - ch.bet_amount,
    total_lost: (current?.total_lost || 0) + ch.bet_amount,
    updated_at: new Date().toISOString()
  }).eq('user_id', user.id);

  // Update challenge status
  await socialClient.from('dc_challenges').update({ status: 'accepted' }).eq('id', challengeId);
  updateCoinDisplay((current?.balance || 0) - ch.bet_amount);
  showToast('✅ Challenge accepted! Get it done before the deadline.');
  loadChallenges();
}

async function rejectChallenge(challengeId) {
  const user = await getSocialSession();
  if (!user) return;

  const { data: ch } = await socialClient.from('dc_challenges').select('*').eq('id', challengeId).single();
  if (!ch || ch.challenged_id !== user.id) return;

  // Refund challenger (bet only, fee stays)
  const { data: challengerCoins } = await socialClient.from('dc_ghost_coins')
    .select('balance').eq('user_id', ch.challenger_id).single();
  await socialClient.from('dc_ghost_coins').update({
    balance: (challengerCoins?.balance || 0) + ch.bet_amount,
    updated_at: new Date().toISOString()
  }).eq('user_id', ch.challenger_id);

  await socialClient.from('dc_challenges').update({ status: 'rejected' }).eq('id', challengeId);
  showToast('Challenge rejected. Bet refunded (fee kept by the Reaper 💀)');
  loadChallenges();
}

// ===== COMPLETE / JUDGE =====

async function submitProof(challengeId, isChallenger) {
  const proofText = prompt('Describe how you completed the dare (honour system):');
  if (!proofText) return;

  const field = isChallenger ? 'challenger_proof' : 'challenged_proof';
  await socialClient.from('dc_challenges').update({ [field]: proofText }).eq('id', challengeId);
  showToast('✅ Proof submitted!');
  loadChallenges();
}

async function judgeChallenge(challengeId, winnerId) {
  const { data: ch } = await socialClient.from('dc_challenges').select('*').eq('id', challengeId).single();
  if (!ch || ch.status !== 'accepted') return;

  // Only participants can judge
  const user = await getSocialSession();
  if (!user) return;
  if (user.id !== ch.challenger_id && user.id !== ch.challenged_id) return;

  // Winner gets both bets (pot = bet * 2)
  const pot = ch.bet_amount * 2;
  const { data: winnerCoins } = await socialClient.from('dc_ghost_coins')
    .select('balance, total_won').eq('user_id', winnerId).single();
  await socialClient.from('dc_ghost_coins').update({
    balance: (winnerCoins?.balance || 0) + pot,
    total_won: (winnerCoins?.total_won || 0) + pot,
    updated_at: new Date().toISOString()
  }).eq('user_id', winnerId);

  await socialClient.from('dc_challenges').update({
    status: 'judged',
    winner_id: winnerId,
    judged_at: new Date().toISOString()
  }).eq('id', challengeId);

  showToast('🏆 Challenge judged! Winner gets ' + pot + ' 🪙');
  loadChallenges();
}

// ===== RENDER CHALLENGES =====

async function loadChallenges() {
  const container = document.getElementById('challengesList');
  if (!container || !state.currentGroup) return;

  const { data: challenges } = await socialClient.from('dc_challenges')
    .select('*').eq('group_id', state.currentGroup.id)
    .order('created_at', { ascending: false }).limit(20);

  if (!challenges || !challenges.length) {
    container.innerHTML = '<p style="color:var(--text3); font-style:italic; text-align:center; padding:20px;">No challenges yet. Click a ghost and dare them!</p>';
    return;
  }

  // Fetch profiles
  const allIds = [...new Set(challenges.flatMap(c => [c.challenger_id, c.challenged_id, c.winner_id].filter(Boolean)))];
  const { data: profiles } = await socialClient.from('dc_profiles')
    .select('id, display_name, username, ghost_color').in('id', allIds);
  const pm = {};
  (profiles || []).forEach(p => pm[p.id] = p);
  const getName = id => pm[id]?.display_name || pm[id]?.username || 'Ghost';
  const getColor = id => pm[id]?.ghost_color || '#00ff88';

  const user = await getSocialSession();
  const myId = user?.id;

  let html = '';
  challenges.forEach(ch => {
    const isExpired = new Date(ch.expires_at) < new Date();
    const challenger = getName(ch.challenger_id);
    const challenged = getName(ch.challenged_id);
    const timeLeft = isExpired ? 'Expired' : getTimeRemaining(ch.expires_at);
    const isMyChallenge = ch.challenger_id === myId;
    const isChallengedToMe = ch.challenged_id === myId;

    let statusBadge, statusColor, actions = '';
    switch (ch.status) {
      case 'pending':
        statusBadge = '⏳ Pending';
        statusColor = 'var(--gold)';
        if (isChallengedToMe && !isExpired) {
          actions = '<div style="display:flex; gap:6px; margin-top:8px;">'
            + '<button class="btn-green btn-sm" onclick="acceptChallenge(\'' + ch.id + '\')">Accept (' + ch.bet_amount + '🪙)</button>'
            + '<button class="btn-secondary btn-sm" onclick="rejectChallenge(\'' + ch.id + '\')">Reject</button></div>';
        }
        break;
      case 'accepted':
        statusBadge = '⚔️ Active';
        statusColor = 'var(--green)';
        if (isMyChallenge && !ch.challenger_proof) {
          actions += '<button class="btn-secondary btn-sm" onclick="submitProof(\'' + ch.id + '\', true)" style="margin-top:8px;">Submit My Proof</button> ';
        }
        if (isChallengedToMe && !ch.challenged_proof) {
          actions += '<button class="btn-secondary btn-sm" onclick="submitProof(\'' + ch.id + '\', false)" style="margin-top:8px;">Submit My Proof</button> ';
        }
        if ((isMyChallenge || isChallengedToMe) && ch.challenger_proof && ch.challenged_proof) {
          actions += '<div style="margin-top:8px; display:flex; gap:6px;">'
            + '<button class="btn-primary btn-sm" onclick="judgeChallenge(\'' + ch.id + '\', \'' + ch.challenger_id + '\')">' + escHtml(challenger) + ' wins</button>'
            + '<button class="btn-primary btn-sm" onclick="judgeChallenge(\'' + ch.id + '\', \'' + ch.challenged_id + '\')">' + escHtml(challenged) + ' wins</button></div>';
        }
        break;
      case 'rejected':
        statusBadge = '❌ Rejected';
        statusColor = 'var(--accent)';
        break;
      case 'judged':
        statusBadge = '🏆 ' + getName(ch.winner_id) + ' won!';
        statusColor = 'var(--gold)';
        break;
      case 'expired':
        statusBadge = '💀 Expired';
        statusColor = 'var(--text3)';
        break;
      default:
        statusBadge = ch.status;
        statusColor = 'var(--text3)';
    }

    html += '<div style="background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:10px;">'
      + '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">'
      + '<div>'
      + '<span style="color:' + getColor(ch.challenger_id) + '; font-weight:700;">' + escHtml(challenger) + '</span>'
      + ' <span style="color:var(--text3);">vs</span> '
      + '<span style="color:' + getColor(ch.challenged_id) + '; font-weight:700;">' + escHtml(challenged) + '</span>'
      + '</div>'
      + '<span style="font-size:0.8rem; color:' + statusColor + '; font-weight:700;">' + statusBadge + '</span>'
      + '</div>'
      + '<div style="font-size:1rem; margin-bottom:8px; color:var(--text);">📋 ' + escHtml(ch.dare_text) + '</div>'
      + '<div style="display:flex; gap:16px; font-size:0.8rem; color:var(--text3);">'
      + '<span>🪙 ' + ch.bet_amount + ' each</span>'
      + '<span>🏆 ' + (ch.bet_amount * 2) + ' pot</span>'
      + '<span>⏰ ' + timeLeft + '</span>'
      + '</div>'
      + (ch.challenger_proof ? '<div style="margin-top:6px; font-size:0.8rem; color:var(--green);">✅ ' + escHtml(challenger) + ': "' + escHtml(ch.challenger_proof) + '"</div>' : '')
      + (ch.challenged_proof ? '<div style="margin-top:4px; font-size:0.8rem; color:var(--green);">✅ ' + escHtml(challenged) + ': "' + escHtml(ch.challenged_proof) + '"</div>' : '')
      + actions
      + '</div>';
  });

  container.innerHTML = html;
}

function getTimeRemaining(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return hrs + 'h left';
  return Math.floor(hrs / 24) + 'd ' + (hrs % 24) + 'h left';
}
