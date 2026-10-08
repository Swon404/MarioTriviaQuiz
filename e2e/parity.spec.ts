import { expect, test, type Page } from '@playwright/test';
import { QUESTIONS } from '../src/mario/questions.ts';
import { MATCH_CLUES } from '../src/mario/matchClues.ts';
import { MARIO_TIMELINE } from '../src/mario/rounds.ts';
import { TRACK_CHALLENGES, trackLabel } from '../src/mario/trackChallenges.ts';
import { BOOSTER_COURSES } from '../src/mario/courses.ts';
import { CLUE_SUBJECTS } from '../src/mario/clues.ts';
import { CATEGORY_ITEMS, CATEGORY_LABELS, fitsCategory } from '../src/mario/categoryCatalog.ts';

async function openGame(page: Page, name: string, versus = false) {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  if (versus) await page.getByRole('button', { name: '2 Players' }).click();
  await page.getByRole('button', { name, exact: false }).click();
  if (await page.locator('.setup-settings:not([open])').count()) await page.locator('.setup-settings > summary').click();
}
async function solveOrder(page: Page, startTimer = true) {
  if (startTimer) await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
  await expect(page.locator('.order-tiles button, .pair-card').first()).toBeVisible();
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

test('Two-player Game Order gives comparable but different timed boards', async ({ page }) => {
  await openGame(page, 'Game Order', true);
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByLabel('Player 2 name').fill('Ben');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await page.getByRole('button', { name: "Start Ada's turn" }).click();
  await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
  await expect(page.locator('.order-tiles button, .pair-card').first()).toBeVisible();
  const first = await page.locator('.order-tiles button span').allTextContents();
  await solveOrder(page, false);
  await page.getByRole('button', { name: 'Next turn', exact: true }).click();
  await page.getByRole('button', { name: "Start Ben's turn" }).click();
  await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
  await expect(page.locator('.order-tiles button, .pair-card').first()).toBeVisible();
  const second = await page.locator('.order-tiles button span').allTextContents();
  expect(first.every(title => !second.includes(title))).toBe(true);
  const profile = (titles: string[]) => titles.map(title => Math.floor(MARIO_TIMELINE.findIndex(game => game.title === title) / 2)).sort((a, b) => a - b);
  expect(profile(first)).toEqual(profile(second));
  await solveOrder(page, false);
  await expect(page.locator('.order-feedback')).toContainText('Solved in');
});
async function answerQuiz(page: Page) {
  const prompt = await page.locator('.quiz-panel h1').textContent();
  const answer = QUESTIONS.find(question => question.prompt === prompt)!.answer;
  await page.locator('.answer-grid').getByText(answer, { exact: true }).click();
  return prompt;
}
async function answerTrack(page: Page) {
  const prompt = (await page.locator('.quiz-panel h1').textContent())!;
  const task = TRACK_CHALLENGES.find(task => task.prompt === prompt)!;
  const labels = await page.locator('.finder-grid button').allTextContents();
  const answer = BOOSTER_COURSES.find(course => task.correctIds.includes(course.id) && labels.includes(task.kind === 'system' ? trackLabel(course.title) : course.title))!;
  await page.locator('.finder-grid').getByRole('button', { name: task.kind === 'system' ? trackLabel(answer.title) : answer.title, exact: true }).click();
  return prompt;
}

for (const challenge of ['Easy', 'Medium', 'Hard']) {
  test(`Game Order ${challenge} uses position feedback instead of decorative colours`, async ({ page }) => {
    await openGame(page, 'Game Order');
    await page.getByRole('group', { name: 'Game Order challenge' }).getByRole('button', { name: challenge, exact: false }).click();
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
    await expect(page.locator('.order-tiles button, .pair-card').first()).toBeVisible();
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
      await expect(tiles.nth(0)).toContainText(challenge === 'Easy' ? 'Move later →' : 'Wrong position');
      await expect(tiles.nth(1)).toContainText(challenge === 'Easy' ? '← Move earlier' : 'Wrong position');
    }
    await tiles.nth(0).click();
    await tiles.nth(1).click();
    await expect(page.locator('.order-position-feedback')).toHaveCount(0);
    await page.getByRole('button', { name: 'Check order' }).click();
    await expect(page.locator('.order-correct')).toHaveCount(sorted.length);
    await expect(page.locator('.order-year')).toHaveCount(sorted.length);
  });
}

