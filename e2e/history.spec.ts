import { expect, test, type Page } from '@playwright/test';
import { QUESTIONS } from '../src/mario/questions.ts';
import { MATCH_CLUES } from '../src/mario/matchClues.ts';
import { CLUE_SUBJECTS } from '../src/mario/clues.ts';
import { TRACK_CHALLENGES } from '../src/mario/trackChallenges.ts';
import { CATEGORY_ITEMS, CATEGORY_LABELS } from '../src/mario/categoryCatalog.ts';

const KEY = 'mariotrivia_question_history_v1';
for (const mode of ['Clue Duel', 'Track Finder', 'Category Finder']) {
  const all = mode === 'Clue Duel' ? CLUE_SUBJECTS.map(subject => `clue-${subject.id}`) : mode === 'Track Finder' ? TRACK_CHALLENGES.map(task => `finder-${task.id}`)
    : Array.from({ length: CATEGORY_ITEMS.length - 8 }, (_, start) => [...new Set(CATEGORY_ITEMS.slice(start, start + 9).map(item => item.category))].map(category => `category-3-${start}-${category}`)).flat();
  test(`${mode} remembers only the visible challenge and prefers fresh ones after reload`, async ({ page }) => {
    await page.goto('./');
    await open(page, mode);
    await page.getByLabel('Player name', { exact: true }).fill('Ada');
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    const first = (await history(page)).ada;
    expect(first).toHaveLength(1);
    expect(all).toContain(first[0]);
    await page.reload();
    await open(page, mode);
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    const second = (await history(page)).ada;
    expect(second).toHaveLength(2);
    expect(second[0]).not.toBe(first[0]);
    await expect(page.locator('.review-note')).toHaveCount(0);
  });
  test(`${mode} uses both players' histories and records the visible question immediately`, async ({ page }) => {
    await page.goto('./');
    await page.evaluate(({ key, ids }) => localStorage.setItem(key, JSON.stringify({ ben: ids })), { key: KEY, ids: all });
    await open(page, mode);
    await page.getByRole('button', { name: 'Two Players', exact: true }).click();
    await page.getByLabel('Player name', { exact: true }).fill('Ada');
    await page.getByLabel('Player 2 name').fill('Ben');
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    await expect(page.locator('.review-note')).toContainText('Review challenge');
    expect((await history(page)).ada).toHaveLength(1);
    expect((await history(page)).ben[0]).toBe((await history(page)).ada[0]);
  });
}

test('Matching prefers knowledge not already seen in Quiz Battle and labels reused boards', async ({ page }) => {
  const freshIds = [...new Set(MATCH_CLUES.filter(item => item.difficulty === 'explorer').map(item => item.question.knowledgeId))].slice(0, 4);
  await page.goto('./');
  await page.evaluate(({ key, ids }) => localStorage.setItem(key, JSON.stringify({ ada: ids })), { key: KEY, ids: QUESTIONS.map(question => question.knowledgeId).filter(id => !freshIds.includes(id)) });
  await open(page, 'Clue Match Up');
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const shown = await page.locator('.match-column').last().locator('button').allTextContents();
  expect(shown).toHaveLength(4);
  const shownIds = shown.map(text => {
    const clue = MATCH_CLUES.find(item => item.clue === text);
    expect(clue, `Visible clue must come from the catalogue: ${text}`).toBeDefined();
    expect(clue!.difficulty).toBe('explorer');
    return clue!.question.knowledgeId;
  });
  // A fact may have more than one valid clue wording at the same level.
  // Require exactly the four unseen facts, not one randomly selected wording.
  expect(new Set(shownIds)).toEqual(new Set(freshIds));
  expect(new Set((await history(page)).ada.slice(0, 4))).toEqual(new Set(freshIds));
  await expect(page.locator('.review-note')).toHaveCount(0);
  await page.reload();
  await open(page, 'Clue Match Up');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await expect(page.locator('.review-note')).toContainText('4 familiar matches');
});
for (const level of ['Rookie', 'Pro', 'Legend']) {
  test(`Gameplay pilot reaches existing ${level} players with four choices and sourced feedback`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('./');
    await page.evaluate(({ key, ids }) => localStorage.setItem(key, JSON.stringify({ ada: ids })), { key: KEY, ids: QUESTIONS.filter(question => !question.id.startsWith('gameplay-')).map(question => question.knowledgeId) });
    await open(page);
    await page.getByLabel('Player name', { exact: true }).fill('Ada');
    await page.getByRole('button', { name: level, exact: false }).click();
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    const ids = new Set<string>();
    for (let index = 0; index < 4; index++) {
      const prompt = await page.locator('.quiz-panel h1').textContent();
      const question = QUESTIONS.find(question => question.prompt === prompt)!;
      expect(question.id).toMatch(/^gameplay-/);
      ids.add(question.id);
      await expect(page.locator('.answer-grid button')).toHaveCount(4);
      await expect(page.locator('.review-note')).toHaveCount(0);
      await page.locator('.answer-grid').getByText(question.answer, { exact: true }).click();
      await expect(page.locator('.feedback')).toContainText(question.explanation);
      await expect(page.getByRole('link', { name: 'Check the source' })).toHaveAttribute('href', question.sourceUrl);
      await page.getByText('Open Learning Zone card', { exact: true }).click();
      await expect(page.locator('.learning-feedback article')).toBeVisible();
      await expect(page.locator('.learning-feedback article')).toContainText(question.explanation);
      await expect(page.getByRole('link', { name: 'Read Nintendo’s guide' })).toHaveAttribute('href', question.sourceUrl);
      await expect(page.locator('.quiz-panel h1')).toHaveText(prompt!);
      if (index < 3) await page.getByRole('button', { name: 'Next question' }).click();
    }
    expect(ids.size).toBe(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    if (level === 'Rookie') await page.screenshot({ path: 'test-results/gameplay-pilot-phone.png', fullPage: true, animations: 'disabled' });
  });
}
async function open(page: Page, mode = 'Quiz Battle') {
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: mode, exact: false }).click();
  if (await page.locator('.setup-settings:not([open])').count()) await page.locator('.setup-settings > summary').click();
}
async function history(page: Page): Promise<Record<string, string[]>> {
  // Board exposure is tested here; extras have separate cross-mode checks.
  return page.evaluate(key => Object.fromEntries(Object.entries(JSON.parse(localStorage.getItem(key) ?? '{}')).map(([name, ids]) => [name, (ids as string[]).filter(id => !id.startsWith('extra:'))])), KEY);
}
async function currentKnowledge(page: Page) {
  const prompt = await page.locator('.quiz-panel h1').textContent();
  return QUESTIONS.find(item => item.prompt === prompt)!.knowledgeId;
}

