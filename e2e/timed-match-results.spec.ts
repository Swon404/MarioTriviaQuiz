import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 740 }, isMobile: true, hasTouch: true });

test('Hunt keeps different targets and repeated players in one Top 5 without losing old records', async ({ page }) => {
  await page.goto('./');
  const result = await page.evaluate(async () => {
    const path = '/MarioTriviaQuiz/src/mario/pairTimes.ts';
    const { getPairTimes, pairLeaderboard, savePairTime } = await import(path);
    const base = { player: 'Ada', difficulty: 'explorer', ruleset: 'pairs-v1', variant: 'hunt', pairs: 12, goal: 12, target: 'mario-Yoshi', unlockPairs: 0, moves: 1, completedAt: '2026-10-26T12:00:00Z' };
    // Existing records need no destructive migration or re-save.
    localStorage.setItem('mariotrivia_pair_times_v1', JSON.stringify([
      { ...base, id: 'old-mario', elapsedMs: 10000 },
      { ...base, id: 'old-luigi', difficulty: 'professor', target: 'kart-Luigi', elapsedMs: 14000 },
    ]));
    for (const [index, elapsedMs] of [9000, 13000, 12000, 30000].entries()) {
      savePairTime({ ...base, id: `new-${index}`, difficulty: 'scientist', target: 'mario-Princess Peach', elapsedMs }, true);
    }
    savePairTime({ ...base, id: 'practice', elapsedMs: 1 }, false);
    savePairTime({ ...base, id: 'other-rules', unlockPairs: 2, elapsedMs: 1 }, true);
    savePairTime({ ...base, id: 'all-pairs', target: null, elapsedMs: 1 }, true);
    savePairTime({ ...base, id: 'bigger-board', pairs: 16, goal: 16, elapsedMs: 1 }, true);
    const round = { variant: 'hunt', pairs: Array(12), goal: 12, targetPairId: 'kart-Wario', unlockPairs: 0 };
    return { times: pairLeaderboard(round, 'explorer').map((item: { elapsedMs: number }) => item.elapsedMs), count: getPairTimes().length };
  });
  expect(result).toEqual({ times: [9000, 10000, 12000, 13000, 14000], count: 9 });
  await page.reload();
  await page.getByRole('button', { name: 'High Scores' }).click();
  const board = page.locator('.order-leaderboard').filter({ hasText: 'All targets · unlock after 0 pairs' }).filter({ hasText: '12 pairs' });
  await expect(board.locator('li')).toHaveCount(5);
  await expect(board.locator('li > strong')).toHaveText(['9.0s', '10.0s', '12.0s', '13.0s', '14.0s']);
  await expect(board).toContainText('Luigi');
  await expect(board).not.toContainText('Rookie');
  await expect(board).not.toContainText('Legend');
});

test('phone timed results show both times, the winner, and every qualifying run immediately', async ({ page }) => {
  test.setTimeout(120_000);
  // Fix Date.now for exact results, while keeping Safari animations and input
  // scheduling live (a fully paused clock can freeze a card's hover transition).
  let now = Date.parse('2026-10-26T12:00:00Z');
  await page.clock.setFixedTime(now);
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Match & Hunt' }).click();
  await page.locator('.setup-settings > summary').click();
  await page.getByRole('button', { name: 'Two Players', exact: true }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByLabel('Player 2 name').fill('Dad');
  await page.getByRole('group', { name: 'Hunt timer' }).getByRole('button', { name: 'On' }).click();
  await page.getByRole('group', { name: 'Hunt target mode' }).getByRole('button', { name: 'Random', exact: true }).click();
  await page.getByRole('group', { name: 'Target unlock' }).getByRole('button', { name: '0', exact: true }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const times = [5000, 3000, 4000, 6000, 2000, 10000];
  for (const [index, time] of times.entries()) {
    await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
    await expect(page.locator('.pair-card')).toHaveCount(24);
    const target = await page.evaluate(() => {
      const saved = JSON.parse(JSON.parse(localStorage.getItem('mariotrivia_checkpoint_v1')!).payload);
      return saved.session.rounds[saved.session.index].targetPairId;
    });
    now += time;
    await page.clock.setFixedTime(now);
    await expect(page.getByRole('timer')).toContainText(`${(time / 1000).toFixed(1)}s`);
    await page.locator('.pair-card').last().scrollIntoViewIfNeeded();
    const timer = await page.getByRole('timer').boundingBox();
    expect(timer!.y).toBeGreaterThanOrEqual(0);
    expect(timer!.y + timer!.height).toBeLessThan(740);
    await page.locator(`.pair-card[data-pair-id="${target}"][data-kind="icon"]`).click();
    await page.locator(`.pair-card[data-pair-id="${target}"][data-kind="word"]`).click();
    const result = page.getByRole('region', { name: 'Round times' });
    await expect(result).toContainText(`${index % 2 ? 'Dad' : 'Ada'}’s time:`);
    await expect(result).toContainText(`${(time / 1000).toFixed(1)}s`);
    if (index % 2) {
      await expect(result).toContainText(`${(times[index - 1] / 1000).toFixed(1)}s`);
      await expect(result).toContainText(`${time < times[index - 1] ? 'Dad' : 'Ada'} wins in ${(Math.min(time, times[index - 1]) / 1000).toFixed(1)}s — +1 point!`);
    } else await expect(result).toContainText('Waiting for the other player');
    const board = page.getByRole('region', { name: 'Match & Hunt Top 5' });
    await expect(board.locator('li')).toHaveCount(Math.min(index + 1, 5));
    await expect(board.locator('.current-time')).toHaveCount(index < 5 ? 1 : 0);
    await expect(page.locator('.match-message')).toContainText(index < 5 ? 'in the Top 5!' : 'Outside the Top 5');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (index === 1) {
      await page.screenshot({ path: test.info().outputPath('phone-round-times.png'), fullPage: true });
      await page.reload();
      await page.getByRole('button', { name: 'Resume game', exact: true }).click();
      await expect(result).toContainText('Dad wins in 3.0s');
      await expect(board.locator('li')).toHaveCount(2);
    }
    if (index < times.length - 1) await page.getByRole('button', { name: 'Next turn', exact: false }).click();
  }
  await page.getByRole('button', { name: 'Rewind', exact: false }).click();
  await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
  await expect(page.locator('.pair-card')).toHaveCount(24);
  await page.clock.setFixedTime(now + 1000);
  const target = await page.evaluate(() => {
    const saved = JSON.parse(JSON.parse(localStorage.getItem('mariotrivia_checkpoint_v1')!).payload);
    return saved.session.rounds[saved.session.index].targetPairId;
  });
  await page.locator(`.pair-card[data-pair-id="${target}"][data-kind="icon"]`).click();
  await page.locator(`.pair-card[data-pair-id="${target}"][data-kind="word"]`).click();
  await expect(page.locator('.match-message')).toContainText('Practice complete');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_pair_times_v1')!).length)).toBe(6);
});
