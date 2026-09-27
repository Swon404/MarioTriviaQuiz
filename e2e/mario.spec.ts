import { expect, test } from '@playwright/test';
import { BOOSTER_COURSES } from '../src/mario/courses.ts';
import { QUESTIONS } from '../src/mario/questions.ts';
import { CLUE_SUBJECTS } from '../src/mario/clues.ts';
import { CATEGORY_ITEMS, CATEGORY_LABELS } from '../src/mario/categoryCatalog.ts';

test('Mario Kart quiz gives four answers, feedback, and rewind before Next', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Quiz Battle' }).click();
  await page.getByLabel('Player name').fill('Blaize');
  await page.getByRole('button', { name: 'Mario Kart', exact: true }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  await expect(page.getByText('Question 1 of 10')).toBeVisible();
  await expect(page.locator('.answer-grid button')).toHaveCount(4);
  await page.locator('.answer-grid button').first().click();
  await expect(page.getByText('Fun fact:')).toBeVisible();
  await expect(page.locator('.mario-earned')).toContainText('EP');
  await page.getByRole('button', { name: 'Rewind' }).click();
  await expect(page.getByText('Fun fact:')).toHaveCount(0);
  await expect(page.locator('.answer-grid button:not([disabled])')).toHaveCount(4);
  await page.locator('.answer-grid button').first().click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByText('Question 2 of 10')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rewind' })).toHaveCount(0);
});

test('completed results survive reload and stay in a separate storage namespace', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Quiz Battle' }).click();
  await page.getByLabel('Player name').fill('Blaize');
  await page.getByRole('button', { name: 'Mario games' }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  for (let i = 0; i < 10; i += 1) {
    await page.locator('.answer-grid button').first().click();
    await page.getByRole('button', { name: i === 9 ? 'See result' : 'Next question' }).click();
  }
  await expect(page.getByText('Nice work, Blaize!')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'High Scores' }).click();
  await expect(page.locator('.score-list li')).toHaveCount(1);
  await expect(page.locator('.score-list')).toContainText('Blaize');
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toContain('mariotrivia_results_v1');
  expect(keys.some(key => key.startsWith('elementalquiz_'))).toBe(false);
});

test('quiz remains readable on a narrow phone screen', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Quiz Battle' }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  await expect(page.locator('.answer-grid button')).toHaveCount(4);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
});

test('track guide lists all 48 Booster Course Pass courses', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Explore Learning Zone' }).click();
  await page.getByRole('button', { name: 'Open track guide' }).click();
  await expect(page.locator('.wave-section')).toHaveCount(6);
  await expect(page.locator('.wave-section li')).toHaveCount(48);
  await expect(page.getByText('Wii Coconut Mall')).toBeVisible();
});

test('Explore opens the Learning Zone with clearly unconfirmed placeholders', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('./');
  await expect(page).toHaveTitle('Jump & Discover');
  await expect(page.getByRole('heading', { name: 'Jump & Discover' })).toBeVisible();
  expect(new Set(await page.locator('.title-letter').evaluateAll(letters => letters.map(letter => getComputedStyle(letter).color))).size).toBeGreaterThanOrEqual(4);
  await expect(page.getByText('Unofficial, text-only trivia about Mario games and Mario Kart tracks.')).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim())).toBe('#49334f');
  await page.getByRole('button', { name: 'Explore Learning Zone' }).click();
  await expect(page.getByRole('heading', { name: 'Learning Zone' })).toBeVisible();
  await expect(page.locator('.learning-topic-card')).toHaveCount(4);
  await expect(page.getByText('Information to be confirmed.')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Open track guide' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.getByRole('button', { name: 'Home' }).click();
  await expect(page.getByRole('button', { name: 'Explore Learning Zone' })).toBeVisible();
});

test('Game Order checks a shuffled board and rewind restarts the round', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Game Order' }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  await expect(page.locator('.order-tiles button')).toHaveCount(3);
  const initial = await page.locator('.order-tiles button').allTextContents();
  await page.getByRole('button', { name: 'Check order' }).click();
  await expect(page.getByText('Answer:')).toBeVisible();
  await page.getByRole('button', { name: 'Rewind' }).click();
  await expect(page.locator('.order-tiles button')).toHaveCount(3);
  expect(await page.locator('.order-tiles button').allTextContents()).toEqual(initial);
  await page.locator('.order-tiles button').nth(0).click();
  await page.locator('.order-tiles button').nth(1).click();
  expect(await page.locator('.order-tiles button').allTextContents()).not.toEqual(initial);
});

