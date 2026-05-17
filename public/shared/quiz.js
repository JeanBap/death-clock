const ssaTable = {
  male: {
    0:74.8, 5:74.8, 10:74.8, 15:74.8, 20:74.8, 25:74.5, 30:74.2, 35:73.8,
    40:73.2, 45:72.2, 50:70.8, 55:69.0, 60:66.8, 65:64.2, 70:61.0, 75:57.5,
    80:53.8, 85:50.0, 90:46.5, 95:43.0, 100:40.0
  },
  female: {
    0:80.2, 5:80.2, 10:80.2, 15:80.2, 20:80.2, 25:80.0, 30:79.8, 35:79.5,
    40:79.0, 45:78.2, 50:77.0, 55:75.5, 60:73.5, 65:71.2, 70:68.5, 75:65.2,
    80:61.5, 85:57.5, 90:53.5, 95:49.5, 100:46.0
  }
};

function getBaseExpectancy(age, sex) {
  const table = ssaTable[sex] || ssaTable.male;
  const ages = Object.keys(table).map(Number).sort((a,b)=>a-b);
  let closest = ages[0];
  for (const a of ages) {
    if (a <= age) closest = a;
    else break;
  }
  return table[closest];
}

const lifeFactors = {
  // Smoking
  smoking_never: { impact: 0, label: 'Non-smoker', tip: 'Great! Keep it up.', cat: 'substances' },
  smoking_former: { impact: -2, label: 'Former smoker', tip: 'Quitting was the best decision. Risk drops significantly after 10 years.', cat: 'substances' },
  smoking_current_light: { impact: -6, label: 'Light smoker', tip: 'Even light smoking removes years. Nicotine replacement therapy can help you quit.', cat: 'substances', productCat: 'smoking_cessation' },
  smoking_current_heavy: { impact: -10, label: 'Heavy smoker', tip: 'Smoking is the single biggest controllable factor. Quitting now could add back 5-8 years.', cat: 'substances', productCat: 'smoking_cessation' },

  // Exercise
  exercise_5plus: { impact: 3.5, label: 'Very active (5+ days/week)', tip: 'Excellent! You are in the top tier for exercise longevity benefit.', cat: 'fitness' },
  exercise_3to4: { impact: 2.5, label: 'Active (3-4 days/week)', tip: 'Great habit! Adding one more day could push you into the optimal zone.', cat: 'fitness' },
  exercise_1to2: { impact: 1, label: 'Somewhat active (1-2 days/week)', tip: 'Good start! Try to build up to 150+ minutes per week for maximum benefit.', cat: 'fitness', productCat: 'fitness' },
  exercise_none: { impact: -4, label: 'Sedentary', tip: 'Physical inactivity is as dangerous as smoking. Even walking 30 min/day helps enormously.', cat: 'fitness', productCat: 'fitness' },

  // BMI
  bmi_healthy: { impact: 0, label: 'Healthy weight (BMI 18.5-24.9)', tip: 'Your weight is in the optimal range for longevity.', cat: 'body' },
  bmi_overweight: { impact: -1, label: 'Overweight (BMI 25-29.9)', tip: 'Slightly elevated risk. A balanced diet and regular exercise can help.', cat: 'body', productCat: 'nutrition' },
  bmi_obese: { impact: -3, label: 'Obese (BMI 30-34.9)', tip: 'Obesity significantly increases risk of chronic diseases. Small dietary changes compound over time.', cat: 'body', productCat: 'nutrition' },
  bmi_severely_obese: { impact: -7, label: 'Severely obese (BMI 35+)', tip: 'Severe obesity is a major health risk. Medical supervision and structured programs recommended.', cat: 'body', productCat: 'nutrition' },
  bmi_underweight: { impact: -2, label: 'Underweight (BMI <18.5)', tip: 'Being underweight carries health risks too. Focus on nutrient-dense foods.', cat: 'body' },

  // Diet
  diet_very_healthy: { impact: 3.5, label: 'Very healthy diet', tip: 'Mediterranean-style diets are associated with the greatest longevity gains.', cat: 'diet' },
  diet_healthy: { impact: 2, label: 'Healthy diet', tip: 'Good dietary habits. Focus on whole foods, vegetables, and lean proteins.', cat: 'diet' },
  diet_average: { impact: 0, label: 'Average diet', tip: 'Room for improvement. Reducing processed food intake can add years.', cat: 'diet', productCat: 'nutrition' },
  diet_poor: { impact: -4, label: 'Poor diet', tip: 'Poor diet is a major mortality risk factor. Meal planning and delivery services can help restructure habits.', cat: 'diet', productCat: 'nutrition' },

  // Alcohol
  alcohol_never: { impact: 0, label: 'Non-drinker', tip: 'No alcohol-related health risks.', cat: 'substances' },
  alcohol_occasional: { impact: 0, label: 'Occasional drinker', tip: 'Minimal risk at this level.', cat: 'substances' },
  alcohol_moderate: { impact: -0.5, label: 'Moderate drinker', tip: 'Keep consumption under 7 drinks per week for minimal risk.', cat: 'substances' },
  alcohol_heavy: { impact: -4, label: 'Heavy drinker', tip: 'Heavy drinking significantly reduces lifespan. Reducing intake is one of the highest-impact changes you can make.', cat: 'substances' },

  // Drugs
  drug_none: { impact: 0, label: 'No drug use', tip: 'No drug-related health risks.', cat: 'substances' },
  drug_cannabis: { impact: -1, label: 'Cannabis use', tip: 'Limited long-term data. Moderation advised.', cat: 'substances' },
  drug_recreational: { impact: -3, label: 'Recreational drug use', tip: 'Recreational drugs carry significant and unpredictable health risks.', cat: 'substances' },
  drug_opioids: { impact: -8, label: 'Opioid use', tip: 'Opioid use is one of the top 3 lifespan reducers. Treatment programs save lives.', cat: 'substances' },

  // Stress
  stress_low: { impact: 2, label: 'Low stress', tip: 'Low stress is protective. Maintain your current lifestyle balance.', cat: 'mental' },
  stress_moderate: { impact: 0, label: 'Moderate stress', tip: 'Normal levels. Building stress management habits provides insurance.', cat: 'mental' },
  stress_high: { impact: -2, label: 'High stress', tip: 'Chronic stress accelerates aging. Meditation, exercise, and therapy are proven countermeasures.', cat: 'mental', productCat: 'mental_health' },
  stress_very_high: { impact: -4, label: 'Very high stress', tip: 'Extreme stress is equivalent to several risk factors combined. Prioritize stress reduction immediately.', cat: 'mental', productCat: 'mental_health' },

  // Stress management
  stress_mgmt_yes: { impact: 1.5, label: 'Active stress management', tip: 'Meditation, therapy, or mindfulness practice adds measurable years.', cat: 'mental' },
  stress_mgmt_no: { impact: 0, label: 'No stress management', tip: 'Even 10 minutes of daily meditation can measurably reduce mortality risk.', cat: 'mental', productCat: 'mental_health' },

  // Social
  social_strong: { impact: 3, label: 'Strong social network', tip: 'Strong relationships are the #1 predictor of healthy longevity per the Harvard 80-year study.', cat: 'social' },
  social_moderate: { impact: 1.5, label: 'Moderate social connections', tip: 'Good foundation. Deepening existing relationships has compounding benefits.', cat: 'social' },
  social_few: { impact: -2, label: 'Few social connections', tip: 'Social isolation carries health risks equivalent to smoking. Community groups, clubs, and volunteering help.', cat: 'social' },
  social_isolated: { impact: -5, label: 'Socially isolated', tip: 'Severe isolation can reduce lifespan by up to 15 years. This is one of the most impactful factors to address.', cat: 'social' },

  // Relationship
  rel_married: { impact: 2.5, label: 'Married', tip: 'Marriage is associated with longer lifespan, likely due to social support and shared health behaviors.', cat: 'social' },
  rel_partnered: { impact: 2, label: 'Partnered', tip: 'Having a committed partner provides social and emotional health benefits.', cat: 'social' },
  rel_single: { impact: 0, label: 'Single', tip: 'Strong friendships and community can provide similar benefits to partnership.', cat: 'social' },
  rel_divorced: { impact: -1, label: 'Divorced/Widowed', tip: 'Life transitions are stressful. Building new social connections is key.', cat: 'social' },

  // Sleep
  sleep_optimal: { impact: 0, label: '7-8 hours sleep', tip: 'Optimal sleep duration for longevity.', cat: 'sleep' },
  sleep_short: { impact: -3, label: 'Less than 6 hours', tip: 'Chronic sleep deprivation is a serious health risk. Prioritize sleep hygiene.', cat: 'sleep', productCat: 'sleep' },
  sleep_moderate_short: { impact: -1, label: '6-7 hours sleep', tip: 'Slightly below optimal. Try adding 30 minutes.', cat: 'sleep' },
  sleep_long: { impact: -1.5, label: '9+ hours sleep', tip: 'Oversleeping may indicate underlying health issues. Check with a doctor.', cat: 'sleep' },
  sleep_quality_poor: { impact: -2, label: 'Poor sleep quality', tip: 'Quality matters as much as quantity. Blue light reduction, consistent schedule, and cool bedroom help.', cat: 'sleep', productCat: 'sleep' },
  sleep_quality_fair: { impact: -0.5, label: 'Fair sleep quality', tip: 'Room for improvement in sleep habits.', cat: 'sleep' },
  sleep_quality_good: { impact: 0, label: 'Good sleep quality', tip: 'Solid sleep foundation.', cat: 'sleep' },
  sleep_quality_excellent: { impact: 1, label: 'Excellent sleep quality', tip: 'Outstanding! Quality sleep is one of the most underrated longevity tools.', cat: 'sleep' },

  // Medical conditions
  cond_diabetes: { impact: -8, label: 'Diabetes', tip: 'Well-managed diabetes reduces the impact significantly. Regular monitoring and medication adherence are critical.', cat: 'medical' },
  cond_heart_disease: { impact: -9, label: 'Heart disease', tip: 'Cardiac rehabilitation, medication, and lifestyle changes can dramatically improve outcomes.', cat: 'medical' },
  cond_hypertension: { impact: -5, label: 'Hypertension', tip: 'Controlled hypertension reduces impact to -1 to -2 years. Medication adherence saves lives.', cat: 'medical' },
  cond_cancer: { impact: -4, label: 'Cancer (in remission)', tip: 'Regular screening and follow-up care are essential.', cat: 'medical' },
  cond_stroke: { impact: -10, label: 'Stroke history', tip: 'Post-stroke rehabilitation and secondary prevention are crucial.', cat: 'medical' },
  cond_copd: { impact: -6, label: 'COPD', tip: 'Pulmonary rehabilitation and smoking cessation (if applicable) improve outcomes.', cat: 'medical' },
  cond_kidney: { impact: -5, label: 'Chronic kidney disease', tip: 'Early-stage CKD management can slow progression significantly.', cat: 'medical' },
  cond_autoimmune: { impact: -3, label: 'Autoimmune condition', tip: 'Modern treatments have significantly improved outcomes for autoimmune conditions.', cat: 'medical' },

  // Healthcare access
  healthcare_regular: { impact: 1, label: 'Regular checkups', tip: 'Preventive care catches issues early.', cat: 'medical' },
  healthcare_occasional: { impact: 0, label: 'Occasional healthcare', tip: 'Try to schedule annual checkups at minimum.', cat: 'medical' },
  healthcare_rarely: { impact: -1, label: 'Rarely sees a doctor', tip: 'Undiagnosed conditions are silent killers. Annual screenings are critical after 40.', cat: 'medical', productCat: 'health_testing' },
  healthcare_never: { impact: -3, label: 'Never sees a doctor', tip: 'This is a significant risk factor. Many conditions are treatable when caught early.', cat: 'medical', productCat: 'health_testing' },

  // Environment
  air_good: { impact: 0, label: 'Good air quality', tip: 'Clean air environment supports lung and cardiovascular health.', cat: 'environment' },
  air_moderate: { impact: -1, label: 'Moderate air quality', tip: 'Consider indoor air purifiers for your home.', cat: 'environment' },
  air_poor: { impact: -3, label: 'Poor air quality', tip: 'Air pollution accounts for 2-4 years of healthy life lost. Indoor purifiers and masks during high-pollution days help.', cat: 'environment' },

  // Occupation
  occ_sedentary: { impact: -1, label: 'Sedentary office work', tip: 'Sitting disease is real. Take breaks every 30 minutes. Consider a standing desk.', cat: 'environment', productCat: 'fitness' },
  occ_moderate: { impact: 0, label: 'Moderate activity job', tip: 'Good balance of movement throughout the day.', cat: 'environment' },
  occ_physical: { impact: 0.5, label: 'Physically active job', tip: 'Built-in exercise is beneficial, but watch for repetitive strain injuries.', cat: 'environment' },
  occ_hazardous: { impact: -4, label: 'Hazardous occupation', tip: 'Safety equipment and protocols are essential. Consider career planning for less risky work long-term.', cat: 'environment' },

  // Family history
  family_longevity: { impact: 4, label: 'Family history of longevity (80+)', tip: 'Genetics play a role. Your baseline is favorable.', cat: 'genetics' },
  family_average: { impact: 0, label: 'Average family lifespan', tip: 'Lifestyle factors matter more than genetics for most people.', cat: 'genetics' },
  family_early_death: { impact: -3, label: 'Family history of early death (<65)', tip: 'Family history is a risk signal. Proactive screening and lifestyle optimization are extra important for you.', cat: 'genetics', productCat: 'health_testing' },

  // Vegetarian/Vegan diet (meta-analysis: 977,763 participants)
  veg_vegan: { impact: 2.5, label: 'Vegan diet', tip: 'Vegan diets linked to 15% lower all-cause mortality (meta-analysis, n=977,763).', cat: 'diet' },
  veg_vegetarian: { impact: 2, label: 'Vegetarian diet', tip: 'Vegetarian diets linked to 12% lower mortality (Adventist Health Study-2, n=96,000).', cat: 'diet' },
  veg_pescatarian: { impact: 2, label: 'Pescatarian diet', tip: 'Fish-based diets combine plant benefits with omega-3 fatty acids.', cat: 'diet' },
  veg_flexitarian: { impact: 1, label: 'Flexitarian (mostly plant-based)', tip: 'Reducing meat intake even partially provides longevity benefits.', cat: 'diet' },
  veg_omnivore: { impact: 0, label: 'Omnivore (regular meat)', tip: 'Standard mixed diet. Consider reducing red and processed meat.', cat: 'diet' },

  // Processed food (UPF meta-analysis: 18 studies, 1,148,387 participants)
  upf_minimal: { impact: 2, label: 'Minimal processed food (<10%)', tip: 'Excellent! Whole foods diet strongly protective. NOVA study.', cat: 'diet' },
  upf_low: { impact: 1, label: 'Low processed food (10-25%)', tip: 'Good dietary habits. Most of your food is real food.', cat: 'diet' },
  upf_moderate: { impact: 0, label: 'Moderate processed food (25-50%)', tip: 'Average. Each 10% reduction in UPF lowers mortality 14%.', cat: 'diet', productCat: 'nutrition' },
  upf_high: { impact: -2, label: 'High processed food (50-75%)', tip: '62% higher all-cause mortality (BMJ meta-analysis). Meal prep helps.', cat: 'diet', productCat: 'nutrition' },
  upf_very_high: { impact: -4, label: 'Very high processed food (>75%)', tip: 'Ultra-processed food dominant diet. Each 10% less = 14% lower mortality.', cat: 'diet', productCat: 'nutrition' },

  // Sports (Copenhagen City Heart Study: n=8,577, 25-year follow-up)
  sport_tennis: { impact: 3.0, label: 'Tennis player', tip: 'Tennis adds the most years of any sport (Copenhagen study, n=8,577).', cat: 'fitness' },
  sport_badminton: { impact: 2.5, label: 'Badminton player', tip: 'Racquet sports excel due to social + aerobic + agility combination.', cat: 'fitness' },
  sport_soccer: { impact: 2.0, label: 'Soccer/football player', tip: 'Team sports provide social bonding plus cardiovascular training.', cat: 'fitness' },
  sport_cycling: { impact: 1.5, label: 'Cyclist', tip: 'Regular cycling reduces mortality risk by 40% (BMJ).', cat: 'fitness' },
  sport_swimming: { impact: 1.5, label: 'Swimmer', tip: 'Full-body low-impact exercise. 28% lower all-cause mortality.', cat: 'fitness' },
  sport_running: { impact: 1.0, label: 'Runner/jogger', tip: 'Even slow jogging 1-2.4 hours/week reduces mortality 44%.', cat: 'fitness' },
  sport_gym: { impact: 0.5, label: 'Gym/weights only', tip: 'Resistance training is great but adding social sport amplifies benefits.', cat: 'fitness' },
  sport_none: { impact: 0, label: 'No specific sport', tip: 'Picking up a social sport is one of the highest-ROI longevity moves.', cat: 'fitness' },

  // Biometrics - Blood Pressure (Lancet, n=1.25M)
  bp_normal: { impact: 0, label: 'Normal blood pressure (<120/80)', tip: 'Optimal range. Maintain through diet and exercise.', cat: 'biometrics' },
  bp_elevated: { impact: -1, label: 'Elevated (120-129/<80)', tip: 'Pre-hypertension. Lifestyle changes can prevent progression.', cat: 'biometrics' },
  bp_high_1: { impact: -3, label: 'High Stage 1 (130-139/80-89)', tip: 'Hypertension Stage 1. Medication + lifestyle changes recommended.', cat: 'biometrics' },
  bp_high_2: { impact: -5, label: 'High Stage 2 (140+/90+)', tip: 'Hypertension Stage 2. Significant mortality risk. Medical treatment essential.', cat: 'biometrics' },
  bp_unknown: { impact: 0, label: 'Unknown', tip: 'Get your blood pressure checked - it is called the silent killer for a reason.', cat: 'biometrics' },

  // Resting Heart Rate (Copenhagen City Heart Study)
  rhr_low: { impact: 2, label: 'Low RHR (<60 bpm)', tip: 'Athletic heart rate. Strong cardiovascular fitness indicator.', cat: 'biometrics' },
  rhr_normal: { impact: 0, label: 'Normal RHR (60-80 bpm)', tip: 'Healthy resting heart rate range.', cat: 'biometrics' },
  rhr_elevated: { impact: -2, label: 'Elevated RHR (80-100 bpm)', tip: 'Each 10 bpm increase above 80 = 16% higher mortality (Copenhagen study).', cat: 'biometrics' },
  rhr_high: { impact: -4, label: 'High RHR (100+ bpm)', tip: 'Significantly elevated mortality risk. Cardio exercise and medical review recommended.', cat: 'biometrics' },
  rhr_unknown: { impact: 0, label: 'Unknown', tip: 'Check your pulse first thing in the morning for 60 seconds.', cat: 'biometrics' },

  // Coffee (NHANES cohort, n=468,629)
  coffee_moderate: { impact: 2, label: 'Moderate coffee (2-3 cups/day)', tip: '14-27% lower mortality risk (NEJM, n=468,629). Optimal amount.', cat: 'diet' },
  coffee_light: { impact: 1, label: 'Light coffee (1 cup/day)', tip: 'Some protective benefit from antioxidants and polyphenols.', cat: 'diet' },
  coffee_heavy: { impact: 0.5, label: 'Heavy coffee (4+ cups/day)', tip: 'Still beneficial but diminishing returns above 3 cups.', cat: 'diet' },
  coffee_none: { impact: 0, label: 'No coffee', tip: 'No risk, but you miss out on coffees protective antioxidant effects.', cat: 'diet' },

  // Hydration (NIH ARIC study, n=15,752, 25-year follow-up)
  hydration_good: { impact: 2, label: 'Well hydrated (8+ glasses/day)', tip: 'Good hydration linked to slower biological aging (NIH, n=15,752).', cat: 'body' },
  hydration_moderate: { impact: 0, label: 'Moderate hydration (4-7 glasses)', tip: 'Adequate but room for improvement.', cat: 'body' },
  hydration_poor: { impact: -2, label: 'Poor hydration (<4 glasses/day)', tip: 'Chronic dehydration = 50% higher biological aging rate (NIH). Serum sodium above 144 = accelerated aging.', cat: 'body' },

  // Dental Health (Leisure World Cohort, n=5,611)
  dental_excellent: { impact: 1.5, label: 'Daily flossing + regular dentist', tip: 'Excellent oral health reduces cardiovascular and all-cause mortality 25-30%.', cat: 'body' },
  dental_good: { impact: 0, label: 'Brush daily, occasional dentist', tip: 'Decent baseline. Adding daily flossing provides additional protection.', cat: 'body' },
  dental_poor: { impact: -2, label: 'Irregular brushing, rare dentist', tip: 'Never flossing = 30% higher mortality (Leisure World study, n=5,611). Chronic inflammation link.', cat: 'body' },

  // Sauna Use (Finnish study, JAMA, n=2,315, 20-year follow-up)
  sauna_frequent: { impact: 2, label: 'Frequent sauna (4-7x/week)', tip: '40% lower all-cause mortality (JAMA, Finnish study, n=2,315, 20 years).', cat: 'fitness' },
  sauna_moderate: { impact: 1, label: 'Moderate sauna (2-3x/week)', tip: 'Significant heat shock protein activation. 24% lower mortality.', cat: 'fitness' },
  sauna_rare: { impact: 0.5, label: 'Occasional sauna (1x/week)', tip: 'Some benefit from heat therapy. Try to increase frequency.', cat: 'fitness' },
  sauna_never: { impact: 0, label: 'Never use sauna', tip: 'Sauna use is one of the highest-ROI longevity interventions available.', cat: 'fitness' },

  // Green Space / Nature (Lancet Planetary Health, n=4.6M)
  nature_high: { impact: 2.5, label: 'High nature exposure', tip: 'Living near green space adds ~2.5 years. 35% lower respiratory mortality (Harvard).', cat: 'environment' },
  nature_moderate: { impact: 1, label: 'Moderate nature access', tip: 'Regular parks and green areas nearby. Try to spend 120+ min/week in nature.', cat: 'environment' },
  nature_low: { impact: -1, label: 'Low nature exposure', tip: 'Urban concrete environment. Indoor plants and weekend nature trips help compensate.', cat: 'environment' },

  // Screen Time / TV (British Journal of Sports Medicine)
  screen_low: { impact: 1, label: 'Low screen time (<2 hrs/day)', tip: 'Minimal sedentary screen time. Good for metabolic health.', cat: 'environment' },
  screen_moderate: { impact: 0, label: 'Moderate screen time (2-4 hrs)', tip: 'Average. Each hour of TV after 25 reduces life by 22 minutes.', cat: 'environment' },
  screen_high: { impact: -1.5, label: 'High screen time (4-6 hrs/day)', tip: 'Prolonged sitting + screen = 37% higher premature death risk (women).', cat: 'environment' },
  screen_very_high: { impact: -3, label: 'Very high screen time (6+ hrs)', tip: '6+ hours/day TV = 4.8 years less life expectancy. Get a standing desk.', cat: 'environment', productCat: 'fitness' },

  // Education Level (Lancet Public Health meta-analysis)
  edu_postgrad: { impact: 2.5, label: 'Postgraduate degree', tip: 'Each year of education reduces mortality 2-3% (Lancet meta-analysis).', cat: 'social' },
  edu_bachelors: { impact: 2, label: 'Bachelors degree', tip: '8-year life expectancy gap between degree holders and non-graduates.', cat: 'social' },
  edu_some_college: { impact: 1.5, label: 'Some college / trade school', tip: 'Education provides health literacy and socioeconomic benefits.', cat: 'social' },
  edu_high_school: { impact: 0, label: 'High school', tip: 'Baseline. Continued learning and skill development still protective.', cat: 'social' },
  edu_less: { impact: -2, label: 'Less than high school', tip: 'Education gap accounts for up to 11 years life expectancy difference.', cat: 'social' },

  // Income (Chetty et al., JAMA, n=1.4 billion tax records)
  income_high: { impact: 3, label: 'High income (top 25%)', tip: 'Income enables healthcare access, nutrition, and stress reduction.', cat: 'social' },
  income_middle: { impact: 0, label: 'Middle income', tip: 'Baseline. Focus on maximizing free longevity interventions.', cat: 'social' },
  income_low: { impact: -3, label: 'Low income (bottom 25%)', tip: '14.6-year gap between top 1% and bottom 1% income (Chetty, JAMA). Community resources help.', cat: 'social' },

  // Gratitude / Optimism (Nurses Health Study, JAMA Psychiatry, n=49,275)
  gratitude_high: { impact: 2, label: 'Regularly practice gratitude', tip: '9% lower all-cause mortality, 15% lower CVD death (JAMA Psychiatry, n=49,275).', cat: 'mental' },
  gratitude_moderate: { impact: 1, label: 'Sometimes grateful/optimistic', tip: 'Optimists live 11-15% longer than pessimists (Harvard).', cat: 'mental' },
  gratitude_low: { impact: 0, label: 'Rarely practice gratitude', tip: 'Gratitude journaling 3x/week measurably reduces inflammation and improves sleep.', cat: 'mental' },

  // Volunteering (Health Psychology, multiple cohorts)
  volunteer_regular: { impact: 2, label: 'Regular volunteering (100+ hrs/yr)', tip: '40% lower mortality in regular volunteers (meta-analysis of multiple cohorts).', cat: 'social' },
  volunteer_occasional: { impact: 1, label: 'Occasional volunteering', tip: 'Some purpose-driven activity provides mortality protection.', cat: 'social' },
  volunteer_none: { impact: 0, label: 'No volunteering', tip: 'Volunteering provides purpose + social connection, a longevity double benefit.', cat: 'social' },

  // Religious/Spiritual Practice (Hummer et al., n=22,080)
  religion_weekly: { impact: 2, label: 'Weekly religious attendance', tip: '+4 years life expectancy for weekly attenders (Hummer, n=22,080). Community + purpose benefit.', cat: 'social' },
  religion_occasional: { impact: 1, label: 'Occasional spiritual practice', tip: 'Some community and purpose benefits from periodic involvement.', cat: 'social' },
  religion_none: { impact: 0, label: 'No religious practice', tip: 'Secular community groups can provide similar social bonding benefits.', cat: 'social' },

  // Omega-3 / Fish Oil (Framingham Offspring Cohort)
  omega3_high: { impact: 2, label: 'High omega-3 intake (fish/supplements)', tip: '+5 years for highest omega-3 blood levels (Framingham study). 34% lower all-cause mortality.', cat: 'diet' },
  omega3_moderate: { impact: 1, label: 'Moderate omega-3 (fish 1-2x/week)', tip: 'Regular fish consumption provides meaningful cardiovascular protection.', cat: 'diet' },
  omega3_low: { impact: -1, label: 'Low omega-3 (rarely eat fish)', tip: 'Low omega-3 = same mortality impact as smoking (Framingham). Consider supplements.', cat: 'diet', productCat: 'supplements' },

  // Pet Ownership (AHA meta-analysis, n=3.4M)
  pet_dog: { impact: 1.5, label: 'Dog owner', tip: '24% lower all-cause mortality for dog owners (AHA, n=3.4M). Built-in exercise + companionship.', cat: 'social' },
  pet_cat: { impact: 0.5, label: 'Cat owner', tip: 'Reduced cardiovascular event risk. Stress reduction through companionship.', cat: 'social' },
  pet_other: { impact: 0.5, label: 'Other pet', tip: 'Pets provide routine, companionship, and stress reduction.', cat: 'social' },
  pet_none: { impact: 0, label: 'No pets', tip: 'Consider a dog - dog owners walk more and have stronger social connections.', cat: 'social' }
};

