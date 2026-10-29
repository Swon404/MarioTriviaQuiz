import { expect, test } from '@playwright/test';
import { QUESTIONS } from '../src/mario/questions.ts';
import { GAME_DISCOVERIES, QUESTION_DISCOVERIES, TRACK_DISCOVERIES } from '../src/mario/discoveries.ts';
import { TRACK_CHALLENGES, trackLabel } from '../src/mario/trackChallenges.ts';
import { FINDER_COURSES as BOOSTER_COURSES } from '../src/mario/trackChallenges.ts';
import { createRounds, MARIO_TIMELINE } from '../src/mario/rounds.ts';
import { seededBotRandom } from '../src/mario/memoryBot.ts';
import { captureSpeech } from './speech-capture.ts';

test('every reviewed extra has a source and survives round generation without restoring bland templates', () => {
  expect(Object.keys(GAME_DISCOVERIES).sort()).toEqual(MARIO_TIMELINE.map(game => game.id).sort());
  expect(Object.keys(TRACK_DISCOVERIES).sort()).toEqual(TRACK_CHALLENGES.filter(task => !task.id.startsWith('world-')).map(task => task.id).sort());
  for (const [id, extra] of Object.entries(QUESTION_DISCOVERIES)) {
    const question = QUESTIONS.find(q => q.id === id)!;
    expect(question, id).toBeDefined();
    expect(question.funFact, id).toBe(extra.text);
    expect(question.funFactSourceUrl, id).toBe(extra.sourceUrl);
  }
  for (const mode of ['quiz', 'pair-match', 'match-hunt', 'clue-duel', 'track-finder', 'category-finder', 'game-order'] as const) {
    for (const level of ['explorer', 'scientist', 'professor'] as const) {
      for (let seed = 0; seed < 5; seed++) {
        for (const round of createRounds(mode, 'mixed', level, seededBotRandom(`${mode}-${level}-${seed}`))) {
          const copy = JSON.parse(JSON.stringify(round));
          expect(copy.funFact, round.id).not.toMatch(/pass brings back|cup’s middle races|line-up stretches|Nintendo lists|Use the original release/);
          expect(copy.funFact.split(/\s+/).length, round.id).toBeLessThanOrEqual(35);
          expect(new URL(copy.funFactSourceUrl ?? copy.sourceUrl).protocol).toBe('https:');
        }
      }
    }
  }
});

