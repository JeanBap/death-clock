function generateDeathy(params = {}) {
  const p = {
    bmi: params.bmi || 'healthy',
    age: params.age || 35,
    smoking: params.smoking || 'never',
    exercise: params.exercise || '3-4x',
    diet: params.diet || 'healthy',
    alcohol: params.alcohol || 'never',
    drugs: params.drugs || 'none',
    stress: params.stress || 'moderate',
    social: params.social || 'moderate',
    sleep: params.sleep || 'optimal',
    sleepQuality: params.sleepQuality || 'good',
    conditions: params.conditions || [],
    healthcare: params.healthcare || 'regular',
    activity: params.activity || 'none',
    region: params.region || 'neutral',
    healthScore: params.healthScore || null,
  };
  if (p.healthScore === null) p.healthScore = calcDeathyHealth(p);
  const hScore = Math.max(0, Math.min(100, p.healthScore));

  // Unique ID suffix to avoid SVG gradient collisions
  const uid = Math.random().toString(36).substr(2,6);

  // Body width from BMI
  const bodyWidths = { underweight:0.6, healthy:0.85, overweight:1.05, obese:1.3, severely_obese:1.55 };
  const bodyW = bodyWidths[p.bmi] || 0.85;

  // Ghost color degrades with poor health
  const ghostR = Math.round(255 - (100-hScore)*0.8);
  const ghostG = Math.round(255 - (100-hScore)*1.2);
  const ghostB = Math.round(255 - (100-hScore)*0.6);
  const ghostColor = `rgb(${ghostR},${ghostG},${ghostB})`;
  const shadowR = Math.round(200 - (100-hScore)*1.0);
  const shadowG = Math.round(210 - (100-hScore)*1.5);
  const shadowB = Math.round(220 - (100-hScore)*0.8);
  const shadowColor = `rgb(${shadowR},${shadowG},${shadowB})`;

  let glowColor, glowOpacity;
  if (hScore >= 80) { glowColor='#4ecca3'; glowOpacity=0.3; }
  else if (hScore >= 60) { glowColor='#f9ed69'; glowOpacity=0.2; }
  else if (hScore >= 40) { glowColor='#f38181'; glowOpacity=0.2; }
  else { glowColor='#6c5b7b'; glowOpacity=0.15; }

  // Eye state
  let eyeStyle = 'normal';
  if (p.sleep === 'short' || p.sleepQuality === 'poor') eyeStyle = 'tired';
  if (p.alcohol === 'heavy' || p.drugs === 'recreational' || p.drugs === 'opioids') eyeStyle = 'bloodshot';
  if (p.exercise === '5+' && (p.diet === 'very_healthy' || p.diet === 'healthy')) eyeStyle = 'bright';
  if (p.stress === 'very_high') eyeStyle = 'worried';

  // Mouth
  let mouthStyle = 'happy';
  if (hScore >= 80) mouthStyle = 'happy';
  else if (hScore >= 60) mouthStyle = 'slight_smile';
  else if (hScore >= 40) mouthStyle = 'neutral';
  else if (hScore >= 20) mouthStyle = 'worried';
  else mouthStyle = 'sad';
  if (p.smoking === 'current_heavy' || p.smoking === 'current_light') mouthStyle = 'smoking';

  const showBones = hScore < 25;
  let ageLines = 0;
  if (p.age > 50) ageLines = 1;
  if (p.age > 65) ageLines = 2;
  if (p.age > 80) ageLines = 3;

  const cx = 100, cy = 95;
  let svg = `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<defs>`;
  svg += `<radialGradient id="dg${uid}" cx="40%" cy="30%"><stop offset="0%" stop-color="${ghostColor}"/><stop offset="100%" stop-color="${shadowColor}"/></radialGradient>`;
  svg += `<filter id="gl${uid}"><feGaussianBlur stdDeviation="4" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>`;
  svg += `</defs>`;

  // Glow
  svg += `<ellipse cx="${cx}" cy="${cy+10}" rx="${55*bodyW}" ry="70" fill="${glowColor}" opacity="${glowOpacity}" filter="url(#gl${uid})"/>`;

  // Body
  const bw = 50*bodyW, tailY = cy+65, wa = 8;
  svg += `<path d="M ${cx-bw} ${cy-10} Q ${cx-bw} ${cy-60} ${cx} ${cy-65} Q ${cx+bw} ${cy-60} ${cx+bw} ${cy-10} L ${cx+bw} ${tailY-10} Q ${cx+bw*0.75} ${tailY+wa} ${cx+bw*0.5} ${tailY-5} Q ${cx+bw*0.25} ${tailY-wa-5} ${cx} ${tailY} Q ${cx-bw*0.25} ${tailY+wa+5} ${cx-bw*0.5} ${tailY-5} Q ${cx-bw*0.75} ${tailY-wa} ${cx-bw} ${tailY-10} Z" fill="url(#dg${uid})"/>`;

  // Bones
  if (showBones) {
    svg += `<line x1="${cx}" y1="${cy-20}" x2="${cx}" y2="${cy+40}" stroke="#aaa" stroke-width="2" opacity="0.3"/>`;
    svg += `<line x1="${cx-15}" y1="${cy}" x2="${cx+15}" y2="${cy}" stroke="#aaa" stroke-width="1.5" opacity="0.3"/>`;
  }

  // Eyes
  const eyeY = cy-20, eyeS = 16*Math.min(bodyW,1.1);
  svg += `<ellipse cx="${cx-eyeS}" cy="${eyeY}" rx="10" ry="12" fill="#111"/>`;
  svg += `<ellipse cx="${cx+eyeS}" cy="${eyeY}" rx="10" ry="12" fill="#111"/>`;

  if (eyeStyle === 'bright') {
    svg += `<circle cx="${cx-eyeS+3}" cy="${eyeY-3}" r="2" fill="#fff" opacity="0.8"/>`;
    svg += `<circle cx="${cx+eyeS+3}" cy="${eyeY-3}" r="2" fill="#fff" opacity="0.8"/>`;
  }
  if (eyeStyle === 'tired') {
    svg += `<path d="M ${cx-eyeS-8} ${eyeY+10} Q ${cx-eyeS} ${eyeY+16} ${cx-eyeS+8} ${eyeY+10}" fill="none" stroke="#8888aa" stroke-width="1.5" opacity="0.5"/>`;
    svg += `<path d="M ${cx+eyeS-8} ${eyeY+10} Q ${cx+eyeS} ${eyeY+16} ${cx+eyeS+8} ${eyeY+10}" fill="none" stroke="#8888aa" stroke-width="1.5" opacity="0.5"/>`;
  }
  if (eyeStyle === 'bloodshot') {
    svg += `<line x1="${cx-eyeS-6}" y1="${eyeY-4}" x2="${cx-eyeS-2}" y2="${eyeY}" stroke="#e94560" stroke-width="0.5" opacity="0.6"/>`;
    svg += `<line x1="${cx+eyeS+6}" y1="${eyeY-4}" x2="${cx+eyeS+2}" y2="${eyeY}" stroke="#e94560" stroke-width="0.5" opacity="0.6"/>`;
  }
  if (eyeStyle === 'worried') {
    svg += `<line x1="${cx-eyeS-8}" y1="${eyeY-16}" x2="${cx-eyeS+5}" y2="${eyeY-14}" stroke="${shadowColor}" stroke-width="2.5" stroke-linecap="round"/>`;
    svg += `<line x1="${cx+eyeS+8}" y1="${eyeY-16}" x2="${cx+eyeS-5}" y2="${eyeY-14}" stroke="${shadowColor}" stroke-width="2.5" stroke-linecap="round"/>`;
  }

  // Mouth
  const mY = cy+8;
  if (mouthStyle === 'happy') {
    svg += `<path d="M ${cx-14} ${mY-2} Q ${cx-5} ${mY+16} ${cx+14} ${mY-2}" fill="#111"/>`;
    svg += `<ellipse cx="${cx+4}" cy="${mY+8}" rx="6" ry="5" fill="#e94560"/>`;
  } else if (mouthStyle === 'slight_smile') {
    svg += `<path d="M ${cx-10} ${mY} Q ${cx} ${mY+10} ${cx+10} ${mY}" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>`;
  } else if (mouthStyle === 'neutral') {
    svg += `<line x1="${cx-8}" y1="${mY+3}" x2="${cx+8}" y2="${mY+3}" stroke="#555" stroke-width="2.5" stroke-linecap="round"/>`;
  } else if (mouthStyle === 'worried') {
    svg += `<path d="M ${cx-10} ${mY+8} Q ${cx} ${mY} ${cx+10} ${mY+8}" fill="none" stroke="#555" stroke-width="2.5" stroke-linecap="round"/>`;
  } else if (mouthStyle === 'sad') {
    svg += `<path d="M ${cx-12} ${mY+10} Q ${cx} ${mY-2} ${cx+12} ${mY+10}" fill="none" stroke="#666" stroke-width="2.5" stroke-linecap="round"/>`;
  } else if (mouthStyle === 'smoking') {
    svg += `<path d="M ${cx-8} ${mY+2} Q ${cx} ${mY+6} ${cx+8} ${mY+2}" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round"/>`;
    svg += `<rect x="${cx+8}" y="${mY-1}" width="18" height="4" rx="1" fill="#f5deb3"/>`;
    svg += `<rect x="${cx+22}" y="${mY-1}" width="4" height="4" rx="1" fill="#e94560" opacity="0.8"/>`;
    svg += `<path d="M ${cx+26} ${mY-4} Q ${cx+30} ${mY-14} ${cx+25} ${mY-22}" fill="none" stroke="#999" stroke-width="1" opacity="0.4"/>`;
  }

  // Age lines
  if (ageLines >= 1) svg += `<path d="M ${cx-bw+10} ${cy+5} Q ${cx-bw+15} ${cy+2} ${cx-bw+20} ${cy+5}" fill="none" stroke="${shadowColor}" stroke-width="1" opacity="0.4"/>`;
  if (ageLines >= 2) svg += `<path d="M ${cx+bw-20} ${cy+5} Q ${cx+bw-15} ${cy+2} ${cx+bw-10} ${cy+5}" fill="none" stroke="${shadowColor}" stroke-width="1" opacity="0.4"/>`;

  // Activity accessories
  if (p.activity === 'tennis' || p.activity === 'running' || p.activity === 'gym') {
    svg += `<path d="M ${cx-bw+5} ${cy-48} Q ${cx} ${cy-52} ${cx+bw-5} ${cy-48}" fill="none" stroke="#e94560" stroke-width="3" stroke-linecap="round"/>`;
  }
  if (p.activity === 'yoga') {
    svg += `<circle cx="${cx}" cy="${cy-72}" r="4" fill="none" stroke="#4ecca3" stroke-width="1.5" opacity="0.6"/>`;
    svg += `<circle cx="${cx}" cy="${cy-72}" r="8" fill="none" stroke="#4ecca3" stroke-width="1" opacity="0.3"/>`;
  }
  if (p.activity === 'swimming') {
    svg += `<path d="M ${cx-eyeS-10} ${eyeY-2} L ${cx-eyeS+10} ${eyeY-2}" fill="none" stroke="#00b4d8" stroke-width="2"/>`;
    svg += `<path d="M ${cx+eyeS-10} ${eyeY-2} L ${cx+eyeS+10} ${eyeY-2}" fill="none" stroke="#00b4d8" stroke-width="2"/>`;
    svg += `<line x1="${cx-eyeS+10}" y1="${eyeY-2}" x2="${cx+eyeS-10}" y2="${eyeY-2}" stroke="#00b4d8" stroke-width="1.5"/>`;
  }
  if (p.activity === 'cycling') {
    svg += `<path d="M ${cx-25} ${cy-50} Q ${cx} ${cy-72} ${cx+25} ${cy-50}" fill="none" stroke="#f9ed69" stroke-width="3" stroke-linecap="round"/>`;
  }
  if (p.activity === 'soccer') {
    svg += `<circle cx="${cx+bw+15}" cy="${cy+45}" r="8" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.5"/>`;
  }

  // Lifestyle indicators
  if (p.exercise === '5+') {
    svg += `<path d="M ${cx-bw-3} ${cy+5} L ${cx-bw-8} ${cy+2} L ${cx-bw-3} ${cy-1}" fill="none" stroke="${shadowColor}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>`;
    svg += `<path d="M ${cx+bw+3} ${cy+5} L ${cx+bw+8} ${cy+2} L ${cx+bw+3} ${cy-1}" fill="none" stroke="${shadowColor}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>`;
  }
  if (p.alcohol === 'heavy') {
    svg += `<rect x="${cx-bw-18}" y="${cy+15}" width="10" height="16" rx="2" fill="none" stroke="#f9ed69" stroke-width="1.5" opacity="0.5"/>`;
    svg += `<rect x="${cx-bw-17}" y="${cy+18}" width="8" height="8" rx="1" fill="#f9ed69" opacity="0.3"/>`;
  }
  if (p.sleep === 'short' || p.sleepQuality === 'poor') {
    svg += `<text x="${cx+bw+5}" y="${cy-30}" font-size="10" fill="#888" opacity="0.5" font-family="sans-serif">z</text>`;
    svg += `<text x="${cx+bw+12}" y="${cy-38}" font-size="8" fill="#888" opacity="0.4" font-family="sans-serif">z</text>`;
  }
  if (p.social === 'strong') {
    svg += `<path d="M ${cx} ${cy+50} L ${cx-5} ${cy+44} A 4 4 0 0 1 ${cx} ${cy+40} A 4 4 0 0 1 ${cx+5} ${cy+44} Z" fill="#e94560" opacity="0.5"/>`;
  }
  if (p.social === 'isolated') {
    svg += `<circle cx="${cx}" cy="${cy+50}" r="3" fill="none" stroke="#666" stroke-width="1" opacity="0.4" stroke-dasharray="2,2"/>`;
  }
  if (p.stress === 'low' && p.exercise !== 'none') {
    svg += `<ellipse cx="${cx}" cy="${cy-60}" rx="18" ry="5" fill="none" stroke="#4ecca3" stroke-width="1.5" opacity="0.4"/>`;
  }
  if (p.stress === 'very_high') {
    svg += `<path d="M ${cx-bw+8} ${cy-35} Q ${cx-bw+6} ${cy-30} ${cx-bw+8} ${cy-28}" fill="#6cb4ee" opacity="0.5"/>`;
  }
  if (p.conditions && p.conditions.includes('heart_disease')) {
    svg += `<text x="${cx-4}" y="${cy+5}" font-size="10" fill="#e94560" opacity="0.4">&#9829;</text>`;
  }

  svg += `</svg>`;
  return svg;
}

