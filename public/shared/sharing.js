// ============================================
// DEATHY PERSONALITY ENGINE - 30+ phrases
// ============================================

function getDeathyMessage() {
  const ds = getDeathyState();
  const g = state.longevityGoal;
  const now = Date.now();
  const lastVisit = ds.lastVisit || now;
  const daysSinceVisit = Math.floor((now - lastVisit) / (24*60*60*1000));
  const { streak } = g ? getStreakInfo() : { streak: 0 };
  const params = getDeathyParams();
  const hScore = calcDeathyHealth(params);

  // Priority-ordered message selection
  const messages = [];

  // First ever visit
  if (!ds.lastVisit) {
    messages.push({ msg: "Well, well, well. Fresh meat. Let me take a good look at what I'm working with here...", mood: 'curious' });
    messages.push({ msg: "Oh great, another human who thinks they're immortal. Spoiler: you're not.", mood: 'sarcastic' });
    messages.push({ msg: "I'm your personal ghost. I get healthier when you do. No pressure, but also... all the pressure.", mood: 'intro' });
  }

  // Absent for 7+ days
  if (daysSinceVisit >= 7) {
    messages.push({ msg: "You were gone for " + daysSinceVisit + " days. I was literally fading away. Do you even care about me?", mood: 'guilt' });
    messages.push({ msg: daysSinceVisit + " days without checking in. At this rate YOU'LL be the ghost, not me.", mood: 'dark' });
    messages.push({ msg: "Oh you're back? I was starting to pick out your headstone font.", mood: 'snarky' });
  }
  // Absent 3-6 days
  else if (daysSinceVisit >= 3) {
    messages.push({ msg: "Three days without you. I've been haunting an empty tab like a sad Tamagotchi.", mood: 'needy' });
    messages.push({ msg: "Miss me? Because your life expectancy certainly didn't miss those " + daysSinceVisit + " days of bad habits.", mood: 'dark' });
  }

  // Based on health score
  if (hScore >= 85) {
    messages.push({ msg: "Look at you, all glowing and healthy. I'm almost too pretty to be a ghost.", mood: 'proud' });
    messages.push({ msg: "My glow-up is YOUR glow-up. We're basically the same entity at this point.", mood: 'happy' });
    messages.push({ msg: "I'm radiating so much health energy right now, other ghosts are jealous.", mood: 'flex' });
  } else if (hScore >= 65) {
    messages.push({ msg: "Not bad, not bad. You're keeping me in decent shape. Could be glowier though.", mood: 'ok' });
    messages.push({ msg: "I'd say I'm a solid 7 out of 10 ghost right now. Help me hit a 9?", mood: 'hopeful' });
  } else if (hScore >= 45) {
    messages.push({ msg: "I'm looking a bit grey lately. That's YOUR fault by the way.", mood: 'blame' });
    messages.push({ msg: "My bones are showing through. That's... not a fashion statement.", mood: 'worried' });
    messages.push({ msg: "Remember when I used to glow green? Yeah, me neither at this point.", mood: 'sad' });
  } else {
    messages.push({ msg: "I can see my own skeleton. This is fine. Everything is fine. (It's not fine.)", mood: 'panic' });
    messages.push({ msg: "I'm literally decomposing in real-time. Is that burger really worth it?", mood: 'desperate' });
    messages.push({ msg: "At this rate, I'll be haunting YOUR funeral instead of the other way around.", mood: 'grim' });
  }

  // Streak-based
  if (streak >= 30) {
    messages.push({ msg: streak + " day streak?! I haven't looked this good since... well, ever. I'm a ghost, I was born dead.", mood: 'ecstatic' });
  } else if (streak >= 7) {
    messages.push({ msg: streak + " days straight! I'm starting to feel things. Emotions. Is this what being alive is like?", mood: 'excited' });
  } else if (streak === 0 && g && g.plan && g.plan.length > 0) {
    messages.push({ msg: "Zero streak. ZERO. You're literally killing your own ghost. Think about that.", mood: 'disappointed' });
    messages.push({ msg: "No habits logged today? Cool cool cool. I'll just sit here slowly dying. Again.", mood: 'passive_aggressive' });
  }

  // Smoking specific
  if (params.smoking === 'current_heavy') {
    messages.push({ msg: "Dude, I'm a ghost and even I think those cigarettes smell bad.", mood: 'cough' });
    messages.push({ msg: "Every cigarette takes 11 minutes off YOUR life and makes ME uglier. Quit. Please.", mood: 'begging' });
  }

  // Alcohol heavy
  if (params.alcohol === 'heavy') {
    messages.push({ msg: "My eyes are bloodshot and I don't even have blood. Thanks for the liver damage proxy.", mood: 'hungover' });
  }

  // Isolated
  if (params.social === 'isolated') {
    messages.push({ msg: "You listed your social life as 'isolated'. I'm literally your most active relationship. That's concerning.", mood: 'awkward' });
  }

  // Sedentary
  if (params.exercise === 'none') {
    messages.push({ msg: "You don't exercise at all? My wavy ghost tail gets more movement than you do.", mood: 'shade' });
  }

  // Perfect health
  if (hScore >= 95) {
    messages.push({ msg: "I'm basically a wellness influencer at this point. #GhostGains #DeathClockApproved", mood: 'influencer' });
  }

  // Premium upsell moments
  if (state.userTier === 'free' && g && g.plan && g.plan.length > 1) {
    messages.push({ msg: "I've got " + (g.plan.length - 1) + " more life-saving habits locked up. Upgrade to Premium and watch me GLOW.", mood: 'sales' });
  }

  // Random daily vibes
  messages.push({ msg: "Every minute you're alive is a minute I stay cute. So stay alive, yeah?", mood: 'sweet' });
  messages.push({ msg: "Did you know the average person spends 6 months of their life waiting for red lights? You could be exercising instead.", mood: 'factoid' });
  messages.push({ msg: "Fun fact: I'm the only ghost who WANTS you to live longer. Most ghosts want company.", mood: 'wholesome' });

  // Pick one (weighted toward priority messages at top)
  const idx = Math.floor(Math.random() * Math.min(messages.length, 4));
  return messages[idx] || messages[0];
}

