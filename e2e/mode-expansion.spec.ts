import { expect, test } from '@playwright/test';
import { MARIO_TIMELINE, makeComparableOrderPair, createRounds, DEFAULT_PAIR_OPTIONS } from '../src/mario/rounds.ts';
import { seededBotRandom } from '../src/mario/memoryBot.ts';
import { ADVENTURE_CLUES, ODYSSEY_PLACES } from '../src/mario/adventureClues.ts';
import { CLUE_SUBJECTS } from '../src/mario/clues.ts';
import { CATEGORY_ITEMS, fitsCategory } from '../src/mario/categoryCatalog.ts';
import { personalBestMessage, personalTimeBest } from '../src/mario/personalBest.ts';
import { matchNameKey } from '../src/mario/matchClues.ts';

test('expanded catalogues preserve chronology, comparable work, same-kind choices and exact memberships', () => {
  expect(MARIO_TIMELINE).toHaveLength(30);
  expect(new Set(MARIO_TIMELINE.map(g => g.year)).size).toBe(30);
  expect(MARIO_TIMELINE.map(g => g.year)).toEqual(MARIO_TIMELINE.map(g => g.year).sort((a, b) => a - b));
  const seen = new Set<string>();
  const swaps = (permutation: number[]) => {
    const visited = new Set<number>(); let cycles = 0;
    for (let i = 0; i < permutation.length; i++) if (!visited.has(i)) {
      cycles++; let at = i;
      while (!visited.has(at)) { visited.add(at); at = permutation[at]; }
    }
    return permutation.length - cycles;
  };
  for (let seed = 0; seed < 100; seed++) for (const tiles of [4, 6, 8]) {
    const pair = makeComparableOrderPair('explorer', seededBotRandom(`order-${seed}`), { tiles, challenge: 'hard' });
    for (const round of pair) { expect(round.orderRuleset).toBe('order-v3'); round.tiles.forEach(g => seen.add(g.id)); }
    expect(pair[0].tiles.every(g => !pair[1].correctIds.includes(g.id))).toBe(true);
    expect(swaps(pair[0].tiles.map(g => pair[0].correctIds.indexOf(g.id)))).toBe(swaps(pair[1].tiles.map(g => pair[1].correctIds.indexOf(g.id))));
  }
  expect(seen.size).toBe(30);
  for (const subject of [...ADVENTURE_CLUES, ...ODYSSEY_PLACES]) {
    const recent = CLUE_SUBJECTS.filter(s => s.id !== subject.id).map(s => `clue-${s.id}`);
    const round = createRounds('clue-duel', 'mario', 'professor', seededBotRandom(subject.id), DEFAULT_PAIR_OPTIONS, 1, undefined, recent)[0];
    expect(round.mode).toBe('clue-duel');
    if (round.mode !== 'clue-duel') throw new Error('Wrong mode');
    expect(round.answerId).toBe(subject.id);
    expect(round.choices).toHaveLength(8);
    expect(round.choices.every(choice => CLUE_SUBJECTS.find(s => s.id === choice.id)!.kind === subject.kind)).toBe(true);
  }
  const item = (name: string) => CATEGORY_ITEMS.find(i => i.name === name)!;
  expect(fitsCategory(item('Mario Kart Wii'), 'wii-game')).toBe(true);
  expect(fitsCategory(item('Mario Kart DS'), 'handheld-game')).toBe(true);
  expect(fitsCategory(item('Mario Party'), 'classic-game')).toBe(true);
  expect(fitsCategory(item('Mario Kart World'), 'switch-game')).toBe(false);
  expect(fitsCategory(item('Mario Kart 8'), 'wii-game')).toBe(false);
  for (let seed = 0; seed < 100; seed++) {
    const rounds = createRounds('match-hunt', 'mixed', 'professor', seededBotRandom(`matches-${seed}`));
    const names = rounds.flatMap(round => round.mode === 'match-hunt' ? round.pairs.map(p => matchNameKey(p.name)) : []);
    expect(new Set(names).size).toBe(16);
  }
});

