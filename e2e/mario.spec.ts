import { expect, test, type Page } from '@playwright/test';
import { TRACK_CHALLENGES, trackLabel } from '../src/mario/trackChallenges.ts';
import { BOOSTER_COURSES } from '../src/mario/courses.ts';
import { QUESTIONS } from '../src/mario/questions.ts';
import { MATCH_CLUES } from '../src/mario/matchClues.ts';
import { CLUE_SUBJECTS } from '../src/mario/clues.ts';
import { CATEGORY_ITEMS, CATEGORY_LABELS, categoryMemberships, fitsCategory } from '../src/mario/categoryCatalog.ts';

async function answerQuizCorrectly(page: Page) {
  const prompt = await page.locator('.quiz-playing h1').textContent();
  const question = QUESTIONS.find(item => item.prompt === prompt)!;
  await page.locator('.answer-grid').getByText(question.answer, { exact: true }).click();
}

for (const [level, attempts] of [['Rookie', 4], ['Pro', 2], ['Legend', 1]] as const) {
  test(`Quiz Battle ${level} allows ${attempts} attempts and resets on rewind and Next`, async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Play Games' }).click();
    await page.getByRole('button', { name: 'Quiz Battle' }).click();
    await page.getByRole('button', { name: level }).click();
    await page.getByRole('button', { name: 'Start!' }).click();
    const prompt = await page.locator('.quiz-playing h1').textContent();
    const question = QUESTIONS.find(item => item.prompt === prompt)!;
    const wrong = question.choices.filter(choice => choice !== question.answer);
    for (let index = 0; index < Math.min(attempts, wrong.length); index += 1) {
      await page.locator('.answer-grid').getByText(wrong[index], { exact: true }).click();
      if (index + 1 < attempts) {
        await expect(page.locator('.feedback')).toHaveCount(0);
        await expect(page.locator('.answer-grid .correct')).toHaveCount(0);
        await expect(page.locator('.quiz-retries')).toContainText(`Attempts left: ${attempts - index - 1}`);
        await expect(page.locator('.answer-grid button').filter({ has: page.getByText(wrong[index], { exact: true }) })).toBeDisabled();
      }
    }
    if (level === 'Rookie') await answerQuizCorrectly(page);
    await expect(page.locator('.feedback')).toBeVisible();
    await page.getByRole('button', { name: 'Rewind' }).click();
    await expect(page.locator('.answer-grid button:enabled')).toHaveCount(4);
    await expect(page.locator('.quiz-retries')).toContainText(`Attempts left: ${attempts}`);
    await answerQuizCorrectly(page);
    await page.getByRole('button', { name: 'Next question' }).click();
    await expect(page.locator('.quiz-retries')).toContainText(`Attempts left: ${attempts}`);
    await expect(page.locator('.answer-grid button:enabled')).toHaveCount(4);
  });
}

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
  await answerQuizCorrectly(page);
  await expect(page.getByText('Fun fact:')).toBeVisible();
  await expect(page.locator('.mario-earned')).toContainText('EP');
  await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
  await expect(page.getByText('Fun fact:')).toHaveCount(0);
  await expect(page.locator('.answer-grid button:not([disabled])')).toHaveCount(4);
  await answerQuizCorrectly(page);
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
    await answerQuizCorrectly(page);
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