// Render Deathy companion with speech bubble
function renderDeathyCompanion(size) {
  const params = getDeathyParams();
  const hScore = calcDeathyHealth(params);
  const svg = generateDeathy({...params, healthScore: hScore});
  const msg = getDeathyMessage();
  const ds = getDeathyState();
  ds.lastVisit = Date.now();
  ds.healthScore = hScore;
  saveDeathyState(ds);

  return `
    <div class="deathy-companion" style="text-align:center; margin:24px auto; max-width:${size||320}px;">
      <div class="deathy-speech" style="background:var(--surface); border:2px solid var(--border); border-radius:16px; padding:14px 18px; margin-bottom:-8px; position:relative; font-size:0.9rem; color:var(--text); line-height:1.5; animation:deathyFadeIn 0.5s ease;">
        ${msg.msg}
        <div style="position:absolute; bottom:-10px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:10px solid transparent; border-right:10px solid transparent; border-top:10px solid var(--border);"></div>
      </div>
      <div style="width:${size||160}px; height:${(size||160)*1.2}px; margin:0 auto; cursor:pointer;" onclick="refreshDeathySpeech()" title="Click me for more wisdom">
        ${svg}
      </div>
      <div style="font-size:0.75rem; color:var(--text3); margin-top:-8px;">
        Health Score: <span style="color:${hScore>=70?'var(--green)':hScore>=40?'var(--gold)':'var(--accent)'}">${hScore}/100</span>
        ${hScore < 50 ? ' | <span style="color:var(--accent)">I need help!</span>' : ''}
      </div>
    </div>`;
}

function refreshDeathySpeech() {
  const container = document.querySelector('.deathy-companion');
  if (!container) return;
  const msg = getDeathyMessage();
  const bubble = container.querySelector('.deathy-speech');
  if (bubble) {
    bubble.style.animation = 'none';
    bubble.offsetHeight; // trigger reflow
    bubble.style.animation = 'deathyFadeIn 0.5s ease';
    bubble.childNodes[0].textContent = msg.msg;
  }
}

// Deathy evolution: recalculate when habits change
function updateDeathyAvatar() {
  const el = document.getElementById('deathyAvatarPanel');
  if (!el) return;
  // Recalc with habit bonuses
  const params = getDeathyParams();
  const g = state.longevityGoal;
  if (g && g.totalDaysAdded > 0) {
    // Boost health score based on days added (max +20 bonus)
    const habitBonus = Math.min(20, g.totalDaysAdded * 0.5);
    params.healthScore = Math.min(100, calcDeathyHealth(params) + habitBonus);
  }
  const svg = generateDeathy(params);
  const hScore = params.healthScore || calcDeathyHealth(params);
  el.querySelector('.deathy-svg-wrap').innerHTML = svg;
  const scoreEl = el.querySelector('.deathy-health-num');
  if (scoreEl) {
    scoreEl.textContent = Math.round(hScore) + '/100';
    scoreEl.style.color = hScore>=70?'var(--green)':hScore>=40?'var(--gold)':'var(--accent)';
  }
}


// ============================================
// DEATHY NAME GENERATOR
// ============================================
function generateDeathyName() {
  const a = state.answers;
  const prefixes = {
    smoking: { current_heavy:'Smoky', current_light:'Hazy' },
    exercise: { '5+':'Turbo', '3-4x':'Cardio', '1-2x':'Lazy', none:'Couch' },
    diet: { very_healthy:'Kale', healthy:'Balanced', average:'Meh', poor:'JunkFood' },
    alcohol: { heavy:'Boozy', moderate:'Tipsy', occasional:'SipSip', never:'Sober' },
    stress: { very_high:'Anxious', high:'Wired', moderate:'Chill', low:'Zen' },
    social: { isolated:'Lonely', few:'Wallflower', moderate:'Social', strong:'Popular' },
    sleep_hours: { short:'Insomniac', moderate_short:'Drowsy', optimal:'Rested', long:'Sleepy' },
    drugs: { opioids:'Needles', recreational:'Party', cannabis:'Mellow', none:'' }
  };
  const suffixes_m = ['Steve','Dave','Mike','Frank','Barry','Gary','Chad','Pete','Bob','Rick','Greg','Tom','Dan','Rex','Ned','Stan','Owen','Finn','Lars','Hank'];
  const suffixes_f = ['Karen','Lisa','Sarah','Emma','Tina','Wendy','Donna','Nancy','Claire','Amy','Iris','Zara','Fiona','Carla','Edna','Cleo','Ava','Sally','Sue','Bea'];
  const suffixes_n = ['Ghost','Specter','Phantom','Shadow','Spirit','Wraith','Shade','Haunt','Spook','Echo'];

  // Pick best prefix
  let prefix = '';
  const priorityKeys = ['smoking','drugs','exercise','diet','alcohol','stress','sleep_hours','social'];
  for (const key of priorityKeys) {
    const val = a[key];
    if (val && prefixes[key] && prefixes[key][val]) {
      prefix = prefixes[key][val];
      break;
    }
  }
  if (!prefix) prefix = 'Average';

  // Pick suffix based on sex
  const sex = a.sex || 'neutral';
  let pool = suffixes_n;
  if (sex === 'male') pool = suffixes_m;
  else if (sex === 'female') pool = suffixes_f;

  // Deterministic pick based on DOB hash
  const seed = (a.dob || 'x').split('').reduce((s,c) => s + c.charCodeAt(0), 0);
  const suffix = pool[seed % pool.length];

  return prefix + ' ' + suffix;
}

