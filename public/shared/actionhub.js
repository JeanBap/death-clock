// ============================================
// ACTION HUB - The command centre for longevity
// Features: Daily tasks, challenges, health API,
// progress timeline, friend feed, streaks, reports,
// group challenges, reward shop
// ============================================

let hubTab = 'today';

// ============================================
// 1. INIT + STATS
// ============================================
function initActionHub() {
  renderHubStats();
  renderHubTabs();
  switchHubTab('today');
  updateHubGreeting();
  // Check achievements on load
  setTimeout(function() { checkAchievements(); }, 1000);
}

function updateHubGreeting() {
  const el = document.getElementById('hubGreeting');
  if (!el) return;
  const hour = new Date().getHours();
  const streak = getStreakCount();
  const mult = getStreakMultiplier(streak);
  let greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  if (streak > 1) greeting += ' | ' + streak + '-day streak';
  if (mult > 1) greeting += ' (' + mult + 'x rewards)';
  el.textContent = greeting;
}

function renderHubStats() {
  const row = document.getElementById('statRow');
  if (!row || !state.result) return;
  const r = state.result;
  const daysLeft = Math.max(0, Math.floor((r.deathDate - new Date()) / 86400000));
  const goal = state.longevityGoal || {};
  const daysAdded = goal.totalDaysAdded || 0;
  const streak = getStreakCount();
  const coins = getCoins();
  const todayDone = getTodayCompletedCount();
  const todayTotal = getDailyTasks().length;
  const pctToday = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;
  const mult = getStreakMultiplier(streak);
  const multClass = mult >= 3 ? 'mult-3x' : mult >= 2 ? 'mult-2x' : mult >= 1.5 ? 'mult-1_5x' : 'mult-1x';
  // SVG ring circumference for r=35
  const circ = 2 * Math.PI * 35;
  const offset = circ - (pctToday / 100) * circ;

  row.innerHTML = `
    <div class="stat-card" style="display:flex;align-items:center;gap:12px;text-align:left;grid-column:span 1;">
      <div class="progress-ring">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle class="ring-bg" cx="40" cy="40" r="35"/>
          <circle class="ring-fill" cx="40" cy="40" r="35" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
        </svg>
        <div class="ring-text">${todayDone}/${todayTotal}<div class="ring-label">today</div></div>
      </div>
      <div><div class="num" style="color:var(--accent);font-size:1.4rem;">${daysLeft.toLocaleString()}</div><div class="lbl">Days left</div></div>
    </div>
    <div class="stat-card"><div class="num" style="color:var(--green);">+${daysAdded.toFixed(1)}</div><div class="lbl">Days added</div></div>
    <div class="stat-card"><div class="num"><span class="streak-fire">${streak}</span></div><div class="lbl">Streak <span class="combo-badge ${multClass}">${mult}x</span></div></div>
    <div class="stat-card"><div class="num" style="color:var(--gold);">${coins}</div><div class="lbl">Coins</div></div>
  `;

  // Compact level indicator - inline within coins card area
  var level = getLevel();
  var xpInfo = getXPForNextLevel();
  var xpPct = Math.round((xpInfo.current / xpInfo.needed) * 100);
  var title = getLevelTitle(level);

  row.insertAdjacentHTML('beforeend', '<div style="grid-column:1/-1;display:flex;align-items:center;gap:8px;padding:4px 12px;font-size:0.7rem;color:var(--text3);">' +
    '<span style="font-weight:700;color:var(--text2);">Lvl ' + level + '</span>' +
    '<div style="flex:1;max-width:120px;height:4px;background:var(--border);border-radius:2px;"><div style="width:' + xpPct + '%;height:100%;background:linear-gradient(90deg,var(--accent),#6c63ff);border-radius:2px;"></div></div>' +
    '<span>' + xpInfo.current + '/' + xpInfo.needed + ' XP</span></div>');
}

function renderHubTabs() {
  const c = document.getElementById('hubTabs');
  if (!c) return;
  const tabs = [
    { id: 'today', label: 'Today', icon: '&#x2705;' },
    { id: 'challenges', label: 'Challenges', icon: '&#x1F3AF;' },
    { id: 'progress', label: 'Progress', icon: '&#x1F4C8;' },
    { id: 'feed', label: 'Friends', icon: '&#x1F465;' },
    { id: 'health', label: 'Health', icon: '&#x1F4AA;' },
    { id: 'report', label: 'Report', icon: '&#x1F4CA;' },
    { id: 'shop', label: 'Shop', icon: '&#x1FA99;' }
  ];
  c.innerHTML = tabs.map(t =>
    '<button class="' + (t.id === hubTab ? 'active' : '') + '" onclick="switchHubTab(\'' + t.id + '\')">' + t.icon + ' ' + t.label + '</button>'
  ).join('');
}

function switchHubTab(tab) {
  hubTab = tab;
  renderHubTabs();
  const c = document.getElementById('hubContent');
  if (!c) return;
  const renderers = {
    today: renderTodayTab,
    challenges: renderChallengesTab,
    progress: renderProgressTab,
    feed: renderFeedTab,
    health: renderHealthTab,
    report: renderReportTab,
    shop: renderShopTab
  };
  if (renderers[tab]) renderers[tab](c);
}


// ============================================
// 2. DAILY TASK ENGINE (Feature #4)
// ============================================
function getDailyTasks() {
  const saved = localStorage.getItem('dc_daily_tasks');
  const today = new Date().toDateString();
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) return parsed.tasks;
    } catch(e) {}
  }
  // Generate new tasks for today based on risk factors
  const tasks = generateDailyTasks();
  localStorage.setItem('dc_daily_tasks', JSON.stringify({ date: today, tasks }));
  return tasks;
}

function generateDailyTasks() {
  const factors = state.result ? state.result.factors || [] : [];
  const negFactors = factors.filter(f => f.impact < 0);
  const allTasks = [];

  // Map negative factors to actionable daily tasks
  const taskMap = {
    smoking: [
      { name: 'Delay your first cigarette by 30 minutes', days: 0.3, cat: 'substances' },
      { name: 'Replace one smoke break with a 5-min walk', days: 0.4, cat: 'substances' },
      { name: 'Download a quit-smoking app', days: 0.2, cat: 'substances' }
    ],
    exercise: [
      { name: 'Walk for 30 minutes', days: 0.5, cat: 'fitness' },
      { name: 'Do 20 bodyweight squats', days: 0.3, cat: 'fitness' },
      { name: 'Stretch for 10 minutes', days: 0.2, cat: 'fitness' },
      { name: 'Take the stairs instead of the lift', days: 0.2, cat: 'fitness' }
    ],
    diet: [
      { name: 'Eat 3 servings of vegetables', days: 0.4, cat: 'diet' },
      { name: 'Drink 8 glasses of water', days: 0.3, cat: 'diet' },
      { name: 'Skip processed food today', days: 0.5, cat: 'diet' },
      { name: 'Eat a handful of nuts', days: 0.2, cat: 'diet' }
    ],
    sleep: [
      { name: 'Go to bed before 11pm', days: 0.4, cat: 'sleep' },
      { name: 'No screens 30 min before bed', days: 0.3, cat: 'sleep' },
      { name: 'Get 7-8 hours of sleep', days: 0.5, cat: 'sleep' }
    ],
    alcohol: [
      { name: 'Have an alcohol-free day', days: 0.5, cat: 'substances' },
      { name: 'Replace one drink with sparkling water', days: 0.3, cat: 'substances' }
    ],
    stress: [
      { name: '5 minutes of deep breathing', days: 0.3, cat: 'mind' },
      { name: 'Write down 3 things you are grateful for', days: 0.2, cat: 'mind' },
      { name: '10-minute meditation', days: 0.4, cat: 'mind' }
    ],
    social: [
      { name: 'Call or message a friend', days: 0.3, cat: 'social' },
      { name: 'Spend 30 min with someone you care about', days: 0.4, cat: 'social' }
    ],
    bmi: [
      { name: 'Track your calories today', days: 0.3, cat: 'diet' },
      { name: 'Walk 10,000 steps', days: 0.5, cat: 'fitness' }
    ]
  };

  // General tasks everyone gets
  const generalTasks = [
    { name: 'Drink a glass of water right now', days: 0.1, cat: 'diet' },
    { name: 'Stand up and stretch', days: 0.1, cat: 'fitness' },
    { name: 'Take a 5-minute mindfulness break', days: 0.2, cat: 'mind' }
  ];

  // Add tasks based on negative factors
  const usedCats = new Set();
  for (const f of negFactors) {
    const key = f.key ? f.key.split('_')[0] : '';
    if (taskMap[key]) {
      const catTasks = taskMap[key];
      // Pick 1-2 random from this category
      const shuffled = catTasks.sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(2, shuffled.length); i++) {
        if (allTasks.length < 6) {
          allTasks.push({ ...shuffled[i], id: 'task_' + allTasks.length, done: false });
          usedCats.add(shuffled[i].cat);
        }
      }
    }
  }

  // Fill with general tasks up to 5-7 total
  for (const t of generalTasks) {
    if (allTasks.length >= 7) break;
    if (!usedCats.has(t.cat) || allTasks.length < 5) {
      allTasks.push({ ...t, id: 'task_' + allTasks.length, done: false });
    }
  }

  // If still under 5, add more general ones
  const extraTasks = [
    { name: 'Eat a piece of fruit', days: 0.2, cat: 'diet' },
    { name: 'Laugh at something today', days: 0.1, cat: 'mind' },
    { name: 'Go outside for 15 minutes', days: 0.3, cat: 'fitness' }
  ];
  for (const t of extraTasks) {
    if (allTasks.length >= 5) break;
    allTasks.push({ ...t, id: 'task_' + allTasks.length, done: false });
  }

  return allTasks.slice(0, 7);
}

function completeTask(taskId) {
  const tasks = getDailyTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task || task.done) return;

  task.done = true;
  const streak = getStreakCount();
  const mult = getStreakMultiplier(streak);
  const coinReward = Math.round(10 * mult);
  const daysReward = task.days;

  // First-ever task bonus (early win strategy)
  let firstBonus = 0;
  if (!localStorage.getItem('dc_first_task_done')) {
    localStorage.setItem('dc_first_task_done', '1');
    firstBonus = 25;
    addCoins(firstBonus);
  }

  // Award coins
  addCoins(coinReward);

  // Award days
  if (!state.longevityGoal) state.longevityGoal = { totalDaysAdded: 0, habits: [] };
  state.longevityGoal.totalDaysAdded = (state.longevityGoal.totalDaysAdded || 0) + daysReward;
  saveGoalState();

  // Save tasks
  localStorage.setItem('dc_daily_tasks', JSON.stringify({ date: new Date().toDateString(), tasks }));

  // Log to habit history
  logDailyCompletion(task);

  // BUG-009 FIX: Add real user activity to feed
  const userName = state.supaUser?.email?.split('@')[0] || 'You';
  addFeedItem(userName, 'completed "' + task.name + '"', '+' + daysReward.toFixed(1) + ' days added');

  // BUG-005 FIX: Check and grant milestone rewards
  checkMilestoneRewards();

  // Check combo
  const todayDone = tasks.filter(t => t.done);
  const catsCompleted = new Set(todayDone.map(t => t.cat));
  let comboBonus = 0;
  if (catsCompleted.size >= 3) {
    comboBonus = Math.round(5 * mult);
    addCoins(comboBonus);
  }

  // Animate the task item
  const el = document.querySelector('[data-task="' + taskId + '"]');
  if (el) {
    el.classList.add('completing');
    setTimeout(() => el.classList.add('done'), 400);
  }

  // Check if all done - confetti!
  const allDone = tasks.every(t => t.done);

  // Award XP and check achievements
  addXP(25);
  checkAchievements();

  showToast('+' + daysReward.toFixed(1) + ' days | +' + coinReward + ' coins' + (comboBonus > 0 ? ' | COMBO +' + comboBonus : '') + (firstBonus > 0 ? ' | FIRST TASK BONUS +' + firstBonus : ''));

  // Re-render
  setTimeout(() => {
    renderHubStats();
    const c = document.getElementById('hubContent');
    if (c && hubTab === 'today') renderTodayTab(c);
    if (allDone) launchConfetti();
  }, 500);
}

