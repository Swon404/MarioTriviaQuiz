import { expect, test } from '@playwright/test';
import { QUESTIONS, createQuiz } from '../src/mario/questions.ts';
import { CLUE_SUBJECTS } from '../src/mario/clues.ts';
import { TRACK_CHALLENGES } from '../src/mario/trackChallenges.ts';
import { feedbackKnowledge } from '../src/mario/feedbackKnowledge.ts';
import { hasSeenKnowledge } from '../src/mario/questionHistory.ts';
import { canonicalKnowledge } from '../src/mario/knowledge.ts';
import { seededBotRandom } from '../src/mario/memoryBot.ts';
import { extraKnowledgeId, extraQuizKnowledge } from '../src/mario/extraKnowledge.ts';
import { withVariedFunFacts } from '../src/mario/funFacts.ts';

test('semantic links identify real facts, keep unrelated knowledge fresh and combine duplicate history', () => {
  const all = [...QUESTIONS.map(q => q.knowledgeId), ...CLUE_SUBJECTS.map(s => `clue-${s.id}`), ...TRACK_CHALLENGES.map(t => `finder-${t.id}`)];
  for (const id of all) for (const linked of feedbackKnowledge(id)) expect(all, id).toContain(linked);
  expect(hasSeenKnowledge('finder-world-salty', ['world-salty-statue'])).toBe(true);
  expect(hasSeenKnowledge('clue-world-salty', ['world-salty-statue'])).toBe(true);
  expect(hasSeenKnowledge('finder-world-falls', ['world-falls-current'])).toBe(false);
  expect(feedbackKnowledge('finder-cup-Spiny Cup')).toContain('kart-professor-1');
  expect(feedbackKnowledge('finder-cup-Spiny Cup')).not.toContain('kart-professor-7');
  expect(hasSeenKnowledge('clue-char-luigi', ['mario-explorer-1'])).toBe(false);
  expect(hasSeenKnowledge('clue-char-luigi', ['mario-explorer-4', 'mario-professor-7'])).toBe(true);
  expect(canonicalKnowledge('family-wonder-bubble-spin')).toBe('expanded-16');
  const quiz = createQuiz('mario', 'professor', 16, seededBotRandom('semantic'), ['family-wonder-bubble-spin']);
  expect(quiz.every(q => q.knowledgeId !== 'expanded-16')).toBe(true);
  const tower = QUESTIONS.find(q => q.id === 'goomba-jump')!.funFact;
  const otherTower = QUESTIONS.find(q => q.id === 'family-odyssey-chain-release')!.funFact;
  expect(extraKnowledgeId(tower)).toBe(extraKnowledgeId(otherTower));
  expect(extraQuizKnowledge(tower)).toEqual(['adventure-odyssey-goomba-stack']);
  expect(withVariedFunFacts([{ id: 'different-wording', funFact: otherTower }], Math.random, [extraKnowledgeId(tower)])[0].funFact).toBe('');
  expect(withVariedFunFacts([{ id: 'previous-quiz', funFact: tower }], Math.random, ['adventure-odyssey-goomba-stack'])[0].funFact).toBe('');
});

test('a vague clue does not reveal Quiz knowledge; answered feedback records it for both people', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(ids => localStorage.setItem('mariotrivia_question_history_v1', JSON.stringify({ ada: ids })), CLUE_SUBJECTS.filter(s => s.id !== 'char-goomba').map(s => `clue-${s.id}`));
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Clue Duel', exact: false }).click();
  await page.locator('.setup-settings > summary').click();
  await page.getByLabel('Player name', { exact: true }).fill('Ada');
  await page.getByRole('button', { name: 'Two Players', exact: true }).click();
  await page.getByLabel('Player 2 name').fill('Ben');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  // Mixed-topic rounds shuffle their two topic groups. Follow the saved board
  // through the public UI until the seeded unseen character is displayed.
  for (let index = 0; index < 10; index++) {
    const clue = await page.locator('.clue-list').innerText();
    const subject = CLUE_SUBJECTS.find(s => clue.includes(s.clues[0]))!;
    if (subject.id === 'char-goomba') {
      const before = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_question_history_v1')!));
      expect(before.ada).not.toContain('goomba-jump');
      expect(before.ben ?? []).not.toContain('goomba-jump');
      await page.locator('.answer-grid').getByText('Goomba', { exact: true }).click();
      await expect(page.locator('.feedback')).toBeVisible();
      const after = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_question_history_v1')!));
      expect(after.ada).toContain('goomba-jump');
      expect(after.ben).toContain('goomba-jump');
      return;
    }
    await page.locator('.answer-grid').getByText(subject.answer, { exact: true }).click();
    await page.getByRole('button', { name: 'Next turn', exact: false }).click();
  }
  throw new Error('Unseen Goomba did not appear');
});
