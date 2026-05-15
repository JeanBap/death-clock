-- Death Clock App - Seed Data v001
-- Life Factors Reference Table + Tips + Products + Achievements

-- ============================================
-- LIFE FACTORS (research-backed)
-- ============================================
INSERT INTO public.life_factors (factor_key, category, question_field, answer_value, impact_years, label, description, tip, product_category, source) VALUES
-- Smoking
('smoking_never', 'substances', 'smoking', 'never', 0, 'Non-smoker', 'No smoking-related health risks', 'Keep it up!', NULL, 'CDC, Multiple meta-analyses'),
('smoking_former', 'substances', 'smoking', 'former', -2, 'Former smoker', 'Risk reduces significantly after quitting', 'Quitting was the best decision. Risk drops significantly after 10 years.', NULL, 'CDC'),
('smoking_current_light', 'substances', 'smoking', 'current_light', -6, 'Light smoker', 'Even light smoking significantly impacts health', 'Even light smoking removes years. Nicotine replacement therapy can help.', 'smoking_cessation', 'Multiple studies'),
('smoking_current_heavy', 'substances', 'smoking', 'current_heavy', -10, 'Heavy smoker', 'Single biggest controllable mortality risk factor', 'Quitting now could add back 5-8 years. It is never too late.', 'smoking_cessation', 'VA MVP study, CDC'),

-- Exercise
('exercise_5plus', 'fitness', 'exercise', '5+', 4.5, 'Very active (5+ days/week)', '150+ minutes vigorous exercise weekly', 'Top tier exercise longevity benefit.', NULL, 'VA Million Veteran Program (n=719,147)'),
('exercise_3to4', 'fitness', 'exercise', '3-4x', 3, 'Active (3-4 days/week)', 'Regular exercise routine', 'Adding one more day could push you into the optimal zone.', NULL, 'VA MVP'),
('exercise_1to2', 'fitness', 'exercise', '1-2x', 1, 'Somewhat active (1-2 days/week)', 'Some physical activity', 'Try to build up to 150+ minutes per week for maximum benefit.', 'fitness', 'VA MVP'),
('exercise_none', 'fitness', 'exercise', 'none', -4, 'Sedentary', 'Physical inactivity is as dangerous as smoking', 'Even walking 30 min/day helps enormously.', 'fitness', 'VA MVP, Multiple studies'),

-- BMI
('bmi_healthy', 'body', 'bmi_range', 'healthy', 0, 'Healthy weight (BMI 18.5-24.9)', 'Optimal weight range for longevity', 'Your weight is in the optimal range.', NULL, 'Lancet, WHO'),
('bmi_overweight', 'body', 'bmi_range', 'overweight', -1, 'Overweight (BMI 25-29.9)', 'Slightly elevated risk', 'A balanced diet and regular exercise can help.', 'nutrition', 'Lancet'),
('bmi_obese', 'body', 'bmi_range', 'obese', -3, 'Obese (BMI 30-34.9)', 'Significantly increased chronic disease risk', 'Small dietary changes compound over time.', 'nutrition', 'Lancet'),
('bmi_severely_obese', 'body', 'bmi_range', 'severely_obese', -7, 'Severely obese (BMI 35+)', 'Major health risk factor', 'Medical supervision and structured programs recommended.', 'nutrition', 'Lancet'),
('bmi_underweight', 'body', 'bmi_range', 'underweight', -2, 'Underweight (BMI <18.5)', 'Being underweight carries health risks', 'Focus on nutrient-dense foods.', NULL, 'Multiple studies'),

-- Diet
('diet_very_healthy', 'diet', 'diet_quality', 'very_healthy', 5, 'Very healthy diet', 'Mediterranean-style diet with whole foods', 'Associated with the greatest longevity gains.', NULL, 'Harvard, Fondazione Valter Longo'),
('diet_healthy', 'diet', 'diet_quality', 'healthy', 3, 'Healthy diet', 'Generally balanced nutrition', 'Focus on whole foods, vegetables, and lean proteins.', NULL, 'Harvard'),
('diet_average', 'diet', 'diet_quality', 'average', 0, 'Average diet', 'Mix of healthy and processed foods', 'Reducing processed food intake can add years.', 'nutrition', 'Multiple'),
('diet_poor', 'diet', 'diet_quality', 'poor', -4, 'Poor diet', 'Mostly processed, fast food', 'Poor diet is a major mortality risk factor.', 'nutrition', 'Harvard, WHO'),