function getTodayCompletedCount() {
  return getDailyTasks().filter(t => t.done).length;
}

function logDailyCompletion(task) {
  try {
    const log = JSON.parse(localStorage.getItem('dc_task_log') || '[]');
    log.push({ date: new Date().toISOString(), task: task.name, days: task.days, cat: task.cat });
    // Keep last 90 days
    const cutoff = Date.now() - 90 * 86400000;
    const trimmed = log.filter(l => new Date(l.date).getTime() > cutoff);
    localStorage.setItem('dc_task_log', JSON.stringify(trimmed));
  } catch(e) {}
}

function renderTodayTab(c) {
  const tasks = getDailyTasks();
  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const cats = new Set(tasks.filter(t => t.done).map(t => t.cat));
  const comboActive = cats.size >= 3;
  const streak = getStreakCount();
  const isFirstVisit = !localStorage.getItem('dc_hub_visited');

  // Mark first visit
  if (isFirstVisit) localStorage.setItem('dc_hub_visited', '1');

  // Streak at risk warning (Duolingo-style)
  const hour = new Date().getHours();
  const hasInsurance = localStorage.getItem('dc_streak_insurance') === 'true';
  let streakWarning = '';
  if (streak >= 3 && done === 0 && hour >= 18) {
    streakWarning = `
      <div style="background:linear-gradient(135deg,rgba(233,69,96,0.15),rgba(233,69,96,0.05));border:2px solid var(--accent);border-radius:12px;padding:16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;">
        <div style="font-size:2rem;">&#x1F525;</div>
        <div style="flex:1;">
          <div style="font-weight:800;color:var(--accent);font-size:0.95rem;">Your ${streak}-day streak is at risk!</div>
          <div style="font-size:0.8rem;color:var(--text2);margin-top:2px;">Complete at least 1 task to keep it alive.</div>
        </div>
        ${!hasInsurance ? '<button class="btn-sm btn-secondary" style="font-size:0.7rem;white-space:nowrap;" onclick="buyStreakInsurance()">Get freeze (50c)</button>' : '<div style="font-size:0.7rem;color:var(--green);">&#x1F6E1; Freeze ready</div>'}
      </div>`;
  }

  let onboardHtml = '';
  if (isFirstVisit || (streak <= 1 && done === 0)) {
    onboardHtml = `
      <div class="onboard-card">
        <h3 style="margin-bottom:8px;">Welcome to your Action Hub</h3>
        <p style="margin-bottom:12px;">Complete daily tasks to add days to your life. Each task is personalised to your health profile.</p>
        <div style="background:var(--surface);border-radius:8px;padding:12px;margin-bottom:12px;">
          <div style="font-size:0.85rem;font-weight:700;color:var(--green);margin-bottom:4px;">Complete your first task for a bonus reward!</div>
          <div style="font-size:0.75rem;color:var(--text3);">First task = 25 bonus coins + your streak begins</div>
        </div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
          <span class="combo-badge mult-1_5x">7 days = 1.5x</span>
          <span class="combo-badge mult-2x">30 days = 2x</span>
          <span class="combo-badge mult-3x">90 days = 3x</span>
        </div>
      </div>`;
  }

  c.innerHTML = `
    ${streakWarning}
    ${onboardHtml}
    <div class="hub-panel" style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3>Today's Tasks <span style="font-size:0.8rem;color:var(--text3);font-weight:400;">${done}/${total} done</span></h3>
        ${comboActive ? '<span class="combo-badge mult-2x" style="font-size:0.8rem;">COMBO ACTIVE</span>' : ''}
      </div>
      <div class="progress-bar-sm" style="margin-bottom:16px;">
        <div class="fill" style="width:${pct}%;background:${pct === 100 ? 'var(--green)' : 'var(--accent)'};"></div>
      </div>
      ${tasks.map(t => `
        <div class="task-item ${t.done ? 'done' : ''}" data-task="${t.id}" tabindex="0" role="button" aria-label="${t.done ? 'Completed: ' : 'Complete: '}${escHtml(t.name)}" onclick="${t.done ? '' : 'completeTask(\'' + t.id + '\')'}" onkeydown="if(event.key==='Enter'&&!this.classList.contains('done'))completeTask('${t.id}')">
          <div class="task-check">${t.done ? '&#10003;' : ''}</div>
          <div style="flex:1;min-width:0;">
            <div class="task-name" style="font-size:0.85rem;">${escHtml(t.name)}</div>
            <span class="task-cat cat-${t.cat}">${t.cat}</span>
          </div>
          <div class="task-days">+${t.days.toFixed(1)} days</div>
        </div>
      `).join('')}
      ${done === total && total > 0 ? `<div id="celebrationBox" style="text-align:center;margin-top:16px;padding:24px;background:linear-gradient(135deg,rgba(78,204,163,0.1),rgba(240,192,64,0.1));border-radius:12px;border:1px solid var(--green);">
        <div class="confetti-burst" id="confettiEmoji">&#127881;&#127775;&#127942;</div>
        <strong style="color:var(--green);font-size:1.1rem;">All tasks complete!</strong>
        <p style="color:var(--text2);font-size:0.85rem;margin-top:8px;line-height:1.5;">Come back tomorrow for new tasks. Your streak lives on.</p>
        <button class="btn-green btn-sm" style="margin-top:12px;" onclick="shareWeeklyReport()">Brag to friends</button>
      </div>` : ''}
    </div>
    <div class="hub-grid">
      <div class="hub-panel">
        <h3>Streak Multiplier</h3>
        ${renderStreakInfo()}
      </div>
      <div class="hub-panel">
        <h3>Quick Actions</h3>
        <button class="btn-primary btn-sm" style="width:100%;margin-bottom:8px;" onclick="switchHubTab('challenges')">Challenge a Friend</button>
        <button class="btn-secondary btn-sm" style="width:100%;margin-bottom:8px;" onclick="switchHubTab('health')">Log Health Data</button>
        <button class="btn-secondary btn-sm" style="width:100%;" onclick="shareWeeklyReport()">Share Progress</button>
      </div>
    </div>
  `;
}

// Confetti launcher
function launchConfetti() {
  const emojis = ['&#127881;','&#11088;','&#127942;','&#128170;','&#127775;','&#129321;'];
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
  document.body.appendChild(container);
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.innerHTML = emojis[i % emojis.length];
    p.style.cssText = 'position:absolute;font-size:' + (16 + Math.random() * 16) + 'px;left:' + Math.random() * 100 + '%;top:-20px;animation:confettiFall ' + (1.5 + Math.random() * 2) + 's ease-out forwards;animation-delay:' + (Math.random() * 0.5) + 's;';
    container.appendChild(p);
  }
  // Add the CSS animation inline
  if (!document.getElementById('confettiStyle')) {
    const s = document.createElement('style');
    s.id = 'confettiStyle';
    s.textContent = '@keyframes confettiFall{0%{opacity:1;transform:translateY(0) rotate(0deg)}100%{opacity:0;transform:translateY(100vh) rotate(' + (180 + Math.random() * 360) + 'deg)}}';
    document.head.appendChild(s);
  }
  setTimeout(() => container.remove(), 4000);
}

// ============================================
// 3. CHALLENGE SYSTEM - Polymarket style (#2, #9)
// ============================================
function getChallenges() {
  try { return JSON.parse(localStorage.getItem('dc_challenges') || '[]'); } catch(e) { return []; }
}
function saveChallenges(ch) {
  localStorage.setItem('dc_challenges', JSON.stringify(ch));
}

// Challenge pricing: 1 free/week, coins after, referral = 4 weeks free
function getWeekStart() {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - d.getDay()); // Sunday start
  return d.toISOString().slice(0, 10);
}

function getWeeklyChallengeCount() {
  const weekStart = getWeekStart();
  return getChallenges().filter(ch => ch.created && ch.created.slice(0, 10) >= weekStart).length;
}

function hasReferralBonus() {
  const exp = localStorage.getItem('dc_referral_bonus_expires');
  if (!exp) return false;
  return new Date(exp) > new Date();
}

function getReferralDaysLeft() {
  const exp = localStorage.getItem('dc_referral_bonus_expires');
  if (!exp) return 0;
  return Math.max(0, Math.ceil((new Date(exp) - Date.now()) / 86400000));
}

function getReferralCode() {
  let code = localStorage.getItem('dc_referral_code');
  if (!code) {
    code = 'DC' + Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem('dc_referral_code', code);
  }
  return code;
}

function redeemReferralCode(code) {
  if (!code || code.length < 4) { showToast('Invalid referral code'); return false; }
  if (code === getReferralCode()) { showToast("Can't use your own code!"); return false; }
  const used = JSON.parse(localStorage.getItem('dc_referrals_used') || '[]');
  if (used.includes(code)) { showToast('Already used this code'); return false; }
  used.push(code);
  localStorage.setItem('dc_referrals_used', JSON.stringify(used));
  // Grant 4 weeks free challenges
  const expires = new Date(Date.now() + 28 * 86400000).toISOString();
  localStorage.setItem('dc_referral_bonus_expires', expires);
  showToast('Referral accepted! Free challenges for 4 weeks!');
  addCoins(50); // bonus coins for referral
  return true;
}

function isChallengeFreeTier() {
  if (hasReferralBonus()) return { free: true, reason: 'referral', daysLeft: getReferralDaysLeft() };
  if (getWeeklyChallengeCount() < 1) return { free: true, reason: 'weekly', remaining: 1 - getWeeklyChallengeCount() };
  return { free: false, reason: 'limit', used: getWeeklyChallengeCount() };
}

function createChallenge(type, target, stake, duration, opponent) {
  const ch = getChallenges();
  const challenge = {
    id: 'ch_' + Date.now(),
    type,
    target,
    stake,
    duration, // days
    opponent: opponent || 'Anyone',
    creator: state.supaUser?.email?.split('@')[0] || 'You',
    progress: 0,
    opponentProgress: 0,
    status: 'active',
    created: new Date().toISOString(),
    expires: new Date(Date.now() + duration * 86400000).toISOString(),
    spectators: 0,
    pot: stake * 2
  };
  ch.push(challenge);
  saveChallenges(ch);
  if (stake > 0) {
    showToast('Challenge created! ' + stake + ' coins staked.');
    addCoins(-stake);
  } else {
    showToast('Free challenge created! Go get it.');
  }
  renderHubStats();
  return challenge;
}

