import { expect, test } from '@playwright/test';
import { createRounds, DEFAULT_PAIR_OPTIONS } from '../src/mario/rounds.ts';
import { seededBotRandom } from '../src/mario/memoryBot.ts';
import { computerRoundTime } from '../src/mario/botTiming.ts';

test('matching exposes only useful human controls and explains Shroomer memory', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Match & Hunt' }).click();
  await page.locator('.setup-settings > summary').click();
  for (const format of ['Solo', 'Two Players']) {
    await page.getByRole('button', { name: format, exact: true }).click();
    await expect(page.getByRole('group', { name: 'Difficulty', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Rookie|Pro|Legend/ })).toHaveCount(0);
    await expect(page.getByLabel('Selected settings')).not.toContainText('Rookie');
    await expect(page.getByRole('group', { name: 'Board pairs' })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Play Shroomer', exact: true }).click();
  const memory = page.getByRole('group', { name: 'Shroomer memory' });
  await expect(memory).toBeVisible();
  await memory.getByRole('button', { name: /Legend/ }).click();
  await expect(page.locator('.setup-settings > .selected-setting-help')).toContainText('remembers 40 revealed cards');
  await page.getByRole('button', { name: 'Two Players', exact: true }).click();
  await expect(memory).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Match & Hunt' }).click();
  await expect(page.getByLabel('Selected settings')).not.toContainText('Legend');
});

test('each other game describes its actual level changes', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  for (const [game, rookie, legend] of [
    ['Quiz Battle', '4 attempts per question', '1 attempt per question'],
    ['Clue Match Up', '4 clue pairs · up to 4 wrong matches', '8 clue pairs · up to 1 wrong match'],
    ['Clue Duel', '4 answer choices', '8 answer choices'],
    ['Track Finder', '4 track tiles · 3 rounds', '9 track tiles · 5 rounds'],
    ['Category Finder', '9 tiles · broad groups', '9 tiles · character abilities'],
  ]) {
    await page.getByRole('button', { name: game }).click();
    await page.locator('.setup-settings > summary').click();
    const levels = page.getByRole('group', { name: 'Difficulty', exact: true });
    await levels.getByRole('button', { name: /Rookie/ }).click();
    await expect(page.locator('.setup-settings > .selected-setting-help')).toContainText(rookie);
    await levels.getByRole('button', { name: /Legend/ }).click();
    await expect(page.locator('.setup-settings > .selected-setting-help')).toContainText(legend);
    await page.getByRole('button', { name: 'Back to games', exact: false }).click();
  }
});

test('Game Order uses explicit settings and only shows levels for Shroomer pace', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Game Order', exact: false }).click();
  await page.locator('.setup-settings > summary').click();
  for (const format of ['Solo', 'Two Players']) {
    await page.getByRole('button', { name: format, exact: true }).click();
    await expect(page.getByRole('button', { name: /Rookie|Pro|Legend/ })).toHaveCount(0);
    await expect(page.getByLabel('Selected settings')).not.toContainText('Rookie');
  }
  await page.getByRole('group', { name: 'Game Order tile count' }).getByRole('button', { name: '6', exact: true }).click();
  await page.getByRole('group', { name: 'Game Order rounds' }).getByRole('button', { name: '4', exact: true }).click();
  await page.getByRole('group', { name: 'Game Order challenge' }).getByRole('button', { name: /Hard/ }).click();
  await page.getByRole('button', { name: 'Play Shroomer', exact: true }).click();
  await page.getByRole('group', { name: 'Shroomer pace' }).getByRole('button', { name: /Legend/ }).click();
  await expect(page.getByLabel('Selected settings')).toContainText('6 tiles · 4 rounds · Hard');
  await expect(page.locator('.setup-settings > .selected-setting-help')).toContainText('faster pace');
  await page.getByRole('button', { name: 'Two Players', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Game Order', exact: false }).click();
  await expect(page.getByLabel('Selected settings')).toContainText('6 tiles · 4 rounds · Hard');
  await expect(page.getByLabel('Selected settings')).not.toContainText('Legend');
  await page.locator('.setup-settings > summary').click();
  await page.screenshot({ path: test.info().outputPath('game-order-controls.png'), fullPage: true });
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await expect(page.locator('.quiz-topline')).toContainText('of 4 each');
  await expect(page.locator('.quiz-topline')).toContainText('Hard · 6 tiles');
  await page.reload();
  await page.getByRole('button', { name: /Resume/ }).click();
  await expect(page.locator('.quiz-topline')).toContainText('of 4 each');
  await expect(page.locator('.quiz-topline')).toContainText('Hard · 6 tiles');
});

test('championship only offers levels that affect selected games or Shroomer', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Championship', exact: false }).click();
  await page.locator('.setup-settings > summary').click();
  for (const name of ['Quiz Battle', 'Clue Match Up', 'Clue Duel', 'Track Finder', 'Category Finder']) {
    const chip = page.locator('.champ-game-toggle').filter({ hasText: name });
    if (await chip.getAttribute('aria-pressed') === 'true') await chip.click();
  }
  for (const name of ['Game Order', 'Match & Hunt']) {
    const chip = page.locator('.champ-game-toggle').filter({ hasText: name });
    if (await chip.getAttribute('aria-pressed') !== 'true') await chip.click();
  }
  await expect(page.getByRole('group', { name: 'Championship difficulty' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Rookie|Pro|Legend/ })).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Game Order rounds' })).toHaveCount(0);
  await page.screenshot({ path: test.info().outputPath('board-championship-controls.png'), fullPage: true });
  await page.getByRole('button', { name: 'Play Shroomer', exact: true }).click();
  await expect(page.getByRole('group', { name: 'Shroomer level' })).toContainText('Shroomer');
  await page.getByRole('button', { name: 'Two Players', exact: true }).click();
  await expect(page.getByRole('group', { name: 'Shroomer level' })).toHaveCount(0);
  await page.locator('.champ-game-toggle').filter({ hasText: 'Track Finder' }).click();
  const levels = page.getByRole('group', { name: 'Championship difficulty' });
  await expect(levels).toContainText('4 track tiles');
  await expect(levels).not.toContainText('Quiz');
  await expect(levels).not.toContainText('rounds');
});