-- Alcohol
('alcohol_never', 'substances', 'alcohol', 'never', 0, 'Non-drinker', 'No alcohol-related risks', 'No alcohol-related health risks.', NULL, 'Lancet (n=599,912)'),
('alcohol_occasional', 'substances', 'alcohol', 'occasional', 0, 'Occasional drinker', 'Minimal consumption', 'Minimal risk at this level.', NULL, 'Lancet'),
('alcohol_moderate', 'substances', 'alcohol', 'moderate', -0.5, 'Moderate drinker', '7-14 drinks per week', 'Keep under 7 drinks per week for minimal risk.', NULL, 'Lancet'),
('alcohol_heavy', 'substances', 'alcohol', 'heavy', -4, 'Heavy drinker', '14+ drinks per week', 'Reducing intake is one of the highest-impact changes.', NULL, 'Lancet'),

-- Drugs
('drug_none', 'substances', 'drug_use', 'none', 0, 'No drug use', 'No drug-related risks', 'No drug-related health risks.', NULL, 'VA MVP'),
('drug_cannabis', 'substances', 'drug_use', 'cannabis', -1, 'Cannabis use', 'Limited long-term data', 'Moderation advised.', NULL, 'Limited studies'),
('drug_recreational', 'substances', 'drug_use', 'recreational', -3, 'Recreational drug use', 'Unpredictable health risks', 'Recreational drugs carry significant risks.', NULL, 'Multiple'),
('drug_opioids', 'substances', 'drug_use', 'opioids', -8, 'Opioid use', 'Top 3 lifespan reducer', 'Treatment programs save lives.', NULL, 'VA MVP'),

-- Stress
('stress_low', 'mental', 'stress_level', 'low', 2, 'Low stress', 'Generally calm and balanced', 'Maintain your current lifestyle balance.', NULL, 'VA MVP'),
('stress_moderate', 'mental', 'stress_level', 'moderate', 0, 'Moderate stress', 'Normal life stressors', 'Building stress management habits provides insurance.', NULL, 'VA MVP'),
('stress_high', 'mental', 'stress_level', 'high', -2, 'High stress', 'Frequent stress and worry', 'Meditation, exercise, and therapy are proven countermeasures.', 'mental_health', 'VA MVP'),
('stress_very_high', 'mental', 'stress_level', 'very_high', -4, 'Very high stress', 'Chronic, overwhelming stress', 'Prioritize stress reduction immediately.', 'mental_health', 'VA MVP'),

-- Stress management
('stress_mgmt_yes', 'mental', 'stress_management', 'yes', 1.5, 'Active stress management', 'Regular mindfulness or therapy practice', 'Adds measurable years.', NULL, 'Multiple studies'),
('stress_mgmt_no', 'mental', 'stress_management', 'no', 0, 'No stress management', 'No regular stress management practice', 'Even 10 minutes of daily meditation can reduce mortality risk.', 'mental_health', 'Multiple'),

-- Social
('social_strong', 'social', 'social_connections', 'strong', 4, 'Strong social network', 'Close friends, family, community', '#1 predictor of healthy longevity per Harvard 80-year study.', NULL, 'Harvard Study of Adult Development'),
('social_moderate', 'social', 'social_connections', 'moderate', 2, 'Moderate social connections', 'Some close relationships', 'Deepening relationships has compounding benefits.', NULL, 'Harvard'),
('social_few', 'social', 'social_connections', 'few', -2, 'Few social connections', 'Limited social circle', 'Equivalent health risk to smoking. Community groups help.', NULL, 'UNH Extension, Multiple'),
('social_isolated', 'social', 'social_connections', 'isolated', -7, 'Socially isolated', 'Very few or no close relationships', 'Can reduce lifespan by up to 15 years.', NULL, 'UNH Extension'),

