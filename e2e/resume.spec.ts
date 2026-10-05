import { expect, test, type Page } from '@playwright/test';
import { QUESTIONS } from '../src/mario/questions.ts';
import { MARIO_TIMELINE } from '../src/mario/rounds.ts';
const KEY = 'mariotrivia_checkpoint_v1';
async function open(page: Page) {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Quiz Battle' }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
}
async function correct(page: Page) {
  const prompt = await page.locator('.quiz-playing h1').textContent();
  const question = QUESTIONS.find(item => item.prompt === prompt)!;
  await page.locator('.answer-grid').getByText(question.answer, { exact: true }).click();
}
async function resume(page: Page) {
  await page.reload();
  await page.getByRole('button', { name: 'Resume game', exact: true }).click();
}
test('Quiz recovery preserves retries and cannot rewind beyond Next', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const first = await page.locator('.quiz-playing h1').textContent();
  const question = QUESTIONS.find(item => item.prompt === first)!;
  const wrong = question.choices.find(choice => choice !== question.answer)!;
  await page.locator('.answer-grid').getByText(wrong, { exact: true }).click();
  await resume(page);
  await expect(page.locator('.quiz-playing h1')).toHaveText(first!);
  await expect(page.locator('.quiz-retries')).toContainText('Attempts left: 3');
  await expect(page.locator('.answer-grid button').filter({ has: page.getByText(wrong, { exact: true }) })).toBeDisabled();
  await correct(page);
  await page.getByRole('button', { name: 'Next question' }).click();
  const second = await page.locator('.quiz-playing h1').textContent();
  expect(second).not.toBe(first);
  await resume(page);
  await expect(page.locator('.quiz-playing h1')).toHaveText(second!);
  await expect(page.getByRole('button', { name: 'Rewind' })).toHaveCount(0);
});
for (const format of ['Two Players', 'Play Shroomer']) {
  test(`${format} recovery preserves the hidden handover and earned score`, async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: format, exact: true }).click();
    if (format === 'Two Players') await page.getByLabel('Player 2 name').fill('Ben');
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    await page.locator('.versus-handover .start-btn').click();
    await correct(page);
    await page.getByRole('button', { name: 'Next turn' }).click();
    await resume(page);
    await expect(page.locator('.versus-handover')).toContainText(format === 'Two Players' ? 'Ben' : 'Shroomer');
    await expect(page.locator('.answer-grid button')).toHaveCount(0);
    await expect(page.locator('.score-display')).toContainText('Ada 1');
  });
}
test('Replaying a stale completion checkpoint cannot award a game twice', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  for (let index = 0; index < 9; index++) {
    await correct(page);
    await page.getByRole('button', { name: 'Next question' }).click();
  }
  const stale = await page.evaluate(key => localStorage.getItem(key), KEY);
  await correct(page);
  await page.getByRole('button', { name: 'See result' }).click();
  const ledger = await page.evaluate(() => localStorage.getItem('mariotrivia_lifetime_v1'));
  expect(await page.evaluate(key => localStorage.getItem(key), KEY)).toBeNull();
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value!), { key: KEY, value: stale });
  await resume(page);
  await correct(page);
  await page.getByRole('button', { name: 'See result' }).click();
  expect(await page.evaluate(() => localStorage.getItem('mariotrivia_lifetime_v1'))).toBe(ledger);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_results_v1')!).length)).toBe(1);
});
test('Damaged recovery data is not offered or erased and blocked saves warn', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(key => localStorage.setItem(key, '{damaged'), KEY);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Resume game' })).toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), KEY)).toBe('{damaged');
  await open(page);
  await page.evaluate(key => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) { if (name === key) throw new DOMException('Full', 'QuotaExceededError'); original.call(this, name, value); };
  }, KEY);
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('saved for recovery');
  await correct(page);
  await expect(page.getByText('Correct!', { exact: true })).toBeVisible();
});

