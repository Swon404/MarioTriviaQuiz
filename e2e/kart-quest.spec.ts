import { expect, test, type Page } from '@playwright/test';
import { newKartRace, rollKart, beginKartChallenge, resolveKart, nextKartTurn, claimKartItem, safeKartMushroom, chooseKartRoute, type KartEffect, type KartRace } from '../src/mario/kartQuest.ts';
import { saveKartHistory, kartHistory, KART_HISTORY_KEY } from '../src/mario/kartHistory.ts';
import { createProgressBackup, importProgressBackup } from '../src/mario/progressBackup.ts';
import type { GameRound } from '../src/mario/rounds.ts';
import { fitsCategory } from '../src/mario/categoryCatalog.ts';
import { trackLabel } from '../src/mario/trackChallenges.ts';

const challenge = (effect: KartEffect): KartRace => ({ ...newKartRace(['Red', 'Blue'], () => 0), positions: [8, 7], phase: 'challenge', effect });

test('banana wins dodge, losses slip, draws stay; stars block once and resolutions are idempotent', () => {
  expect(resolveKart(challenge('banana'), [1, 0]).positions).toEqual([10, 7]);
  expect(resolveKart(challenge('banana'), [0, 1]).positions).toEqual([7, 9]);
  expect(resolveKart(challenge('banana'), [1, 1]).positions).toEqual([8, 7]);
  const shielded = resolveKart({ ...challenge('banana'), items: ['star', null] }, [0, 1]);
  expect(shielded.positions).toEqual([8, 9]);
  expect(shielded.items).toEqual([null, null]);
  expect(resolveKart(shielded, [0, 1])).toEqual(shielded);
});

test('shortcuts, item choice, risk choices and boosts obey advertised rules', () => {
  expect(resolveKart(challenge('pipe'), [1, 0]).positions).toEqual([12, 7]);
  expect(resolveKart(challenge('rival'), [0, 1]).positions).toEqual([8, 10]);
  const box = resolveKart(challenge('box'), [0, 1]);
  expect(box.rewardPlayer).toBe(1);
  const claimed = claimKartItem(box, 'mushroom');
  expect(claimed.items).toEqual([null, 'mushroom']);
  expect(claimKartItem(claimed, 'star')).toEqual(claimed);
  const next = nextKartTurn(claimed);
  const rolled = rollKart(next, true, () => 0);
  expect(rolled.positions[1]).toBe(12);
  expect(rolled.items[1]).toBeNull();
  expect(rollKart(rolled, true)).toEqual(rolled);
  expect(safeKartMushroom({ ...challenge('mushroom'), phase: 'landed', routeChosen: true }).positions).toEqual([9, 7]);
  expect(resolveKart(challenge('mushroom'), [1, 0]).positions).toEqual([11, 7]);
  expect(resolveKart(challenge('mushroom'), [0, 1]).positions).toEqual([8, 9]);
  expect(chooseKartRoute({ ...challenge('rival'), phase: 'landed' }, true).effect).toBe('road');
});

test('finish waits for equal rolls and cap; race records back up once without changing Championship', () => {
  const first = nextKartTurn({ ...challenge('road'), positions: [25, 20], phase: 'summary' });
  expect(first.phase).toBe('roll');
  const finished = nextKartTurn({ ...first, phase: 'summary', positions: [25, 26] });
  expect(finished.phase).toBe('finished');
  expect(nextKartTurn(finished)).toEqual(finished);
  expect(nextKartTurn({ ...challenge('road'), turn: 11, phase: 'summary' }).phase).toBe('finished');
  const map = new Map<string, string>();
  const storage = { get length() { return map.size; }, clear: () => map.clear(), key: (i: number) => [...map.keys()][i] ?? null, getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => { map.set(key, value); }, removeItem: (key: string) => { map.delete(key); } } satisfies Storage;
  expect(saveKartHistory(finished, storage)).toBe(true);
  saveKartHistory(finished, storage);
  expect(kartHistory(storage)).toHaveLength(1);
  const backup = createProgressBackup(storage);
  storage.clear(); importProgressBackup(backup, storage); importProgressBackup(backup, storage);
  expect(kartHistory(storage)).toHaveLength(1);
  expect(storage.getItem('mariotrivia_championships_v1')).toBeNull();
  storage.setItem(KART_HISTORY_KEY, 'broken');
  expect(saveKartHistory(finished, storage)).toBe(false);
  expect(storage.getItem(KART_HISTORY_KEY)).toBe('broken');
});