-- Relationship
('rel_married', 'social', 'relationship_status', 'married', 2.5, 'Married', 'Social support and shared health behaviors', 'Associated with longer lifespan.', NULL, 'Multiple studies'),
('rel_partnered', 'social', 'relationship_status', 'partnered', 2, 'Partnered', 'Committed relationship', 'Provides social and emotional health benefits.', NULL, 'Multiple'),
('rel_single', 'social', 'relationship_status', 'single', 0, 'Single', 'Not currently in a relationship', 'Strong friendships provide similar benefits.', NULL, 'Multiple'),
('rel_divorced', 'social', 'relationship_status', 'divorced_widowed', -1, 'Divorced/Widowed', 'Life transition stress', 'Building new social connections is key.', NULL, 'Multiple'),

-- Sleep
('sleep_optimal', 'sleep', 'sleep_hours', 'optimal', 0, 'Optimal sleep (7-8 hrs)', 'Optimal sleep duration', 'Perfect for longevity.', NULL, 'VA MVP, National Sleep Foundation'),
('sleep_short', 'sleep', 'sleep_hours', 'short', -3, 'Short sleep (<6 hrs)', 'Chronic sleep deprivation', 'Prioritize sleep hygiene.', 'sleep', 'VA MVP, Multiple'),
('sleep_moderate_short', 'sleep', 'sleep_hours', 'moderate_short', -1, 'Slightly short (6-7 hrs)', 'Below optimal duration', 'Try adding 30 minutes.', NULL, 'Multiple'),
('sleep_long', 'sleep', 'sleep_hours', 'long', -1.5, 'Long sleep (9+ hrs)', 'May indicate underlying issues', 'Check with a doctor.', NULL, 'Multiple'),

-- Sleep quality
('sleep_quality_poor', 'sleep', 'sleep_quality', 'poor', -2, 'Poor sleep quality', 'Frequent waking, difficulty falling asleep', 'Blue light reduction, consistent schedule help.', 'sleep', 'Multiple'),
('sleep_quality_fair', 'sleep', 'sleep_quality', 'fair', -0.5, 'Fair sleep quality', 'Occasional sleep issues', 'Room for improvement.', NULL, 'Multiple'),
('sleep_quality_good', 'sleep', 'sleep_quality', 'good', 0, 'Good sleep quality', 'Generally restful sleep', 'Solid foundation.', NULL, 'Multiple'),
('sleep_quality_excellent', 'sleep', 'sleep_quality', 'excellent', 1, 'Excellent sleep quality', 'Deep, uninterrupted sleep', 'Most underrated longevity tool.', NULL, 'Multiple'),

-- Medical conditions
('cond_diabetes', 'medical', 'conditions', 'diabetes', -8, 'Diabetes', 'Well-managed diabetes reduces impact', 'Regular monitoring and medication adherence are critical.', NULL, 'CDC (11.1 QALY loss)'),
('cond_heart_disease', 'medical', 'conditions', 'heart_disease', -9, 'Heart disease', 'Leading cause of death globally', 'Cardiac rehabilitation and lifestyle changes improve outcomes.', NULL, 'CDC, WHO (19M deaths/yr)'),
('cond_hypertension', 'medical', 'conditions', 'hypertension', -5, 'Hypertension', 'Controlled hypertension reduces impact to -1 to -2 years', 'Medication adherence saves lives.', NULL, 'CDC (6.3 QALY loss)'),
('cond_cancer', 'medical', 'conditions', 'cancer', -4, 'Cancer (in remission)', 'Risk varies by type and stage', 'Regular screening and follow-up essential.', NULL, 'WHO (10M deaths/yr)'),
('cond_stroke', 'medical', 'conditions', 'stroke', -10, 'Stroke history', 'Post-stroke rehabilitation crucial', 'Secondary prevention is key.', NULL, 'CDC (12.4 QALY loss)'),
('cond_copd', 'medical', 'conditions', 'copd', -6, 'COPD', 'Chronic respiratory disease', 'Pulmonary rehabilitation improves outcomes.', NULL, 'WHO (4M deaths/yr)'),
('cond_kidney', 'medical', 'conditions', 'kidney_disease', -5, 'Chronic kidney disease', 'Early management slows progression', 'Regular monitoring essential.', NULL, 'ADA'),
('cond_autoimmune', 'medical', 'conditions', 'autoimmune', -3, 'Autoimmune condition', 'Modern treatments improve outcomes', 'Varies by specific condition.', NULL, 'Multiple'),

