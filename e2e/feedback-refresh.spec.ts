import { expect, test } from '@playwright/test';
import { FAMILY_QUESTIONS } from '../src/mario/familyQuestions.ts';
import { QUESTIONS } from '../src/mario/questions.ts';
import { QUESTION_FUN_FACTS } from '../src/mario/funFacts.ts';
import { createHash } from 'node:crypto';

test('whole-bank editorial refresh preserves the answer key and keeps all feedback phone-sized', () => {
  // Keep the entire pre-expansion answer key locked. World additions have their
  // own coverage/history checks; adding them must not rewrite existing records.
  const baseline = QUESTIONS.filter(q => !/^(world|adventure|platform)-/.test(q.id));
  expect(baseline).toHaveLength(191);
  const key = baseline.map(({ id, knowledgeId, prompt, choices, answer, difficulty, sourceUrl }) =>
    // Only the duplicate spin-jump knowledge link changed; retain the original
    // hash for all wording, answers, levels and sources.
    ({ id, knowledgeId: id === 'family-wonder-bubble-spin' ? id : knowledgeId, prompt, choices, answer, difficulty, sourceUrl }));
  expect(createHash('sha256').update(JSON.stringify(key)).digest('hex'))
    // Three source links now point to the Nintendo tips/interview supporting
    // the richer feedback; IDs, questions, choices and answers are unchanged.
    .toBe('77299b5a9b6d7eae0458d7f7317557af251baec7510bfaee08e7016e22e3541b');
  expect(QUESTIONS).toHaveLength(252);
  expect(QUESTIONS.find(q => q.id === 'family-wonder-bubble-spin')!.knowledgeId).toBe('expanded-16');
  for (const q of QUESTIONS) {
    expect(q.explanation.trim().split(/\s+/).length, q.id).toBeLessThanOrEqual(48);
    expect(q.funFact.trim().split(/\s+/).length, q.id).toBeLessThanOrEqual(35);
    expect(q.explanation, q.id).not.toBe(q.answer);
    expect(q.funFact, q.id).not.toBe(q.explanation);
    expect(q.funFact, q.id).not.toMatch(/option can be switched off|also listed for|same release wave\.$/i);
    expect(new Set(q.choices).size, q.id).toBeGreaterThanOrEqual(4);
    expect(q.choices, q.id).toContain(q.answer);
  }
  for (const facts of Object.values(QUESTION_FUN_FACTS)) {
    for (const fact of facts) expect(fact.split(/\s+/).length).toBeLessThanOrEqual(35);
  }
});

for (const id of ['mario-scientist-5', 'expanded-18', 'fresh-12', 'gameplay-fury-partner', 'mario-luigi-gooigi', 'family-smb-time-limit', 'gameplay-3dw-cherry', 'gameplay-world-kamek', 'world-coin-cap', 'world-third-turbo', 'world-engine-sounds']) {
  test(`${id}: correct answers and wrong-answer retries reach the refreshed feedback`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 740 });
    const question = QUESTIONS.find(q => q.id === id)!;
    await page.goto('./');
    const history = QUESTIONS.filter(q => q.knowledgeId !== question.knowledgeId).map(q => q.knowledgeId);
    await page.evaluate(recent => localStorage.setItem('mariotrivia_question_history_v1', JSON.stringify({ blaize: recent })), history);
    await page.getByRole('button', { name: 'Play Games' }).click();
    await page.getByRole('button', { name: 'Quiz Battle' }).click();
    await page.locator('.setup-settings > summary').click();
    await page.getByLabel('Player name', { exact: true }).fill('Blaize');
    const level = { explorer: 'Rookie', scientist: 'Pro', professor: 'Legend' }[question.difficulty];
    await page.getByRole('group', { name: 'Difficulty', exact: true }).getByRole('button', { name: new RegExp(level) }).click();
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    await expect(page.locator('.quiz-playing h1')).toHaveText(question.prompt);
    await page.locator('.answer-grid').getByText(question.answer, { exact: true }).click();
    await expect(page.locator('.feedback h2')).toHaveText('Correct!');
    await expect(page.locator('.feedback')).toContainText(question.explanation);
    await expect(page.locator('.feedback')).toContainText(question.funFact);
    await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
    const tries = { explorer: 4, scientist: 2, professor: 1 }[question.difficulty];
    for (let i = 0; i < tries; i++) {
      // Rookie has four attempts but three wrong choices; its final attempt
      // must be correct once the wrong choices are exhausted. Use Pro for
      // exhausted-answer coverage, and verify Rookie retry feedback instead.
      const wrong = page.locator('.answer-grid button:not([disabled])').filter({ hasNotText: question.answer }).first();
      if (i >= question.choices.length - 1) break;
      await wrong.click();
    }
    if (question.difficulty === 'explorer') {
      await page.locator('.answer-grid').getByText(question.answer, { exact: true }).click();
    } else {
      await expect(page.locator('.feedback h2')).toContainText(question.answer);
    }
    await expect(page.locator('.feedback')).toContainText(question.explanation);
    await expect(page.locator('.feedback')).toContainText(question.funFact);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('refreshed favourite-game feedback stays concise, distinct and source-reviewed', () => {
  const refreshed = FAMILY_QUESTIONS.filter(q => q.sourceReview?.checkedOn === '2026-10-20');
  expect(refreshed).toHaveLength(18);
  expect(new Set(refreshed.map(q => q.funFact)).size).toBe(18);
  for (const question of refreshed) {
    expect(question.explanation.trim().split(/\s+/).length).toBeLessThanOrEqual(48);
    expect(question.funFact.trim().split(/\s+/).length).toBeLessThanOrEqual(35);
    expect(question.funFact).not.toBe(question.explanation);
    expect(question.choices).toContain(question.answer);
    expect(question.sourceUrl).toMatch(/^https:\/\/(www\.|play\.)nintendo\.com\//);
  }
});

test('World feedback shows the new explanation and fact, reads them aloud and keeps them on rewind', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.goto('./');
  const question = QUESTIONS.find(q => q.id === 'family-world-cup-races')!;
  const recent = QUESTIONS.filter(q => q.knowledgeId !== question.knowledgeId).map(q => q.knowledgeId);
  await page.evaluate(history => localStorage.setItem('mariotrivia_question_history_v1', JSON.stringify({ blaize: history })), recent);
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Quiz Battle' }).click();
  await page.locator('.setup-settings > summary').click();
  await page.getByLabel('Player name', { exact: true }).fill('Blaize');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await expect(page.locator('.quiz-playing h1')).toHaveText(question.prompt);
  await page.locator('.answer-grid').getByText(question.answer, { exact: true }).click();
  const feedback = page.locator('.feedback');
  await expect(feedback).toContainText(question.explanation);
  await expect(feedback).toContainText(`Fun fact: ${question.funFact}`);
  await page.evaluate(() => { window.speechSynthesis.speak = utterance => { document.body.dataset.lastSpoken = utterance.text; }; });
  await page.getByRole('button', { name: 'Read explanation aloud' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-last-spoken', `${question.explanation} Fun fact: ${question.funFact}`);
  await page.getByText('Open Learning Zone card', { exact: true }).click();
  await expect(page.locator('.learning-topic-card')).toContainText(question.explanation);
  await expect(page.locator('.learning-topic-card')).toContainText(question.funFact);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByText('Open Learning Zone card', { exact: true }).click();
  await page.screenshot({ path: test.info().outputPath('world-feedback-phone.png'), fullPage: true });
  await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
  await page.locator('.answer-grid').getByText(question.answer, { exact: true }).click();
  await expect(feedback).toContainText(question.funFact);
});