test('Track Finder accepts a course in the requested cup', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Track Finder' }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  await expect(page.locator('.finder-grid button')).toHaveCount(9);
  const prompt = await page.locator('.quiz-panel h1').textContent();
  const cup = prompt?.match(/Find one track from the (.+?)\./)?.[1];
  expect(cup).toBeTruthy();
  const visible = await page.locator('.finder-grid button').allTextContents();
  const answer = BOOSTER_COURSES.find(course => course.cup === cup && visible.includes(course.title));
  expect(answer).toBeTruthy();
  await page.locator('.finder-grid button').filter({ hasText: answer!.title }).click();
  await expect(page.getByText('Correct!')).toBeVisible();
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByText('Question 2 of 3')).toBeVisible();
});

test('Match & Hunt uses real pairs and rewind restarts the whole go', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Match & Hunt' }).click();
  await page.getByRole('button', { name: 'Mario games' }).click();
  await page.getByRole('button', { name: 'On', exact: true }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  const names = page.locator('.match-column').first().locator('button');
  const clues = page.locator('.match-column').last().locator('button');
  await expect(names).toHaveCount(4);
  await expect(clues).toHaveCount(4);
  const target = (await page.locator('.help-copy strong').textContent())!;
  expect(await names.allTextContents()).toContain(target);

  const first = (await clues.first().textContent())!;
  const firstAnswer = QUESTIONS.find(question => question.prompt === first)!.answer;
  const wrong = (await names.allTextContents()).find(name => name !== firstAnswer)!;
  await names.filter({ hasText: wrong }).click();
  await clues.first().click();
  await expect(page.getByText('Not a pair')).toBeVisible();
  await expect(page.getByText('0/4 pairs found')).toBeVisible();

  await page.locator('.match-column').first().getByRole('button', { name: firstAnswer, exact: true }).click();
  await clues.first().click();
  await expect(page.getByText('1/4 pairs found')).toBeVisible();
  await page.getByRole('button', { name: 'Restart go' }).click();
  await expect(page.getByText('0/4 pairs found')).toBeVisible();

  for (const clue of await clues.allTextContents()) {
    const answer = QUESTIONS.find(question => question.prompt === clue)!.answer;
    await page.locator('.match-column').first().getByRole('button', { name: answer, exact: true }).click();
    await page.locator('.match-column').last().getByRole('button', { name: clue, exact: true }).click();
  }
  await expect(page.getByText('4/4 pairs found')).toBeVisible();
  await expect(page.getByText('Fun fact:')).toBeVisible();
  await page.getByRole('button', { name: 'Rewind' }).click();
  await expect(page.getByText('0/4 pairs found')).toBeVisible();
  await expect(page.locator('.match-column').first().getByRole('button', { name: target, exact: true })).toBeEnabled();
  await expect(page.getByText('Fun fact:')).toHaveCount(0);
});

test('Clue Duel reveals five clues, accepts a guess, and rewinds before Next', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Clue Duel' }).click();
  await page.getByRole('button', { name: 'Mario games' }).click();
  await page.getByRole('button', { name: 'Professor' }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  await expect(page.getByText('Question 1 of 5')).toBeVisible();
  await expect(page.getByText('Clue 1 of 5')).toBeVisible();
  await expect(page.locator('.answer-grid button')).toHaveCount(4);
  const firstClue = (await page.locator('.clue-list li').first().textContent())!;
  const answer = CLUE_SUBJECTS.find(subject => subject.clues[0] === firstClue)!.answer;
  const wrong = (await page.locator('.answer-grid .choice-text').allTextContents()).find(choice => choice !== answer)!;
  await page.locator('.answer-grid button').filter({ hasText: wrong }).first().click();
  await expect(page.getByText('Clue 2 of 5')).toBeVisible();
  for (let clue = 3; clue <= 5; clue += 1) {
    await page.getByRole('button', { name: 'Show next clue' }).click();
    await expect(page.getByText(`Clue ${clue} of 5`)).toBeVisible();
  }
  await expect(page.locator('.clue-list li')).toHaveCount(5);
  await page.locator('.answer-grid button').filter({ hasText: answer }).first().click();
  await expect(page.getByText('Fun fact:')).toBeVisible();
  await page.getByRole('button', { name: 'Rewind' }).click();
  await expect(page.getByText('Clue 1 of 5')).toBeVisible();
  await expect(page.locator('.clue-list li')).toHaveCount(1);
  await page.locator('.answer-grid button').filter({ hasText: answer }).first().click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByText('Question 2 of 5')).toBeVisible();
  await expect(page.locator('.answer-grid button')).toHaveCount(5);
  await expect(page.getByRole('button', { name: 'Rewind' })).toHaveCount(0);
});

