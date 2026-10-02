import { expect, test, type Page } from '@playwright/test';
import { QUESTIONS } from '../src/mario/questions.ts';
import { MARIO_TIMELINE } from '../src/mario/rounds.ts';
import { BOOSTER_COURSES } from '../src/mario/courses.ts';
import { CLUE_SUBJECTS } from '../src/mario/clues.ts';
import { CATEGORY_ITEMS, CATEGORY_LABELS } from '../src/mario/categoryCatalog.ts';

async function openGame(page: Page, name: string, versus = false) {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  if (versus) await page.getByRole('button', { name: '2 Players' }).click();
  await page.getByRole('button', { name, exact: false }).click();
}
async function solveOrder(page: Page) {
  await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
  const tiles = page.locator('.order-tiles button');
  const current = await tiles.locator('span').allTextContents();
  const sorted = [...current].sort((a, b) => MARIO_TIMELINE.find(game => game.title === a)!.year - MARIO_TIMELINE.find(game => game.title === b)!.year);
  for (let index = 0; index < sorted.length; index += 1) {
    const other = current.indexOf(sorted[index]);
    if (other === index) continue;
    await tiles.nth(index).click();
    await tiles.nth(other).click();
    [current[index], current[other]] = [current[other], current[index]];
  }
  await page.getByRole('button', { name: 'Check order' }).click();
}
async function answerQuiz(page: Page) {
  const prompt = await page.locator('.quiz-panel h1').textContent();
  const answer = QUESTIONS.find(question => question.prompt === prompt)!.answer;
  await page.locator('.answer-grid').getByText(answer, { exact: true }).click();
  return prompt;
}
async function answerTrack(page: Page) {
  const prompt = (await page.locator('.quiz-panel h1').textContent())!;
  const cup = prompt.replace('Find one track from the ', '').replace(/\.$/, '');
  const labels = await page.locator('.finder-grid button').allTextContents();
  const answer = BOOSTER_COURSES.find(course => course.cup === cup && labels.includes(course.title))!;
  await page.locator('.finder-grid').getByRole('button', { name: answer.title, exact: true }).click();
  return prompt;
}

for (const challenge of ['Easy', 'Medium', 'Hard']) {
  test(`Game Order ${challenge} uses position feedback instead of decorative colours`, async ({ page }) => {
    await openGame(page, 'Game Order');
    await page.getByRole('group', { name: 'Game Order challenge' }).getByRole('button', { name: challenge, exact: false }).click();
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
    const tiles = page.locator('.order-tiles button');
    await expect(tiles.locator('small')).toHaveCount(0);
    const current = await tiles.locator('span').allTextContents();
    const sorted = [...current].sort((a, b) => MARIO_TIMELINE.find(game => game.title === a)!.year - MARIO_TIMELINE.find(game => game.title === b)!.year);
    const target = [...sorted];
    [target[0], target[1]] = [target[1], target[0]];
    for (let index = 0; index < target.length; index++) {
      const other = current.indexOf(target[index]);
      if (other === index) continue;
      await tiles.nth(index).click();
      await tiles.nth(other).click();
      [current[index], current[other]] = [current[other], current[index]];
    }
    expect(new Set(await tiles.evaluateAll(nodes => nodes.map(node => getComputedStyle(node).backgroundColor))).size).toBe(1);
    await expect(page.locator('[class*="order-color-"]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Check order' }).click();
    await expect(page.locator('.order-year')).toHaveCount(0);
    if (challenge === 'Hard') {
      await expect(page.locator('.order-position-feedback')).toHaveCount(0);
      await expect(page.locator('.order-correct, .order-wrong')).toHaveCount(0);
    } else {
      await expect(tiles.nth(2)).toHaveClass(/order-correct/);
      await expect(tiles.nth(2)).toContainText('✓ Correct position');
      await expect(tiles.nth(2)).toHaveCSS('background-color', 'rgb(40, 87, 73)');
      await expect(tiles.nth(0)).toHaveCSS('background-color', 'rgb(99, 85, 42)');
      await expect(tiles.nth(0)).toContainText(challenge === 'Easy' ? 'Move right →' : 'Wrong position');
      await expect(tiles.nth(1)).toContainText(challenge === 'Easy' ? '← Move left' : 'Wrong position');
    }
    await tiles.nth(0).click();
    await tiles.nth(1).click();
    await expect(page.locator('.order-position-feedback')).toHaveCount(0);
    await page.getByRole('button', { name: 'Check order' }).click();
    await expect(page.locator('.order-correct')).toHaveCount(sorted.length);
    await expect(page.locator('.order-year')).toHaveCount(sorted.length);
  });
}

