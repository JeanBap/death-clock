#!/usr/bin/env python3
"""Patch v7: Country LE, full live counter, NaN timeline fix, percentile 2dp, floating ghost
- Integrate countryLifeExpectancy into calculateResult base LE
- Expand getPartialEstimate to ALL factors (was only 14 of 30+)
- Fix NaN in Life Timeline (expectedAge/ageNow never set in result)
- Percentile to 2 decimal places
- Ghost on result page: same SVG as timer bar, floating animation, habit commentary
"""

FILE = '/sessions/funny-focused-fermi/mnt/outputs/death-clock/app.html'

with open(FILE, 'r') as f:
    html = f.read()

patches = []

# ============================================================
# PATCH 1: Integrate country life expectancy into calculateResult
# Replace the line that sets baseLE with one that checks country first
# ============================================================

old_base = """  const baseLE = getBaseExpectancy(Math.floor(age), sex);
  const factors = [];"""

new_base = """  // Use country-specific life expectancy if available, else SSA table
  let baseLE = getBaseExpectancy(Math.floor(age), sex);
  if (a.country && countryLifeExpectancy[a.country]) {
    const cLE = countryLifeExpectancy[a.country];
    const countryBase = sex === 'female' ? cLE.f : cLE.m;
    // Blend: use country LE at birth, but adjust for current age
    // If user is older, remaining LE shrinks. Scale proportionally.
    const usBase = sex === 'female' ? 80.2 : 74.8; // US baseline at birth
    const countryDiff = countryBase - usBase;
    baseLE = baseLE + countryDiff;
  }
  const factors = [];"""

if old_base in html:
    html = html.replace(old_base, new_base)
    patches.append('PATCH 1: Integrated country life expectancy into calculateResult')
else:
    patches.append('PATCH 1 SKIP: target not found')

# ============================================================
# PATCH 2: Fix NaN in Life Timeline - add expectedAge and ageNow to result
# The renderLifeTimeline function uses state.result.expectedAge and ageNow
# but calculateResult only stores age, adjustedLE, remainingYears
# ============================================================

old_result = """  state.result = {
    dob, age: Math.floor(age), sex, baseLE, totalAdjust,
    adjustedLE: adjustedLE.toFixed(1), remainingYears: remainingYears.toFixed(1),
    deathDate, lifeScore, factors: factors.sort((a, b) => a.impact - b.impact)
  };"""

new_result = """  state.result = {
    dob, age: Math.floor(age), sex, baseLE, totalAdjust,
    adjustedLE: adjustedLE.toFixed(1), remainingYears: remainingYears.toFixed(1),
    expectedAge: parseFloat(adjustedLE.toFixed(1)),
    ageNow: Math.floor(age),
    deathDate, lifeScore, factors: factors.sort((a, b) => a.impact - b.impact)
  };"""

if old_result in html:
    html = html.replace(old_result, new_result)
    patches.append('PATCH 2: Added expectedAge and ageNow to state.result (fixes NaN timeline)')
else:
    patches.append('PATCH 2 SKIP: target not found')

# ============================================================
# PATCH 3: Expand getPartialEstimate to ALL factors
# Replace the entire function with one that covers everything
# ============================================================

