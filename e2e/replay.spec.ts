import { expect, test } from '@playwright/test';

for (const kind of ['order', 'pairs'] as const) {
  test(`${kind} replay clock ticks between actions, freezes on Stop and finishes at the recorded time`, async ({ page }) => {
    await page.clock.install({ time: new Date('2026-10-14T12:00:00Z') });
    await page.clock.pauseAt(new Date('2026-10-14T12:00:01Z'));
    await page.goto('./');
    const key = kind === 'order' ? 'mariotrivia_order_times_v1' : 'mariotrivia_pair_times_v1';
    await page.evaluate(({ kind, key }) => {
      const tiles = [{ id: 'a', label: 'Mario', state: 'shown' }, { id: 'b', label: 'Luigi', state: 'shown' }];
      const replay = { version: 1, kind, title: 'Dad replay', frames: [
        { atMs: 0, event: 'Timer started', tiles },
        { atMs: 2000, event: 'Tile selected', tiles: [{ ...tiles[0], state: 'selected' }, tiles[1]] },
        { atMs: 4000, event: 'Board complete', tiles: tiles.map(tile => ({ ...tile, state: 'correct' })) },
      ] };
      const common = { id: 'clock-test', player: 'Dad', difficulty: 'explorer', elapsedMs: 4000, completedAt: '2026-10-14T12:00:00Z', replay };
      localStorage.setItem(key, JSON.stringify([kind === 'order'
        ? { ...common, ruleset: 'order-v2', challenge: 'easy', tiles: 4, attempts: 1 }
        : { ...common, ruleset: 'pairs-v1', variant: 'time-trial', pairs: 12, goal: 4, target: null, unlockPairs: 0, moves: 4 }]));
    }, { kind, key });
    const stored = await page.evaluate(key => localStorage.getItem(key), key);
    await page.getByRole('button', { name: 'High Scores' }).click();
    await page.getByRole('button', { name: 'Replay', exact: false }).click();
    const dialog = page.getByRole('dialog');
    const clock = dialog.getByRole('timer', { name: 'Replay time' });
    await expect(clock).toHaveText('0.0s');
    await dialog.getByRole('button', { name: 'Start replay' }).click();
    await page.clock.runFor(500);
    await expect(clock).toHaveText('0.5s');
    await expect(dialog).toContainText('Timer started');
    await page.clock.runFor(500);
    await expect(clock).toHaveText('1.0s');
    await dialog.getByRole('button', { name: 'Stop replay' }).click();
    await page.clock.runFor(3000);
    await expect(clock).toHaveText('1.0s');
    await expect(dialog).toContainText('Timer started');
    await dialog.getByRole('button', { name: 'Start replay' }).click();
    await expect(clock).toHaveText('0.0s');
    await page.clock.runFor(2000);
    await expect(dialog).toContainText('Tile selected');
    await page.clock.runFor(500);
    await expect(clock).toHaveText('2.5s');
    await page.clock.runFor(1500);
    await expect(clock).toHaveText('4.0s');
    await expect(dialog).toContainText('Replay finished');
    await expect(dialog.getByRole('button', { name: 'Stop replay' })).toBeDisabled();
    await page.clock.runFor(3000);
    await expect(clock).toHaveText('4.0s');
    await dialog.getByRole('button', { name: 'Start replay' }).click();
    await page.clock.runFor(500);
    await dialog.getByRole('button', { name: 'Back', exact: false }).click();
    await page.clock.runFor(5000);
    await page.getByRole('button', { name: 'Replay', exact: false }).click();
    await expect(clock).toHaveText('0.0s');
    await page.clock.runFor(500);
    await expect(clock).toHaveText('0.0s');
    expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(stored);
  });
}

test('Replay plays selections and completion on a phone; cleanup confirms and can be undone', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-11T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-11T12:00:01Z'));
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
  const firstRow = table.locator('.order-leaderboard li').first();
  const nameBox = await firstRow.locator('span').boundingBox();
  const buttonBox = await firstRow.getByRole('button', { name: 'Replay' }).boundingBox();
  const timeBox = await firstRow.locator('strong').boundingBox();
  expect(nameBox && buttonBox && timeBox).toBeTruthy();
  expect(Math.abs(nameBox!.y + nameBox!.height / 2 - buttonBox!.y - buttonBox!.height / 2)).toBeLessThan(2);
  expect(Math.abs(timeBox!.y + timeBox!.height / 2 - buttonBox!.y - buttonBox!.height / 2)).toBeLessThan(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await table.locator('.board-replay').first().getByRole('button', { name: 'Replay', exact: false }).click();
  const replay = page.getByRole('dialog');
  await replay.getByRole('button', { name: 'Start replay' }).click();
  await page.clock.runFor(80);
  await expect(replay.locator('.replay-selected')).toHaveCount(1);
  await replay.getByRole('button', { name: 'Stop replay' }).click();
  await page.clock.runFor(500);
  await expect(replay.locator('.replay-selected')).toHaveCount(1);
  await replay.getByRole('button', { name: 'Start replay' }).click();
  await page.clock.runFor(80);
  await expect(replay.locator('.replay-selected')).toHaveCount(1);
  await page.clock.runFor(80);
  await expect(replay).toContainText('Replay finished');
  await expect(replay.locator('.replay-correct')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/replay-phone.png', fullPage: true });
  await replay.getByRole('button', { name: 'Back', exact: false }).click();
  page.once('dialog', dialog => dialog.dismiss());
  await table.getByRole('button', { name: 'Keep best per table' }).click();
  await expect(table.locator('.order-leaderboard li')).toHaveCount(2);
  page.once('dialog', dialog => dialog.accept());
  await table.getByRole('button', { name: 'Keep best per table' }).click();
  await expect(table.locator('.order-leaderboard li')).toHaveCount(1);
  await table.getByRole('button', { name: 'Undo cleanup' }).click();
  await expect(table.locator('.order-leaderboard li')).toHaveCount(2);
});
