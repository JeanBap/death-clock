# Death Clock App - Product Spec v001
**Date**: 15/05/2026
**Agent**: 01 - System Analyst
**Input**: discovery_v001.md

---

## 1. PRODUCT OVERVIEW

**Name**: MortalityApp (working title - TBD)
**One-liner**: See your death date. Change it. Live intentionally.
**Platform**: Responsive web app (React + Supabase)
**Monetization**: Freemium + Stripe subscriptions ($4.99/mo, $9.99/mo, $99 lifetime) + affiliate upsells

---

## 2. USER FLOW

### 2.1 Anonymous Entry (Viral Hook)
1. User lands on homepage, sees dramatic countdown clock
2. CTA: "Calculate Your Death Date" - no signup required
3. Multi-step questionnaire (15-20 questions, grouped by category)
4. Result: animated death date reveal with countdown timer
5. Show top 3 factors hurting/helping their lifespan
6. CTA: "Create free account to save your results and start your bucket list"

### 2.2 Free Tier (Account Required)
- Save death date calculation
- View full factor breakdown (what's adding/removing years)
- Basic bucket list (up to 10 items)
- 3 personal goals
- Weekly "life tips" email
- Basic product recommendations

### 2.3 Premium ($4.99/mo)
- Unlimited bucket list items
- Unlimited goals with progress tracking
- Recalculate death date monthly with updated inputs
- Detailed factor analysis with personalized tips
- Priority product recommendations
- "Years Added" tracker (gamification)

### 2.4 Premium Plus ($9.99/mo)
- Everything in Premium
- AI-powered personalized longevity plan
- Biomarker tracking integration
- Monthly longevity report
- Exclusive affiliate deals and discounts
- "Life Score" dashboard

### 2.5 Lifetime ($99 one-time)
- Everything in Premium Plus, forever
- Early access to new features

---

## 3. FEATURE SPEC

### 3.1 Death Clock Calculator

**Inputs** (questionnaire categories):

**A. Demographics** (4 questions)
- Date of birth
- Biological sex
- Country of residence
- Race/ethnicity (optional, for actuarial accuracy)

**B. Body & Fitness** (4 questions)
- Height + weight (auto-calc BMI)
- Exercise frequency (none / 1-2x / 3-4x / 5+ per week)
- Exercise type (cardio / strength / both / none)
- How would you describe your overall fitness? (poor / fair / good / excellent)

**C. Diet & Substances** (4 questions)
- Diet quality (poor / average / healthy / very healthy)
- Alcohol consumption (never / occasional / moderate / heavy)
- Smoking status (never / former / current light / current heavy)
- Drug use (none / cannabis only / other recreational / opioids)

**D. Mental Health & Social** (4 questions)
- Stress level (low / moderate / high / very high)
- Do you practice stress management? (yes / no)
- Social connections (isolated / few / moderate / strong network)
- Relationship status (single / partnered / married / divorced-widowed)

**E. Sleep** (2 questions)
- Average hours per night
- Sleep quality (poor / fair / good / excellent)

**F. Medical History** (3 questions)
- Existing conditions (multi-select: diabetes, heart disease, hypertension, cancer, stroke, COPD, kidney disease, autoimmune, none)
- Family history: parents' age at death or current age
- Access to healthcare (regular checkups / occasional / rarely / never)

**G. Environment** (2 questions)
- Air quality in your area (poor / moderate / good)
- Occupation risk level (sedentary office / moderate / physically demanding / hazardous)

**Total: ~23 questions**

**Calculation Engine**:
```
base_expectancy = SSA_actuarial_table[age][sex]
adjustments = sum(factor_impacts[each_answer])
estimated_death_date = today + (base_expectancy - current_age + adjustments) years
```

Each factor has a quantified year impact from the research database (see discovery_v001.md Section 4).

**Output**:
- Death date (day/month/year)
- Countdown timer (years, months, days, hours, minutes, seconds - live ticking)
- Estimated remaining lifespan in years
- Factor breakdown: top 5 factors reducing life, top 5 factors helping
- Each factor shows "+X.X years" or "-X.X years"
- Overall "Life Score" (0-100)

### 3.2 Bucket List

- Title, description, category (travel / experience / achievement / relationship / creative / other)
- Target date (optional, auto-suggested based on death date)
- Priority (must-do / want-to / dream)
- Status (not started / in progress / completed)
- Photo upload for completed items
- Suggested bucket list items based on remaining lifespan
- Free: 10 items max. Premium: unlimited.

### 3.3 Personal Goals

- Goal title, description
- Category (health / career / financial / relationship / personal growth / other)
- Timeline (30 days / 90 days / 1 year / 5 years / lifetime)
- Milestones (sub-goals)
- Progress tracking (percentage)
- Link goals to life expectancy impact ("If you achieve this fitness goal, add ~2 years")
- Free: 3 goals. Premium: unlimited.

### 3.4 Tips & Tricks Engine

Content categories mapped to user's weakest factors:
- If smoker: smoking cessation tips + NRT product recommendations
- If sedentary: exercise starter guides + fitness product recommendations
- If poor diet: nutrition guides + meal delivery affiliates
- If stressed: stress management techniques + meditation app affiliates
- If lonely: social connection strategies + community recommendations
- If poor sleep: sleep hygiene tips + sleep product affiliates

Tips are personalized based on which factors have the most negative impact on the user's death date. Each tip shows the potential years gained.

### 3.5 Product Upsells (Affiliate Engine)

Products/services mapped to life expectancy factors:

| User Factor | Product Category | Example Products | Est. Years Impact |
|-------------|-----------------|------------------|-------------------|
| Poor diet | Meal delivery | Factor, HelloFresh | +2-4 years |
| Sedentary | Fitness wearables | Oura, Whoop, Fitbit | +3-4.5 years |
| High stress | Meditation apps | Headspace, Calm | +1-2 years |
| Poor sleep | Sleep products | Eight Sleep, Casper | +2-3 years |
| No health testing | Blood tests | InsideTracker, Everlywell | Monitoring |
| Supplement gap | Supplements | Life Extension, NMN Bio | +1-3 years |
| Mental health | Therapy | BetterHelp, Talkspace | +2-3 years |
| Smoker | Cessation | Nicorette, patches | +5-10 years |

Each product card shows:
- Product name + image
- "Could add X years to your life"
- Affiliate link with FTC disclosure
- User reviews/rating
- Price

### 3.6 Gamification

- "Years Added" counter: tracks cumulative impact of lifestyle changes
- Streaks: consecutive days of logging healthy habits
- Achievements: badges for milestones (first recalculation, first goal completed, etc.)
- Life Score: 0-100 composite score based on all factors
- Leaderboard: anonymous, opt-in ranking by Life Score

---

## 4. NON-FUNCTIONAL REQUIREMENTS

- **Performance**: <2s page load, calculator result <1s
- **Mobile-first**: responsive, works on all screen sizes
- **SEO**: death clock, life expectancy calculator, how long will I live
- **Privacy**: clear disclaimer (not medical advice), data encryption at rest, GDPR-ready
- **Accessibility**: WCAG AA minimum
- **Analytics**: track calculator completions, signup conversions, affiliate clicks

---

## 5. TECH DECISIONS (for CTO agent)

- Frontend: React (single-page app) or static HTML with JS
- Backend: Supabase (auth, database, edge functions)
- Payments: Stripe (subscriptions)
- Hosting: Vercel or Netlify
- Affiliates: custom tracking via UTM + Supabase logging

---

## 6. MVP SCOPE

**Phase 1 (MVP)**:
- Death clock calculator with full factor database
- Account creation + save results
- Bucket list (basic)
- Personal goals (basic)
- Tips engine (content-based)
- Product recommendations (static affiliate links)
- Free tier only (no payments yet)

**Phase 2**:
- Stripe integration (3 subscription tiers)
- Premium features (unlimited lists, recalculation, AI tips)
- Email sequences
- Affiliate tracking dashboard

**Phase 3**:
- Biomarker integration
- Social features
- Mobile app (PWA)

---

## Self-Assessment
- Output quality vs done criteria: 4/5 - Comprehensive spec covering all features, monetization, and phasing.
- What worked: Discovery research provided solid quantified data for the factor engine.
- What did not work: Could flesh out the AI personalization features more in Phase 2.
- Proposed best-practice addition: "Include wireframe references in spec for key screens."