test('Explore opens searchable source-checked Learning Zone cards', async ({ page }) => {
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
  await expect(page.getByText('Unofficial Mario trivia and matching games.')).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim())).toBe('#49334f');
  await page.getByRole('button', { name: 'Explore Learning Zone' }).click();
  await expect(page.getByRole('heading', { name: 'Learning Zone' })).toBeVisible();
  const reviewed = QUESTIONS.filter(question => question.sourceReview?.status === 'source-checked');
  expect(reviewed.length).toBeGreaterThanOrEqual(23);
  await expect(page.locator('.learning-topic-card')).toHaveCount(reviewed.length);
  await expect(page.getByRole('link', { name: 'Read Nintendo’s guide' })).toHaveCount(reviewed.length);
  await page.getByLabel('Search learning cards').fill('Cappy');
  await expect(page.locator('.learning-topic-card')).toHaveCount(1);
  await page.getByLabel('Learning topic').selectOption('kart');
  await expect(page.getByText('No matching cards yet.', { exact: false })).toBeVisible();
  await page.getByLabel('Search learning cards').fill('');
  await expect(page.locator('.learning-topic-card')).toHaveCount(reviewed.filter(question => question.topic === 'kart').length);
  await expect(page.getByRole('button', { name: 'Open track guide' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.getByRole('button', { name: 'Home' }).click();
  await expect(page.getByRole('button', { name: 'Explore Learning Zone' })).toBeVisible();
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

test('Match & Hunt renders web console artwork on a revealed card', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Match & Hunt' }).click();
  await page.getByRole('group', { name: 'Hunt target mode' }).getByRole('button', { name: 'Choose' }).click();
  await page.getByLabel('Target name').selectOption('mario-Wii');
  await page.getByRole('button', { name: 'Start!' }).click();
  const consoleCard = page.locator('.pair-card[data-pair-id="mario-Wii"][data-kind="icon"]');
  await consoleCard.click();
  await expect(consoleCard).toHaveAttribute('aria-label', 'Icon: Wii — game artwork or photograph');
  const image = consoleCard.locator('img.pair-card-svg');
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('src', /web-wii\.png$/);
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
    await answerQuizCorrectly(page);
    await page.getByRole('button', { name: question === 2 ? 'See result' : 'Next question' }).click();
  }
  await page.getByRole('button', { name: 'Next: Match & Hunt' }).click();
  await expect(page.getByText('Board 1 of 3')).toBeVisible();
  await expect(page.getByLabel('Elapsed time')).toBeVisible();
  for (let board = 0; board < 3; board += 1) {
    await expect(page.locator('.pair-card')).toHaveCount(0);
    await page.getByRole('button', { name: 'Start Timer' }).click();
    await expect(page.locator('.order-tiles button, .pair-card').first()).toBeVisible();
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
    await expect(page.locator('.order-tiles button, .pair-card').first()).toBeVisible();
    await expect(page.locator(`.pair-card[data-pair-id="${targetId}"]`)).toHaveCount(2);
    if (board === 0) {
      await page.getByRole('button', { name: 'Restart go' }).click();
      await expect(page.locator('.pair-card')).toHaveCount(0);
      await page.getByRole('button', { name: 'Start Timer' }).click();
      await expect(page.locator('.order-tiles button, .pair-card').first()).toBeVisible();
    }
    const ids = [...new Set(await page.locator('.pair-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-pair-id'))))] as string[];
    const other = ids.find(id => id !== targetId)!;
    for (const id of [other, targetId]) {
      await page.locator(`.pair-card[data-pair-id="${id}"][data-kind="icon"]`).click();
      await page.locator(`.pair-card[data-pair-id="${id}"][data-kind="word"]`).click();
    }
    await expect(page.locator('.score-display')).toContainText(`${(board + 1) * 5} EP`);
    const records = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_pair_times_v1') ?? '[]'));
    expect(records).toHaveLength(board);
    if (board === 0) await expect(page.getByText('Practice complete', { exact: false })).toBeVisible();
    else {
      expect(records[0].target).toBe(targetId);
      expect(records[0].unlockPairs).toBe(1);
      expect(records[0].moves).toBe(2);
      await expect(page.getByText('Time saved to the leaderboard!', { exact: true })).toBeVisible();
    }
    await page.getByRole('button', { name: board === 2 ? 'See result' : 'Next board' }).click();
  }
  await expect(page.locator('.result-card')).toContainText('15');
});