old_partial = """function getPartialEstimate() {
  const a = state.answers;
  if (!a.dob) return null;
  const dob = new Date(a.dob);
  if (isNaN(dob.getTime())) return null;
  const now = new Date();
  const age = (now - dob) / (365.25 * 24 * 60 * 60 * 1000);
  if (age < 1 || age > 120) return null;
  const sex = a.sex || 'male';
  const baseLE = getBaseExpectancy(Math.floor(age), sex);
  let adj = 0;
  // Apply all answered factors
  const maps = [
    ['exercise', { '5+': 4.5, '3-4x': 3, '1-2x': 1, 'none': -4 }],
    ['diet', { very_healthy: 5, healthy: 3, average: 0, poor: -4 }],
    ['alcohol', { never: 0, occasional: 0, moderate: -0.5, heavy: -4 }],
    ['smoking', { never: 0, former: -2, current_light: -6, current_heavy: -10 }],
    ['drugs', { none: 0, cannabis: -1, recreational: -3, opioids: -8 }],
    ['stress', { low: 2, moderate: 0, high: -2, very_high: -4 }],
    ['social', { strong: 4, moderate: 2, few: -2, isolated: -7 }],
    ['sleep_hours', { short: -3, moderate_short: -1, optimal: 0, long: -1.5 }],
    ['sleep_quality', { poor: -2, fair: -0.5, good: 0, excellent: 1 }],
    ['healthcare', { regular: 1, occasional: 0, rarely: -1, never: -3 }],
    ['veg_diet', { vegan: 3.5, vegetarian: 2.5, pescatarian: 2, flexitarian: 1, omnivore: 0 }],
    ['processed_food', { minimal: 2, low: 1, moderate: 0, high: -2, very_high: -4 }],
    ['blood_pressure', { normal: 0, elevated: -1, high_1: -3, high_2: -5, unknown: 0 }],
    ['coffee', { moderate: 2, light: 1, heavy: 0.5, none: 0 }],
  ];
  maps.forEach(([key, vals]) => { if (a[key] && vals[a[key]] !== undefined) adj += vals[a[key]]; });
  // BMI
  if (a.height_cm && a.weight_kg) {
    const bmi = a.weight_kg / ((a.height_cm / 100) ** 2);
    if (bmi < 18.5) adj -= 2;
    else if (bmi >= 25 && bmi < 30) adj -= 1;
    else if (bmi >= 30 && bmi < 35) adj -= 3;
    else if (bmi >= 35) adj -= 7;
  }
  const adjustedLE = baseLE + adj;
  const expectedYears = Math.max(1, adjustedLE - age).toFixed(1);
  // Population percentile (rough estimate based on adjusted LE vs base)
  // If adjustedLE > baseLE, you're doing better than average
  const diff = adjustedLE - baseLE;
  // Map: -20 = bottom 5%, 0 = 50%, +10 = top 10%, +15 = top 5%
  let pct;
  if (diff >= 15) pct = 95;
  else if (diff >= 10) pct = 85 + (diff - 10) * 2;
  else if (diff >= 5) pct = 70 + (diff - 5) * 3;
  else if (diff >= 0) pct = 50 + diff * 4;
  else if (diff >= -5) pct = 50 + diff * 4;
  else if (diff >= -10) pct = 30 + (diff + 5) * 4;
  else if (diff >= -20) pct = 10 + (diff + 10) * 2;
  else pct = 5;
  pct = Math.max(1, Math.min(99, Math.round(pct)));
  return { expectedYears, adjustedLE: adjustedLE.toFixed(1), pct, age: Math.floor(age) };
}"""