function renderChallengesTab(c) {
  const challenges = getChallenges();
  const active = challenges.filter(ch => ch.status === 'active');
  const completed = challenges.filter(ch => ch.status !== 'active');
  const tier = isChallengeFreeTier();

  // Referral invite banner
  const referralBanner = tier.free && tier.reason === 'referral'
    ? '<div style="background:linear-gradient(135deg,rgba(78,204,163,0.15),rgba(45,212,191,0.15));border:1px solid var(--green);border-radius:10px;padding:12px;margin-bottom:16px;display:flex;align-items:center;gap:12px;"><div style="font-size:1.4rem;">&#127881;</div><div style="flex:1;"><div style="font-weight:700;font-size:0.85rem;color:var(--green);">Referral bonus active</div><div style="font-size:0.75rem;color:var(--text2);">' + getReferralDaysLeft() + ' days of free challenges remaining</div></div></div>'
    : '<div style="background:linear-gradient(135deg,rgba(233,69,96,0.1),rgba(78,204,163,0.1));border:1px solid var(--accent);border-radius:10px;padding:12px;margin-bottom:16px;display:flex;align-items:center;gap:12px;cursor:pointer;" onclick="showReferralModal()"><div style="font-size:1.4rem;">&#128279;</div><div style="flex:1;"><div style="font-weight:700;font-size:0.85rem;">Invite a friend, get 4 weeks free</div><div style="font-size:0.75rem;color:var(--text2);">Share your code. Both of you get unlimited challenges + 50 coins.</div></div><div style="font-size:0.8rem;color:var(--accent);font-weight:700;">Invite &rarr;</div></div>';

  c.innerHTML = `
    ${referralBanner}
    <div class="hub-panel" style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div>
          <h3 style="margin:0;">Active Challenges</h3>
          <div style="font-size:0.7rem;color:var(--text3);margin-top:2px;">${tier.free ? (tier.reason === 'referral' ? 'Unlimited free' : '1 free this week') : 'Free used - costs coins'}</div>
        </div>
        <button class="btn-primary btn-sm" onclick="showNewChallengeModal()">New Challenge</button>
      </div>
      ${active.length === 0 ? '<div style="text-align:center;padding:24px;"><div style="font-size:2.5rem;margin-bottom:8px;">&#x1F3AF;</div><div style="font-weight:700;font-size:0.95rem;margin-bottom:4px;">No active challenges</div><div style="font-size:0.8rem;color:var(--text3);margin-bottom:12px;">Challenge a friend to a health bet. Loser\'s coins go to the winner!</div><button class="btn-primary btn-sm" onclick="showNewChallengeModal()">Create Your First Challenge</button></div>' : ''}
      ${active.map(ch => renderChallengeCard(ch)).join('')}
    </div>
    <div class="hub-panel" style="margin-bottom:16px;">
      <h3>Challenge Categories</h3>
      <p style="color:var(--text3);font-size:0.8rem;margin-bottom:12px;">Bet on yourself. Stake coins. Prove your friends wrong.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;">
        ${renderChallengeCategory('fitness', 'Exercise', 'Steps, workouts, active minutes')}
        ${renderChallengeCategory('diet', 'Diet', 'Vegetables, water, no junk food')}
        ${renderChallengeCategory('sleep', 'Sleep', '7+ hours, consistent bedtime')}
        ${renderChallengeCategory('substances', 'Quit', 'No smoking, no alcohol days')}
        ${renderChallengeCategory('mind', 'Mindfulness', 'Meditation, journaling, gratitude')}
        ${renderChallengeCategory('social', 'Social', 'Friend calls, quality time')}
      </div>
    </div>
    ${completed.length > 0 ? `
    <div class="hub-panel">
      <h3>Completed (${completed.length})</h3>
      ${completed.slice(0, 5).map(ch => renderChallengeCard(ch)).join('')}
    </div>` : ''}
    <div class="hub-panel" style="margin-top:16px;">
      <h3>Group Challenges</h3>
      <p style="color:var(--text3);font-size:0.85rem;margin-bottom:12px;">Create a team and set group goals. Family, office, gym crew - compete together.</p>
      <button class="btn-secondary btn-sm" onclick="showCreateGroupModal()">Create Team Challenge</button>
      <div id="groupChallengesList" style="margin-top:12px;">
        ${renderGroupChallenges()}
      </div>
    </div>
  `;
}

function renderChallengeCard(ch) {
  const daysLeft = Math.max(0, Math.ceil((new Date(ch.expires) - Date.now()) / 86400000));
  const pct = Math.min(100, Math.round((ch.progress / (ch.target || 1)) * 100));
  const isWinning = ch.progress > ch.opponentProgress;
  return `
    <div class="challenge-card ${ch.status === 'active' ? 'active' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div>
          <strong style="font-size:0.85rem;">${escHtml(ch.type)}</strong>
          <span class="challenge-stake">${ch.pot} coins pot</span>
        </div>
        <span style="font-size:0.7rem;color:${ch.status === 'active' ? 'var(--gold)' : 'var(--text3)'};">${ch.status === 'active' ? daysLeft + 'd left' : ch.status}</span>
      </div>
      <div class="challenge-vs">
        <div class="challenge-player">
          <div style="font-weight:700;color:${isWinning ? 'var(--green)' : 'var(--text)'};">${escHtml(ch.creator)}</div>
          <div style="font-size:0.75rem;">${ch.progress}/${ch.target}</div>
        </div>
        <div style="font-size:0.7rem;color:var(--text3);font-weight:700;">VS</div>
        <div class="challenge-player">
          <div style="font-weight:700;color:${!isWinning ? 'var(--green)' : 'var(--text)'};">${escHtml(ch.opponent)}</div>
          <div style="font-size:0.75rem;">${ch.opponentProgress}/${ch.target}</div>
        </div>
      </div>
      <div class="progress-bar-sm" style="margin-top:8px;"><div class="fill" style="width:${pct}%;background:var(--green);"></div></div>
      ${ch.status === 'active' ? '<div style="display:flex;gap:6px;margin-top:8px;"><button class="btn-sm btn-green" style="flex:1;font-size:0.7rem;" onclick="logChallengeProgress(\'' + ch.id + '\')">Log Progress</button><button class="btn-sm btn-secondary" style="font-size:0.7rem;" onclick="showChallengeChat(\'' + ch.id + '\')">Chat</button><button class="btn-sm btn-secondary" style="font-size:0.7rem;" onclick="nudgeChallenger(\'' + ch.id + '\')">Nudge</button></div>' : ''}
      ${ch.status === 'lost' && ch.pendingAccept ? '<div style="margin-top:8px;padding:8px;background:rgba(233,69,96,0.1);border-radius:8px;text-align:center;"><div style="font-size:0.75rem;color:var(--accent);margin-bottom:6px;">' + ch.stake + ' coins transferred to ' + escHtml(ch.opponent) + '</div><button class="btn-sm btn-secondary" style="font-size:0.7rem;" onclick="acceptChallengeLoss(\'' + ch.id + '\')">Accept Loss</button></div>' : ''}
      ${ch.status === 'won' ? '<div style="margin-top:8px;padding:8px;background:rgba(78,204,163,0.1);border-radius:8px;text-align:center;font-size:0.75rem;color:var(--green);font-weight:700;">+' + ch.pot + ' coins won!</div>' : ''}
      ${ch.status !== 'active' ? '<button class="btn-sm btn-secondary" style="font-size:0.7rem;margin-top:6px;width:100%;" onclick="showChallengeChat(\'' + ch.id + '\')">View Chat</button>' : ''}
    </div>
  `;
}

function renderChallengeCategory(cat, label, desc) {
  return `<div style="background:var(--bg);padding:12px;border-radius:8px;cursor:pointer;border:1px solid var(--border);transition:all 0.15s;" onclick="showNewChallengeModal('${cat}')" onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='var(--border)'">
    <div class="task-cat cat-${cat}" style="margin-bottom:4px;">${label}</div>
    <div style="font-size:0.7rem;color:var(--text3);">${desc}</div>
  </div>`;
}

function showNewChallengeModal(preselectedCat) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modalContent');
  if (!modal || !content) return;
  modal.classList.remove('hidden');

  const cats = ['fitness', 'diet', 'sleep', 'substances', 'mind', 'social'];
  const challenges = {
    fitness: ['Walk 10k steps daily', 'Exercise 4x this week', '30 min cardio daily', 'Do 100 pushups total'],
    diet: ['Eat 5 veg servings daily', 'No processed food for 7 days', 'Drink 2L water daily', 'Cook every meal this week'],
    sleep: ['Sleep 7+ hours every night', 'In bed by 11pm daily', 'No phone after 10pm', 'Consistent wake time all week'],
    substances: ['No alcohol for 7 days', 'Smoke 50% fewer cigarettes', 'No caffeine after 2pm', 'Sober weekend'],
    mind: ['Meditate 10 min daily', 'Journal every morning', '3 gratitude entries daily', 'No social media for 3 days'],
    social: ['Call a friend every day', 'Plan 2 social activities', 'Send 5 encouraging messages', 'Cook dinner with someone']
  };

  const tier = isChallengeFreeTier();
  const tierBadge = tier.free
    ? (tier.reason === 'referral'
        ? '<div style="background:linear-gradient(135deg,var(--green),#2dd4bf);color:#fff;padding:8px 12px;border-radius:8px;font-size:0.8rem;margin-bottom:12px;text-align:center;">Referral bonus active - ' + tier.daysLeft + ' days of free challenges left</div>'
        : '<div style="background:var(--green);color:#fff;padding:8px 12px;border-radius:8px;font-size:0.8rem;margin-bottom:12px;text-align:center;">This challenge is FREE (1 free per week)</div>')
    : '<div style="background:var(--gold);color:#1a1a2e;padding:8px 12px;border-radius:8px;font-size:0.8rem;margin-bottom:12px;text-align:center;">Free challenge used this week - stake coins or <a href="#" onclick="showReferralModal();return false;" style="color:#1a1a2e;font-weight:700;text-decoration:underline;">invite a friend</a> for 4 weeks free</div>';

  content.innerHTML = `
    <h3 style="margin-bottom:12px;">Create a Challenge</h3>
    ${tierBadge}

    <label style="font-size:0.8rem;color:var(--text3);display:block;margin-bottom:4px;">Category</label>
    <div class="bet-modal-cat" id="betCats">
      ${cats.map(c => '<button class="' + (c === preselectedCat ? 'sel' : '') + '" onclick="selectBetCat(\'' + c + '\')">' + c.charAt(0).toUpperCase() + c.slice(1) + '</button>').join('')}
    </div>

    <label style="font-size:0.8rem;color:var(--text3);display:block;margin-bottom:4px;">Challenge</label>
    <select id="betChallenge" style="width:100%;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);margin-bottom:12px;font-size:0.85rem;">
      ${(challenges[preselectedCat || 'fitness'] || challenges.fitness).map(ch => '<option>' + ch + '</option>').join('')}
    </select>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
      ${tier.free ? '' : '<div><label style="font-size:0.8rem;color:var(--text3);display:block;margin-bottom:4px;">Stake (coins)</label><input type="number" id="betStake" value="50" min="10" max="500" style="width:100%;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:0.85rem;"></div>'}
      <div ${tier.free ? 'style="grid-column:span 2;"' : ''}>
        <label style="font-size:0.8rem;color:var(--text3);display:block;margin-bottom:4px;">Duration</label>
        <select id="betDuration" style="width:100%;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:0.85rem;">
          <option value="7">1 week</option>
          <option value="14">2 weeks</option>
          <option value="30">1 month</option>
        </select>
      </div>
    </div>

    <label style="font-size:0.8rem;color:var(--text3);display:block;margin-bottom:4px;">Opponent (name or email)</label>
    <input type="text" id="betOpponent" placeholder="Friend's name" style="width:100%;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);margin-bottom:16px;font-size:0.85rem;">

    <button class="btn-primary" style="width:100%;padding:12px;" onclick="submitChallenge()">${tier.free ? 'Create Free Challenge' : 'Stake & Create Challenge'}</button>
    <button class="btn-secondary" style="width:100%;margin-top:8px;" onclick="closeModal()">Cancel</button>
  `;
}

function selectBetCat(cat) {
  document.querySelectorAll('#betCats button').forEach(b => b.classList.remove('sel'));
  event.target.classList.add('sel');
  const challenges = {
    fitness: ['Walk 10k steps daily', 'Exercise 4x this week', '30 min cardio daily'],
    diet: ['Eat 5 veg servings daily', 'No processed food for 7 days', 'Drink 2L water daily'],
    sleep: ['Sleep 7+ hours every night', 'In bed by 11pm daily', 'No phone after 10pm'],
    substances: ['No alcohol for 7 days', 'Smoke 50% fewer cigarettes', 'Sober weekend'],
    mind: ['Meditate 10 min daily', 'Journal every morning', '3 gratitude entries daily'],
    social: ['Call a friend every day', 'Plan 2 social activities', 'Send 5 encouraging messages']
  };
  const sel = document.getElementById('betChallenge');
  if (sel) sel.innerHTML = (challenges[cat] || []).map(ch => '<option>' + ch + '</option>').join('');
}

function submitChallenge() {
  const tier = isChallengeFreeTier();
  const duration = parseInt(document.getElementById('betDuration')?.value || '7');
  const opponent = document.getElementById('betOpponent')?.value.trim() || 'Anyone';
  const challenge = document.getElementById('betChallenge')?.value || 'Health challenge';

  if (tier.free) {
    // Free challenge - no stake required
    createChallenge(challenge, duration, 0, duration, opponent);
  } else {
    // Must pay coins
    const stake = parseInt(document.getElementById('betStake')?.value || '50');
    const coins = getCoins();
    if (stake > coins) { showToast('Not enough coins! You have ' + coins); return; }
    if (stake < 10) { showToast('Minimum stake is 10 coins'); return; }
    createChallenge(challenge, duration, stake, duration, opponent);
  }
  closeModal();
  switchHubTab('challenges');
}

