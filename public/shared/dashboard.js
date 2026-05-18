function renderDashboard() {
  if (!state.result) { showPage('home'); return; }
  const r = state.result;
  const scoreColor = r.lifeScore > 70 ? 'var(--green)' : r.lifeScore > 40 ? 'var(--gold)' : 'var(--accent)';

  // Nudge bar: habits due + stale quiz + challenge prompt
  renderDashboardNudge();

  document.getElementById('dashStats').innerHTML = `
    <div class="stat-card"><div class="stat-num" style="color:var(--accent)">${r.remainingYears}</div><div class="stat-label">Years Remaining</div></div>
    <div class="stat-card"><div class="stat-num" style="color:${scoreColor}">${r.lifeScore}</div><div class="stat-label">Life Score</div></div>
    <div class="stat-card"><div class="stat-num" style="color:var(--green)">+${state.longevityGoal ? state.longevityGoal.totalDaysAdded.toFixed(1) : '0'}</div><div class="stat-label">Days Added</div><div style="font-size:0.7rem; color:var(--text3);">${state.longevityGoal ? '+' + Math.round(state.longevityGoal.totalDaysAdded * 1440) + ' min' : ''}</div></div>
    <div class="stat-card"><div class="stat-num" style="color:var(--gold)">${state.longevityGoal ? getStreakInfo().streak : 0}</div><div class="stat-label">Day Streak</div></div>
  `;
  showTab(state.currentTab);
  // Update dashboard stats with performance data
  const g2 = state.longevityGoal;
  if (g2) {
    const { streak: s2 } = getStreakInfo();
    const ds = document.getElementById('dashStats');
    if (ds) {
      const statsHtml = '<div class="stat-card"><div class="stat-num" style="color:var(--accent)">' + r.remainingYears + '</div><div class="stat-label">Years Left</div></div>' +
        '<div class="stat-card"><div class="stat-num" style="color:' + scoreColor + '">' + r.lifeScore + '</div><div class="stat-label">Life Score</div></div>' +
        '<div class="stat-card"><div class="stat-num" style="color:var(--green)">+' + g2.totalDaysAdded.toFixed(1) + '</div><div class="stat-label">Days Added</div><div style="font-size:0.7rem;color:var(--text3);">+' + Math.round(g2.totalDaysAdded * 1440) + ' min</div></div>' +
        '<div class="stat-card"><div class="stat-num" style="color:var(--gold)">' + s2 + '</div><div class="stat-label">Day Streak</div></div>';
      ds.innerHTML = statsHtml;
    }
  }
}

function showTab(tab) {
  state.currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(t => { if(t.textContent.toLowerCase().includes(tab.replace('bucketlist','bucket').replace('myplan','my plan'))) t.classList.add('active'); });

  const el = document.getElementById('tabContent');
  if (tab === 'factors') renderFactorsTab(el);
  else if (tab === 'bucketlist') renderBucketTab(el);
  else if (tab === 'myplan') renderMyPlanTab(el);
  else if (tab === 'tips') renderTipsTab(el);
  else if (tab === 'performance') renderPerformanceTab(el);
  else if (tab === 'products') renderProductsTab(el);
}

function renderFactorsTab(el) {
  const r = state.result;
  const sorted = [...r.factors].sort((a,b) => a.impact - b.impact);
  el.innerHTML = `
    <div style="margin-bottom:16px; color:var(--text2)">All ${r.factors.length} factors analyzed in your calculation:</div>
    ${sorted.map(f => {
      const cls = f.impact > 0 ? 'positive' : f.impact < 0 ? 'negative' : '';
      const sign = f.impact > 0 ? '+' : '';
      return `<div class="factor-card ${cls}" style="margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div class="factor-name" style="font-weight:600; color:var(--text)">${f.label}</div>
            <div class="factor-tip">${f.tip}</div>
          </div>
          <div class="factor-impact ${cls}" style="white-space:nowrap; margin-left:16px;">${sign}${f.impact} yrs</div>
        </div>
      </div>`;
    }).join('')}
    <div style="margin-top:16px; padding:16px; background:var(--surface); border-radius:var(--radius); text-align:center;">
      <div style="color:var(--text2)">Net Impact</div>
      <div style="font-size:2rem; font-weight:800; color:${r.totalAdjust >= 0 ? 'var(--green)' : 'var(--accent)'}">
        ${r.totalAdjust >= 0 ? '+' : ''}${r.totalAdjust.toFixed(1)} years
      </div>
    </div>
  `;
}

function renderBucketTab(el) {
  const items = state.bucketList;
  el.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <span style="color:var(--text2)">${items.length}/10 items (Free tier)</span>
      <button class="btn-primary btn-sm" onclick="openBucketModal()">+ Add Item</button>
    </div>
    ${items.length === 0 ? '<div style="text-align:center; padding:40px; color:var(--text3)">No bucket list items yet. What do you want to do before you die?</div>' :
      items.map((item, i) => `
        <div class="bucket-item">
          <div class="bucket-check ${item.done ? 'done' : ''}" onclick="toggleBucket(${i})">${item.done ? '&#10003;' : ''}</div>
          <div class="bucket-info">
            <div class="bucket-title ${item.done ? 'done' : ''}">${item.title}</div>
            <div class="bucket-meta">
              <span class="bucket-category">${item.category}</span>
              <span>${item.priority}</span>
              ${item.targetDate ? `<span>Target: ${item.targetDate}</span>` : ''}
            </div>
            ${item.description ? `<div style="font-size:0.85rem; color:var(--text3); margin-top:4px;">${item.description}</div>` : ''}
          </div>
          <button class="bucket-delete" onclick="deleteBucket(${i})">&#10005;</button>
        </div>
      `).join('')}
  `;
}

function renderGoalsTab(el) {
  const g = state.goals;
  el.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <span style="color:var(--text2)">${g.length}/3 goals (Free tier)</span>
      <button class="btn-primary btn-sm" onclick="openGoalModal()">+ Add Goal</button>
    </div>
    ${g.length === 0 ? '<div style="text-align:center; padding:40px; color:var(--text3)">No goals set yet. What will you achieve with your remaining time?</div>' :
      g.map((goal, i) => `
        <div class="goal-card">
          <div class="goal-header">
            <div class="goal-title">${goal.title}</div>
            <div class="goal-impact">${goal.lifeImpact ? '+' + goal.lifeImpact + ' years potential' : ''}</div>
          </div>
          ${goal.description ? `<div style="color:var(--text2); font-size:0.9rem; margin-bottom:8px;">${goal.description}</div>` : ''}
          <div class="goal-progress-bar"><div class="goal-progress-fill" style="width:${goal.progress}%"></div></div>
          <div class="goal-meta">
            <span>${goal.progress}% complete</span>
            <span>${goal.category} | ${goal.timeline}</span>
          </div>
          <div style="margin-top:12px; display:flex; gap:8px;">
            <button class="btn-sm btn-secondary" onclick="updateGoalProgress(${i}, -10)">-10%</button>
            <button class="btn-sm btn-green" onclick="updateGoalProgress(${i}, 10)">+10%</button>
            <button class="btn-sm bucket-delete" onclick="deleteGoal(${i})">Delete</button>
          </div>
        </div>
      `).join('')}
  `;
}

