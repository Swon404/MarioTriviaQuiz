import { expect, test } from '@playwright/test';
import { TRACK_CHALLENGES, trackLabel } from '../src/mario/trackChallenges.ts';
import { BOOSTER_COURSES } from '../src/mario/courses.ts';

for (const kind of ['order', 'pairs']) {
  test(`${kind}: more than 1000 times retain old bests and replays; failed writes preserve scores`, async ({ page }) => {
    await page.goto('./');
    const result = await page.evaluate(async kind => {
      const orderPath = '/MarioTriviaQuiz/src/mario/gameOrder.ts';
      const pairPath = '/MarioTriviaQuiz/src/mario/pairTimes.ts';
      const order = await import(orderPath);
      const pairs = await import(pairPath);
      const key = `mariotrivia_${kind === 'order' ? 'order' : 'pair'}_times_v1`;
      const base = { player: 'Dad', difficulty: 'explorer', elapsedMs: 10000, completedAt: '2026-10-14T12:00:00Z',
        ...(kind === 'order' ? { ruleset: 'order-v2', challenge: 'easy', tiles: 4, attempts: 1 }
          : { ruleset: 'pairs-v1', variant: 'time-trial', pairs: 12, goal: 4, target: null, unlockPairs: 0, moves: 4 }) };
      const best = { ...base, id: 'old-best', elapsedMs: 1000, replay: { version: 1, kind, title: 'Old best', frames: [
        { atMs: 1000, event: 'Complete', tiles: [{ id: 'a', label: 'Mario', state: 'correct' }] },
      ] } };
      const initial = [...Array.from({ length: 999 }, (_, i) => ({ ...base, id: `newer-${i}` })), best];
      localStorage.setItem(key, JSON.stringify(initial));
      const save = (item: object) => kind === 'order' ? order.saveOrderTime(item) : pairs.savePairTime(item, true);
      const saved = save({ ...base, id: 'latest', elapsedMs: 20000 });
      const after = localStorage.getItem(key)!;
      const records = JSON.parse(after);
      save({ ...base, id: 'latest', elapsedMs: 1 });
      const duplicateUnchanged = localStorage.getItem(key) === after;
      const originalSet = Storage.prototype.setItem;
      let failed: boolean;
      try {
        Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
        failed = save({ ...base, id: 'quota-failure' });
      } finally { Storage.prototype.setItem = originalSet; }
      return { saved, count: records.length, bestPreserved: JSON.stringify(records.find((item: { id: string }) => item.id === best.id)) === JSON.stringify(best),
        duplicateUnchanged, failed, failureUnchanged: localStorage.getItem(key) === after };
    }, kind);
    expect(result).toEqual({ saved: true, count: 1001, bestPreserved: true, duplicateUnchanged: true, failed: false, failureUnchanged: true });
    await page.getByRole('button', { name: 'High Scores' }).click();
    const row = page.locator('.order-leaderboard li').first();
    await expect(row).toContainText('1.0s');
    await expect(row.getByRole('button', { name: 'Replay', exact: false })).toBeVisible();
  });
}

test('both live score displays agree immediately after either player answers and after rewind', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: '2 Players' }).click();
  await page.getByRole('button', { name: 'Track Finder' }).click();
  if (await page.locator('.setup-settings:not([open])').count()) await page.locator('.setup-settings > summary').click();
  await page.getByLabel('Player name', { exact: true }).fill('Dad');
  await page.getByLabel('Player 2 name').fill('Blaize');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  for (const [index, name] of ['Dad', 'Blaize'].entries()) {
    const prompt = await page.locator('.quiz-panel h1').innerText();
    const task = TRACK_CHALLENGES.find(item => item.prompt === prompt)!;
    const visible = await page.locator('.finder-grid button').allTextContents();
    const course = BOOSTER_COURSES.find(item => task.correctIds.includes(item.id) && visible.includes(task.kind === 'system' ? trackLabel(item.title) : item.title))!;
    const answer = page.locator('.finder-grid button').filter({ hasText: task.kind === 'system' ? trackLabel(course.title) : course.title });
    await answer.click();
    await expect(page.locator('.score-display')).toContainText(`${name} · 1 correct · 1 points`);
    await expect(page.locator('.versus-now-playing')).toContainText(`Dad: 1 points · Blaize: ${index} points`);
    await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
    await expect(page.locator('.score-display')).toContainText(`${name} · 0 correct · 0 points`);
    await expect(page.locator('.versus-now-playing')).toContainText(`Dad: ${index} points · Blaize: 0 points`);
    await answer.click();
    await page.getByRole('button', { name: 'Next turn', exact: false }).click();
    await expect(page.locator('.versus-now-playing')).toContainText(`Dad: 1 points · Blaize: ${index} points`);
  }
});