test('Rookie matching uses dedicated level-appropriate clues on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openGame(page, 'Clue Match Up');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const clues = page.locator('.match-column').last().locator('button');
  for (const clue of await clues.allTextContents()) {
    expect(MATCH_CLUES.find(item => item.clue === clue)?.difficulty).toBe('explorer');
    expect(clue.length).toBeLessThanOrEqual(110);
  }
  expect(await clues.first().evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(16);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.evaluate(() => { window.speechSynthesis.speak = utterance => { document.body.dataset.lastSpoken = utterance.text; }; });
  const firstClue = await clues.first().textContent();
  await clues.first().click();
  await page.getByRole('button', { name: 'Read selected clue' }).click();
  expect(await page.locator('body').getAttribute('data-last-spoken')).toBe(firstClue);
  await page.screenshot({ path: 'test-results/matching-phone.png', fullPage: true });
});

test('Clue Duel reads only the revealed clues and visible choices', async ({ page }) => {
  await openGame(page, 'Clue Duel');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await page.evaluate(() => { window.speechSynthesis.speak = utterance => { document.body.dataset.lastSpoken = utterance.text; }; });
  for (let step = 0; step < 2; step++) {
    const prompt = await page.locator('.quiz-panel h1').textContent();
    const clues = await page.locator('.clue-list li').allTextContents();
    const choices = await page.locator('.choice-text').allTextContents();
    await page.getByRole('button', { name: 'Read question aloud' }).click();
    expect(await page.locator('body').getAttribute('data-last-spoken')).toBe(`${prompt} ${clues.join('. ')} Choices: ${choices.join('. ')}`);
    if (!step) await page.getByRole('button', { name: 'Show next clue' }).click();
  }
});

test('Category Finder has explicit feedback without arbitrary visible numbers', async ({ page }) => {
  await openGame(page, 'Category Finder');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const label = (await page.locator('.quiz-panel h1').textContent())!.replace('Find one ', '').replace(/\.$/, '');
  const category = Object.entries(CATEGORY_LABELS).find(([, value]) => value === label)![0];
  const labels = await page.locator('.category-grid button span').allTextContents();
  const wrong = CATEGORY_ITEMS.find(item => !fitsCategory(item, category) && labels.includes(item.name))!;
  await expect(page.locator('.category-grid button small')).toHaveCount(0);
  await page.locator('.category-grid').getByText(wrong.name, { exact: true }).click();
  await expect(page.locator('.finder-verdict')).toContainText('Not this time');
  await expect(page.locator('.wrong-answer .tile-verdict')).toContainText('Different type');
  expect(await page.locator('.right-answer .tile-verdict').count()).toBeGreaterThan(0);
});