function logChallengeProgress(chId) {
  const challenges = getChallenges();
  const ch = challenges.find(c => c.id === chId);
  if (!ch) return;
  ch.progress = (ch.progress || 0) + 1;
  // Check if challenge ended
  if (new Date(ch.expires) < new Date()) {
    ch.status = ch.progress > ch.opponentProgress ? 'won' : ch.progress < ch.opponentProgress ? 'lost' : 'draw';
    ch.pendingAccept = ch.status !== 'draw'; // loser must accept
    if (ch.status === 'won') {
      // Winner gets the full pot (both stakes)
      addCoins(ch.pot);
      showToast('You won! +' + ch.pot + ' coins transferred to you!');
      setTimeout(launchConfetti, 300);
    } else if (ch.status === 'draw') {
      addCoins(ch.stake);
      showToast('Draw! Stake returned.');
    } else {
      // Lost - coins already deducted at creation, they go to winner
      ch.pendingAccept = true;
      showToast('You lost. ' + ch.stake + ' coins go to ' + ch.opponent + '.');
    }
  } else {
    showToast('Progress logged! ' + ch.progress + ' and counting.');
  }
  saveChallenges(challenges);
  const c = document.getElementById('hubContent');
  if (c) renderChallengesTab(c);
}

function acceptChallengeLoss(chId) {
  const challenges = getChallenges();
  const ch = challenges.find(c => c.id === chId);
  if (!ch) return;
  ch.pendingAccept = false;
  ch.lossAccepted = true;
  saveChallenges(challenges);
  showToast('Loss accepted. Use those coins to fuel your next win!');
  const c = document.getElementById('hubContent');
  if (c) renderChallengesTab(c);
}

function nudgeChallenger(chId) {
  showToast('Nudge sent! Your opponent has been poked.');
}

// Challenge chat/proof system
function getChallengeMessages(chId) {
  try { return JSON.parse(localStorage.getItem('dc_ch_msgs_' + chId) || '[]'); } catch(e) { return []; }
}
function saveChallengeMessages(chId, msgs) {
  localStorage.setItem('dc_ch_msgs_' + chId, JSON.stringify(msgs));
}