const products = [
  { name: 'InsideTracker', desc: 'Blood biomarker testing with personalized recommendations. Track 40+ biomarkers.', category: 'Health Testing', factorCat: 'health_testing', impact: 'Monitoring tool', price: '$189-$589/test', url: 'https://www.insidetracker.com/', rating: 4.5 },
  { name: 'Everlywell', desc: 'At-home lab tests for food sensitivity, metabolism, heart health, and more.', category: 'Health Testing', factorCat: 'health_testing', impact: 'Early detection', price: '$49-$399/test', url: 'https://www.everlywell.com/', rating: 4.3 },
  { name: 'Life Extension', desc: 'Premium supplements for longevity: NAD+, CoQ10, omega-3, multivitamins.', category: 'Supplements', factorCat: 'supplements', impact: '+1-3 years potential', price: '$15-$60/month', url: 'https://www.lifeextension.com/', rating: 4.6 },
  { name: 'NMN Bio', desc: 'Pharmaceutical-grade NMN (nicotinamide mononucleotide) for cellular NAD+ restoration.', category: 'Supplements', factorCat: 'supplements', impact: 'Cellular aging support', price: '$40-$80/month', url: 'https://www.nmnbio.com/', rating: 4.4 },
  { name: 'Oura Ring', desc: 'Sleep and activity tracker. Monitors heart rate variability, temperature, and readiness.', category: 'Fitness Wearables', factorCat: 'fitness', impact: '+2-3 years (via behavior change)', price: '$299 + $5.99/mo', url: 'https://ouraring.com/', rating: 4.5 },
  { name: 'Whoop', desc: 'Performance wearable tracking strain, recovery, and sleep with coaching insights.', category: 'Fitness Wearables', factorCat: 'fitness', impact: '+2-3 years (via behavior change)', price: '$30/month', url: 'https://www.whoop.com/', rating: 4.2 },
  { name: 'Headspace', desc: 'Guided meditation and mindfulness app. Clinically proven to reduce stress and improve sleep.', category: 'Mental Health', factorCat: 'mental_health', impact: '+1-2 years (stress reduction)', price: '$12.99/month', url: 'https://www.headspace.com/', rating: 4.7 },
  { name: 'BetterHelp', desc: 'Online therapy with licensed therapists. Accessible from anywhere.', category: 'Mental Health', factorCat: 'mental_health', impact: '+2-3 years (mental health)', price: '$65-$100/week', url: 'https://www.betterhelp.com/', rating: 4.3 },
  { name: 'Factor Meals', desc: 'Chef-prepared, dietitian-designed meals delivered weekly. No cooking required.', category: 'Nutrition', factorCat: 'nutrition', impact: '+2-4 years (diet improvement)', price: '$11-$15/meal', url: 'https://www.factor75.com/', rating: 4.4 },
  { name: 'Eight Sleep Pod', desc: 'Smart mattress cover that regulates temperature for optimal sleep.', category: 'Sleep', factorCat: 'sleep', impact: '+2-3 years (sleep quality)', price: '$2,049+', url: 'https://www.eightsleep.com/', rating: 4.3 },
  { name: 'Nicorette', desc: 'Nicotine replacement gum and lozenges. FDA-approved quit smoking aid.', category: 'Smoking Cessation', factorCat: 'smoking_cessation', impact: '+5-10 years (if quit)', price: '$30-$50/box', url: 'https://www.nicorette.com/', rating: 4.1 },
  { name: 'Athletic Greens (AG1)', desc: 'Comprehensive daily nutrition supplement. 75 vitamins, minerals, and whole-food ingredients.', category: 'Supplements', factorCat: 'supplements', impact: 'Nutritional foundation', price: '$79/month', url: 'https://drinkag1.com/', rating: 4.5 }
];

const tipsDB = [
  { cat: 'fitness', title: 'Walk 30 Minutes Daily', content: 'Just 30 minutes of walking per day reduces all-cause mortality by 20%. Start with a post-dinner walk.', years: 3, difficulty: 'easy' },
  { cat: 'fitness', title: 'Add Strength Training', content: 'Muscle mass is protective as you age. 2-3 resistance sessions per week significantly reduce fall risk and metabolic disease.', years: 2, difficulty: 'medium' },
  { cat: 'diet', title: 'Eat 5+ Servings of Vegetables', content: 'Each additional daily serving of vegetables reduces mortality risk by 5%. Aim for variety and color.', years: 3, difficulty: 'easy' },
  { cat: 'diet', title: 'Adopt a Mediterranean Diet', content: 'The Mediterranean diet is the most studied diet for longevity. Focus on olive oil, fish, nuts, whole grains, and vegetables.', years: 4, difficulty: 'medium' },
  { cat: 'diet', title: 'Reduce Ultra-Processed Food', content: 'Each 10% increase in ultra-processed food consumption is linked to 14% higher mortality. Read labels and cook more.', years: 2, difficulty: 'medium' },
  { cat: 'sleep', title: 'Set a Consistent Sleep Schedule', content: 'Going to bed and waking at the same time (even weekends) improves sleep quality more than any supplement.', years: 1.5, difficulty: 'easy' },
  { cat: 'sleep', title: 'Create a Dark, Cool Bedroom', content: 'Optimal sleep temperature is 65-68F (18-20C). Use blackout curtains and remove electronics.', years: 1, difficulty: 'easy' },
  { cat: 'mental', title: 'Start a Meditation Practice', content: 'Even 10 minutes of daily meditation measurably reduces cortisol, blood pressure, and inflammation.', years: 1.5, difficulty: 'easy' },
  { cat: 'mental', title: 'Build a Gratitude Practice', content: 'Writing 3 things you are grateful for daily is linked to better mental health, better sleep, and reduced inflammation.', years: 1, difficulty: 'easy' },
  { cat: 'social', title: 'Schedule Weekly Social Time', content: 'Block time for friends and family like you would a meeting. Consistent social contact is protective against cognitive decline and depression.', years: 3, difficulty: 'easy' },
  { cat: 'social', title: 'Join a Community Group', content: 'Religious communities, clubs, volunteering, and team sports all provide the social bonds that extend lifespan.', years: 2, difficulty: 'medium' },
  { cat: 'substances', title: 'Quit Smoking Now', content: 'Within 1 year of quitting, heart disease risk drops by 50%. Within 10 years, lung cancer risk halves. It is never too late.', years: 8, difficulty: 'hard' },
  { cat: 'substances', title: 'Reduce Alcohol to Under 7 Drinks/Week', content: 'The Lancet study of 600K people found the safest consumption level is under 100g/week (about 7 standard drinks).', years: 3, difficulty: 'medium' },
  { cat: 'medical', title: 'Get Annual Health Screenings', content: 'Blood pressure, cholesterol, blood sugar, and cancer screenings catch problems when they are most treatable.', years: 2, difficulty: 'easy' },
  { cat: 'medical', title: 'Take Prescribed Medications Consistently', content: 'Medication non-adherence accounts for 125,000 deaths per year in the US alone. Set reminders and use pill organizers.', years: 2, difficulty: 'easy' },
  { cat: 'environment', title: 'Use an Air Purifier at Home', content: 'HEPA air purifiers reduce indoor particulate matter by up to 80%, reducing respiratory and cardiovascular risk.', years: 1, difficulty: 'easy' },
  { cat: 'environment', title: 'Take Movement Breaks Every 30 Minutes', content: 'Breaking up sitting time with 2-3 minutes of movement every 30 minutes reduces mortality risk by 17%.', years: 1.5, difficulty: 'easy' }
];


