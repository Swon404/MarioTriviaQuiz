import { expect, test } from '@playwright/test';
import { BOOSTER_COURSES } from '../src/mario/courses.ts';
import { QUESTIONS } from '../src/mario/questions.ts';
import { CLUE_SUBJECTS } from '../src/mario/clues.ts';
import { CATEGORY_ITEMS, CATEGORY_LABELS } from '../src/mario/categoryCatalog.ts';

test('mixed quiz gives four answers, feedback, and rewind before Next', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Quiz Battle' }).click();
  await page.getByLabel('Player name').fill('Blaize');
  await expect(page.getByRole('group', { name: 'Topic' })).toHaveCount(0);
  for (const level of ['Rookie', 'Pro', 'Legend']) {
    await expect(page.getByRole('button', { name: level })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Pro' }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  await expect(page.locator('.quiz-topline')).toContainText('Pro');
  await expect(page.getByText('Question 1 of 10')).toBeVisible();
  await expect(page.locator('.score-display')).toContainText('Blaize · 0 correct · 0 EP');
  await expect(page.locator('.answer-grid button')).toHaveCount(4);
  await page.locator('.answer-grid button').first().click();
  await expect(page.getByText('Fun fact:')).toBeVisible();
  await expect(page.locator('.mario-earned')).toContainText('EP');
  await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
  await expect(page.getByText('Fun fact:')).toHaveCount(0);
  await expect(page.locator('.answer-grid button:not([disabled])')).toHaveCount(4);
  await page.locator('.answer-grid button').first().click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByText('Question 2 of 10')).toBeVisible();
  await expect(page.locator('.score-display')).toContainText(/Blaize · [01] correct · \d+ EP/);
  await expect(page.locator('.score-display')).not.toContainText('NaN');
  await expect(page.getByRole('button', { name: '↶ Rewind', exact: true })).toHaveCount(0);
});

test('completed results survive reload and stay in a separate storage namespace', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Quiz Battle' }).click();
  await page.getByLabel('Player name').fill('Blaize');
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
  await expect(page.locator('.score-list')).toContainText('Rookie');
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toContain('mariotrivia_results_v1');
  expect(keys.some(key => key.startsWith('elementalquiz_'))).toBe(false);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_results_v1') || '[]')[0].topic)).toBe('mixed');
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
  await expect(page).toHaveTitle('Mushroom Power Quiz');
  await expect(page.getByRole('heading', { name: 'Mushroom Power Quiz' })).toBeVisible();
  await expect(page.locator('.title-word')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundImage)).toContain('platform-landscape.png');
  expect(new Set(await page.locator('.title-letter').evaluateAll(letters => letters.map(letter => getComputedStyle(letter).color))).size).toBeGreaterThanOrEqual(4);
  expect(await page.locator('.title-word').first().locator('.title-letter').evaluateAll(letters => letters.slice(0, 4).map(letter => getComputedStyle(letter).color))).toEqual([
    'rgb(255, 106, 99)', 'rgb(255, 230, 109)', 'rgb(99, 190, 255)', 'rgb(121, 231, 138)',
  ]);
  await expect(page.getByText('Unofficial Mario trivia and matching games with original icons, emoji and words.')).toBeVisible();
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
  await expect(page.locator('.order-tiles button small')).toHaveCount(0);
  expect(await page.locator('.order-tiles button').first().evaluate(button => parseFloat(getComputedStyle(button).fontSize))).toBeGreaterThanOrEqual(18);
  const initial = await page.locator('.order-tiles button').allTextContents();
  const colors = await page.locator('.order-tiles button').evaluateAll(buttons => buttons.map(button => getComputedStyle(button).backgroundImage));
  expect(new Set(colors).size).toBe(3);
  await page.getByRole('button', { name: 'Check order' }).click();
  await expect(page.getByText('Answer:')).toBeVisible();
  await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
  await expect(page.locator('.order-tiles button')).toHaveCount(3);
  expect(await page.locator('.order-tiles button').allTextContents()).toEqual(initial);
  await page.locator('.order-tiles button').nth(0).click();
  await expect(page.locator('.order-tiles button').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.order-tiles button').first()).toHaveCSS('outline-width', '4px');
  await page.locator('.order-tiles button').nth(1).click();
  expect(await page.locator('.order-tiles button').allTextContents()).not.toEqual(initial);
  const movedColors = await page.locator('.order-tiles button').evaluateAll(buttons => buttons.map(button => getComputedStyle(button).backgroundImage));
  expect(movedColors[1]).toBe(colors[0]);
});

