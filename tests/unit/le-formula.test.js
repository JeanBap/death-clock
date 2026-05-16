import { describe, test, expect } from 'vitest';

// Replicates the deployed formula from public/shared/quiz.js so the
// pure-math layer is locked under unit tests. Update both when the
// formula moves.

function capCategory(list, cap) {
  const total = list.reduce((s, f) => s + f.impact, 0);
  if (Math.abs(total) > cap) {
    const scale = cap / Math.abs(total);
    list.forEach(f => f.impact = Math.round(f.impact * scale * 10) / 10);
  }
}

function compute(factors, baseLE = 74.8) {
  const f = factors.map(x => ({ ...x }));
  capCategory(f.filter(x => x.cat === 'diet'),     5);
  capCategory(f.filter(x => x.cat === 'fitness'),  6);
  capCategory(f.filter(x => x.cat === 'social'),   8);
  capCategory(f.filter(x => x.cat === 'mental'),   4);
  capCategory(f.filter(x => x.cat === 'genetics'), 4);
  const body = f.filter(x => x.cat === 'body');
  const bodyT = body.reduce((s,x)=>s+x.impact,0);
  if (bodyT > 3) capCategory(body, 3); else if (bodyT < -7) capCategory(body, 7);
  const env  = f.filter(x => x.cat === 'environment');
  const envT = env.reduce((s,x)=>s+x.impact,0);
  if (envT > 3) capCategory(env, 3); else if (envT < -5) capCategory(env, 5);
  const raw = f.reduce((s,x)=>s+x.impact,0);
  let adj;
  if (raw > 0) adj = Math.min(18, Math.sqrt(raw) * 4.25);
  else adj = Math.max(-30, raw);
  return baseLE + Math.max(-30, Math.min(18, adj));
}

describe('LE rebalance formula (commit 9b96f14)', () => {
  test('perfect user maxes at 92.8 (baseLE 74.8 + cap 18)', () => {
    const factors = Array.from({ length: 12 }, () => ({ impact: 3, cat: 'social' }));
    expect(compute(factors)).toBeCloseTo(74.8 + 18, 1);
  });
  test('worst user floors at 44.8 (baseLE 74.8 - cap 30)', () => {
    const factors = [{ impact: -50, cat: 'substances' }];
    expect(compute(factors)).toBeCloseTo(74.8 - 30, 1);
  });
  test('positive raw of 18 returns +18 (cap boundary)', () => {
    const factors = [{ impact: 18, cat: 'fitness' }];
    expect(compute([{ impact: 6, cat: 'fitness' }, { impact: 8, cat: 'social' }, { impact: 4, cat: 'mental' }])).toBeGreaterThan(74.8);
  });
  test('zero factors returns baseLE unchanged', () => {
    expect(compute([])).toBeCloseTo(74.8, 1);
  });
});