test('Category Finder shows a consecutive 5×5 window with a valid target', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Category Finder' }).click();
  await page.getByRole('button', { name: 'Professor' }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  await expect(page.locator('.category-grid button')).toHaveCount(25);
  const numbers = (await page.locator('.category-grid button small').allTextContents()).map(Number);
  expect(numbers).toEqual(Array.from({ length: 25 }, (_, index) => numbers[0] + index));
  const label = (await page.locator('.quiz-panel h1').textContent())!.replace(/^Find one /, '').replace(/\.$/, '');
  const category = Object.entries(CATEGORY_LABELS).find(([, value]) => value === label)![0];
  const visible = await page.locator('.category-grid button span').allTextContents();
  const target = CATEGORY_ITEMS.find(item => item.category === category && visible.includes(item.name))!;
  await page.locator('.category-grid button').nth(visible.indexOf(target.name)).click();
  await expect(page.getByText('Correct!')).toBeVisible();
  expect(await page.locator('.category-grid button.right-answer').count()).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Rewind' }).click();
  await expect(page.locator('.category-grid button:not([disabled])')).toHaveCount(25);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
});

test('two-player Quiz Battle alternates hidden turns and saves both scores', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Quiz Battle' }).click();
  await page.getByLabel('Player name').fill('Ada');
  await page.getByRole('button', { name: 'Two Players' }).click();
  await page.getByLabel('Player 2 name').fill('Ben');
  await page.getByRole('button', { name: 'Start!' }).click();
  await expect(page.getByRole('heading', { name: "Ada's turn" })).toBeVisible();
  await expect(page.locator('.answer-grid button')).toHaveCount(0);
  await page.locator('.versus-handover .start-btn').click();
  const prompt = (await page.locator('.versus-game h1').textContent())!;
  const answer = QUESTIONS.find(question => question.prompt === prompt)!.answer;
  const choices = await page.locator('.answer-grid .choice-text').allTextContents();
  await page.locator('.answer-grid button').nth(choices.indexOf(answer)).click();
  await expect(page.getByText('Correct!')).toBeVisible();
  await page.getByRole('button', { name: 'Rewind' }).click();
  await expect(page.locator('.answer-grid button:not([disabled])')).toHaveCount(4);
  await page.locator('.answer-grid button').nth(choices.indexOf(answer)).click();
  await page.getByRole('button', { name: 'Next turn' }).click();
  await expect(page.getByRole('heading', { name: "Ben's turn" })).toBeVisible();
  await expect(page.locator('.answer-grid button')).toHaveCount(0);
  await expect(page.locator('.score-display')).toContainText('Ada 1 · Ben 0');
  await page.locator('.versus-handover .start-btn').click();
  await page.locator('.answer-grid button').first().click();
  await page.getByRole('button', { name: 'Next turn' }).click();
  await expect(page.getByRole('heading', { name: "Ada's turn" })).toBeVisible();
  await expect(page.getByText('Round 2 of 5')).toBeVisible();
  for (let turn = 2; turn < 10; turn += 1) {
    await page.locator('.versus-handover .start-btn').click();
    await page.locator('.answer-grid button').first().click();
    await page.getByRole('button', { name: turn === 9 ? 'See result' : 'Next turn' }).click();
  }
  await expect(page.getByText('MATCH COMPLETE')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'High Scores' }).click();
  await expect(page.locator('.score-list')).toContainText('Ada vs Ben');
});

