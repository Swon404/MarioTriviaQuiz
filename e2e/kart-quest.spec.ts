import { expect, test, type Page } from '@playwright/test';
import { newKartRace, rollKart, beginKartChallenge, resolveKart, nextKartTurn, claimKartItem, safeKartMushroom, chooseKartRoute, type KartEffect, type KartRace } from '../src/mario/kartQuest.ts';
import { saveKartHistory, kartHistory, KART_HISTORY_KEY } from '../src/mario/kartHistory.ts';
import { createProgressBackup, importProgressBackup } from '../src/mario/progressBackup.ts';
import type { GameRound } from '../src/mario/rounds.ts';
import { fitsCategory } from '../src/mario/categoryCatalog.ts';
import { trackLabel } from '../src/mario/trackChallenges.ts';
import { kartPoint, kartMotion } from '../src/mario/kartMotion.ts';

test('kart movement follows every hairpin in both directions and stops at the finish', () => {
  for (const edge of [4, 8, 12, 16, 20]) {
    const bend = kartPoint(edge + .5);
    expect(bend.x).toBe(edge % 8 === 4 ? 375 : 25);
    expect(bend.y).toBe(edge / 4 * 100);
    expect(kartMotion(edge, edge + 1).map(p => [p.left, p.top])).toEqual(kartMotion(edge + 1, edge).reverse().map(p => [p.left, p.top]));
  }
  expect(kartPoint(30)).toEqual(kartPoint(24));
  expect(kartPoint(-1)).toEqual(kartPoint(0));
});

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
async function roll(page: Page, die: number, settle = true) {
  await page.evaluate(value => { (window as unknown as { originalRandom: typeof Math.random }).originalRandom = Math.random; Math.random = () => (value - 0.5) / 6; }, die);
  await page.getByRole('button', { name: '🎲 Roll die', exact: true }).click();
  await page.evaluate(() => { Math.random = (window as unknown as { originalRandom: typeof Math.random }).originalRandom; });
  if (settle) await page.clock.runFor(1650);
}

test('dice tumbles once, locks repeat rolls, and settles on the saved result', async ({ page }) => {
  await start(page);
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  await roll(page, 4, false);
  const committed = (await saved(page)).kart;
  expect(committed.die).toBe(4);
  await expect(page.getByRole('button', { name: /Roll die/ })).toBeDisabled();
  await expect(page.locator('.kart-die-rolling')).toBeVisible();
  await expect(page.getByLabel('Dice result: 4')).toHaveCount(0);
  await page.clock.runFor(100);
  await expect(page.locator('.kart-die-rolling .die-pip')).toHaveCount(2);
  await page.getByRole('button', { name: /Roll die/ }).dispatchEvent('click');
  expect((await saved(page)).kart).toEqual(committed);
  await page.clock.runFor(800);
  await expect(page.locator('.kart-die-rolling')).toBeVisible();
  await expect(page.getByRole('button', { name: /Roll die/ })).toBeDisabled();
  await expect(page.getByLabel('Dice result: 4')).toHaveCount(0);
  await page.clock.runFor(750);
  await expect(page.getByLabel('Dice result: 4')).toBeVisible();
  await expect(page.locator('.kart-roll-result .die-pip')).toHaveCount(4);
  await expect(page.locator('.kart-die-rolling')).toHaveCount(0);
  expect((await saved(page)).kart).toEqual(committed);
});

test('reload during dice animation keeps the committed roll', async ({ page }) => {
  await start(page);
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  await roll(page, 6, false);
  const committed = (await saved(page)).kart;
  await page.reload();
  await page.getByRole('button', { name: 'Resume game', exact: true }).click();
  await expect(page.getByLabel('Dice result: 6')).toBeVisible();
  expect((await saved(page)).kart).toEqual(committed);
  await expect(page.getByRole('button', { name: /Roll die/ })).toHaveCount(0);
});

test('reduced motion reveals the actual die immediately without a tumble', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await start(page);
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  await roll(page, 3, false);
  await expect(page.getByLabel('Dice result: 3')).toBeVisible();
  await expect(page.locator('.kart-die-rolling')).toHaveCount(0);
  await expect(page.locator('.kart-roll-result .die-pip')).toHaveCount(3);
  expect(await page.locator('.kart-road-racer').evaluateAll(elements => elements.flatMap(el => el.getAnimations({ subtree: true })).length)).toBe(0);
});