test('Shroomer finder shows its board and records the answered challenge', async ({ page }) => {
  await page.goto('./');
  await open(page, 'Category Finder');
  await page.getByRole('button', { name: 'Play Shroomer', exact: true }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const prompt = await page.locator('.quiz-panel h1').textContent();
  const labels = await page.locator('.category-grid button span').allTextContents();
  const answer = CATEGORY_ITEMS.find(item => `Find one ${CATEGORY_LABELS[item.category]}.` === prompt && labels.includes(item.name))!;
  await page.locator('.category-grid').getByText(answer.name, { exact: true }).click();
  const seen = await history(page);
  await page.getByRole('button', { name: 'Next turn' }).click();
  await expect(page.locator('.category-grid')).toBeVisible();
  expect(await history(page)).toEqual(seen);
  await expect(page.locator('.feedback')).toBeVisible();
  await expect.poll(async () => (await history(page)).ada.length).toBe(2);
  expect((await history(page)).mushbot).toBeUndefined();
});

for (const format of ['Solo', 'Two Players', 'Play Shroomer']) {
  test(`Memory ${format} records revealed pairs only and avoids them on a fresh board`, async ({ page }) => {
    await page.goto('./');
    await open(page, 'Match & Hunt');
    await page.getByRole('button', { name: format, exact: true }).click();
    await page.getByLabel('Player name', { exact: true }).fill('Ada');
    if (format === 'Two Players') await page.getByLabel('Player 2 name').fill('Ben');
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
      const card = page.locator('.pair-card').first();
    const id = await card.getAttribute('data-pair-id');
    await card.click();
    const seen = await history(page);
    expect(seen.ada).toEqual([`memory-pair-${id}`]);
    if (format === 'Two Players') expect(seen.ben).toEqual(seen.ada);
    expect(seen.mushbot).toBeUndefined();
    await page.reload();
    await open(page, 'Match & Hunt');
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    await expect(page.locator(`.pair-card[data-pair-id="${id}"]`)).toHaveCount(0);
    expect((await history(page)).ada).toEqual([`memory-pair-${id}`]);
  });
}

test('Quiz remembers shown facts across reload, not an entire generated game', async ({ page }) => {
  await page.goto('./');
  await open(page);
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const first = await currentKnowledge(page);
  expect((await history(page)).ada).toEqual([first]);
  await page.reload();
  await open(page);
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const second = await currentKnowledge(page);
  expect(second).not.toBe(first);
  expect((await history(page)).ada).toEqual([second, first]);
  await expect(page.locator('.review-note')).toHaveCount(0);
});

test('Exhausted pools label reviews and other players still get fresh questions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await page.evaluate(({ key, ids }) => localStorage.setItem(key, JSON.stringify({ ada: ids })), { key: KEY, ids: [...new Set(QUESTIONS.map(item => item.knowledgeId))] });
  await open(page);
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await expect(page.locator('.review-note')).toContainText('Review question');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.screenshot({ path: 'test-results/review-question-phone.png', fullPage: true });
  await page.reload();
  await open(page);
  await page.getByLabel('Player name', { exact: true }).fill('Ben');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await expect(page.locator('.review-note')).toHaveCount(0);
  expect((await history(page)).ben).toHaveLength(1);
});

test('Two-player question is recorded for both viewers immediately', async ({ page }) => {
  await page.goto('./');
  await open(page);
  await page.getByRole('button', { name: 'Two Players', exact: true }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByLabel('Player 2 name').fill('Ben');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const saved = await history(page);
  expect(saved.ada).toHaveLength(1);
  expect(saved.ben).toEqual(saved.ada);
});

test('Matching facts are remembered by Quiz Battle without counting future boards', async ({ page }) => {
  await page.goto('./');
  await open(page, 'Clue Match Up');
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const clues = await page.locator('.match-column').last().locator('button').allTextContents();
  const seen = clues.map(clue => MATCH_CLUES.find(item => item.clue === clue)!.question.knowledgeId);
  expect(new Set((await history(page)).ada)).toEqual(new Set(seen));
  await page.reload();
  await open(page);
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  expect(seen).not.toContain(await currentKnowledge(page));
});

test('Corrupt history does not stop play', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(key => localStorage.setItem(key, '{invalid'), KEY);
  await open(page);
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await expect(page.locator('.answer-grid button')).toHaveCount(4);
  expect((await history(page)).ada).toHaveLength(1);
});