test('Computer Quiz Battle reveals a prechosen answer after its handover', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Quiz Battle' }).click();
  await page.getByRole('button', { name: 'Play Computer' }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  await page.locator('.versus-handover .start-btn').click();
  await page.locator('.answer-grid button').first().click();
  await page.getByRole('button', { name: 'Next turn' }).click();
  await expect(page.getByRole('heading', { name: "Computer's turn" })).toBeVisible();
  await page.locator('.versus-handover .start-btn').click();
  await expect(page.getByRole('button', { name: "Reveal Computer's answer" })).toBeVisible();
  await page.getByRole('button', { name: "Reveal Computer's answer" }).click();
  const selected = await page.locator('.answer-grid button.wrong, .answer-grid button.correct').count();
  expect(selected).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Rewind' }).click();
  await expect(page.getByRole('button', { name: "Reveal Computer's answer" })).toBeVisible();
  await page.getByRole('button', { name: "Reveal Computer's answer" }).click();
  await expect(page.getByText('Fun fact:')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
});

test('solo championship carries points into three Match & Hunt rounds and saves the total', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Championship', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'Solo Championship' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.getByLabel('Player name').fill('Blaize');
  await page.getByRole('button', { name: 'Quick' }).click();
  for (const game of ['Game Order', 'Track Finder', 'Clue Duel']) {
    await page.locator('.champ-game-toggle').filter({ hasText: game }).click();
  }
  await expect(page.locator('.champ-game-toggle.selected')).toHaveCount(2);
  await page.getByRole('button', { name: 'Start Solo Championship' }).click();
  for (let i = 0; i < 3; i += 1) {
    const prompt = (await page.locator('.quiz-panel h1').textContent())!;
    const answer = QUESTIONS.find(question => question.prompt === prompt)!.answer;
    await page.locator('.answer-grid').getByText(answer, { exact: true }).click();
    await page.getByRole('button', { name: i === 2 ? 'See result' : 'Next question' }).click();
  }
  await expect(page.locator('.champ-live-total')).toContainText('36 EP');
  await page.getByRole('button', { name: 'Next: Match & Hunt' }).click();
  for (let i = 0; i < 3; i += 1) {
    await expect(page.getByText(`Question ${i + 1} of 3`)).toBeVisible();
    const clues = await page.locator('.match-column').last().locator('button').allTextContents();
    for (const clue of clues) {
      const answer = QUESTIONS.find(question => question.prompt === clue)!.answer;
      await page.locator('.match-column').first().getByRole('button', { name: answer, exact: true }).click();
      await page.locator('.match-column').last().getByRole('button', { name: clue, exact: true }).click();
    }
    await page.getByRole('button', { name: i === 2 ? 'See result' : 'Next question' }).click();
  }
  await page.getByRole('button', { name: 'See championship result' }).click();
  await expect(page.getByText('CHAMPIONSHIP COMPLETE')).toBeVisible();
  await expect(page.locator('.result-card')).toContainText('72');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_championships_v1') || '[]'));
  expect(saved[0].points).toBe(72);
  expect(saved[0].games.map((game: { correct: number }) => game.correct)).toEqual([3, 3]);
  await page.getByRole('button', { name: 'High Scores' }).click();
  await expect(page.getByText('Championships')).toBeVisible();
  await expect(page.locator('.score-list').last()).toContainText('72 EP');
  await page.getByRole('button', { name: 'Back to games' }).click();
  await page.getByRole('button', { name: 'Home' }).click();
  await expect(page.getByText('72 EP', { exact: true })).toBeVisible();
  await expect(page.getByText('Coin Collector')).toBeVisible();
});