function renderTipsTab(el) {
  // Get user's weakest categories
  const negFactors = state.result.factors.filter(f => f.impact < 0);
  const weakCats = [...new Set(negFactors.map(f => f.cat))];
  const relevantTips = tipsDB.filter(t => weakCats.includes(t.cat));
  const otherTips = tipsDB.filter(t => !weakCats.includes(t.cat));
  const allTips = [...relevantTips, ...otherTips];

  el.innerHTML = `
    <div style="color:var(--text2); margin-bottom:16px;">Tips personalized to your biggest risk factors:</div>
    ${allTips.map(t => `
      <div class="tip-card" style="${relevantTips.includes(t) ? '' : 'opacity:0.7; border-left-color:var(--border);'}">
        <div class="tip-header">
          <div class="tip-title">${t.title}</div>
          <div class="tip-years">+${t.years} years</div>
        </div>
        <div class="tip-content">${t.content}</div>
        <span class="tip-difficulty">${t.difficulty}</span>
        ${relevantTips.includes(t) ? ' <span style="font-size:0.75rem; color:var(--accent); margin-left:8px;">Recommended for you</span>' : ''}
      </div>
    `).join('')}
  `;
}

function renderProductsTab(el) {
  // Get user's weakest categories and match products
  const negFactors = state.result.factors.filter(f => f.impact < 0 && f.productCat);
  const weakProductCats = [...new Set(negFactors.map(f => f.productCat))];
  const recommended = products.filter(p => weakProductCats.some(c => p.factorCat === c));
  const others = products.filter(p => !recommended.includes(p));
  const allProducts = [...recommended, ...others];

  el.innerHTML = `
    <div style="color:var(--text2); margin-bottom:16px;">Products and services that could help extend your lifespan:</div>
    <div class="product-grid">
      ${allProducts.map(p => `
        <div class="product-card" ${recommended.includes(p) ? 'style="border-color:var(--green);"' : ''}>
          ${recommended.includes(p) ? '<div style="font-size:0.7rem; color:var(--green); font-weight:600; margin-bottom:8px;">RECOMMENDED FOR YOU</div>' : ''}
          <div class="product-category-badge">${p.category}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-impact">Could add ${p.impact}</div>
          <div class="product-desc">${p.desc}</div>
          <div class="product-price">${p.price}</div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
            <span style="color:var(--gold);">${'&#9733;'.repeat(Math.floor(p.rating))}</span>
            <span style="color:var(--text3); font-size:0.85rem;">${p.rating}/5</span>
          </div>
          <button class="btn-primary btn-sm product-cta" onclick="trackAffiliateClick('${p.name}')">Learn More</button>
        </div>
      `).join('')}
    </div>
    <div class="affiliate-disclosure">
      <strong>Affiliate Disclosure:</strong> Some links on this page are affiliate links. We may earn a commission at no extra cost to you. We only recommend products we believe can genuinely improve your health and longevity.
    </div>
  `;
}

function trackAffiliateClick(productName) {
  console.log('Affiliate click:', productName);
  // In production, this would log to Supabase
  alert('This would redirect to ' + productName + ' (affiliate link). In production, this tracks the click in Supabase and redirects via affiliate URL.');
}