-- Healthcare access
('healthcare_regular', 'medical', 'healthcare_access', 'regular', 1, 'Regular checkups', 'Preventive care catches issues early', 'Annual screenings recommended.', NULL, 'Multiple'),
('healthcare_occasional', 'medical', 'healthcare_access', 'occasional', 0, 'Occasional healthcare', 'Visits when issues arise', 'Schedule annual checkups at minimum.', NULL, 'Multiple'),
('healthcare_rarely', 'medical', 'healthcare_access', 'rarely', -1, 'Rarely sees a doctor', 'Only when very sick', 'Annual screenings are critical after 40.', 'health_testing', 'Multiple'),
('healthcare_never', 'medical', 'healthcare_access', 'never', -3, 'Never sees a doctor', 'No medical care in years', 'Many conditions are treatable when caught early.', 'health_testing', 'Multiple'),

-- Environment
('air_good', 'environment', 'air_quality', 'good', 0, 'Good air quality', 'Clean air environment', 'Supports lung and cardiovascular health.', NULL, 'PMC, Lancet'),
('air_moderate', 'environment', 'air_quality', 'moderate', -1, 'Moderate air quality', 'Some urban pollution', 'Consider indoor air purifiers.', NULL, 'PMC'),
('air_poor', 'environment', 'air_quality', 'poor', -3, 'Poor air quality', 'High pollution area', 'Air pollution accounts for 2-4 years of healthy life lost.', NULL, 'PMC, Lancet Healthy Longevity'),

-- Occupation
('occ_sedentary', 'environment', 'occupation_risk', 'sedentary', -1, 'Sedentary office work', 'Mostly sitting throughout the day', 'Take breaks every 30 minutes. Standing desk helps.', 'fitness', 'Multiple'),
('occ_moderate', 'environment', 'occupation_risk', 'moderate', 0, 'Moderate activity job', 'Mix of sitting and moving', 'Good balance of movement.', NULL, 'Multiple'),
('occ_physical', 'environment', 'occupation_risk', 'physical', 0.5, 'Physically active job', 'On feet most of the day', 'Built-in exercise is beneficial.', NULL, 'Multiple'),
('occ_hazardous', 'environment', 'occupation_risk', 'hazardous', -4, 'Hazardous occupation', 'Chemical, height, or machinery exposure', 'Safety protocols essential.', NULL, 'OSHA data'),

-- Family history
('family_longevity', 'genetics', 'family_history', 'longevity', 4, 'Family longevity (80+)', 'Parents lived past 80', 'Genetics play a favorable role.', NULL, 'MedlinePlus, Actuarial data'),
('family_average', 'genetics', 'family_history', 'average', 0, 'Average family lifespan', 'Parents lived 65-79', 'Lifestyle matters more than genetics.', NULL, 'MedlinePlus'),
('family_early_death', 'genetics', 'family_history', 'early_death', -3, 'Family early death (<65)', 'Parents died before 65', 'Proactive screening extra important.', 'health_testing', 'Actuarial data');