async function openBoard(page: Page, mode: string) {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: mode, exact: false }).click();
}
test('Game Order restores selected tiles, running time and a solved board without another save', async ({ page }) => {
  await openBoard(page, 'Game Order');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await page.getByRole('button', { name: 'Start Timer' }).click();
  const tiles = page.locator('.order-tiles button');
  const original = await tiles.locator('span').allTextContents();
  await tiles.first().click();
  const before = Number((await page.getByLabel('Puzzle time').textContent())!.replace('s', ''));
  await resume(page);
  expect(await tiles.locator('span').allTextContents()).toEqual(original);
  await expect(tiles.first()).toHaveAttribute('aria-pressed', 'true');
  expect(Number((await page.getByLabel('Puzzle time').textContent())!.replace('s', ''))).toBeGreaterThanOrEqual(before);
  await tiles.first().click(); // Clear the restored selection.
  const current = [...original];
  const sorted = [...current].sort((a, b) => MARIO_TIMELINE.find(game => game.title === a)!.year - MARIO_TIMELINE.find(game => game.title === b)!.year);
  for (let index = 0; index < sorted.length; index++) {
    const other = current.indexOf(sorted[index]);
    if (other === index) continue;
    await tiles.nth(index).click(); await tiles.nth(other).click();
    [current[index], current[other]] = [current[other], current[index]];
  }
  await page.getByRole('button', { name: 'Check order' }).click();
  const records = await page.evaluate(() => localStorage.getItem('mariotrivia_order_times_v1'));
  await resume(page);
  await expect(page.locator('.order-feedback')).toContainText('Solved in');
  expect(await page.evaluate(() => localStorage.getItem('mariotrivia_order_times_v1'))).toBe(records);
  await page.getByRole('button', { name: 'Next round', exact: true }).click();
  await resume(page);
  await expect(page.getByRole('button', { name: 'Start Timer' })).toBeVisible();
  await expect(page.locator('.order-feedback')).toHaveCount(0);
});
test('Timed matching restores found pairs and a first flip without restarting the clock', async ({ page }) => {
  await openBoard(page, 'Match & Hunt');
  await page.getByRole('button', { name: 'Time Trial', exact: false }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await page.getByRole('button', { name: 'Start Timer' }).click();
  const first = await page.locator('.pair-card').first().getAttribute('data-pair-id');
  await page.locator(`.pair-card[data-pair-id="${first}"]`).first().click();
  await page.locator(`.pair-card[data-pair-id="${first}"]`).last().click();
  const next = page.locator('.pair-card:not(.pair-card-found)').first();
  const id = await next.getAttribute('data-pair-id');
  await next.click();
  await resume(page);
  await expect(page.locator('.pair-card-found')).toHaveCount(2);
  await expect(page.locator('.pair-card-face:not(.pair-card-found)')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Start Timer' })).toHaveCount(0);
  await page.locator(`.pair-card[data-pair-id="${id}"]:not(.pair-card-face)`).click();
  await expect(page.locator('.pair-card-found')).toHaveCount(4);
});
test('Clue Duel restores revealed clues', async ({ page }) => {
  await openBoard(page, 'Clue Duel');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await page.getByRole('button', { name: 'Show next clue' }).click();
  const clues = await page.locator('.clue-list li').allTextContents();
  await resume(page);
  expect(await page.locator('.clue-list li').allTextContents()).toEqual(clues);
});
test('Championship recovery keeps totals and the next player across a leg boundary', async ({ page }) => {
  await openBoard(page, 'Championship');
  await page.getByRole('button', { name: 'Two Players', exact: true }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByLabel('Player 2 name').fill('Ben');
  await page.getByRole('button', { name: 'Quick', exact: true }).click();
  for (const mode of ['Game Order', 'Clue Match Up', 'Match & Hunt', 'Clue Duel', 'Category Finder']) await page.locator('.champ-game-toggle').filter({ hasText: mode }).click();
  await page.getByRole('button', { name: 'Start Championship', exact: true }).click();
  for (let turn = 0; turn < 6; turn++) {
    const name = turn % 2 ? 'Ben' : 'Ada';
    await page.getByRole('button', { name: `Start ${name}'s turn`, exact: true }).click();
    await correct(page);
    await page.getByRole('button', { name: turn === 5 ? 'See result' : 'Next turn' }).click();
    if (turn === 0) {
      const totals = await page.locator('.champ-live-total').textContent();
      await resume(page);
      await expect(page.getByRole('heading', { name: "Ben's turn", exact: true })).toBeVisible();
      await expect(page.locator('.champ-live-total')).toHaveText(totals!);
    }
  }
  const results = await page.evaluate(() => localStorage.getItem('mariotrivia_results_v1'));
  await resume(page);
  await page.getByRole('button', { name: 'Next: Track Finder', exact: true }).click();
  await expect(page.getByRole('heading', { name: "Ada's turn", exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('mariotrivia_results_v1'))).toBe(results);
  await expect(page.locator('.champ-live-total')).toContainText('36 EP');
});
test('Reload during a shared Hunt mismatch passes the turn and unlocks the board', async ({ page }) => {
  await openBoard(page, 'Match & Hunt');
  await page.getByRole('button', { name: 'Two Players', exact: true }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByLabel('Player 2 name').fill('Ben');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await page.getByRole('button', { name: "Start Ada's turn" }).click();
  const ids = [...new Set(await page.locator('.pair-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-pair-id'))))];
  await page.locator(`.pair-card[data-pair-id="${ids[0]}"]`).first().click();
  await page.locator(`.pair-card[data-pair-id="${ids[1]}"]`).first().click();
  await resume(page);
  await expect(page.locator('.versus-now-playing')).toContainText("Ben's turn");
  await expect(page.locator('.pair-card:not([disabled])')).toHaveCount(24);
  await expect(page.locator('.pair-card-face')).toHaveCount(0);
});
for (const mode of ['Track Finder', 'Category Finder', 'Clue Match Up']) {
  test(`${mode} restores the same board`, async ({ page }) => {
    await openBoard(page, mode);
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    const locator = mode === 'Clue Match Up' ? '.match-board button' : '.finder-grid button';
    const before = await page.locator(locator).allTextContents();
    await resume(page);
    expect(await page.locator(locator).allTextContents()).toEqual(before);
  });
}
