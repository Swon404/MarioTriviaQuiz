import { expect, test } from '@playwright/test';
import { ADVENTURE_QUESTIONS } from '../src/mario/adventureQuestions.ts';
import { PLATFORM_QUESTIONS } from '../src/mario/platformQuestions.ts';
import { QUESTIONS, createQuiz } from '../src/mario/questions.ts';
import { seededBotRandom } from '../src/mario/memoryBot.ts';
import { MATCH_CLUES } from '../src/mario/matchClues.ts';
import { WORLD_COURSES } from '../src/mario/worldTracks.ts';
import { ITEM_CLUES } from '../src/mario/itemClues.ts';
import { CLUE_SUBJECTS } from '../src/mario/clues.ts';
import { TRACK_CHALLENGES } from '../src/mario/trackChallenges.ts';
import { createRounds } from '../src/mario/rounds.ts';

test('two adventure batches add 41 distinct questions, with capacity and fresh-first selection at every level', () => {
  const added = [...ADVENTURE_QUESTIONS, ...PLATFORM_QUESTIONS];
  expect(ADVENTURE_QUESTIONS).toHaveLength(20);
  expect(PLATFORM_QUESTIONS).toHaveLength(21);
  expect(new Set(added.map(q => q.knowledgeId)).size).toBe(41);
  expect(new Set(QUESTIONS.map(q => q.knowledgeId)).size).toBe(240);
  const addedIds = added.map(q => q.id);
  const history = QUESTIONS.filter(q => !addedIds.includes(q.id)).map(q => q.knowledgeId);
  for (const q of added) {
    expect(history).not.toContain(q.knowledgeId);
    expect(q.sourceReview).toMatchObject({ status: 'source-checked', checkedOn: '2026-10-29' });
    expect(new Set(q.choices).size).toBe(4);
    expect(q.explanation).not.toBe(q.prompt);
    expect(q.funFact).not.toBe(q.explanation);
    expect(q.sourceUrl).toMatch(/^https:\/\//);
  }
  for (const level of ['explorer', 'scientist', 'professor'] as const) {
    const fresh = added.filter(q => q.difficulty === level);
    expect(fresh.length).toBeGreaterThanOrEqual(10);
    for (let seed = 0; seed < 20; seed++) {
      const quiz = createQuiz('mario', level, 16, seededBotRandom(`adventure-${level}-${seed}`), history);
      expect(new Set(quiz.map(q => q.knowledgeId)).size).toBe(16);
      expect(quiz.slice(0, fresh.length).every(q => addedIds.includes(q.id))).toBe(true);
    }
  }
  const addedClues = MATCH_CLUES.filter(c => /^(adventure|platform)-/.test(c.id));
  expect(addedClues).toHaveLength(9);
  expect(addedClues.every(c => c.question.knowledgeId === c.id)).toBe(true);
});

test('every World course and item reaches Finder or Clue Duel with compatible distractors', () => {
  for (const subject of [...WORLD_COURSES, ...ITEM_CLUES]) {
    const history = CLUE_SUBJECTS.filter(c => c.id !== subject.id).map(c => `clue-${c.id}`);
    const first = createRounds('clue-duel', 'kart', 'professor', seededBotRandom(subject.id), undefined, undefined, undefined, history)[0];
    if (first.mode !== 'clue-duel') throw new Error('Expected clue');
    expect(first.answerId).toBe(subject.id);
    expect(first.choices).toHaveLength(8);
    const source = CLUE_SUBJECTS.find(c => c.id === subject.id)!;
    expect(first.choices.every(c => CLUE_SUBJECTS.find(s => s.id === c.id)?.kind === source.kind)).toBe(true);
    expect(first.clues).toHaveLength(5);
    expect(first.prompt).toContain('Mario Kart World');
  }
  for (const course of WORLD_COURSES) {
    const history = TRACK_CHALLENGES.filter(t => t.id !== course.id).map(t => `finder-${t.id}`);
    const first = createRounds('track-finder', 'kart', 'explorer', seededBotRandom(course.id), undefined, undefined, undefined, history)[0];
    if (first.mode !== 'track-finder') throw new Error('Expected finder');
    expect(first.id).toBe(`finder-${course.id}`);
    expect(first.correctIds).toContain(course.id);
    expect(first.tiles.every(c => WORLD_COURSES.some(w => w.id === c.id))).toBe(true);
    expect(first.challengeKind).toBe('feature');
  }
});

for (const id of ['adventure-wonder-hoppo', 'adventure-odyssey-pokio', 'platform-fury-blocks']) {
  test(`${id}: new sourced feedback fits the phone and stays stable after rewind`, async ({ page }) => {
    const q = QUESTIONS.find(question => question.id === id)!;
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('./');
    await page.evaluate(history => localStorage.setItem('mariotrivia_question_history_v1', JSON.stringify({ player: history })), QUESTIONS.filter(item => item.id !== id).map(item => item.knowledgeId));
    await page.getByRole('button', { name: 'Play Games' }).click();
    await page.getByRole('button', { name: 'Quiz Battle', exact: false }).click();
    await page.locator('.setup-settings > summary').click();
    await page.getByRole('button', { name: { explorer: /^Rookie/, scientist: /^Pro/, professor: /^Legend/ }[q.difficulty] }).click();
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    await expect(page.locator('.quiz-playing h1')).toHaveText(q.prompt);
    await page.locator('.answer-grid').getByText(q.answer, { exact: true }).click();
    await expect(page.locator('.feedback')).toContainText(q.explanation);
    await expect(page.getByRole('link', { name: 'Check the source', exact: false })).toHaveAttribute('href', q.sourceUrl);
    const before = await page.locator('.feedback').innerText();
    await page.getByRole('button', { name: /Rewind/ }).click();
    await page.locator('.answer-grid').getByText(q.answer, { exact: true }).click();
    await expect(page.locator('.feedback')).toHaveText(before, { useInnerText: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`${id}.png`), fullPage: true });
  });
}