async function saved(page: Page) {
  return page.evaluate(() => JSON.parse(JSON.parse(localStorage.getItem('mariotrivia_checkpoint_v1')!).payload));
}
async function start(page: Page) {
  await page.clock.install();
  await page.setViewportSize({ width: 390, height: 740 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: /Kart Quest/ }).click();
  await page.getByLabel('Red kart name').fill('Red');
  await page.getByLabel('Blue kart name').fill('Blue');
  await page.getByRole('button', { name: 'Start Kart Quest', exact: true }).click();
}
async function roll(page: Page, die: number) {
  await page.evaluate(value => { (window as unknown as { originalRandom: typeof Math.random }).originalRandom = Math.random; Math.random = () => (value - 0.5) / 6; }, die);
  await page.getByRole('button', { name: '🎲 Roll die', exact: true }).click();
  await page.evaluate(() => { Math.random = (window as unknown as { originalRandom: typeof Math.random }).originalRandom; });
}

for (const [space, mode] of [[3, 'quiz'], [9, 'clue-duel'], [11, 'category-finder'], [15, 'track-finder']] as const) test(`Kart Quest ${mode} returns both players to the board with one score award`, async ({ page }) => {
  await start(page);
  await page.evaluate(target => {
    const envelope = JSON.parse(localStorage.getItem('mariotrivia_checkpoint_v1')!);
    const value = JSON.parse(envelope.payload);
    value.kart.positions[value.kart.starter] = target - 1;
    envelope.payload = JSON.stringify(value);
    let hash = 2166136261;
    for (let i = 0; i < envelope.payload.length; i++) hash = Math.imul(hash ^ envelope.payload.charCodeAt(i), 16777619);
    envelope.checksum = hash >>> 0;
    localStorage.setItem('mariotrivia_checkpoint_v1', JSON.stringify(envelope));
  }, space);
  await page.reload();
  await page.getByRole('button', { name: 'Resume game', exact: true }).click();
  await roll(page, 1);
  await page.getByRole('button', { name: 'Play challenge', exact: true }).click();
  const state = await saved(page);
  expect(state.mode).toBe(mode);
  expect(state.session.quizAttempts).toBe(1);
  for (const round of state.session.rounds) await solve(page, round);
  await page.getByRole('button', { name: 'Return to track', exact: true }).click();
  expect((await saved(page)).kart.phase).toBe('summary');
  const records = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_results_v1')!));
  expect(records).toHaveLength(1);
  expect(records[0].opponent).toBeTruthy();
});
async function solve(page: Page, round: GameRound) {
  if (round.mode === 'quiz') await page.locator('.answer-grid').getByText(round.question.answer, { exact: true }).click();
  if (round.mode === 'clue-duel') await page.locator('.answer-grid').getByText(round.choices.find(c => c.id === round.answerId)!.label, { exact: true }).click();
  if (round.mode === 'track-finder') {
    const title = round.tiles.find(t => round.correctIds.includes(t.id))!.title;
    await page.locator('.finder-grid').getByText(round.challengeKind === 'system' ? trackLabel(title) : title, { exact: true }).click();
  }
  if (round.mode === 'category-finder') await page.locator('.finder-grid').getByText(round.tiles.find(t => fitsCategory(t, round.targetCategory))!.name, { exact: true }).click();
  if (round.mode === 'pair-match' || round.mode === 'game-order') {
    await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
    await page.clock.runFor(5000);
    if (round.mode === 'pair-match') for (const pair of round.pairs.slice(0, round.goal)) {
      await page.locator(`.pair-card[data-pair-id="${pair.id}"][data-kind="icon"]`).click();
      await page.locator(`.pair-card[data-pair-id="${pair.id}"][data-kind="word"]`).click();
    }
    else {
      const ids = round.tiles.map(t => t.id);
      for (let i = 0; i < ids.length; i++) {
        const other = ids.indexOf(round.correctIds[i]);
        if (i === other) continue;
        await page.locator('.order-tiles button').nth(i).click();
        await page.locator('.order-tiles button').nth(other).click();
        [ids[i], ids[other]] = [ids[other], ids[i]];
      }
      await page.getByRole('button', { name: 'Check order', exact: true }).click();
    }
  }
  await page.locator('.feedback-actions .start-btn').click();
}