// ============================================
// SHARE YOUR GHOST CARD
// ============================================
function shareGhostCard() {
  const params = getDeathyParams();
  const hScore = calcDeathyHealth(params);
  const name = generateDeathyName();
  const svg = generateDeathy({...params, healthScore: hScore});
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = 600; canvas.height = 800;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, 600, 800);
  
  // Border glow
  ctx.strokeStyle = hScore >= 70 ? '#4ecca3' : hScore >= 40 ? '#f0c040' : '#e94560';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 580, 780);
  
  // Title
  ctx.fillStyle = '#e94560';
  ctx.font = 'bold 28px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('☠ DEATH CLOCK', 300, 55);
  
  // Ghost name
  ctx.fillStyle = '#eaeaea';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(name, 300, 95);
  
  // Health score circle
  ctx.beginPath();
  ctx.arc(300, 550, 50, 0, Math.PI * 2);
  ctx.strokeStyle = hScore >= 70 ? '#4ecca3' : hScore >= 40 ? '#f0c040' : '#e94560';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = hScore >= 70 ? '#4ecca3' : hScore >= 40 ? '#f0c040' : '#e94560';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(hScore, 300, 560);
  ctx.fillStyle = '#a0a0b0';
  ctx.font = '14px sans-serif';
  ctx.fillText('Health Score', 300, 585);
  
  // Death date
  if (state.result) {
    const dd = state.result.deathDate;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Estimated Death: ' + months[dd.getMonth()] + ' ' + dd.getDate() + ', ' + dd.getFullYear(), 300, 640);
    ctx.fillStyle = '#a0a0b0';
    ctx.font = '16px sans-serif';
    ctx.fillText(state.result.remainingYears + ' years remaining', 300, 670);
  }
  
  // CTA
  ctx.fillStyle = '#666680';
  ctx.font = '14px sans-serif';
  ctx.fillText('Calculate yours at death-clock.app', 300, 720);
  
  // URL
  ctx.fillStyle = '#e94560';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('death-clock.app', 300, 755);
  
  // Render SVG onto canvas
  const svgBlob = new Blob([svg], {type: 'image/svg+xml;charset=utf-8'});
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = function() {
    ctx.drawImage(img, 175, 110, 250, 300);
    URL.revokeObjectURL(url);
    
    // Try native share, fallback to download
    canvas.toBlob(function(blob) {
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'my-deathy.png', {type: 'image/png'});
        if (navigator.canShare({files:[file]})) {
          navigator.share({
            title: 'My Death Clock Ghost',
            text: 'Meet ' + name + '! Health Score: ' + hScore + '/100. Calculate yours at death-clock.app',
            files: [file]
          }).catch(() => downloadGhostCard(blob));
          return;
        }
      }
      downloadGhostCard(blob);
    }, 'image/png');
  };
  img.src = url;
}

function downloadGhostCard(blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'my-deathy-ghost.png';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Ghost card downloaded! Share it everywhere.');
}

function showToast(msg) {
  const sr = document.getElementById('srAnnounce'); if (sr) sr.textContent = msg;
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:var(--surface);border:1px solid var(--green);color:var(--green);padding:12px 24px;border-radius:8px;z-index:99999;font-size:0.9rem;animation:deathyFadeIn 0.3s ease;';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ============================================
// GHOST GRAVEYARD - "Recently Deceased"
// ============================================
function generateGraveyardGhosts() {
  // Generate fake "dead" ghosts with terrible stats
  const epitaphs = [
    { name:'JunkFoodJohn', score:12, cause:'Ate nothing but microwave meals for 15 years', deathAge:52 },
    { name:'CouchPotatoPete', score:18, cause:'Netflix marathon became permanent lifestyle', deathAge:56 },
    { name:'StressedSteve', score:22, cause:'Worked 80hrs/week, never took a holiday', deathAge:49 },
    { name:'BarFlyBrenda', score:15, cause:'Happy hour became happy all-hours', deathAge:54 },
    { name:'InsomniacIris', score:20, cause:'Slept 4 hours a night for two decades', deathAge:58 },
    { name:'LonelyLarry', score:8, cause:'Hadn\'t spoken to another human since 2019', deathAge:47 },
    { name:'ChainSmokerChad', score:11, cause:'Said "I can quit anytime" for 30 years', deathAge:51 },
    { name:'SugarRushRita', score:16, cause:'Thought juice cleanses counted as vegetables', deathAge:55 },
    { name:'DeskJockeyDan', score:19, cause:'Standing desk stayed in the box', deathAge:53 },
    { name:'PartyAnimalPat', score:13, cause:'Every weekend was a bender. Every single one.', deathAge:48 },
    { name:'ScreenTimeSimon', score:17, cause:'12 hours of TikTok daily. Eyes gave out first.', deathAge:50 },
    { name:'SkipBreakfastSam', score:21, cause:'Last meal was always at midnight. From a vending machine.', deathAge:57 },
    { name:'NeverFlossNora', score:23, cause:'Turns out dental hygiene IS connected to heart health', deathAge:59 },
    { name:'RedBullRicky', score:14, cause:'Replaced water with energy drinks in 2015', deathAge:44 },
    { name:'AntiVaxAndy', score:10, cause:'Did his own research. The research disagreed.', deathAge:46 },
  ];
  // Rotate based on day of year
  const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / (24*60*60*1000));
  const shuffled = epitaphs.sort((a,b) => ((a.name.charCodeAt(0)*doy)%100) - ((b.name.charCodeAt(0)*doy)%100));
  return shuffled.slice(0, 5);
}