test('voice settings persist and EP rank progress appears on the home screen', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Voice Settings' }).click();
  await expect(page.getByRole('heading', { name: 'Voice Settings' })).toBeVisible();
  await page.getByRole('slider').fill('1.3');
  await expect(page.getByText('Speed: 1.3x')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Voice Settings' }).click();
  await expect(page.getByText('Speed: 1.3x')).toBeVisible();
  await expect(page.getByText('Rookie Racer')).toBeVisible();
  await expect(page.getByText('0 EP', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Read welcome aloud' })).toBeVisible();
  await page.evaluate(() => {
    window.speechSynthesis.speak = utterance => { (window as typeof window & { spokenText?: string }).spokenText = utterance.text; };
  });
  await page.getByRole('button', { name: 'Read welcome aloud' }).click();
  expect(await page.evaluate(() => (window as typeof window & { spokenText?: string }).spokenText)).toContain('Mario challenge');
});

test('two-player championship hands over identical games and saves both totals', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Championship', exact: false }).click();
  await page.getByRole('button', { name: 'Two Players' }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByLabel('Player 2 name').fill('Ben');
  await page.getByRole('button', { name: 'Quick' }).click();
  for (const game of ['Track Finder', 'Match & Hunt', 'Clue Duel']) await page.locator('.champ-game-toggle').filter({ hasText: game }).click();
  await page.getByRole('button', { name: 'Start Championship' }).click();
  await expect(page.getByRole('heading', { name: "Ada's turn" })).toBeVisible();
  await expect(page.locator('.answer-grid button')).toHaveCount(0);
  await page.getByRole('button', { name: "Start Ada's turn" }).click();
  const prompts: string[] = [];
  for (let i = 0; i < 3; i += 1) {
    const prompt = (await page.locator('.quiz-panel h1').textContent())!;
    prompts.push(prompt);
    const answer = QUESTIONS.find(question => question.prompt === prompt)!.answer;
    await page.locator('.answer-grid').getByText(answer, { exact: true }).click();
    await page.getByRole('button', { name: i === 2 ? 'See result' : 'Next question' }).click();
  }
  await expect(page.locator('.champ-live-total')).toContainText('Ada: 36 EP');
  await page.getByRole('button', { name: 'Pass to Ben' }).click();
  await expect(page.getByRole('heading', { name: "Ben's turn" })).toBeVisible();
  await expect(page.locator('.answer-grid button')).toHaveCount(0);
  await page.getByRole('button', { name: "Start Ben's turn" }).click();
  for (let i = 0; i < 3; i += 1) {
    const prompt = (await page.locator('.quiz-panel h1').textContent())!;
    expect(prompt).toBe(prompts[i]);
    const answer = QUESTIONS.find(question => question.prompt === prompt)!.answer;
    const wrong = (await page.locator('.answer-grid .choice-text').allTextContents()).find(choice => choice !== answer)!;
    await page.locator('.answer-grid').getByText(wrong, { exact: true }).click();
    await page.getByRole('button', { name: i === 2 ? 'See result' : 'Next question' }).click();
  }
  await page.getByRole('button', { name: 'Next: Game Order' }).click();
  await page.getByRole('button', { name: "Start Ada's turn" }).click();
  const initialOrder = await page.locator('.order-tiles button').allTextContents();
  for (let i = 0; i < 3; i += 1) {
    await page.getByRole('button', { name: 'Check order' }).click();
    await page.getByRole('button', { name: i === 2 ? 'See result' : 'Next question' }).click();
  }
  await page.getByRole('button', { name: 'Pass to Ben' }).click();
  await page.getByRole('button', { name: "Start Ben's turn" }).click();
  expect(await page.locator('.order-tiles button').allTextContents()).toEqual(initialOrder);
  for (let i = 0; i < 3; i += 1) {
    await page.getByRole('button', { name: 'Check order' }).click();
    await page.getByRole('button', { name: i === 2 ? 'See result' : 'Next question' }).click();
  }
  await page.getByRole('button', { name: 'See championship result' }).click();
  await expect(page.getByRole('heading', { name: 'Ada wins!' })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_championships_v1') || '[]'));
  expect(saved[0].points).toBe(36);
  expect(saved[0].opponentPoints).toBe(0);
  expect(saved[0].format).toBe('two-player');
});

test('Computer championship preselects answers and does not reroll after rewind', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Championship', exact: false }).click();
  await page.getByRole('button', { name: 'Play Computer' }).click();
  await page.getByRole('button', { name: 'Quick' }).click();
  for (const game of ['Track Finder', 'Match & Hunt', 'Clue Duel']) await page.locator('.champ-game-toggle').filter({ hasText: game }).click();
  await page.getByRole('button', { name: 'Start Championship' }).click();
  await page.getByRole('button', { name: "Start Player's turn" }).click();
  for (let i = 0; i < 3; i += 1) {
    await page.locator('.answer-grid button').first().click();
    await page.getByRole('button', { name: i === 2 ? 'See result' : 'Next question' }).click();
  }
  await page.getByRole('button', { name: 'Pass to Computer' }).click();
  await page.getByRole('button', { name: "Start Computer's turn" }).click();
  await page.getByRole('button', { name: "Reveal Computer's answer" }).click();
  const answer = await page.getByText('Computer chose:').textContent();
  await page.getByRole('button', { name: 'Rewind' }).click();
  await page.getByRole('button', { name: "Reveal Computer's answer" }).click();
  expect(await page.getByText('Computer chose:').textContent()).toBe(answer);
  for (let i = 0; i < 3; i += 1) {
    await page.getByRole('button', { name: i === 2 ? 'See result' : 'Next question' }).click();
    if (i < 2) await page.getByRole('button', { name: "Reveal Computer's answer" }).click();
  }
  await page.getByRole('button', { name: 'Next: Game Order' }).click();
  await page.getByRole('button', { name: "Start Player's turn" }).click();
  for (let i = 0; i < 3; i += 1) {
    await page.getByRole('button', { name: 'Check order' }).click();
    await page.getByRole('button', { name: i === 2 ? 'See result' : 'Next question' }).click();
  }
  await page.getByRole('button', { name: 'Pass to Computer' }).click();
  await page.getByRole('button', { name: "Start Computer's turn" }).click();
  for (let i = 0; i < 3; i += 1) {
    await page.getByRole('button', { name: "Reveal Computer's answer" }).click();
    await page.getByRole('button', { name: i === 2 ? 'See result' : 'Next question' }).click();
  }
  await page.getByRole('button', { name: 'See championship result' }).click();
  await expect(page.getByText('CHAMPIONSHIP COMPLETE')).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_championships_v1') || '[]'));
  expect(saved[0].format).toBe('computer');
  expect(saved[0].opponent).toBe('Computer');
  expect(saved[0].opponentGames).toHaveLength(2);
});

test('two-player championship Match & Hunt gives both players the same three targets', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Championship', exact: false }).click();
  await page.getByRole('button', { name: 'Two Players' }).click();
  await page.getByRole('button', { name: 'Quick' }).click();
  for (const game of ['Game Order', 'Track Finder', 'Clue Duel']) await page.locator('.champ-game-toggle').filter({ hasText: game }).click();
  await page.getByRole('button', { name: 'Start Championship' }).click();
  await page.getByRole('button', { name: "Start Player's turn" }).click();
  for (let i = 0; i < 3; i += 1) {
    await page.locator('.answer-grid button').first().click();
    await page.getByRole('button', { name: i === 2 ? 'See result' : 'Next question' }).click();
  }
  await page.getByRole('button', { name: 'Pass to Player 2' }).click();
  await page.getByRole('button', { name: "Start Player 2's turn" }).click();
  for (let i = 0; i < 3; i += 1) {
    await page.locator('.answer-grid button').first().click();
    await page.getByRole('button', { name: i === 2 ? 'See result' : 'Next question' }).click();
  }
  await page.getByRole('button', { name: 'Next: Match & Hunt' }).click();
  const targets: string[] = [];
  for (const name of ['Player', 'Player 2']) {
    await page.getByRole('button', { name: `Start ${name}'s turn` }).click();
    for (let i = 0; i < 3; i += 1) {
      await expect(page.getByText(`Question ${i + 1} of 3`)).toBeVisible();
      const target = (await page.locator('.help-copy strong').textContent())!;
      if (name === 'Player') targets.push(target);
      else expect(target).toBe(targets[i]);
      for (const clue of await page.locator('.match-column').last().locator('button').allTextContents()) {
        const answer = QUESTIONS.find(question => question.prompt === clue)!.answer;
        await page.locator('.match-column').first().getByRole('button', { name: answer, exact: true }).click();
        await page.locator('.match-column').last().getByRole('button', { name: clue, exact: true }).click();
      }
      await page.getByRole('button', { name: i === 2 ? 'See result' : 'Next question' }).click();
    }
    await page.getByRole('button', { name: name === 'Player' ? 'Pass to Player 2' : 'See championship result' }).click();
  }
  await expect(page.getByText('CHAMPIONSHIP COMPLETE')).toBeVisible();
});