function calcDeathyHealth(p) {
  let score = 75;
  const bmiS = { underweight:-5, healthy:0, overweight:-3, obese:-10, severely_obese:-20 };
  score += (bmiS[p.bmi]||0);
  const smokS = { never:0, former:-5, current_light:-15, current_heavy:-25 };
  score += (smokS[p.smoking]||0);
  const exS = { '5+':12, '3-4x':8, '1-2x':3, none:-12 };
  score += (exS[p.exercise]||0);
  const dietS = { very_healthy:12, healthy:6, average:0, poor:-12 };
  score += (dietS[p.diet]||0);
  const alcS = { never:0, occasional:0, moderate:-2, heavy:-12 };
  score += (alcS[p.alcohol]||0);
  const drugS = { none:0, cannabis:-3, recreational:-10, opioids:-20 };
  score += (drugS[p.drugs]||0);
  const strS = { low:5, moderate:0, high:-5, very_high:-12 };
  score += (strS[p.stress]||0);
  const socS = { strong:10, moderate:5, few:-5, isolated:-18 };
  score += (socS[p.social]||0);
  const slpS = { optimal:0, moderate_short:-3, short:-8, long:-4 };
  score += (slpS[p.sleep]||0);
  const condP = { diabetes:-10, heart_disease:-12, hypertension:-8, cancer:-6, stroke:-15, copd:-10, kidney_disease:-8, autoimmune:-5 };
  (p.conditions||[]).forEach(c => { score += (condP[c]||0); });
  return Math.max(5, Math.min(100, score));
}