function openBucketModal() {
  if (state.bucketList.length >= 10) {
    alert('Free tier limit: 10 bucket list items. Upgrade to Premium for unlimited!');
    return;
  }
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modalContent').innerHTML = `
    <h3>Add Bucket List Item</h3>
    <div class="form-group"><label>What do you want to do?</label><input type="text" id="bucketTitle" placeholder="e.g. Visit the Northern Lights"></div>
    <div class="form-group"><label>Description (optional)</label><textarea id="bucketDesc" rows="2" placeholder="Why this matters to you..."></textarea></div>
    <div class="form-group"><label>Category</label>
      <select id="bucketCat"><option>travel</option><option>experience</option><option>achievement</option><option>relationship</option><option>creative</option><option>other</option></select>
    </div>
    <div class="form-group"><label>Priority</label>
      <select id="bucketPri"><option value="must_do">Must Do</option><option value="want_to" selected>Want To</option><option value="dream">Dream</option></select>
    </div>
    <div class="form-group"><label>Target Date (optional)</label><input type="date" id="bucketDate"></div>
    <div class="form-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveBucket()">Add Item</button>
    </div>
  `;
}

function saveBucket() {
  const title = document.getElementById('bucketTitle').value.trim();
  if (!title) return;
  state.bucketList.push({
    title,
    description: document.getElementById('bucketDesc').value.trim(),
    category: document.getElementById('bucketCat').value,
    priority: document.getElementById('bucketPri').value,
    targetDate: document.getElementById('bucketDate').value,
    done: false
  });
  closeModal();
  showTab('bucketlist');
}

function toggleBucket(i) {
  state.bucketList[i].done = !state.bucketList[i].done;
  showTab('bucketlist');
  renderDashboard();
}

function deleteBucket(i) {
  state.bucketList.splice(i, 1);
  showTab('bucketlist');
}

function openGoalModal() {
  if (state.goals.length >= 3) {
    alert('Free tier limit: 3 goals. Upgrade to Premium for unlimited!');
    return;
  }
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modalContent').innerHTML = `
    <h3>Add Personal Goal</h3>
    <div class="form-group"><label>Goal</label><input type="text" id="goalTitle" placeholder="e.g. Run a 5K in under 30 minutes"></div>
    <div class="form-group"><label>Description (optional)</label><textarea id="goalDesc" rows="2" placeholder="What achieving this means to you..."></textarea></div>
    <div class="form-group"><label>Category</label>
      <select id="goalCat"><option>health</option><option>career</option><option>financial</option><option>relationship</option><option>personal_growth</option><option>other</option></select>
    </div>
    <div class="form-group"><label>Timeline</label>
      <select id="goalTimeline"><option value="30_days">30 Days</option><option value="90_days">90 Days</option><option value="1_year" selected>1 Year</option><option value="5_years">5 Years</option><option value="lifetime">Lifetime</option></select>
    </div>
    <div class="form-group"><label>Estimated life impact (years)</label><input type="number" id="goalImpact" step="0.5" placeholder="e.g. 2" min="0" max="10"></div>
    <div class="form-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveGoal()">Add Goal</button>
    </div>
  `;
}

function saveGoal() {
  const title = document.getElementById('goalTitle').value.trim();
  if (!title) return;
  state.goals.push({
    title,
    description: document.getElementById('goalDesc').value.trim(),
    category: document.getElementById('goalCat').value,
    timeline: document.getElementById('goalTimeline').value,
    lifeImpact: parseFloat(document.getElementById('goalImpact').value) || 0,
    progress: 0
  });
  closeModal();
  showTab('goals');
}

function updateGoalProgress(i, delta) {
  state.goals[i].progress = Math.max(0, Math.min(100, state.goals[i].progress + delta));
  if (state.goals[i].progress === 100) state.goals[i].status = 'completed';
  showTab('goals');
}

function deleteGoal(i) {
  state.goals.splice(i, 1);
  showTab('goals');
}

// closeModal() defined in core.js - removed duplicate (BUG-021 FIX)

// ============================================
function generateCheatDeathPlan(result, targetAge) {
  const currentProjected = parseFloat(result.adjustedLE);
  const gap = targetAge - currentProjected;
  const a = state.answers;
  const potentialHabits = [];

  // Scan for improvable habits based on user's current answers
  // Exercise improvements
  if (a.exercise !== '5+') potentialHabits.push({ id: 'walk_30', name: 'Walk 30 minutes', dailyImpact: 3/365.25, annualImpact: 3, cat: 'fitness', difficulty: 'easy', source: 'VA study, n=719,147', icon: '\u{1F6B6}' });
  if (!['tennis','badminton','soccer'].includes(a.sport)) potentialHabits.push({ id: 'social_sport', name: 'Play a social sport', dailyImpact: 4.7/365.25, annualImpact: 4.7, cat: 'fitness', difficulty: 'medium', source: 'Copenhagen study, n=8,577', icon: '\u{1F3BE}' });

  // Diet improvements
  if (a.diet !== 'very_healthy') potentialHabits.push({ id: 'eat_veggies', name: 'Eat 5+ servings of vegetables', dailyImpact: 3/365.25, annualImpact: 3, cat: 'diet', difficulty: 'easy', source: 'Harvard meta-analysis', icon: '\u{1F966}' });
  if (['high','very_high'].includes(a.processed_food)) potentialHabits.push({ id: 'reduce_upf', name: 'Avoid ultra-processed food today', dailyImpact: 2/365.25, annualImpact: 2, cat: 'diet', difficulty: 'medium', source: 'BMJ meta-analysis, 18 studies', icon: '\u{1F34E}' });
  if (a.omega3 === 'low') potentialHabits.push({ id: 'omega3', name: 'Take omega-3 supplement or eat fish', dailyImpact: 3/365.25, annualImpact: 3, cat: 'diet', difficulty: 'easy', source: 'Framingham study, n=2,240', icon: '\u{1F41F}' });
  if (a.hydration !== 'good') potentialHabits.push({ id: 'hydrate', name: 'Drink 8+ glasses of water', dailyImpact: 2/365.25, annualImpact: 2, cat: 'body', difficulty: 'easy', source: 'NIH ARIC, n=15,752', icon: '\u{1F4A7}' });

  // Sleep improvements
  if (a.sleep_hours === 'short' || a.sleep_hours === 'moderate_short') potentialHabits.push({ id: 'sleep_schedule', name: 'Be in bed by 11pm (7+ hrs sleep)', dailyImpact: 2/365.25, annualImpact: 2, cat: 'sleep', difficulty: 'medium', source: 'Sleep Foundation meta-analysis', icon: '\u{1F634}' });

  // Mental health
  if (a.stress_mgmt !== 'yes') potentialHabits.push({ id: 'meditate', name: 'Meditate for 10 minutes', dailyImpact: 1.5/365.25, annualImpact: 1.5, cat: 'mental', difficulty: 'easy', source: 'VA study', icon: '\u{1F9D8}' });
  if (a.gratitude !== 'high') potentialHabits.push({ id: 'gratitude', name: 'Write 3 things you are grateful for', dailyImpact: 2/365.25, annualImpact: 2, cat: 'mental', difficulty: 'easy', source: 'JAMA Psychiatry, n=49,275', icon: '\u{1F4DD}' });

  // Social
  if (a.social !== 'strong') potentialHabits.push({ id: 'social_time', name: 'Connect with a friend or family member', dailyImpact: 2/365.25, annualImpact: 2, cat: 'social', difficulty: 'easy', source: 'Harvard 80-year study', icon: '\u{1F465}' });

  // Substances
  if (a.smoking && a.smoking.startsWith('current')) potentialHabits.push({ id: 'no_smoke', name: 'No cigarettes today', dailyImpact: 8/365.25, annualImpact: 8, cat: 'substances', difficulty: 'hard', source: 'Lancet, n=599,912', icon: '\u{1F6AD}' });
  if (a.alcohol === 'heavy') potentialHabits.push({ id: 'no_heavy_drink', name: 'Max 2 drinks today', dailyImpact: 3/365.25, annualImpact: 3, cat: 'substances', difficulty: 'medium', source: 'Lancet, n=599,912', icon: '\u{1F377}' });

  // Body
  if (a.dental !== 'excellent') potentialHabits.push({ id: 'floss', name: 'Floss your teeth', dailyImpact: 1.5/365.25, annualImpact: 1.5, cat: 'body', difficulty: 'easy', source: 'Leisure World, n=5,611', icon: '\u{1F9B7}' });

  // Nature
  if (a.nature !== 'high') potentialHabits.push({ id: 'nature', name: 'Spend 20 minutes in nature', dailyImpact: 2/365.25, annualImpact: 2, cat: 'environment', difficulty: 'easy', source: 'Lancet, n=4.6M', icon: '\u{1F33F}' });

  // Screen time
  if (['high','very_high'].includes(a.screen_time)) potentialHabits.push({ id: 'screen_limit', name: 'Keep screen time under 2 hours', dailyImpact: 1.5/365.25, annualImpact: 1.5, cat: 'environment', difficulty: 'medium', source: 'BJSM', icon: '\u{1F4F5}' });

  // Sort by impact descending, take top 7
  potentialHabits.sort((a,b) => b.annualImpact - a.annualImpact);
  return potentialHabits.slice(0, 7);
}

function getStreakInfo() {
  const g = state.longevityGoal;
  if (!g || !g.logs) return { streak: 0, multiplier: 1 };
  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  let d = new Date();
  // Check backwards from yesterday (today might not be logged yet)
  d.setDate(d.getDate() - 1);
  while (true) {
    const key = d.toISOString().split('T')[0];
    const dayLog = g.logs[key];
    if (!dayLog || dayLog.length === 0) break;
    // Need at least 50% of habits logged
    if (dayLog.length >= Math.ceil(g.plan.length * 0.5)) {
      streak++;
    } else {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  // Check if today has any logs (extend streak)
  const todayLog = g.logs[today];
  if (todayLog && todayLog.length >= Math.ceil(g.plan.length * 0.5)) {
    streak++;
  }
  let multiplier = 1;
  if (streak >= 365) multiplier = 3;
  else if (streak >= 90) multiplier = 2.5;
  else if (streak >= 30) multiplier = 2;
  else if (streak >= 7) multiplier = 1.5;
  return { streak, multiplier };
}

function getTodayKey() { return new Date().toISOString().split('T')[0]; }
function toggleHabit(habitId) {
  const g = state.longevityGoal;
  if (!g) return;
  const today = getTodayKey();
  if (!g.logs[today]) g.logs[today] = [];
  const idx = g.logs[today].indexOf(habitId);
  if (idx >= 0) {
    g.logs[today].splice(idx, 1);
    DeathySounds.play('habit_undo');
  } else {
    g.logs[today].push(habitId);
    // Show float animation
    showHabitFloat(habitId);
    DeathySounds.play('habit_done');
  }
  recalcTotalDaysAdded();
  saveGoalState();
  updateDeathyAvatar();
  showTab('myplan');
}

function showHabitFloat(habitId) {
  const habit = state.longevityGoal.plan.find(h => h.id === habitId);
  if (!habit) return;
  const { multiplier } = getStreakInfo();
  const impact = (habit.dailyImpact * multiplier).toFixed(3);
  const el = document.createElement('div');
  el.className = 'habit-float';
  el.textContent = '+' + impact + ' days';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

function recalcTotalDaysAdded() {
  const g = state.longevityGoal;
  if (!g) return;
  let total = 0;
  const sortedDates = Object.keys(g.logs).sort();
  for (const dateKey of sortedDates) {
    const dayHabits = g.logs[dateKey];
    // Calculate streak up to this date to get multiplier
    let streakAtDate = 0;
    let d = new Date(dateKey);
    d.setDate(d.getDate() - 1);
    while (true) {
      const k = d.toISOString().split('T')[0];
      const dl = g.logs[k];
      if (!dl || dl.length < Math.ceil(g.plan.length * 0.5)) break;
      streakAtDate++;
      d.setDate(d.getDate() - 1);
    }
    let mult = 1;
    if (streakAtDate >= 365) mult = 3;
    else if (streakAtDate >= 90) mult = 2.5;
    else if (streakAtDate >= 30) mult = 2;
    else if (streakAtDate >= 7) mult = 1.5;

    for (const hid of dayHabits) {
      const habit = g.plan.find(h => h.id === hid);
      if (habit) total += habit.dailyImpact * mult;
    }
  }
  g.totalDaysAdded = total;
}

function setLongevityGoal(targetAge) {
  const plan = generateCheatDeathPlan(state.result, targetAge);
  state.longevityGoal = {
    targetAge,
    currentProjected: parseFloat(state.result.adjustedLE),
    plan,
    logs: {},
    totalDaysAdded: 0,
    createdAt: new Date().toISOString()
  };
  saveGoalState();
  showTab('myplan');
}

function renderGoalSetup() {
  const r = state.result;
  const currentAge = parseFloat(r.adjustedLE);
  return `
    <div class="goal-setup">
      <h3>Set Your Longevity Goal</h3>
      <p style="color:var(--text2); margin-bottom:16px;">You are currently projected to live to age <strong>${r.adjustedLE}</strong>. How long do you want to live?</p>
      <div style="margin:20px 0;">
        <label style="font-size:0.85rem; color:var(--text3);">I want to live to age:</label>
        <div style="display:flex; align-items:center; gap:12px; justify-content:center; margin-top:8px;">
          <input type="range" id="goalAge" min="${Math.ceil(currentAge)}" max="100" value="${Math.min(Math.ceil(currentAge) + 10, 100)}"
            oninput="updateGoalPreview(this.value)" style="width:200px;">
          <input type="number" id="goalAgeNum" min="${Math.ceil(currentAge)}" max="100" value="${Math.min(Math.ceil(currentAge) + 10, 100)}"
            onchange="document.getElementById('goalAge').value=this.value; updateGoalPreview(this.value)" style="width:80px;">
        </div>
      </div>
      <div id="goalPreview"></div>
      <button class="btn-primary" onclick="setLongevityGoal(parseInt(document.getElementById('goalAgeNum').value))" style="margin-top:16px; font-size:1.1rem; padding:14px 32px;">
        Generate My Cheat Death Plan
      </button>
    </div>
  `;
}

function updateGoalPreview(val) {
  document.getElementById('goalAgeNum').value = val;
  const r = state.result;
  const currentAge = parseFloat(r.adjustedLE);
  const el = document.getElementById('goalPreview');
  if (val > 100) {
    el.innerHTML = '<div class="goal-gap" style="color:var(--accent)">You can\'t cheat death.</div><div style="color:var(--text2); font-size:0.9rem;">But at least you can avoid it for longer than most of us. Cap is 100.</div>';
    document.getElementById('goalAgeNum').value = 100;
    document.getElementById('goalAge').value = 100;
    return;
  }
  const gap = val - currentAge;
  let feasClass = 'green', feasText = 'Achievable with lifestyle changes';
  if (gap > 15) { feasClass = 'red'; feasText = 'Extraordinary effort required'; }
  else if (gap > 8) { feasClass = 'gold'; feasText = 'Ambitious but possible'; }
  else if (gap <= 0) { feasClass = 'green'; feasText = 'You are already on track!'; }
  el.innerHTML = `
    <div class="goal-gap">You need to add ${gap > 0 ? gap.toFixed(1) : '0'} years</div>
    <div class="goal-feasibility ${feasClass}">${feasText}</div>
  `;
}

function renderMyPlanTab(el) {
  const g = state.longevityGoal;

  // If no goal set yet, show setup
  if (!g) {
    if (!state.result) { el.innerHTML = '<p style="color:var(--text3)">Complete the calculator first.</p>'; return; }
    el.innerHTML = renderGoalSetup();
    setTimeout(() => updateGoalPreview(document.getElementById('goalAgeNum')?.value || 85), 50);
    return;
  }

  const today = getTodayKey();
  const todayLog = g.logs[today] || [];
  const { streak, multiplier } = getStreakInfo();
  const habitsLoggedToday = todayLog.length;
  const totalHabits = g.plan.length;
  const todayDaysAdded = todayLog.reduce((sum, hid) => {
    const h = g.plan.find(x => x.id === hid);
    return sum + (h ? h.dailyImpact * multiplier : 0);
  }, 0);

  // Calculate projected death date shift
  const shiftedDeath = new Date(state.result.deathDate.getTime() + g.totalDaysAdded * 24*60*60*1000);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const newDateStr = months[shiftedDeath.getMonth()] + ' ' + shiftedDeath.getDate() + ', ' + shiftedDeath.getFullYear();

  // Progress toward goal
  const goalGap = g.targetAge - g.currentProjected;
  const daysNeeded = goalGap * 365.25;
  const progress = daysNeeded > 0 ? Math.min(100, (g.totalDaysAdded / daysNeeded) * 100) : 100;

  // Build heatmap (last 28 days)
  let heatmapHtml = '';
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = d.toISOString().split('T')[0];
    const dayLog = g.logs[k] || [];
    let cls = 'missed';
    if (dayLog.length >= totalHabits) cls = 'full';
    else if (dayLog.length > 0) cls = 'partial';
    heatmapHtml += '<div class="heatmap-day ' + cls + '" title="' + k + ': ' + dayLog.length + '/' + totalHabits + '"></div>';
  }

  el.innerHTML = `
    <div id="deathyAvatarPanel" style="text-align:center; margin-bottom:16px;">
      <div class="deathy-svg-wrap" style="width:120px; height:144px; margin:0 auto; cursor:pointer;" onclick="refreshDeathySpeech()">
        ${generateDeathy({...getDeathyParams(), healthScore: Math.min(100, calcDeathyHealth(getDeathyParams()) + Math.min(20, (g.totalDaysAdded||0)*0.5))})}
      </div>
      <div style="font-size:0.75rem; color:var(--text3);">Ghost Health: <span class="deathy-health-num" style="color:${(() => { const s = Math.min(100, calcDeathyHealth(getDeathyParams()) + Math.min(20, (g.totalDaysAdded||0)*0.5)); return s>=70?'var(--green)':s>=40?'var(--gold)':'var(--accent)'; })()}">${Math.round(Math.min(100, calcDeathyHealth(getDeathyParams()) + Math.min(20, (g.totalDaysAdded||0)*0.5)))}/100</span></div>
      <div class="deathy-evolution-bar"><span style="font-size:0.7rem; color:var(--text3);">&#9760;</span><div class="bar"><div class="fill" style="width:${Math.min(100, calcDeathyHealth(getDeathyParams()) + Math.min(20, (g.totalDaysAdded||0)*0.5))}%; background:${(() => { const s = Math.min(100, calcDeathyHealth(getDeathyParams()) + Math.min(20, (g.totalDaysAdded||0)*0.5)); return s>=70?'var(--green)':s>=40?'var(--gold)':'var(--accent)'; })()};"></div></div><span style="font-size:0.7rem; color:var(--text3);">&#x1F451;</span></div>
    </div>
    <div class="days-added-banner">
      <div class="days-added-num">+${(g.totalDaysAdded * 1440).toFixed(0)} minutes</div>
      <div class="days-added-label">added to your life (${g.totalDaysAdded.toFixed(1)} days)</div>
      ${streak > 0 ? '<div class="streak-badge">\u{1F525} ' + streak + ' day streak (' + multiplier + 'x multiplier)</div>' : '<div style="font-size:0.8rem; color:var(--text3); margin-top:4px;">Start your streak by logging all habits today</div>'}
    </div>

    <div class="plan-summary">
      <div class="plan-stat">
        <div class="plan-stat-num" style="color:var(--green)">+${(todayDaysAdded * 1440).toFixed(1)} min</div>
        <div class="plan-stat-label">Today</div>
      </div>
      <div class="plan-stat">
        <div class="plan-stat-num" style="color:var(--text)">${habitsLoggedToday}/${totalHabits}</div>
        <div class="plan-stat-label">Habits Today</div>
      </div>
      <div class="plan-stat">
        <div class="plan-stat-num" style="color:var(--gold)">${progress.toFixed(1)}%</div>
        <div class="plan-stat-label">Goal Progress</div>
      </div>
      <div class="plan-stat">
        <div class="plan-stat-num" style="color:var(--blue)">${g.targetAge}</div>
        <div class="plan-stat-label">Target Age</div>
      </div>
    </div>

    <div style="margin:20px 0 8px; font-weight:600; font-size:1.1rem;">Today's Habits</div>
    <p style="color:var(--text3); font-size:0.8rem; margin-bottom:12px;">Tap to log each habit. Complete 50%+ to maintain your streak.</p>

    ${g.plan.map((h, idx) => {
      const isPremiumLocked = state.userTier === 'free' && idx >= 3;
      const logged = todayLog.includes(h.id);
      const impactMin = (h.dailyImpact * multiplier * 1440).toFixed(1);
      const impactStr = '+' + impactMin + ' min';
      if (isPremiumLocked) {
        return '<div class="habit-card" style="filter:blur(4px); pointer-events:none; user-select:none;">' +
          '<div class="habit-check"></div>' +
          '<div class="habit-info">' +
            '<div class="habit-name">' + (h.icon || '') + ' ' + h.name + '</div>' +
            '<div class="habit-meta">' + h.difficulty + '</div>' +
          '</div>' +
          '<div class="habit-impact">' + impactStr + '</div>' +
        '</div>';
      }
      return '<div class="habit-card ' + (logged ? 'logged' : '') + '" onclick="toggleHabit(\'' + h.id + '\')">' +
        '<div class="habit-check">' + (logged ? '✓' : '') + '</div>' +
        '<div class="habit-info">' +
          '<div class="habit-name">' + (h.icon || '') + ' ' + h.name + '</div>' +
          '<div class="habit-meta">' + h.difficulty + '</div>' +
        '</div>' +
        '<div class="habit-impact">' + impactStr + '</div>' +
      '</div>';
    }).join('')}

    ${state.userTier === 'free' && g.plan.length > 3 ? `
    <div style="text-align:center; margin:16px 0; padding:20px; background:linear-gradient(135deg, rgba(233,69,96,0.1), rgba(240,192,64,0.1)); border:1px solid var(--gold); border-radius:var(--radius);">
      <div style="font-size:1.2rem; margin-bottom:4px;">&#x1F512; ${g.plan.length - 3} more habits locked</div>
      <p style="color:var(--text2); font-size:0.9rem; margin-bottom:12px;">Free plan shows 3 habits. Unlock all ${g.plan.length} personalised reversal habits with Premium.
      </p>
      <div style="background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); padding:16px; margin-bottom:20px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
          <div><span style="font-size:0.75rem; color:var(--text3); text-transform:uppercase;">Ghost Level</span><div style="font-size:1.2rem; font-weight:700; color:var(--gold);">${(() => { const l = getDeathyLevel(getDeathyXP()); return 'Lv.' + l.level + ' ' + l.title; })()}</div></div>
          <div style="text-align:right;"><span style="font-size:0.75rem; color:var(--text3);">XP</span><div style="font-size:1rem; font-weight:600; color:var(--text);">${getDeathyXP().toLocaleString()}</div></div>
        </div>
        <div style="background:var(--bg); border-radius:4px; height:8px; overflow:hidden;"><div style="height:100%; width:${Math.round(getDeathyLevel(getDeathyXP()).progress * 100)}%; background:linear-gradient(90deg, var(--gold), var(--green)); border-radius:4px; transition:width 0.5s;"></div></div>
        <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">${getUnlockedAchievements().map(a => '<span title="' + a.name + ': ' + a.desc + '" style="font-size:1.2rem; cursor:help;">' + a.icon + '</span>').join('')}${getUnlockedAchievements().length === 0 ? '<span style="font-size:0.75rem; color:var(--text3);">Complete habits to unlock achievements!</span>' : ''}</div>
      </div>
      <p style="display:none;"></p>
      <button class="btn-gold" onclick="startStripeCheckout('premium')" style="font-size:1rem; padding:12px 28px;">Unlock All Habits - $4.99/mo</button>
    </div>` : ''}

    ${renderGoalTrackersSection()}

    <div style="margin-top:24px;">
      <div style="font-weight:600; margin-bottom:8px;">Death Date Shift</div>
      <div style="color:var(--text2); font-size:0.9rem;">
        Original: <span style="color:var(--accent)">${state.result.deathDate.toLocaleDateString()}</span>
        → New: <span style="color:var(--green)">${newDateStr}</span>
      </div>
      <div style="margin-top:12px; background:var(--bg); border-radius:8px; height:8px; overflow:hidden;">
        <div style="width:${progress}%; height:100%; background:var(--green); border-radius:8px; transition:width 0.3s;"></div>
      </div>
      <div style="font-size:0.8rem; color:var(--text3); margin-top:4px;">${progress.toFixed(1)}% toward living to ${g.targetAge}</div>
    </div>

    <div style="margin-top:24px;">
      <div style="font-weight:600; margin-bottom:8px;">Last 28 Days</div>
      <div class="heatmap">${heatmapHtml}</div>
      <div style="display:flex; justify-content:center; gap:12px; font-size:0.7rem; color:var(--text3); margin-top:4px;">
        <span><span style="display:inline-block; width:10px; height:10px; background:var(--green); border-radius:2px;"></span> All done</span>
        <span><span style="display:inline-block; width:10px; height:10px; background:var(--gold); border-radius:2px;"></span> Partial</span>
        <span><span style="display:inline-block; width:10px; height:10px; background:var(--bg); border-radius:2px;"></span> Missed</span>
      </div>
    </div>

    <div style="margin-top:24px; text-align:center;">
      <button class="btn-secondary btn-sm" onclick="state.longevityGoal=null; saveGoalState(); showTab('myplan');">Reset Goal</button>
    </div>
  `;
}

function getGoalTrackers() {
  try { return JSON.parse(localStorage.getItem('dc_goal_trackers') || '[]'); } catch(e) { return []; }
}
function saveGoalTrackers(trackers) {
  localStorage.setItem('dc_goal_trackers', JSON.stringify(trackers));
}

function addGoalTracker(name, cadence, target) {
  const trackers = getGoalTrackers();
  trackers.push({
    id: 'gt_' + Date.now(),
    name, cadence, target: parseInt(target),
    startedAt: new Date().toISOString(),
    completions: [] // array of ISO date strings
  });
  saveGoalTrackers(trackers);
  if (state.currentTab === 'myplan') showTab('myplan');
}

function logGoalTracker(id) {
  const trackers = getGoalTrackers();
  const t = trackers.find(x => x.id === id);
  if (!t) return;
  const today = new Date().toISOString().split('T')[0];
  if (!t.completions.includes(today)) {
    t.completions.push(today);
    saveGoalTrackers(trackers);
    showToast('Goal logged!');
    if (state.currentTab === 'myplan') showTab('myplan');
    else if (state.currentTab === 'performance') showTab('performance');
  }
}

function deleteGoalTracker(id) {
  const trackers = getGoalTrackers().filter(x => x.id !== id);
  saveGoalTrackers(trackers);
  if (state.currentTab === 'myplan') showTab('myplan');
}

function getTrackerProgress(tracker) {
  const now = new Date();
  const start = new Date(tracker.startedAt);
  let periodStart, periodEnd;
  
  if (tracker.cadence === 'weekly') {
    const dayOfWeek = now.getDay();
    periodStart = new Date(now);
    periodStart.setDate(now.getDate() - dayOfWeek);
    periodStart.setHours(0,0,0,0);
    periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + 7);
  } else if (tracker.cadence === 'monthly') {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  } else {
    periodStart = new Date(now.getFullYear(), 0, 1);
    periodEnd = new Date(now.getFullYear() + 1, 0, 1);
  }
  
  const periodCompletions = tracker.completions.filter(d => {
    const date = new Date(d);
    return date >= periodStart && date < periodEnd;
  });
  
  return { done: periodCompletions.length, target: tracker.target, pct: Math.min(100, (periodCompletions.length / tracker.target) * 100) };
}

function renderGoalTrackersSection() {
  const trackers = getGoalTrackers();
  let html = '<div style="margin-top:24px; border-top:1px solid var(--border); padding-top:20px;">';
  html += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">';
  html += '<div style="font-weight:700; font-size:1.1rem;">Goal Trackers</div>';
  html += '<button class="btn-primary btn-sm" onclick="showAddTrackerModal()">+ Add Goal</button></div>';
  
  if (trackers.length === 0) {
    html += '<div style="text-align:center; padding:24px; color:var(--text3);">No goal trackers yet. Set weekly, monthly, or annual targets.</div>';
  } else {
    trackers.forEach(t => {
      const p = getTrackerProgress(t);
      const cadenceLabel = t.cadence.charAt(0).toUpperCase() + t.cadence.slice(1);
      const barColor = p.pct >= 100 ? 'var(--green)' : p.pct >= 50 ? 'var(--gold)' : 'var(--accent)';
      html += '<div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:14px; margin-bottom:8px;">';
      html += '<div style="display:flex; justify-content:space-between; align-items:center;">';
      html += '<div><div style="font-weight:600; color:var(--text);">' + t.name + '</div>';
      html += '<div style="font-size:0.75rem; color:var(--text3);">' + cadenceLabel + ' target: ' + t.target + 'x</div></div>';
      html += '<div style="display:flex; gap:6px;">';
      html += '<button class="btn-sm btn-green" onclick="logGoalTracker(\'' + t.id + '\')" style="padding:4px 12px;">Log</button>';
      html += '<button class="btn-sm" onclick="deleteGoalTracker(\'' + t.id + '\')" style="padding:4px 8px; background:none; border:1px solid var(--border); color:var(--text3);">x</button>';
      html += '</div></div>';
      html += '<div style="margin-top:8px; background:var(--bg); border-radius:6px; height:6px; overflow:hidden;">';
      html += '<div style="width:' + p.pct + '%; height:100%; background:' + barColor + '; border-radius:6px; transition:width 0.3s;"></div></div>';
      html += '<div style="font-size:0.75rem; color:var(--text3); margin-top:4px;">' + p.done + '/' + t.target + ' this ' + t.cadence.replace('ly','').replace('annual','year') + '</div>';
      html += '</div>';
    });
  }
  html += '</div>';
  return html;
}

function showAddTrackerModal() {
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modalContent').innerHTML = 
    '<h3 style="color:var(--gold); margin-bottom:16px;">Add Goal Tracker</h3>' +
    '<div style="margin-bottom:12px;"><label style="display:block; font-size:0.85rem; color:var(--text2); margin-bottom:4px;">Goal Name</label>' +
    '<input type="text" id="trackerName" placeholder="e.g. Run 5km, Meditate, No alcohol day" style="width:100%; padding:10px; background:var(--bg); border:1px solid var(--border); border-radius:8px; color:var(--text);"></div>' +
    '<div style="margin-bottom:12px;"><label style="display:block; font-size:0.85rem; color:var(--text2); margin-bottom:4px;">Cadence</label>' +
    '<select id="trackerCadence" style="width:100%; padding:10px; background:var(--bg); border:1px solid var(--border); border-radius:8px; color:var(--text);">' +
    '<option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="annually">Annually</option></select></div>' +
    '<div style="margin-bottom:16px;"><label style="display:block; font-size:0.85rem; color:var(--text2); margin-bottom:4px;">Target (times per period)</label>' +
    '<input type="number" id="trackerTarget" value="3" min="1" max="365" style="width:100%; padding:10px; background:var(--bg); border:1px solid var(--border); border-radius:8px; color:var(--text);"></div>' +
    '<div class="form-actions"><button class="btn-secondary" onclick="closeModal()">Cancel</button>' +
    '<button class="btn-gold" onclick="addGoalTracker(document.getElementById(\'trackerName\').value, document.getElementById(\'trackerCadence\').value, document.getElementById(\'trackerTarget\').value); closeModal();">Add Goal</button></div>';
}

function renderPerformanceTab(el) {
  const g = state.longevityGoal;
  if (!g) { el.innerHTML = '<p style="color:var(--text3); text-align:center; padding:40px;">Complete the calculator and set up your plan first.</p>'; return; }
  
  const { streak, multiplier } = getStreakInfo();
  const totalDays = Object.keys(g.logs).length;
  const totalHabitsLogged = Object.values(g.logs).reduce((sum, arr) => sum + arr.length, 0);
  const avgPerDay = totalDays > 0 ? (totalHabitsLogged / totalDays).toFixed(1) : 0;
  
  // Best streak calculation
  let bestStreak = 0, currentRun = 0;
  const sortedDays = Object.keys(g.logs).sort();
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0 || (new Date(sortedDays[i]) - new Date(sortedDays[i-1])) <= 86400000 * 1.5) {
      currentRun++;
    } else {
      currentRun = 1;
    }
    if (currentRun > bestStreak) bestStreak = currentRun;
  }
  
  // Weekly summary (last 7 days)
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = d.toISOString().split('T')[0];
    const dayLog = g.logs[k] || [];
    last7.push({ day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()], count: dayLog.length, total: g.plan.length });
  }
  
  // Monthly summary
  const thisMonth = new Date().toISOString().slice(0,7);
  const monthDays = Object.keys(g.logs).filter(k => k.startsWith(thisMonth));
  const monthHabits = monthDays.reduce((s, k) => s + g.logs[k].length, 0);
  const monthPerfect = monthDays.filter(k => g.logs[k].length >= g.plan.length).length;
  
  // Habit completion rates
  const habitStats = g.plan.map(h => {
    const logged = Object.values(g.logs).filter(arr => arr.includes(h.id)).length;
    return { name: h.name, icon: h.icon, rate: totalDays > 0 ? Math.round((logged/totalDays)*100) : 0, count: logged };
  }).sort((a,b) => b.rate - a.rate);
  
  // Goal trackers summary
  const trackers = getGoalTrackers();
  
  el.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr)); gap:10px; margin-bottom:20px;">
      <div style="background:var(--surface); border-radius:var(--radius); padding:14px; text-align:center;">
        <div style="font-size:1.4rem; font-weight:800; color:var(--green);">${streak}</div>
        <div style="font-size:0.7rem; color:var(--text3);">Current Streak</div>
      </div>
      <div style="background:var(--surface); border-radius:var(--radius); padding:14px; text-align:center;">
        <div style="font-size:1.4rem; font-weight:800; color:var(--gold);">${bestStreak}</div>
        <div style="font-size:0.7rem; color:var(--text3);">Best Streak</div>
      </div>
      <div style="background:var(--surface); border-radius:var(--radius); padding:14px; text-align:center;">
        <div style="font-size:1.4rem; font-weight:800; color:var(--accent);">${totalHabitsLogged}</div>
        <div style="font-size:0.7rem; color:var(--text3);">Total Logged</div>
      </div>
      <div style="background:var(--surface); border-radius:var(--radius); padding:14px; text-align:center;">
        <div style="font-size:1.4rem; font-weight:800; color:var(--text);">${avgPerDay}</div>
        <div style="font-size:0.7rem; color:var(--text3);">Avg/Day</div>
      </div>
      <div style="background:var(--surface); border-radius:var(--radius); padding:14px; text-align:center;">
        <div style="font-size:1.4rem; font-weight:800; color:var(--green);">+${g.totalDaysAdded.toFixed(1)}</div>
        <div style="font-size:0.7rem; color:var(--text3);">Days Added (${Math.round(g.totalDaysAdded * 1440)} min)</div>
      </div>
      <div style="background:var(--surface); border-radius:var(--radius); padding:14px; text-align:center;">
        <div style="font-size:1.4rem; font-weight:800; color:var(--gold);">${multiplier}x</div>
        <div style="font-size:0.7rem; color:var(--text3);">Multiplier</div>
      </div>
    </div>

    <div style="font-weight:700; margin-bottom:8px;">This Week</div>
    <div style="display:flex; gap:4px; margin-bottom:20px;">
      ${last7.map(d => {
        const pct = d.total > 0 ? (d.count / d.total) * 100 : 0;
        const color = pct >= 100 ? 'var(--green)' : pct > 0 ? 'var(--gold)' : 'var(--border)';
        return '<div style="flex:1; text-align:center;">' +
          '<div style="height:60px; background:var(--bg); border-radius:6px; position:relative; overflow:hidden;">' +
          '<div style="position:absolute; bottom:0; width:100%; height:' + pct + '%; background:' + color + '; border-radius:0 0 6px 6px; transition:height 0.3s;"></div></div>' +
          '<div style="font-size:0.65rem; color:var(--text3); margin-top:4px;">' + d.day + '</div></div>';
      }).join('')}
    </div>

    <div style="font-weight:700; margin-bottom:8px;">This Month</div>
    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:20px;">
      <div style="background:var(--surface); padding:12px; border-radius:var(--radius); text-align:center;">
        <div style="font-size:1.2rem; font-weight:700; color:var(--green);">${monthDays.length}</div>
        <div style="font-size:0.7rem; color:var(--text3);">Active Days</div>
      </div>
      <div style="background:var(--surface); padding:12px; border-radius:var(--radius); text-align:center;">
        <div style="font-size:1.2rem; font-weight:700; color:var(--gold);">${monthHabits}</div>
        <div style="font-size:0.7rem; color:var(--text3);">Habits Done</div>
      </div>
      <div style="background:var(--surface); padding:12px; border-radius:var(--radius); text-align:center;">
        <div style="font-size:1.2rem; font-weight:700; color:var(--accent);">${monthPerfect}</div>
        <div style="font-size:0.7rem; color:var(--text3);">Perfect Days</div>
      </div>
    </div>

    <div style="font-weight:700; margin-bottom:8px;">Habit Completion Rates</div>
    ${habitStats.slice(0, 10).map(h => {
      const barColor = h.rate >= 80 ? 'var(--green)' : h.rate >= 40 ? 'var(--gold)' : 'var(--accent)';
      return '<div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">' +
        '<div style="width:24px; text-align:center;">' + (h.icon || '') + '</div>' +
        '<div style="flex:1; min-width:0;">' +
        '<div style="display:flex; justify-content:space-between; font-size:0.8rem;"><span style="color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + h.name + '</span><span style="color:var(--text3);">' + h.rate + '%</span></div>' +
        '<div style="height:4px; background:var(--bg); border-radius:2px; margin-top:2px;"><div style="width:' + h.rate + '%; height:100%; background:' + barColor + '; border-radius:2px;"></div></div></div></div>';
    }).join('')}

    ${trackers.length > 0 ? '<div style="font-weight:700; margin:20px 0 8px;">Goal Trackers</div>' +
      trackers.map(t => {
        const p = getTrackerProgress(t);
        const barColor = p.pct >= 100 ? 'var(--green)' : p.pct >= 50 ? 'var(--gold)' : 'var(--accent)';
        return '<div style="background:var(--surface); padding:10px 14px; border-radius:var(--radius); margin-bottom:6px; display:flex; align-items:center; justify-content:space-between;">' +
          '<div><div style="font-size:0.85rem; font-weight:600;">' + t.name + '</div>' +
          '<div style="font-size:0.7rem; color:var(--text3);">' + p.done + '/' + t.target + ' (' + t.cadence + ')</div></div>' +
          '<div style="width:60px; height:60px; border-radius:50%; border:3px solid ' + barColor + '; display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:700; color:' + barColor + ';">' + Math.round(p.pct) + '%</div></div>';
      }).join('') : ''}
  `;
}

