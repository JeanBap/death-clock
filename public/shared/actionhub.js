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
}

function renderHubTabs() {
  const c = document.getElementById('hubTabs');
  if (!c) return;
  const tabs = [
    { id: 'today', label: "Today's Tasks" },
    { id: 'challenges', label: 'Challenges' },
    { id: 'progress', label: 'Progress' },
    { id: 'feed', label: 'Friend Feed' },
    { id: 'health', label: 'Health Data' },
    { id: 'report', label: 'Weekly Report' },
    { id: 'shop', label: 'Rewards' }
  ];
  c.innerHTML = tabs.map(t =>
    '<button class="' + (t.id === hubTab ? 'active' : '') + '" onclick="switchHubTab(\'' + t.id + '\')">' + t.label + '</button>'
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

  showToast('+' + daysReward.toFixed(1) + ' days | +' + coinReward + ' coins' + (comboBonus > 0 ? ' | COMBO +' + comboBonus : ''));

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

  let onboardHtml = '';
  if (isFirstVisit || (streak <= 1 && done === 0)) {
    onboardHtml = `
      <div class="onboard-card">
        <h3>Welcome to your Action Hub</h3>
        <p>Complete daily tasks to add days to your life. Each task is based on your health profile. Tap a task to mark it done and earn coins.</p>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
          <span class="combo-badge mult-1_5x">7-day streak = 1.5x coins</span>
          <span class="combo-badge mult-2x">30 days = 2x</span>
          <span class="combo-badge mult-3x">90 days = 3x</span>
        </div>
      </div>`;
  }

  c.innerHTML = `
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
  showToast('Challenge created! ' + stake + ' coins staked.');
  addCoins(-stake);
  renderHubStats();
  return challenge;
}

function renderChallengesTab(c) {
  const challenges = getChallenges();
  const active = challenges.filter(ch => ch.status === 'active');
  const completed = challenges.filter(ch => ch.status !== 'active');

  c.innerHTML = `
    <div class="hub-panel" style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3>Active Challenges</h3>
        <button class="btn-primary btn-sm" onclick="showNewChallengeModal()">New Challenge</button>
      </div>
      ${active.length === 0 ? '<p style="color:var(--text3);font-size:0.85rem;text-align:center;padding:20px;">No active challenges yet. Challenge a friend to a health bet!</p>' : ''}
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
      ${ch.status === 'active' ? '<div style="display:flex;gap:6px;margin-top:8px;"><button class="btn-sm btn-green" style="flex:1;font-size:0.7rem;" onclick="logChallengeProgress(\'' + ch.id + '\')">Log Progress</button><button class="btn-sm btn-secondary" style="font-size:0.7rem;" onclick="nudgeChallenger(\'' + ch.id + '\')">Nudge</button></div>' : ''}
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

  content.innerHTML = `
    <h3 style="margin-bottom:12px;">Create a Challenge</h3>
    <p style="color:var(--text2);font-size:0.85rem;margin-bottom:12px;">Pick a category, set the terms, stake your coins.</p>

    <label style="font-size:0.8rem;color:var(--text3);display:block;margin-bottom:4px;">Category</label>
    <div class="bet-modal-cat" id="betCats">
      ${cats.map(c => '<button class="' + (c === preselectedCat ? 'sel' : '') + '" onclick="selectBetCat(\'' + c + '\')">' + c.charAt(0).toUpperCase() + c.slice(1) + '</button>').join('')}
    </div>

    <label style="font-size:0.8rem;color:var(--text3);display:block;margin-bottom:4px;">Challenge</label>
    <select id="betChallenge" style="width:100%;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);margin-bottom:12px;font-size:0.85rem;">
      ${(challenges[preselectedCat || 'fitness'] || challenges.fitness).map(ch => '<option>' + ch + '</option>').join('')}
    </select>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
      <div>
        <label style="font-size:0.8rem;color:var(--text3);display:block;margin-bottom:4px;">Stake (coins)</label>
        <input type="number" id="betStake" value="50" min="10" max="500" style="width:100%;padding:10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:0.85rem;">
      </div>
      <div>
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

    <button class="btn-primary" style="width:100%;padding:12px;" onclick="submitChallenge()">Create Challenge</button>
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
  const stake = parseInt(document.getElementById('betStake')?.value || '50');
  const duration = parseInt(document.getElementById('betDuration')?.value || '7');
  const opponent = document.getElementById('betOpponent')?.value.trim() || 'Anyone';
  const challenge = document.getElementById('betChallenge')?.value || 'Health challenge';
  const coins = getCoins();

  if (stake > coins) { showToast('Not enough coins! You have ' + coins); return; }
  if (stake < 10) { showToast('Minimum stake is 10 coins'); return; }

  createChallenge(challenge, duration, stake, duration, opponent);
  closeModal();
  switchHubTab('challenges');
}

function logChallengeProgress(chId) {
  const challenges = getChallenges();
  const ch = challenges.find(c => c.id === chId);
  if (!ch) return;
  ch.progress = (ch.progress || 0) + 1;
  // Simulate opponent progress
  if (Math.random() > 0.4) ch.opponentProgress = (ch.opponentProgress || 0) + 1;
  // Check if challenge ended
  if (new Date(ch.expires) < new Date()) {
    ch.status = ch.progress > ch.opponentProgress ? 'won' : ch.progress < ch.opponentProgress ? 'lost' : 'draw';
    if (ch.status === 'won') {
      addCoins(ch.pot);
      showToast('You won the challenge! +' + ch.pot + ' coins!');
    } else if (ch.status === 'draw') {
      addCoins(ch.stake);
      showToast('Draw! Stake returned.');
    } else {
      showToast('You lost the challenge. Better luck next time!');
    }
  } else {
    showToast('Progress logged! ' + ch.progress + ' and counting.');
  }
  saveChallenges(challenges);
  const c = document.getElementById('hubContent');
  if (c) renderChallengesTab(c);
}

function nudgeChallenger(chId) {
  showToast('Nudge sent! Your opponent has been poked.');
}

// Group challenges (#9)
function getGroupChallenges() {
  try { return JSON.parse(localStorage.getItem('dc_group_challenges') || '[]'); } catch(e) { return []; }
}

function renderGroupChallenges() {
  const groups = getGroupChallenges();
  if (groups.length === 0) return '<p style="color:var(--text3);font-size:0.8rem;">No team challenges yet.</p>';
  return groups.map(g => `
    <div style="padding:12px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong style="font-size:0.85rem;">${escHtml(g.name)}</strong>
        <span style="font-size:0.7rem;color:var(--text3);">${g.members.length} members</span>
      </div>
      <div style="font-size:0.8rem;color:var(--text2);margin-top:4px;">${escHtml(g.goal)}</div>
      <div class="progress-bar-sm" style="margin-top:6px;"><div class="fill" style="width:${Math.round((g.progress/g.target)*100)}%;background:var(--green);"></div></div>
      <div style="font-size:0.7rem;color:var(--text3);margin-top:4px;">${g.progress}/${g.target} ${g.unit}</div>
    </div>
  `).join('');
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

  // Auto-complete relevant tasks
  const tasks = getDailyTasks();
  let autoCompleted = 0;
  if (steps >= 10000) {
    const stepTask = tasks.find(t => !t.done && t.name.toLowerCase().includes('step'));
    if (stepTask) { stepTask.done = true; autoCompleted++; }
  }
  if (steps >= 5000) {
    const walkTask = tasks.find(t => !t.done && t.name.toLowerCase().includes('walk'));
    if (walkTask) { walkTask.done = true; autoCompleted++; }
  }
  if (sleep >= 7) {
    const sleepTask = tasks.find(t => !t.done && t.name.toLowerCase().includes('sleep') || t.name.toLowerCase().includes('7'));
    if (sleepTask) { sleepTask.done = true; autoCompleted++; }
  }
  if (autoCompleted > 0) {
    localStorage.setItem('dc_daily_tasks', JSON.stringify({ date: new Date().toDateString(), tasks }));
  }

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

  // Seed with demo data if empty
  if (feed.length === 0) {
    const demoFeed = [
      { user: 'Alex', action: 'completed 5 tasks', detail: '+4.2 days added', time: new Date(Date.now() - 3600000).toISOString(), reactions: { fire: 2 } },
      { user: 'Sam', action: 'started a challenge', detail: 'Walk 10k steps daily for 7 days', time: new Date(Date.now() - 7200000).toISOString(), reactions: {} },
      { user: 'Jordan', action: 'hit a 14-day streak', detail: '2x multiplier unlocked!', time: new Date(Date.now() - 14400000).toISOString(), reactions: { clap: 5 } },
      { user: 'Taylor', action: 'won a challenge vs Chris', detail: '+100 coins earned', time: new Date(Date.now() - 28800000).toISOString(), reactions: { trophy: 3 } },
      { user: 'Morgan', action: 'added 30+ days total', detail: 'Tree milestone unlocked!', time: new Date(Date.now() - 43200000).toISOString(), reactions: { heart: 4 } }
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
      streak = (lastVisit === yesterday) ? streak + 1 : 1;
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
  const hasInsurance = localStorage.getItem('dc_streak_insurance') === 'true';

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
  localStorage.setItem('dc_streak_insurance', 'true');
  showToast('Streak insurance purchased! You get 1 skip per month.');
  renderHubStats();
  const c = document.getElementById('hubContent');
  if (c && hubTab === 'today') renderTodayTab(c);
}


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

// Daily free coins
(function checkDailyCoins() {
  const today = new Date().toDateString();
  const lastCoin = localStorage.getItem('dc_last_daily_coin');
  if (lastCoin !== today) {
    addCoins(10);
    localStorage.setItem('dc_last_daily_coin', today);
  }
})();