new_partial = """function getPartialEstimate() {
  const a = state.answers;
  if (!a.dob) return null;
  const dob = new Date(a.dob);
  if (isNaN(dob.getTime())) return null;
  const now = new Date();
  const age = (now - dob) / (365.25 * 24 * 60 * 60 * 1000);
  if (age < 1 || age > 120) return null;
  const sex = a.sex || 'male';
  let baseLE = getBaseExpectancy(Math.floor(age), sex);
  // Country adjustment
  if (a.country && countryLifeExpectancy[a.country]) {
    const cLE = countryLifeExpectancy[a.country];
    const countryBase = sex === 'female' ? cLE.f : cLE.m;
    const usBase = sex === 'female' ? 80.2 : 74.8;
    baseLE = baseLE + (countryBase - usBase);
  }
  let adj = 0;
  // ALL factor maps matching calculateResult exactly
  const maps = [
    ['exercise', { '5+': 4.5, '3-4x': 3, '1-2x': 1, 'none': -4 }],
    ['diet', { very_healthy: 5, healthy: 3, average: 0, poor: -4 }],
    ['alcohol', { never: 0, occasional: 0, moderate: -0.5, heavy: -4 }],
    ['smoking', { never: 0, former: -2, current_light: -6, current_heavy: -10 }],
    ['drugs', { none: 0, cannabis: -1, recreational: -3, opioids: -8 }],
    ['stress', { low: 2, moderate: 0, high: -2, very_high: -4 }],
    ['stress_mgmt', { yes: 1.5, no: 0 }],
    ['social', { strong: 4, moderate: 2, few: -2, isolated: -7 }],
    ['relationship', { married: 2.5, partnered: 2, single: 0, divorced_widowed: -1 }],
    ['sleep_hours', { short: -3, moderate_short: -1, optimal: 0, long: -1.5 }],
    ['sleep_quality', { poor: -2, fair: -0.5, good: 0, excellent: 1 }],
    ['healthcare', { regular: 1, occasional: 0, rarely: -1, never: -3 }],
    ['air_quality', { good: 0, moderate: -1, poor: -3 }],
    ['occupation', { sedentary: -1, moderate: 0, physical: 0.5, hazardous: -4 }],
    ['sport', { tennis: 4.5, badminton: 3, soccer: 2.5, cycling: 1.5, swimming: 1.5, running: 1, gym: 0.5, none: 0 }],
    ['veg_diet', { vegan: 3.5, vegetarian: 2.5, pescatarian: 2, flexitarian: 1, omnivore: 0 }],
    ['processed_food', { minimal: 2, low: 1, moderate: 0, high: -2, very_high: -4 }],
    ['blood_pressure', { normal: 0, elevated: -1, high_1: -3, high_2: -5, unknown: 0 }],
    ['resting_hr', { low: 2, normal: 0, elevated: -2, high: -4, unknown: 0 }],
    ['coffee', { moderate: 2, light: 1, heavy: 0.5, none: 0 }],
    ['hydration', { good: 2, moderate: 0, poor: -2 }],
    ['dental', { excellent: 1.5, good: 0, poor: -2 }],
    ['sauna', { frequent: 3, moderate: 1.5, rare: 0.5, never: 0 }],
    ['screen_time', { low: 1, moderate: 0, high: -1.5, very_high: -3 }],
    ['nature', { high: 2.5, moderate: 1, low: -1 }],
    ['education', { postgrad: 4, bachelors: 3, some_college: 1.5, high_school: 0, less: -2 }],
    ['income', { high: 3, middle: 0, low: -3 }],
    ['gratitude', { high: 2, moderate: 1, low: 0 }],
    ['volunteering', { regular: 2, occasional: 1, none: 0 }],
    ['religion', { weekly: 3, occasional: 1, none: 0 }],
    ['omega3', { high: 3, moderate: 1.5, low: -1 }],
    ['pet', { dog: 1.5, cat: 0.5, other: 0.5, none: 0 }],
  ];
  maps.forEach(([key, vals]) => { if (a[key] && vals[a[key]] !== undefined) adj += vals[a[key]]; });
  // BMI
  if (a.height_cm && a.weight_kg) {
    const bmi = a.weight_kg / ((a.height_cm / 100) ** 2);
    if (bmi < 18.5) adj -= 2;
    else if (bmi >= 25 && bmi < 30) adj -= 1;
    else if (bmi >= 30 && bmi < 35) adj -= 3;
    else if (bmi >= 35) adj -= 7;
  }
  // Family history
  const p1 = a.parent1_age || 0;
  const p2 = a.parent2_age || 0;
  const avgP = (p1 && p2) ? (p1 + p2) / 2 : (p1 || p2);
  if (avgP) {
    if (avgP >= 80) adj += 4;
    else if (avgP >= 65) adj += 0;
    else adj -= 3;
  }
  // Conditions
  const conds = (a.conditions || []).map(c => typeof c === 'object' ? c.label : c);
  if (conds.length > 0 && !conds.includes('None')) {
    const condImpact = { 'Diabetes': -4, 'Heart Disease': -6, 'Hypertension': -3, 'Cancer (current/remission)': -5, 'Stroke History': -5, 'COPD': -5, 'Chronic Kidney Disease': -4, 'Autoimmune Condition': -2 };
    conds.forEach(c => { if (condImpact[c]) adj += condImpact[c]; });
  }
  // Apply same caps as calculateResult
  const cappedAdj = Math.max(-30, Math.min(30, adj));
  const adjustedLE = baseLE + cappedAdj;
  const expectedYears = Math.max(1, adjustedLE - age).toFixed(1);
  const diff = adjustedLE - baseLE;
  let pct;
  if (diff >= 15) pct = 95;
  else if (diff >= 10) pct = 85 + (diff - 10) * 2;
  else if (diff >= 5) pct = 70 + (diff - 5) * 3;
  else if (diff >= 0) pct = 50 + diff * 4;
  else if (diff >= -5) pct = 50 + diff * 4;
  else if (diff >= -10) pct = 30 + (diff + 5) * 4;
  else if (diff >= -20) pct = 10 + (diff + 10) * 2;
  else pct = 5;
  pct = Math.max(0.01, Math.min(99.99, pct));
  return { expectedYears, adjustedLE: adjustedLE.toFixed(1), pct: pct.toFixed(2), age: Math.floor(age) };
}"""