// ============================================
// LONGEVITY CLINIC QUOTE
const CLINIC_DESTINATIONS = [
  { code: 'switzerland', label: 'Switzerland', flag: '🇨🇭', note: 'Clinique La Prairie, Paracelsus' },
  { code: 'germany', label: 'Germany', flag: '🇩🇪', note: 'Buchinger, Lanserhof' },
  { code: 'thailand', label: 'Thailand', flag: '🇹🇭', note: 'Bumrungrad, RAKxa' },
  { code: 'turkey', label: 'Turkey', flag: '🇹🇷', note: 'Acibadem, Memorial' },
  { code: 'mexico', label: 'Mexico', flag: '🇲🇽', note: 'BioCenter, Immunity Therapy' },
  { code: 'spain', label: 'Spain', flag: '🇪🇸', note: 'SHA Wellness, Sha Clinic' },
  { code: 'uk', label: 'United Kingdom', flag: '🇬🇧', note: 'The London Clinic, Longevity' },
  { code: 'singapore', label: 'Singapore', flag: '🇸🇬', note: 'Raffles, Mount Elizabeth' },
  { code: 'south_korea', label: 'South Korea', flag: '🇰🇷', note: 'Samsung Medical, Asan' },
  { code: 'japan', label: 'Japan', flag: '🇯🇵', note: 'Midorino, IMS Group' },
  { code: 'austria', label: 'Austria', flag: '🇦🇹', note: 'Mayr Clinic, Lanserhof Lans' },
  { code: 'portugal', label: 'Portugal', flag: '🇵🇹', note: 'Longevity Algarve' },
  { code: 'costa_rica', label: 'Costa Rica', flag: '🇨🇷', note: 'Stem Cell Institute' },
  { code: 'uae', label: 'UAE (Dubai)', flag: '🇦🇪', note: 'Aster, Cleveland Abu Dhabi' },
  { code: 'india', label: 'India', flag: '🇮🇳', note: 'Apollo, Fortis, Ananda' },
  { code: 'china', label: 'China', flag: '🇨🇳', note: 'Peking Union, Bumrungrad affiliate' },
  { code: 'canada', label: 'Canada', flag: '🇨🇦', note: 'Medcan, True North' },
  { code: 'usa', label: 'United States', flag: '🇺🇸', note: 'Mayo, Cleveland, Fountain Life' },
  { code: 'greece', label: 'Greece', flag: '🇬🇷', note: 'Metropolitan, Hygeia' },
  { code: 'italy', label: 'Italy', flag: '🇮🇹', note: 'Humanitas, Palazzo Fiuggi' }
];

