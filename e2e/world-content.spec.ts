import { expect, test } from '@playwright/test';
import { QUESTIONS, createQuiz, type Difficulty } from '../src/mario/questions.ts';
import { WORLD_QUESTIONS, WORLD_MATCH_CLUES } from '../src/mario/worldQuestions.ts';
import { MATCH_CLUES } from '../src/mario/matchClues.ts';
import { seededBotRandom } from '../src/mario/memoryBot.ts';
import { createRounds, DEFAULT_PAIR_OPTIONS } from '../src/mario/rounds.ts';

test('World expansion reaches returning players first at every level without replacing old knowledge', () => {
  const old = QUESTIONS.filter(q => !q.id.startsWith('world-'));
  const history = old.map(q => q.knowledgeId);
  expect(new Set(history).size).toBe(220);
  expect(WORLD_QUESTIONS).toHaveLength(20);
  expect(new Set(WORLD_QUESTIONS.map(q => q.knowledgeId)).size).toBe(20);
  for (const q of WORLD_QUESTIONS) {
    expect(history).not.toContain(q.knowledgeId);
    expect(q.sourceReview?.checkedOn).toBe('2026-10-28');
    expect(q.prompt).toContain('Mario Kart World');
  }
  for (const level of ['explorer', 'scientist', 'professor'] as Difficulty[]) {
    const fresh = WORLD_QUESTIONS.filter(q => q.difficulty === level);
    expect(fresh.length).toBeGreaterThanOrEqual(6);
    for (let seed = 0; seed < 20; seed++) {
      const quiz = createQuiz('kart', level, 10, seededBotRandom(`world-${level}-${seed}`), history);
      expect(new Set(quiz.slice(0, fresh.length).map(q => q.id))).toEqual(new Set(fresh.map(q => q.id)));
    }
  }
});

test('World matching clues share Quiz history and never borrow harder facts', () => {
  const ids = Object.keys(WORLD_MATCH_CLUES);
  expect(ids).toHaveLength(8);
  for (const id of ids) {
    const match = MATCH_CLUES.find(item => item.id === id)!;
    expect(match.question.knowledgeId).toBe(id);
    expect(match.name).toBe(QUESTIONS.find(q => q.id === id)!.answer);
  }
  const history = QUESTIONS.filter(q => !ids.includes(q.id)).map(q => q.knowledgeId);
  const rounds = createRounds('match-hunt', 'mixed', 'explorer', seededBotRandom('world-match'), DEFAULT_PAIR_OPTIONS, undefined, undefined, history);
  const shown = rounds.flatMap(round => round.mode === 'match-hunt' ? round.pairs.map(pair => pair.id) : []);
  expect(shown).toHaveLength(8);
  for (const id of shown) expect(QUESTIONS.find(q => q.id === id)!.difficulty).toBe('explorer');
  for (const id of ids.filter(id => QUESTIONS.find(q => q.id === id)!.difficulty === 'explorer')) expect(shown).toContain(id);
});

test('World course discoveries are searchable with correctly labelled external sources', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Explore Learning Zone' }).click();
  await page.getByLabel('Search learning cards').fill('mermaid');
  await expect(page.locator('.learning-topic-card')).toHaveCount(1);
  await expect(page.locator('.learning-topic-card h3')).toHaveText('Birdo');
  await expect(page.getByRole('link', { name: 'Read Mario Wiki guide' })).toHaveAttribute('href', 'https://www.mariowiki.com/Salty_Salty_Speedway');
  await expect(page.locator('.learning-topic-card')).toContainText('This race starts in boat mode.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('world-learning-phone.png'), fullPage: true });
});
