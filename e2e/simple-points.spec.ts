import { expect, test } from '@playwright/test';
import { createRounds, DEFAULT_PAIR_OPTIONS } from '../src/mario/rounds.ts';
import { startSession, submit, advance, rewind } from '../src/mario/session.ts';
import { playComputerRounds } from '../src/mario/computer.ts';
import { newTurnScores, scoreTurn } from '../src/mario/turns.ts';
import { MATCH_CLUES } from '../src/mario/matchClues.ts';

test('Clue Match Up awards pairs, including partial boards, without repeat awards', () => {
  const round = createRounds('match-hunt', 'mixed', 'explorer')[0];
  if (round.mode !== 'match-hunt') throw new Error('Wrong mode');
  const game = startSession([round]);
  const partial = submit(game, 'wrong-pair', 2);
  expect(partial.submission!.correct).toBe(false);
  expect(advance(partial).points).toBe(2);
  expect(advance(advance(partial)).points).toBe(2);
  expect(rewind(partial).points).toBe(0);
  expect(advance(submit(game, round.targetId)).points).toBe(round.pairs.length);
  expect(playComputerRounds([round], 'explorer', [round.targetId]).points).toBe(round.pairs.length);
});

test('Solo computer timed matching awards one; untimed Hunt has no target bonus', () => {
  for (const timed of [false, true]) {
    const round = createRounds('pair-match', 'mixed', 'explorer', Math.random, { ...DEFAULT_PAIR_OPTIONS, variant: 'hunt', huntTimed: timed, targetMode: 'random', unlockPairs: 2 })[0];
    if (round.mode !== 'pair-match') throw new Error('Wrong mode');
    expect(playComputerRounds([round], 'explorer', [round.completionId]).points).toBe(timed ? 1 : 3);
  }
});

test('Timed round awards one to the faster player and one each for an exact tie', () => {
  for (const [second, expected] of [[900, [0, 1]], [1100, [1, 0]], [1000, [1, 1]]] as const) {
    const initial = scoreTurn(newTurnScores(), 0, true, 0, 1000, true);
    expect(initial.points).toEqual([0, 0]);
    expect(scoreTurn(initial, 1, true, 0, second, true).points).toEqual(expected);
    expect(initial.points).toEqual([0, 0]);
  }
});

test('Clue Match Up live points survive a failed board and rewind clears them', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Clue Match Up' }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const clues = await page.locator('.match-column').last().locator('button').allTextContents();
  const names = clues.map(clue => MATCH_CLUES.find(item => item.clue === clue)!.name);
  const choose = async (name: string, clue: string) => {
    await page.locator('.match-column').first().getByRole('button', { name, exact: true }).click();
    await page.locator('.match-column').last().getByRole('button', { name: clue, exact: true }).click();
  };
  await choose(names[0], clues[0]);
  await expect(page.locator('.score-display')).toContainText('1 point');
  for (let i = 0; i < 4; i++) await choose(names[1], clues[2]);
  await expect(page.locator('.feedback')).toContainText('Round over');
  await expect(page.locator('.mario-earned')).toHaveText('+1 point');
  await expect(page.locator('.score-display')).toContainText('1 point');
  await page.getByRole('button', { name: 'Rewind', exact: false }).click();
  await expect(page.locator('.score-display')).toContainText('0 points');
});

test('Championship timed award is visible immediately and Next commits it only once', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Championship', exact: false }).click();
  await page.locator('.setup-settings > summary').click();
  await page.getByRole('button', { name: 'Two Players', exact: true }).click();
  for (const game of ['Quiz Battle', 'Clue Match Up', 'Match & Hunt', 'Clue Duel', 'Category Finder']) await page.locator('.champ-game-toggle').filter({ hasText: game }).click();
  await page.getByRole('button', { name: 'Start Championship', exact: true }).click();
  for (const index of [0, 1]) {
    await page.evaluate(async index => {
      const path = '/MarioTriviaQuiz/src/mario/checkpoint.ts';
      const { readCheckpoint, saveCheckpoint } = await import(path);
      const saved = readCheckpoint();
      const round = saved.session.rounds[index];
      saved.session.index = index;
      saved.session.submission = { answer: round.correctIds, correct: true, correctLabel: '', points: 0 };
      saved.completedMs = index === 0 ? 1000 : 900;
      saved.orderCheckpoint = { resultId: saved.runId + ':' + index, tiles: round.correctIds, selected: null, started: Date.now() - saved.completedMs, elapsed: saved.completedMs, penalty: 0, attempts: 1, feedback: [], solved: true, recordMessage: '', frames: [], practice: false };
      saveCheckpoint(saved);
    }, index);
    await page.reload();
    await page.getByRole('button', { name: 'Resume game', exact: true }).click();
    const table = page.getByRole('table', { name: 'Championship scores' });
    await expect(table.locator('tbody td')).toHaveText(index === 0 ? ['0 points', '0 points', '0 points', '0 points'] : ['0 points', '0 points', '1 point', '1 point']);
    if (index === 0) await expect(page.locator('.order-result')).toContainText('Waiting for the other player');
    else await expect(page.locator('.order-result')).toContainText('+1 point');
    await page.getByRole('button', { name: 'Next turn', exact: false }).click();
    await expect(table.locator('tbody td')).toHaveText(index === 0 ? ['0 points', '0 points', '0 points', '0 points'] : ['0 points', '0 points', '1 point', '1 point']);
  }
});
