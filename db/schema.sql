-- Death Clock App - Supabase Schema v001
-- Date: 15/05/2026
-- Agent: 04 - Data Architect

-- ============================================
-- 1. USERS PROFILE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  date_of_birth DATE,
  biological_sex TEXT CHECK (biological_sex IN ('male', 'female')),
  country TEXT,
  ethnicity TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'premium_plus', 'lifetime')),
  stripe_customer_id TEXT,
  life_score INTEGER DEFAULT 0 CHECK (life_score >= 0 AND life_score <= 100),
  years_added NUMERIC(4,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. LIFE EXPECTANCY CALCULATIONS
-- ============================================
CREATE TABLE public.calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Anonymous calculations store a session token
  session_token TEXT,

  -- Demographics
  date_of_birth DATE NOT NULL,
  biological_sex TEXT NOT NULL,
  country TEXT,
  ethnicity TEXT,

  -- Body & Fitness
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  bmi NUMERIC(4,1),
  exercise_frequency TEXT CHECK (exercise_frequency IN ('none', '1-2x', '3-4x', '5+')),
  exercise_type TEXT CHECK (exercise_type IN ('none', 'cardio', 'strength', 'both')),
  fitness_level TEXT CHECK (fitness_level IN ('poor', 'fair', 'good', 'excellent')),

  -- Diet & Substances
  diet_quality TEXT CHECK (diet_quality IN ('poor', 'average', 'healthy', 'very_healthy')),
  alcohol_consumption TEXT CHECK (alcohol_consumption IN ('never', 'occasional', 'moderate', 'heavy')),
  smoking_status TEXT CHECK (smoking_status IN ('never', 'former', 'current_light', 'current_heavy')),
  drug_use TEXT CHECK (drug_use IN ('none', 'cannabis', 'recreational', 'opioids')),

  -- Mental Health & Social
  stress_level TEXT CHECK (stress_level IN ('low', 'moderate', 'high', 'very_high')),
  stress_management BOOLEAN DEFAULT FALSE,
  social_connections TEXT CHECK (social_connections IN ('isolated', 'few', 'moderate', 'strong')),
  relationship_status TEXT CHECK (relationship_status IN ('single', 'partnered', 'married', 'divorced_widowed')),

  -- Sleep
  sleep_hours NUMERIC(3,1),
  sleep_quality TEXT CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent')),

  -- Medical
  conditions TEXT[] DEFAULT '{}',
  parent1_age_at_death INTEGER,
  parent2_age_at_death INTEGER,
  parent1_alive BOOLEAN DEFAULT TRUE,
  parent2_alive BOOLEAN DEFAULT TRUE,
  parent1_current_age INTEGER,
  parent2_current_age INTEGER,
  healthcare_access TEXT CHECK (healthcare_access IN ('regular', 'occasional', 'rarely', 'never')),

  -- Environment
  air_quality TEXT CHECK (air_quality IN ('poor', 'moderate', 'good')),
  occupation_risk TEXT CHECK (occupation_risk IN ('sedentary', 'moderate', 'physical', 'hazardous')),

  -- Results
  base_life_expectancy NUMERIC(5,2),
  total_adjustment NUMERIC(5,2),
  estimated_death_date DATE,
  estimated_remaining_years NUMERIC(5,2),
  life_score INTEGER CHECK (life_score >= 0 AND life_score <= 100),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. FACTOR IMPACTS (per calculation)
-- ============================================
CREATE TABLE public.calculation_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_id UUID REFERENCES public.calculations(id) ON DELETE CASCADE,
  factor_key TEXT NOT NULL,
  factor_category TEXT NOT NULL,
  factor_label TEXT NOT NULL,
  impact_years NUMERIC(4,1) NOT NULL,
  description TEXT,
  tip TEXT,
  product_category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. LIFE FACTORS REFERENCE TABLE
-- ============================================
CREATE TABLE public.life_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factor_key TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  question_field TEXT NOT NULL,
  answer_value TEXT NOT NULL,
  impact_years NUMERIC(4,1) NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  tip TEXT,
  product_category TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. BUCKET LIST
-- ============================================
CREATE TABLE public.bucket_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'other' CHECK (category IN ('travel', 'experience', 'achievement', 'relationship', 'creative', 'other')),
  priority TEXT DEFAULT 'want_to' CHECK (priority IN ('must_do', 'want_to', 'dream')),
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  target_date DATE,
  completed_date DATE,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. PERSONAL GOALS
-- ============================================
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'personal_growth' CHECK (category IN ('health', 'career', 'financial', 'relationship', 'personal_growth', 'other')),
  timeline TEXT DEFAULT '1_year' CHECK (timeline IN ('30_days', '90_days', '1_year', '5_years', 'lifetime')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  life_impact_years NUMERIC(3,1) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  target_date DATE,
  completed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. GOAL MILESTONES
-- ============================================
CREATE TABLE public.goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_date DATE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. TIPS
-- ============================================
CREATE TABLE public.tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factor_category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  potential_years_gained NUMERIC(3,1),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_premium BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. PRODUCTS (Affiliate)
-- ============================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  factor_category TEXT NOT NULL,
  estimated_life_impact TEXT,
  affiliate_url TEXT NOT NULL,
  image_url TEXT,
  price_range TEXT,
  commission_rate TEXT,
  rating NUMERIC(2,1),
  is_premium_only BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. AFFILIATE CLICKS (tracking)
-- ============================================
CREATE TABLE public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

-- ============================================
-- 11. SUBSCRIPTIONS
-- ============================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('premium', 'premium_plus', 'lifetime')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'expired')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 12. ACHIEVEMENTS
-- ============================================
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculation_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bucket_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Calculations: users see their own, anonymous calcs use session_token
CREATE POLICY "Users can view own calculations" ON public.calculations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert calculations" ON public.calculations FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Anon can insert calculations" ON public.calculations FOR INSERT WITH CHECK (user_id IS NULL);

-- Calculation factors: follow parent
CREATE POLICY "Users can view own factors" ON public.calculation_factors FOR SELECT
  USING (calculation_id IN (SELECT id FROM public.calculations WHERE user_id = auth.uid()));

-- Bucket list: users own their items
CREATE POLICY "Users manage own bucket list" ON public.bucket_list_items FOR ALL USING (auth.uid() = user_id);

-- Goals: users own their goals
CREATE POLICY "Users manage own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);

-- Goal milestones: users own via parent goal
CREATE POLICY "Users manage own milestones" ON public.goal_milestones FOR ALL
  USING (goal_id IN (SELECT id FROM public.goals WHERE user_id = auth.uid()));

-- Tips: public read
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read tips" ON public.tips FOR SELECT USING (true);

-- Products: public read
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read products" ON public.products FOR SELECT USING (true);

-- Life factors: public read
ALTER TABLE public.life_factors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read life factors" ON public.life_factors FOR SELECT USING (true);

-- Achievements: public read
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read achievements" ON public.achievements FOR SELECT USING (true);

-- User achievements: users see own
CREATE POLICY "Users view own achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);

-- Affiliate clicks: users can insert
CREATE POLICY "Users can track clicks" ON public.affiliate_clicks FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Subscriptions: users see own
CREATE POLICY "Users view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_calculations_user ON public.calculations(user_id);
CREATE INDEX idx_calculations_session ON public.calculations(session_token);
CREATE INDEX idx_bucket_list_user ON public.bucket_list_items(user_id);
CREATE INDEX idx_goals_user ON public.goals(user_id);
CREATE INDEX idx_life_factors_key ON public.life_factors(factor_key);
CREATE INDEX idx_affiliate_clicks_product ON public.affiliate_clicks(product_id);
CREATE INDEX idx_affiliate_clicks_user ON public.affiliate_clicks(user_id);
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER bucket_list_updated_at BEFORE UPDATE ON public.bucket_list_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