test('phone race preserves a roll and both timed turns through reload, then awards banana movement once', async ({ page }) => {
  await start(page);
  await roll(page, 4);
  const landed = await saved(page);
  expect(landed.kart.effect).toBe('banana');
  await page.reload();
  await page.getByRole('button', { name: 'Resume game', exact: true }).click();
  expect((await saved(page)).kart).toEqual(landed.kart);
  await expect(page.getByRole('button', { name: '🎲 Roll die', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Play challenge', exact: true }).click();
  const state = await saved(page);
  expect(state.session.rounds).toHaveLength(2);
  await solve(page, state.session.rounds[0]);
  await page.reload();
  await page.getByRole('button', { name: 'Resume game', exact: true }).click();
  expect((await saved(page)).session.index).toBe(1);
  await solve(page, state.session.rounds[1]);
  await page.getByRole('button', { name: 'Return to track', exact: true }).click();
  const resolved = await saved(page);
  expect(resolved.kart.phase).toBe('summary');
  expect(resolved.kart.log).toHaveLength(1);
  await page.reload();
  await page.getByRole('button', { name: 'Resume game', exact: true }).click();
  expect((await saved(page)).kart).toEqual(resolved.kart);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/kart-quest-phone.png', fullPage: true });
});

test('a whole race finishes with equal rolls, saves once and rematches with the same names', async ({ page }) => {
  test.setTimeout(240000); // Up to twelve two-player challenges on WebKit; action limits stay tight.
  await start(page);
  for (let i = 0; i < 12; i++) {
    if ((await saved(page)).kart.phase === 'finished') break;
    await roll(page, 6);
    if (await page.getByRole('button', { name: 'Open road: winner +2', exact: true }).count()) await page.getByRole('button', { name: 'Open road: winner +2', exact: true }).click();
    await page.getByRole('button', { name: /^(Play challenge|Race for \+3)$/ }).click();
    const state = await saved(page);
    for (const round of state.session.rounds) await solve(page, round);
    await page.getByRole('button', { name: 'Return to track', exact: true }).click();
    if (await page.getByRole('button', { name: '🍄 Mushroom: next roll +2', exact: true }).count()) await page.getByRole('button', { name: '🍄 Mushroom: next roll +2', exact: true }).click();
    await page.getByRole('button', { name: /^(Next roll|See race result)$/ }).click();
  }
  const result = (await saved(page)).kart;
  expect(result.phase).toBe('finished');
  expect(result.turn % 2).toBe(0);
  expect(result.turn).toBeLessThanOrEqual(12);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_kart_races_v1') ?? '[]').length)).toBe(1);
  await page.reload();
  await page.getByRole('button', { name: 'Resume game', exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_kart_races_v1')!).length)).toBe(1);
  await page.getByRole('button', { name: 'Race again', exact: true }).click();
  const fresh = (await saved(page)).kart;
  expect(fresh.players).toEqual(['Red', 'Blue']);
  expect(fresh.positions).toEqual([0, 0]);
  expect(fresh.id).not.toBe(result.id);
});