// Map user's calculator answers to Deathy params
function getDeathyParams() {
  const a = state.answers;
  // BMI
  let bmi = 'healthy';
  if (a.height_cm && a.weight_kg) {
    const bmiVal = a.weight_kg / ((a.height_cm/100)**2);
    if (bmiVal < 18.5) bmi = 'underweight';
    else if (bmiVal < 25) bmi = 'healthy';
    else if (bmiVal < 30) bmi = 'overweight';
    else if (bmiVal < 40) bmi = 'obese';
    else bmi = 'severely_obese';
  }
  // Age
  let age = 30;
  if (a.dob) {
    const bd = new Date(a.dob);
    age = Math.floor((Date.now() - bd.getTime()) / (365.25*24*60*60*1000));
  }
  // Conditions mapping
  const condMap = { 'Diabetes':'diabetes', 'Heart Disease':'heart_disease', 'Hypertension':'hypertension',
    'Cancer (current/remission)':'cancer', 'Stroke History':'stroke', 'COPD':'copd',
    'Chronic Kidney Disease':'kidney_disease', 'Autoimmune Condition':'autoimmune' };
  const conditions = (a.conditions||[]).filter(c=>c!=='None').map(c=>condMap[c]||'').filter(Boolean);

  return {
    bmi, age,
    smoking: a.smoking || 'never',
    exercise: a.exercise || '3-4x',
    diet: a.diet || 'healthy',
    alcohol: a.alcohol || 'never',
    drugs: a.drugs || 'none',
    stress: a.stress || 'moderate',
    social: a.social || 'moderate',
    sleep: a.sleep_hours || 'optimal',
    sleepQuality: a.sleep_quality || 'good',
    conditions,
    healthcare: a.healthcare || 'regular',
    activity: a.sport || 'none',
    region: 'neutral'
  };
}