test('Track Finder accepts a course that fits the clue', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Track Finder' }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  await expect(page.locator('.finder-grid button')).toHaveCount(4);
  const prompt = await page.locator('.quiz-panel h1').textContent();
  const task = TRACK_CHALLENGES.find(task => task.prompt === prompt)!;
  expect(task).toBeTruthy();
  const visible = await page.locator('.finder-grid button').allTextContents();
  const answer = BOOSTER_COURSES.find(course => task.correctIds.includes(course.id) && visible.includes(task.kind === 'system' ? trackLabel(course.title) : course.title));
  expect(answer).toBeTruthy();
  await page.locator('.finder-grid button').filter({ hasText: task.kind === 'system' ? trackLabel(answer!.title) : answer!.title }).click();
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
  const firstAnswer = MATCH_CLUES.find(item => item.clue === first)!.name;
  const wrong = (await names.allTextContents()).find(name => name !== firstAnswer)!;
  await page.locator('.match-column').first().getByRole('button', { name: wrong, exact: true }).click();
  await clues.first().click();
  await expect(page.getByText('Not a pair')).toBeVisible();
  await expect(page.getByText('0/4 pairs found')).toBeVisible();

  await page.locator('.match-column').first().getByRole('button', { name: firstAnswer, exact: true }).click();
  await clues.first().click();
  await expect(page.getByText('1/4 pairs found')).toBeVisible();
  await page.getByRole('button', { name: 'Restart go' }).click();
  await expect(page.getByText('0/4 pairs found')).toBeVisible();

  for (const clue of await clues.allTextContents()) {
    const answer = MATCH_CLUES.find(item => item.clue === clue)!.name;
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
    const answer = MATCH_CLUES.find(item => item.clue === clue)!.name;
    const wrong = (await names.allTextContents()).find(name => name !== answer)!;
    await expect(page.locator('.match-retries')).toContainText(retries === 0 ? 'No retries left' : `${retries} ${retries === 1 ? 'retry' : 'retries'} left`);
    for (let mistake = 0; mistake <= retries; mistake += 1) {
      await page.locator('.match-column').first().getByRole('button', { name: wrong, exact: true }).click();
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
  expect(await page.locator('.answer-grid .choice-letter').allTextContents()).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
  const firstClue = (await page.locator('.clue-list li').first().textContent())!;
  const possibleAnswers = CLUE_SUBJECTS.filter(subject => subject.clues[0] === firstClue).map(subject => subject.answer);
  const wrong = (await page.locator('.answer-grid .choice-text').allTextContents()).find(choice => !possibleAnswers.includes(choice))!;
  const wrongButton = page.locator('.answer-grid').getByText(wrong, { exact: true }).locator('..');
  await wrongButton.click();
  await expect(page.getByText('Clue 2 of 5')).toBeVisible();
  await expect(wrongButton).toBeDisabled();
  const secondWrong = (await page.locator('.answer-grid .choice-text').allTextContents()).find(choice => choice !== wrong && !possibleAnswers.includes(choice))!;
  const secondWrongButton = page.locator('.answer-grid').getByText(secondWrong, { exact: true }).locator('..');
  await secondWrongButton.click();
  await expect(page.getByText('Clue 3 of 5')).toBeVisible();
  await expect(wrongButton).toBeDisabled();
  await expect(secondWrongButton).toBeDisabled();
  for (let clue = 4; clue <= 5; clue += 1) {
    await page.getByRole('button', { name: 'Show next clue' }).click();
    await expect(page.getByText(`Clue ${clue} of 5`)).toBeVisible();
  }
  await expect(page.locator('.clue-list li')).toHaveCount(5);
  const shownClues = await page.locator('.clue-list li').allTextContents();
  const answer = CLUE_SUBJECTS.find(subject => subject.clues.every((clue, index) => clue === shownClues[index]))!.answer;
  await page.locator('.answer-grid').getByText(answer, { exact: true }).click();
  await expect(page.getByText('Fun fact:')).toBeVisible();
  await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
  await expect(page.getByText('Clue 1 of 5')).toBeVisible();
  await expect(page.locator('.clue-list li')).toHaveCount(1);
  await expect(wrongButton).toBeEnabled();
  await expect(secondWrongButton).toBeEnabled();
  await page.locator('.answer-grid').getByText(answer, { exact: true }).click();
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByText('Question 2 of 5')).toBeVisible();
  await expect(page.locator('.answer-grid button:disabled')).toHaveCount(0);
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
  expect(await page.locator('.category-grid button').first().evaluate(button => parseFloat(getComputedStyle(button).fontSize))).toBeGreaterThanOrEqual(14);
  await page.screenshot({ path: 'test-results/category-legend-phone.png', fullPage: true });
  const numbers = await page.locator('.category-grid button').evaluateAll(tiles => tiles.map(tile => Number(tile.getAttribute('data-catalog-number'))));
  await expect(page.locator('.category-grid button small')).toHaveCount(0);
  expect(numbers).toEqual(Array.from({ length: 25 }, (_, index) => numbers[0] + index));
  const label = (await page.locator('.quiz-panel h1').textContent())!.replace(/^Find one /, '').replace(/\.$/, '');
  const category = Object.entries(CATEGORY_LABELS).find(([, value]) => value === label)![0];
  const visible = await page.locator('.category-grid button span').allTextContents();
  const target = CATEGORY_ITEMS.find(item => fitsCategory(item, category) && visible.includes(item.name))!;
  await page.locator('.category-grid button').nth(visible.indexOf(target.name)).click();
  await expect(page.getByText('Correct!')).toBeVisible();
  expect(await page.locator('.category-grid button.right-answer').count()).toBeGreaterThan(0);
  await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
  await expect(page.locator('.category-grid button:not([disabled])')).toHaveCount(25);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
});

