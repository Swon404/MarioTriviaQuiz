import { expect, test } from '@playwright/test';

test('Replay plays selections and completion on a phone; cleanup confirms and can be undone', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('./');
  await page.evaluate(() => {
    const tiles = [{ id: 'a', label: 'Super Mario Bros.', state: 'shown' }, { id: 'b', label: 'Super Mario Galaxy', state: 'shown' }, { id: 'c', label: 'Super Mario Odyssey', state: 'shown' }];
    const replay = { version: 1, kind: 'order', title: 'Ada · Game Order', frames: [
      { atMs: 0, event: 'Timer started', tiles },
      { atMs: 80, event: 'Tile selected', tiles: tiles.map((tile, i) => ({ ...tile, state: i === 0 ? 'selected' : 'shown' })) },
      { atMs: 160, event: 'Check 1: 3/3 correct', tiles: tiles.map(tile => ({ ...tile, state: 'correct' })) },
    ] };
    const base = { id: 'best', player: 'Ada', difficulty: 'explorer', challenge: 'easy', tiles: 3, elapsedMs: 160, attempts: 1, ruleset: 'order-v2', replay };
    localStorage.setItem('mariotrivia_order_times_v1', JSON.stringify([base, { ...base, id: 'slow', player: 'Ben', elapsedMs: 200 }]));
  });
  await page.getByRole('button', { name: 'High Scores' }).click();
  const table = page.getByRole('heading', { name: 'Game Order · fastest times' }).locator('..');
  const replay = table.locator('.board-replay').first();
  await replay.locator('summary').click();
  await replay.getByRole('button', { name: 'Play replay' }).click();
  await expect(replay).toContainText('Replay finished');
  await expect(replay.locator('.replay-correct')).toHaveCount(3);
  await replay.getByRole('button', { name: 'Previous event' }).click();
  await expect(replay.locator('.replay-selected')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/replay-phone.png', fullPage: true });
  page.once('dialog', dialog => dialog.dismiss());
  await table.getByRole('button', { name: 'Keep best per table' }).click();
  await expect(table.locator('.order-leaderboard li')).toHaveCount(2);
  page.once('dialog', dialog => dialog.accept());
  await table.getByRole('button', { name: 'Keep best per table' }).click();
  await expect(table.locator('.order-leaderboard li')).toHaveCount(1);
  await table.getByRole('button', { name: 'Undo cleanup' }).click();
  await expect(table.locator('.order-leaderboard li')).toHaveCount(2);
});