function renderGraveyard() {
  const ghosts = generateGraveyardGhosts();
  return `
    <div style="margin-top:48px;">
      <h3 style="text-align:center; color:var(--text3); margin-bottom:4px; font-size:1.1rem;">⚰ Ghost Graveyard</h3>
      <p style="text-align:center; color:var(--text3); font-size:0.8rem; margin-bottom:16px;">Recently deceased. Don't end up here.</p>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:10px;">
        ${ghosts.map(g => {
          const svg = generateDeathy({ healthScore: g.score, bmi: g.score < 15 ? 'severely_obese' : 'overweight', exercise: 'none', diet: 'poor', smoking: g.score < 12 ? 'current_heavy' : 'never', alcohol: g.score < 16 ? 'heavy' : 'moderate', stress: 'very_high', social: 'isolated', sleep: 'short' });
          return `<div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:10px; text-align:center; opacity:0.7;">
            <div style="width:80px; height:96px; margin:0 auto; filter:grayscale(60%);">${svg}</div>
            <div style="font-size:0.75rem; color:var(--accent); font-weight:600; margin-top:4px;">RIP ${g.name}</div>
            <div style="font-size:0.65rem; color:var(--text3);">Died at ${g.deathAge}</div>
            <div style="font-size:0.6rem; color:var(--text3); font-style:italic; margin-top:2px;">"${g.cause}"</div>
            <div style="font-size:0.65rem; color:var(--accent); margin-top:2px;">Score: ${g.score}/100</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

// ============================================
// PUSH NOTIFICATIONS (local, via service worker)
// ============================================
function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    scheduleDeathyReminder();
    showToast('Deathy will haunt your notifications now.');
    localStorage.setItem('dc_notif_enabled', 'true');
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') {
        scheduleDeathyReminder();
        showToast('Deathy will haunt your notifications now.');
        localStorage.setItem('dc_notif_enabled', 'true');
      }
    });
  }
}

function scheduleDeathyReminder() {
  // Check every 4 hours if habits logged today
  if (window._deathyReminderInterval) clearInterval(window._deathyReminderInterval);
  window._deathyReminderInterval = setInterval(() => {
    const g = state.longevityGoal;
    if (!g || !g.plan || g.plan.length === 0) return;
    const today = getTodayKey();
    const logged = (g.logs[today] || []).length;
    if (logged === 0) {
      const msgs = [
        "You haven't logged any habits today. I'm literally fading away over here.",
        "Hey. HEY. Your ghost is dying. Log a habit before I become invisible.",
        "Zero habits logged. At this rate, you'll be joining me sooner than planned.",
        "Your Deathy is looking rough. One habit. That's all I'm asking.",
        "I've been waiting all day. My glow is fading. Please help."
      ];
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      new Notification('☠ Deathy needs you', { body: msg, icon: '/icon-192.png', tag: 'deathy-reminder' });
    }
  }, 4 * 60 * 60 * 1000); // Every 4 hours
  
  // Also check on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && localStorage.getItem('dc_notif_enabled') === 'true') {
      const g = state.longevityGoal;
      if (!g) return;
      const today = getTodayKey();
      const logged = (g.logs[today] || []).length;
      const lastNag = localStorage.getItem('dc_last_nag');
      const now = Date.now();
      if (logged === 0 && (!lastNag || now - parseInt(lastNag) > 6*60*60*1000)) {
        localStorage.setItem('dc_last_nag', now.toString());
      }
    }
  });
}

// ============================================
// BEFORE/AFTER DEATHY SLIDER
// ============================================
function saveInitialDeathy() {
  if (localStorage.getItem('dc_initial_deathy')) return; // Already saved
  const params = getDeathyParams();
  const hScore = calcDeathyHealth(params);
  localStorage.setItem('dc_initial_deathy', JSON.stringify({
    params, hScore, date: new Date().toISOString().split('T')[0]
  }));
}

