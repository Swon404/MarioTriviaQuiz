import { expect, test } from '@playwright/test';
import { QUESTION_FUN_FACTS, FUN_FACT_REVIEW, withVariedFunFacts } from '../src/mario/funFacts.ts';
import { QUESTIONS, createQuiz } from '../src/mario/questions.ts';

test('reviewed fact pools belong to their questions and keep shared Luigi facts distinct', () => {
  for (const [id, facts] of Object.entries(QUESTION_FUN_FACTS)) {
    const question = QUESTIONS.find(item => item.id === id)!;
    expect(question).toBeDefined();
    expect(question.sourceUrl).toBe(FUN_FACT_REVIEW.sourceUrl);
    expect(facts.length).toBeGreaterThanOrEqual(2);
    expect(new Set(facts).size).toBe(facts.length);
    expect(facts).not.toContain(question.explanation);
  }
  const originals = ['mario-explorer-1', 'mario-explorer-4'].map(id => QUESTIONS.find(q => q.id === id)!);
  const before = JSON.stringify(originals);
  const selected = withVariedFunFacts(originals, () => 0);
  expect(selected[0].funFact).not.toBe(selected[1].funFact);
  expect(JSON.stringify(originals)).toBe(before);
  expect(withVariedFunFacts(originals, () => 0)).toEqual(selected);
  expect(withVariedFunFacts(originals, () => 0.999)[0].funFact).not.toBe(selected[0].funFact);
  expect(withVariedFunFacts([{ id: 'unreviewed', funFact: 'Keep this fact.' }])[0].funFact).toBe('Keep this fact.');
  const exhausted = withVariedFunFacts(Array(4).fill(originals[0]), () => 0);
  expect(new Set(exhausted.slice(0, 2).map(q => q.funFact)).size).toBe(2);
  expect(exhausted.every(q => QUESTION_FUN_FACTS[originals[0].id].includes(q.funFact))).toBe(true);
  expect(withVariedFunFacts([{ id: '__proto__', funFact: 'Safe fallback.' }])[0].funFact).toBe('Safe fallback.');
  const pool = QUESTIONS.filter(q => q.topic === 'mario' && q.difficulty === 'explorer');
  const quiz = createQuiz('mario', 'explorer', new Set(pool.map(q => q.knowledgeId)).size, () => 0.5);
  for (const q of quiz.filter(q => Object.hasOwn(QUESTION_FUN_FACTS, q.id))) {
    expect(QUESTION_FUN_FACTS[q.id]).toContain(q.funFact);
  }
});

test('selected quiz fact stays the same after rewind and restoring a completed answer', async ({ page }) => {
  await page.goto('./');
  const wanted = QUESTIONS.find(q => q.id === 'mario-explorer-1')!;
  const recent = QUESTIONS.filter(q => q.knowledgeId !== wanted.knowledgeId).map(q => q.knowledgeId);
  await page.evaluate(history => localStorage.setItem('mariotrivia_question_history_v1', JSON.stringify({ ada: history })), recent);
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Quiz Battle' }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await expect(page.locator('.quiz-playing h1')).toHaveText(wanted.prompt);
  await page.locator('.answer-grid').getByText(wanted.answer, { exact: true }).click();
  const fact = page.locator('p').filter({ hasText: /^Fun fact:/ });
  const text = await fact.innerText();
  expect(QUESTION_FUN_FACTS[wanted.id].map(value => `Fun fact: ${value}`)).toContain(text);
  await page.getByRole('button', { name: 'Rewind' }).click();
  await page.locator('.answer-grid').getByText(wanted.answer, { exact: true }).click();
  await expect(fact).toHaveText(text);
  await page.reload();
  await page.getByRole('button', { name: /Resume/ }).click();
  await expect(fact).toHaveText(text);
});