test('personal bests use the player and the entire comparable history, not only Top 5', () => {
  const records = [{ player: 'Dad', elapsedMs: 1000 }, { player: 'Blaize', elapsedMs: 9000 }, { player: 'Blaize', elapsedMs: 8000 }];
  expect(personalTimeBest(records, ' blaize ')).toBe(8000);
  expect(personalBestMessage(7000, personalTimeBest(records, 'Blaize'))).toContain('1.0s faster');
  expect(personalBestMessage(8000, 8000)).toBe('');
  expect(personalBestMessage(9000, 8000)).toBe('');
  expect(personalBestMessage(3000, personalTimeBest(records, 'New player'))).toContain('First personal best');
});

test('eight-tile Order keeps years hidden, shows penalties and preserves old resumed rules', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.clock.install();
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Game Order', exact: false }).click();
  await page.locator('.setup-settings > summary').click();
  await page.getByLabel('Player name', { exact: true }).fill('A very long player name');
  await page.getByRole('button', { name: 'Hard', exact: true }).click();
  await page.getByRole('button', { name: '8', exact: true }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  // Model an actual pre-expansion saved round: metadata is absent in those saves.
  await page.evaluate(async () => {
    const path = '/MarioTriviaQuiz/src/mario/checkpoint.ts';
    const { readCheckpoint, saveCheckpoint } = await import(path);
    const saved = readCheckpoint();
    saved.session.rounds.forEach((round: { orderRuleset?: string }) => { delete round.orderRuleset; });
    saveCheckpoint(saved);
  });
  await page.reload();
  await page.getByRole('button', { name: 'Resume game', exact: true }).click();
  await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
  await page.clock.runFor(3000);
  const tiles = page.locator('.order-tiles button');
  await expect(tiles).toHaveCount(8);
  await expect(page.locator('.order-tiles')).not.toContainText(/19\d\d|20\d\d/);
  await expect(page.getByText('Original US releases', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Check order', exact: true }).click();
  await expect(page.getByText('Includes 1s checking penalty.', { exact: true })).toBeVisible();
  const current = await tiles.locator('span').allTextContents();
  const sorted = [...current].sort((a, b) => MARIO_TIMELINE.find(g => g.title === a)!.year - MARIO_TIMELINE.find(g => g.title === b)!.year);
  for (let i = 0; i < sorted.length; i++) {
    const other = current.indexOf(sorted[i]);
    if (i === other) continue;
    await tiles.nth(i).click(); await tiles.nth(other).click();
    [current[i], current[other]] = [current[other], current[i]];
  }
  await page.getByRole('button', { name: 'Check order', exact: true }).click();
  await expect(page.getByText('First personal best for this challenge!', { exact: true })).toBeVisible();
  await page.getByText('Original US releases', { exact: true }).click();
  await expect(page.locator('.order-sources a')).toHaveCount(8);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_order_times_v1')!)[0].ruleset)).toBe('order-v2');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('order-eight-phone.png'), fullPage: true });
});

test('older Championship bests survive new entries and blocked storage does not destroy them', async ({ page }) => {
  await page.goto('./');
  const result = await page.evaluate(async () => {
    const path = '/MarioTriviaQuiz/src/mario/storage.ts';
    const { saveChampionshipResult, getChampionshipResults, savePlayer } = await import(path);
    const key = 'mariotrivia_championships_v1';
    const base = { player: 'Dad', difficulty: 'explorer', topic: 'mixed', size: 'quick', games: [], completedAt: new Date().toISOString() };
    const original = Array.from({ length: 100 }, (_, i) => ({ ...base, id: `old-${i}`, points: i === 99 ? 99 : 1 }));
    localStorage.setItem(key, JSON.stringify(original));
    saveChampionshipResult({ ...base, id: 'new', points: 2 });
    const before = localStorage.getItem(key);
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
    try { saveChampionshipResult({ ...base, id: 'failed', points: 3 }); savePlayer('New name'); }
    finally { Storage.prototype.setItem = set; }
    return { records: getChampionshipResults(), preserved: localStorage.getItem(key) === before };
  });
  expect(result.records).toHaveLength(101);
  expect(result.records.find((r: { id: string }) => r.id === 'old-99')?.points).toBe(99);
  expect(result.preserved).toBe(true);
});