function getQuizComment(questionKey, answerValue) {
  const comments = {
    dob: {
      _default: "Interesting vintage. Let's see how many miles are left on the clock."
    },
    sex: {
      male: "Statistically, you drew the shorter straw. But hey, at least you don't have to give birth.",
      female: "Biology gave you a head start. Don't waste it."
    },
    country: {
      _default: "Location, location, location. It's not just for real estate - it's for staying alive."
    },
    body: {
      _default: "Your body is a temple. Or a haunted house. Let's find out which."
    },
    exercise: {
      '5+': "You're basically running from Death. Literally. Smart move.",
      '3-4x': "Decent effort. Death has to jog to keep up with you.",
      '1-2x': "Weekend warrior vibes. Better than nothing, but Death doesn't take weekends off.",
      none: "A couch potato in the wild. Death doesn't even have to chase you - you're stationary."
    },
    sport: {
      tennis: "Tennis players live almost a decade longer. That's a lot of extra Grand Slams to watch.",
      badminton: "Smashing it. Racquet sports are basically anti-death weapons.",
      soccer: "Team sports keep you alive AND give you someone to blame when you lose.",
      cycling: "Two wheels, fewer years underground. The math checks out.",
      swimming: "You float now. You'll float later too, but this kind is the good kind.",
      running: "Run Forest run! Every kilometre is a middle finger to the Reaper.",
      gym: "Gains are great, but your ghost doesn't need muscles. Add a social sport.",
      none: "No sport? Your ghost is already stretching in the warm-up area."
    },
    diet: {
      very_healthy: "Kale smoothies and quinoa bowls? Your ghost will be absolutely disgusted by how long you live.",
      healthy: "Not bad. You eat your vegetables but also know what joy tastes like.",
      average: "The 'I'll start Monday' diet. Every Monday. Since 2019.",
      poor: "Your body is basically a dumpster fire with legs. Delicious, but deadly."
    },
    veg_diet: {
      vegan: "Plants only? Your ghost will be waiting a very, very long time.",
      vegetarian: "No meat, more heartbeat. The cows appreciate it too.",
      pescatarian: "Fish brain is real - and it keeps you alive longer.",
      flexitarian: "Flexible eater, flexible death date. Not bad.",
      omnivore: "You eat everything. Including your lifespan, apparently."
    },
    processed_food: {
      minimal: "Your kitchen actually gets used for cooking? Revolutionary.",
      low: "Mostly real food. Your organs send their regards.",
      moderate: "Half fresh, half factory. Your body is confused but managing.",
      high: "If it has a barcode, you'll eat it. Your arteries would like a word.",
      very_high: "You're basically preserved already. Ironic, since that won't preserve you."
    },
    alcohol: {
      never: "Stone cold sober. Your liver wrote you a thank-you card.",
      occasional: "Social drinker. Death raises a glass to your moderation.",
      moderate: "Nightly wine 'for the antioxidants'. Sure. The Lancet has opinions about that.",
      heavy: "Cheers to that! ...said no doctor ever."
    },
    smoking: {
      never: "Your lungs are grateful. They're doing a little celebration dance right now.",
      former: "You quit! Your body is literally healing as we speak. Well done.",
      current_light: "Just a few a day? Death appreciates the consistent schedule.",
      current_heavy: "You're not living on the edge, you're living on a cigarette. Same thing really."
    },
    drugs: {
      none: "Clean as a whistle. Your neurons high-five each other.",
      cannabis: "Mellow. Your ghost will probably forget to haunt anyone.",
      recreational: "Party now, pay later. The bill is measured in years.",
      opioids: "This is the one your ghost is genuinely worried about. Please get help."
    },
    stress: {
      low: "Zen master energy. Your cortisol levels are on vacation.",
      moderate: "Normal amounts of existential dread. Very relatable.",
      high: "Your body is running fight-or-flight like it's a marathon. Spoiler: you're fighting yourself.",
      very_high: "Stress level: watching a horror movie while doing taxes during a breakup. Please, breathe."
    },
    stress_mgmt: {
      yes: "Meditating your way to extra years. Your ghost approves of the namaste.",
      no: "No stress management? Your body is a pressure cooker without a valve."
    },
    social: {
      strong: "Popular and alive. The Harvard study says you're doing the #1 thing right.",
      moderate: "Decent circle. A few more dinner parties could literally add years.",
      few: "Your contact list is... intimate. Loneliness kills as much as 15 cigarettes a day.",
      isolated: "It's just you and Death at this party. That's... not a great ratio."
    },
    relationship: {
      married: "Locked in. Someone to remind you to take your vitamins AND notice if you stop breathing at night.",
      partnered: "Love is in the air, and apparently so are extra years.",
      single: "Solo but not sorry. Just make sure you have a strong friend group.",
      divorced_widowed: "Life transitions are tough. Your resilience is a survival skill."
    },
    sleep_hours: {
      short: "Less than 6 hours? Your brain is running on fumes and your body is writing its resignation letter.",
      moderate_short: "Almost there. Those missing hours aren't sleeping in - they're checking out.",
      optimal: "7-8 hours! The Goldilocks zone. Your body and brain are holding hands.",
      long: "9+ hours... either you're a teenager or your body is trying to tell you something."
    },
    sleep_quality: {
      poor: "Tossing and turning like a rotisserie chicken. Quality matters as much as quantity.",
      fair: "Could be better. Your ghost is already sleeping well - don't let it outperform you.",
      good: "Solid sleeper. Your pillow is proud of you.",
      excellent: "You sleep like the dead. But, y'know, temporarily."
    },
    conditions: {
      _default: "Medical history logged. Knowledge is power - and apparently, years."
    },
    family: {
      _default: "Your ancestors are either cheering you on or serving as cautionary tales."
    },
    healthcare: {
      regular: "Regular checkups! You actually read the owner's manual for your body.",
      occasional: "Only when something hurts? Preventive care is cheaper than a coffin.",
      rarely: "Playing health roulette. Bold strategy.",
      never: "You haven't seen a doctor in years? There's a reason they call it a check-UP, not a check-DOWN."
    },
    blood_pressure: {
      normal: "Textbook blood pressure. Your arteries are basically doing yoga.",
      elevated: "Slightly elevated. Your blood is getting a bit too enthusiastic.",
      high_1: "Stage 1 hypertension. Your heart is working overtime and not getting paid.",
      high_2: "Stage 2. Your cardiovascular system filed a formal complaint.",
      unknown: "You don't know? That's like not knowing your phone battery level. Except it's your life battery."
    },
    resting_hr: {
      low: "Athlete heart rate. Death has to sprint to keep up.",
      normal: "Normal range. Your ticker is doing its job with minimum drama.",
      elevated: "Elevated resting heart rate. Your heart's running even when you're not.",
      high: "Over 100 at rest? Your heart thinks every moment is a cardio session.",
      unknown: "Check your pulse tomorrow morning. It's a free health metric that tells you a LOT."
    },
    coffee: {
      moderate: "2-3 cups is the sweet spot. Science says you're doing coffee perfectly.",
      light: "One cup? Conservative but beneficial. Your antioxidants are mildly pleased.",
      heavy: "Espresso IV drip energy. Still beneficial, just... intense.",
      none: "No coffee? You're missing out on a legal longevity drug."
    },
    hydration: {
      good: "Well hydrated! Your cells are swimming in gratitude. Literally.",
      moderate: "Adequate. But 'adequate' is the 'C grade' of staying alive.",
      poor: "Chronically dehydrated. Your blood is basically a smoothie at this point."
    },
    dental: {
      excellent: "Floss champion! Your heart thanks your gums. Weird but scientifically true.",
      good: "Brushing daily is baseline. Your teeth are neutral about you.",
      poor: "Gum disease is linked to heart disease. Your mouth is plotting against your heart."
    },
    sauna: {
      frequent: "Finnish sauna vibes! 40% lower mortality. You're literally sweating out death.",
      moderate: "Regular heat therapy. Your blood vessels are doing happy dances.",
      rare: "Occasional sauna. Even once a week helps.",
      never: "No sauna? You're missing the easiest life-extension hack. Just sit there. In heat."
    },
    screen_time: {
      low: "Under 2 hours? You're a digital minimalist. Your eyes and spine celebrate.",
      moderate: "Average screen time. Your retinas are... coping.",
      high: "4-6 hours of scrolling. Your spine has developed a question mark shape.",
      very_high: "6+ hours. At this point, you're more screen than human."
    },
    omega3: {
      high: "Omega-3 champion! Your brain and heart are literally oiled machines.",
      moderate: "Fish once or twice a week. Your neurons are cautiously optimistic.",
      low: "No fish, no supplements. Your inflammation levels are writing angry letters."
    },
    gratitude: {
      high: "Gratitude journaling AND meditating? Your ghost is going to be insufferably positive.",
      moderate: "Generally optimistic. Glass half full keeps you alive longer.",
      low: "Pessimist? The good news: gratitude is a learnable skill. The bad news: everything else."
    },
    nature: {
      high: "Daily nature immersion! Trees are basically giving you free therapy.",
      moderate: "Weekly park walks. Your stress hormones drop just reading this.",
      low: "Concrete jungle resident. Your body craves chlorophyll like a plant vampire."
    },
    volunteering: {
      regular: "Regular volunteer! Purpose + social connection = longevity cheat code.",
      occasional: "Sometimes. Every hour counts. Literally - 100+ hours/year drops mortality 40%.",
      none: "Not volunteering? Your ghost will have all the time in the world for community service."
    },
    religion: {
      weekly: "Weekly attendance adds years. The power of community + purpose + routine.",
      occasional: "Occasional spiritual practice. Your soul is doing the minimum viable product.",
      none: "Not religious? That's fine. Secular community groups have similar benefits."
    },
    pet: {
      dog: "Dog owner! 24% lower mortality. Your pet is literally keeping you alive.",
      cat: "Cat person. Lower cardiovascular risk. They're tolerating you AND saving you.",
      other: "Exotic pet energy. Companionship benefits apply to all species.",
      none: "No pet? Consider a dog. It's a furry, barking defibrillator."
    },
    education: {
      postgrad: "Advanced degree = advanced lifespan. Knowledge truly is power.",
      bachelors: "Bachelor's degree. Education builds health literacy. Smart move.",
      high_school: "High school grad. Every bit of education helps.",
      less: "Formal education isn't everything, but health literacy is literally life and death."
    },
    income: {
      high: "High income = better healthcare access. Money can't buy time... except it kind of can.",
      middle: "Middle income. Smart health choices can close the gap with higher earners.",
      low: "Lower income, but free preventive care and lifestyle changes are powerful equalizers."
    },
    air_quality: {
      good: "Clean air! Your lungs are breathing easy. Literally.",
      moderate: "Moderate air quality. Consider a HEPA filter for your home.",
      poor: "Poor air quality. Your lungs are filing a workplace hazard report."
    },
    occupation: {
      sedentary: "Desk job. Your chair is slowly killing you. Stand up. Right now. I'll wait.",
      moderate: "Mixed work. Some movement built in. Your body appreciates the variety.",
      active: "Physically active job. Your work IS your workout. Efficient.",
      hazardous: "Hazardous work. You're brave but please use all the safety gear."
    }
  };
  
  const questionComments = comments[questionKey];
  if (!questionComments) return '';
  
  if (answerValue && questionComments[answerValue]) {
    return questionComments[answerValue];
  }
  return questionComments._default || '';
}