// Save/load deathy state
function getDeathyState() {
  try { return JSON.parse(localStorage.getItem('dc_deathy_state')) || {}; } catch(e) { return {}; }
}
function saveDeathyState(ds) {
  localStorage.setItem('dc_deathy_state', JSON.stringify(ds));
}

function getDeathyXP() {
  const ds = getDeathyState();
  const daysSurvived = Math.floor((Date.now() - (ds.createdAt || Date.now())) / 86400000);
  const avgHP = ds.healthScore || 50;
  const peakHP = ds.peakHP || avgHP;
  return daysSurvived * 5 + avgHP * 8 + peakHP * 3;
}

const XP_THRESHOLDS = [0,100,300,600,1000,1500,2200,3000,4000,5200,6500,8000,10000,12500,15000,18000,22000,27000,33000,40000];
const LEVEL_TITLES = ['Freshly Dead','Ghost Intern','Spirit Trainee','Phantom Rookie','Wraith Apprentice','Shade Scout','Specter Agent','Haunter Pro','Poltergeist','Soul Guardian','Ether Walker','Void Dancer','Reaper Rival','Death Defier','Immortal Aspirant','Time Bender','Fate Twister','Destiny Hacker','Life Lord','Eternal One'];

function getDeathyLevel(xp) {
  let lvl = 0;
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) { lvl = i; break; }
  }
  const nextThreshold = XP_THRESHOLDS[lvl + 1] || XP_THRESHOLDS[lvl] * 1.5;
  const prevThreshold = XP_THRESHOLDS[lvl];
  const progress = (xp - prevThreshold) / (nextThreshold - prevThreshold);
  return { level: lvl + 1, title: LEVEL_TITLES[lvl], xp, nextXP: nextThreshold, progress: Math.min(1, progress) };
}