test('fixed human boards ignore old levels but Shroomer pace still changes', () => {
  const options = { tiles: 6, challenge: 'medium' as const };
  for (const mode of ['game-order', 'pair-match'] as const) {
    const rookie = createRounds(mode, 'mixed', 'explorer', seededBotRandom('audit'), DEFAULT_PAIR_OPTIONS, 3, options);
    const legend = createRounds(mode, 'mixed', 'professor', seededBotRandom('audit'), DEFAULT_PAIR_OPTIONS, 3, options);
    expect(legend).toEqual(rookie);
    if (mode === 'game-order') expect(computerRoundTime(rookie[0], 'professor', () => 0.5)).toBeLessThan(computerRoundTime(rookie[0], 'explorer', () => 0.5));
  }
  for (const [index, level] of (['explorer', 'scientist', 'professor'] as const).entries()) {
    const random = () => seededBotRandom(`level-${index}`);
    const quiz = createRounds('quiz', 'mixed', level, random());
    expect(quiz.every(round => round.mode === 'quiz' && round.question.difficulty === level)).toBe(true);
    const clues = createRounds('clue-duel', 'mixed', level, random());
    expect(clues.every(round => round.mode === 'clue-duel' && round.choices.length === [4, 6, 8][index])).toBe(true);
    const pairs = createRounds('match-hunt', 'mixed', level, random());
    expect(pairs.every(round => round.mode === 'match-hunt' && round.pairs.length === [4, 6, 8][index])).toBe(true);
    const tracks = createRounds('track-finder', 'mixed', level, random());
    expect(tracks.every(round => round.mode === 'track-finder' && round.tiles.length === [4, 6, 9][index])).toBe(true);
  }
});

for (const width of [390, 800]) {
  test(`matching puts a full third row of cards on screen at ${width}px`, async ({ page }) => {
    await page.clock.install();
    await page.setViewportSize({ width, height: 740 });
    await page.goto('./');
    await page.getByRole('button', { name: 'Play Games' }).click();
    await page.getByRole('button', { name: 'Match & Hunt' }).click();
    await page.locator('.setup-settings > summary').click();
    await page.getByRole('button', { name: 'Two Players', exact: true }).click();
    await page.getByRole('group', { name: 'Matching mode' }).getByRole('button', { name: 'Time Trial' }).click();
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
    await page.clock.runFor(4000);
    await expect(page.locator('.pair-card')).toHaveCount(24);
    await expect(page.locator('.timer-countdown')).toBeHidden();
    await page.evaluate(() => scrollTo(0, 0));
    const first = await page.locator('.pair-card').first().boundingBox();
    const thirdRow = await page.locator('.pair-card').nth(11).boundingBox();
    expect(first!.y).toBeLessThan(330);
    expect(thirdRow!.y + thirdRow!.height).toBeLessThan(740);
    expect(first!.height).toBeGreaterThanOrEqual(80);
    const restart = await page.getByRole('button', { name: 'Restart go', exact: false }).boundingBox();
    expect(restart!.height).toBeGreaterThanOrEqual(44);
    await expect(page.getByRole('timer')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`compact-board-${width}.png`) });
  });
}