test('Feather feedback teaches the balloon steal and SNES history after a wrong answer, speech and resume', async ({ page }) => {
  await captureSpeech(page);
  await page.setViewportSize({ width: 390, height: 740 });
  const question = QUESTIONS.find(q => q.id === 'expanded-38')!;
  expect(question.answer).toBe('Feather');
  expect(question.explanation).toContain('steal a balloon');
  expect(question.explanation).not.toMatch(/Battle (?:mode|item)|Grand Prix|only available/i);
  expect(question.funFact).toContain('original Super Mario Kart on SNES');
  await page.goto('./');
  await page.evaluate(history => localStorage.setItem('mariotrivia_question_history_v1', JSON.stringify({ blaize: history })),
    QUESTIONS.filter(q => q.knowledgeId !== question.knowledgeId).map(q => q.knowledgeId));
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Quiz Battle' }).click();
  await page.locator('.setup-settings > summary').click();
  await page.getByLabel('Player name', { exact: true }).fill('Blaize');
  await page.getByRole('group', { name: 'Difficulty', exact: true }).getByRole('button', { name: /Legend/ }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await expect(page.locator('.quiz-playing h1')).toHaveText(question.prompt);
  await page.locator('.answer-grid').getByText('Super Horn', { exact: true }).click();
  await expect(page.locator('.feedback h2')).toHaveText('Answer: Feather');
  await expect(page.locator('.feedback')).toContainText(question.explanation);
  await expect(page.locator('.feedback')).toContainText(question.funFact);
  await expect(page.locator('.feedback').getByRole('link', { name: 'Tip / fun fact source ↗' })).toHaveAttribute('href', question.funFactSourceUrl!);
  await page.getByRole('button', { name: 'Read explanation aloud' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-spoken', `${question.explanation} Fun fact: ${question.funFact}`);
  await page.reload();
  await page.getByRole('button', { name: /Resume/ }).click();
  await expect(page.locator('.feedback')).toContainText(question.funFact);
  await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
  await page.locator('.answer-grid').getByText('Feather', { exact: true }).click();
  await expect(page.locator('.feedback h2')).toHaveText('Correct!');
  await expect(page.locator('.feedback')).toContainText(question.explanation);
  await expect(page.locator('.feedback')).toContainText(question.funFact);
  await page.locator('.feedback').scrollIntoViewIfNeeded();
  await page.screenshot({ path: test.info().outputPath('feather-feedback-phone.png'), fullPage: true });
});

for (const system of ['DS', 'SNES']) {
  test(`${system} multi-answer phone feedback names both valid tracks and adds a separate discovery`, async ({ page }) => {
    await captureSpeech(page);
    await page.setViewportSize({ width: 390, height: 740 });
    await page.goto('./');
    const wanted = TRACK_CHALLENGES.find(task => task.id === `system-${system}`)!;
    await page.evaluate(history => localStorage.setItem('mariotrivia_question_history_v1', JSON.stringify({ blaize: history })),
      TRACK_CHALLENGES.filter(task => task !== wanted).map(task => `finder-${task.id}`));
    await page.getByRole('button', { name: 'Play Games' }).click();
    await page.getByRole('button', { name: 'Track Finder' }).click();
    if (await page.locator('.setup-settings:not([open])').count()) await page.locator('.setup-settings > summary').click();
    await page.getByLabel('Player name', { exact: true }).fill('Blaize');
    await page.getByRole('group', { name: 'Difficulty', exact: true }).getByRole('button', { name: /Legend/ }).click();
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    for (let i = 0; i < 3; i++) {
      const prompt = await page.locator('.quiz-playing h1').innerText();
      const task = TRACK_CHALLENGES.find(task => task.prompt === prompt)!;
      const labels = await page.locator('.finder-grid button').allTextContents();
      const visible = BOOSTER_COURSES.filter(course => labels.includes(task.kind === 'system' ? trackLabel(course.title) : course.title));
      const valid = visible.filter(course => task.correctIds.includes(course.id));
      const wrong = visible.find(course => !task.correctIds.includes(course.id))!;
      await page.locator('.finder-grid button').getByText(task.kind === 'system' ? trackLabel(wrong.title) : wrong.title, { exact: true }).click();
      if (task.id === wanted.id) {
        expect(valid).toHaveLength(2);
        for (const course of valid) await expect(page.locator('.feedback h2')).toContainText(course.title);
        await expect(page.locator('.feedback')).toContainText(wanted.explanation);
        await expect(page.locator('.feedback')).toContainText(wanted.funFact);
        await expect(page.locator('.feedback')).not.toContainText('Playing its remake on Switch');
        await expect(page.locator('.feedback').getByRole('link', { name: 'Tip / fun fact source ↗' })).toHaveAttribute('href', wanted.funFactSourceUrl!);
        await page.getByRole('button', { name: 'Read explanation aloud' }).click();
        await expect(page.locator('body')).toHaveAttribute('data-spoken', `${wanted.explanation} Fun fact: ${wanted.funFact}`);
        await page.reload();
        await page.getByRole('button', { name: /Resume/ }).click();
        await expect(page.locator('.feedback')).toContainText(wanted.funFact);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.locator('.feedback').scrollIntoViewIfNeeded();
        await page.screenshot({ path: test.info().outputPath(`${system}-discovery-phone.png`), fullPage: true });
        return;
      }
      await page.getByRole('button', { name: /^Next question/ }).click();
    }
    throw new Error('Requested system challenge was not shown');
  });
}

test('Game Order reveals a sourced fact about a game on the solved board and retains it on resume', async ({ page }) => {
  await page.clock.install();
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Game Order' }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await expect(page.locator('.order-discovery')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
  await page.clock.runFor(3000);
  const buttons = page.locator('.order-tiles button');
  await expect(buttons.first()).toBeVisible();
  const current = await buttons.locator('span').allTextContents();
  const games = current.map(title => MARIO_TIMELINE.find(game => game.title === title)!);
  const fact = GAME_DISCOVERIES[games[0].id];
  const sorted = [...games].sort((a,b) => a.year-b.year).map(game => game.title);
  for (let index = 0; index < sorted.length; index++) {
    const other = current.indexOf(sorted[index]);
    if (other === index) continue;
    await buttons.nth(index).click(); await buttons.nth(other).click();
    [current[index], current[other]] = [current[other], current[index]];
  }
  await page.getByRole('button', { name: 'Check order', exact: true }).click();
  await expect(page.locator('.order-discovery')).toContainText(fact.text);
  await expect(page.locator('.order-discovery a')).toHaveAttribute('href', fact.sourceUrl);
  await page.reload();
  await page.getByRole('button', { name: /Resume/ }).click();
  await expect(page.locator('.order-discovery')).toContainText(fact.text);
});