-- ============================================
-- TIPS
-- ============================================
INSERT INTO public.tips (factor_category, title, content, potential_years_gained, difficulty, is_premium, sort_order) VALUES
('fitness', 'Walk 30 Minutes Daily', 'Just 30 minutes of walking per day reduces all-cause mortality by 20%. Start with a post-dinner walk and build from there.', 3, 'easy', false, 1),
('fitness', 'Add Strength Training', 'Muscle mass is protective as you age. 2-3 resistance sessions per week significantly reduce fall risk and metabolic disease.', 2, 'medium', false, 2),
('diet', 'Eat 5+ Servings of Vegetables', 'Each additional daily serving of vegetables reduces mortality risk by 5%. Aim for variety and color across the rainbow.', 3, 'easy', false, 3),
('diet', 'Adopt a Mediterranean Diet', 'The most studied diet for longevity. Focus on olive oil, fish, nuts, whole grains, and vegetables. Reduce red meat and processed food.', 4, 'medium', false, 4),
('diet', 'Reduce Ultra-Processed Food', 'Each 10% increase in ultra-processed food consumption is linked to 14% higher mortality. Read labels and cook from scratch more.', 2, 'medium', false, 5),
('sleep', 'Set a Consistent Sleep Schedule', 'Going to bed and waking at the same time, even on weekends, improves sleep quality more than any supplement.', 1.5, 'easy', false, 6),
('sleep', 'Create a Dark, Cool Bedroom', 'Optimal sleep temperature is 65-68F (18-20C). Use blackout curtains and remove blue-light-emitting electronics.', 1, 'easy', false, 7),
('mental', 'Start a Daily Meditation Practice', 'Even 10 minutes of daily meditation measurably reduces cortisol, blood pressure, and systemic inflammation markers.', 1.5, 'easy', false, 8),
('mental', 'Build a Gratitude Journal', 'Writing 3 things you are grateful for daily is linked to better mental health, better sleep quality, and reduced inflammation.', 1, 'easy', false, 9),
('social', 'Schedule Weekly Social Time', 'Block time for friends and family like you would a meeting. Consistent social contact protects against cognitive decline and depression.', 3, 'easy', false, 10),
('social', 'Join a Community Group', 'Religious communities, clubs, volunteering groups, and team sports all provide the social bonds that measurably extend lifespan.', 2, 'medium', false, 11),
('substances', 'Quit Smoking Now', 'Within 1 year of quitting, heart disease risk drops by 50%. Within 10 years, lung cancer risk halves. It is never too late to quit.', 8, 'hard', false, 12),
('substances', 'Reduce Alcohol to Under 7 Drinks/Week', 'The Lancet study of 600,000 people found the safest consumption level is under 100g/week (about 7 standard drinks).', 3, 'medium', false, 13),
('medical', 'Get Annual Health Screenings', 'Blood pressure, cholesterol, blood sugar, and cancer screenings catch problems when they are most treatable.', 2, 'easy', false, 14),
('medical', 'Take Medications Consistently', 'Medication non-adherence accounts for 125,000 deaths per year in the US alone. Set reminders and use pill organizers.', 2, 'easy', false, 15),
('environment', 'Use a HEPA Air Purifier at Home', 'HEPA air purifiers reduce indoor particulate matter by up to 80%, reducing respiratory and cardiovascular risk.', 1, 'easy', false, 16),
('environment', 'Take Movement Breaks Every 30 Minutes', 'Breaking up sitting time with 2-3 minutes of movement every 30 minutes reduces mortality risk by 17%.', 1.5, 'easy', false, 17);

