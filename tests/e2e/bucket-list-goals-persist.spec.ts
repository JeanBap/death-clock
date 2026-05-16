// Regression test for bug "bucket list and goal tracker do not persist"
// Fix commit: 799bf77
// Locks the bug from regressing silently.
//
// Strategy: drive the live UI on a fresh browser context. Add an item to each
// feature, hard-reload, assert the item is still there. No auth required: the
// fix targets the anonymous + free-tier localStorage path which is the common
// real-user case.
//
// Run: npx playwright test bucket-list-goals-persist.spec.ts

import { test, expect, type Page } from '@playwright/test';

const BASE = process.env.DC_BASE_URL ?? 'https://www.death-clock.app';

async function dismissCookieIfPresent(page: Page) {
  const accept = page.getByRole('button', { name: /accept|got it|ok/i });
  if (await accept.first().isVisible().catch(() => false)) {
    await accept.first().click();
  }
}

async function completeQuizMinimal(page: Page) {
  // Land on calculator. Burning every question would slow the test; the bug
  // only requires that the dashboard is reachable. The repo's app.html opens
  // the dashboard once a result exists, but for the persistence test we can
  // poke state directly via the window object to skip the 23-question quiz.
  await page.evaluate(() => {
    const w: any = window;
    // Minimal state shape so dashboard renders without errors
    w.state = w.state || {};
    w.state.result = {
      deathDate: new Date(Date.now() + 30 * 365.25 * 24 * 3600 * 1000),
      dob: new Date('1989-01-01'),
      adjustedLE: 80, baseLE: 74.8, totalAdjust: 5, lifeScore: 70,
      factors: []
    };
    w.state.bucketList = w.state.bucketList || [];
    w.state.goals = w.state.goals || [];
    if (typeof w.showPage === 'function') w.showPage('dashboard');
    if (typeof w.showTab === 'function') w.showTab('bucketlist');
  });
}

test.describe('Bucket list + Goals persistence regression', () => {
  test('bucket list item survives page reload', async ({ page }) => {
    await page.goto(BASE + '/');
    await dismissCookieIfPresent(page);
    await completeQuizMinimal(page);

    const title = 'E2E_BUCKET_' + Date.now();
    // Programmatically push the item exactly the way saveBucket does, but
    // through the public API so the test exercises the persistence path.
    await page.evaluate((t) => {
      const w: any = window;
      w.state.bucketList.push({
        title: t, description: '', category: 'travel', priority: 'medium', targetDate: '', done: false
      });
      w.DataStore.save();
      w.showTab('bucketlist');
    }, title);

    await expect(page.getByText(title, { exact: false })).toBeVisible({ timeout: 5000 });

    await page.reload({ waitUntil: 'load' });
    await dismissCookieIfPresent(page);
    await page.evaluate(() => {
      const w: any = window;
      if (typeof w.showPage === 'function') w.showPage('dashboard');
      if (typeof w.showTab === 'function') w.showTab('bucketlist');
    });

    await expect(page.getByText(title, { exact: false })).toBeVisible({ timeout: 5000 });
  });

  test('goal survives page reload', async ({ page }) => {
    await page.goto(BASE + '/');
    await dismissCookieIfPresent(page);
    await completeQuizMinimal(page);

    const title = 'E2E_GOAL_' + Date.now();
    await page.evaluate((t) => {
      const w: any = window;
      w.state.goals.push({
        title: t, description: '', category: 'health', timeline: '1y',
        lifeImpact: 0.5, progress: 0
      });
      w.DataStore.save();
      w.showTab('goals');
    }, title);

    await expect(page.getByText(title, { exact: false })).toBeVisible({ timeout: 5000 });

    await page.reload({ waitUntil: 'load' });
    await dismissCookieIfPresent(page);
    await page.evaluate(() => {
      const w: any = window;
      if (typeof w.showPage === 'function') w.showPage('dashboard');
      if (typeof w.showTab === 'function') w.showTab('goals');
    });

    await expect(page.getByText(title, { exact: false })).toBeVisible({ timeout: 5000 });
  });

  test('goal tracker (habit cadence) survives page reload', async ({ page }) => {
    await page.goto(BASE + '/');
    await dismissCookieIfPresent(page);

    const name = 'E2E_TRACKER_' + Date.now();
    await page.evaluate((n) => {
      const w: any = window;
      if (typeof w.addGoalTracker === 'function') {
        w.addGoalTracker(n, 'weekly', 3);
      }
    }, name);

    await page.reload({ waitUntil: 'load' });
    await dismissCookieIfPresent(page);

    const stored = await page.evaluate(() => localStorage.getItem('dc_goal_trackers') || '[]');
    expect(stored).toContain(name);
  });
});