function renderBeforeAfter() {
  const initial = localStorage.getItem('dc_initial_deathy');
  if (!initial) return '';
  
  try {
    const init = JSON.parse(initial);
    const currentParams = getDeathyParams();
    const g = state.longevityGoal;
    const habitBonus = g ? Math.min(20, (g.totalDaysAdded||0) * 0.5) : 0;
    const currentScore = Math.min(100, calcDeathyHealth(currentParams) + habitBonus);
    const diff = currentScore - init.hScore;
    
    if (Math.abs(diff) < 1) return ''; // No meaningful change yet
    
    const beforeSvg = generateDeathy({...init.params, healthScore: init.hScore});
    const afterSvg = generateDeathy({...currentParams, healthScore: currentScore});
    
    return `
    <div style="margin-top:32px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:20px;">
      <h3 style="text-align:center; margin-bottom:12px; font-size:1.1rem;">Your Ghost's Glow-Up</h3>
      <div style="display:flex; align-items:center; justify-content:center; gap:16px; flex-wrap:wrap;">
        <div style="text-align:center;">
          <div style="font-size:0.75rem; color:var(--text3); margin-bottom:4px;">Day 1 (${init.date})</div>
          <div style="width:100px; height:120px; filter:${init.hScore<40?'grayscale(30%)':'none'};">${beforeSvg}</div>
          <div style="font-size:0.8rem; color:${init.hScore>=70?'var(--green)':init.hScore>=40?'var(--gold)':'var(--accent)'};">${init.hScore}/100</div>
        </div>
        <div style="font-size:2rem; color:var(--text3);">→</div>
        <div style="text-align:center;">
          <div style="font-size:0.75rem; color:var(--text3); margin-bottom:4px;">Now</div>
          <div style="width:100px; height:120px;">${afterSvg}</div>
          <div style="font-size:0.8rem; color:${currentScore>=70?'var(--green)':currentScore>=40?'var(--gold)':'var(--accent)'};">${Math.round(currentScore)}/100</div>
        </div>
      </div>
      <div style="text-align:center; margin-top:8px; font-size:0.9rem; color:${diff>0?'var(--green)':'var(--accent)'}; font-weight:600;">
        ${diff > 0 ? '⬆ +' + diff.toFixed(0) + ' points! Your ghost is thriving.' : '⬇ ' + diff.toFixed(0) + ' points. Your ghost is concerned.'}
      </div>
    </div>`;
  } catch(e) { return ''; }
}

// ============================================
// EMBEDDABLE DEATHY WIDGET
// ============================================
function showEmbedCode() {
  const params = getDeathyParams();
  const hScore = calcDeathyHealth(params);
  const name = generateDeathyName();
  const deathYear = state.result ? state.result.deathDate.getFullYear() : '????';
  const remaining = state.result ? state.result.remainingYears : '??';
  
  const embedCode = `<div style="background:#0a0a0f;border:2px solid #e94560;border-radius:12px;padding:16px;max-width:280px;text-align:center;font-family:sans-serif;">
<div style="color:#e94560;font-weight:bold;font-size:14px;">☠ Death Clock</div>
<div style="color:#eaeaea;font-size:12px;margin:4px 0;">${name} | Score: ${hScore}/100</div>
<div style="color:#a0a0b0;font-size:11px;">Estimated death: ${deathYear} (${remaining} years left)</div>
<a href="https://death-clock.app" style="display:inline-block;margin-top:8px;background:#e94560;color:#fff;padding:6px 16px;border-radius:6px;font-size:11px;text-decoration:none;">Calculate Yours</a>
</div>`;
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:99999;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:24px;max-width:500px;width:90%;">
      <h3 style="margin-bottom:8px;">Embed Your Ghost</h3>
      <p style="color:var(--text2);font-size:0.8rem;margin-bottom:12px;">Paste this on your blog, website, or social profile. Show the world your mortality.</p>
      <textarea id="embedCodeArea" style="width:100%;height:120px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:8px;font-family:monospace;font-size:0.75rem;resize:none;" readonly>${embedCode.replace(/"/g, '&quot;')}</textarea>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="btn-primary btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('embedCodeArea').value.replace(/&quot;/g,'\"'));showToast('Embed code copied!');">Copy Code</button>
        <button class="btn-secondary btn-sm" onclick="this.closest('.modal-overlay').remove();">Close</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

// ============================================
// DEATHY SOUND EFFECTS
// ============================================
const DeathySounds = {
  _ctx: null,
  _enabled: true,
  
  getCtx() {
    if (!this._ctx) {
      try { this._ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { this._enabled = false; }
    }
    return this._ctx;
  },
  
  play(type) {
    if (!this._enabled || localStorage.getItem('dc_sound_off') === 'true') return;
    const ctx = this.getCtx();
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.08;
    
    if (type === 'habit_done') {
      // Happy chime - ascending notes
      osc.frequency.value = 523; // C5
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
      // Second note
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc2.frequency.value = 659; // E5
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.45);
    }
    else if (type === 'habit_undo') {
      // Sad descending
      osc.frequency.value = 440;
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
    else if (type === 'streak') {
      // Victory fanfare
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = freq;
        o.type = 'sine';
        g.gain.setValueAtTime(0.06, ctx.currentTime + i*0.12);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i*0.12 + 0.3);
        o.start(ctx.currentTime + i*0.12);
        o.stop(ctx.currentTime + i*0.12 + 0.3);
      });
    }
    else if (type === 'death_drop') {
      // Ominous low tone
      osc.frequency.value = 110;
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    }
    else if (type === 'click') {
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    }
  }
};