-- ============================================
-- PRODUCTS (Affiliates)
-- ============================================
INSERT INTO public.products (name, description, category, factor_category, estimated_life_impact, affiliate_url, price_range, commission_rate, rating, is_premium_only, sort_order) VALUES
('InsideTracker', 'Blood biomarker testing with personalized recommendations. Track 40+ biomarkers including inflammation, glucose, hormones.', 'Health Testing', 'health_testing', 'Monitoring and early detection', 'https://www.insidetracker.com', '$189-$589/test', '10-15%', 4.5, false, 1),
('Everlywell', 'At-home lab tests for food sensitivity, metabolism, heart health, thyroid, and more. FDA-registered lab partner.', 'Health Testing', 'health_testing', 'Early detection', 'https://www.everlywell.com', '$49-$399/test', '8-12%', 4.3, false, 2),
('Life Extension', 'Premium supplements for longevity: NAD+, CoQ10, omega-3, curcumin, resveratrol, and comprehensive multivitamins.', 'Supplements', 'supplements', '+1-3 years potential', 'https://www.lifeextension.com', '$15-$60/month', '10-15%', 4.6, false, 3),
('NMN Bio', 'Pharmaceutical-grade NMN (nicotinamide mononucleotide) for cellular NAD+ restoration. Third-party tested for purity.', 'Supplements', 'supplements', 'Cellular aging support', 'https://www.nmnbio.com', '$40-$80/month', '15%', 4.4, false, 4),
('Oura Ring', 'Sleep and activity tracker in a ring form factor. Monitors HRV, temperature trends, readiness score, and sleep stages.', 'Fitness Wearables', 'fitness', '+2-3 years via behavior change', 'https://ouraring.com', '$299 + $5.99/mo', '8-10%', 4.5, false, 5),
('Whoop', 'Performance wearable tracking strain, recovery, and sleep with AI coaching insights. No screen, 24/7 monitoring.', 'Fitness Wearables', 'fitness', '+2-3 years via behavior change', 'https://www.whoop.com', '$30/month', '10%', 4.2, false, 6),
('Headspace', 'Guided meditation and mindfulness app. Clinically proven to reduce stress by 14% in 10 days and improve sleep quality.', 'Mental Health', 'mental_health', '+1-2 years stress reduction', 'https://www.headspace.com', '$12.99/month', '10-15%', 4.7, false, 7),
('BetterHelp', 'Online therapy with licensed therapists. Accessible from anywhere via video, phone, or chat. 30,000+ therapists.', 'Mental Health', 'mental_health', '+2-3 years mental health', 'https://www.betterhelp.com', '$65-$100/week', '15-20%', 4.3, false, 8),
('Factor Meals', 'Chef-prepared, dietitian-designed meals delivered weekly. No cooking required. Keto, protein+, calorie-smart options.', 'Nutrition', 'nutrition', '+2-4 years diet improvement', 'https://www.factor75.com', '$11-$15/meal', '10%', 4.4, false, 9),
('Eight Sleep Pod', 'Smart mattress cover that regulates temperature for optimal sleep. Tracks sleep stages and adjusts throughout the night.', 'Sleep', 'sleep', '+2-3 years sleep quality', 'https://www.eightsleep.com', '$2,049+', '5-8%', 4.3, true, 10),
('Nicorette', 'FDA-approved nicotine replacement gum and lozenges. Proven to double quit success rates vs. cold turkey.', 'Smoking Cessation', 'smoking_cessation', '+5-10 years if quit', 'https://www.nicorette.com', '$30-$50/box', '5-8%', 4.1, false, 11),
('AG1 (Athletic Greens)', 'Comprehensive daily nutrition: 75 vitamins, minerals, probiotics, and whole-food ingredients in one scoop.', 'Supplements', 'supplements', 'Nutritional foundation', 'https://drinkag1.com', '$79/month', '10-15%', 4.5, false, 12);

-- ============================================
-- ACHIEVEMENTS
-- ============================================
INSERT INTO public.achievements (key, title, description, icon) VALUES
('first_calc', 'Face Your Mortality', 'Completed your first death date calculation', '&#9760;'),
('first_bucket', 'Dream Maker', 'Added your first bucket list item', '&#9733;'),
('first_goal', 'Goal Setter', 'Set your first personal goal', '&#127919;'),
('goal_complete', 'Achievement Unlocked', 'Completed your first goal', '&#127942;'),
('bucket_5', 'Life Lister', 'Added 5 items to your bucket list', '&#128221;'),
('recalculate', 'Self-Improver', 'Recalculated your death date after making changes', '&#128260;'),
('all_positive', 'Life Maximizer', 'All lifestyle factors are positive', '&#127775;'),
('score_80', 'Elite Status', 'Achieved a Life Score of 80+', '&#128170;'),
('streak_7', 'Week Warrior', 'Logged healthy habits for 7 consecutive days', '&#128293;'),
('bucket_complete_5', 'Living Legend', 'Completed 5 bucket list items', '&#127881;');
