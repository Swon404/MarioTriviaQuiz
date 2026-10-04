import { expect, test } from '@playwright/test';
import { canonicalKnowledge, normalizeKnowledge } from '../src/mario/knowledge.ts';
import { QUESTIONS, createQuiz } from '../src/mario/questions.ts';
import { knowledgeRank } from '../src/mario/questionHistory.ts';

test('equivalent facts share history without merging replaced questions', () => {
  for (const [alias, canonical] of [
    ['expanded-27', 'kart-professor-10'],
    ['expanded-42', 'kart-professor-9'],
    ['fresh-8', 'expanded-8'],
  ]) {
    expect(QUESTIONS.find(question => question.id === alias)!.knowledgeId).toBe(canonical);
  }
  expect(normalizeKnowledge(['fresh-17', 'new-fact', 'mario-professor-3'])).toEqual(['mario-professor-3', 'new-fact']);
  for (const id of ['mario-explorer-6', 'mario-explorer-10', 'fresh-12', 'expanded-27', '__proto__']) {
    expect(canonicalKnowledge(id)).toBe(id);
  }
  expect(knowledgeRank('mario-professor-3', ['fresh-17', 'older'])).toBe(-0);
  const pool = QUESTIONS.filter(question => question.difficulty === 'professor');
  const history = pool.map(question => question.knowledgeId === 'mario-professor-3' ? 'fresh-17' : question.knowledgeId);
  const quiz = createQuiz('mixed', 'professor', new Set(pool.map(question => question.knowledgeId)).size, () => 0.5, history);
  expect(quiz.every(question => question.review)).toBe(true);
  expect(new Set(quiz.map(question => question.knowledgeId)).size).toBe(quiz.length);
});

test('legacy saved history is normalised when play resumes without deleting unrelated facts', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => {
    const key = 'mariotrivia_question_history_v1';
    localStorage.setItem(key, JSON.stringify({ ada: ['fresh-17', 'keep-me', 'mario-professor-3', 'fresh-12'], ben: ['expanded-42'] }));
  });
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Quiz Battle', exact: false }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_question_history_v1')!));
  expect(saved.ada.slice(1)).toEqual(['mario-professor-3', 'keep-me', 'fresh-12']);
  expect(saved.ben).toEqual(['kart-professor-9']);
});
