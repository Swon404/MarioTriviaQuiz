import { test, expect } from '@playwright/test';
import { groupedScores, rankingPoints, scoreGroupKey, SCORE_VERSION } from '../src/mario/scoreGroups.ts';
import type { QuizResult, ChampionshipResult } from '../src/mario/storage.ts';

const quiz: QuizResult = { id: 'base', mode: 'quiz', player: 'Dad', topic: 'mixed', difficulty: 'explorer', correct: 3, total: 5, points: 3, elapsedMs: 1000, completedAt: '2026-10-15T10:00:00Z', scoringVersion: SCORE_VERSION, scoreConfiguration: 'Questions', format: 'solo' };
const championship: ChampionshipResult = { ...quiz, points: 3, size: 'quick', format: 'two-player', opponent: 'Blaize', opponentPoints: 5, games: [{ mode: 'quiz', total: 3, correct: 3, points: 3 }] };

test('score groups separate scoring versions, settings, lengths, formats and championship selections', () => {
  for (const change of [{ scoringVersion: 'earlier' }, { scoreConfiguration: 'Other rules' }, { total: 10 }, { mode: 'clue-duel' }, { difficulty: 'scientist' }, { topic: 'kart' }, { format: 'computer' }]) {
    expect(scoreGroupKey({ ...quiz, ...change } as QuizResult)).not.toBe(scoreGroupKey(quiz));
  }
  for (const change of [{ size: 'epic' }, { games: [{ mode: 'clue-duel', total: 3, correct: 3, points: 3 }] }, { games: [{ mode: 'quiz', total: 5, correct: 3, points: 3 }] }]) {
    expect(scoreGroupKey({ ...championship, ...change } as ChampionshipResult)).not.toBe(scoreGroupKey(championship));
  }
  const original = Array.from({ length: 7 }, (_, i) => ({ ...quiz, id: String(i), points: i }));
  const snapshot = JSON.stringify(original);
  expect(groupedScores([...original, { ...quiz, id: 'legacy', scoringVersion: undefined, points: 999 }, { ...quiz, id: 'leg', championshipLeg: true }])[0].records.map(item => item.id)).toEqual(['6', '5', '4', '3', '2']);
  expect(JSON.stringify(original)).toBe(snapshot);
});

test('Player 2 can lead a championship table while Shroomer cannot raise a human ranking', () => {
  const first = { ...championship, id: 'first', points: 200, opponentPoints: 0 };
  const second = { ...championship, id: 'second', points: 10, opponentPoints: 500 };
  expect(groupedScores([first, second])[0].records.map(item => item.id)).toEqual(['second', 'first']);
  expect(rankingPoints({ ...second, format: 'computer' })).toBe(10);
  const earlier = { ...quiz, id: 'earlier', elapsedMs: 9000, completedAt: '2026-10-14' };
  expect(groupedScores([quiz, earlier])[0].records[0].id).toBe('earlier');
});

test('human matching scores combine old levels while Shroomer challenges stay separate', () => {
  const matching: QuizResult = { ...quiz, mode: 'pair-match', variant: 'time-trial', scoreConfiguration: 'time-trial · 12 pairs · goal 3' };
  expect(scoreGroupKey({ ...matching, difficulty: 'professor' })).toBe(scoreGroupKey(matching));
  expect(scoreGroupKey({ ...matching, format: 'computer', difficulty: 'professor' })).not.toBe(scoreGroupKey({ ...matching, format: 'computer' }));
  expect(scoreGroupKey({ ...matching, scoreConfiguration: 'time-trial · 20 pairs · goal 3' })).not.toBe(scoreGroupKey(matching));
});

test('phone score page shows comparable Top 5, separate unchanged history and both championship players', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.goto('./');
  const records: QuizResult[] = Array.from({ length: 7 }, (_, i) => ({ ...quiz, id: `q${i}`, player: `Player ${i}`, points: i }));
  records.push({ ...quiz, id: 'old', player: 'Old score', points: 999, scoringVersion: undefined });
  const champs = [{ ...championship, id: 'one', points: 2, opponentPoints: 0 }, { ...championship, id: 'two', points: 1, opponentPoints: 5 }];
  await page.evaluate(({ records, champs }) => {
    localStorage.setItem('mariotrivia_results_v1', JSON.stringify(records));
    localStorage.setItem('mariotrivia_championships_v1', JSON.stringify(champs));
  }, { records, champs });
  await page.reload();
  await page.getByRole('button', { name: 'High Scores' }).click();
  const tables = page.locator('.finished-score-group');
  await expect(tables).toHaveCount(2);
  await expect(tables.first().locator('li')).toHaveCount(5);
  await expect(tables.first().locator('li').first()).toContainText('Player 6');
  await expect(page.locator('.legacy-score-history')).toContainText('999 points');
  await expect(tables.last().locator('li').first()).toContainText('Best score: Blaize · 5 points');
  await expect(tables.last().locator('li').first()).toContainText('1–5 points');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_results_v1')!))).toEqual(records);
});

test('resuming an older unfinished game does not relabel its points as new scoring', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Quiz Battle' }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const answer = await page.evaluate(async () => {
    const path = '/MarioTriviaQuiz/src/mario/checkpoint.ts';
    const { readCheckpoint, saveCheckpoint } = await import(path);
    const saved = readCheckpoint();
    delete saved.scoringVersion;
    saved.session.index = saved.session.rounds.length - 1;
    saved.session.correct = saved.session.index;
    saved.session.points = 108;
    saveCheckpoint(saved);
    return saved.session.rounds[saved.session.index].question.answer;
  });
  await page.reload();
  await page.getByRole('button', { name: 'Resume game', exact: true }).click();
  await page.locator('.answer-grid').getByText(answer, { exact: true }).click();
  await page.getByRole('button', { name: 'See result', exact: true }).click();
  await page.getByRole('button', { name: 'High Scores' }).click();
  await expect(page.locator('.finished-score-group')).toHaveCount(0);
  await expect(page.locator('.legacy-score-history')).toContainText('109 points');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_results_v1')!)[0].scoringVersion)).toBeUndefined();
});