const questions = [
  { section: 'Demographics', key: 'dob', type: 'date', question: 'When were you born?', label: 'Date of Birth' },
  { section: 'Demographics', key: 'sex', type: 'choice', question: 'What is your biological sex?', options: [
    { value: 'male', label: 'Male', impact: 'Males live ~5.4 years less than females on average' }, { value: 'female', label: 'Female', impact: 'Females have a baseline longevity advantage of ~5.4 years' }
  ]},
  { section: 'Demographics', key: 'country', type: 'country', question: 'What country do you live in?' },
  { section: 'Body & Fitness', key: 'body', type: 'body', question: 'What are your height and weight?' },
  { section: 'Body & Fitness', key: 'exercise', type: 'choice', question: 'How often do you exercise?', options: [
    { value: '5+', label: '5+ days/week', desc: 'Very active lifestyle', impact: '+4.5 years (VA study, n=719,147)' },
    { value: '3-4x', label: '3-4 days/week', desc: 'Regular exercise routine', impact: '+3 years' },
    { value: '1-2x', label: '1-2 days/week', desc: 'Some physical activity', impact: '+1 year' },
    { value: 'none', label: 'Rarely or never', desc: 'Sedentary lifestyle', impact: '-4 years (as dangerous as smoking)' }
  ]},
  { section: 'Body & Fitness', key: 'sport', type: 'choice', question: 'Do you regularly play any of these sports?', options: [
    { value: 'tennis', label: 'Tennis / Padel', desc: 'Racquet sport, typically social', impact: '+4.5 years (social sport bonus, Copenhagen study)' },
    { value: 'badminton', label: 'Badminton / Squash', desc: 'Indoor racquet sport', impact: '+3.0 years (social sport bonus)' },
    { value: 'soccer', label: 'Soccer / Team sport', desc: 'Organised team sport', impact: '+2.5 years (social + cardio bonus)' },
    { value: 'cycling', label: 'Cycling', desc: 'Road or mountain biking', impact: '+1.5 years (cardio bonus)' },
    { value: 'swimming', label: 'Swimming', desc: 'Pool or open water', impact: '+1.5 years (full-body exercise bonus)' },
    { value: 'running', label: 'Running / Jogging', desc: 'Regular running', impact: '+1.0 years (cardio bonus)' },
    { value: 'gym', label: 'Gym / Weights only', desc: 'Resistance training', impact: '+0.5 years (add social sport for more)' },
    { value: 'none', label: 'No specific sport', impact: '0 years (picking up a social sport = high ROI)' }
  ]},
  { section: 'Diet & Substances', key: 'diet', type: 'choice', question: 'How would you describe your diet?', options: [
    { value: 'very_healthy', label: 'Very healthy', desc: 'Mostly whole foods, vegetables, lean protein', impact: '+5 years (Mediterranean diet, Harvard study)' },
    { value: 'healthy', label: 'Healthy', desc: 'Generally balanced with some indulgences', impact: '+3 years' },
    { value: 'average', label: 'Average', desc: 'Mix of healthy and processed foods', impact: '0 years (baseline)' },
    { value: 'poor', label: 'Poor', desc: 'Mostly processed, fast food, or irregular meals', impact: '-4 years' }
  ]},
  { section: 'Diet & Substances', key: 'veg_diet', type: 'choice', question: 'What best describes your dietary pattern?', options: [
    { value: 'vegan', label: 'Vegan', desc: 'No animal products at all', impact: '+3.5 years (meta-analysis, n=977,763)' },
    { value: 'vegetarian', label: 'Vegetarian', desc: 'No meat or fish', impact: '+2.5 years (Adventist Health Study-2)' },
    { value: 'pescatarian', label: 'Pescatarian', desc: 'Fish but no meat', impact: '+2 years (omega-3 + plant benefits)' },
    { value: 'flexitarian', label: 'Flexitarian', desc: 'Mostly plant-based, occasional meat', impact: '+1 year' },
    { value: 'omnivore', label: 'Omnivore', desc: 'Regular meat consumption', impact: '0 years (baseline)' }
  ]},
  { section: 'Diet & Substances', key: 'processed_food', type: 'choice', question: 'How much of your diet is ultra-processed food?', options: [
    { value: 'minimal', label: 'Minimal (<10%)', desc: 'Almost all whole/home-cooked food', impact: '+2 years (NOVA classification)' },
    { value: 'low', label: 'Low (10-25%)', desc: 'Mostly whole foods', impact: '+1 year' },
    { value: 'moderate', label: 'Moderate (25-50%)', desc: 'Mix of fresh and packaged', impact: '0 years (baseline)' },
    { value: 'high', label: 'High (50-75%)', desc: 'Mostly packaged/ready meals', impact: '-2 years (BMJ meta-analysis, 18 studies)' },
    { value: 'very_high', label: 'Very high (>75%)', desc: 'Almost all processed/fast food', impact: '-4 years (62% higher mortality)' }
  ]},
  { section: 'Diet & Substances', key: 'alcohol', type: 'choice', question: 'How much alcohol do you drink?', options: [
    { value: 'never', label: 'Never', desc: 'I do not drink alcohol', impact: '0 years (no alcohol-related risk)' },
    { value: 'occasional', label: 'Occasionally', desc: 'A few drinks per month', impact: '0 years (minimal risk)' },
    { value: 'moderate', label: 'Moderate', desc: '7-14 drinks per week', impact: '-0.5 years (Lancet, n=599,912)' },
    { value: 'heavy', label: 'Heavy', desc: '14+ drinks per week', impact: '-4 years (Lancet, n=599,912)' }
  ]},
  { section: 'Diet & Substances', key: 'smoking', type: 'choice', question: 'Do you smoke?', options: [
    { value: 'never', label: 'Never smoked', impact: '0 years (baseline)' },
    { value: 'former', label: 'Former smoker', desc: 'Quit more than 1 year ago', impact: '-2 years (risk drops 50% within 1 year of quitting)' },
    { value: 'current_light', label: 'Light smoker', desc: 'Less than 10 cigarettes/day', impact: '-6 years' },
    { value: 'current_heavy', label: 'Heavy smoker', desc: '10+ cigarettes/day', impact: '-10 years (single biggest controllable factor)' }
  ]},
  { section: 'Diet & Substances', key: 'drugs', type: 'choice', question: 'Do you use any recreational drugs?', options: [
    { value: 'none', label: 'None', impact: '0 years (no risk)' },
    { value: 'cannabis', label: 'Cannabis only', impact: '-1 year (limited data)' },
    { value: 'recreational', label: 'Other recreational drugs', impact: '-3 years' },
    { value: 'opioids', label: 'Opioids', impact: '-8 years (top 3 lifespan reducer, VA study)' }
  ]},
  { section: 'Mental Health', key: 'stress', type: 'choice', question: 'How would you rate your stress level?', options: [
    { value: 'low', label: 'Low', desc: 'Generally calm and balanced', impact: '+2 years' },
    { value: 'moderate', label: 'Moderate', desc: 'Normal life stressors', impact: '0 years (baseline)' },
    { value: 'high', label: 'High', desc: 'Frequent stress and worry', impact: '-2 years (20-30% increased mortality)' },
    { value: 'very_high', label: 'Very high', desc: 'Chronic, overwhelming stress', impact: '-4 years' }
  ]},
  { section: 'Mental Health', key: 'stress_mgmt', type: 'choice', question: 'Do you actively practice stress management?', options: [
    { value: 'yes', label: 'Yes', desc: 'Meditation, therapy, yoga, journaling, etc.', impact: '+1.5 years (VA study)' },
    { value: 'no', label: 'No', desc: 'I do not have a regular practice', impact: '0 years (missed protective benefit)' }
  ]},
  { section: 'Social Life', key: 'social', type: 'choice', question: 'How strong are your social connections?', options: [
    { value: 'strong', label: 'Strong network', desc: 'Close friends, family, community involvement', impact: '+4 years (Harvard 80-year study: #1 longevity predictor)' },
    { value: 'moderate', label: 'Moderate', desc: 'Some close relationships', impact: '+2 years' },
    { value: 'few', label: 'Few connections', desc: 'Limited social circle', impact: '-2 years' },
    { value: 'isolated', label: 'Isolated', desc: 'Very few or no close relationships', impact: '-7 years (equivalent to smoking 15 cigs/day)' }
  ]},
  { section: 'Social Life', key: 'relationship', type: 'choice', question: 'What is your relationship status?', options: [
    { value: 'married', label: 'Married', impact: '+2.5 years (social support + shared health behaviors)' },
    { value: 'partnered', label: 'In a relationship', impact: '+2 years' },
    { value: 'single', label: 'Single', impact: '0 years (baseline)' },
    { value: 'divorced_widowed', label: 'Divorced or widowed', impact: '-1 year (life transition stress)' }
  ]},
  { section: 'Sleep', key: 'sleep_hours', type: 'choice', question: 'How many hours do you sleep per night on average?', options: [
    { value: 'short', label: 'Less than 6 hours', impact: '-3 years (chronic deprivation)' },
    { value: 'moderate_short', label: '6-7 hours', impact: '-1 year (slightly below optimal)' },
    { value: 'optimal', label: '7-8 hours', impact: '0 years (optimal for longevity)' },
    { value: 'long', label: '9+ hours', impact: '-1.5 years (may indicate underlying issues)' }
  ]},
  { section: 'Sleep', key: 'sleep_quality', type: 'choice', question: 'How is your sleep quality?', options: [
    { value: 'poor', label: 'Poor', desc: 'Frequent waking, hard to fall asleep', impact: '-2 years' },
    { value: 'fair', label: 'Fair', desc: 'Occasional issues', impact: '-0.5 years' },
    { value: 'good', label: 'Good', desc: 'Generally restful', impact: '0 years (solid foundation)' },
    { value: 'excellent', label: 'Excellent', desc: 'Deep, uninterrupted sleep', impact: '+1 year (underrated longevity tool)' }
  ]},
  { section: 'Medical History', key: 'conditions', type: 'conditions', question: 'Do you have any of these conditions? (Select all that apply)',
    options: [
      { label: 'Diabetes', impact: '-8 yrs' },
      { label: 'Heart Disease', impact: '-9 yrs' },
      { label: 'Hypertension', impact: '-5 yrs' },
      { label: 'Cancer (current/remission)', impact: '-4 yrs' },
      { label: 'Stroke History', impact: '-10 yrs' },
      { label: 'COPD', impact: '-6 yrs' },
      { label: 'Chronic Kidney Disease', impact: '-5 yrs' },
      { label: 'Autoimmune Condition', impact: '-3 yrs' },
      { label: 'None', impact: '' }
    ]
  },
  { section: 'Medical History', key: 'family', type: 'family', question: 'Family history: at what age did/will your parents and grandparents reach?', hint: 'Parents with 80+ longevity: +2 to +4 years. Parents who died before 65: -2 to -4 years. Grandparents 90+: additional +1 to +3 years.' },
  { section: 'Medical History', key: 'healthcare', type: 'choice', question: 'How often do you see a doctor?', options: [
    { value: 'regular', label: 'Annual checkups', desc: 'Regular preventive care', impact: '+1 year (early detection saves lives)' },
    { value: 'occasional', label: 'Occasionally', desc: 'When something comes up', impact: '0 years (baseline)' },
    { value: 'rarely', label: 'Rarely', desc: 'Only when very sick', impact: '-1 year' },
    { value: 'never', label: 'Never', desc: 'Have not seen a doctor in years', impact: '-3 years (undiagnosed conditions are silent killers)' }
  ]},
  { section: 'Biometrics', key: 'blood_pressure', type: 'choice', question: 'What is your blood pressure?', options: [
    { value: 'normal', label: 'Normal (<120/80)', impact: '0 years (optimal)' },
    { value: 'elevated', label: 'Elevated (120-129/<80)', impact: '-1 year (pre-hypertension)' },
    { value: 'high_1', label: 'Stage 1 (130-139/80-89)', impact: '-3 years' },
    { value: 'high_2', label: 'Stage 2 (140+/90+)', impact: '-5 years (Lancet, n=1.25M)' },
    { value: 'unknown', label: 'I do not know', impact: '0 years (get it checked!)' }
  ]},
  { section: 'Biometrics', key: 'resting_hr', type: 'choice', question: 'What is your resting heart rate?', options: [
    { value: 'low', label: 'Under 60 bpm', desc: 'Athletic range', impact: '+2 years (strong cardiovascular fitness)' },
    { value: 'normal', label: '60-80 bpm', desc: 'Normal range', impact: '0 years (healthy baseline)' },
    { value: 'elevated', label: '80-100 bpm', desc: 'Elevated', impact: '-2 years (each 10 bpm above 80 = 16% higher mortality)' },
    { value: 'high', label: 'Over 100 bpm', desc: 'Tachycardia range', impact: '-4 years (Copenhagen study)' },
    { value: 'unknown', label: 'I do not know', impact: '0 years (check your pulse in the morning)' }
  ]},
  { section: 'Lifestyle Habits', key: 'coffee', type: 'choice', question: 'How much coffee do you drink?', options: [
    { value: 'moderate', label: '2-3 cups/day', impact: '+2 years (optimal, NEJM n=468,629)' },
    { value: 'light', label: '1 cup/day', impact: '+1 year' },
    { value: 'heavy', label: '4+ cups/day', impact: '+0.5 years (still beneficial)' },
    { value: 'none', label: 'No coffee', impact: '0 years (baseline)' }
  ]},
  { section: 'Lifestyle Habits', key: 'hydration', type: 'choice', question: 'How much water do you drink daily?', options: [
    { value: 'good', label: '8+ glasses/day', desc: 'Well hydrated', impact: '+2 years (NIH ARIC study, n=15,752)' },
    { value: 'moderate', label: '4-7 glasses/day', desc: 'Adequate', impact: '0 years (baseline)' },
    { value: 'poor', label: 'Less than 4 glasses', desc: 'Often dehydrated', impact: '-2 years (50% faster biological aging)' }
  ]},
  { section: 'Lifestyle Habits', key: 'dental', type: 'choice', question: 'How is your dental hygiene?', options: [
    { value: 'excellent', label: 'Daily flossing + regular dentist', impact: '+1.5 years (25-30% lower CVD mortality)' },
    { value: 'good', label: 'Brush daily, rare dentist', impact: '0 years (baseline)' },
    { value: 'poor', label: 'Irregular brushing, never floss', impact: '-2 years (Leisure World study, n=5,611)' }
  ]},
  { section: 'Lifestyle Habits', key: 'sauna', type: 'choice', question: 'Do you use a sauna or heat therapy?', options: [
    { value: 'frequent', label: '4-7 times/week', impact: '+3 years (40% lower mortality, JAMA Finnish study)' },
    { value: 'moderate', label: '2-3 times/week', impact: '+1.5 years (24% lower mortality)' },
    { value: 'rare', label: 'About once/week', impact: '+0.5 years' },
    { value: 'never', label: 'Never', impact: '0 years (baseline)' }
  ]},
  { section: 'Lifestyle Habits', key: 'screen_time', type: 'choice', question: 'How many hours of recreational screen time per day?', options: [
    { value: 'low', label: 'Under 2 hours', impact: '+1 year (minimal sedentary risk)' },
    { value: 'moderate', label: '2-4 hours', impact: '0 years (average)' },
    { value: 'high', label: '4-6 hours', impact: '-1.5 years (37% higher premature death)' },
    { value: 'very_high', label: '6+ hours', impact: '-3 years (4.8 years less life expectancy)' }
  ]},
  { section: 'Lifestyle Habits', key: 'omega3', type: 'choice', question: 'How often do you eat fish or take omega-3 supplements?', options: [
    { value: 'high', label: 'Daily fish or supplements', impact: '+3 years (Framingham: 34% lower mortality)' },
    { value: 'moderate', label: 'Fish 1-2 times/week', impact: '+1.5 years' },
    { value: 'low', label: 'Rarely eat fish, no supplements', impact: '-1 year (same impact as smoking)' }
  ]},
  { section: 'Lifestyle Habits', key: 'gratitude', type: 'choice', question: 'Do you practice gratitude or maintain an optimistic outlook?', options: [
    { value: 'high', label: 'Regular practice (journaling, meditation)', impact: '+2 years (JAMA Psychiatry, n=49,275)' },
    { value: 'moderate', label: 'Generally optimistic', impact: '+1 year (optimists live 11-15% longer)' },
    { value: 'low', label: 'Tend toward pessimism', impact: '0 years (gratitude is trainable!)' }
  ]},
  { section: 'Lifestyle Habits', key: 'nature', type: 'choice', question: 'How much time do you spend in nature/green spaces?', options: [
    { value: 'high', label: 'Daily (live near parks/countryside)', impact: '+2.5 years (Lancet, n=4.6M)' },
    { value: 'moderate', label: 'Weekly walks in parks', impact: '+1 year' },
    { value: 'low', label: 'Rarely go outside in nature', impact: '-1 year (urban concrete environment)' }
  ]},
  { section: 'Social Life', key: 'volunteering', type: 'choice', question: 'Do you volunteer or do community service?', options: [
    { value: 'regular', label: 'Regularly (100+ hours/year)', impact: '+2 years (40% lower mortality, meta-analysis)' },
    { value: 'occasional', label: 'Occasionally', impact: '+1 year' },
    { value: 'none', label: 'No', impact: '0 years (purpose + social = longevity boost)' }
  ]},
  { section: 'Social Life', key: 'religion', type: 'choice', question: 'Do you attend religious services or have a spiritual practice?', options: [
    { value: 'weekly', label: 'Weekly attendance', impact: '+3 years (Hummer et al., n=22,080)' },
    { value: 'occasional', label: 'Occasionally', impact: '+1 year' },
    { value: 'none', label: 'No', impact: '0 years (secular community groups also help)' }
  ]},
  { section: 'Social Life', key: 'pet', type: 'choice', question: 'Do you own a pet?', options: [
    { value: 'dog', label: 'Dog', impact: '+1.5 years (AHA, n=3.4M: 24% lower mortality)' },
    { value: 'cat', label: 'Cat', impact: '+0.5 years (lower CVD risk)' },
    { value: 'other', label: 'Other pet', impact: '+0.5 years (companionship benefit)' },
    { value: 'none', label: 'No pets', impact: '0 years (consider getting a dog!)' }
  ]},
  { section: 'Socioeconomic', key: 'education', type: 'choice', question: 'What is your highest level of education?', options: [
    { value: 'postgrad', label: 'Postgraduate degree', impact: '+4 years (Lancet meta-analysis)' },
    { value: 'bachelors', label: 'Bachelors degree', impact: '+3 years (8-year gap vs non-graduates)' },
    { value: 'some_college', label: 'Some college / trade school', impact: '+1.5 years' },
    { value: 'high_school', label: 'High school', impact: '0 years (baseline)' },
    { value: 'less', label: 'Less than high school', impact: '-2 years' }
  ]},
  { section: 'Socioeconomic', key: 'income', type: 'choice', question: 'How would you describe your household income?', options: [
    { value: 'high', label: 'Above average', desc: 'Top 25% in your country', impact: '+3 years (Chetty, JAMA, n=1.4B tax records)' },
    { value: 'middle', label: 'Average', impact: '0 years (baseline)' },
    { value: 'low', label: 'Below average', desc: 'Bottom 25%', impact: '-3 years (14.6-year gap between top and bottom 1%)' }
  ]},
  { section: 'Environment', key: 'air_quality', type: 'choice', question: 'How is the air quality where you live?', options: [
    { value: 'good', label: 'Good', desc: 'Clean air, low pollution', impact: '0 years (clean environment)' },
    { value: 'moderate', label: 'Moderate', desc: 'Some urban pollution', impact: '-1 year' },
    { value: 'poor', label: 'Poor', desc: 'High pollution area', impact: '-3 years (Lancet: up to -4 years in worst areas)' }
  ]},
  { section: 'Environment', key: 'occupation', type: 'choice', question: 'What best describes your work environment?', options: [
    { value: 'sedentary', label: 'Desk/Office work', desc: 'Mostly sitting', impact: '-1 year (sitting disease is real)' },
    { value: 'moderate', label: 'Moderate activity', desc: 'Mix of sitting and moving', impact: '0 years (good balance)' },
    { value: 'physical', label: 'Physically active', desc: 'On your feet most of the day', impact: '+0.5 years' },
    { value: 'hazardous', label: 'Hazardous', desc: 'Exposure to chemicals, heights, heavy machinery', impact: '-4 years (OSHA data)' }
  ]}
];

const countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominican Republic","DR Congo","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Guatemala","Guinea","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];

// WHO/UN Life Expectancy by Country and Sex (2023 estimates, years)
const countryLifeExpectancy = {
  "Afghanistan":{m:61.0,f:64.5},"Albania":{m:76.0,f:80.2},"Algeria":{m:75.2,f:77.8},"Andorra":{m:81.0,f:86.0},
  "Angola":{m:59.5,f:64.2},"Argentina":{m:73.5,f:79.8},"Armenia":{m:71.5,f:78.5},"Australia":{m:81.3,f:85.4},
  "Austria":{m:79.4,f:84.2},"Azerbaijan":{m:70.5,f:76.0},"Bahamas":{m:71.0,f:77.0},"Bahrain":{m:76.5,f:79.0},
  "Bangladesh":{m:71.0,f:74.5},"Barbados":{m:75.0,f:80.0},"Belarus":{m:68.5,f:79.0},"Belgium":{m:79.5,f:84.0},
  "Belize":{m:71.0,f:77.0},"Benin":{m:60.0,f:63.5},"Bhutan":{m:71.5,f:73.0},"Bolivia":{m:66.5,f:72.0},
  "Bosnia and Herzegovina":{m:75.0,f:80.0},"Botswana":{m:62.0,f:68.5},"Brazil":{m:72.0,f:79.5},
  "Brunei":{m:74.5,f:77.5},"Bulgaria":{m:71.5,f:78.5},"Burkina Faso":{m:60.0,f:62.5},"Burundi":{m:59.0,f:63.0},
  "Cambodia":{m:67.5,f:72.0},"Cameroon":{m:59.0,f:62.5},"Canada":{m:80.0,f:84.5},"Cape Verde":{m:71.0,f:77.0},
  "Central African Republic":{m:52.0,f:56.0},"Chad":{m:53.0,f:56.5},"Chile":{m:77.5,f:82.5},"China":{m:75.5,f:80.5},
  "Colombia":{m:73.5,f:80.0},"Comoros":{m:63.0,f:67.0},"Congo":{m:62.0,f:66.0},"Costa Rica":{m:77.5,f:82.5},
  "Croatia":{m:74.5,f:81.0},"Cuba":{m:76.5,f:80.5},"Cyprus":{m:79.5,f:83.5},"Czech Republic":{m:76.5,f:82.5},
  "Denmark":{m:79.5,f:83.5},"Djibouti":{m:62.0,f:66.0},"Dominican Republic":{m:71.5,f:77.5},
  "DR Congo":{m:59.0,f:63.0},"Ecuador":{m:74.0,f:79.5},"Egypt":{m:69.5,f:74.0},"El Salvador":{m:69.0,f:78.0},
  "Equatorial Guinea":{m:57.5,f:61.5},"Eritrea":{m:64.0,f:68.5},"Estonia":{m:74.5,f:83.0},
  "Eswatini":{m:55.0,f:62.0},"Ethiopia":{m:64.5,f:68.5},"Fiji":{m:65.5,f:69.5},"Finland":{m:79.0,f:84.5},
  "France":{m:79.5,f:85.5},"Gabon":{m:64.0,f:68.0},"Gambia":{m:60.5,f:64.0},"Georgia":{m:70.0,f:78.5},
  "Germany":{m:78.5,f:83.5},"Ghana":{m:63.0,f:65.5},"Greece":{m:78.5,f:84.0},"Guatemala":{m:70.5,f:77.5},
  "Guinea":{m:59.0,f:62.0},"Guyana":{m:65.0,f:71.0},"Haiti":{m:62.0,f:66.5},"Honduras":{m:72.0,f:77.0},
  "Hungary":{m:73.0,f:79.5},"Iceland":{m:81.5,f:84.5},"India":{m:68.5,f:71.5},"Indonesia":{m:69.5,f:73.5},
  "Iran":{m:74.5,f:77.5},"Iraq":{m:68.5,f:73.0},"Ireland":{m:80.5,f:84.0},"Israel":{m:81.0,f:84.5},
  "Italy":{m:81.0,f:85.5},"Jamaica":{m:72.0,f:76.5},"Japan":{m:81.5,f:87.5},"Jordan":{m:73.0,f:76.5},
  "Kazakhstan":{m:68.0,f:76.5},"Kenya":{m:62.0,f:67.0},"Kuwait":{m:76.0,f:79.5},"Kyrgyzstan":{m:67.0,f:75.0},
  "Laos":{m:65.0,f:69.0},"Latvia":{m:70.5,f:80.0},"Lebanon":{m:76.0,f:80.0},"Lesotho":{m:50.5,f:56.0},
  "Liberia":{m:62.0,f:65.0},"Libya":{m:70.5,f:76.0},"Liechtenstein":{m:82.0,f:86.0},
  "Lithuania":{m:71.0,f:80.5},"Luxembourg":{m:80.5,f:85.0},"Madagascar":{m:64.5,f:68.0},
  "Malawi":{m:61.0,f:67.0},"Malaysia":{m:73.5,f:78.0},"Maldives":{m:77.0,f:80.5},"Mali":{m:57.5,f:60.5},
  "Malta":{m:80.5,f:84.5},"Mauritania":{m:63.0,f:67.5},"Mauritius":{m:71.5,f:78.0},"Mexico":{m:72.0,f:78.0},
  "Moldova":{m:67.0,f:76.0},"Monaco":{m:85.0,f:89.0},"Mongolia":{m:66.0,f:74.0},"Montenegro":{m:74.5,f:79.5},
  "Morocco":{m:74.5,f:77.5},"Mozambique":{m:57.5,f:63.0},"Myanmar":{m:63.0,f:69.0},"Namibia":{m:60.0,f:66.5},
  "Nepal":{m:69.0,f:72.0},"Netherlands":{m:80.0,f:83.5},"New Zealand":{m:80.5,f:83.5},
  "Nicaragua":{m:72.5,f:78.5},"Niger":{m:61.0,f:63.5},"Nigeria":{m:53.5,f:55.5},
  "North Korea":{m:68.0,f:75.0},"North Macedonia":{m:73.5,f:78.0},"Norway":{m:81.5,f:85.0},
  "Oman":{m:76.0,f:79.5},"Pakistan":{m:66.0,f:68.5},"Palestine":{m:72.5,f:76.5},"Panama":{m:75.5,f:81.5},
  "Papua New Guinea":{m:63.0,f:67.5},"Paraguay":{m:71.5,f:76.0},"Peru":{m:74.0,f:79.5},
  "Philippines":{m:67.5,f:74.5},"Poland":{m:74.0,f:81.5},"Portugal":{m:78.5,f:84.5},"Qatar":{m:78.0,f:81.0},
  "Romania":{m:72.0,f:79.5},"Russia":{m:66.5,f:77.5},"Rwanda":{m:66.0,f:70.5},"Saudi Arabia":{m:75.0,f:78.5},
  "Senegal":{m:66.0,f:70.0},"Serbia":{m:73.0,f:78.5},"Sierra Leone":{m:53.0,f:55.5},
  "Singapore":{m:81.5,f:86.0},"Slovakia":{m:74.0,f:81.0},"Slovenia":{m:78.5,f:84.0},
  "Somalia":{m:55.0,f:59.0},"South Africa":{m:60.5,f:67.5},"South Korea":{m:80.0,f:86.0},
  "South Sudan":{m:55.5,f:59.5},"Spain":{m:80.5,f:86.0},"Sri Lanka":{m:73.5,f:80.0},
  "Sudan":{m:63.5,f:67.5},"Suriname":{m:68.0,f:74.5},"Sweden":{m:81.5,f:85.0},
  "Switzerland":{m:82.0,f:85.5},"Syria":{m:68.0,f:76.0},"Taiwan":{m:78.0,f:84.0},
  "Tajikistan":{m:69.0,f:74.5},"Tanzania":{m:63.5,f:67.5},"Thailand":{m:73.5,f:80.5},
  "Togo":{m:60.0,f:63.5},"Trinidad and Tobago":{m:69.5,f:76.0},"Tunisia":{m:74.5,f:78.5},
  "Turkey":{m:74.5,f:80.5},"Turkmenistan":{m:65.0,f:72.5},"Uganda":{m:61.5,f:66.0},
  "Ukraine":{m:66.5,f:76.5},"United Arab Emirates":{m:77.5,f:80.5},"United Kingdom":{m:79.5,f:83.0},
  "United States":{m:74.8,f:80.2},"Uruguay":{m:74.0,f:81.0},"Uzbekistan":{m:69.5,f:74.5},
  "Venezuela":{m:68.5,f:77.0},"Vietnam":{m:71.5,f:79.5},"Yemen":{m:63.5,f:67.0},
  "Zambia":{m:60.0,f:66.0},"Zimbabwe":{m:59.5,f:64.5}
};