// ============================================
// DEATH POOL - Losers subsidize winners ($0.99/mo)
// ============================================
function renderDeathPool() {
  const circle = getSocialCircle();
  if (circle.length < 2 && !localStorage.getItem('dc_pool_joined')) return '';
  
  const poolMembers = [...circle];
  if (state.result) {
    poolMembers.unshift({ name: 'You', deathYear: state.result.deathDate.getFullYear(), lifeScore: state.result.lifeScore, isMe: true });
  }
  
  // Sort by improvement (simulated - in real app this would be tracked)
  const ranked = poolMembers.map(m => {
    const improvement = m.isMe ? (state.longevityGoal?.totalDaysAdded || 0) : Math.floor(Math.random() * 30);
    return { ...m, improvement, daysAdded: improvement };
  }).sort((a,b) => b.improvement - a.improvement);
  
  const lastPlace = ranked[ranked.length - 1];
  const firstPlace = ranked[0];
  
  return `
    <div style="margin-top:32px; background:linear-gradient(135deg, rgba(233,69,96,0.05), rgba(240,192,64,0.05)); border:2px solid var(--gold); border-radius:var(--radius); padding:24px;">
      <h3 style="text-align:center; color:var(--gold); margin-bottom:4px;">🎰 The Death Pool</h3>
      <p style="text-align:center; color:var(--text2); font-size:0.85rem; margin-bottom:4px;">Commit to living longer or pay up. $0.99/month.</p>
      <p style="text-align:center; color:var(--text3); font-size:0.75rem; margin-bottom:16px;">The person who improves the least subsidizes everyone else's subscription. You're going to die soon anyway - might as well fund someone who's actually trying.</p>
      
      ${!localStorage.getItem('dc_pool_joined') ? `
        <div style="text-align:center; margin-bottom:16px;">
          <button class="btn-gold" onclick="joinDeathPool()" style="padding:12px 28px; font-size:1rem;">
            💀 Join the Death Pool - $0.99/mo
          </button>
          <div style="font-size:0.7rem; color:var(--text3); margin-top:4px;">Improve your habits or subsidize your friends. Your call.</div>
        </div>
      ` : `
        <div style="text-align:center; margin-bottom:16px; padding:8px; background:var(--surface); border-radius:8px;">
          <span style="color:var(--green);">✓ You're in the pool</span>
          <span style="font-size:0.8rem; color:var(--text3);"> | Started ${localStorage.getItem('dc_pool_date') || 'today'}</span>
        </div>
      `}
      
      <div style="font-size:0.85rem; font-weight:600; margin-bottom:8px; color:var(--text);">Improvement Rankings</div>
      ${ranked.map((m, i) => {
        const isLast = i === ranked.length - 1 && ranked.length > 1;
        const isFirst = i === 0;
        return `<div style="display:flex; align-items:center; gap:8px; padding:8px 12px; margin-bottom:4px; background:${isLast ? 'rgba(233,69,96,0.1)' : isFirst ? 'rgba(78,204,163,0.1)' : 'var(--surface)'}; border-radius:8px; border:1px solid ${isLast ? 'var(--accent)' : isFirst ? 'var(--green)' : 'var(--border)'};">
          <span style="font-size:1.2rem;">${isFirst ? '👑' : isLast ? '💀' : '🏃'}</span>
          <span style="flex:1; font-size:0.85rem; color:${m.isMe ? 'var(--gold)' : 'var(--text)'};">${m.name}${m.isMe ? ' (you)' : ''}</span>
          <span style="font-size:0.8rem; color:var(--green);">+${m.daysAdded.toFixed(1)} days</span>
          ${isLast ? '<span style="font-size:0.7rem; color:var(--accent); font-weight:600;">PAYS</span>' : ''}
          ${isFirst ? '<span style="font-size:0.7rem; color:var(--green); font-weight:600;">FREE</span>' : ''}
        </div>`;
      }).join('')}
      
      ${ranked.length > 1 ? `
        <div style="text-align:center; margin-top:12px; font-size:0.8rem; color:var(--text3);">
          ${lastPlace.isMe ? '🚨 You\'re in last place! Log more habits or your $0.99 funds everyone else.' : `${lastPlace.name} is funding the pool this month. Don't let it be you next month.`}
        </div>
      ` : ''}
    </div>`;
}

function joinDeathPool() {
  localStorage.setItem('dc_pool_joined', 'true');
  localStorage.setItem('dc_pool_date', new Date().toISOString().split('T')[0]);
  showToast('Welcome to the Death Pool! Now improve or pay up.');
  // Re-render social circle area
  const el = document.getElementById('socialCircle');
  if (el) el.innerHTML = renderSocialCircle() + renderDeathPool();
}

