import { expect, test, type Page } from '@playwright/test';
import { BALANCED_CHAMPIONSHIP, championshipStandings, createChampionshipRounds } from '../src/mario/championship.ts';
import { availableModes, createRounds, DEFAULT_PAIR_OPTIONS } from '../src/mario/rounds.ts';
import { QUESTIONS } from '../src/mario/questions.ts';
import { scoreGroupKey, SCORE_VERSION } from '../src/mario/scoreGroups.ts';
import { createProgressBackup, importProgressBackup, parseBackup } from '../src/mario/progressBackup.ts';
import type { ChampionshipResult } from '../src/mario/storage.ts';

test('every Championship game has equal influence; matching is one board each at every size and level', () => {
  for (const size of ['quick', 'standard', 'epic'] as const) for (const level of ['explorer', 'scientist', 'professor'] as const) {
    for (const players of [1, 2]) {
      const rounds = createChampionshipRounds('match-hunt', 'mixed', level, size, Math.random, DEFAULT_PAIR_OPTIONS, players);
      expect(rounds).toHaveLength(players);
      expect(createChampionshipRounds('match-hunt', 'mixed', level, size, Math.random, DEFAULT_PAIR_OPTIONS, players, undefined, [], 2)).toHaveLength(players * 2);
    }
    expect(createRounds('match-hunt', 'mixed', level)).toHaveLength(2);
    for (const mode of availableModes('mixed')) {
      const own = [{ mode, correct: 3, points: 3 }];
      const other = [{ mode, correct: 2, points: 2 }];
      expect(championshipStandings(own, other, BALANCED_CHAMPIONSHIP)).toEqual([1, 0]);
      expect(championshipStandings(other, own, BALANCED_CHAMPIONSHIP)).toEqual([0, 1]);
      expect(championshipStandings(own, own, BALANCED_CHAMPIONSHIP)).toEqual([1, 1]);
      expect(championshipStandings(own, [])).toEqual([3, 0]);
      expect(championshipStandings(own, [], BALANCED_CHAMPIONSHIP)).toEqual([0, 0]);
    }
  }
  const own = [{ correct: 3, points: 3 }, { correct: 0, points: 0 }];
  const other = [{ correct: 2, points: 2 }, { correct: 1, points: 4 }];
  expect(championshipStandings(own, other, BALANCED_CHAMPIONSHIP)).toEqual([1, 1]);
  expect(championshipStandings(own, other)).toEqual([3, 6]);
});

test('balanced results retain their rules and raw games through backup and remain separate from old rankings', () => {
  const game = { mode: 'quiz' as const, correct: 3, total: 3, points: 3 };
  const old: ChampionshipResult = { id: 'old', player: 'Blaize', opponent: 'Dad', format: 'two-player', topic: 'mixed', difficulty: 'explorer', size: 'quick', games: [game], opponentGames: [game], points: 3, opponentPoints: 3, scoringVersion: SCORE_VERSION, scoreConfiguration: 'same games', completedAt: '2026-10-29T10:00:00Z' };
  const balanced: ChampionshipResult = { ...old, id: 'new', championshipRules: BALANCED_CHAMPIONSHIP, points: 1, opponentPoints: 1 };
  expect(scoreGroupKey(old)).not.toBe(scoreGroupKey(balanced));
  const map = new Map<string, string>();
  const storage = { get length() { return map.size; }, clear: () => map.clear(), key: (i: number) => [...map.keys()][i] ?? null, getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => { map.set(key, value); }, removeItem: (key: string) => { map.delete(key); } } satisfies Storage;
  const key = 'mariotrivia_championships_v1';
  storage.setItem(key, JSON.stringify([old, balanced]));
  const backup = createProgressBackup(storage);
  storage.clear();
  importProgressBackup(backup, storage);
  importProgressBackup(backup, storage);
  expect(JSON.parse(storage.getItem(key)!)).toEqual([old, balanced]);
  expect(() => parseBackup(JSON.stringify({ ...backup, data: { [key]: [{ ...balanced, championshipRules: 'unknown' }] } }))).toThrow();
});