test('Game Order titles remain readable without numbers on a narrow phone', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Game Order' }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  await expect(page.locator('.order-tiles button')).toHaveCount(3);
  await expect(page.locator('.order-tiles button small')).toHaveCount(0);
  expect(await page.locator('.order-tiles button').first().evaluate(button => parseFloat(getComputedStyle(button).fontSize))).toBeGreaterThanOrEqual(18);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test('Match & Hunt relaxed mode keeps cards hidden and scores every pair on one board', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Match & Hunt' }).click();
  await expect(page.getByRole('group', { name: 'Matching mode' }).getByRole('button', { name: 'Hunt' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Start!' }).click();
  await expect(page.getByText('Board 1 of 1')).toBeVisible();
  await expect(page.locator('.pair-card')).toHaveCount(24);
  await expect(page.locator('.pair-card-back')).toHaveCount(24);
  const firstPair = await page.locator('.pair-card').first().getAttribute('data-pair-id');
  const wrongCard = page.locator(`.pair-card:not([data-pair-id="${firstPair}"])`).first();
  await page.locator('.pair-card').first().click();
  await wrongCard.click();
  await expect(page.locator('.pair-card-face')).toHaveCount(2);
  await expect(page.getByText('Not a pair')).toBeVisible();
  await expect(page.locator('.pair-card-face')).toHaveCount(0);
  await page.getByRole('button', { name: 'Restart go' }).click();
  await expect(page.getByText('0/12 pairs found')).toBeVisible();
  await expect(page.locator('.pair-card-back')).toHaveCount(24);
  const ids = [...new Set(await page.locator('.pair-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-pair-id'))))];
  for (const id of ids) {
    await page.locator(`.pair-card[data-pair-id="${id}"][data-kind="icon"]`).click();
    await page.locator(`.pair-card[data-pair-id="${id}"][data-kind="word"]`).click();
  }
  await expect(page.getByText('Fun fact:')).toBeVisible();
  await expect(page.locator('.pair-card-found')).toHaveCount(24);
  await expect(page.locator('.score-display')).toContainText('12 EP');
  await page.getByRole('button', { name: 'See result' }).click();
  await expect(page.getByText('Nice work, Player!')).toBeVisible();
  await expect(page.locator('.result-card')).toContainText('1/1');
  await page.getByRole('button', { name: 'High Scores' }).click();
  await expect(page.locator('.score-list')).toContainText('Match & Hunt · Hunt');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test('Match & Hunt renders its original icon art on a revealed card', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Match & Hunt' }).click();
  await page.getByRole('group', { name: 'Hunt target mode' }).getByRole('button', { name: 'Choose' }).click();
  await page.getByLabel('Target name').selectOption('mario-Wii');
  await page.getByRole('button', { name: 'Start!' }).click();
  const consoleCard = page.locator('.pair-card[data-pair-id="mario-Wii"][data-kind="icon"]');
  await consoleCard.click();
  await expect(consoleCard).toHaveAttribute('aria-label', 'Icon: white home console and controller');
  const image = consoleCard.locator('img.pair-card-svg');
  await expect(image).toBeVisible();
  expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  for (const name of ['rainbow-road', 'carnivorous-flower', 'ninja-hideaway', 'blue-squid']) {
    expect((await page.request.get(`./match-icons/${name}.svg`)).ok()).toBe(true);
  }
});

test('Match & Hunt Time Trial uses three timed championship boards sized from Game Order', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Championship', exact: false }).click();
  await page.getByRole('button', { name: 'Quick' }).click();
  for (const game of ['Game Order', 'Track Finder', 'Clue Match Up', 'Clue Duel', 'Category Finder']) {
    await page.locator('.champ-game-toggle').filter({ hasText: game }).click();
  }
  await expect(page.locator('.champ-game-toggle.selected')).toHaveCount(2);
  await page.getByRole('group', { name: 'Matching mode' }).getByRole('button', { name: 'Time Trial' }).click();
  await expect(page.getByText('Find 3 pairs on a 9-pair board')).toBeVisible();
  await page.getByRole('button', { name: 'Start Solo Championship' }).click();
  for (let question = 0; question < 3; question += 1) {
    await page.locator('.answer-grid button').first().click();
    await page.getByRole('button', { name: question === 2 ? 'See result' : 'Next question' }).click();
  }
  await page.getByRole('button', { name: 'Next: Match & Hunt' }).click();
  await expect(page.getByText('Board 1 of 3')).toBeVisible();
  await expect(page.getByLabel('Elapsed time')).toBeVisible();
  for (let board = 0; board < 3; board += 1) {
    await expect(page.locator('.pair-card')).toHaveCount(0);
    await page.getByRole('button', { name: 'Start Timer' }).click();
    await expect(page.locator('.pair-card')).toHaveCount(18);
    const ids = [...new Set(await page.locator('.pair-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-pair-id'))))];
    for (const id of ids.slice(0, 3)) {
      await page.locator(`.pair-card[data-pair-id="${id}"][data-kind="icon"]`).click();
      await page.locator(`.pair-card[data-pair-id="${id}"][data-kind="word"]`).click();
    }
    await page.getByRole('button', { name: board === 2 ? 'See result' : 'Next board' }).click();
  }
  await page.getByRole('button', { name: 'See championship result' }).click();
  await expect(page.getByText('CHAMPIONSHIP COMPLETE')).toBeVisible();
  await expect(page.locator('.champ-total-row')).toHaveCount(2);
  await expect(page.locator('.champ-total-row').last()).toContainText('Match & Hunt');
});