test('player cards locate distinct readable pieces when both share a space on a narrow phone', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await start(page);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.evaluate(() => {
    const envelope = JSON.parse(localStorage.getItem('mariotrivia_checkpoint_v1')!);
    const value = JSON.parse(envelope.payload);
    value.kart.positions = [8, 8];
    envelope.payload = JSON.stringify(value);
    let hash = 2166136261;
    for (let i = 0; i < envelope.payload.length; i++) hash = Math.imul(hash ^ envelope.payload.charCodeAt(i), 16777619);
    envelope.checksum = hash >>> 0;
    localStorage.setItem('mariotrivia_checkpoint_v1', JSON.stringify(envelope));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Resume game', exact: true }).click();
  const state = (await saved(page)).kart;
  const course = (await page.locator('.kart-course').boundingBox())!;
  for (const [i, name] of ['Red', 'Blue'].entries()) {
    await page.getByRole('button', { name: `Find ${name}'s kart`, exact: true }).click();
    const marker = page.locator(`#kart-player-${i}`);
    await expect(marker).toBeFocused();
    await expect(marker).toBeInViewport();
    await expect(marker).toHaveAttribute('aria-label', `${name} on space 8`);
    await expect(marker.locator('.kart-racer-name')).toHaveText(`${name}8`);
    const box = await marker.locator('.kart-racer-name').boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(course.x);
    expect(box!.x + box!.width).toBeLessThanOrEqual(course.x + course.width);
    const number = (await marker.locator('.kart-player-number').boundingBox())!;
    expect(number.x).toBeGreaterThanOrEqual(course.x);
  }
  const red = (await page.locator('#kart-player-0').boundingBox())!;
  const blue = (await page.locator('#kart-player-1').boundingBox())!;
  expect(red.x + red.width).toBeLessThan(blue.x);
  expect((await saved(page)).kart).toEqual(state);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
});

test('kart drives after the dice, takes the bend, and reload keeps its destination', async ({ page }) => {
  await start(page);
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  await roll(page, 6, false);
  const committed = (await saved(page)).kart;
  expect(await page.locator('.kart-road-racer').evaluateAll(elements => elements.flatMap(el => el.getAnimations()).length)).toBe(0);
  await page.clock.runFor(1650);
  const racer = page.locator(`.kart-road-racer-${committed.starter}`);
  await expect(racer).toBeInViewport();
  const timing = await racer.evaluate(el => el.getAnimations()[0].effect!.getTiming());
  expect(timing.duration).toBe(3300);
  expect(timing.delay).toBe(350);
  const frames = await racer.evaluate(el => {
    const animation = el.getAnimations()[0];
    animation.pause();
    animation.currentTime = 2000;
    return (animation.effect as KeyframeEffect).getKeyframes();
  });
  expect(Number.parseFloat(String(frames[0].top))).toBeCloseTo(20 / 6, 3);
  expect(frames.some(frame => Number.parseFloat(String(frame.left)) > 93)).toBe(true);
  expect(frames.at(-1)?.left).toBe('62.5%');
  expect(frames.at(-1)?.top).toBe('25%');
  await racer.evaluate(el => el.getAnimations({ subtree: true }).forEach(animation => animation.finish()));
  expect(await racer.evaluate(el => Number.parseFloat(getComputedStyle(el).left) / el.parentElement!.getBoundingClientRect().width)).toBeCloseTo(.625, 3);
  await page.reload();
  await page.getByRole('button', { name: 'Resume game', exact: true }).click();
  expect((await saved(page)).kart).toEqual(committed);
  expect(await page.locator('.kart-road-racer').evaluateAll(elements => elements.flatMap(el => el.getAnimations()).length)).toBe(0);
});

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
  await page.evaluate(() => {
    const original = Element.prototype.animate;
    const moved = new Set<Element>();
    (window as unknown as { kartAnimatedPlayers: () => number }).kartAnimatedPlayers = () => { Element.prototype.animate = original; return moved.size; };
    Element.prototype.animate = function (...args) {
      if (this.matches('.kart-road-racer')) moved.add(this);
      return original.apply(this, args);
    };
  });
  await page.getByRole('button', { name: 'Return to track', exact: true }).click();
  expect((await saved(page)).kart.phase).toBe('summary');
  // Returning to the board animates awarded moves; banana/pipe draws stay put.
  const positions = (await saved(page)).kart.positions as number[];
  const moved = positions.filter((position, i) => position !== state.kart.positions[i]).length;
  expect(await page.evaluate(() => (window as unknown as { kartAnimatedPlayers: () => number }).kartAnimatedPlayers())).toBe(moved);
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

test('compact track results preview real moves, map reversed players and handle shields, draws and items', async ({ page }) => {
  await start(page);
  const base = await saved(page);
  const cases = [
    { effect: 'road', red: 1, blue: 0, shield: false, moves: ['+2 spaces', 'Stays put'], positions: [10, 5] },
    { effect: 'banana', red: 1, blue: 0, shield: false, moves: ['+2 spaces', '−1 space'], positions: [10, 4] },
    { effect: 'banana', red: 1, blue: 0, shield: true, moves: ['+2 spaces', 'Stays put'], positions: [10, 5] },
    { effect: 'banana', red: 1, blue: 1, shield: false, moves: ['Stays put', 'Stays put'], positions: [8, 5] },
    { effect: 'box', red: 0, blue: 1, shield: false, moves: ['Stays put', '+2 spaces'], positions: [8, 7] },
    { effect: 'pipe', red: 0, blue: 1, shield: false, moves: ['Stays put', '+4 spaces'], positions: [8, 9] },
  ];
  for (const fixture of cases) {
    await page.evaluate(({ base, fixture }) => {
      const value = { ...base, screen: 'result', mode: 'game-order', kart: { ...base.kart, phase: 'challenge', starter: 1, turn: 0, effect: fixture.effect, positions: [8, 5], space: 5, routeChosen: true, items: [null, fixture.shield ? 'star' : null] },
        latestResult: { id: 'track-result-preview', mode: 'game-order', player: 'Blue', opponent: 'Red', points: fixture.blue, opponentPoints: fixture.red, correct: 1, opponentCorrect: 1, total: 1, elapsedMs: fixture.blue > fixture.red ? 12300 : 14200, opponentElapsedMs: fixture.red > fixture.blue ? 12300 : 14200, difficulty: 'explorer', topic: 'mixed', completedAt: new Date().toISOString() } };
      const envelope = JSON.parse(localStorage.getItem('mariotrivia_checkpoint_v1')!);
      envelope.payload = JSON.stringify(value);
      let hash = 2166136261;
      for (let i = 0; i < envelope.payload.length; i++) hash = Math.imul(hash ^ envelope.payload.charCodeAt(i), 16777619);
      envelope.checksum = hash >>> 0;
      localStorage.setItem('mariotrivia_checkpoint_v1', JSON.stringify(envelope));
    }, { base, fixture });
    await page.reload();
    await page.getByRole('button', { name: 'Resume game', exact: true }).click();
    await expect(page.getByRole('heading', { name: fixture.red === fixture.blue ? "It's a draw!" : `${fixture.red > fixture.blue ? 'Red' : 'Blue'} wins!`, exact: true })).toBeVisible();
    await expect(page.locator('.kart-result-move')).toHaveText(fixture.moves);
    await expect(page.getByLabel("Red's time", { exact: true })).toHaveText(fixture.red > fixture.blue ? '12.3s' : '14.2s');
    await expect(page.getByLabel("Blue's time", { exact: true })).toHaveText(fixture.blue > fixture.red ? '12.3s' : '14.2s');
    await expect(page.getByRole('table', { name: 'Game results' })).toHaveCount(0);
    await expect(page.getByText('How points work', { exact: true })).toHaveCount(0);
    if (fixture.shield) await expect(page.locator('.kart-result-extra')).toContainText('Star blocked the banana');
    if (fixture.effect === 'box') await expect(page.locator('.kart-result-extra')).toContainText('Blue, choose a power-up');
    expect((await saved(page)).kart.positions).toEqual([8, 5]);
    await page.getByRole('button', { name: 'Return to track', exact: true }).click();
    expect((await saved(page)).kart.positions).toEqual(fixture.positions);
  }
});

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
  const result = (await saved(page)).latestResult;
  expect(result.opponentElapsedMs).toBeGreaterThan(0);
  await expect(page.getByLabel(`${result.player}'s time`, { exact: true })).toHaveText(`${(result.elapsedMs / 1000).toFixed(1)}s`);
  await expect(page.getByLabel(`${result.opponent}'s time`, { exact: true })).toHaveText(`${(result.opponentElapsedMs / 1000).toFixed(1)}s`);
  const summary = await page.getByRole('region', { name: 'Track challenge result' }).innerText();
  await page.reload();
  await page.getByRole('button', { name: 'Resume game', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Track challenge result' })).toHaveText(summary, { useInnerText: true });
  expect((await saved(page)).kart.positions).toEqual(landed.kart.positions);
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