const ACHIEVEMENTS = [
  {id:'first_steps', name:'First Steps', desc:'Complete your first day', icon:'👣', check: ds => (ds.daysSurvived||0) > 0},
  {id:'week_survivor', name:'Week Survivor', desc:'Survive 7 days', icon:'📅', check: ds => (ds.daysSurvived||0) >= 7},
  {id:'month_champion', name:'Month Champion', desc:'30 days strong', icon:'🏆', check: ds => (ds.daysSurvived||0) >= 30},
  {id:'upward_bound', name:'Upward Bound', desc:'Improve HP by 5+ points', icon:'📈', check: ds => (ds.healthScore||0) > (ds.baseScore||50) + 5},
  {id:'peak_performer', name:'Peak Performer', desc:'Reach 90+ HP', icon:'⭐', check: ds => (ds.peakHP||0) >= 90},
  {id:'rock_bottom', name:'Rock Bottom', desc:'Hit below 15 HP (survived!)', icon:'💀', check: ds => (ds.lowestHP||100) < 15},
  {id:'iron_will', name:'Iron Will', desc:'Never drop below 50 HP for 30 days', icon:'🛡️', check: ds => (ds.daysSurvived||0) >= 30 && (ds.lowestHP||0) >= 50},
  {id:'comeback', name:'Comeback King', desc:'Rise from <30 to >70 HP', icon:'🔥', check: ds => (ds.lowestHP||100) < 30 && (ds.healthScore||0) > 70},
  {id:'centurion', name:'Centurion', desc:'100 days with your ghost', icon:'💯', check: ds => (ds.daysSurvived||0) >= 100},
  {id:'habit_master', name:'Habit Master', desc:'Log 50+ habit completions', icon:'✅', check: ds => (ds.totalHabitLogs||0) >= 50},
];

function getUnlockedAchievements() {
  const ds = getDeathyState();
  ds.daysSurvived = Math.floor((Date.now() - (ds.createdAt || Date.now())) / 86400000);
  const g = state.longevityGoal;
  if (g) ds.totalHabitLogs = (g.totalDaysAdded || 0) * 10; // rough proxy
  return ACHIEVEMENTS.filter(a => a.check(ds));
}

// ============================================
function getEngagementMode() {
  const ds = getDeathyState();
  const lastVisit = ds.lastVisit || Date.now();
  const hoursSince = (Date.now() - lastVisit) / 3600000;
  const g = state.longevityGoal;
  const recentLogs = g ? (g.history || []).filter(h => Date.now() - new Date(h.date).getTime() < 86400000 * 3).length : 0;

  if (hoursSince > 168) return { mode: 'neglect', mult: -1.5 }; // 7+ days
  if (hoursSince > 72) return { mode: 'low', mult: -0.5 }; // 3+ days
  if (recentLogs >= 5) return { mode: 'obsessed', mult: 1.2 };
  if (recentLogs >= 2) return { mode: 'high', mult: 0.8 };
  return { mode: 'moderate', mult: 0.3 };
}

function evolveGhost() {
  const ds = getDeathyState();
  if (!ds.createdAt) { ds.createdAt = Date.now(); saveDeathyState(ds); return; }

  const lastEvolve = ds.lastEvolveDay || 0;
  const today = Math.floor(Date.now() / 86400000);
  if (lastEvolve >= today) return; // Already evolved today

  const baseScore = ds.healthScore || 50;
  const engagement = getEngagementMode();

  const baseDrift = (baseScore - 50) * 0.003;
  const engEffect = engagement.mult * 0.15;
  const randomNoise = (Math.random() - 0.5) * 0.3;
  let dailyChange = baseDrift + engEffect + randomNoise;

  // Death spiral for very unhealthy + neglected
  if (baseScore < 30 && engagement.mult < 0) dailyChange *= 1.5;
  // Diminishing returns for very healthy + engaged
  if (baseScore > 80 && engagement.mult > 0) dailyChange *= 0.7;

  const newHP = Math.max(2, Math.min(100, baseScore + dailyChange));
  ds.healthScore = Math.round(newHP * 10) / 10;
  ds.peakHP = Math.max(ds.peakHP || 0, ds.healthScore);
  ds.lowestHP = Math.min(ds.lowestHP || 100, ds.healthScore);
  ds.lastEvolveDay = today;
  ds.baseScore = ds.baseScore || baseScore;
  ds.daysSurvived = Math.floor((Date.now() - ds.createdAt) / 86400000);
  saveDeathyState(ds);
}

function getDeathyStage(hp) {
  if (hp >= 85) return { name: 'Thriving', color: '#4ecca3', cls: 'stage-thriving' };
  if (hp >= 65) return { name: 'Content', color: '#64b4ff', cls: 'stage-content' };
  if (hp >= 45) return { name: 'Worried', color: '#f0c040', cls: 'stage-worried' };
  if (hp >= 25) return { name: 'Sick', color: '#ff8c32', cls: 'stage-sick' };
  return { name: 'Dying Again', color: '#e94560', cls: 'stage-dying' };
}