test('Match & Hunt locks its target until two other pairs are found', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Match & Hunt' }).click();
  await page.getByRole('group', { name: 'Hunt target mode' }).getByRole('button', { name: 'Random' }).click();
  await page.getByRole('group', { name: 'Target unlock' }).getByRole('button', { name: '2' }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  for (let board = 0; board < 1; board += 1) {
    const targetName = (await page.locator('.hunt-target-banner strong').textContent())!;
    const ids = [...new Set(await page.locator('.pair-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-pair-id'))))] as string[];
    const targetId = ids.find(id => id.endsWith(`-${targetName}`))!;
    const flip = async (id: string) => {
      await page.locator(`.pair-card[data-pair-id="${id}"][data-kind="icon"]`).click();
      await page.locator(`.pair-card[data-pair-id="${id}"][data-kind="word"]`).click();
    };
    await page.locator(`.pair-card[data-pair-id="${targetId}"][data-kind="icon"]`).click();
    await expect(page.getByText('Target locked')).toBeVisible();
    await expect(page.locator('.pair-card-face')).toHaveCount(0);
    for (const id of ids.filter(id => id !== targetId).slice(0, 2)) await flip(id);
    await expect(page.locator('.hunt-target-banner')).toContainText('Unlocked!');
    await flip(targetId);
    await expect(page.getByText('Target found!')).toBeVisible();
    await expect(page.getByText('Fun fact:')).toBeVisible();
    await expect(page.locator('.score-display')).toContainText('6 EP');
    await page.getByRole('button', { name: 'See result' }).click();
  }
  await expect(page.locator('.result-card')).toContainText('1/1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});

test('chosen timed Hunt keeps its target through three boards and rewind restarts the timer', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Match & Hunt' }).click();
  await page.getByRole('group', { name: 'Hunt timer' }).getByRole('button', { name: 'On' }).click();
  await page.getByRole('group', { name: 'Hunt target mode' }).getByRole('button', { name: 'Choose' }).click();
  const targetId = await page.getByLabel('Target name').inputValue();
  await page.getByRole('group', { name: 'Target unlock' }).getByRole('button', { name: '1' }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  for (let board = 0; board < 3; board += 1) {
    await expect(page.getByText(`Board ${board + 1} of 3`)).toBeVisible();
    await expect(page.locator('.pair-card')).toHaveCount(0);
    await page.getByRole('button', { name: 'Start Timer' }).click();
    await expect(page.locator(`.pair-card[data-pair-id="${targetId}"]`)).toHaveCount(2);
    if (board === 0) {
      await page.getByRole('button', { name: 'Restart go' }).click();
      await expect(page.locator('.pair-card')).toHaveCount(0);
      await page.getByRole('button', { name: 'Start Timer' }).click();
    }
    const ids = [...new Set(await page.locator('.pair-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-pair-id'))))] as string[];
    const other = ids.find(id => id !== targetId)!;
    for (const id of [other, targetId]) {
      await page.locator(`.pair-card[data-pair-id="${id}"][data-kind="icon"]`).click();
      await page.locator(`.pair-card[data-pair-id="${id}"][data-kind="word"]`).click();
    }
    await expect(page.locator('.score-display')).toContainText(`${(board + 1) * 5} EP`);
    await page.getByRole('button', { name: board === 2 ? 'See result' : 'Next board' }).click();
  }
  await expect(page.locator('.result-card')).toContainText('15');
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

test('Clue Match Up uses real pairs and rewind restarts the whole go', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Clue Match Up' }).click();
  await page.getByRole('button', { name: 'On', exact: true }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  const names = page.locator('.match-column').first().locator('button');
  const clues = page.locator('.match-column').last().locator('button');
  await expect(names).toHaveCount(4);
  await expect(clues).toHaveCount(4);
  const firstName = (await names.first().textContent())!;
  await expect(page.locator('.help-copy')).not.toContainText('target');

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
  await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
  await expect(page.getByText('0/4 pairs found')).toBeVisible();
  await expect(page.locator('.match-column').first().getByRole('button', { name: firstName, exact: true })).toBeEnabled();
  await expect(page.getByText('Fun fact:')).toHaveCount(0);
});

for (const [level, retries] of [['Rookie', 3], ['Pro', 1], ['Legend', 0]] as const) {
  test(`Clue Match Up ${level} ends the round after ${retries + 1} wrong pairs`, async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Play Games' }).click();
    await page.getByRole('button', { name: 'Clue Match Up' }).click();
    await page.locator('.difficulty-select').getByRole('button', { name: level }).click();
    await page.getByRole('button', { name: 'Start!' }).click();
    const names = page.locator('.match-column').first().locator('button');
    const clues = page.locator('.match-column').last().locator('button');
    const clue = (await clues.first().textContent())!;
    const answer = QUESTIONS.find(question => question.prompt === clue)!.answer;
    const wrong = (await names.allTextContents()).find(name => name !== answer)!;
    await expect(page.locator('.match-retries')).toContainText(retries === 0 ? 'No retries left' : `${retries} ${retries === 1 ? 'retry' : 'retries'} left`);
    for (let mistake = 0; mistake <= retries; mistake += 1) {
      await names.filter({ hasText: wrong }).click();
      await clues.first().click();
      if (mistake < retries) {
        await expect(page.locator('.feedback')).toHaveCount(0);
      }
    }
    await expect(page.locator('.feedback h2')).toContainText('Round over');
    await expect(page.locator('.mario-earned')).toContainText('+0 EP');
    await page.getByRole('button', { name: 'Next question' }).click();
    await expect(page.getByText('Question 2 of 3')).toBeVisible();
    await expect(page.locator('.match-retries')).toContainText(retries === 0 ? 'No retries left' : `${retries} ${retries === 1 ? 'retry' : 'retries'} left`);
  });
}

