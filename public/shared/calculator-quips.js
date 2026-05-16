/* Death Clock calculator quips v001
 * Catalogue source: ~/Desktop/Claude builds and updates/death-clock/09_frontend-implementer/quip_catalogue_v001.md
 * Tone rules: dark humour, irreverent, never cruel. Audit by agent 21 pre-launch.
 * Wiring: window.dcQuip.maybeFire(metricKey, value) is the public API.
 */
(function () {
  'use strict';

  const ENABLED_KEY    = 'dc_quips_enabled';            // 'false' to disable
  const SHOWN_FLAG_KEY = 'dc_quip_shown_this_session';
  const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ====== CATALOGUE ======
  // Each entry: metric_key -> ordered triggers. First match wins.
  // match types: { value: <string> } | { eq: <num> } | { gte: <num> } | { lt: <num> } | { gte: <num>, lt: <num> } | { gt: <num> }
  const CATALOGUE = Object.freeze({
    sex: [
      { match: { value: 'male' },   quip: "Statistically, you drew the shorter straw. But hey, at least you do not have to give birth." },
      { match: { value: 'female' }, quip: "Biology gave you a head start. Do not waste it." }
    ],
    bmi: [
      { match: { lt: 18.5 },        quip: "Featherweight. Eat a sandwich, ideally one with avocado." },
      { match: { gte: 35 },         quip: "Your body is asking for backup." },
      { match: { gte: 30 },         quip: "Your heart is doing more reps than you are." },
      { match: { gte: 25 },         quip: "A little over the line. Could go either way." },
      { match: { gte: 18.5 },       quip: "Right in the textbook zone. Boring. Good." }
    ],
    exercise: [
      { match: { value: 'none' },   quip: "A couch potato in the wild. Stationary prey." },
      { match: { value: '5+' },     quip: "You are basically running from Death. Smart move." },
      { match: { value: '3-4x' },   quip: "Decent effort. Death has to jog to keep up." },
      { match: { value: '1-2x' },   quip: "Weekend warrior vibes. Death does not take weekends off." }
    ],
    sport: [
      { match: { value: 'none' },   quip: "No sport. Your ghost is already stretching in the warm-up area." },
      { match: { value: 'tennis' }, quip: "Tennis players live almost a decade longer. A lot of extra Grand Slams to watch." },
      { match: { value: 'badminton' }, quip: "Smashing it. Racquet sports are basically anti-death weapons." },
      { match: { value: 'running' }, quip: "Run, Forest, run. Every kilometre is a middle finger to the Reaper." }
    ],
    steps_per_day: [
      { match: { gte: 12000 },      quip: "Cardio influencer territory." },
      { match: { gte: 8000 },       quip: "The sweet spot. You are bothering the Reaper." },
      { match: { gte: 4000 },       quip: "Better than nothing. Aim higher." },
      { match: { lt: 4000 },        quip: "The chair is doing its job." }
    ],
    sitting_hours: [
      { match: { gte: 14 },         quip: "The chair is doing its job." },
      { match: { gte: 10 },         quip: "Stand up. Right now. I will wait." }
    ],
    diet: [
      { match: { value: 'very_healthy' }, quip: "Kale smoothies and quinoa bowls. Your ghost will be absolutely disgusted by how long you live." },
      { match: { value: 'healthy' }, quip: "Not bad. You eat your vegetables but also know what joy tastes like." },
      { match: { value: 'average' }, quip: "The 'I will start Monday' diet. Every Monday. Since 2019." },
      { match: { value: 'poor' },    quip: "Your body is a dumpster fire with legs. Delicious, but deadly." }
    ],
    veg_diet: [
      { match: { value: 'vegan' },     quip: "Plants only. Your ghost will be waiting a very, very long time." },
      { match: { value: 'vegetarian' },quip: "No meat, more heartbeat. The cows appreciate it too." },
      { match: { value: 'omnivore' },  quip: "You eat everything. Including your lifespan, apparently." }
    ],
    veg_servings: [
      { match: { eq: 0 },           quip: "Bold." },
      { match: { gte: 8 },          quip: "Cleared the produce aisle." }
    ],
    processed_food: [
      { match: { value: 'very_high' }, quip: "Preserved already. Ironic, since that will not preserve you." },
      { match: { value: 'high' },      quip: "If it has a barcode, you will eat it. Your arteries would like a word." },
      { match: { value: 'minimal' },   quip: "Your kitchen actually gets used for cooking. Revolutionary." }
    ],
    smoking: [
      { match: { value: 'current_heavy' }, quip: "That is a confident choice." },
      { match: { value: 'current_light' }, quip: "A few a day. Death appreciates the consistent schedule." },
      { match: { value: 'former' },        quip: "You quit. Your body is literally healing as we speak. Well done." },
      { match: { value: 'never' },         quip: "Annoying for the rest of us." }
    ],
    alcohol: [
      { match: { value: 'heavy' },        quip: "Cheers to that. Said no doctor ever." },
      { match: { value: 'moderate' },     quip: "Nightly wine 'for the antioxidants'. Sure. The Lancet has opinions." },
      { match: { value: 'occasional' },   quip: "Social drinker. Death raises a glass to your moderation." },
      { match: { value: 'never' },        quip: "Stone cold sober. Your liver wrote you a thank-you card." }
    ],
    drinks_per_week: [
      { match: { gte: 30 },         quip: "Are we sure that is per week, friend?" },
      { match: { eq: 0 },           quip: "Liver mildly suspicious." }
    ],
    sleep_hours: [
      { match: { lt: 5 },           quip: "Running on fumes. Your body is writing its resignation letter." },
      { match: { lt: 7 },           quip: "Almost there. Those missing hours are not sleeping in, they are checking out." },
      { match: { gte: 10 },         quip: "Either you are a teenager or your body is trying to tell you something." },
      { match: { gte: 9 },          quip: "Showing off." },
      { match: { gte: 7 },          quip: "The Goldilocks zone. Your body and brain are holding hands." }
    ],
    sleep_quality: [
      { match: { value: 'excellent' }, quip: "You sleep like the dead. Temporarily." },
      { match: { value: 'poor' },      quip: "Tossing and turning like a rotisserie chicken." }
    ],
    resting_hr: [
      { match: { gte: 90 },         quip: "Your heart is jogging. While you sit." },
      { match: { gte: 70 },         quip: "Doing its job with minimum drama." },
      { match: { gte: 50 },         quip: "Boring in the best way." },
      { match: { lt: 50 },          quip: "Athlete heart rate. Death has to sprint to keep up." }
    ],
    systolic_bp: [
      { match: { gte: 140 },        quip: "Your cardiovascular system filed a formal complaint." },
      { match: { gte: 120 },        quip: "A bit too enthusiastic." },
      { match: { lt: 120 },         quip: "Arteries doing yoga." }
    ],
    hba1c: [
      { match: { gte: 6.5 },        quip: "Diabetes is calling. Pick up." },
      { match: { gte: 5.7 },        quip: "Pre-diabetic warning shot." },
      { match: { lt: 5.7 },         quip: "Glucose well-mannered." }
    ],
    stress: [
      { match: { value: 'very_high' }, quip: "Watching a horror movie while doing taxes during a breakup. Please breathe." },
      { match: { value: 'high' },      quip: "Your body is running fight-or-flight like it is a marathon." },
      { match: { value: 'moderate' },  quip: "Normal amounts of existential dread. Very relatable." },
      { match: { value: 'low' },       quip: "Zen master energy. Your cortisol levels are on vacation." }
    ],
    stress_mgmt: [
      { match: { value: 'yes' },    quip: "Meditating your way to extra years. Your ghost approves of the namaste." }
    ],
    meditation_min: [
      { match: { gte: 20 },         quip: "The Reaper had to schedule a meeting." }
    ],
    social: [
      { match: { value: 'isolated' },quip: "It is just you and Death at this party. Not a great ratio." },
      { match: { value: 'few' },     quip: "Your contact list is intimate. Loneliness counts." },
      { match: { value: 'moderate' },quip: "Decent circle. A few more dinner parties could literally add years." },
      { match: { value: 'strong' },  quip: "Popular and alive. Harvard says you are doing the number-one thing right." }
    ],
    relationship: [
      { match: { value: 'married' }, quip: "Locked in. Someone to notice if you stop breathing at night." },
      { match: { value: 'single' },  quip: "Solo but not sorry. Make sure you have a strong friend group." }
    ],
    healthcare: [
      { match: { value: 'never' },   quip: "A check-UP, not a check-DOWN. Make the appointment." },
      { match: { value: 'rarely' },  quip: "Playing health roulette. Bold strategy." },
      { match: { value: 'regular' }, quip: "You actually read the owner's manual for your body." }
    ],
    occupation: [
      { match: { value: 'sedentary' }, quip: "Your chair is slowly killing you. Stand up. Right now. I will wait." },
      { match: { value: 'active' },    quip: "Your work is your workout. Efficient." }
    ],
    air_quality: [
      { match: { value: 'good' },    quip: "Your lungs are breathing easy. Literally." },
      { match: { value: 'poor' },    quip: "Your lungs are filing a workplace hazard report." }
    ],
    screen_time: [
      { match: { value: 'very_high' }, quip: "Six hours plus. Get a standing desk. Your eye sockets will recover." }
    ]
  });

  // ====== MATCH LOGIC ======
  function matches(rule, value) {
    if (rule.value !== undefined) return String(value) === String(rule.value);
    const n = typeof value === 'number' ? value : parseFloat(value);
    if (Number.isNaN(n)) return false;
    if (rule.eq  !== undefined && n !== rule.eq)  return false;
    if (rule.gt  !== undefined && !(n > rule.gt))  return false;
    if (rule.gte !== undefined && !(n >= rule.gte)) return false;
    if (rule.lt  !== undefined && !(n < rule.lt))  return false;
    return rule.eq !== undefined || rule.gt !== undefined || rule.gte !== undefined || rule.lt !== undefined;
  }

  function findQuip(metricKey, value) {
    const list = CATALOGUE[metricKey];
    if (!list) return null;
    for (const t of list) if (matches(t.match, value)) return t.quip;
    return null;
  }

  // ====== TOAST UI ======
  let lastToast = null;
  function ensureToastRegion() {
    let region = document.getElementById('dc-quip-toast');
    if (region) return region;
    region = document.createElement('div');
    region.id = 'dc-quip-toast';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    Object.assign(region.style, {
      position: 'fixed', left: '50%', bottom: '24px', transform: 'translateX(-50%)',
      maxWidth: '90%', width: 'auto', padding: '12px 16px',
      background: 'rgba(20,20,32,0.96)', color: '#fff',
      borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.35',
      zIndex: '9999', pointerEvents: 'auto',
      opacity: '0', transition: REDUCED_MOTION ? 'none' : 'opacity 200ms ease, transform 200ms ease'
    });
    region.tabIndex = -1;
    document.body.appendChild(region);
    return region;
  }

  function showToast(text) {
    const region = ensureToastRegion();
    if (lastToast) clearTimeout(lastToast);
    region.textContent = text;
    region.style.opacity = '1';
    if (!REDUCED_MOTION) region.style.transform = 'translateX(-50%) translateY(0)';
    lastToast = setTimeout(hideToast, 4000);
  }

  function hideToast() {
    const region = document.getElementById('dc-quip-toast');
    if (!region) return;
    region.style.opacity = '0';
  }

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideToast(); }, true);

  // ====== PUBLIC API ======
  function isEnabled() {
    try { return localStorage.getItem(ENABLED_KEY) !== 'false'; } catch (_) { return true; }
  }

  function alreadyShownThisSession() {
    try { return sessionStorage.getItem(SHOWN_FLAG_KEY) === 'true'; } catch (_) { return false; }
  }
  function markShownThisSession() {
    try { sessionStorage.setItem(SHOWN_FLAG_KEY, 'true'); } catch (_) {}
  }
  function resetSession() {
    try { sessionStorage.removeItem(SHOWN_FLAG_KEY); } catch (_) {}
  }

  function maybeFire(metricKey, value) {
    if (!isEnabled()) return null;
    if (alreadyShownThisSession()) return null;
    const quip = findQuip(metricKey, value);
    if (!quip) return null;
    markShownThisSession();
    showToast(quip);
    return quip;
  }

  function setEnabled(on) {
    try { localStorage.setItem(ENABLED_KEY, on ? 'true' : 'false'); } catch (_) {}
  }

  window.dcQuip = {
    maybeFire,
    findQuip,
    isEnabled,
    setEnabled,
    resetSession,
    catalogue: CATALOGUE,
    version: 'v001'
  };
})();