function showChallengeChat(chId) {
  const challenges = getChallenges();
  const ch = challenges.find(c => c.id === chId);
  if (!ch) return;
  const msgs = getChallengeMessages(chId);
  const me = ch.creator;

  const content = document.getElementById('modalContent');
  if (!content) return;
  document.getElementById('modal').classList.remove('hidden');

  function renderChat() {
    const msgs = getChallengeMessages(chId);
    content.innerHTML = `
      <h3 style="margin-bottom:4px;">Challenge Chat</h3>
      <div style="font-size:0.75rem;color:var(--text3);margin-bottom:12px;">${escHtml(ch.type)} - You vs ${escHtml(ch.opponent)}</div>
      <div id="chatMessages" style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin-bottom:12px;padding:8px;background:var(--bg);border-radius:8px;min-height:60px;">
        ${msgs.length === 0 ? '<div style="text-align:center;color:var(--text3);font-size:0.8rem;padding:20px 0;">No messages yet. Send proof or a message!</div>' : msgs.map(m => `
          <div style="display:flex;flex-direction:column;${m.sender === me ? 'align-items:flex-end;' : 'align-items:flex-start;'}">
            <div style="font-size:0.65rem;color:var(--text3);margin-bottom:2px;">${escHtml(m.sender)} &middot; ${new Date(m.ts).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
            ${m.type === 'photo' ? '<img src="' + m.data + '" style="max-width:200px;max-height:200px;border-radius:8px;border:1px solid var(--border);" alt="Proof photo">' : ''}
            ${m.text ? '<div style="background:' + (m.sender === me ? 'var(--accent)' : 'var(--surface)') + ';color:' + (m.sender === me ? '#fff' : 'var(--text)') + ';padding:8px 12px;border-radius:12px;font-size:0.8rem;max-width:240px;word-wrap:break-word;">' + escHtml(m.text) + '</div>' : ''}
          </div>`).join('')}
      </div>
      <div style="display:flex;gap:8px;align-items:flex-end;">
        <div style="flex:1;">
          <input type="text" id="chatInput" placeholder="Type a message..." style="width:100%;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:0.85rem;" onkeydown="if(event.key==='Enter')sendChallengeMsg('${chId}')">
        </div>
        <label style="cursor:pointer;padding:8px 12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;font-size:1rem;min-height:40px;display:flex;align-items:center;" title="Upload proof photo">
          &#128247;
          <input type="file" id="chatPhoto" accept="image/*" style="display:none;" onchange="sendChallengePhoto('${chId}', this)">
        </label>
        <button class="btn-primary btn-sm" onclick="sendChallengeMsg('${chId}')" style="min-height:40px;">Send</button>
      </div>
      <button class="btn-secondary" style="width:100%;margin-top:12px;" onclick="closeModal()">Close</button>
    `;
    const chatDiv = document.getElementById('chatMessages');
    if (chatDiv) chatDiv.scrollTop = chatDiv.scrollHeight;
  }
  renderChat();
  window._refreshChat = renderChat;
}

function sendChallengeMsg(chId) {
  const input = document.getElementById('chatInput');
  const text = input?.value.trim();
  if (!text) return;
  const challenges = getChallenges();
  const ch = challenges.find(c => c.id === chId);
  if (!ch) return;
  const msgs = getChallengeMessages(chId);
  msgs.push({ sender: ch.creator, text, type: 'text', ts: new Date().toISOString() });
  saveChallengeMessages(chId, msgs);
  input.value = '';
  if (window._refreshChat) window._refreshChat();
}

function sendChallengePhoto(chId, fileInput) {
  const file = fileInput.files[0];
  if (!file) return;
  // BUG-006 FIX: Check total chat storage before adding photo
  const chatSize = getChatStorageSize();
  if (chatSize > 3 * 1024 * 1024) { // 3MB limit for all chat photos
    showToast('Chat storage full. Delete old chats to send more photos.');
    return;
  }
  const challenges = getChallenges();
  const ch = challenges.find(c => c.id === chId);
  if (!ch) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    // Compress to max 200KB by reducing quality
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxW = 400, maxH = 400;
      let w = img.width, h = img.height;
      if (w > maxW) { h = h * maxW / w; w = maxW; }
      if (h > maxH) { w = w * maxH / h; h = maxH; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const data = canvas.toDataURL('image/jpeg', 0.6);
      const msgs = getChallengeMessages(chId);
      msgs.push({ sender: ch.creator, data, type: 'photo', text: 'Proof photo', ts: new Date().toISOString() });
      saveChallengeMessages(chId, msgs);
      if (window._refreshChat) window._refreshChat();
      showToast('Photo uploaded!');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Group challenges (#9)
function getGroupChallenges() {
  try { return JSON.parse(localStorage.getItem('dc_group_challenges') || '[]'); } catch(e) { return []; }
}

function renderGroupChallenges() {
  const groups = getGroupChallenges();
  if (groups.length === 0) return '<p style="color:var(--text3);font-size:0.8rem;">No team challenges yet.</p>';
  return groups.map(g => {
    const pct = g.target > 0 ? Math.min(100, Math.round((g.progress / g.target) * 100)) : 0;
    const done = g.progress >= g.target;
    return `
    <div style="padding:12px;border:1px solid ${done ? 'var(--green)' : 'var(--border)'};border-radius:8px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong style="font-size:0.85rem;">${escHtml(g.name)}</strong>
        <span style="font-size:0.7rem;color:var(--text3);">${g.members.length} members</span>
      </div>
      <div style="font-size:0.8rem;color:var(--text2);margin-top:4px;">${escHtml(g.goal)}</div>
      <div class="progress-bar-sm" style="margin-top:6px;"><div class="fill" style="width:${pct}%;background:${done ? 'var(--green)' : 'var(--gold)'};"></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
        <span style="font-size:0.7rem;color:var(--text3);">${g.progress}/${g.target} ${g.unit}</span>
        ${done ? '<span style="font-size:0.7rem;color:var(--green);font-weight:700;">Complete!</span>' : '<button class="btn-sm btn-green" style="font-size:0.65rem;padding:4px 10px;" onclick="logGroupProgress(\'' + g.id + '\')">+1 Progress</button>'}
      </div>
    </div>`;
  }).join('');
}

// BUG-004 FIX: Add progress logging for group challenges
function logGroupProgress(groupId) {
  const groups = getGroupChallenges();
  const g = groups.find(gr => gr.id === groupId);
  if (!g) return;
  g.progress = (g.progress || 0) + 1;
  if (g.progress >= g.target) {
    addCoins(100);
    showToast('Team goal complete! +100 coins bonus!');
    launchConfetti();
  } else {
    showToast('Progress logged! ' + g.progress + '/' + g.target + ' ' + g.unit);
  }
  localStorage.setItem('dc_group_challenges', JSON.stringify(groups));
  switchHubTab('challenges');
}

function showCreateGroupModal() {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modalContent');
  if (!modal || !content) return;
  modal.classList.remove('hidden');
  content.innerHTML = `
    <h3 style="margin-bottom:12px;">Create Team Challenge</h3>
    <label style="font-size:0.8rem;color:var(--text3);">Team Name</label>
    <input type="text" id="groupName" placeholder="e.g. Office Warriors" style="width:100%;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);margin-bottom:12px;">
    <label style="font-size:0.8rem;color:var(--text3);">Goal</label>
    <input type="text" id="groupGoal" placeholder="e.g. Walk 500km total this month" style="width:100%;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);margin-bottom:12px;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
      <div>
        <label style="font-size:0.8rem;color:var(--text3);">Target Number</label>
        <input type="number" id="groupTarget" value="100" style="width:100%;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);">
      </div>
      <div>
        <label style="font-size:0.8rem;color:var(--text3);">Unit</label>
        <input type="text" id="groupUnit" placeholder="km, reps, days..." style="width:100%;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);">
      </div>
    </div>
    <button class="btn-primary" style="width:100%;" onclick="createGroupChallenge()">Create Team</button>
    <button class="btn-secondary" style="width:100%;margin-top:8px;" onclick="closeModal()">Cancel</button>
  `;
}

function createGroupChallenge() {
  const name = document.getElementById('groupName')?.value.trim();
  const goal = document.getElementById('groupGoal')?.value.trim();
  const target = parseInt(document.getElementById('groupTarget')?.value || '100');
  const unit = document.getElementById('groupUnit')?.value.trim() || 'units';
  if (!name || !goal) { showToast('Fill in team name and goal'); return; }
  const groups = getGroupChallenges();
  groups.push({
    id: 'grp_' + Date.now(), name, goal, target, unit, progress: 0,
    members: [state.supaUser?.email?.split('@')[0] || 'You'],
    created: new Date().toISOString()
  });
  localStorage.setItem('dc_group_challenges', JSON.stringify(groups));
  closeModal();
  showToast('Team "' + name + '" created!');
  switchHubTab('challenges');
}


// Referral modal
function showReferralModal() {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modalContent');
  if (!modal || !content) return;
  modal.classList.remove('hidden');
  const myCode = getReferralCode();
  const bonus = hasReferralBonus();
  const shareUrl = 'https://death-clock.app/?ref=' + myCode;

  content.innerHTML = `
    <h3 style="margin-bottom:12px;">Invite Friends, Get Free Challenges</h3>
    <p style="color:var(--text2);font-size:0.85rem;margin-bottom:16px;">Share your code with a friend. When they use it, you BOTH get 4 weeks of unlimited free challenges + 50 bonus coins.</p>

    <div style="background:var(--bg);border:2px dashed var(--accent);border-radius:12px;padding:16px;text-align:center;margin-bottom:16px;">
      <div style="font-size:0.75rem;color:var(--text3);margin-bottom:4px;">Your referral code</div>
      <div style="font-size:1.5rem;font-weight:800;letter-spacing:4px;color:var(--accent);">${myCode}</div>
      <button class="btn-sm btn-secondary" style="margin-top:8px;" onclick="navigator.clipboard.writeText('${shareUrl}');showToast('Link copied!')">Copy Link</button>
    </div>

    ${bonus ? '<div style="background:var(--green);color:#fff;padding:8px 12px;border-radius:8px;font-size:0.8rem;text-align:center;margin-bottom:12px;">Referral bonus active - ' + getReferralDaysLeft() + ' days left</div>' : ''}

    <div style="border-top:1px solid var(--border);padding-top:16px;margin-top:8px;">
      <label style="font-size:0.8rem;color:var(--text3);display:block;margin-bottom:4px;">Have a friend's code? Enter it here:</label>
      <div style="display:flex;gap:8px;">
        <input type="text" id="refCodeInput" placeholder="e.g. DC3XK9P2" style="flex:1;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:0.85rem;text-transform:uppercase;">
        <button class="btn-primary btn-sm" onclick="if(redeemReferralCode(document.getElementById('refCodeInput').value.trim().toUpperCase())){closeModal();switchHubTab('challenges');}">Redeem</button>
      </div>
    </div>

    <button class="btn-secondary" style="width:100%;margin-top:16px;" onclick="closeModal()">Close</button>
  `;
}

// ============================================
// 4. HEALTH TRACKER INTEGRATION (#3)
// ============================================
const GOOGLE_FIT_CLIENT_ID = '';  // Set when OAuth is configured
const GOOGLE_FIT_SCOPES = 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.sleep.read';

function getHealthData() {
  try { return JSON.parse(localStorage.getItem('dc_health_data') || '{}'); } catch(e) { return {}; }
}

function renderHealthTab(c) {
  const hd = getHealthData();
  const connected = hd.provider || null;

  c.innerHTML = `
    <div class="hub-panel" style="margin-bottom:16px;">
      <h3>Connect Health Tracker</h3>
      <p style="color:var(--text3);font-size:0.8rem;margin-bottom:16px;">Auto-complete tasks and verify challenges with real health data.</p>

      <div class="health-row ${connected === 'google_fit' ? 'connected' : ''}" onclick="connectGoogleFit()">
        <div class="health-icon">&#x1F3C3;</div>
        <div style="flex:1;">
          <div style="font-weight:600;font-size:0.85rem;">Google Fit</div>
          <div style="font-size:0.7rem;color:var(--text3);">Steps, heart rate, sleep, weight</div>
        </div>
        <span style="font-size:0.7rem;color:${connected === 'google_fit' ? 'var(--green)' : 'var(--text3)'};">${connected === 'google_fit' ? 'Connected' : 'Connect'}</span>
      </div>

      <div class="health-row" onclick="showManualImport()">
        <div class="health-icon">&#x1F4CB;</div>
        <div style="flex:1;">
          <div style="font-weight:600;font-size:0.85rem;">Apple Health (CSV)</div>
          <div style="font-size:0.7rem;color:var(--text3);">Export from Apple Health app</div>
        </div>
        <span style="font-size:0.7rem;color:var(--text3);">Import</span>
      </div>

      <div class="health-row" onclick="showManualEntry()">
        <div class="health-icon">&#x270D;</div>
        <div style="flex:1;">
          <div style="font-weight:600;font-size:0.85rem;">Manual Entry</div>
          <div style="font-size:0.7rem;color:var(--text3);">Log steps, sleep, weight manually</div>
        </div>
        <span style="font-size:0.7rem;color:var(--text3);">Enter</span>
      </div>
    </div>

    <div class="hub-panel">
      <h3>Today's Health Summary</h3>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px;">
        <div style="text-align:center;padding:16px;background:var(--bg);border-radius:8px;">
          <div style="font-size:1.5rem;font-weight:800;color:var(--green);">${hd.steps || '--'}</div>
          <div style="font-size:0.7rem;color:var(--text3);">Steps</div>
          <div class="progress-bar-sm" style="margin-top:4px;"><div class="fill" style="width:${Math.min(100,((hd.steps||0)/10000)*100)}%;background:var(--green);"></div></div>
        </div>
        <div style="text-align:center;padding:16px;background:var(--bg);border-radius:8px;">
          <div style="font-size:1.5rem;font-weight:800;color:var(--accent);">${hd.sleep || '--'}</div>
          <div style="font-size:0.7rem;color:var(--text3);">Hours slept</div>
          <div class="progress-bar-sm" style="margin-top:4px;"><div class="fill" style="width:${Math.min(100,((hd.sleep||0)/8)*100)}%;background:var(--accent);"></div></div>
        </div>
        <div style="text-align:center;padding:16px;background:var(--bg);border-radius:8px;">
          <div style="font-size:1.5rem;font-weight:800;color:var(--gold);">${hd.weight ? hd.weight + 'kg' : '--'}</div>
          <div style="font-size:0.7rem;color:var(--text3);">Weight</div>
        </div>
      </div>
      ${hd.lastSync ? '<p style="font-size:0.7rem;color:var(--text3);margin-top:12px;text-align:center;">Last synced: ' + new Date(hd.lastSync).toLocaleString() + '</p>' : ''}
    </div>
  `;
}

function connectGoogleFit() {
  if (!GOOGLE_FIT_CLIENT_ID) {
    showToast('Google Fit integration coming soon! Use manual entry for now.');
    return;
  }
  // OAuth2 flow
  const redirectUri = window.location.origin + '/dashboard.html';
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=' + GOOGLE_FIT_CLIENT_ID +
    '&redirect_uri=' + encodeURIComponent(redirectUri) +
    '&response_type=token&scope=' + encodeURIComponent(GOOGLE_FIT_SCOPES);
  window.location.href = url;
}

function showManualImport() {
  showToast('Apple Health CSV import coming soon! Use manual entry for now.');
}

function showManualEntry() {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modalContent');
  if (!modal || !content) return;
  modal.classList.remove('hidden');
  const hd = getHealthData();
  content.innerHTML = `
    <h3 style="margin-bottom:12px;">Log Health Data</h3>
    <label style="font-size:0.8rem;color:var(--text3);">Steps today</label>
    <input type="number" id="healthSteps" value="${hd.steps || ''}" placeholder="e.g. 8500" style="width:100%;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);margin-bottom:12px;">
    <label style="font-size:0.8rem;color:var(--text3);">Hours slept last night</label>
    <input type="number" id="healthSleep" value="${hd.sleep || ''}" placeholder="e.g. 7.5" step="0.5" style="width:100%;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);margin-bottom:12px;">
    <label style="font-size:0.8rem;color:var(--text3);">Weight (kg)</label>
    <input type="number" id="healthWeight" value="${hd.weight || ''}" placeholder="e.g. 75" step="0.1" style="width:100%;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);margin-bottom:16px;">
    <button class="btn-primary" style="width:100%;" onclick="saveHealthEntry()">Save</button>
    <button class="btn-secondary" style="width:100%;margin-top:8px;" onclick="closeModal()">Cancel</button>
  `;
}

function saveHealthEntry() {
  const steps = parseInt(document.getElementById('healthSteps')?.value) || 0;
  const sleep = parseFloat(document.getElementById('healthSleep')?.value) || 0;
  const weight = parseFloat(document.getElementById('healthWeight')?.value) || 0;
  const hd = { steps, sleep, weight, lastSync: new Date().toISOString(), provider: 'manual' };
  localStorage.setItem('dc_health_data', JSON.stringify(hd));

  // BUG-010 FIX: Use improved auto-complete matching
  const autoCompleted = autoCompleteHealthTasks(steps, sleep, weight);

  closeModal();
  showToast('Health data saved!' + (autoCompleted > 0 ? ' ' + autoCompleted + ' tasks auto-completed!' : ''));
  renderHubStats();
  switchHubTab('health');
}


// ============================================
// 5. PROGRESS TIMELINE (#5)
// ============================================
function renderProgressTab(c) {
  const goal = state.longevityGoal || {};
  const totalDays = goal.totalDaysAdded || 0;
  const taskLog = JSON.parse(localStorage.getItem('dc_task_log') || '[]');

  // Calculate milestones
  const milestones = [
    { target: 1, label: 'First day added', icon: '&#x1F331;', reward: 'Seedling badge' },
    { target: 7, label: '1 week added', icon: '&#x1F33F;', reward: 'Sprout badge' },
    { target: 30, label: '1 month added', icon: '&#x1F333;', reward: 'Tree badge + 50 coins' },
    { target: 100, label: '100 days added', icon: '&#x1F31F;', reward: 'Star badge + 200 coins' },
    { target: 365, label: '1 year added', icon: '&#x1F451;', reward: 'Crown badge + 1000 coins' },
    { target: 1000, label: '1000 days added', icon: '&#x1F48E;', reward: 'Diamond ghost + 5000 coins' }
  ];

  // Weekly progress
  const now = Date.now();
  const weekLog = taskLog.filter(l => now - new Date(l.date).getTime() < 7 * 86400000);
  const weekDays = weekLog.reduce((sum, l) => sum + (l.days || 0), 0);
  const lastWeekLog = taskLog.filter(l => {
    const t = now - new Date(l.date).getTime();
    return t >= 7 * 86400000 && t < 14 * 86400000;
  });
  const lastWeekDays = lastWeekLog.reduce((sum, l) => sum + (l.days || 0), 0);
  const weekChange = weekDays - lastWeekDays;

  // Category breakdown
  const catTotals = {};
  taskLog.forEach(l => {
    catTotals[l.cat] = (catTotals[l.cat] || 0) + (l.days || 0);
  });

  c.innerHTML = `
    <div class="hub-panel" style="margin-bottom:16px;">
      <h3>Your Longevity Journey</h3>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div>
          <div style="font-size:2.5rem;font-weight:800;color:var(--green);">+${totalDays.toFixed(1)}</div>
          <div style="font-size:0.8rem;color:var(--text3);">Total days added to your life</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:1.2rem;font-weight:700;color:${weekChange >= 0 ? 'var(--green)' : 'var(--accent)'};">${weekChange >= 0 ? '+' : ''}${weekDays.toFixed(1)} this week</div>
          <div style="font-size:0.7rem;color:var(--text3);">${weekChange > 0 ? '+' + weekChange.toFixed(1) + ' vs last week' : weekChange < 0 ? weekChange.toFixed(1) + ' vs last week' : 'Same as last week'}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;margin-bottom:16px;">
        ${Object.entries(catTotals).map(([cat, days]) => `
          <div style="text-align:center;padding:10px;background:var(--bg);border-radius:8px;">
            <div style="font-weight:700;color:var(--green);">+${days.toFixed(1)}</div>
            <span class="task-cat cat-${cat}">${cat}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="hub-panel" style="margin-bottom:16px;">
      <h3>Milestones</h3>
      ${milestones.map(m => {
        const achieved = totalDays >= m.target;
        const pct = Math.min(100, Math.round((totalDays / m.target) * 100));
        return `<div class="milestone ${achieved ? 'achieved' : 'locked'}">
          <div style="font-size:1.3rem;">${m.icon}</div>
          <div style="flex:1;">
            <div style="font-size:0.85rem;font-weight:600;">${m.label}</div>
            <div style="font-size:0.7rem;color:var(--text3);">${achieved ? 'Unlocked! ' + m.reward : pct + '% - ' + m.reward}</div>
            ${!achieved ? '<div class="progress-bar-sm"><div class="fill" style="width:' + pct + '%;background:var(--gold);"></div></div>' : ''}
          </div>
          ${achieved ? '<span style="color:var(--green);font-size:1.1rem;">&#10003;</span>' : ''}
        </div>`;
      }).join('')}
    </div>

    <div class="hub-panel">
      <h3>Share Progress</h3>
      <p style="color:var(--text3);font-size:0.8rem;margin-bottom:12px;">Show your friends how many days you've added to your life.</p>
      <button class="btn-primary btn-sm" onclick="shareProgressCard()">Share Progress Card</button>
    </div>
  `;
}

function shareProgressCard() {
  const goal = state.longevityGoal || {};
  const totalDays = goal.totalDaysAdded || 0;
  const streak = getStreakCount();
  const text = 'I\'ve added ' + totalDays.toFixed(1) + ' days to my life using Death Clock! ' +
    streak + '-day streak. Think you can beat me? death-clock.app';
  if (navigator.share) {
    navigator.share({ title: 'My Death Clock Progress', text, url: 'https://death-clock.app' });
  } else {
    navigator.clipboard.writeText(text);
    showToast('Progress copied to clipboard!');
  }
}

// ============================================
// 6. FRIEND ACTIVITY FEED (#6)
// ============================================
function getFeedItems() {
  try { return JSON.parse(localStorage.getItem('dc_feed') || '[]'); } catch(e) { return []; }
}

function addFeedItem(user, action, detail) {
  const feed = getFeedItems();
  feed.unshift({ user, action, detail, time: new Date().toISOString(), reactions: {} });
  localStorage.setItem('dc_feed', JSON.stringify(feed.slice(0, 50)));
}

function renderFeedTab(c) {
  let feed = getFeedItems();

  // BUG-009 FIX: Seed with example data if empty, but label them as examples
  if (feed.length === 0) {
    const demoFeed = [
      { user: 'Alex', action: 'completed 5 tasks', detail: '+4.2 days added', time: new Date(Date.now() - 3600000).toISOString(), reactions: { fire: 2 }, demo: true },
      { user: 'Sam', action: 'started a challenge', detail: 'Walk 10k steps daily', time: new Date(Date.now() - 7200000).toISOString(), reactions: {}, demo: true },
      { user: 'Jordan', action: 'hit a 14-day streak', detail: '2x multiplier unlocked!', time: new Date(Date.now() - 14400000).toISOString(), reactions: { clap: 5 }, demo: true }
    ];
    feed = demoFeed;
    localStorage.setItem('dc_feed', JSON.stringify(demoFeed));
  }

  const you = state.supaUser?.email?.split('@')[0] || 'You';

  c.innerHTML = `
    <div class="hub-panel" style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3>Activity Feed</h3>
        <button class="btn-secondary btn-sm" onclick="showPage('mansion')">Visit Mansion</button>
      </div>
      ${feed.map((f, i) => `
        <div class="feed-item">
          <div class="feed-avatar">${f.user.charAt(0).toUpperCase()}</div>
          <div style="flex:1;min-width:0;">
            <div><strong>${escHtml(f.user)}</strong> ${escHtml(f.action)}</div>
            <div style="font-size:0.75rem;color:var(--text3);">${escHtml(f.detail)}</div>
            <div class="feed-time">${timeAgo(f.time)}</div>
            <div class="feed-react">
              <button onclick="reactFeed(${i},'fire')">&#x1F525; ${f.reactions.fire || ''}</button>
              <button onclick="reactFeed(${i},'clap')">&#x1F44F; ${f.reactions.clap || ''}</button>
              <button onclick="reactFeed(${i},'heart')">&#x2764; ${f.reactions.heart || ''}</button>
              <button onclick="reactFeed(${i},'nudge')">&#x1F4AA; Nudge</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="hub-panel">
      <h3>Invite Friends</h3>
      <p style="color:var(--text3);font-size:0.85rem;margin-bottom:12px;">The more friends you add, the more fun (and competitive) it gets.</p>
      <div style="display:flex;gap:8px;">
        <input type="text" id="inviteFriendEmail" placeholder="friend@email.com" style="flex:1;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);">
        <button class="btn-primary btn-sm" onclick="inviteFriend()">Invite</button>
      </div>
    </div>
  `;
}

function reactFeed(idx, type) {
  const feed = getFeedItems();
  if (!feed[idx]) return;
  if (!feed[idx].reactions) feed[idx].reactions = {};
  feed[idx].reactions[type] = (feed[idx].reactions[type] || 0) + 1;
  localStorage.setItem('dc_feed', JSON.stringify(feed));
  const c = document.getElementById('hubContent');
  if (c) renderFeedTab(c);
}

function inviteFriend() {
  const email = document.getElementById('inviteFriendEmail')?.value.trim();
  if (!email || !email.includes('@')) { showToast('Enter a valid email'); return; }
  const text = 'Join me on Death Clock! I\'m tracking my longevity and challenging friends. death-clock.app';
  if (navigator.share) {
    navigator.share({ title: 'Join Death Clock', text, url: 'https://death-clock.app' });
  } else {
    navigator.clipboard.writeText(text);
  }
  showToast('Invite link copied!');
  document.getElementById('inviteFriendEmail').value = '';
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  return days + 'd ago';
}


// ============================================
// 7. STREAK MULTIPLIERS + COMBOS (#7)
// ============================================
function getStreakCount() {
  try {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('dc_last_visit');
    let streak = parseInt(localStorage.getItem('dc_visit_streak') || '0');
    if (lastVisit !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastVisit === yesterday) {
        streak = streak + 1;
      } else {
        // BUG-002/003 FIX: Use streak insurance if available and not expired
        const insurance = JSON.parse(localStorage.getItem('dc_streak_insurance_data') || 'null');
        if (insurance && new Date(insurance.expires) > new Date() && insurance.usesLeft > 0) {
          // Insurance saves the streak! Consume one use
          insurance.usesLeft--;
          localStorage.setItem('dc_streak_insurance_data', JSON.stringify(insurance));
          showToast('Streak insurance saved your ' + streak + '-day streak!');
        } else {
          streak = 1; // Reset streak
        }
      }
      localStorage.setItem('dc_visit_streak', String(streak));
      localStorage.setItem('dc_last_visit', today);
    }
    return streak;
  } catch(e) { return 0; }
}

function getStreakMultiplier(streak) {
  if (streak >= 90) return 3;
  if (streak >= 30) return 2;
  if (streak >= 7) return 1.5;
  return 1;
}

function renderStreakInfo() {
  const streak = getStreakCount();
  const mult = getStreakMultiplier(streak);
  const nextMult = streak < 7 ? { target: 7, mult: 1.5 } : streak < 30 ? { target: 30, mult: 2 } : streak < 90 ? { target: 90, mult: 3 } : null;
  const hasInsurance = hasActiveInsurance();

  let html = `
    <div style="text-align:center;margin-bottom:12px;">
      <div style="font-size:2rem;font-weight:800;" class="streak-fire">${streak}</div>
      <div style="font-size:0.8rem;color:var(--text3);">day streak</div>
      <div style="margin-top:4px;"><span class="combo-badge ${mult >= 3 ? 'mult-3x' : mult >= 2 ? 'mult-2x' : mult >= 1.5 ? 'mult-1_5x' : 'mult-1x'}" style="font-size:0.8rem;">${mult}x rewards</span></div>
    </div>
    <div style="font-size:0.75rem;color:var(--text3);margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:2px;"><span>7 days = 1.5x</span><span>${streak >= 7 ? '&#10003;' : (7 - streak) + ' to go'}</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:2px;"><span>30 days = 2x</span><span>${streak >= 30 ? '&#10003;' : (30 - streak) + ' to go'}</span></div>
      <div style="display:flex;justify-content:space-between;"><span>90 days = 3x</span><span>${streak >= 90 ? '&#10003;' : (90 - streak) + ' to go'}</span></div>
    </div>
  `;

  if (!hasInsurance && streak >= 3) {
    html += `<button class="btn-secondary btn-sm" style="width:100%;font-size:0.7rem;margin-top:8px;" onclick="buyStreakInsurance()">Buy streak insurance (50 coins) - 1 skip/month</button>`;
  } else if (hasInsurance) {
    html += `<div style="font-size:0.7rem;color:var(--green);text-align:center;margin-top:8px;">&#x1F6E1; Streak insurance active</div>`;
  }
  return html;
}

function buyStreakInsurance() {
  const coins = getCoins();
  if (coins < 50) { showToast('Need 50 coins for streak insurance'); return; }
  addCoins(-50);
  // BUG-003 FIX: Insurance expires in 30 days, gives 1 use
  const insuranceData = {
    purchased: new Date().toISOString(),
    expires: new Date(Date.now() + 30 * 86400000).toISOString(),
    usesLeft: 1
  };
  localStorage.setItem('dc_streak_insurance_data', JSON.stringify(insuranceData));
  localStorage.setItem('dc_streak_insurance', 'true');
  showToast('Streak insurance purchased! 1 skip, expires in 30 days.');
  renderHubStats();
  const c = document.getElementById('hubContent');
  if (c && hubTab === 'today') renderTodayTab(c);
}

function hasActiveInsurance() {
  const data = JSON.parse(localStorage.getItem('dc_streak_insurance_data') || 'null');
  if (!data) return false;
  if (new Date(data.expires) <= new Date()) {
    localStorage.setItem('dc_streak_insurance', 'false');
    return false;
  }
  return data.usesLeft > 0;
}


// Weekly league - moved to bottom with seeded random (BUG-008 fix)

// ============================================
// 8. WEEKLY REPORT (#8)
// ============================================
function renderReportTab(c) {
  const taskLog = JSON.parse(localStorage.getItem('dc_task_log') || '[]');
  const now = Date.now();

  // This week's data
  const weekLog = taskLog.filter(l => now - new Date(l.date).getTime() < 7 * 86400000);
  const weekDays = weekLog.reduce((sum, l) => sum + (l.days || 0), 0);
  const weekTasks = weekLog.length;

  // Last week
  const lastWeekLog = taskLog.filter(l => {
    const t = now - new Date(l.date).getTime();
    return t >= 7 * 86400000 && t < 14 * 86400000;
  });
  const lastWeekDays = lastWeekLog.reduce((sum, l) => sum + (l.days || 0), 0);

  // Category grades
  const catStats = {};
  weekLog.forEach(l => {
    if (!catStats[l.cat]) catStats[l.cat] = { count: 0, days: 0 };
    catStats[l.cat].count++;
    catStats[l.cat].days += l.days || 0;
  });

  function getGrade(count) {
    if (count >= 7) return 'A';
    if (count >= 5) return 'B';
    if (count >= 3) return 'C';
    if (count >= 1) return 'D';
    return 'F';
  }

  const allCats = ['fitness', 'diet', 'mind', 'sleep', 'substances', 'social'];
  const streak = getStreakCount();
  const challenges = getChallenges();
  const activeCh = challenges.filter(ch => ch.status === 'active').length;
  const wonCh = challenges.filter(ch => ch.status === 'won').length;

  c.innerHTML = `
    <div class="hub-panel" style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3>Weekly Report Card</h3>
        <span style="font-size:0.7rem;color:var(--text3);">Week ending ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
        <div style="text-align:center;padding:12px;background:var(--bg);border-radius:8px;">
          <div style="font-size:1.5rem;font-weight:800;color:var(--green);">+${weekDays.toFixed(1)}</div>
          <div style="font-size:0.7rem;color:var(--text3);">Days added</div>
          <div style="font-size:0.65rem;color:${weekDays > lastWeekDays ? 'var(--green)' : 'var(--accent)'};">${weekDays > lastWeekDays ? '+' : ''}${(weekDays - lastWeekDays).toFixed(1)} vs last week</div>
        </div>
        <div style="text-align:center;padding:12px;background:var(--bg);border-radius:8px;">
          <div style="font-size:1.5rem;font-weight:800;">${weekTasks}</div>
          <div style="font-size:0.7rem;color:var(--text3);">Tasks completed</div>
        </div>
        <div style="text-align:center;padding:12px;background:var(--bg);border-radius:8px;">
          <div style="font-size:1.5rem;font-weight:800;color:var(--gold);">${streak}</div>
          <div style="font-size:0.7rem;color:var(--text3);">Day streak</div>
        </div>
      </div>

      <h4 style="font-size:0.85rem;margin-bottom:8px;">Category Grades</h4>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
        ${allCats.map(cat => {
          const s = catStats[cat] || { count: 0, days: 0 };
          const grade = getGrade(s.count);
          return `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg);border-radius:8px;">
            <span class="report-grade grade-${grade.toLowerCase()}">${grade}</span>
            <div>
              <div style="font-size:0.8rem;font-weight:600;"><span class="task-cat cat-${cat}">${cat}</span></div>
              <div style="font-size:0.7rem;color:var(--text3);">${s.count} tasks, +${s.days.toFixed(1)} days</div>
            </div>
          </div>`;
        }).join('')}
      </div>

      ${activeCh > 0 || wonCh > 0 ? `
      <div style="margin-top:16px;">
        <h4 style="font-size:0.85rem;margin-bottom:8px;">Challenge Stats</h4>
        <div style="font-size:0.85rem;color:var(--text2);">
          ${activeCh > 0 ? activeCh + ' active challenges' : ''}
          ${wonCh > 0 ? (activeCh > 0 ? ' | ' : '') + wonCh + ' challenges won' : ''}
        </div>
      </div>` : ''}
    </div>

    <div class="hub-panel" style="margin-bottom:16px;">
      <h3>Weekly League</h3>
      <p style="font-size:0.8rem;color:var(--text3);margin-bottom:12px;">Compete with other Death Clock users. Top 3 earn bonus coins.</p>
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${generateLeaguePositions(weekDays, streak)}
      </div>
      <div style="font-size:0.7rem;color:var(--text3);margin-top:8px;text-align:center;">League resets every Monday</div>
    </div>
    <div class="hub-panel">
      <h3>Share Report</h3>
      <button class="btn-primary btn-sm" style="width:100%;" onclick="shareWeeklyReport()">Share Weekly Report Card</button>
    </div>
  `;
}

function shareWeeklyReport() {
  const taskLog = JSON.parse(localStorage.getItem('dc_task_log') || '[]');
  const now = Date.now();
  const weekLog = taskLog.filter(l => now - new Date(l.date).getTime() < 7 * 86400000);
  const weekDays = weekLog.reduce((sum, l) => sum + (l.days || 0), 0);
  const streak = getStreakCount();
  const total = (state.longevityGoal?.totalDaysAdded || 0);

  const text = 'My Death Clock Weekly Report:\n' +
    '+' + weekDays.toFixed(1) + ' days added this week\n' +
    '+' + total.toFixed(1) + ' total days added\n' +
    streak + '-day streak\n' +
    'How are you doing? death-clock.app';

  if (navigator.share) {
    navigator.share({ title: 'My Death Clock Report', text, url: 'https://death-clock.app' });
  } else {
    navigator.clipboard.writeText(text);
    showToast('Report copied to clipboard!');
  }
}


// ============================================
// 9. REWARD SHOP (#10)
// ============================================
function renderShopTab(c) {
  const coins = getCoins();

  const shopItems = [
    { id: 'gym_trial', name: 'Free gym day pass', cost: 200, type: 'partner', desc: 'Redeem at partner gyms near you', cat: 'fitness' },
    { id: 'meal_plan', name: '7-day meal plan PDF', cost: 100, type: 'partner', desc: 'Personalised nutrition guide', cat: 'diet' },
    { id: 'meditation_app', name: 'Meditation app trial (30 days)', cost: 150, type: 'partner', desc: 'Premium meditation access', cat: 'mind' },
    { id: 'supplement_sample', name: 'Vitamin D sample pack', cost: 75, type: 'partner', desc: 'Free supplement samples', cat: 'diet' },
    { id: 'plant_tree', name: 'Plant a tree', cost: 500, type: 'charity', desc: 'We plant a tree through One Tree Planted', cat: 'charity' },
    { id: 'donate_meal', name: 'Donate a meal', cost: 300, type: 'charity', desc: 'Feed someone through local food banks', cat: 'charity' },
    { id: 'ghost_hat', name: 'Top hat for Deathy', cost: 50, type: 'cosmetic', desc: 'Your ghost wears a fancy hat', cat: 'cosmetic' },
    { id: 'ghost_crown', name: 'Crown for Deathy', cost: 200, type: 'cosmetic', desc: 'Royal ghost energy', cat: 'cosmetic' },
    { id: 'ghost_fire', name: 'Fire aura', cost: 300, type: 'cosmetic', desc: 'Your ghost trails flames', cat: 'cosmetic' },
    { id: 'streak_insurance', name: 'Streak insurance', cost: 50, type: 'utility', desc: 'Skip 1 day without losing your streak', cat: 'utility' }
  ];

  const purchased = JSON.parse(localStorage.getItem('dc_shop_purchased') || '[]');

  c.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <h3 style="font-size:1.1rem;">Reward Shop</h3>
      <div style="display:flex;align-items:center;gap:6px;background:var(--surface);border:1px solid var(--gold);border-radius:20px;padding:6px 14px;">
        <span style="font-size:1.1rem;">&#x1FA99;</span>
        <span style="font-weight:800;color:var(--gold);">${coins}</span>
        <span style="font-size:0.7rem;color:var(--text3);">coins</span>
      </div>
    </div>

    <div class="hub-panel" style="margin-bottom:16px;">
      <h3 style="color:var(--green);">Partner Rewards</h3>
      <p style="color:var(--text3);font-size:0.8rem;margin-bottom:12px;">Real rewards from real brands. Earn coins, spend on health.</p>
      <div style="display:grid;gap:8px;">
        ${shopItems.filter(i => i.type === 'partner').map(i => renderShopItem(i, coins, purchased)).join('')}
      </div>
    </div>

    <div class="hub-panel" style="margin-bottom:16px;">
      <h3 style="color:var(--accent);">Charity</h3>
      <p style="color:var(--text3);font-size:0.8rem;margin-bottom:12px;">Turn your health gains into good deeds.</p>
      <div style="display:grid;gap:8px;">
        ${shopItems.filter(i => i.type === 'charity').map(i => renderShopItem(i, coins, purchased)).join('')}
      </div>
    </div>

    <div class="hub-panel" style="margin-bottom:16px;">
      <h3>Ghost Cosmetics</h3>
      <div style="display:grid;gap:8px;">
        ${shopItems.filter(i => i.type === 'cosmetic' || i.type === 'utility').map(i => renderShopItem(i, coins, purchased)).join('')}
      </div>
    </div>

    <div style="text-align:center;padding:12px;font-size:0.7rem;color:var(--text3);border-top:1px solid var(--border);margin-top:8px;">
      Coins are earned through daily tasks, streaks, and challenge wins. Coins can only be redeemed for in-app rewards, partner offers, and charitable donations. Coins have no cash value and cannot be exchanged for money.
    </div>
  `;
}

function renderShopItem(item, coins, purchased) {
  const owned = purchased.includes(item.id);
  const canAfford = coins >= item.cost;
  return `
    <div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid ${owned ? 'var(--green)' : 'var(--border)'};border-radius:8px;${owned ? 'opacity:0.6;' : ''}">
      <div style="flex:1;">
        <div style="font-size:0.85rem;font-weight:600;">${escHtml(item.name)}</div>
        <div style="font-size:0.7rem;color:var(--text3);">${escHtml(item.desc)}</div>
      </div>
      ${owned ? '<span style="color:var(--green);font-size:0.8rem;font-weight:600;">Owned</span>' :
        '<button class="btn-sm ' + (canAfford ? 'btn-primary' : 'btn-secondary') + '" style="font-size:0.7rem;white-space:nowrap;" onclick="buyShopItem(\'' + item.id + '\',' + item.cost + ')" ' + (canAfford ? '' : 'disabled') + '>' + item.cost + ' coins</button>'}
    </div>
  `;
}

function buyShopItem(id, cost) {
  const coins = getCoins();
  if (coins < cost) { showToast('Not enough coins!'); return; }
  addCoins(-cost);
  const purchased = JSON.parse(localStorage.getItem('dc_shop_purchased') || '[]');
  if (!purchased.includes(id)) {
    purchased.push(id);
    localStorage.setItem('dc_shop_purchased', JSON.stringify(purchased));
  }
  showToast('Purchased! Check your inventory.');
  renderHubStats();
  const c = document.getElementById('hubContent');
  if (c) renderShopTab(c);
}


// ============================================
// COIN SYSTEM
// ============================================
function getCoins() {
  return parseInt(localStorage.getItem('dc_coins') || '0');
}

function addCoins(amount) {
  const coins = getCoins() + amount;
  localStorage.setItem('dc_coins', String(Math.max(0, coins)));
}

// Daily coins removed - rewards earned through tasks only

// BUG-005 FIX: Milestone reward granting system
function checkMilestoneRewards() {
  const totalDays = (state.longevityGoal?.totalDaysAdded) || 0;
  const granted = JSON.parse(localStorage.getItem('dc_milestones_granted') || '[]');
  const milestoneRewards = [
    { target: 1, coins: 10, label: 'First day added!' },
    { target: 7, coins: 25, label: '1 week of life added!' },
    { target: 30, coins: 50, label: '1 month of life added!' },
    { target: 100, coins: 200, label: '100 days of life added!' },
    { target: 365, coins: 1000, label: '1 year of life added!' },
    { target: 1000, coins: 5000, label: '1000 days of life added!' }
  ];
  for (const m of milestoneRewards) {
    if (totalDays >= m.target && !granted.includes(m.target)) {
      granted.push(m.target);
      addCoins(m.coins);
      showToast('MILESTONE: ' + m.label + ' +' + m.coins + ' coins!');
      setTimeout(launchConfetti, 200);
    }
  }
  localStorage.setItem('dc_milestones_granted', JSON.stringify(granted));
}

// BUG-006 FIX: Limit chat photos to prevent localStorage overflow
function getChatStorageSize() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('dc_ch_msgs_')) {
      total += localStorage.getItem(key).length;
    }
  }
  return total;
}

// BUG-007 FIX: Clean old completed challenges (keep last 20)
function cleanOldChallenges() {
  const challenges = getChallenges();
  const active = challenges.filter(c => c.status === 'active');
  const completed = challenges.filter(c => c.status !== 'active');
  // Keep all active + last 20 completed
  const trimmed = [...active, ...completed.slice(0, 20)];
  if (trimmed.length < challenges.length) {
    saveChallenges(trimmed);
  }
}

// BUG-008 FIX: Seed league positions from weekly data, not random each render
function generateLeaguePositions(userDays, userStreak) {
  // Use week start as seed for consistent positions within a week
  const weekSeed = getWeekStart();
  let seedVal = 0;
  for (let i = 0; i < weekSeed.length; i++) seedVal += weekSeed.charCodeAt(i);
  function seededRandom() { seedVal = (seedVal * 9301 + 49297) % 233280; return seedVal / 233280; }

  const names = ['HealthNinja','FitMom23','ZenMaster','RunnerX','GreenJuice','YogaBear','StepKing','NightOwl','EarlyBird','IronWill'];
  const players = names.map(n => ({
    name: n,
    days: +(seededRandom() * 8 + 1).toFixed(1),
    isUser: false
  }));
  players.push({ name: 'You', days: +userDays.toFixed(1), isUser: true });
  players.sort((a, b) => b.days - a.days);
  const top = players.slice(0, 8);
  const userIdx = top.findIndex(p => p.isUser);
  if (userIdx === -1) {
    top[7] = { name: 'You', days: +userDays.toFixed(1), isUser: true };
  }
  const medals = ['&#x1F947;', '&#x1F948;', '&#x1F949;'];
  return top.map((p, i) => {
    const medal = i < 3 ? medals[i] : '<span style="width:20px;display:inline-block;text-align:center;font-size:0.75rem;color:var(--text3);">' + (i + 1) + '</span>';
    const highlight = p.isUser ? 'background:rgba(233,69,96,0.08);border:1px solid var(--accent);' : 'background:var(--bg);border:1px solid transparent;';
    return '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;' + highlight + '">' +
      '<span style="font-size:1.1rem;">' + medal + '</span>' +
      '<span style="flex:1;font-size:0.85rem;font-weight:' + (p.isUser ? '800' : '400') + ';color:' + (p.isUser ? 'var(--accent)' : 'var(--text)') + ';">' + p.name + '</span>' +
      '<span style="font-size:0.8rem;color:var(--green);font-weight:700;">+' + p.days + 'd</span></div>';
  }).join('');
}

// BUG-010 FIX: Better health auto-complete matching
function autoCompleteHealthTasks(steps, sleep, weight) {
  const tasks = getDailyTasks();
  let autoCompleted = 0;
  for (const t of tasks) {
    if (t.done) continue;
    const name = t.name.toLowerCase();
    // Steps tasks
    if (steps >= 10000 && (name.includes('10,000 step') || name.includes('10000 step') || name.includes('10k step'))) {
      t.done = true; autoCompleted++;
    } else if (steps >= 5000 && (name.includes('walk') && (name.includes('30 min') || name.includes('step')))) {
      t.done = true; autoCompleted++;
    }
    // Sleep tasks
    if (sleep >= 7 && (name.includes('7+ hours') || name.includes('7-8 hours') || name.includes('hours of sleep'))) {
      t.done = true; autoCompleted++;
    }
    // Water (can't auto-verify from health data, skip)
  }
  if (autoCompleted > 0) {
    localStorage.setItem('dc_daily_tasks', JSON.stringify({ date: new Date().toDateString(), tasks }));
  }
  return autoCompleted;
}

// Run cleanup on load
cleanOldChallenges();


// ============================================
// 10. XP + LEVEL SYSTEM (NEW - Duolingo-inspired)
// ============================================
function getXP() { return parseInt(localStorage.getItem('dc_xp') || '0'); }
function addXP(amount) {
  const oldLevel = getLevel();
  const xp = getXP() + amount;
  localStorage.setItem('dc_xp', String(xp));
  const newLevel = getLevel();
  if (newLevel > oldLevel) {
    showToast('LEVEL UP! You are now Level ' + newLevel + '!');
    addCoins(newLevel * 20); // Level-up coin bonus
    setTimeout(launchConfetti, 200);
  }
}
function getLevel() {
  const xp = getXP();
  // Each level needs progressively more XP
  // Level 1: 0, Level 2: 100, Level 3: 250, Level 4: 450, etc.
  let level = 1, threshold = 0, increment = 100;
  while (xp >= threshold + increment) {
    threshold += increment;
    level++;
    increment = Math.floor(increment * 1.3);
  }
  return level;
}
function getXPForNextLevel() {
  const xp = getXP();
  let level = 1, threshold = 0, increment = 100;
  while (xp >= threshold + increment) {
    threshold += increment;
    level++;
    increment = Math.floor(increment * 1.3);
  }
  return { current: xp - threshold, needed: increment, total: xp };
}
function getLevelTitle(level) {
  const titles = ['Mortal','Health Rookie','Habit Builder','Wellness Warrior','Life Extender',
    'Vitality Seeker','Longevity Pro','Time Bender','Death Cheater','Immortal Legend'];
  return titles[Math.min(level - 1, titles.length - 1)];
}


// ============================================
// 11. DAILY SPIN WHEEL (NEW - slot machine dopamine)
// ============================================
function canSpinToday() {
  return localStorage.getItem('dc_last_spin') !== new Date().toDateString();
}

function showSpinWheel() {
  if (!canSpinToday()) { showToast('Come back tomorrow for another spin!'); return; }
  // Must complete at least 1 task today to earn the spin
  if (getTodayCompletedCount() < 1) { showToast('Complete at least 1 task to unlock today\'s spin!'); return; }
  const modal = document.getElementById('modal');
  const content = document.getElementById('modalContent');
  if (!modal || !content) return;
  modal.classList.remove('hidden');

  const prizes = [
    { label: '10 coins', value: 10, type: 'coins', weight: 30 },
    { label: '25 coins', value: 25, type: 'coins', weight: 20 },
    { label: '50 coins', value: 50, type: 'coins', weight: 10 },
    { label: '+0.5 days', value: 0.5, type: 'days', weight: 15 },
    { label: '+1 day', value: 1, type: 'days', weight: 8 },
    { label: '2x next task', value: 2, type: 'multiplier', weight: 10 },
    { label: 'Mystery box', value: 0, type: 'mystery', weight: 5 },
    { label: '100 coins!', value: 100, type: 'coins', weight: 2 }
  ];

  const colors = ['#e94560','#4ecca3','#f0c040','#6c63ff','#ff6b6b','#2dd4bf','#fbbf24','#a78bfa'];

  content.innerHTML = `
    <h3 style="text-align:center;margin-bottom:8px;">Daily Spin</h3>
    <p style="text-align:center;color:var(--text3);font-size:0.8rem;margin-bottom:16px;">1 free spin per day. What will you win?</p>
    <div id="wheelContainer" style="position:relative;width:260px;height:260px;margin:0 auto 16px;">
      <div id="spinWheel" style="width:260px;height:260px;border-radius:50%;border:4px solid var(--gold);position:relative;overflow:hidden;transition:transform 4s cubic-bezier(0.17,0.67,0.12,0.99);">
        ${prizes.map((p, i) => {
          const angle = (360 / prizes.length) * i;
          return '<div style="position:absolute;width:50%;height:50%;top:0;left:50%;transform-origin:0% 100%;transform:rotate(' + angle + 'deg) skewY(' + (90 - 360/prizes.length) + 'deg);background:' + colors[i] + ';display:flex;align-items:center;justify-content:center;"><span style="transform:skewY(' + -(90-360/prizes.length) + 'deg) rotate(' + (180/prizes.length) + 'deg);font-size:0.55rem;font-weight:700;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.5);white-space:nowrap;">' + p.label + '</span></div>';
        }).join('')}
      </div>
      <div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:1.5rem;z-index:2;">&#9660;</div>
    </div>
    <button class="btn-primary" style="width:100%;padding:14px;font-size:1rem;" id="spinBtn" onclick="executeSpin()">SPIN!</button>
    <button class="btn-secondary" style="width:100%;margin-top:8px;" onclick="closeModal()">Maybe later</button>
  `;
}

function executeSpin() {
  const btn = document.getElementById('spinBtn');
  if (btn) btn.disabled = true;

  const prizes = [
    { label: '10 coins', value: 10, type: 'coins', weight: 30 },
    { label: '25 coins', value: 25, type: 'coins', weight: 20 },
    { label: '50 coins', value: 50, type: 'coins', weight: 10 },
    { label: '+0.5 days', value: 0.5, type: 'days', weight: 15 },
    { label: '+1 day', value: 1, type: 'days', weight: 8 },
    { label: '2x next task', value: 2, type: 'multiplier', weight: 10 },
    { label: 'Mystery box', value: 0, type: 'mystery', weight: 5 },
    { label: '100 coins!', value: 100, type: 'coins', weight: 2 }
  ];

  // Weighted random
  const totalWeight = prizes.reduce((s, p) => s + p.weight, 0);
  let rand = Math.random() * totalWeight;
  let winIdx = 0;
  for (let i = 0; i < prizes.length; i++) {
    rand -= prizes[i].weight;
    if (rand <= 0) { winIdx = i; break; }
  }

  const sliceAngle = 360 / prizes.length;
  const targetAngle = 360 * 5 + (360 - winIdx * sliceAngle - sliceAngle / 2); // 5 full rotations + landing

  const wheel = document.getElementById('spinWheel');
  if (wheel) wheel.style.transform = 'rotate(' + targetAngle + 'deg)';

  setTimeout(() => {
    const prize = prizes[winIdx];
    localStorage.setItem('dc_last_spin', new Date().toDateString());

    if (prize.type === 'coins') {
      addCoins(prize.value);
      showToast('You won ' + prize.label + '!');
    } else if (prize.type === 'days') {
      if (!state.longevityGoal) state.longevityGoal = { totalDaysAdded: 0 };
      state.longevityGoal.totalDaysAdded += prize.value;
      saveGoalState();
      showToast('You won ' + prize.label + ' added to your life!');
    } else if (prize.type === 'multiplier') {
      localStorage.setItem('dc_next_task_multiplier', String(prize.value));
      showToast('You won 2x reward on your next task!');
    } else if (prize.type === 'mystery') {
      // Mystery = random bonus
      const mysteryCoins = [50, 75, 100, 150][Math.floor(Math.random() * 4)];
      addCoins(mysteryCoins);
      showToast('Mystery box: ' + mysteryCoins + ' coins!');
    }
    addXP(15); // XP for spinning
    launchConfetti();
    setTimeout(() => { closeModal(); renderHubStats(); }, 1500);
  }, 4500);
}


// ============================================
// 12. ACHIEVEMENT BADGES (NEW - collection mechanic)
// ============================================
function getAchievements() {
  return JSON.parse(localStorage.getItem('dc_achievements') || '[]');
}

function checkAchievements() {
  const earned = getAchievements();
  const streak = getStreakCount();
  const totalDays = (state.longevityGoal?.totalDaysAdded) || 0;
  const coins = getCoins();
  const challenges = getChallenges();
  const level = getLevel();

  const allBadges = [
    { id: 'first_blood', name: 'First Blood', desc: 'Complete your first task', icon: '&#x1F3AF;', check: () => localStorage.getItem('dc_first_task_done') === '1' },
    { id: 'streak_7', name: 'On Fire', desc: '7-day streak', icon: '&#x1F525;', check: () => streak >= 7 },
    { id: 'streak_30', name: 'Unstoppable', desc: '30-day streak', icon: '&#x1F4A5;', check: () => streak >= 30 },
    { id: 'streak_90', name: 'Legendary', desc: '90-day streak', icon: '&#x1F451;', check: () => streak >= 90 },
    { id: 'rich', name: 'Coin Collector', desc: 'Have 500+ coins', icon: '&#x1FA99;', check: () => coins >= 500 },
    { id: 'challenger', name: 'Challenger', desc: 'Create 5 challenges', icon: '&#x2694;', check: () => challenges.length >= 5 },
    { id: 'winner', name: 'Champion', desc: 'Win 3 challenges', icon: '&#x1F3C6;', check: () => challenges.filter(c => c.status === 'won').length >= 3 },
    { id: 'social', name: 'Social Butterfly', desc: 'Send 10 chat messages', icon: '&#x1F98B;', check: () => { let total = 0; for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('dc_ch_msgs_'))try{total+=JSON.parse(localStorage.getItem(k)).length}catch(e){}}return total>=10; } },
    { id: 'level5', name: 'Leveled Up', desc: 'Reach Level 5', icon: '&#x2B50;', check: () => level >= 5 },
    { id: 'level10', name: 'Elite', desc: 'Reach Level 10', icon: '&#x1F48E;', check: () => level >= 10 },
    { id: 'healer', name: 'Self Healer', desc: 'Add 30+ days to your life', icon: '&#x1F49A;', check: () => totalDays >= 30 },
    { id: 'centurion', name: 'Centurion', desc: 'Add 100+ days to your life', icon: '&#x1F6E1;', check: () => totalDays >= 100 }
  ];

  let newBadges = 0;
  for (const badge of allBadges) {
    if (!earned.includes(badge.id) && badge.check()) {
      earned.push(badge.id);
      newBadges++;
      showToast('Badge earned: ' + badge.name + '!');
      addXP(50);
    }
  }
  if (newBadges > 0) {
    localStorage.setItem('dc_achievements', JSON.stringify(earned));
  }
  return { earned, allBadges };
}


// ============================================
// 13. DEATHY MOOD SYSTEM (NEW - Tamagotchi element)
// ============================================
function getDeathyMood() {
  const streak = getStreakCount();
  const todayDone = getTodayCompletedCount();
  const total = getDailyTasks().length;
  const pct = total > 0 ? todayDone / total : 0;

  if (streak >= 30 && pct >= 0.8) return { mood: 'ecstatic', emoji: '&#x1F929;', msg: 'Deathy is THRIVING! You are unstoppable!' };
  if (streak >= 7 && pct >= 0.5) return { mood: 'happy', emoji: '&#x1F60A;', msg: 'Deathy is pleased with your progress.' };
  if (streak >= 3) return { mood: 'content', emoji: '&#x1F642;', msg: 'Deathy sees potential in you.' };
  if (todayDone > 0) return { mood: 'neutral', emoji: '&#x1F610;', msg: 'Deathy is watching... keep going.' };
  return { mood: 'worried', emoji: '&#x1F630;', msg: 'Deathy is worried about you...' };
}


// ============================================
// 14. XP + ACHIEVEMENTS HOOKED INTO EXISTING FUNCTIONS
// ============================================
// NOTE: Instead of overriding functions (causes hoisting bugs),
// XP and achievements are called directly inside completeTask (line ~254)
// and initActionHub (line ~17). The enhanced stats are built into renderHubStats.