// ============================================
// WEEKLY EMAIL DIGEST PREVIEW
// ============================================
function showEmailDigestPreview() {
  const params = getDeathyParams();
  const hScore = calcDeathyHealth(params);
  const name = generateDeathyName();
  const g = state.longevityGoal;
  const { streak } = g ? getStreakInfo() : { streak: 0 };
  const daysAdded = g ? g.totalDaysAdded : 0;
  
  const scoreColor = hScore >= 70 ? '#4ecca3' : hScore >= 40 ? '#f0c040' : '#e94560';
  
  const emailHtml = `
    <div style="max-width:500px; margin:0 auto; background:#0a0a0f; border:2px solid #2a2a3e; border-radius:16px; padding:24px; font-family:-apple-system,sans-serif;">
      <div style="text-align:center; border-bottom:1px solid #2a2a3e; padding-bottom:16px; margin-bottom:16px;">
        <div style="font-size:20px; color:#e94560; font-weight:bold;">☠ Your Weekly Death Report</div>
        <div style="font-size:12px; color:#666680;">Week of ${new Date().toLocaleDateString()}</div>
      </div>
      
      <div style="text-align:center; margin-bottom:16px;">
        <div style="font-size:14px; color:#a0a0b0;">Your ghost, ${name}, says:</div>
        <div style="background:#1a1a2e; border-radius:12px; padding:12px; margin-top:8px; font-size:13px; color:#eaeaea; font-style:italic;">
          "${hScore >= 70 ? "I'm glowing this week! Keep it up and I might just become a friendly ghost instead of a warning." : hScore >= 40 ? "Meh week. I've looked better. I've looked worse. Let's aim for better next week?" : "SOS. Your ghost is in critical condition. Please eat a vegetable. Just one."}"
        </div>
      </div>
      
      <div style="display:flex; gap:12px; margin-bottom:16px;">
        <div style="flex:1; background:#16213e; border-radius:8px; padding:12px; text-align:center;">
          <div style="font-size:24px; color:${scoreColor}; font-weight:bold;">${hScore}</div>
          <div style="font-size:11px; color:#666680;">Health Score</div>
        </div>
        <div style="flex:1; background:#16213e; border-radius:8px; padding:12px; text-align:center;">
          <div style="font-size:24px; color:#4ecca3; font-weight:bold;">+${(daysAdded * 1440).toFixed(0)}</div>
          <div style="font-size:11px; color:#666680;">Minutes Added</div>
        </div>
        <div style="flex:1; background:#16213e; border-radius:8px; padding:12px; text-align:center;">
          <div style="font-size:24px; color:#f0c040; font-weight:bold;">${streak}</div>
          <div style="font-size:11px; color:#666680;">Day Streak</div>
        </div>
      </div>
      
      ${g && g.plan ? `
      <div style="margin-bottom:16px;">
        <div style="font-size:13px; color:#a0a0b0; margin-bottom:8px;">This week's habits:</div>
        ${g.plan.slice(0,3).map(h => `
          <div style="display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid #1a1a2e;">
            <span style="font-size:16px;">${h.icon || '✓'}</span>
            <span style="flex:1; font-size:12px; color:#eaeaea;">${h.name}</span>
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      <div style="text-align:center; margin-top:16px;">
        <a href="https://death-clock.app" style="display:inline-block; background:#e94560; color:#fff; padding:10px 24px; border-radius:8px; text-decoration:none; font-size:13px; font-weight:600;">Open Death Clock</a>
      </div>
      
      <div style="text-align:center; margin-top:16px; font-size:10px; color:#666680;">
        You're receiving this because you told us to remind you that you're dying.<br>
        <a href="#" style="color:#666680;">Unsubscribe</a> (but Deathy will be sad)
      </div>
    </div>`;
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:99999;display:flex;align-items:center;justify-content:center;overflow:auto;padding:20px;';
  modal.innerHTML = `
    <div style="max-width:560px; width:100%;">
      <div style="text-align:right; margin-bottom:8px;">
        <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:var(--text3); font-size:1.5rem; cursor:pointer;">&times;</button>
      </div>
      <div style="background:var(--bg2); border-radius:var(--radius); padding:4px;">
        <div style="text-align:center; margin-bottom:8px; font-size:0.8rem; color:var(--text3);">Email Preview - This is what your weekly digest will look like</div>
        ${emailHtml}
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

// ============================================
// REFERRAL REWARDS
// ============================================
function getReferralCount() {
  return parseInt(localStorage.getItem('dc_referral_count') || '0');
}

function addReferralCount() {
  const count = getReferralCount() + 1;
  localStorage.setItem('dc_referral_count', count.toString());
  if (count >= 3 && state.userTier === 'free') {
    // Unlock one extra habit
    localStorage.setItem('dc_referral_unlocked', 'true');
    showToast('🎉 3 referrals! You unlocked 1 bonus premium habit for free!');
  }
  return count;
}

function getReferralUnlocked() {
  return localStorage.getItem('dc_referral_unlocked') === 'true';
}

function renderReferralCard() {
  const count = getReferralCount();
  const unlocked = getReferralUnlocked();
  const code = getOrCreateInviteCode();
  const remaining = Math.max(0, 3 - count);
  
  return `
    <div style="margin-top:24px; background:linear-gradient(135deg, rgba(78,204,163,0.05), rgba(240,192,64,0.05)); border:1px solid var(--green); border-radius:var(--radius); padding:20px;">
      <h3 style="text-align:center; color:var(--green); margin-bottom:4px; font-size:1rem;">🤝 Refer Friends, Cheat Death</h3>
      <p style="text-align:center; color:var(--text2); font-size:0.8rem; margin-bottom:12px;">
        ${unlocked ? 'You\'ve unlocked a bonus habit! Keep referring for good karma (and longer life).' : `Invite ${remaining} more friend${remaining!==1?'s':''} to unlock a premium habit for free.`}
      </p>
      
      <div style="display:flex; justify-content:center; gap:4px; margin-bottom:12px;">
        ${[0,1,2].map(i => `<div style="width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1rem; ${i < count ? 'background:var(--green); color:#000;' : 'background:var(--surface); border:2px solid var(--border); color:var(--text3);'}">${i < count ? '✓' : '👤'}</div>`).join('')}
      </div>
      
      <div style="display:flex; gap:8px; max-width:360px; margin:0 auto;">
        <input type="text" value="https://death-clock.app?ref=${code}" readonly style="flex:1; padding:8px; border-radius:6px; border:1px solid var(--border); background:var(--bg); color:var(--text); font-size:0.75rem;">
        <button class="btn-green btn-sm" onclick="navigator.clipboard.writeText('https://death-clock.app?ref=${code}'); showToast('Referral link copied!');">Copy</button>
      </div>
    </div>`;
}

// ============================================
// INIT
// ============================================
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
function creditReferrer() {
  const referredBy = localStorage.getItem('dc_referred_by');
  if (!referredBy || localStorage.getItem('dc_referral_credited')) return;
  // Log referral to Supabase if available
  if (supaClient) {
    supaClient.from('dc_profiles').select('id, referral_count').eq('invite_code', referredBy).single()
      .then(({ data }) => {
        if (data) {
          const newCount = (data.referral_count || 0) + 1;
          supaClient.from('dc_profiles').update({ referral_count: newCount }).eq('id', data.id).then(() => {
            console.log('Referral credited to:', referredBy, 'count:', newCount);
          });
        }
      }).catch(() => {});
  }
  // Also track locally for the referrer when they next load
  localStorage.setItem('dc_referral_credited', 'true');
  // Store in a shared referral log (localStorage based for demo)
  try {
    const log = JSON.parse(localStorage.getItem('dc_referral_log') || '[]');
    log.push({ code: referredBy, at: new Date().toISOString() });
    localStorage.setItem('dc_referral_log', JSON.stringify(log));
  } catch(e) {}
}

// Check referral code from URL
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');
  if (refCode && !localStorage.getItem('dc_referred_by')) {
    localStorage.setItem('dc_referred_by', refCode);
    // The referrer gets credit when this user completes the calculator
  }
  checkCookieConsent();
loadGoalState();
loadUserTier();

// PWA: Register service worker + install prompt
let deferredInstallPrompt = null;
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  // Show install banner after result
  setTimeout(() => {
    if (state.result && deferredInstallPrompt) {
      const banner = document.createElement('div');
      banner.id = 'installBanner';
      banner.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--surface);border:1px solid var(--gold);border-radius:12px;padding:12px 20px;z-index:9999;display:flex;align-items:center;gap:12px;box-shadow:0 4px 20px rgba(0,0,0,0.5);';
      banner.innerHTML = '<div><strong style="color:var(--gold)">Install Death Clock</strong><br><span style="font-size:0.8rem;color:var(--text2)">Track your death date from your home screen</span></div>' +
        '<button onclick="installPWA()" style="background:var(--gold);color:#000;border:none;padding:8px 16px;border-radius:8px;font-weight:600;cursor:pointer;white-space:nowrap;">Install</button>' +
        '<button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:1.2rem;">&times;</button>';
      document.body.appendChild(banner);
    }
  }, 3000);
});
function installPWA() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.then(() => {
    deferredInstallPrompt = null;
    document.getElementById('installBanner')?.remove();
  });
}

// ============================================
// AUTH FUNCTIONS
// ============================================
async function authSignIn() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  if (!email || !password) { showAuthError('Enter email and password'); return; }
  try {
    const { data, error } = await supaClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    state.supaUser = data.user;
    state.socialUser = data.user;
    loadSocialProfile();
    showToast('Welcome back from the dead!');
    renderProfilePage();
    DataStore.load();
    // Show mansion nav if logged in
    document.getElementById('navMansion')?.classList.remove('hidden');
  } catch(e) { showAuthError(e.message); }
}

async function authSignUp() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  if (!email || password.length < 6) { showAuthError('Need email + 6 char password minimum'); return; }
  try {
    const { data, error } = await supaClient.auth.signUp({ email, password });
    if (error) throw error;
    state.supaUser = data.user;
    state.socialUser = data.user;
    showToast('Account created! Check email to confirm.');
    if (state.result) DataStore.save();
    renderProfilePage();
  } catch(e) { showAuthError(e.message); }
}

async function authMagicLink() {
  const email = document.getElementById('authEmail').value.trim();
  if (!email) { showAuthError('Enter your email first'); return; }
  try {
    const { error } = await supaClient.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/' }
    });
    if (error) throw error;
    showToast('Magic link sent! Check your inbox.');
  } catch(e) { showAuthError(e.message); }
}

async function authGoogle() {
  if (!supaClient) { showAuthError('Auth not available'); return; }
  try {
    const { error } = await supaClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/' }
    });
    if (error) throw error;
  } catch(e) { showAuthError(e.message); }
}

async function authSignOut() {
  await supaClient.auth.signOut();
  state.supaUser = null;
  const profileBtn = document.getElementById('profileBtn');
  if (profileBtn) profileBtn.textContent = 'Sign In';
  renderProfilePage();
  showToast('Signed out. Your ghost is lonely now.');
}

function showAuthError(msg) {
  const el = document.getElementById('authError');
  if (el) { el.textContent = msg; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 5000); }
}