function getPartialEstimate() {
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
}

function updateLiveBar() {
  const liveBar = document.getElementById('liveEstimateBar');
  if (!liveBar) return;
  const est = getPartialEstimate();
  if (est) {
    const barColor = parseFloat(est.pct) > 60 ? 'var(--green)' : parseFloat(est.pct) > 40 ? 'var(--gold)' : 'var(--accent)';
    liveBar.style.display = 'flex';
    liveBar.innerHTML = '<div style="flex:1;"><div style="color:var(--text2);margin-bottom:2px;">Expected lifespan: <strong style="color:var(--text);font-size:0.85rem;">' + est.adjustedLE + ' years</strong> <span style="color:var(--text3);">(' + est.expectedYears + ' years left)</span></div><div style="background:var(--bg);border-radius:4px;height:6px;overflow:hidden;margin-top:4px;"><div style="width:' + parseFloat(est.pct) + '%;height:100%;background:' + barColor + ';border-radius:4px;transition:width 0.5s;"></div></div></div><div style="text-align:center;min-width:70px;"><div style="font-size:1rem;font-weight:700;color:' + barColor + ';">Top ' + (100 - parseFloat(est.pct)).toFixed(2) + '%</div><div style="color:var(--text3);font-size:0.65rem;">of population</div></div>';
  }
}

function renderQuestion() {
  const q = questions[state.currentQuestion];
  const total = questions.length;
  // Progress
  let prog = '';
  for (let i = 0; i < total; i++) {
    const cls = i < state.currentQuestion ? 'done' : i === state.currentQuestion ? 'active' : '';
    prog += `<div class="q-progress-dot ${cls}"></div>`;
  }
  document.getElementById('qProgress').innerHTML = prog;
  document.getElementById('qBack').classList.toggle('hidden', state.currentQuestion === 0);
  document.getElementById('qNext').textContent = state.currentQuestion === total - 1 ? 'See My Death Date' : 'Next';

  // Live estimate bar
  const est = getPartialEstimate();
  let liveBar = document.getElementById('liveEstimateBar');
  if (!liveBar) {
    liveBar = document.createElement('div');
    liveBar.id = 'liveEstimateBar';
    liveBar.style.cssText = 'margin:8px 0 4px; padding:8px 12px; background:var(--surface); border-radius:8px; font-size:0.75rem; display:flex; justify-content:space-between; align-items:center; gap:8px; transition:all 0.3s;';
    const qProg = document.getElementById('qProgress');
    if (qProg && qProg.parentNode) qProg.parentNode.insertBefore(liveBar, qProg.nextSibling);
  }
  if (est) {
    const barColor = parseFloat(est.pct) > 60 ? 'var(--green)' : parseFloat(est.pct) > 40 ? 'var(--gold)' : 'var(--accent)';
    liveBar.style.display = 'flex';
    liveBar.innerHTML = '<div style="flex:1;"><div style="color:var(--text2);margin-bottom:2px;">Expected lifespan: <strong style="color:var(--text);font-size:0.85rem;">' + est.adjustedLE + ' years</strong> <span style="color:var(--text3);">(' + est.expectedYears + ' years left)</span></div><div style="background:var(--bg);border-radius:4px;height:6px;overflow:hidden;margin-top:4px;"><div style="width:' + parseFloat(est.pct) + '%;height:100%;background:' + barColor + ';border-radius:4px;transition:width 0.5s;"></div></div></div><div style="text-align:center;min-width:70px;"><div style="font-size:1rem;font-weight:700;color:' + barColor + ';">Top ' + (100 - parseFloat(est.pct)).toFixed(2) + '%</div><div style="color:var(--text3);font-size:0.65rem;">of population</div></div>';
  } else {
    liveBar.style.display = 'none';
  }

  let html = `<div class="q-section-title">${q.section}</div><div class="q-question">${q.question}</div>`;

  if (q.type === 'choice') {
    html += '<div class="q-options">';
    q.options.forEach(o => {
      const sel = state.answers[q.key] === o.value ? 'selected' : '';
      let impactClass = 'neutral';
      if (o.impact) {
        if (o.impact.startsWith('+') || o.impact.match(/^\+/)) impactClass = 'positive';
        else if (o.impact.startsWith('-')) impactClass = 'negative';
      }
      html += `<button class="q-option ${sel}" onclick="selectAnswer('${q.key}','${o.value}')">
        <div class="q-option-label">${o.label}</div>
        ${o.desc ? `<div class="q-option-desc">${o.desc}</div>` : ''}
        ${o.impact ? `<div class="q-option-impact ${impactClass}">${o.impact}</div>` : ''}
      </button>`;
    });
    html += '</div>';
  } else if (q.type === 'date') {
    const val = state.answers[q.key] || '';
    html += `<div style="max-width:300px"><input type="date" value="${val}" onchange="state.answers['${q.key}']=this.value" max="${new Date().toISOString().split('T')[0]}"></div>`;
  } else if (q.type === 'input') {
    const val = state.answers[q.key] || '';
    html += `<div style="max-width:400px"><input type="text" value="${val}" placeholder="${q.placeholder||''}" onchange="state.answers['${q.key}']=this.value; updateLiveBar();"></div>`;
  } else if (q.type === 'country') {
    const val = state.answers[q.key] || '';
    html += `<div style="max-width:400px; position:relative;">
      <input type="text" id="countryInput" value="${val}" placeholder="Start typing your country..." autocomplete="off"
        oninput="filterCountries(this.value)" onfocus="filterCountries(this.value)">
      <div id="countryDropdown" style="position:absolute; top:100%; left:0; right:0; max-height:200px; overflow-y:auto; background:var(--bg2); border:1px solid var(--border); border-radius:0 0 var(--radius) var(--radius); z-index:50; display:none;"></div>
    </div>`;
  } else if (q.type === 'body') {
    const h = state.answers.height_cm || '';
    const w = state.answers.weight_kg || '';
    html += `<div class="q-input-row">
      <div><label>Height (cm)</label><input type="number" value="${h}" placeholder="170" onchange="state.answers.height_cm=parseFloat(this.value); updateLiveBar();"></div>
      <div><label>Weight (kg)</label><input type="number" value="${w}" placeholder="70" onchange="state.answers.weight_kg=parseFloat(this.value); updateLiveBar();"></div>
    </div>`;
    if (h && w) {
      const bmi = (w / ((h/100) ** 2)).toFixed(1);
      let bmiImpact = '', bmiClass = 'neutral';
      if (bmi < 18.5) { bmiImpact = '-2 years (underweight)'; bmiClass = 'negative'; }
      else if (bmi < 25) { bmiImpact = '0 years (optimal range)'; bmiClass = 'positive'; }
      else if (bmi < 30) { bmiImpact = '-1 year (overweight)'; bmiClass = 'negative'; }
      else if (bmi < 35) { bmiImpact = '-3 years (obese, Lancet study)'; bmiClass = 'negative'; }
      else { bmiImpact = '-7 years (severely obese)'; bmiClass = 'negative'; }
      html += `<p style="color:var(--text2)">Your BMI: <strong>${bmi}</strong></p>`;
      html += `<div class="q-option-impact ${bmiClass}" style="margin-top:8px">${bmiImpact}</div>`;
    } else {
      html += `<div class="q-option-impact neutral" style="margin-top:8px">BMI 18.5-24.9 is optimal. Each 5 points above 25 costs ~2-3 years.</div>`;
    }
  } else if (q.type === 'conditions') {
    const selected = state.answers.conditions || [];
    html += '<div class="q-conditions">';
    q.options.forEach(c => {
      const label = typeof c === 'object' ? c.label : c;
      const impact = typeof c === 'object' ? c.impact : '';
      const sel = selected.includes(label) ? 'selected' : '';
      html += `<button class="q-condition ${sel}" onclick="toggleCondition('${label.replace(/'/g, "\\'")}')">
        <div>${label}</div>
        ${impact ? `<div class="q-condition-impact">${impact}</div>` : ''}
      </button>`;
    });
    html += '</div>';
  } else if (q.type === 'family') {
    const p1 = state.answers.parent1_age || '';
    const p2 = state.answers.parent2_age || '';
    const gp1 = state.answers.grandparent1_age || '';
    const gp2 = state.answers.grandparent2_age || '';
    html += `<div style="margin-bottom:16px;">
      <div style="font-weight:600; margin-bottom:8px; color:var(--text)">Parents</div>
      <div class="q-input-row">
        <div><label>Parent 1 age at death (or current age if alive)</label><input type="number" value="${p1}" placeholder="75" onchange="state.answers.parent1_age=parseInt(this.value); updateLiveBar();"></div>
        <div><label>Parent 2 age at death (or current age if alive)</label><input type="number" value="${p2}" placeholder="78" onchange="state.answers.parent2_age=parseInt(this.value); updateLiveBar();"></div>
      </div>
    </div>
    <div style="margin-bottom:16px;">
      <div style="font-weight:600; margin-bottom:8px; color:var(--text)">Grandparents (optional, improves accuracy)</div>
      <div class="q-input-row">
        <div><label>Oldest grandparent age at death (or current)</label><input type="number" value="${gp1}" placeholder="85" onchange="state.answers.grandparent1_age=parseInt(this.value)"></div>
        <div><label>Average grandparent age at death (or current)</label><input type="number" value="${gp2}" placeholder="80" onchange="state.answers.grandparent2_age=parseInt(this.value)"></div>
      </div>
    </div>`;
    if (q.hint) {
      html += `<div class="q-option-impact neutral" style="display:block; margin-bottom:16px;">${q.hint}</div>`;
    }
  }

  document.getElementById('qContent').innerHTML = html;
}

function selectAnswer(key, value) {
  state.answers[key] = value;
  renderQuestion();
  showMotivation(key, value);
}

function toggleCondition(cond) {
  if (!state.answers.conditions) state.answers.conditions = [];
  if (cond === 'None') {
    state.answers.conditions = ['None'];
  } else {
    state.answers.conditions = state.answers.conditions.filter(c => c !== 'None');
    const idx = state.answers.conditions.indexOf(cond);
    if (idx >= 0) state.answers.conditions.splice(idx, 1);
    else state.answers.conditions.push(cond);
  }
  renderQuestion();
}

function filterCountries(val) {
  const dd = document.getElementById('countryDropdown');
  if (!dd) return;
  if (!val) { dd.style.display = 'none'; return; }
  const matches = countries.filter(c => c.toLowerCase().startsWith(val.toLowerCase())).slice(0, 8);
  if (matches.length === 0) { dd.style.display = 'none'; return; }
  dd.style.display = 'block';
  dd.innerHTML = matches.map(c => `<div style="padding:10px 16px; cursor:pointer; color:var(--text); border-bottom:1px solid var(--border);"
    onmouseover="this.style.background='var(--surface)'" onmouseout="this.style.background=''"
    onclick="selectCountry('${c}')">${c}</div>`).join('');
}

function selectCountry(c) {
  state.answers.country = c;
  const inp = document.getElementById('countryInput');
  if (inp) inp.value = c;
  const dd = document.getElementById('countryDropdown');
  if (dd) dd.style.display = 'none';
}

document.addEventListener('click', e => {
  const dd = document.getElementById('countryDropdown');
  if (dd && !e.target.closest('#countryInput') && !e.target.closest('#countryDropdown')) dd.style.display = 'none';
});

function nextQuestion() {
  if (state.currentQuestion < questions.length - 1) {
    state.currentQuestion++;
    renderQuestion();
  } else {
    calculateResult();
  }
}

function prevQuestion() {
  if (state.currentQuestion > 0) {
    state.currentQuestion--;
    renderQuestion();
  }
}