function getGhostAnimClass(hp, params) {
  const a = state.answers || {};
  // Very sick
  if (hp < 15) return 'shiver 0.8s infinite';
  // Opioid
  if (a.drugs === 'opioids') return 'opioidDrift 5s ease-in-out infinite';
  // Sport-specific (need HP >= 30)
  if (hp >= 30) {
    if (a.sport === 'swimming') return 'swimBob 3s ease-in-out infinite';
    if (a.sport === 'cycling') return 'cyclistLean 2.5s ease-in-out infinite';
    if (a.sport === 'running') return 'runnerBounce 1.8s ease-in-out infinite';
    if (a.sport === 'tennis' || a.sport === 'badminton') return 'tennisBounce 2s ease-in-out infinite';
    if (a.sport === 'soccer') return 'soccerDribble 3s ease-in-out infinite';
    if (a.sport === 'gym') return 'gymFlex 3s ease-in-out infinite';
    if (a.exercise === '5+') return 'yogaLevitate 4s ease-in-out infinite';
  }
  // Habit-specific
  if (a.smoking === 'current_heavy' || a.smoking === 'current_light') return 'smokerCough 6s ease-in-out infinite';
  if (a.alcohol === 'heavy') return 'drinkerSway 4s ease-in-out infinite';
  if (a.sleep_hours === 'short') return 'insomniacNod 5s ease-in-out infinite';
  if (a.stress === 'very_high') return 'stressedTwitch 4s ease-in-out infinite';
  if (a.exercise === 'none') return 'sedentarySlump 5s ease-in-out infinite';
  // HP-based fallback
  if (hp >= 85) return 'ghostFloat 3s ease-in-out infinite';
  if (hp >= 65) return 'ghostFloat 4s ease-in-out infinite';
  if (hp >= 45) return 'ghostFloat 5s ease-in-out infinite';
  return 'ghostFloat 6s ease-in-out infinite';
}