if old_partial in html:
    html = html.replace(old_partial, new_partial)
    patches.append('PATCH 3: Expanded getPartialEstimate to ALL 32 factors + country + conditions + family + 2dp percentile')
else:
    patches.append('PATCH 3 SKIP: target not found')

# ============================================================
# PATCH 4: Update live bar display to show 2dp percentile
# The display uses (100 - est.pct) which was integer, now is string
# ============================================================

old_livebar = """liveBar.innerHTML = '<div style="flex:1;"><div style="color:var(--text2);margin-bottom:2px;">Expected lifespan: <strong style="color:var(--text);font-size:0.85rem;">' + est.adjustedLE + ' years</strong> <span style="color:var(--text3);">(' + est.expectedYears + ' years left)</span></div><div style="background:var(--bg);border-radius:4px;height:6px;overflow:hidden;margin-top:4px;"><div style="width:' + est.pct + '%;height:100%;background:' + barColor + ';border-radius:4px;transition:width 0.5s;"></div></div></div><div style="text-align:center;min-width:60px;"><div style="font-size:1.1rem;font-weight:700;color:' + barColor + ';">Top ' + (100 - est.pct) + '%</div><div style="color:var(--text3);font-size:0.65rem;">of population</div></div>';"""

new_livebar = """liveBar.innerHTML = '<div style="flex:1;"><div style="color:var(--text2);margin-bottom:2px;">Expected lifespan: <strong style="color:var(--text);font-size:0.85rem;">' + est.adjustedLE + ' years</strong> <span style="color:var(--text3);">(' + est.expectedYears + ' years left)</span></div><div style="background:var(--bg);border-radius:4px;height:6px;overflow:hidden;margin-top:4px;"><div style="width:' + parseFloat(est.pct) + '%;height:100%;background:' + barColor + ';border-radius:4px;transition:width 0.5s;"></div></div></div><div style="text-align:center;min-width:70px;"><div style="font-size:1rem;font-weight:700;color:' + barColor + ';">Top ' + (100 - parseFloat(est.pct)).toFixed(2) + '%</div><div style="color:var(--text3);font-size:0.65rem;">of population</div></div>';"""