function renderClinicDestinations() {
  const el = document.getElementById('clinicDestinations');
  if (!el) return;
  el.innerHTML = CLINIC_DESTINATIONS.map(d => `
    <label style="display:flex; align-items:center; gap:6px; background:var(--bg); border:1px solid var(--border); border-radius:6px; padding:6px 10px; cursor:pointer; font-size:0.8rem; color:var(--text2); transition:border-color 0.2s;" onclick="this.style.borderColor = this.querySelector('input').checked ? 'var(--gold)' : 'var(--border)'">
      <input type="checkbox" value="${d.code}" style="accent-color:var(--gold);">
      <span>${d.flag} ${d.label}</span>
    </label>
  `).join('');
}

function submitClinicQuote() {
  const name = document.getElementById('clinicName').value.trim();
  const email = document.getElementById('clinicEmail').value.trim();
  const country = document.getElementById('clinicCountry').value.trim();
  const interest = document.getElementById('clinicInterest').value;
  const budget = document.getElementById('clinicBudget').value;
  const destinations = [...document.querySelectorAll('#clinicDestinations input:checked')].map(i => i.value);

  if (!name || !email || !country) {
    showToast('Please fill in your name, email and country.');
    return;
  }
  if (!email.includes('@')) {
    showToast('Please enter a valid email address.');
    return;
  }
  if (destinations.length === 0) {
    showToast('Please select at least one destination you would travel to.');
    return;
  }

  const quoteData = {
    name, email, country, interest, budget, destinations,
    lifeScore: state.result ? state.result.lifeScore : null,
    remainingYears: state.result ? state.result.remainingYears : null,
    submittedAt: new Date().toISOString()
  };

  // Store to Supabase if available
  if (supaClient) {
    supaClient.from('dc_clinic_quotes').insert([quoteData]).then(() => {
      console.log('Clinic quote saved to Supabase');
    }).catch(() => {
      // Fallback: store locally
      const quotes = JSON.parse(localStorage.getItem('dc_clinic_quotes') || '[]');
      quotes.push(quoteData);
      localStorage.setItem('dc_clinic_quotes', JSON.stringify(quotes));
    });
  } else {
    const quotes = JSON.parse(localStorage.getItem('dc_clinic_quotes') || '[]');
    quotes.push(quoteData);
    localStorage.setItem('dc_clinic_quotes', JSON.stringify(quotes));
  }

  // Show success
  document.getElementById('clinicQuoteForm').classList.add('hidden');
  document.getElementById('clinicQuoteSuccess').classList.remove('hidden');
  showToast('Quote request submitted! Check your email in 48 hours.');
}