function getGhostAccessories() {
  const a = state.answers || {};
  let accessories = '';

  // Regional headgear based on country
  const country = a.country || '';
  const regionMap = {
    'United Kingdom': '<rect x="32" y="6" width="36" height="8" rx="2" fill="#1a1a2e"/><rect x="38" y="2" width="24" height="6" rx="1" fill="#1a1a2e"/>', // Top hat
    'France': '<ellipse cx="50" cy="12" rx="18" ry="6" fill="#2d2d44"/><ellipse cx="50" cy="10" rx="14" ry="5" fill="#e94560"/>', // Beret
    'Australia': '<path d="M30,14 Q50,8 70,14 L72,16 Q50,18 28,16 Z" fill="#8B6914"/><circle cx="28" cy="15" r="2" fill="#8B6914"/>', // Aussie hat
    'Japan': '<path d="M30,14 Q50,2 70,14" fill="none" stroke="#e94560" stroke-width="1.5"/><line x1="50" y1="3" x2="50" y2="14" stroke="#e94560" stroke-width="1"/>', // Conical
    'Mexico': '<ellipse cx="50" cy="14" rx="24" ry="4" fill="#f0c040"/><path d="M35,14 Q50,4 65,14" fill="#f0c040"/>', // Sombrero
    'India': '<path d="M38,12 Q50,2 62,12" fill="#f0c040" stroke="#e94560" stroke-width="0.5"/>', // Turban peak
    'Saudi Arabia': '<rect x="35" y="8" width="30" height="6" fill="#fff" opacity="0.9"/><circle cx="50" cy="8" r="3" fill="#1a1a2e"/>', // Keffiyeh
    'Germany': '<path d="M35,12 L50,4 L65,12" fill="#2d6b2d"/><circle cx="50" cy="11" r="2" fill="#f0c040"/>', // Tyrolean
    'Brazil': '<ellipse cx="50" cy="12" rx="16" ry="5" fill="#f0c040"/><path d="M34,12 Q50,18 66,12" fill="#4ecca3"/>', // Carnival
    'Russia': '<path d="M36,14 Q50,0 64,14" fill="#8B4513"/><ellipse cx="50" cy="14" rx="16" ry="3" fill="#8B4513"/>', // Ushanka
  };

  // Check region groups
  const european = ['France','Italy','Spain','Portugal','Germany','Netherlands','Belgium','Austria','Switzerland','Sweden','Norway','Denmark','Finland','Greece','Poland','Czech Republic'];
  const asian = ['Japan','China','South Korea','Taiwan','Vietnam','Thailand','Philippines','Indonesia','Malaysia','Singapore'];
  const middleEastern = ['Saudi Arabia','United Arab Emirates','Qatar','Kuwait','Oman','Bahrain','Iraq','Iran','Jordan','Lebanon'];
  const african = ['Nigeria','South Africa','Kenya','Ghana','Ethiopia','Egypt','Morocco','Tanzania','Uganda'];
  const latinAmerican = ['Mexico','Brazil','Argentina','Colombia','Chile','Peru','Ecuador','Venezuela','Cuba'];

  if (regionMap[country]) {
    accessories += regionMap[country];
  } else if (european.includes(country)) {
    accessories += '<ellipse cx="50" cy="12" rx="18" ry="6" fill="#2d2d44"/><ellipse cx="50" cy="10" rx="14" ry="5" fill="#4466aa"/>'; // Beret
  } else if (asian.includes(country)) {
    accessories += '<path d="M30,14 Q50,2 70,14" fill="none" stroke="#f0c040" stroke-width="1.5"/><line x1="50" y1="3" x2="50" y2="14" stroke="#f0c040" stroke-width="1"/>'; // Conical hat
  } else if (middleEastern.includes(country)) {
    accessories += '<rect x="35" y="8" width="30" height="6" fill="#fff" opacity="0.8"/>';
  } else if (african.includes(country)) {
    accessories += '<rect x="38" y="8" width="24" height="8" rx="3" fill="#e94560"/><rect x="40" y="6" width="20" height="3" fill="#f0c040"/>'; // Kufi
  } else if (latinAmerican.includes(country)) {
    accessories += '<ellipse cx="50" cy="14" rx="22" ry="4" fill="#f0c040"/><path d="M35,14 Q50,6 65,14" fill="#f0c040"/>';
  }

  // Activity accessories based on sport
  if (a.sport === 'tennis' || a.sport === 'badminton') {
    accessories += '<line x1="72" y1="50" x2="88" y2="35" stroke="#aaa" stroke-width="2"/><ellipse cx="90" cy="33" rx="6" ry="8" fill="none" stroke="#4ecca3" stroke-width="1.5"/>';
  } else if (a.sport === 'swimming') {
    accessories += '<rect x="33" y="38" width="34" height="5" rx="2" fill="#4488ff" opacity="0.7"/>';
  } else if (a.sport === 'cycling') {
    accessories += '<ellipse cx="50" cy="10" rx="16" ry="7" fill="#333" opacity="0.8"/><path d="M34,10 Q50,3 66,10" fill="#e94560"/>';
  } else if (a.sport === 'running') {
    accessories += '<rect x="36" y="9" width="28" height="4" rx="2" fill="#ff6b6b"/>';
  } else if (a.sport === 'soccer') {
    accessories += '<circle cx="78" cy="75" r="6" fill="#fff" stroke="#333" stroke-width="0.8"/><path d="M75,75 L78,72 L81,75 L79,78 L77,78 Z" fill="#333"/>';
  } else if (a.sport === 'gym') {
    accessories += '<rect x="20" y="48" width="12" height="3" rx="1" fill="#666"/><circle cx="18" cy="49" r="3" fill="#888"/><circle cx="34" cy="49" r="3" fill="#888"/>';
  }

  // Smoking accessory
  if (a.smoking === 'current_heavy' || a.smoking === 'current_light') {
    accessories += '<line x1="58" y1="55" x2="70" y2="52" stroke="#ccc" stroke-width="1.5"/><circle cx="71" cy="51" r="1.5" fill="#ff6b00" opacity="0.8"/>';
  }

  // BUG-020 FIX: Apply purchased shop cosmetics from dc_deathy_state
  try {
    const ds = JSON.parse(localStorage.getItem('dc_deathy_state') || '{}');
    const shopItems = ds.accessories || [];
    if (shopItems.includes('ghost_hat')) {
      accessories += '<rect x="32" y="4" width="36" height="10" rx="2" fill="#1a1a2e"/><rect x="38" y="0" width="24" height="6" rx="1" fill="#1a1a2e"/>';
    }
    if (shopItems.includes('ghost_crown')) {
      accessories += '<path d="M32,10 L38,2 L44,8 L50,0 L56,8 L62,2 L68,10 Z" fill="#f0c040" stroke="#daa520" stroke-width="0.5"/>';
    }
    if (shopItems.includes('ghost_fire')) {
      accessories += '<g opacity="0.6"><ellipse cx="50" cy="90" rx="20" ry="8" fill="#ff4500"/><ellipse cx="45" cy="88" rx="8" ry="12" fill="#ff6600"/><ellipse cx="55" cy="86" rx="6" ry="10" fill="#ff8c00"/></g>';
    }
  } catch(e) {}

  return accessories;
}