function calculateResult() {
  const a = state.answers;
  // Validate DOB - required field
  if (!a.dob) {
    showToast('Please enter your date of birth to calculate your death date.');
    // Find the DOB question index and go back to it
    const dobIdx = questions.findIndex(q => q.key === 'dob');
    if (dobIdx >= 0) { state.currentQuestion = dobIdx; renderQuestion(); }
    return;
  }
  const dob = new Date(a.dob);
  if (isNaN(dob.getTime())) {
    showToast('Invalid date of birth. Please enter a valid date.');
    const dobIdx = questions.findIndex(q => q.key === 'dob');
    if (dobIdx >= 0) { state.currentQuestion = dobIdx; renderQuestion(); }
    return;
  }
  const now = new Date();
  const age = (now - dob) / (365.25 * 24 * 60 * 60 * 1000);
  if (age < 0 || age > 120) {
    showToast('Please enter a realistic date of birth.');
    const dobIdx = questions.findIndex(q => q.key === 'dob');
    if (dobIdx >= 0) { state.currentQuestion = dobIdx; renderQuestion(); }
    return;
  }
  const sex = a.sex || 'male';

  // Use country-specific life expectancy if available, else SSA table
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
  const factors = [];

  // BMI
  if (a.height_cm && a.weight_kg) {
    const bmi = a.weight_kg / ((a.height_cm / 100) ** 2);
    let bmiKey;
    if (bmi < 18.5) bmiKey = 'bmi_underweight';
    else if (bmi < 25) bmiKey = 'bmi_healthy';
    else if (bmi < 30) bmiKey = 'bmi_overweight';
    else if (bmi < 35) bmiKey = 'bmi_obese';
    else bmiKey = 'bmi_severely_obese';
    factors.push({ key: bmiKey, ...lifeFactors[bmiKey] });
  }

  // Exercise
  const exMap = { '5+': 'exercise_5plus', '3-4x': 'exercise_3to4', '1-2x': 'exercise_1to2', 'none': 'exercise_none' };
  if (a.exercise && exMap[a.exercise]) factors.push({ key: exMap[a.exercise], ...lifeFactors[exMap[a.exercise]] });

  // Diet
  const dietMap = { very_healthy: 'diet_very_healthy', healthy: 'diet_healthy', average: 'diet_average', poor: 'diet_poor' };
  if (a.diet && dietMap[a.diet]) factors.push({ key: dietMap[a.diet], ...lifeFactors[dietMap[a.diet]] });

  // Alcohol
  const alcMap = { never: 'alcohol_never', occasional: 'alcohol_occasional', moderate: 'alcohol_moderate', heavy: 'alcohol_heavy' };
  if (a.alcohol && alcMap[a.alcohol]) factors.push({ key: alcMap[a.alcohol], ...lifeFactors[alcMap[a.alcohol]] });

  // Smoking
  const smokeMap = { never: 'smoking_never', former: 'smoking_former', current_light: 'smoking_current_light', current_heavy: 'smoking_current_heavy' };
  if (a.smoking && smokeMap[a.smoking]) factors.push({ key: smokeMap[a.smoking], ...lifeFactors[smokeMap[a.smoking]] });

  // Drugs
  const drugMap = { none: 'drug_none', cannabis: 'drug_cannabis', recreational: 'drug_recreational', opioids: 'drug_opioids' };
  if (a.drugs && drugMap[a.drugs]) factors.push({ key: drugMap[a.drugs], ...lifeFactors[drugMap[a.drugs]] });

  // Stress
  const stressMap = { low: 'stress_low', moderate: 'stress_moderate', high: 'stress_high', very_high: 'stress_very_high' };
  if (a.stress && stressMap[a.stress]) factors.push({ key: stressMap[a.stress], ...lifeFactors[stressMap[a.stress]] });

  // Stress management
  const smMap = { yes: 'stress_mgmt_yes', no: 'stress_mgmt_no' };
  if (a.stress_mgmt && smMap[a.stress_mgmt]) factors.push({ key: smMap[a.stress_mgmt], ...lifeFactors[smMap[a.stress_mgmt]] });

  // Social
  const socMap = { strong: 'social_strong', moderate: 'social_moderate', few: 'social_few', isolated: 'social_isolated' };
  if (a.social && socMap[a.social]) factors.push({ key: socMap[a.social], ...lifeFactors[socMap[a.social]] });

  // Relationship
  const relMap = { married: 'rel_married', partnered: 'rel_partnered', single: 'rel_single', divorced_widowed: 'rel_divorced' };
  if (a.relationship && relMap[a.relationship]) factors.push({ key: relMap[a.relationship], ...lifeFactors[relMap[a.relationship]] });

  // Sleep
  const sleepMap = { short: 'sleep_short', moderate_short: 'sleep_moderate_short', optimal: 'sleep_optimal', long: 'sleep_long' };
  if (a.sleep_hours && sleepMap[a.sleep_hours]) factors.push({ key: sleepMap[a.sleep_hours], ...lifeFactors[sleepMap[a.sleep_hours]] });

  const sqMap = { poor: 'sleep_quality_poor', fair: 'sleep_quality_fair', good: 'sleep_quality_good', excellent: 'sleep_quality_excellent' };
  if (a.sleep_quality && sqMap[a.sleep_quality]) factors.push({ key: sqMap[a.sleep_quality], ...lifeFactors[sqMap[a.sleep_quality]] });

  // Conditions
  const condLabels = (a.conditions || []).map(c => typeof c === 'object' ? c.label : c);
  if (condLabels.length > 0 && !condLabels.includes('None')) {
    const condMap = {
      'Diabetes': 'cond_diabetes', 'Heart Disease': 'cond_heart_disease', 'Hypertension': 'cond_hypertension',
      'Cancer (current/remission)': 'cond_cancer', 'Stroke History': 'cond_stroke', 'COPD': 'cond_copd',
      'Chronic Kidney Disease': 'cond_kidney', 'Autoimmune Condition': 'cond_autoimmune'
    };
    condLabels.forEach(c => {
      if (condMap[c]) factors.push({ key: condMap[c], ...lifeFactors[condMap[c]] });
    });
  }

  // Healthcare
  const hcMap = { regular: 'healthcare_regular', occasional: 'healthcare_occasional', rarely: 'healthcare_rarely', never: 'healthcare_never' };
  if (a.healthcare && hcMap[a.healthcare]) factors.push({ key: hcMap[a.healthcare], ...lifeFactors[hcMap[a.healthcare]] });

  // Air quality
  const aqMap = { good: 'air_good', moderate: 'air_moderate', poor: 'air_poor' };
  if (a.air_quality && aqMap[a.air_quality]) factors.push({ key: aqMap[a.air_quality], ...lifeFactors[aqMap[a.air_quality]] });

  // Occupation
  const occMap = { sedentary: 'occ_sedentary', moderate: 'occ_moderate', physical: 'occ_physical', hazardous: 'occ_hazardous' };
  if (a.occupation && occMap[a.occupation]) factors.push({ key: occMap[a.occupation], ...lifeFactors[occMap[a.occupation]] });

  // Sports
  const sportMap = { tennis: 'sport_tennis', badminton: 'sport_badminton', soccer: 'sport_soccer', cycling: 'sport_cycling', swimming: 'sport_swimming', running: 'sport_running', gym: 'sport_gym', none: 'sport_none' };
  if (a.sport && sportMap[a.sport]) factors.push({ key: sportMap[a.sport], ...lifeFactors[sportMap[a.sport]] });

  // Vegetarian/Vegan diet
  const vegMap = { vegan: 'veg_vegan', vegetarian: 'veg_vegetarian', pescatarian: 'veg_pescatarian', flexitarian: 'veg_flexitarian', omnivore: 'veg_omnivore' };
  if (a.veg_diet && vegMap[a.veg_diet]) factors.push({ key: vegMap[a.veg_diet], ...lifeFactors[vegMap[a.veg_diet]] });

  // Processed food
  const upfMap = { minimal: 'upf_minimal', low: 'upf_low', moderate: 'upf_moderate', high: 'upf_high', very_high: 'upf_very_high' };
  if (a.processed_food && upfMap[a.processed_food]) factors.push({ key: upfMap[a.processed_food], ...lifeFactors[upfMap[a.processed_food]] });

  // Blood pressure
  const bpMap = { normal: 'bp_normal', elevated: 'bp_elevated', high_1: 'bp_high_1', high_2: 'bp_high_2', unknown: 'bp_unknown' };
  if (a.blood_pressure && bpMap[a.blood_pressure]) factors.push({ key: bpMap[a.blood_pressure], ...lifeFactors[bpMap[a.blood_pressure]] });

  // Resting heart rate
  const rhrMap = { low: 'rhr_low', normal: 'rhr_normal', elevated: 'rhr_elevated', high: 'rhr_high', unknown: 'rhr_unknown' };
  if (a.resting_hr && rhrMap[a.resting_hr]) factors.push({ key: rhrMap[a.resting_hr], ...lifeFactors[rhrMap[a.resting_hr]] });

  // Coffee
  const coffeeMap = { moderate: 'coffee_moderate', light: 'coffee_light', heavy: 'coffee_heavy', none: 'coffee_none' };
  if (a.coffee && coffeeMap[a.coffee]) factors.push({ key: coffeeMap[a.coffee], ...lifeFactors[coffeeMap[a.coffee]] });

  // Hydration
  const hydrationMap = { good: 'hydration_good', moderate: 'hydration_moderate', poor: 'hydration_poor' };
  if (a.hydration && hydrationMap[a.hydration]) factors.push({ key: hydrationMap[a.hydration], ...lifeFactors[hydrationMap[a.hydration]] });

  // Dental
  const dentalMap = { excellent: 'dental_excellent', good: 'dental_good', poor: 'dental_poor' };
  if (a.dental && dentalMap[a.dental]) factors.push({ key: dentalMap[a.dental], ...lifeFactors[dentalMap[a.dental]] });

  // Sauna
  const saunaMap = { frequent: 'sauna_frequent', moderate: 'sauna_moderate', rare: 'sauna_rare', never: 'sauna_never' };
  if (a.sauna && saunaMap[a.sauna]) factors.push({ key: saunaMap[a.sauna], ...lifeFactors[saunaMap[a.sauna]] });

  // Screen time
  const screenMap = { low: 'screen_low', moderate: 'screen_moderate', high: 'screen_high', very_high: 'screen_very_high' };
  if (a.screen_time && screenMap[a.screen_time]) factors.push({ key: screenMap[a.screen_time], ...lifeFactors[screenMap[a.screen_time]] });

  // Nature
  const natureMap = { high: 'nature_high', moderate: 'nature_moderate', low: 'nature_low' };
  if (a.nature && natureMap[a.nature]) factors.push({ key: natureMap[a.nature], ...lifeFactors[natureMap[a.nature]] });

  // Education
  const eduMap = { postgrad: 'edu_postgrad', bachelors: 'edu_bachelors', some_college: 'edu_some_college', high_school: 'edu_high_school', less: 'edu_less' };
  if (a.education && eduMap[a.education]) factors.push({ key: eduMap[a.education], ...lifeFactors[eduMap[a.education]] });

  // Income
  const incomeMap = { high: 'income_high', middle: 'income_middle', low: 'income_low' };
  if (a.income && incomeMap[a.income]) factors.push({ key: incomeMap[a.income], ...lifeFactors[incomeMap[a.income]] });

  // Gratitude
  const gratMap = { high: 'gratitude_high', moderate: 'gratitude_moderate', low: 'gratitude_low' };
  if (a.gratitude && gratMap[a.gratitude]) factors.push({ key: gratMap[a.gratitude], ...lifeFactors[gratMap[a.gratitude]] });

  // Volunteering
  const volMap = { regular: 'volunteer_regular', occasional: 'volunteer_occasional', none: 'volunteer_none' };
  if (a.volunteering && volMap[a.volunteering]) factors.push({ key: volMap[a.volunteering], ...lifeFactors[volMap[a.volunteering]] });

  // Religion
  const relMap2 = { weekly: 'religion_weekly', occasional: 'religion_occasional', none: 'religion_none' };
  if (a.religion && relMap2[a.religion]) factors.push({ key: relMap2[a.religion], ...lifeFactors[relMap2[a.religion]] });

  // Omega-3
  const o3Map = { high: 'omega3_high', moderate: 'omega3_moderate', low: 'omega3_low' };
  if (a.omega3 && o3Map[a.omega3]) factors.push({ key: o3Map[a.omega3], ...lifeFactors[o3Map[a.omega3]] });

  // Pet
  const petMap = { dog: 'pet_dog', cat: 'pet_cat', other: 'pet_other', none: 'pet_none' };
  if (a.pet && petMap[a.pet]) factors.push({ key: petMap[a.pet], ...lifeFactors[petMap[a.pet]] });

  // Family history (parents)
  const p1 = a.parent1_age || 0;
  const p2 = a.parent2_age || 0;
  const avgParent = (p1 && p2) ? (p1 + p2) / 2 : (p1 || p2);
  if (avgParent) {
    let famKey;
    if (avgParent >= 80) famKey = 'family_longevity';
    else if (avgParent >= 65) famKey = 'family_average';
    else famKey = 'family_early_death';
    factors.push({ key: famKey, ...lifeFactors[famKey] });
  }

  // Family history (grandparents bonus)
  const gp1 = a.grandparent1_age || 0;
  const gp2 = a.grandparent2_age || 0;
  const avgGP = (gp1 && gp2) ? (gp1 + gp2) / 2 : (gp1 || gp2);
  if (avgGP >= 90) {
    factors.push({ key: 'gp_longevity', impact: 3, label: 'Grandparent longevity (90+)', tip: 'Exceptional family genetics. Longevity genes often pass through generations.', cat: 'genetics' });
  } else if (avgGP >= 80) {
    factors.push({ key: 'gp_good', impact: 1, label: 'Grandparent longevity (80+)', tip: 'Good genetic baseline from grandparents.', cat: 'genetics' });
  } else if (avgGP > 0 && avgGP < 65) {
    factors.push({ key: 'gp_early', impact: -1, label: 'Grandparent early death (<65)', tip: 'Family history flag. Proactive screening is extra important.', cat: 'genetics' });
  }

  // ===== CATEGORY CAPS (prevent absurd stacking) =====
  function capCategory(factorList, cap) {
    const total = factorList.reduce((s,f) => s + f.impact, 0);
    if (Math.abs(total) > cap) {
      const scale = cap / Math.abs(total);
      factorList.forEach(f => f.impact = Math.round(f.impact * scale * 10) / 10);
    }
  }

  // Diet: diet + veg_diet + processed food + coffee + omega3 (max +5 / -6)
  const dietFactors = factors.filter(f => ['diet_very_healthy','diet_healthy','diet_average','diet_poor',
    'veg_vegan','veg_vegetarian','veg_pescatarian','veg_flexitarian','veg_omnivore',
    'upf_minimal','upf_low','upf_moderate','upf_high','upf_very_high',
    'coffee_moderate','coffee_light','coffee_heavy','coffee_none',
    'omega3_high','omega3_moderate','omega3_low'].includes(f.key));
  capCategory(dietFactors, 5);

  // Fitness: exercise + sport + sauna (max +6 / -5)
  const fitFactors = factors.filter(f => f.key && (f.key.startsWith('exercise_') || f.key.startsWith('sport_') || f.key.startsWith('sauna_')));
  capCategory(fitFactors, 6);

  // Social: social + relationship + education + income + religion + volunteering + pet (max +8 / -8)
  const socialFactors = factors.filter(f => ['social_strong','social_moderate','social_few','social_isolated',
    'rel_married','rel_partnered','rel_single','rel_divorced',
    'edu_postgrad','edu_bachelors','edu_some_college','edu_high_school','edu_less',
    'income_high','income_middle','income_low',
    'religion_weekly','religion_occasional','religion_none',
    'volunteer_regular','volunteer_occasional','volunteer_none',
    'pet_dog','pet_cat','pet_other','pet_none'].includes(f.key));
  capCategory(socialFactors, 8);

  // Mental: stress + stress_mgmt + gratitude (max +4 / -5)
  const mentalFactors = factors.filter(f => ['stress_low','stress_moderate','stress_high','stress_very_high',
    'stress_mgmt_yes','stress_mgmt_no','gratitude_high','gratitude_moderate','gratitude_low'].includes(f.key));
  capCategory(mentalFactors, 4);

  // Body: BMI + hydration + dental (max +3 / -7)
  const bodyFactors = factors.filter(f => f.key && (f.key.startsWith('bmi_') || f.key.startsWith('hydration_') || f.key.startsWith('dental_')));
  const bodyTotal = bodyFactors.reduce((s,f) => s + f.impact, 0);
  if (bodyTotal > 3) capCategory(bodyFactors, 3);
  else if (bodyTotal < -7) capCategory(bodyFactors, 7);

  // Genetics: family + grandparent (max +4 / -4)
  const geneticFactors = factors.filter(f => ['family_longevity','family_average','family_early_death','gp_longevity','gp_good','gp_early'].includes(f.key));
  capCategory(geneticFactors, 4);

  // Environment: air + occupation + nature + screen (max +3 / -5)
  const envFactors = factors.filter(f => ['air_good','air_moderate','air_poor',
    'occ_sedentary','occ_moderate','occ_physical','occ_hazardous',
    'nature_high','nature_moderate','nature_low',
    'screen_low','screen_moderate','screen_high','screen_very_high'].includes(f.key));
  const envTotal = envFactors.reduce((s,f) => s + f.impact, 0);
  if (envTotal > 3) capCategory(envFactors, 3);
  else if (envTotal < -5) capCategory(envFactors, 5);

  // ===== DIMINISHING RETURNS on positives =====
  const rawTotal = factors.reduce((sum, f) => sum + f.impact, 0);
  let totalAdjust;
  if (rawTotal > 0) {
    // Diminishing returns: sqrt curve scaled so +18 raw = +18, +36 raw = +13.5 effective
    // Formula: min(18, sqrt(rawTotal) * 4.25)
    totalAdjust = Math.min(18, Math.sqrt(rawTotal) * 4.25);
  } else {
    // Negatives hit harder (no diminishing returns, just cap)
    totalAdjust = Math.max(-30, rawTotal);
  }

  const cappedAdjust = Math.max(-30, Math.min(18, totalAdjust));
  const adjustedLE = baseLE + cappedAdjust;
  const remainingYears = Math.max(0.5, adjustedLE - age);
  if (isNaN(remainingYears) || isNaN(adjustedLE)) {
    showToast('Could not calculate. Please check your date of birth.');
    return;
  }
  const deathDate = new Date(now.getTime() + remainingYears * 365.25 * 24 * 60 * 60 * 1000);

  // Life score (0-100)
  const maxPossible = 18; // realistic best case after caps
  const minPossible = -30; // realistic worst case
  const lifeScore = Math.round(Math.max(0, Math.min(100, ((totalAdjust - minPossible) / (maxPossible - minPossible)) * 100)));

  state.result = {
    dob, age: Math.floor(age), sex, baseLE, totalAdjust,
    adjustedLE: adjustedLE.toFixed(1), remainingYears: remainingYears.toFixed(1),
    expectedAge: parseFloat(adjustedLE.toFixed(1)),
    ageNow: Math.floor(age),
    deathDate, lifeScore, factors: factors.sort((a, b) => a.impact - b.impact)
  };

  // Show nav items
  document.getElementById('navDash').classList.remove('hidden');
  document.getElementById('navPrice').classList.remove('hidden');
  document.getElementById('navCta').textContent = 'Recalculate';

  // Track quiz completion date for staleness nudge
  localStorage.setItem('dc_last_quiz_date', new Date().toISOString());

  renderResult();
  // Run daily evolution
  evolveGhost();
  // Auto-save after calculation
  DataStore.save();
  saveInitialDeathy();
}

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

// ===== TIME-SPENT VISUALISATION =====
function renderTimeSpentViz() {
  const r = state.result;
  const a = state.answers;
  if (!r) return;
  const container = document.getElementById('timeSpentViz');
  if (!container) return;

  const remaining = parseFloat(r.remainingYears);
  if (!remaining || remaining <= 0) return;

  // Calculate time allocations based on user answers
  const sleepHrsPerDay = a.sleep_hours === 'short' ? 5 : a.sleep_hours === 'moderate_short' ? 6.5 : a.sleep_hours === 'long' ? 9.5 : 7.5;
  const sleepFraction = sleepHrsPerDay / 24;

  const screenHrsPerDay = a.screen_time === 'very_high' ? 7 : a.screen_time === 'high' ? 5 : a.screen_time === 'moderate' ? 3 : 1.5;
  const screenFraction = screenHrsPerDay / 24;

  const workHrsPerDay = a.occupation === 'sedentary' ? 8.5 : a.occupation === 'physical' ? 9 : a.occupation === 'hazardous' ? 10 : 7.5;
  // Assume retirement at 65, scale work years
  const workYearsLeft = Math.max(0, Math.min(remaining, 65 - r.ageNow));
  const workFraction = (workHrsPerDay / 24) * (workYearsLeft / remaining);

  const exerciseHrsPerWeek = a.exercise === '5+' ? 7 : a.exercise === '3-4x' ? 4 : a.exercise === '1-2x' ? 1.5 : 0.5;
  const exerciseFraction = (exerciseHrsPerWeek / 7) / 24;

  const eatingHrsPerDay = a.diet === 'very_healthy' ? 2 : a.diet === 'poor' ? 1 : 1.5;
  const eatingFraction = eatingHrsPerDay / 24;

  const commuteHrsPerDay = a.occupation === 'sedentary' ? 1 : 0.5;
  const commuteFraction = (commuteHrsPerDay / 24) * (workYearsLeft / remaining);

  // Build allocations
  const allocations = [
    { label: 'Sleeping', emoji: '😴', fraction: sleepFraction, color: '#6366f1' },
    { label: 'Working', emoji: '💼', fraction: workFraction, color: '#f59e0b' },
    { label: 'Screens', emoji: '📱', fraction: screenFraction, color: '#ef4444' },
    { label: 'Eating', emoji: '🍽️', fraction: eatingFraction, color: '#10b981' },
    { label: 'Exercise', emoji: '🏃', fraction: exerciseFraction, color: '#06b6d4' },
    { label: 'Commuting', emoji: '🚗', fraction: commuteFraction, color: '#8b5cf6' }
  ];

  // Calculate "free time" as remainder
  const usedFraction = allocations.reduce((s, a) => s + a.fraction, 0);
  const freeFraction = Math.max(0, 1 - usedFraction);
  allocations.push({ label: 'Free Time', emoji: '✨', fraction: freeFraction, color: '#22c55e' });

  // Convert to years, months, weeks
  let html = '<div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:24px;">';
  html += '<h3 style="margin-bottom:4px; font-size:1.2rem; text-align:center;">How You Will Spend Your Remaining Time</h3>';
  html += '<p style="color:var(--text3); font-size:0.8rem; text-align:center; margin-bottom:20px;">Based on your habits. ' + remaining.toFixed(1) + ' years = ' + Math.round(remaining * 12) + ' months = ' + Math.round(remaining * 52.14) + ' weeks</p>';

  // Stacked bar
  html += '<div style="display:flex; border-radius:8px; overflow:hidden; height:32px; margin-bottom:20px;">';
  allocations.forEach(al => {
    const pct = (al.fraction * 100).toFixed(1);
    if (parseFloat(pct) < 1) return;
    html += '<div style="width:' + pct + '%; background:' + al.color + '; display:flex; align-items:center; justify-content:center; font-size:0.65rem; color:#fff; font-weight:600; min-width:20px;" title="' + al.label + ': ' + pct + '%">' + al.emoji + '</div>';
  });
  html += '</div>';

  // Detail rows
  html += '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:8px;">';
  allocations.forEach(al => {
    const years = (remaining * al.fraction).toFixed(1);
    const months = Math.round(remaining * al.fraction * 12);
    const weeks = Math.round(remaining * al.fraction * 52.14);
    if (parseFloat(years) < 0.1) return;
    html += '<div style="display:flex; align-items:center; gap:8px; padding:8px 12px; background:var(--bg); border-radius:8px; border-left:3px solid ' + al.color + ';">';
    html += '<span style="font-size:1.2rem;">' + al.emoji + '</span>';
    html += '<div>';
    html += '<div style="font-size:0.8rem; font-weight:600;">' + al.label + '</div>';
    html += '<div style="font-size:0.7rem; color:var(--text2);">' + years + ' yrs / ' + months + ' mo / ' + weeks + ' wks</div>';
    html += '</div></div>';
  });
  html += '</div>';

  // Motivational nudge
  const screenYears = (remaining * screenFraction).toFixed(1);
  const exerciseYears = (remaining * exerciseFraction).toFixed(1);
  html += '<div style="margin-top:16px; padding:12px; background:rgba(233,69,96,0.08); border:1px solid var(--accent); border-radius:8px; text-align:center;">';
  html += '<p style="font-size:0.85rem; color:var(--text); margin:0;">';
  if (parseFloat(screenYears) > parseFloat(exerciseYears) * 3) {
    html += '📱 You will spend <strong>' + screenYears + ' years</strong> on screens but only <strong>' + exerciseYears + ' years</strong> exercising. That is a ' + Math.round(parseFloat(screenYears) / Math.max(0.1, parseFloat(exerciseYears))) + ':1 ratio. Is that the life you want?';
  } else {
    html += '💪 Your exercise-to-screen ratio is solid. Keep it up and you will outlive most of your friends.';
  }
  html += '</p></div>';
  html += '</div>';
  container.innerHTML = html;
}