test('Clue Duel reveals five clues, accepts a guess, and rewinds before Next', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Clue Duel' }).click();
  await page.getByRole('button', { name: 'Legend' }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  await expect(page.getByText('Question 1 of 5')).toBeVisible();
  await expect(page.getByText('Clue 1 of 5')).toBeVisible();
  await expect(page.locator('.answer-grid button')).toHaveCount(8);
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
  await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
  await expect(page.getByText('Clue 1 of 5')).toBeVisible();
  await expect(page.locator('.clue-list li')).toHaveCount(1);
  await page.locator('.answer-grid button').filter({ hasText: answer }).first().click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByText('Question 2 of 5')).toBeVisible();
  await expect(page.locator('.answer-grid button')).toHaveCount(8);
  await expect(page.getByRole('button', { name: '↶ Rewind', exact: true })).toHaveCount(0);
});

test('Category Finder shows a consecutive 5×5 window with a valid target', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Category Finder' }).click();
  await page.getByRole('button', { name: 'Legend' }).click();
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
  await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
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
  await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
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

test('Mushbot Quiz Battle reveals a prechosen answer after its handover', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Quiz Battle' }).click();
  await page.getByRole('button', { name: 'Play Mushbot' }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  await page.locator('.versus-handover .start-btn').click();
  await page.locator('.answer-grid button').first().click();
  await page.getByRole('button', { name: 'Next turn' }).click();
  await expect(page.getByRole('heading', { name: "Mushbot's turn" })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Mushbot', exact: true })).toBeVisible();
  await page.locator('.versus-handover .start-btn').click();
  await expect(page.getByRole('button', { name: "Reveal Mushbot's answer" })).toBeVisible();
  await page.getByRole('button', { name: "Reveal Mushbot's answer" }).click();
  const selected = await page.locator('.answer-grid button.wrong, .answer-grid button.correct').count();
  expect(selected).toBeGreaterThan(0);
  await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
  await expect(page.getByRole('button', { name: "Reveal Mushbot's answer" })).toBeVisible();
  await page.getByRole('button', { name: "Reveal Mushbot's answer" }).click();
  await expect(page.getByText('Fun fact:')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
});

test('solo championship carries points into three Clue Match Up rounds and saves the total', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Championship', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'Solo Championship' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Topic' })).toHaveCount(0);
  await expect(page.locator('.champ-game-toggle')).toHaveCount(7);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.getByLabel('Player name').fill('Blaize');
  await page.getByRole('button', { name: 'Quick' }).click();
  for (const game of ['Game Order', 'Track Finder', 'Match & Hunt', 'Clue Duel', 'Category Finder']) {
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
  await page.getByRole('button', { name: 'Next: Clue Match Up' }).click();
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
  for (const game of ['Track Finder', 'Clue Match Up', 'Match & Hunt', 'Clue Duel', 'Category Finder']) await page.locator('.champ-game-toggle').filter({ hasText: game }).click();
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

test('Mushbot championship plays each section once and records both totals', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Championship', exact: false }).click();
  await page.getByRole('button', { name: 'Play Mushbot' }).click();
  await page.getByRole('button', { name: 'Quick' }).click();
  for (const game of ['Track Finder', 'Clue Match Up', 'Match & Hunt', 'Clue Duel', 'Category Finder']) await page.locator('.champ-game-toggle').filter({ hasText: game }).click();
  await page.getByRole('button', { name: 'Start Championship' }).click();
  await page.getByRole('button', { name: "Start Player's turn" }).click();
  for (let i = 0; i < 3; i += 1) {
    await page.locator('.answer-grid button').first().click();
    await page.getByRole('button', { name: i === 2 ? 'See result' : 'Next question' }).click();
  }
  await expect(page.getByText('Mushbot played the same rounds.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pass to Mushbot' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Next: Game Order' }).click();
  await page.getByRole('button', { name: "Start Player's turn" }).click();
  for (let i = 0; i < 3; i += 1) {
    await page.getByRole('button', { name: 'Check order' }).click();
    await page.getByRole('button', { name: i === 2 ? 'See result' : 'Next question' }).click();
  }
  await page.getByRole('button', { name: 'See championship result' }).click();
  await expect(page.getByText('CHAMPIONSHIP COMPLETE')).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_championships_v1') || '[]'));
  expect(saved[0].format).toBe('computer');
  expect(saved[0].opponent).toBe('Mushbot');
  expect(saved[0].opponentGames).toHaveLength(2);
});

test('two-player championship Clue Match Up gives both players the same three boards', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Championship', exact: false }).click();
  await page.getByRole('button', { name: 'Two Players' }).click();
  await page.getByRole('button', { name: 'Quick' }).click();
  for (const game of ['Game Order', 'Track Finder', 'Match & Hunt', 'Clue Duel', 'Category Finder']) await page.locator('.champ-game-toggle').filter({ hasText: game }).click();
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
  await page.getByRole('button', { name: 'Next: Clue Match Up' }).click();
  const boards: string[][] = [];
  for (const name of ['Player', 'Player 2']) {
    await page.getByRole('button', { name: `Start ${name}'s turn` }).click();
    for (let i = 0; i < 3; i += 1) {
      await expect(page.getByText(`Question ${i + 1} of 3`)).toBeVisible();
      const names = await page.locator('.match-column').first().locator('button').allTextContents();
      if (name === 'Player') boards.push(names);
      else expect(names).toEqual(boards[i]);
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

test('every standalone game offers two-player and Mushbot modes', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  for (const game of ['Quiz Battle', 'Game Order', 'Track Finder', 'Clue Match Up', 'Match & Hunt', 'Clue Duel', 'Category Finder']) {
    await page.getByRole('button', { name: game, exact: false }).first().click();
    await expect(page.getByRole('button', { name: 'Two Players' })).toBeVisible();
    await page.getByRole('button', { name: 'Play Mushbot' }).click();
    await expect(page.getByRole('img', { name: 'Mushbot, a friendly mushroom-shaped robot' })).toBeVisible();
    await page.getByRole('button', { name: '← Back to games' }).click();
  }
});

test('standalone Game Order gives both players the same rounds and one saved match', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Game Order' }).click();
  await page.getByLabel('Player name').fill('Ada');
  await page.getByRole('button', { name: 'Two Players' }).click();
  await page.getByLabel('Player 2 name').fill('Ben');
  await page.getByRole('button', { name: 'Start!' }).click();
  await page.getByRole('button', { name: "Start Ada's turn" }).click();
  const firstBoard = await page.locator('.order-tiles button').allTextContents();
  for (let round = 0; round < 3; round += 1) {
    await page.getByRole('button', { name: 'Check order' }).click();
    await page.getByRole('button', { name: round === 2 ? 'See result' : 'Next question' }).click();
  }
  await page.getByRole('button', { name: 'Pass to Ben' }).click();
  await page.getByRole('button', { name: "Start Ben's turn" }).click();
  expect(await page.locator('.order-tiles button').allTextContents()).toEqual(firstBoard);
  for (let round = 0; round < 3; round += 1) {
    await page.getByRole('button', { name: 'Check order' }).click();
    await page.getByRole('button', { name: round === 2 ? 'See result' : 'Next question' }).click();
  }
  await expect(page.getByText('MATCH COMPLETE')).toBeVisible();
  const results = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_results_v1') || '[]'));
  expect(results).toHaveLength(1);
  expect(results[0].opponent).toBe('Ben');
});

test('standalone Track Finder scores Mushbot without a second playable leg', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Track Finder' }).click();
  await page.getByRole('button', { name: 'Play Mushbot' }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  for (let round = 0; round < 3; round += 1) {
    await page.locator('.finder-grid button').first().click();
    await page.getByRole('button', { name: round === 2 ? 'See result' : 'Next question' }).click();
  }
  await expect(page.getByText('MATCH COMPLETE')).toBeVisible();
  await expect(page.getByRole('img', { name: 'Mushbot', exact: true })).toBeVisible();
  const results = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_results_v1') || '[]'));
  expect(results).toHaveLength(1);
  expect(results[0].opponent).toBe('Mushbot');
  expect(results[0].format).toBe('computer');
});

test('game hub selects the format first and loads the spotted Mushbot image', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  const mushbotCard = page.locator('.play-format-card').filter({ hasText: 'Play Mushbot' });
  await expect(mushbotCard).toBeVisible();
  const image = mushbotCard.locator('img');
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0);
  await mushbotCard.click();
  await expect(mushbotCard).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Game Order' }).click();
  await expect(page.getByRole('button', { name: 'Play Mushbot' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '← Back to games' }).click();
  await page.getByRole('button', { name: 'Championship', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'Mushbot Championship' })).toBeVisible();
});