const PRODUCT_RECS = [
  {id:'p_fitbit',name:'Fitness Tracker',desc:'Track steps, heart rate, sleep quality',icon:'⌚',url:'https://amzn.to/fitness-tracker',trigger:['exercise_none','exercise_1to2','rhr_elevated','rhr_high'],category:'fitness'},
  {id:'p_air_purifier',name:'HEPA Air Purifier',desc:'Remove 99.97% of airborne particles',icon:'🌬️',url:'https://amzn.to/air-purifier',trigger:['air_moderate','air_poor'],category:'environment'},
  {id:'p_omega3',name:'Omega-3 Fish Oil (EPA/DHA)',desc:'Pharmaceutical grade, 2000mg daily',icon:'💊',url:'https://amzn.to/omega3-supplement',trigger:['omega3_low','omega3_moderate'],category:'supplements'},
  {id:'p_standing_desk',name:'Standing Desk Converter',desc:'Reduce sitting time by 4+ hours/day',icon:'🖥️',url:'https://amzn.to/standing-desk',trigger:['occ_sedentary','screen_very_high','screen_high'],category:'fitness'},
  {id:'p_meditation_app',name:'Meditation App (1yr)',desc:'Guided meditation, breathing exercises',icon:'🧘',url:'https://amzn.to/meditation-app',trigger:['stress_high','stress_very_high'],category:'mental_health'},
  {id:'p_sleep_mask',name:'Weighted Sleep Mask',desc:'Block light, promote deeper sleep',icon:'😴',url:'https://amzn.to/sleep-mask',trigger:['sleep_short','sleep_moderate_short','sleep_quality_poor'],category:'sleep'},
  {id:'p_water_bottle',name:'Smart Water Bottle',desc:'Tracks intake, reminds you to drink',icon:'💧',url:'https://amzn.to/smart-water-bottle',trigger:['hydration_poor','hydration_moderate'],category:'hydration'},
  {id:'p_electric_toothbrush',name:'Electric Toothbrush + Flosser',desc:'Reduces gum disease risk by 70%',icon:'🪥',url:'https://amzn.to/electric-toothbrush',trigger:['dental_poor'],category:'dental'},
  {id:'p_sauna_blanket',name:'Infrared Sauna Blanket',desc:'Get sauna benefits at home',icon:'🧖',url:'https://amzn.to/sauna-blanket',trigger:['sauna_never','sauna_rare'],category:'recovery'},
  {id:'p_bp_monitor',name:'Blood Pressure Monitor',desc:'Track BP trends at home',icon:'❤️',url:'https://amzn.to/bp-monitor',trigger:['bp_elevated','bp_high_1','bp_high_2'],category:'health_testing'},
  {id:'p_nicotine_patch',name:'Nicotine Replacement Patches',desc:'Clinically proven quit aid',icon:'🩹',url:'https://amzn.to/nicotine-patches',trigger:['smoking_current_heavy','smoking_current_light'],category:'smoking'},
  {id:'p_vitamin_d',name:'Vitamin D3 + K2',desc:'Essential for 73% of adults who are deficient',icon:'☀️',url:'https://amzn.to/vitamin-d',trigger:['nature_low'],category:'supplements'},
  {id:'p_blue_light',name:'Blue Light Blocking Glasses',desc:'Reduce eye strain, improve sleep onset',icon:'👓',url:'https://amzn.to/blue-light-glasses',trigger:['screen_high','screen_very_high'],category:'sleep'},
  {id:'p_resistance_bands',name:'Resistance Bands Set',desc:'Full body workout, no gym needed',icon:'💪',url:'https://amzn.to/resistance-bands',trigger:['exercise_none','exercise_1to2','sport_none'],category:'fitness'},
  {id:'p_journal',name:'Gratitude Journal',desc:'5-minute daily practice, clinically proven',icon:'📓',url:'https://amzn.to/gratitude-journal',trigger:['gratitude_low','stress_high'],category:'mental_health'},
  {id:'p_magnesium',name:'Magnesium Glycinate',desc:'Better sleep, lower stress, muscle recovery',icon:'💊',url:'https://amzn.to/magnesium',trigger:['sleep_quality_poor','sleep_quality_fair','stress_high'],category:'supplements'},
  {id:'p_dog_walking',name:'Dog Walking Service (1 month)',desc:'Ensures your dog gets daily exercise (and you!)',icon:'🐕',url:'https://amzn.to/dog-walking',trigger:['pet_dog','exercise_none'],category:'fitness'},
  {id:'p_tennis_racket',name:'Beginner Tennis Racket',desc:'The #1 longevity sport. Start today.',icon:'🎾',url:'https://amzn.to/tennis-racket',trigger:['sport_none','sport_gym'],category:'fitness'},
];

function getPersonalisedProducts() {
  const r = state.result;
  if (!r || !r.factors) return [];
  const negFactorKeys = r.factors.filter(f => f.impact < 0).map(f => f.key);
  const matched = PRODUCT_RECS.filter(p => p.trigger.some(t => negFactorKeys.includes(t)));
  return matched.slice(0, 6); // Max 6 recs
}

function trackProductClick(productId) {
  // Track in localStorage for now, Supabase later
  const clicks = JSON.parse(localStorage.getItem('dc_product_clicks') || '[]');
  clicks.push({ id: productId, ts: Date.now() });
  localStorage.setItem('dc_product_clicks', JSON.stringify(clicks));
  // Analytics event
  if (typeof gtag === 'function') gtag('event', 'product_click', { product_id: productId });
}

function renderProductRecs() {
  const products = getPersonalisedProducts();
  if (products.length === 0) return '';
  return '<div style="margin-top:32px;"><h3 style="color:var(--gold); margin-bottom:12px; font-size:1.1rem;">Recommended For You</h3><p style="color:var(--text3); font-size:0.8rem; margin-bottom:16px;">Products that directly address your negative factors. Each link supports our research.</p><div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:12px;">' +
    products.map(p => '<div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:16px; cursor:pointer;" onclick="trackProductClick(\'' + p.id + '\'); window.open(\'' + p.url + '\',\'_blank\')"><div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;"><span style="font-size:1.5rem;">' + p.icon + '</span><div><div style="font-weight:600; color:var(--text); font-size:0.9rem;">' + p.name + '</div><div style="font-size:0.75rem; color:var(--text3);">' + p.category + '</div></div></div><div style="font-size:0.85rem; color:var(--text2);">' + p.desc + '</div></div>').join('') +
    '</div></div>';
}