function renderResultGhost() {
  const params = getDeathyParams();
  const hScore = calcDeathyHealth(params);
  const g = state.longevityGoal;
  const totalScore = Math.min(100, hScore + Math.min(20, ((g && g.totalDaysAdded)||0)*0.5));
  const ghostColor = totalScore >= 70 ? '#4ecca3' : totalScore >= 40 ? '#f0c040' : '#e94560';
  const eyeStyle = totalScore >= 70 ? 'happy' : totalScore >= 40 ? 'neutral' : 'sad';
  const commentary = getHabitCommentary();

  // Same SVG as timer bar ghost but bigger, with accessories
  const accessories = getGhostAccessories();
  const animClass = getGhostAnimClass(totalScore, {});
  const ghostSvg = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="50" cy="90" rx="22" ry="4" fill="rgba(255,255,255,0.05)"/>' +
    '<path d="M25,55 Q25,15 50,15 Q75,15 75,55 L75,75 Q70,70 65,75 Q60,70 55,75 Q50,70 45,75 Q40,70 35,75 Q30,70 25,75 Z" fill="' + ghostColor + '" opacity="0.9"/>' +
    (eyeStyle === 'happy' ?
      '<circle cx="38" cy="42" r="4" fill="#0a0a0f"/><circle cx="62" cy="42" r="4" fill="#0a0a0f"/><path d="M38,52 Q50,62 62,52" stroke="#0a0a0f" stroke-width="2.5" fill="none" stroke-linecap="round"/>' :
      eyeStyle === 'neutral' ?
      '<circle cx="38" cy="42" r="4" fill="#0a0a0f"/><circle cx="62" cy="42" r="4" fill="#0a0a0f"/><line x1="40" y1="55" x2="60" y2="55" stroke="#0a0a0f" stroke-width="2.5" stroke-linecap="round"/>' :
      '<circle cx="38" cy="44" r="4" fill="#0a0a0f"/><circle cx="62" cy="44" r="4" fill="#0a0a0f"/><path d="M38,58 Q50,50 62,58" stroke="#0a0a0f" stroke-width="2.5" fill="none" stroke-linecap="round"/>') +
    '<circle cx="40" cy="40" r="1.5" fill="rgba(255,255,255,0.7)"/>' +
    accessories +
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
    '<div id="resultGhostSvg" style="width:160px; height:192px; margin:0 auto; animation:' + animClass + '; cursor:pointer;" onclick="cycleResultGhostMsg()">' +
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

function renderResult() {
  const r = state.result;
  const dd = r.deathDate;
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dateStr = `${months[dd.getMonth()]} ${dd.getDate()}, ${dd.getFullYear()}`;

  const negFactors = r.factors.filter(f => f.impact < 0).slice(0, 5);
  const posFactors = r.factors.filter(f => f.impact > 0).sort((a,b) => b.impact - a.impact).slice(0, 5);

  let scoreColor = r.lifeScore > 70 ? 'var(--green)' : r.lifeScore > 40 ? 'var(--gold)' : 'var(--accent)';

  let html = `
    <h2 style="font-size:1.2rem; color:var(--text3); margin-bottom:8px;">Your estimated death date</h2>
    <div class="death-date-reveal">
      <div class="death-date-label">You will die on</div>
      <div class="death-date">${dateStr}</div>
      <div style="color:var(--text2)">That is approximately <strong>${r.remainingYears} years</strong> from today</div>
      <div style="margin:24px 0 8px; padding:20px 12px; background:rgba(255,0,0,0.05); border:1px solid rgba(255,0,0,0.15); border-radius:12px;">
        <div style="text-align:center; color:var(--accent); font-size:0.75rem; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px;">Time Remaining</div>
        <div class="countdown" id="countdown" style="font-size:1.1rem;"></div>
        <div style="text-align:center; margin-top:8px; color:var(--text3); font-size:0.7rem;">Every second counts. Make them matter.</div>
      </div>
      <div id="lifeVisContainer" style="margin:24px auto; max-width:400px;"></div>
      <div style="margin-top:12px;">
        <button class="btn-secondary btn-sm" onclick="saveTimerWidget()" style="font-size:0.8rem;">Save Timer as Widget</button>
      </div>
      <div class="life-score-circle" style="border-color:${scoreColor}">
        <div class="life-score-num" style="color:${scoreColor}">${r.lifeScore}</div>
        <div class="life-score-label">Life Score</div>
      </div>
      <div style="color:var(--text3); font-size:0.85rem">Based on ${r.factors.length} analyzed factors</div>
    </div>

    <!-- ===== ACTION HUB ===== -->
    <div style="margin-top:32px; padding:24px; background:linear-gradient(135deg, var(--surface) 0%, var(--bg2) 100%); border:1px solid var(--border); border-radius:16px;">
      <h3 style="text-align:center; margin-bottom:4px; font-size:1.1rem; color:var(--text);">What Now?</h3>
      <p style="text-align:center; color:var(--text3); font-size:0.8rem; margin-bottom:16px;">You've got ${r.remainingYears} years. Make them count.</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <button onclick="showPage('dashboard'); setTimeout(()=>showTab('myplan'),100);" style="display:flex; flex-direction:column; align-items:center; gap:6px; padding:16px 12px; background:var(--green)15; border:2px solid var(--green); border-radius:12px; cursor:pointer; transition:transform 0.15s;">
          <span style="font-size:1.5rem;">🎯</span>
          <span style="font-size:0.9rem; font-weight:700; color:var(--green);">Start My Plan</span>
          <span style="font-size:0.7rem; color:var(--text3);">Daily habits to push back your death date</span>
        </button>
        <button onclick="challengeAFriend()" style="display:flex; flex-direction:column; align-items:center; gap:6px; padding:16px 12px; background:#ff6b6b15; border:2px solid #ff6b6b; border-radius:12px; cursor:pointer; transition:transform 0.15s;">
          <span style="font-size:1.5rem;">⚔️</span>
          <span style="font-size:0.9rem; font-weight:700; color:#ff6b6b;">Challenge a Friend</span>
          <span style="font-size:0.7rem; color:var(--text3);">Compare death dates. Loser buys dinner.</span>
        </button>
        <button onclick="document.getElementById('productRecsSection')?.scrollIntoView({behavior:'smooth'})" style="display:flex; flex-direction:column; align-items:center; gap:6px; padding:16px 12px; background:var(--gold)15; border:2px solid var(--gold); border-radius:12px; cursor:pointer; transition:transform 0.15s;">
          <span style="font-size:1.5rem;">🛒</span>
          <span style="font-size:0.9rem; font-weight:700; color:var(--gold);">Shop Fixes</span>
          <span style="font-size:0.7rem; color:var(--text3);">Products matched to your worst factors</span>
        </button>
        <button onclick="showPage('quiz'); state.currentQuestion=0; renderQuestion();" style="display:flex; flex-direction:column; align-items:center; gap:6px; padding:16px 12px; background:#54a0ff15; border:2px solid #54a0ff; border-radius:12px; cursor:pointer; transition:transform 0.15s;">
          <span style="font-size:1.5rem;">🔄</span>
          <span style="font-size:0.9rem; font-weight:700; color:#54a0ff;">Retake Quiz</span>
          <span style="font-size:0.7rem; color:var(--text3);">Lifestyle changed? Update your score.</span>
        </button>
      </div>
    </div>

    <!-- MEET YOUR DEATHY -->
    <div style="margin-top:32px; text-align:center;">
      <h3 style="color:var(--accent); margin-bottom:4px; font-size:1.3rem;">Meet Your Ghost</h3>
      <p style="color:var(--text2); font-size:0.9rem; margin-bottom:8px;">This is <strong style="color:var(--gold)">${generateDeathyName()}</strong>. Your personal afterlife companion. They look like you... statistically speaking.</p>
    </div>
    <div id="deathyResult">${renderResultGhost()}</div>

    <h3 style="margin:40px 0 16px; font-size:1.3rem">Your Life Factors</h3>
    <div class="factors-grid">
      <div>
        <h4 style="color:var(--accent); margin-bottom:12px;">Reducing Your Lifespan</h4>
        ${negFactors.length === 0 ? '<p style="color:var(--text3)">No major negative factors detected!</p>' :
          negFactors.map(f => {
            const matchedProduct = (typeof products !== 'undefined' ? products : []).find(p => p.category && f.label.toLowerCase().includes(p.category.toLowerCase()));
            const productHtml = matchedProduct ? `<a href="${matchedProduct.url}" target="_blank" rel="noopener" onclick="trackProductClick&&trackProductClick('${matchedProduct.name}')" style="display:inline-flex; align-items:center; gap:4px; margin-top:6px; padding:4px 10px; background:var(--gold)15; border:1px solid var(--gold); border-radius:6px; font-size:0.7rem; color:var(--gold); text-decoration:none; font-weight:600;">🛒 Fix this</a>` : '';
            return `
            <div class="factor-card negative">
              <div class="factor-impact negative">${f.impact} years</div>
              <div class="factor-name">${f.label}</div>
              <div class="factor-tip">${f.tip}</div>
              ${productHtml}
            </div>
          `}).join('')}
      </div>
      <div>
        <h4 style="color:var(--green); margin-bottom:12px;">Extending Your Lifespan</h4>
        ${posFactors.length === 0 ? '<p style="color:var(--text3)">No positive factors detected. Time for changes!</p>' :
          posFactors.map(f => `
            <div class="factor-card positive">
              <div class="factor-impact positive">+${f.impact} years</div>
              <div class="factor-name">${f.label}</div>
              <div class="factor-tip">${f.tip}</div>
            </div>
          `).join('')}
      </div>
    </div>

    <!-- TIME-SPENT VISUALISATION -->
    <div id="timeSpentViz" style="margin-top:48px;"></div>

    <!-- SHARE YOUR RESULT -->
    <div class="share-card" style="margin-top:48px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:24px; text-align:center;">
      <h3 style="color:var(--accent); margin-bottom:8px;">Share Your Death Date</h3>
      <p style="color:var(--text2); margin-bottom:16px; font-size:0.9rem;">Challenge your friends. Who dies first wins. (Wait, that's not right...)</p>
      <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
        <button class="btn-sm" onclick="shareResult('twitter')" style="background:#1DA1F2; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;">Twitter/X</button>
        <button class="btn-sm" onclick="shareResult('whatsapp')" style="background:#25D366; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;">WhatsApp</button>
        <button class="btn-sm" onclick="shareResult('facebook')" style="background:#4267B2; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;">Facebook</button>
        <button class="btn-sm" onclick="shareResult('linkedin')" style="background:#0077B5; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;">LinkedIn</button>
        <button class="btn-sm share-btn-copy" onclick="shareResult('copy')" style="background:var(--surface2); color:var(--text); border:1px solid var(--border); padding:8px 16px; border-radius:6px; cursor:pointer;">Copy</button>
      </div>
    </div>

    <!-- PRODUCT RECOMMENDATIONS -->
    <div id="productRecsSection">${renderProductRecs()}</div>

    <!-- SOCIAL CIRCLE -->
    <div id="socialCircle"></div>

    <div id="clinicalTests" style="margin-top:48px;"></div>
    <div id="leaderboard" style="max-width:700px; margin:0 auto;"></div>

    <!-- EMAIL CAPTURE -->
    <div id="emailCaptureSection" class="email-capture" style="margin-top:48px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:24px;">
      <h3 style="margin-bottom:4px;">Get Your Death Updates</h3>
      <p style="color:var(--text2); font-size:0.9rem; margin-bottom:16px;">Weekly life score reports. Milestone alerts when you add a full day. Dark humor tips to keep you alive longer.</p>
      <div style="display:flex; gap:8px; max-width:480px; margin:0 auto 12px;">
        <input type="email" id="emailCaptureInput" placeholder="your@email.com" style="flex:1; padding:12px; border-radius:8px; border:1px solid var(--border); background:var(--bg); color:var(--text); font-size:1rem;">
        <button class="btn-primary" onclick="captureEmail()">Subscribe</button>
      </div>
      <div style="display:flex; gap:16px; justify-content:center; flex-wrap:wrap; font-size:0.8rem; color:var(--text3);">
        <label><input type="checkbox" id="emailPrefWeekly" checked> Weekly death report</label>
        <label><input type="checkbox" id="emailPrefMilestone" checked> Milestone alerts</label>
        <label><input type="checkbox" id="emailPrefTips" checked> Survival tips</label>
      </div>
    </div>
    ${localStorage.getItem('dc_user_email') ? '' : ''}

    <!-- GHOST ACTIONS -->
    <div style="margin-top:24px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
      <button class="btn-primary btn-sm" onclick="shareGhostCard()" style="font-size:0.85rem;">📸 Share Your Ghost</button>
      <button class="btn-secondary btn-sm" onclick="showEmbedCode()" style="font-size:0.85rem;">📋 Embed Widget</button>
      <button class="btn-secondary btn-sm" onclick="showEmailDigestPreview()" style="font-size:0.85rem;">📧 Preview Weekly Digest</button>
    </div>

    <!-- NOTIFICATION OPT-IN -->
    <div style="margin-top:16px; text-align:center;">
      <button class="btn-sm" onclick="requestNotificationPermission()" style="background:var(--surface); border:1px solid var(--border); color:var(--text2); padding:8px 16px; border-radius:8px; font-size:0.8rem; cursor:pointer;">
        🔔 Enable Deathy Notifications
      </button>
      <div style="font-size:0.7rem; color:var(--text3); margin-top:4px;">Get haunted when you forget to log habits</div>
    </div>

    <!-- BEFORE/AFTER -->
    <div id="beforeAfterSlider">${renderBeforeAfter()}</div>

    <!-- DEATH POOL -->
    <div id="deathPoolSection">${renderDeathPool()}</div>

    <!-- GHOST GRAVEYARD -->
    ${renderGraveyard()}

    <!-- REFERRAL -->
    ${renderReferralCard()}

    <!-- BOTTOM ACTION BAR -->
    <div style="margin-top:48px; padding:20px; background:var(--surface); border:1px solid var(--border); border-radius:12px; text-align:center;">
      <p style="color:var(--text2); font-size:0.85rem; margin-bottom:12px;">Ready to fight back?</p>
      <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
        <button class="btn-green" onclick="showPage('dashboard'); setTimeout(()=>showTab('myplan'),100);" style="font-size:1rem; padding:12px 24px;">🎯 My Plan</button>
        <button class="btn-primary" onclick="challengeAFriend()" style="font-size:1rem; padding:12px 24px;">⚔️ Challenge Friends</button>
        <button class="btn-secondary" onclick="saveProfile()">💾 Save Profile</button>
      </div>
    </div>

    <p style="color:var(--text3); font-size:0.8rem; margin-top:32px;">
      This is an estimate based on statistical averages from published research. Individual results vary. This is not medical advice.
    </p>
  `;

  document.getElementById('resultContent').innerHTML = html;
  showPage('result');
  startCountdown();
  renderTimeSpentViz();
  animateLifeCanvas();
  creditReferrer();
  renderClinicalTests();
  document.getElementById('leaderboard').innerHTML = renderLeaderboard();
  document.getElementById('socialCircle').innerHTML = renderSocialCircle();
  saveInitialDeathy(); // Save first ghost for before/after
  if (localStorage.getItem('dc_notif_enabled') === 'true') scheduleDeathyReminder();
  // Auto-fill email if already captured
  const savedEmail = localStorage.getItem('dc_user_email');
  if (savedEmail) {
    const sec = document.getElementById('emailCaptureSection');
    if (sec) sec.innerHTML = '<div style="text-align:center; padding:20px; color:var(--green);"><strong>&#10003; Locked in.</strong> Death updates going to ' + escHtml(savedEmail) + '</div>';
  }
}

function startCountdown() {
  if (!state.result) return;
  function update() {
    const el = document.getElementById('countdown');
    if (!el) return;
    const now = new Date();
    const diff = state.result.deathDate - now;
    if (diff <= 0) { el.innerHTML = '<div style="color:var(--accent)">Time is up. Live now.</div>'; return; }
    const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    const months = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
    const days = Math.floor((diff % (30.44 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    const secs = Math.floor((diff % (60 * 1000)) / 1000);
    el.innerHTML = [
      { n: years, l: 'Years' }, { n: months, l: 'Months' }, { n: days, l: 'Days' },
      { n: hours, l: 'Hours' }, { n: mins, l: 'Min' }, { n: secs, l: 'Sec' }
    ].map(u => `<div class="countdown-unit"><div class="countdown-num" style="font-size:1.8rem; font-weight:800; color:var(--accent); line-height:1;">${u.n}</div><div class="countdown-label" style="font-size:0.6rem; text-transform:uppercase; letter-spacing:1px; color:var(--text3); margin-top:4px;">${u.l}</div></div>`).join('');
  }
  update();
  setInterval(update, 1000);
}

function getRecommendedTests(r) {
  const age = r.ageNow || 30;
  const a = state.answers;
  const tests = [];

  // Universal tests
  tests.push({ name: 'Complete Blood Count (CBC)', why: 'Baseline health marker. Detects anaemia, infection, blood disorders.', priority: 'important', frequency: '1-2 years' });
  tests.push({ name: 'Comprehensive Metabolic Panel', why: 'Kidney function, liver function, blood glucose, electrolytes.', priority: 'important', frequency: '1 year' });
  tests.push({ name: 'Lipid Panel (Cholesterol)', why: 'Heart disease risk. Total cholesterol, HDL, LDL, triglycerides.', priority: 'important', frequency: '1 year' });

  // Age-based
  if (age >= 40) {
    tests.push({ name: 'HbA1c (Diabetes Screening)', why: 'Pre-diabetes detection. Catches insulin resistance before diabetes develops.', priority: 'critical', frequency: '1 year' });
    tests.push({ name: 'Coronary Calcium Score (CT)', why: 'Gold standard for heart attack risk prediction after 40.', priority: 'important', frequency: '3-5 years' });
  }
  if (age >= 45) {
    tests.push({ name: 'Colonoscopy', why: 'Colorectal cancer screening. Catches polyps before they become cancer.', priority: 'critical', frequency: '10 years' });
  }
  if (age >= 50) {
    tests.push({ name: 'DEXA Bone Density Scan', why: 'Osteoporosis screening. Fractures are a major mortality risk in elderly.', priority: 'important', frequency: '2 years' });
  }

  // Condition-based
  if (a.blood_pressure && ['high_1','high_2'].includes(a.blood_pressure)) {
    tests.push({ name: 'Echocardiogram', why: 'Your blood pressure puts extra strain on your heart. Check for enlargement.', priority: 'critical', frequency: '1-2 years' });
  }
  if (a.smoking && ['current_light','current_heavy'].includes(a.smoking)) {
    tests.push({ name: 'Low-Dose CT Lung Scan', why: 'Lung cancer screening for smokers. Early detection = 80% survival rate.', priority: 'critical', frequency: '1 year' });
  }
  if (a.alcohol === 'heavy') {
    tests.push({ name: 'Liver Function Panel + FibroScan', why: 'Heavy drinking damages the liver. Catch fibrosis before cirrhosis.', priority: 'critical', frequency: '6 months' });
  }
  if (a.stress === 'very_high' || a.stress === 'high') {
    tests.push({ name: 'Cortisol + Thyroid Panel', why: 'Chronic stress disrupts hormones. Thyroid dysfunction is treatable.', priority: 'important', frequency: '1 year' });
  }

  // Advanced biomarkers
  tests.push({ name: 'Vitamin D Level', why: 'Deficiency linked to depression, immune dysfunction, and cancer. 40% of adults are deficient.', priority: 'important', frequency: '1 year' });
  tests.push({ name: 'hs-CRP (Inflammation)', why: 'High-sensitivity C-reactive protein. Chronic inflammation accelerates all diseases of aging.', priority: 'important', frequency: '1 year' });
  tests.push({ name: 'Apolipoprotein B (ApoB)', why: 'Better predictor of heart attack risk than standard cholesterol. The "must-know" biomarker.', priority: 'important', frequency: '1 year' });
  tests.push({ name: 'Fasting Insulin', why: 'Catches insulin resistance 10-15 years before diabetes diagnosis. Prevention window.', priority: 'important', frequency: '1-2 years' });

  return tests;
}

function renderClinicalTests() {
  const r = state.result;
  const el = document.getElementById('clinicalTests');
  if (!el || !r) return;
  const tests = getRecommendedTests(r);
  el.innerHTML = `
    <h3 style="font-size:1.3rem; margin-bottom:16px;">Recommended Clinical Tests &amp; Biomarkers</h3>
    <p style="color:var(--text2); margin-bottom:20px;">Based on your profile, these screenings could catch problems early and add years to your life:</p>
    <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:12px;">
      ${tests.map(t => `
        <div style="background:var(--surface); padding:16px; border-radius:var(--radius); border-left:3px solid ${t.priority === 'critical' ? 'var(--accent)' : t.priority === 'important' ? 'var(--gold)' : 'var(--green)'};">
          <div style="font-weight:700; color:var(--text); margin-bottom:4px;">${t.name}</div>
          <div style="font-size:0.85rem; color:var(--text2); margin-bottom:6px;">${t.why}</div>
          <div style="display:flex; justify-content:space-between; font-size:0.75rem;">
            <span style="color:${t.priority === 'critical' ? 'var(--accent)' : t.priority === 'important' ? 'var(--gold)' : 'var(--green)'};">${t.priority.toUpperCase()}</span>
            <span style="color:var(--text3);">Every ${t.frequency}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function animateLifeCanvas() {
  const el = document.getElementById('lifeVisContainer');
  if (!el || !state.result) return;
  const totalLife = state.result.expectedAge;
  const lived = state.result.ageNow || 30;
  const remaining = Math.max(0, totalLife - lived);
  const pctLived = Math.round((lived / totalLife) * 100);
  const pctRemain = 100 - pctLived;

  const yearsLived = Math.round(lived);
  const yearsLeft = Math.round(remaining);
  const daysLeft = Math.round(remaining * 365.25);
  const hoursLeft = daysLeft * 24;

  el.innerHTML = `
    <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:24px; text-align:center;">
      <div style="font-size:0.85rem; color:var(--text3); margin-bottom:12px; text-transform:uppercase; letter-spacing:1px;">Your Life Timeline</div>
      <div style="display:flex; align-items:center; gap:4px; height:32px; border-radius:16px; overflow:hidden; background:var(--bg); margin-bottom:16px;">
        <div style="height:100%; width:${pctLived}%; background:linear-gradient(90deg,var(--accent),#ff6b6b); display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:700; color:#fff; min-width:${pctLived > 5 ? '0' : '40px'}; border-radius:16px 0 0 16px; transition:width 1s;">${pctLived}%</div>
        <div style="height:100%; width:${pctRemain}%; background:linear-gradient(90deg,#4ecca3,#2d8a6e); display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:700; color:#fff; min-width:${pctRemain > 5 ? '0' : '40px'}; border-radius:0 16px 16px 0; transition:width 1s;">${pctRemain}%</div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">
        <div style="background:rgba(233,69,96,0.1); border:1px solid rgba(233,69,96,0.3); border-radius:10px; padding:14px;">
          <div style="font-size:1.6rem; font-weight:800; color:var(--accent);">${yearsLived}</div>
          <div style="font-size:0.75rem; color:var(--text3);">Years Lived</div>
        </div>
        <div style="background:rgba(78,204,163,0.1); border:1px solid rgba(78,204,163,0.3); border-radius:10px; padding:14px;">
          <div style="font-size:1.6rem; font-weight:800; color:var(--green);">${yearsLeft}</div>
          <div style="font-size:0.75rem; color:var(--text3);">Years Left</div>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div style="background:var(--bg2); border-radius:8px; padding:10px;">
          <div style="font-size:1.1rem; font-weight:700; color:var(--gold);">${daysLeft.toLocaleString()}</div>
          <div style="font-size:0.7rem; color:var(--text3);">Days Remaining</div>
        </div>
        <div style="background:var(--bg2); border-radius:8px; padding:10px;">
          <div style="font-size:1.1rem; font-weight:700; color:var(--gold);">${hoursLeft.toLocaleString()}</div>
          <div style="font-size:0.7rem; color:var(--text3);">Hours Remaining</div>
        </div>
      </div>
      <div style="margin-top:14px; font-size:0.8rem; color:var(--text3);">Every habit you build adds more green to the bar above.</div>
    </div>
  `;
}

function saveTimerWidget() {
  const r = state.result;
  if (!r) return;
  const dd = r.deathDate;
  const widgetHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Death Clock Widget</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;color:#eaeaea;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh}
.w{text-align:center;padding:20px}
.d{font-size:1.8rem;font-weight:800;color:#e94560;margin-bottom:8px}
.c{display:flex;gap:8px;justify-content:center;margin-top:12px}
.u{background:#16213e;padding:8px 6px;border-radius:8px;min-width:50px}
.n{font-size:1.2rem;font-weight:700;color:#4ecca3}
.l{font-size:0.6rem;color:#666680;text-transform:uppercase}
</style></head><body>
<div class="w">
<div style="color:#666680;font-size:0.8rem">Time remaining</div>
<div class="d" id="dd"></div>
<div class="c" id="cd"></div>
</div>
<scr'+'ipt>
const death=new Date(${dd.getTime()});
function u(){const n=new Date(),d=death-n;if(d<=0){document.getElementById("dd").textContent="Live now.";return}
const y=Math.floor(d/(365.25*864e5)),m=Math.floor(d%(365.25*864e5)/(30.44*864e5)),
da=Math.floor(d%(30.44*864e5)/864e5),h=Math.floor(d%864e5/36e5),
mi=Math.floor(d%36e5/6e4),s=Math.floor(d%6e4/1e3);
document.getElementById("cd").innerHTML=[{n:y,l:"YRS"},{n:m,l:"MO"},{n:da,l:"D"},{n:h,l:"HR"},{n:mi,l:"M"},{n:s,l:"S"}]
.map(x=>"<div class=\\"u\\"><div class=\\"n\\">"+x.n+"</div><div class=\\"l\\">"+x.l+"</div></div>").join("")}
u();setInterval(u,1000);
</scr'+'ipt></body></html>`;

  const blob = new Blob([widgetHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'death-clock-widget.html';
  a.click();
  URL.revokeObjectURL(url);
  alert('Widget downloaded! Open death-clock-widget.html in your browser, or use a tool like Widgetsmith (iOS) or KWGT (Android) to add a web widget to your home screen.');
}

const motivationMessages = {
  great: [
    "You absolute legend. Keep it up.",
    "Your future self just high-fived you.",
    "Death is taking notes. And sweating.",
    "If longevity was a sport, you'd be winning.",
    "The Grim Reaper just rescheduled.",
    "You're making centenarians look lazy.",
    "Your cells are literally cheering right now.",
    "Plot twist: you might actually outlive everyone."
  ],
  good: [
    "Not bad! You're doing better than most.",
    "Solid choice. Your organs approve.",
    "Nice. You just bought yourself some time.",
    "The Grim Reaper yawned. You're not interesting yet.",
    "Good job. Your future grandkids thank you.",
    "Decent. But I know you can do better.",
    "That's a respectable answer. Respectable."
  ],
  neutral: [
    "Okay, middle of the road. Not dying fast, not living forever.",
    "You're... average. Is that what you were going for?",
    "Could be worse. Could also be way better.",
    "The universe shrugged at this answer.",
    "Meh. You're not losing years, but not gaining any either.",
    "Perfectly mediocre. Like room temperature water."
  ],
  bad: [
    "Oof. That one hurt your timeline.",
    "The Grim Reaper just smiled.",
    "Well, that's... not ideal. Let's fix it.",
    "Your body just sent you a formal complaint.",
    "Are you sure? Like, really sure?",
    "That answer aged you 3 years just reading it.",
    "Your doctor would like a word."
  ],
  terrible: [
    "Yikes. We need to talk.",
    "The Grim Reaper just added you to speed dial.",
    "At this rate, your countdown timer needs fewer digits.",
    "Okay, so we have some work to do. A lot of work.",
    "Your future self is screaming through a time portal right now.",
    "That's... brave? Reckless? Both?",
    "The good news: there's nowhere to go but up."
  ]
};

function getMotivationCategory(key, value) {
  const greatAnswers = {
    exercise: ['5+'], diet: ['very_healthy'], smoking: ['never'], alcohol: ['never'],
    drugs: ['none'], stress: ['low'], social: ['strong'], sleep_hours: ['optimal'],
    sleep_quality: ['excellent'], healthcare: ['regular'], sport: ['tennis','badminton'],
    veg_diet: ['vegan','vegetarian'], processed_food: ['minimal'], blood_pressure: ['normal'],
    resting_hr: ['low'], coffee: ['moderate'], hydration: ['good'], dental: ['excellent'],
    sauna: ['frequent'], omega3: ['high'], gratitude: ['high'], volunteering: ['regular'],
    religion: ['weekly'], nature: ['high'], screen_time: ['low'], education: ['postgrad'],
    income: ['high'], pet: ['dog']
  };
  const goodAnswers = {
    exercise: ['3-4x'], diet: ['healthy'], smoking: ['former'], alcohol: ['occasional'],
    stress: ['moderate'], social: ['moderate'], sleep_hours: ['moderate_short'],
    sleep_quality: ['good'], healthcare: ['occasional'], sport: ['soccer','cycling','swimming','running'],
    veg_diet: ['pescatarian','flexitarian'], processed_food: ['low'], blood_pressure: ['elevated'],
    resting_hr: ['normal'], coffee: ['light','heavy'], hydration: ['moderate'], dental: ['good'],
    sauna: ['moderate','rare'], omega3: ['moderate'], gratitude: ['moderate'],
    volunteering: ['occasional'], religion: ['occasional'], nature: ['moderate'],
    screen_time: ['moderate'], education: ['bachelors','some_college'], income: ['middle'],
    relationship: ['married','partnered'], pet: ['cat','other'], stress_mgmt: ['yes']
  };
  const terribleAnswers = {
    smoking: ['current_heavy'], drugs: ['opioids'], social: ['isolated'],
    exercise: ['none'], stress: ['very_high'], processed_food: ['very_high'],
    blood_pressure: ['high_2'], resting_hr: ['high'], screen_time: ['very_high'],
    healthcare: ['never'], alcohol: ['heavy']
  };
  const badAnswers = {
    smoking: ['current_light'], drugs: ['recreational','cannabis'], social: ['few'],
    exercise: ['1-2x'], stress: ['high'], diet: ['poor'], sleep_hours: ['short'],
    sleep_quality: ['poor'], processed_food: ['high'], blood_pressure: ['high_1'],
    resting_hr: ['elevated'], hydration: ['poor'], dental: ['poor'], omega3: ['low'],
    nature: ['low'], screen_time: ['high'], education: ['less'], income: ['low'],
    healthcare: ['rarely'], occupation: ['hazardous'], air_quality: ['poor'],
    relationship: ['divorced_widowed'], sleep_hours: ['long']
  };

  if (terribleAnswers[key] && terribleAnswers[key].includes(value)) return 'terrible';
  if (badAnswers[key] && badAnswers[key].includes(value)) return 'bad';
  if (greatAnswers[key] && greatAnswers[key].includes(value)) return 'great';
  if (goodAnswers[key] && goodAnswers[key].includes(value)) return 'good';
  return 'neutral';
}

function showMotivation(key, value) {
  if (['dob','body','conditions','family','country'].includes(key)) return;
  const cat = getMotivationCategory(key, value);
  const msgs = motivationMessages[cat];
  const msg = msgs[Math.floor(Math.random() * msgs.length)];

  const existing = document.querySelector('.motivation-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  let toastClass = cat;
  if (cat === 'terrible') toastClass = 'bad';
  toast.className = 'motivation-toast ' + toastClass;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
}

function getCountryComparison() {
  const r = state.result;
  const a = state.answers;
  const country = a.country || 'United States';
  const sex = a.sex || 'male';
  const countryData = countryLifeExpectancy[country];
  if (!countryData) return null;

  const countryAvg = sex === 'male' ? countryData.m : countryData.f;
  const userLE = parseFloat(r.adjustedLE);
  const diff = userLE - countryAvg;

  const sd = 13;
  const zScore = (userLE - countryAvg) / sd;
  const percentile = Math.round(Math.min(99, Math.max(1, 100 / (1 + Math.exp(-1.7 * zScore)))));

  let verdict, verdictClass;
  if (diff > 10) { verdict = 'You\'re basically immortal compared to your country.'; verdictClass = 'top'; }
  else if (diff > 5) { verdict = 'You\'re aging like fine wine. Death is jealous.'; verdictClass = 'top'; }
  else if (diff > 2) { verdict = 'Above average. Your country is proud of you.'; verdictClass = 'top'; }
  else if (diff > -2) { verdict = 'Right around average. You blend in. Like camouflage.'; verdictClass = 'mid'; }
  else if (diff > -5) { verdict = 'Below average. The Grim Reaper has you bookmarked.'; verdictClass = 'low'; }
  else { verdict = 'Significantly below your country\'s average. Time for a life overhaul.'; verdictClass = 'low'; }

  return { country, countryAvg, userLE, diff, percentile, verdict, verdictClass };
}

function renderLeaderboard() {
  const comp = getCountryComparison();
  if (!comp) return '';

  const pctPosition = comp.percentile;
  const diffSign = comp.diff >= 0 ? '+' : '';

  return `
    <div class="leaderboard">
      <h3>Global Leaderboard</h3>
      <div class="lb-card">
        <div style="display:flex; align-items:center; gap:24px; flex-wrap:wrap;">
          <div>
            <div style="font-size:0.8rem; color:var(--text3); text-transform:uppercase; letter-spacing:1px;">Your Rank in ${comp.country}</div>
            <div class="lb-rank ${comp.verdictClass}">Top ${100 - comp.percentile}%</div>
          </div>
          <div style="flex:1; min-width:200px;">
            <div style="font-size:0.85rem; color:var(--text2); margin-bottom:4px;">
              You outlive <strong style="color:var(--text)">${comp.percentile}%</strong> of ${comp.country === 'United States' ? 'Americans' : comp.country + ' residents'} (${state.answers.sex || 'male'})
            </div>
            <div class="lb-bar">
              <div class="lb-bar-fill" style="width:${comp.percentile}%; background:linear-gradient(90deg, var(--accent), var(--gold), var(--green));"></div>
              <div class="lb-bar-marker" style="left:${comp.percentile}%;"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--text3);">
              <span>Dies youngest</span><span>Lives longest</span>
            </div>
          </div>
        </div>
        <div style="margin-top:16px; padding:12px; background:var(--bg2); border-radius:8px; font-size:0.9rem; color:var(--text2);">
          ${comp.verdict}
        </div>
        <div class="lb-comparison">
          <div class="lb-vs">
            <div class="lb-vs-num" style="color:var(--text)">${comp.userLE}</div>
            <div class="lb-vs-label">Your projected age</div>
          </div>
          <div class="lb-vs">
            <div class="lb-vs-num" style="color:var(--text3)">${comp.countryAvg}</div>
            <div class="lb-vs-label">${comp.country} average (${state.answers.sex || 'male'})</div>
          </div>
        </div>
        <div style="text-align:center; margin-top:12px; font-size:1.2rem; font-weight:700; color:${comp.diff >= 0 ? 'var(--green)' : 'var(--accent)'};">
          ${diffSign}${comp.diff.toFixed(1)} years vs average
        </div>
      </div>
    </div>
  `;
}

// LONGEVITY GOAL SYSTEM