# This appears twice: once in renderQuestion and once in updateLiveBar
count = html.count(old_livebar)
if count > 0:
    html = html.replace(old_livebar, new_livebar)
    patches.append(f'PATCH 4: Updated live bar to 2dp percentile ({count} occurrences)')
else:
    patches.append('PATCH 4 SKIP: target not found')

# Also update the pct check thresholds to use parseFloat since pct is now a string
old_bar_color = "const barColor = est.pct > 60 ? 'var(--green)' : est.pct > 40 ? 'var(--gold)' : 'var(--accent)';"
new_bar_color = "const barColor = parseFloat(est.pct) > 60 ? 'var(--green)' : parseFloat(est.pct) > 40 ? 'var(--gold)' : 'var(--accent)';"
count2 = html.count(old_bar_color)
if count2 > 0:
    html = html.replace(old_bar_color, new_bar_color)
    patches.append(f'PATCH 4b: Fixed barColor comparison for string pct ({count2} occurrences)')

# ============================================================
# PATCH 5: Make result page ghost match timer bar ghost + float + habit commentary
# Replace the static renderDeathyCompanion call with a floating ghost that
# uses the same SVG as the timer bar and comments on specific habits
# ============================================================

old_ghost_section = """    <!-- MEET YOUR DEATHY -->
    <div style="margin-top:32px; text-align:center;">
      <h3 style="color:var(--accent); margin-bottom:4px; font-size:1.3rem;">Meet Your Ghost</h3>
      <p style="color:var(--text2); font-size:0.9rem; margin-bottom:8px;">This is <strong style="color:var(--gold)">${generateDeathyName()}</strong>. Your personal afterlife companion. They look like you... statistically speaking.</p>
    </div>
    <div id="deathyResult">${renderDeathyCompanion(180)}</div>"""

new_ghost_section = """    <!-- MEET YOUR DEATHY -->
    <div style="margin-top:32px; text-align:center;">
      <h3 style="color:var(--accent); margin-bottom:4px; font-size:1.3rem;">Meet Your Ghost</h3>
      <p style="color:var(--text2); font-size:0.9rem; margin-bottom:8px;">This is <strong style="color:var(--gold)">${generateDeathyName()}</strong>. Your personal afterlife companion. They look like you... statistically speaking.</p>
    </div>
    <div id="deathyResult">${renderResultGhost()}</div>"""

if old_ghost_section in html:
    html = html.replace(old_ghost_section, new_ghost_section)
    patches.append('PATCH 5a: Replaced renderDeathyCompanion with renderResultGhost')
else:
    patches.append('PATCH 5a SKIP')