test('Category Finder accepts overlapping original-release groups', async ({ page }) => {
  await page.goto('./');
  const target = 'category-4-30-handheld-game';
  const seen = Array.from({ length: CATEGORY_ITEMS.length - 15 }, (_, start) =>
    [...new Set(CATEGORY_ITEMS.slice(start, start + 16).flatMap(categoryMemberships))].map(category => `category-4-${start}-${category}`)).flat().filter(id => id !== target);
  await page.evaluate(ids => localStorage.setItem('mariotrivia_question_history_v1', JSON.stringify({ ada: ids })), seen);
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Category Finder' }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Pro', exact: false }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await expect(page.locator('.quiz-panel h1')).toContainText('Game Boy, DS or 3DS');
  await expect(page.locator('.category-context')).toContainText('not a later port');
  await page.locator('.category-grid button').filter({ hasText: /^Super Mario Land$/ }).click();
  await expect(page.getByText('Correct!', { exact: true })).toBeVisible();
  const correct = await page.locator('.category-grid button.right-answer span').allTextContents();
  expect(correct).toEqual(expect.arrayContaining(['Super Mario Land', 'New Super Mario Bros.', 'Super Mario 3D Land']));
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
  await answerQuizCorrectly(page);
  await page.getByRole('button', { name: 'Next turn' }).click();
  await expect(page.getByRole('heading', { name: "Ada's turn" })).toBeVisible();
  await expect(page.getByText('Round 2 of 5')).toBeVisible();
  for (let turn = 2; turn < 10; turn += 1) {
    await page.locator('.versus-handover .start-btn').click();
    await answerQuizCorrectly(page);
    await page.getByRole('button', { name: turn === 9 ? 'See result' : 'Next turn' }).click();
  }
  await expect(page.getByText('MATCH COMPLETE')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'High Scores' }).click();
  await expect(page.locator('.score-list')).toContainText('Ada vs Ben');
});

test('Shroomer Quiz Battle reveals a prechosen answer after its handover', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Quiz Battle' }).click();
  await page.getByRole('button', { name: 'Play Shroomer' }).click();
  await page.getByRole('button', { name: 'Start!' }).click();
  await page.locator('.versus-handover .start-btn').click();
  await answerQuizCorrectly(page);
  await page.getByRole('button', { name: 'Next turn' }).click();
  await expect(page.getByRole('heading', { name: "Shroomer's turn" })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Shroomer', exact: true })).toBeVisible();
  await page.locator('.versus-handover .start-btn').click();
  await expect(page.getByRole('button', { name: "Reveal Shroomer's answer" })).toBeVisible();
  await page.getByRole('button', { name: "Reveal Shroomer's answer" }).click();
  const selected = await page.locator('.answer-grid button.wrong, .answer-grid button.correct').count();
  expect(selected).toBeGreaterThan(0);
  await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
  await expect(page.getByRole('button', { name: "Reveal Shroomer's answer" })).toBeVisible();
  await page.getByRole('button', { name: "Reveal Shroomer's answer" }).click();
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
      const answer = MATCH_CLUES.find(item => item.clue === clue)!.name;
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
  const welcome = page.locator('.shroomer-home-speech');
  await expect(welcome).toContainText('Shroomer');
  const displayedWelcome = await welcome.innerText();
  await page.getByRole('button', { name: 'Read welcome aloud' }).click();
  expect(await page.evaluate(() => (window as typeof window & { spokenText?: string }).spokenText)).toBe(displayedWelcome);
});







test('every standalone game offers two-player and Shroomer modes', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  for (const game of ['Quiz Battle', 'Game Order', 'Track Finder', 'Clue Match Up', 'Match & Hunt', 'Clue Duel', 'Category Finder']) {
    await page.getByRole('button', { name: game, exact: false }).first().click();
    await expect(page.getByRole('button', { name: 'Two Players' })).toBeVisible();
    await page.getByRole('button', { name: 'Play Shroomer' }).click();
    await expect(page.getByRole('img', { name: 'Shroomer, a friendly red mushroom with white spots and a face' })).toBeVisible();
    await page.getByRole('button', { name: '← Back to games' }).click();
  }
});





test('game hub selects the format first and loads the spotted Shroomer image', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  const mushbotCard = page.locator('.play-format-card').filter({ hasText: 'Play Shroomer' });
  await expect(mushbotCard).toBeVisible();
  const image = mushbotCard.locator('img');
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0);
  await mushbotCard.click();
  await expect(mushbotCard).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Game Order' }).click();
  await expect(page.getByRole('button', { name: 'Play Shroomer' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '← Back to games' }).click();
  await page.getByRole('button', { name: 'Championship', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'Shroomer Championship' })).toBeVisible();
});