test('Restart cancels a pending Shroomer memory turn and clears its board', async ({ page }) => {
  await openGame(page, 'Match & Hunt');
  await page.getByRole('button', { name: 'Play Shroomer', exact: true }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await page.getByRole('button', { name: "Start Ada's turn" }).click();
  const ids = [...new Set(await page.locator('.pair-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-pair-id'))))];
  await page.locator(`.pair-card[data-pair-id="${ids[0]}"][data-kind="icon"]`).click();
  await page.locator(`.pair-card[data-pair-id="${ids[1]}"][data-kind="word"]`).click();
  await expect(page.getByRole('button', { name: /Show Shroomer/ })).toBeVisible();
  // Hold the first flip steady: real-time polling can miss its 650 ms window
  // on a busy runner, without indicating a gameplay failure.
  await page.clock.install({ time: new Date('2026-10-06T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-06T12:00:01Z'));
  await page.getByRole('button', { name: /Show Shroomer/ }).click();
  await expect(page.locator('.pair-card-face')).toHaveCount(1);
  await page.getByRole('button', { name: 'Restart go' }).click();
  await expect(page.locator('.versus-now-playing')).toContainText("Ada's turn");
  await expect(page.locator('.pair-card-back')).toHaveCount(24);
  await page.clock.runFor(3000); // Both scheduled flip callbacks must stay cancelled.
  await expect(page.locator('.pair-card-back')).toHaveCount(24);
  await expect(page.locator('.match-progress')).toContainText('0 moves');
});

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
  await expect(page.locator('.order-tiles button, .pair-card').first()).toBeVisible();
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
  expect(saved[0].replay.frames.some((frame: { event: string }) => frame.event === 'Tile selected')).toBe(true);
  expect(saved[0].replay.frames.filter((frame: { event: string }) => frame.event.startsWith('Check'))).toHaveLength(2);
  await page.locator('.board-replay summary').click();
  const replay = page.locator('.board-replay');
  await replay.getByRole('button', { name: 'Next event' }).click();
  await expect(replay).toContainText('Check 1');
  await replay.getByRole('button', { name: 'Next event' }).click();
  await expect(replay.locator('.replay-selected')).toHaveCount(1);
  await replay.getByRole('button', { name: 'Restart replay' }).click();
  await expect(replay).toContainText('Timer started');
  await page.locator('.board-replay summary').click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.screenshot({ path: 'test-results/game-order-phone.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Rewind' }).click();
  await expect(page.getByRole('button', { name: 'Start Timer' })).toBeVisible();
  await expect(page.locator('.order-tiles button')).toHaveCount(0);
  await solveOrder(page);
  await expect(page.getByText('Practice complete', { exact: false })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_order_times_v1')!))).toEqual(saved);
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

test('Track Finder mixes all three clue types on a phone without origin giveaways', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openGame(page, 'Track Finder');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const kinds = new Set<string>();
  for (let index = 0; index < 3; index++) {
    const prompt = await page.locator('.quiz-panel h1').textContent();
    const task = TRACK_CHALLENGES.find(task => task.prompt === prompt)!;
    kinds.add(task.kind);
    expect(await page.locator('.finder-grid button').first().evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(16);
    if (task.kind === 'system') {
      const labels = await page.locator('.finder-grid button').allTextContents();
      expect(labels.every(label => !/^(Tour|SNES|N64|GBA|GCN|DS|Wii|3DS) /.test(label))).toBeTruthy();
    }
    await answerTrack(page);
    await expect(page.locator('.finder-verdict')).toContainText('Correct');
    if (index === 2) await page.screenshot({ path: 'test-results/track-finder-phone.png', fullPage: true, animations: 'disabled' });
    else await page.getByRole('button', { name: 'Next question' }).click();
  }
  expect(kinds.size).toBe(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

for (const [level, count] of [['Rookie', 4], ['Pro', 6], ['Legend', 9]] as const) {
  test(`Track Finder ${level} has ${count} tiles and explicit win feedback`, async ({ page }) => {
    await openGame(page, 'Track Finder');
    await page.getByRole('button', { name: level }).click();
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    await expect(page.locator('.finder-grid button')).toHaveCount(count);
    if (level === 'Pro') {
      const prompt = (await page.locator('.quiz-panel h1').textContent())!;
      const task = TRACK_CHALLENGES.find(task => task.prompt === prompt)!;
      const labels = await page.locator('.finder-grid button').allTextContents();
      const wrong = BOOSTER_COURSES.find(course => !task.correctIds.includes(course.id) && labels.includes(task.kind === 'system' ? trackLabel(course.title) : course.title))!;
      await page.locator('.finder-grid').getByRole('button', { name: task.kind === 'system' ? trackLabel(wrong.title) : wrong.title, exact: true }).click();
      await expect(page.locator('.finder-verdict')).toContainText('Not this time');
      await page.getByRole('button', { name: 'Rewind' }).click();
    }
    await answerTrack(page);
    await expect(page.locator('.finder-verdict')).toContainText('Correct — you found it');
    expect(await page.locator('.tile-verdict').count()).toBeGreaterThan(0);
  });
}

test('Shroomer takes individual championship turns including timed Game Order', async ({ page }) => {
  await openGame(page, 'Championship');
  await page.getByRole('button', { name: 'Play Shroomer', exact: true }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Quick', exact: true }).click();
  for (const game of ['Track Finder', 'Clue Match Up', 'Match & Hunt', 'Clue Duel', 'Category Finder']) await page.locator('.champ-game-toggle').filter({ hasText: game }).click();
  await page.getByRole('button', { name: 'Start Championship', exact: true }).click();
  for (const game of ['quiz', 'order']) {
    for (let turn = 0; turn < 6; turn += 1) {
      await page.getByRole('button', { name: turn % 2 ? "Start Shroomer's turn" : "Start Ada's turn" }).click();
      if (turn % 2) await page.getByRole('button', { name: /Show Shroomer/ }).click();
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

test('Shroomer shares relaxed Hunt and human controls are locked during its move', async ({ page }) => {
  await openGame(page, 'Match & Hunt');
  await page.getByRole('button', { name: 'Play Shroomer', exact: true }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await page.getByRole('button', { name: "Start Ada's turn" }).click();
  const ids = [...new Set(await page.locator('.pair-card').evaluateAll(cards => cards.map(card => card.getAttribute('data-pair-id'))))];
  await page.locator(`.pair-card[data-pair-id="${ids[0]}"][data-kind="icon"]`).click();
  await page.locator(`.pair-card[data-pair-id="${ids[1]}"][data-kind="word"]`).click();
  await expect(page.locator('.versus-now-playing')).toContainText("Shroomer's turn");
  await expect(page.locator('.pair-card:enabled')).toHaveCount(0);
  await page.getByRole('button', { name: /Show Shroomer/ }).click();
  // A bot must reveal cards rather than instantly locating an unseen pair.
  await expect(page.locator('.pair-card-face')).toHaveCount(1);
  await expect(page.getByRole('button', { name: /Show Shroomer/ })).toBeDisabled();
  await expect(page.locator('.pair-card-face')).toHaveCount(2);
  await expect.poll(async () => {
    const button = page.getByRole('button', { name: /Show Shroomer/ });
    return await button.count() === 0 || await button.isEnabled();
  }).toBe(true);
  // It may legitimately match or miss; do not encode a guaranteed bot success.
  expect(await page.locator('.pair-card-found').count()).toBeLessThanOrEqual(2);
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
        const answer = MATCH_CLUES.find(item => item.clue === clue)!.name;
        await page.locator('.match-column').first().getByRole('button', { name: answer, exact: true }).click();
        await page.locator('.match-column').last().getByRole('button', { name: clue, exact: true }).click();
      }
    } else {
      const label = (await page.locator('.quiz-panel h1').textContent())!.replace('Find one ', '').replace(/\.$/, '');
      const category = Object.entries(CATEGORY_LABELS).find(([, value]) => value === label)![0];
      const labels = await page.locator('.category-grid button span').allTextContents();
      const answer = CATEGORY_ITEMS.find(item => fitsCategory(item, category) && labels.includes(item.name))!;
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
  await page.clock.install();
  await openGame(page, 'Match & Hunt', true);
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByLabel('Player 2 name').fill('Ben');
  await page.getByRole('group', { name: 'Matching mode' }).getByRole('button', { name: 'Time Trial' }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const boards = new Set<string>();
  for (let turn = 0; turn < 6; turn += 1) {
    await page.getByRole('button', { name: turn % 2 ? "Start Ben's turn" : "Start Ada's turn" }).click();
    await page.getByRole('button', { name: 'Start Timer' }).click();
    await page.clock.runFor(3000);
    await expect(page.locator('.order-tiles button, .pair-card').first()).toBeVisible();
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