// Render destinations when pricing page is shown

function getPersonalisedHabits() {
  const a = state.answers || {};
  const matched = [];
  
  ALL_REVERSAL_HABITS.forEach(h => {
    const triggers = h.trigger.split(',');
    let shouldAdd = false;
    
    triggers.forEach(t => {
      if (t === 'all') { shouldAdd = true; return; }
      const parts = t.split('_');
      const key = parts[0];
      const val = parts.slice(1).join('_');
      
      // Match against user answers
      if (key === 'exercise' && a.exercise === val) shouldAdd = true;
      if (key === 'diet' && a.diet === val) shouldAdd = true;
      if (key === 'processed' && a.processed_food === val.replace('food_','')) shouldAdd = true;
      if (key === 'alcohol' && a.alcohol === val) shouldAdd = true;
      if (key === 'sleep' && a.sleep_hours === val) shouldAdd = true;
      if (key === 'stress' && a.stress === val) shouldAdd = true;
      if (key === 'smoking' && a.smoking === val) shouldAdd = true;
      if (key === 'social' && a.social === val) shouldAdd = true;
      if (key === 'drugs' && a.drugs === val) shouldAdd = true;
      if (key === 'mental' && a.mental_health === 'yes') shouldAdd = true;
      if (key === 'bmi') {
        if (a.height_cm && a.weight_kg) {
          const bmiVal = a.weight_kg / ((a.height_cm/100)**2);
          if (val === 'overweight' && bmiVal >= 25 && bmiVal < 30) shouldAdd = true;
          if (val === 'obese' && bmiVal >= 30 && bmiVal < 40) shouldAdd = true;
          if (val === 'severely_obese' && bmiVal >= 40) shouldAdd = true;
        }
      }
      if (key === 'conditions' && (a.conditions || []).includes(val)) shouldAdd = true;
      if (key === 'air' && a.air_quality === val) shouldAdd = true;
      if (key === 'screen' && a.screen_time === val) shouldAdd = true;
      if (key === 'hydration' && a.hydration === val) shouldAdd = true;
      if (key === 'dental' && a.dental === val) shouldAdd = true;
      if (key === 'occupation' && a.occupation === val) shouldAdd = true;
      if (key === 'nature' && a.nature === val) shouldAdd = true;
      if (key === 'rhr' && a.resting_hr === val) shouldAdd = true;
      if (key === 'sauna' && a.sauna === val) shouldAdd = true;
      if (key === 'income' && a.income === val) shouldAdd = true;
      if (key === 'omega3' && a.omega3 === val) shouldAdd = true;
      if (key === 'pet' && a.pet === val) shouldAdd = true;
      if (key === 'education' && a.education === val) shouldAdd = true;
      if (key === 'relationship' && a.relationship === val) shouldAdd = true;
      if (key === 'sport' && a.sport === val) shouldAdd = true;
      if (key === 'gratitude' && a.gratitude === val) shouldAdd = true;
      if (key === 'volunteering' && a.volunteering === val) shouldAdd = true;
      if (key === 'religion' && a.religion === val) shouldAdd = true;
      if (key === 'bp' && a.blood_pressure === val) shouldAdd = true;
      if (key === 'coffee' && a.coffee === val) shouldAdd = true;
    });
    
    if (shouldAdd) matched.push({...h});
  });
  
  // Sort by impact descending
  matched.sort((a,b) => b.dailyImpact - a.dailyImpact);
  return matched;
}