# Add the renderResultGhost function before renderResult
old_render_result = "\nfunction renderResult() {"
new_render_result = """
function getHabitCommentary() {
  const a = state.answers;
  const r = state.result;
  if (!r || !r.factors) return '';
  const negF = r.factors.filter(f => f.impact < 0).sort((a,b) => a.impact - b.impact);
  const posF = r.factors.filter(f => f.impact > 0).sort((a,b) => b.impact - a.impact);
  const complaints = [];
  const thanks = [];
  // Complaints about bad habits
  if (a.smoking && (a.smoking === 'current_heavy' || a.smoking === 'current_light'))
    complaints.push("You're literally burning my ghost lungs with those cigarettes.");
  if (a.exercise === 'none')
    complaints.push("You haven't moved since 2019. My ghost legs are atrophying.");
  if (a.diet === 'poor')
    complaints.push("Your diet is making me haunt a dumpster. Get some vegetables.");
  if (a.alcohol === 'heavy')
    complaints.push("My ghost liver is filing a complaint.");
  if (a.sleep_hours === 'short')
    complaints.push("Sleep deprivation? You're speed-running my arrival.");
  if (a.social === 'isolated')
    complaints.push("Talk to SOMEONE. Even ghosts need friends.");
  if (a.stress === 'very_high')
    complaints.push("Your stress levels are stressing ME out. And I'm dead.");
  if (a.processed_food === 'very_high')
    complaints.push("Ultra-processed everything? My ghost stomach is rebelling.");
  if (a.screen_time === 'very_high')
    complaints.push("6+ hours of screen time? Your eyeballs are haunting themselves.");
  if (a.drugs === 'opioids')
    complaints.push("I don't want to meet you this early. Seriously.");
  // Thanks for good habits
  if (a.exercise === '5+')
    thanks.push("Those 5+ workouts a week? Chef's kiss. My ghost abs are showing.");
  if (a.sport === 'tennis')
    thanks.push("Tennis! The sport of immortals. Well, almost.");
  if (a.diet === 'very_healthy')
    thanks.push("Your diet is so clean I'm practically glowing.");
  if (a.social === 'strong')
    thanks.push("Strong social circle! You're making death look fashionably late.");
  if (a.sleep_quality === 'excellent')
    thanks.push("Beautiful sleep hygiene. My ghost dreams are vivid.");
  if (a.sauna === 'frequent')
    thanks.push("That sauna habit? Finnish scientists would be proud of you.");
  if (a.omega3 === 'high')
    thanks.push("Omega-3 levels? Practically a dolphin. In a good way.");
  if (a.veg_diet === 'vegan' || a.veg_diet === 'pescatarian')
    thanks.push("Your plant-forward diet is adding years. I'm impressed.");
  if (a.nature === 'high')
    thanks.push("All that nature time! Trees are basically ghost repellent.");
  if (a.volunteering === 'regular')
    thanks.push("Volunteering gives you purpose AND years. Efficient.");
  // Pick random mix
  const msgs = [];
  if (complaints.length > 0) msgs.push(complaints[Math.floor(Math.random() * complaints.length)]);
  if (thanks.length > 0) msgs.push(thanks[Math.floor(Math.random() * thanks.length)]);
  if (msgs.length === 0) {
    if (negF.length > posF.length) msgs.push("We need to talk about your life choices...");
    else msgs.push("Not bad, human. Not bad at all.");
  }
  return msgs.join(' ');
}

function renderResultGhost() {
  const params = getDeathyParams();
  const hScore = calcDeathyHealth(params);
  const g = state.longevityGoal;
  const totalScore = Math.min(100, hScore + Math.min(20, ((g && g.totalDaysAdded)||0)*0.5));
  const ghostColor = totalScore >= 70 ? '#4ecca3' : totalScore >= 40 ? '#f0c040' : '#e94560';
  const eyeStyle = totalScore >= 70 ? 'happy' : totalScore >= 40 ? 'neutral' : 'sad';
  const commentary = getHabitCommentary();

  // Same SVG as timer bar ghost but bigger
  const ghostSvg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="50" cy="90" rx="22" ry="4" fill="rgba(255,255,255,0.05)"/>' +
    '<path d="M25,55 Q25,15 50,15 Q75,15 75,55 L75,75 Q70,70 65,75 Q60,70 55,75 Q50,70 45,75 Q40,70 35,75 Q30,70 25,75 Z" fill="' + ghostColor + '" opacity="0.9"/>' +
    (eyeStyle === 'happy' ?
      '<circle cx="38" cy="42" r="4" fill="#0a0a0f"/><circle cx="62" cy="42" r="4" fill="#0a0a0f"/><path d="M38,52 Q50,62 62,52" stroke="#0a0a0f" stroke-width="2.5" fill="none" stroke-linecap="round"/>' :
      eyeStyle === 'neutral' ?
      '<circle cx="38" cy="42" r="4" fill="#0a0a0f"/><circle cx="62" cy="42" r="4" fill="#0a0a0f"/><line x1="40" y1="55" x2="60" y2="55" stroke="#0a0a0f" stroke-width="2.5" stroke-linecap="round"/>' :
      '<circle cx="38" cy="44" r="4" fill="#0a0a0f"/><circle cx="62" cy="44" r="4" fill="#0a0a0f"/><path d="M38,58 Q50,50 62,58" stroke="#0a0a0f" stroke-width="2.5" fill="none" stroke-linecap="round"/>') +
    '<circle cx="40" cy="40" r="1.5" fill="rgba(255,255,255,0.7)"/>' +
    '</svg>';

  const ds = getDeathyState();
  ds.lastVisit = Date.now();
  ds.healthScore = hScore;
  saveDeathyState(ds);

  return '<div style="text-align:center; margin:24px auto; max-width:300px; position:relative;">' +
    '<div id="resultGhostBubble" style="background:var(--surface); border:2px solid var(--border); border-radius:16px; padding:14px 18px; margin-bottom:8px; position:relative; font-size:0.9rem; color:var(--text); line-height:1.5; animation:deathyFadeIn 0.5s ease; cursor:pointer;" onclick="cycleResultGhostMsg()">' +
      commentary +
      '<div style="position:absolute; bottom:-10px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:10px solid transparent; border-right:10px solid transparent; border-top:10px solid var(--border);"></div>' +
    '</div>' +
    '<div id="resultGhostSvg" style="width:160px; height:192px; margin:0 auto; animation:ghostFloat 3s ease-in-out infinite; cursor:pointer;" onclick="cycleResultGhostMsg()">' +
      ghostSvg +
    '</div>' +
    '<div style="font-size:0.75rem; color:var(--text3); margin-top:-8px;">' +
      'Health Score: <span style="color:' + (hScore>=70?'var(--green)':hScore>=40?'var(--gold)':'var(--accent)') + '">' + Math.round(hScore) + '/100</span>' +
      (hScore < 50 ? ' | <span style="color:var(--accent)">I need help!</span>' : '') +
    '</div>' +
    '<div style="font-size:0.7rem; color:var(--text3); margin-top:4px;">Click the ghost for more commentary</div>' +
  '</div>';
}

function cycleResultGhostMsg() {
  const bubble = document.getElementById('resultGhostBubble');
  if (!bubble) return;
  const msg = getHabitCommentary();
  bubble.style.animation = 'none';
  bubble.offsetHeight;
  bubble.style.animation = 'deathyFadeIn 0.5s ease';
  // Keep the arrow div
  const arrow = bubble.querySelector('div');
  bubble.textContent = '';
  bubble.appendChild(document.createTextNode(msg));
  if (arrow) bubble.appendChild(arrow);
  else {
    const a = document.createElement('div');
    a.style.cssText = 'position:absolute; bottom:-10px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:10px solid transparent; border-right:10px solid transparent; border-top:10px solid var(--border);';
    bubble.appendChild(a);
  }
}

function renderResult() {"""

if old_render_result in html:
    html = html.replace(old_render_result, new_render_result, 1)
    patches.append('PATCH 5b: Added renderResultGhost + getHabitCommentary + cycleResultGhostMsg')
else:
    patches.append('PATCH 5b SKIP')

# ============================================================
# PATCH 6: Add ghostFloat CSS animation
# ============================================================

old_css_anim = "@keyframes deathyFadeIn"
new_css_anim = """@keyframes ghostFloat {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  25% { transform: translateY(-12px) translateX(8px); }
  50% { transform: translateY(-6px) translateX(-8px); }
  75% { transform: translateY(-14px) translateX(4px); }
}
@keyframes deathyFadeIn"""

if old_css_anim in html:
    html = html.replace(old_css_anim, new_css_anim, 1)
    patches.append('PATCH 6: Added ghostFloat CSS animation (float left-right-up-down)')
else:
    patches.append('PATCH 6 SKIP')

# ============================================================
# Write output
# ============================================================
with open(FILE, 'w') as f:
    f.write(html)

print(f"File saved: {len(html)} chars, {html.count(chr(10))+1} lines")
for p in patches:
    print(p)