async function start(page: Page) {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Championship', exact: false }).click();
  await page.locator('.setup-settings > summary').click();
  await page.getByRole('button', { name: 'Two Players', exact: true }).click();
  await page.getByLabel('Player name', { exact: true }).fill('Blaize');
  await page.getByLabel('Player 2 name').fill('Dad');
  await page.getByRole('button', { name: 'Quick', exact: true }).click();
  for (const game of ['Game Order', 'Track Finder', 'Match & Hunt', 'Clue Duel', 'Category Finder']) await page.locator('.champ-game-toggle').filter({ hasText: game }).click();
  await expect(page.locator('.champ-game-toggle.selected').filter({ hasText: 'Clue Match Up' })).toContainText('1 round');
  await page.getByRole('button', { name: 'Start Championship', exact: true }).click();
}
async function quiz(page: Page, miss = -1) {
  for (let turn = 0; turn < 6; turn++) {
    const prompt = await page.locator('.quiz-playing h1').innerText();
    const question = QUESTIONS.find(q => q.prompt === prompt)!;
    await page.locator('.answer-grid').getByText(turn === miss ? question.choices.find(c => c !== question.answer)! : question.answer, { exact: true }).click();
    await page.getByRole('button', { name: turn === 5 ? 'See result' : 'Next turn', exact: false }).click();
  }
}

test('two players split game wins despite unequal raw totals; one matching board, reload and lifetime points stay correct', async ({ page }) => {
  await start(page);
  await quiz(page, 1);
  await expect(page.getByRole('table', { name: 'Game results' }).locator('tbody td')).toHaveText(['3', '1', '2', '0']);
  await expect(page.locator('.champ-game-award')).toHaveText('Blaize wins Quiz Battle. +1 Championship point.');
  await page.reload();
  await page.getByRole('button', { name: 'Resume game', exact: true }).click();
  await page.getByRole('button', { name: 'Next: Clue Match Up', exact: true }).click();
  const snapshot = () => page.evaluate(() => JSON.parse(JSON.parse(localStorage.getItem('mariotrivia_checkpoint_v1')!).payload));
  const saved = await snapshot();
  expect(saved.session.rounds).toHaveLength(2);
  await expect(page.getByText('Round 1 of 1 each', { exact: true })).toBeVisible();
  const first = saved.session.rounds[0];
  for (let miss = 0; miss < 4; miss++) {
    await page.locator('.match-column').first().getByRole('button', { name: first.pairs[0].name, exact: true }).click();
    await page.locator('.match-column').last().getByRole('button', { name: first.pairs[1].clue, exact: true }).click();
  }
  await page.getByRole('button', { name: 'Next turn', exact: false }).click();
  for (const pair of saved.session.rounds[1].pairs) {
    await page.locator('.match-column').first().getByRole('button', { name: pair.name, exact: true }).click();
    await page.locator('.match-column').last().getByRole('button', { name: pair.clue, exact: true }).click();
  }
  await page.getByRole('button', { name: 'See result', exact: true }).click();
  await expect(page.getByRole('table', { name: 'Game results' }).locator('tbody td')).toHaveText(['0', '1', '4', '1']);
  await page.getByRole('button', { name: 'See championship result', exact: true }).click({ clickCount: 2 });
  await expect(page.getByRole('heading', { name: "🏆 It's a draw!" })).toBeVisible();
  const records = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_championships_v1')!));
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({ championshipRules: BALANCED_CHAMPIONSHIP, points: 1, opponentPoints: 1 });
  expect(records[0].games.map((g: { points: number }) => g.points)).toEqual([3, 0]);
  expect(records[0].opponentGames.map((g: { points: number }) => g.points)).toEqual([2, 4]);
  const lifetime = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_lifetime_v1')!));
  expect(lifetime.filter((g: { player: string }) => g.player === 'Blaize').reduce((sum: number, g: { points: number }) => sum + g.points, 0)).toBe(3);
  expect(lifetime.filter((g: { player: string }) => g.player === 'Dad').reduce((sum: number, g: { points: number }) => sum + g.points, 0)).toBe(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('balanced-championship-phone.png'), fullPage: true, animations: 'disabled' });
});

test('a resumed old Championship retains action totals and its two-board matching leg', async ({ page }) => {
  await start(page);
  await page.evaluate(async () => {
    const path = '/MarioTriviaQuiz/src/mario/checkpoint.ts';
    const { readCheckpoint, saveCheckpoint } = await import(path);
    const saved = readCheckpoint();
    delete saved.championship.championshipRules;
    delete saved.championship.matchBoards;
    saveCheckpoint(saved);
  });
  await page.reload();
  await page.getByRole('button', { name: 'Resume game', exact: true }).click();
  await quiz(page);
  await expect(page.getByRole('table', { name: 'Game results' }).locator('tbody td')).toHaveText(['3', '3', '3', '3']);
  await expect(page.locator('.champ-game-award')).toHaveCount(0);
  await page.getByRole('button', { name: 'Next: Clue Match Up', exact: true }).click();
  const count = await page.evaluate(() => JSON.parse(JSON.parse(localStorage.getItem('mariotrivia_checkpoint_v1')!).payload).session.rounds.length);
  expect(count).toBe(4);
  await expect(page.getByText('Round 1 of 2 each', { exact: true })).toBeVisible();
});