// ===== DASHBOARD NUDGE BAR =====
function renderDashboardNudge() {
  let nudgeEl = document.getElementById('dashNudge');
  if (!nudgeEl) {
    // Create nudge container above stats
    const statsEl = document.getElementById('dashStats');
    if (!statsEl) return;
    nudgeEl = document.createElement('div');
    nudgeEl.id = 'dashNudge';
    statsEl.parentNode.insertBefore(nudgeEl, statsEl);
  }

  const nudges = [];
  const g = state.longevityGoal;
  const today = getTodayKey();

  // 1. Habits due today
  if (g && g.habits) {
    const todayLog = g.dailyLog ? g.dailyLog[today] : null;
    const completedToday = todayLog ? Object.keys(todayLog).length : 0;
    const totalHabits = g.habits.length;
    const remaining = totalHabits - completedToday;
    if (remaining > 0) {
      nudges.push({
        icon: '🎯',
        text: remaining + ' habit' + (remaining !== 1 ? 's' : '') + ' due today',
        action: "showTab('myplan')",
        color: 'var(--green)',
        priority: 1
      });
    }
  }

  // 2. Stale quiz (30+ days)
  const lastQuiz = localStorage.getItem('dc_last_quiz_date');
  if (lastQuiz) {
    const daysSince = Math.floor((Date.now() - new Date(lastQuiz).getTime()) / 86400000);
    if (daysSince >= 30) {
      nudges.push({
        icon: '🔄',
        text: 'Quiz is ' + daysSince + ' days old. Lifestyle changed?',
        action: "showPage('quiz'); state.currentQuestion=0; renderQuestion()",
        color: '#54a0ff',
        priority: 2
      });
    }
  }

  // 3. Challenge prompt (if has no active challenges)
  if (!state.activeChallenges || state.activeChallenges.length === 0) {
    nudges.push({
      icon: '⚔️',
      text: 'Challenge a friend. Who dies first?',
      action: "showPage('mansion')",
      color: '#ff6b6b',
      priority: 3
    });
  }

  // 4. No goal set
  if (!g) {
    nudges.push({
      icon: '🎯',
      text: 'No longevity goal set yet!',
      action: "showTab('myplan')",
      color: 'var(--gold)',
      priority: 0
    });
  }

  if (nudges.length === 0) { nudgeEl.innerHTML = ''; return; }

  // Show top 2 nudges max
  nudges.sort((a,b) => a.priority - b.priority);
  const show = nudges.slice(0, 2);

  nudgeEl.innerHTML = '<div style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap;">' +
    show.map(n =>
      '<button onclick="' + n.action + '" style="flex:1; min-width:200px; display:flex; align-items:center; gap:8px; padding:10px 16px; background:' + n.color + '10; border:1px solid ' + n.color + '40; border-radius:10px; cursor:pointer; transition:transform 0.1s;">' +
      '<span style="font-size:1.2rem;">' + n.icon + '</span>' +
      '<span style="font-size:0.85rem; color:var(--text); font-weight:600;">' + n.text + '</span>' +
      '<span style="margin-left:auto; font-size:0.7rem; color:' + n.color + ';">Go &rarr;</span>' +
      '</button>'
    ).join('') +
    '</div>';
}