test('Championship is first and setup choices survive reload', async ({ page }) => {
  await openGame(page, 'Championship');
  await page.getByRole('button', { name: 'Two Players', exact: true }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByLabel('Player 2 name').fill('Ben');
  await page.getByRole('group', { name: 'Championship difficulty' }).getByRole('button', { name: 'Pro' }).click();
  await page.getByRole('button', { name: 'Epic', exact: true }).click();
  await page.getByRole('group', { name: 'Game Order tile count' }).getByRole('button', { name: '6', exact: true }).click();
  await page.getByRole('group', { name: 'Game Order challenge' }).getByRole('button', { name: 'Hard', exact: false }).click();
  await page.locator('.champ-game-toggle').filter({ hasText: 'Track Finder' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Play Games' }).click();
  await expect(page.locator('.game-mode-btn').first()).toContainText('Championship');
  await page.getByRole('button', { name: 'Championship', exact: false }).click();
  await expect(page.getByLabel('Player name', { exact: true })).toHaveValue('Ada');
  await expect(page.getByLabel('Player 2 name')).toHaveValue('Ben');
  await expect(page.getByRole('button', { name: 'Epic', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('group', { name: 'Game Order tile count' }).getByRole('button', { name: '6', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('group', { name: 'Game Order challenge' }).getByRole('button', { name: 'Hard', exact: false })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.champ-game-toggle').filter({ hasText: 'Track Finder' })).toHaveAttribute('aria-pressed', 'false');
});

test('Game Order keeps timing through wrong checks and saves a solved round immediately', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openGame(page, 'Game Order');
  await page.getByRole('group', { name: 'Game Order challenge' }).getByRole('button', { name: 'Hard', exact: false }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await expect(page.locator('.order-tiles button')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
  await expect(page.locator('.order-tiles small')).toHaveCount(0);
  await page.getByRole('button', { name: 'Check order' }).click();
  await expect(page.locator('.feedback')).toHaveCount(0);
  await expect(page.locator('.order-feedback')).toContainText('Keep going!');
  const tiles = page.locator('.order-tiles button');
  const current = await tiles.locator('span').allTextContents();
  const sorted = [...current].sort((a, b) => MARIO_TIMELINE.find(game => game.title === a)!.year - MARIO_TIMELINE.find(game => game.title === b)!.year);
  for (let index = 0; index < sorted.length; index += 1) {
    const other = current.indexOf(sorted[index]);
    if (other !== index) { await tiles.nth(index).click(); await tiles.nth(other).click(); [current[index], current[other]] = [current[other], current[index]]; }
  }
  await page.getByRole('button', { name: 'Check order' }).click();
  await expect(page.locator('.order-feedback')).toContainText('Solved in');
  await expect(page.locator('.order-leaderboard li')).toHaveCount(1);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_order_times_v1')!));
  expect(saved[0].attempts).toBe(2);
  expect(saved[0].elapsedMs).toBeGreaterThan(1000);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.screenshot({ path: 'test-results/game-order-phone.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Rewind' }).click();
  await expect(page.getByRole('button', { name: 'Start Timer' })).toBeVisible();
  await expect(page.locator('.order-tiles button')).toHaveCount(0);
});

test('championship alternates every question with distinct questions and totals', async ({ page }) => {
  await openGame(page, 'Championship');
  await page.getByRole('button', { name: 'Two Players', exact: true }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByLabel('Player 2 name').fill('Ben');
  await page.getByRole('button', { name: 'Quick', exact: true }).click();
  for (const game of ['Game Order', 'Clue Match Up', 'Match & Hunt', 'Clue Duel', 'Category Finder']) await page.locator('.champ-game-toggle').filter({ hasText: game }).click();
  await page.getByRole('button', { name: 'Start Championship', exact: true }).click();
  for (const game of ['quiz', 'tracks']) {
    const prompts: string[] = [];
    for (let turn = 0; turn < 6; turn += 1) {
      const name = turn % 2 === 0 ? 'Ada' : 'Ben';
      await expect(page.getByRole('heading', { name: `${name}'s turn`, exact: true })).toBeVisible();
      await expect(page.locator('.answer-grid button')).toHaveCount(0);
      await page.getByRole('button', { name: `Start ${name}'s turn` }).click();
      if (game === 'tracks') await expect(page.locator('.finder-grid button')).toHaveCount(4);
      prompts.push((await (game === 'quiz' ? answerQuiz(page) : answerTrack(page)))!);
      await page.getByRole('button', { name: turn === 5 ? 'See result' : 'Next turn' }).click();
    }
    expect(new Set(prompts).size).toBe(6);
    if (game === 'quiz') await page.getByRole('button', { name: 'Next: Track Finder' }).click();
  }
  await page.getByRole('button', { name: 'See championship result' }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_championships_v1')!)[0]);
  expect(saved.games).toHaveLength(2);
  expect(saved.opponentGames).toHaveLength(2);
  expect(saved.points).toBe(72);
  expect(saved.opponentPoints).toBe(72);
});

test('Clue Duel passes clues and gives one bonus guess before alternating the next subject', async ({ page }) => {
  await openGame(page, 'Clue Duel', true);
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByLabel('Player 2 name').fill('Ben');
  await page.getByRole('button', { name: 'Legend', exact: false }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await page.getByRole('button', { name: "Start Ada's turn" }).click();
  await page.getByRole('button', { name: 'Next clue — pass to Ben' }).click();
  await expect(page.locator('.versus-now-playing')).toContainText("Ben's turn");
  const clues = await page.locator('.clue-list li').allTextContents();
  const possible = CLUE_SUBJECTS.filter(subject => clues.every((clue, index) => clue === subject.clues[index])).map(subject => subject.answer);
  const wrong = (await page.locator('.choice-text').allTextContents()).find(choice => !possible.includes(choice))!;
  await page.locator('.answer-grid').getByText(wrong, { exact: true }).click();
  await expect(page.locator('.versus-now-playing')).toContainText("Ada's turn");
  await expect(page.locator('.match-message')).toContainText('bonus chance');
  await page.getByRole('button', { name: 'Skip bonus' }).click();
  await page.getByRole('button', { name: 'Next turn' }).click();
  await expect(page.getByRole('heading', { name: "Ben's turn", exact: true })).toBeVisible();
});

for (const [level, count] of [['Rookie', 4], ['Pro', 6], ['Legend', 9]] as const) {
  test(`Track Finder ${level} has ${count} tiles and explicit win feedback`, async ({ page }) => {
    await openGame(page, 'Track Finder');
    await page.getByRole('button', { name: level }).click();
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    await expect(page.locator('.finder-grid button')).toHaveCount(count);
    if (level === 'Pro') {
      const prompt = (await page.locator('.quiz-panel h1').textContent())!;
      const cup = prompt.replace('Find one track from the ', '').replace(/\.$/, '');
      const labels = await page.locator('.finder-grid button').allTextContents();
      const wrong = BOOSTER_COURSES.find(course => course.cup !== cup && labels.includes(course.title))!;
      await page.locator('.finder-grid').getByRole('button', { name: wrong.title, exact: true }).click();
      await expect(page.locator('.finder-verdict')).toContainText('Not this time');
      await page.getByRole('button', { name: 'Rewind' }).click();
    }
    await answerTrack(page);
    await expect(page.locator('.finder-verdict')).toContainText('Correct — you found it');
    expect(await page.locator('.tile-verdict').count()).toBeGreaterThan(0);
  });
}

test('Mushbot takes individual championship turns including timed Game Order', async ({ page }) => {
  await openGame(page, 'Championship');
  await page.getByRole('button', { name: 'Play Mushbot', exact: true }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Quick', exact: true }).click();
  for (const game of ['Track Finder', 'Clue Match Up', 'Match & Hunt', 'Clue Duel', 'Category Finder']) await page.locator('.champ-game-toggle').filter({ hasText: game }).click();
  await page.getByRole('button', { name: 'Start Championship', exact: true }).click();
  for (const game of ['quiz', 'order']) {
    for (let turn = 0; turn < 6; turn += 1) {
      await page.getByRole('button', { name: turn % 2 ? "Start Mushbot's turn" : "Start Ada's turn" }).click();
      if (turn % 2) await page.getByRole('button', { name: /Show Mushbot/ }).click();
      else if (game === 'quiz') await answerQuiz(page);
      else await solveOrder(page);
      await page.getByRole('button', { name: turn === 5 ? 'See result' : 'Next turn' }).click();
    }
    if (game === 'quiz') await page.getByRole('button', { name: 'Next: Game Order' }).click();
  }
  await page.getByRole('button', { name: 'See championship result' }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_championships_v1')!)[0]);
  expect(saved.games).toHaveLength(2);
  expect(saved.opponentGames).toHaveLength(2);
  expect(saved.games[1].points + saved.opponentGames[1].points).toBe(3);
});

test('Hunt and Time Trial options are remembered along with player format', async ({ page }) => {
  await openGame(page, 'Match & Hunt', true);
  await page.getByRole('group', { name: 'Hunt timer' }).getByRole('button', { name: 'On', exact: true }).click();
  await page.getByRole('group', { name: 'Board pairs' }).getByRole('button', { name: '16', exact: true }).click();
  await page.getByRole('group', { name: 'Hunt target mode' }).getByRole('button', { name: 'Choose', exact: true }).click();
  await page.getByLabel('Target name').selectOption('mario-Nintendo DS');
  await page.getByRole('group', { name: 'Target unlock' }).getByRole('button', { name: '3', exact: true }).click();
  await openGame(page, 'Match & Hunt');
  await expect(page.getByRole('button', { name: 'Two Players', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('group', { name: 'Hunt timer' }).getByRole('button', { name: 'On', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('group', { name: 'Board pairs' }).getByRole('button', { name: '16', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Target name')).toHaveValue('mario-Nintendo DS');
  await expect(page.getByRole('group', { name: 'Target unlock' }).getByRole('button', { name: '3', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('group', { name: 'Matching mode' }).getByRole('button', { name: 'Time Trial' }).click();
  await page.getByRole('group', { name: 'Matches to find' }).getByRole('button', { name: '8', exact: true }).click();
  await openGame(page, 'Match & Hunt');
  await expect(page.getByRole('group', { name: 'Matching mode' }).getByRole('button', { name: 'Time Trial' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('group', { name: 'Matches to find' }).getByRole('button', { name: '8', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('Mushbot shares relaxed Hunt and human controls are locked during its move', async ({ page }) => {
  await openGame(page, 'Match & Hunt');
  await page.getByRole('button', { name: 'Play Mushbot', exact: true }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await page.getByRole('button', { name: "Start Ada's turn" }).click();
  const ids = [...new Set(await page.locator('.pair-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-pair-id'))))];
  await page.locator(`.pair-card[data-pair-id="${ids[0]}"][data-kind="icon"]`).click();
  await page.locator(`.pair-card[data-pair-id="${ids[1]}"][data-kind="word"]`).click();
  await expect(page.locator('.versus-now-playing')).toContainText("Mushbot's turn");
  await expect(page.locator('.pair-card:enabled')).toHaveCount(0);
  await page.getByRole('button', { name: /Show Mushbot/ }).click();
  await expect(page.locator('.pair-card-found')).toHaveCount(2);
  await expect(page.locator('.versus-now-playing')).toContainText('Mushbot: 1 EP');
});

for (const name of ['Clue Match Up', 'Category Finder']) {
  test(`${name} hands over after one board`, async ({ page }) => {
    await openGame(page, name, true);
    await page.getByLabel('Player name', { exact: true }).fill('Ada');
    await page.getByLabel('Player 2 name').fill('Ben');
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    await page.getByRole('button', { name: "Start Ada's turn" }).click();
    if (name === 'Clue Match Up') {
      for (const clue of await page.locator('.match-column').last().locator('button').allTextContents()) {
        const answer = QUESTIONS.find(item => item.prompt === clue)!.answer;
        await page.locator('.match-column').first().getByRole('button', { name: answer, exact: true }).click();
        await page.locator('.match-column').last().getByRole('button', { name: clue, exact: true }).click();
      }
    } else {
      const label = (await page.locator('.quiz-panel h1').textContent())!.replace('Find one ', '').replace(/\.$/, '');
      const category = Object.entries(CATEGORY_LABELS).find(([, value]) => value === label)![0];
      const labels = await page.locator('.category-grid button span').allTextContents();
      const answer = CATEGORY_ITEMS.find(item => item.category === category && labels.includes(item.name))!;
      await page.locator('.category-grid').getByText(answer.name, { exact: true }).click();
    }
    await page.getByRole('button', { name: 'Next turn' }).click();
    await expect(page.getByRole('heading', { name: "Ben's turn", exact: true })).toBeVisible();
  });
}

test('relaxed Hunt shares a board, passes on a miss, keeps a match and rewinds board scores', async ({ page }) => {
  await openGame(page, 'Match & Hunt', true);
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByLabel('Player 2 name').fill('Ben');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await page.getByRole('button', { name: "Start Ada's turn" }).click();
  const ids = [...new Set(await page.locator('.pair-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-pair-id'))))];
  await page.locator(`.pair-card[data-pair-id="${ids[0]}"][data-kind="icon"]`).click();
  await page.locator(`.pair-card[data-pair-id="${ids[1]}"][data-kind="word"]`).click();
  await expect(page.locator('.versus-now-playing')).toContainText("Ben's turn");
  await page.locator(`.pair-card[data-pair-id="${ids[0]}"][data-kind="icon"]`).click();
  await page.locator(`.pair-card[data-pair-id="${ids[0]}"][data-kind="word"]`).click();
  await expect(page.locator('.versus-now-playing')).toContainText("Ben's turn");
  await expect(page.locator('.versus-now-playing')).toContainText('Ben: 1 EP');
  await page.getByRole('button', { name: 'Restart go' }).click();
  await expect(page.locator('.versus-now-playing')).toContainText('Ben: 0 EP');
  await expect(page.locator('.pair-card-found')).toHaveCount(0);
});

test('timed Hunt alternates three private boards per player', async ({ page }) => {
  await openGame(page, 'Match & Hunt', true);
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByLabel('Player 2 name').fill('Ben');
  await page.getByRole('group', { name: 'Matching mode' }).getByRole('button', { name: 'Time Trial' }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const boards = new Set<string>();
  for (let turn = 0; turn < 6; turn += 1) {
    await page.getByRole('button', { name: turn % 2 ? "Start Ben's turn" : "Start Ada's turn" }).click();
    await page.getByRole('button', { name: 'Start Timer' }).click();
    const ids = [...new Set(await page.locator('.pair-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-pair-id'))))];
    boards.add(ids.join(','));
    for (const id of ids.slice(0, 5)) {
      await page.locator(`.pair-card[data-pair-id="${id}"][data-kind="icon"]`).click();
      await page.locator(`.pair-card[data-pair-id="${id}"][data-kind="word"]`).click();
    }
    await page.getByRole('button', { name: turn === 5 ? 'See result' : 'Next turn' }).click();
  }
  expect(boards.size).toBe(6);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_results_v1')!)[0]);
  expect(saved.total).toBe(3);
  expect(saved.points + saved.opponentPoints).toBeGreaterThanOrEqual(3);
  expect(saved.points + saved.opponentPoints).toBeLessThanOrEqual(6);
});
