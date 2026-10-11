import { expect, test, type Locator, type Page } from '@playwright/test';
import { MARIO_TIMELINE } from '../src/mario/rounds.ts';
import { validReplay } from '../src/mario/replay.ts';

async function snapshot(board: Locator) {
  return board.locator('button').evaluateAll(nodes => nodes.map(node => {
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    const image = node.querySelector('img');
    return {
      text: node.textContent, selected: node.getAttribute('aria-pressed'),
      background: style.backgroundColor, border: style.borderColor, font: style.fontSize,
      width: Math.round(rect.width), height: Math.round(rect.height),
      image: image?.getAttribute('src') ?? null,
      imageWidth: image ? Math.round(image.getBoundingClientRect().width) : null,
      imageHeight: image ? Math.round(image.getBoundingClientRect().height) : null,
    };
  }));
}

async function open(page: Page, game: string) {
  await page.clock.install({ time: new Date('2026-10-11T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-11T12:00:01Z'));
  await page.goto('./');
  await page.addStyleTag({ content: '* { transition: none !important; animation: none !important; }' });
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: game, exact: false }).click();
}

async function playTo(page: Page, frames: { atMs: number }[], index: number) {
  await page.getByRole('dialog').getByRole('button', { name: 'Start replay' }).click();
  for (let i = 1; i <= index; i++) await page.clock.runFor(Math.max(80, frames[i].atMs - frames[i - 1].atMs));
  await page.getByRole('dialog').getByRole('button', { name: 'Stop replay' }).click();
}

test('Order replay uses the live board, including selected feedback, years and colours', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 'Game Order');
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
  await page.clock.runFor(3000);
  const board = page.locator('[data-board="order"]');
  const initial = await snapshot(board);
  await page.clock.runFor(200);
  await page.getByRole('button', { name: 'Check order' }).click();
  await page.clock.runFor(200);
  await board.locator('button').first().click();
  const selected = await snapshot(board);
  await page.clock.runFor(200);
  await board.locator('button').first().click();
  const current = await board.locator('button > span').allTextContents();
  const sorted = [...current].sort((a, b) => MARIO_TIMELINE.find(game => game.title === a)!.year - MARIO_TIMELINE.find(game => game.title === b)!.year);
  for (let i = 0; i < sorted.length; i++) {
    const other = current.indexOf(sorted[i]);
    if (i === other) continue;
    await page.clock.runFor(200); await board.locator('button').nth(i).click();
    await page.clock.runFor(200); await board.locator('button').nth(other).click();
    [current[i], current[other]] = [current[other], current[i]];
  }
  await page.clock.runFor(200);
  await page.getByRole('button', { name: 'Check order' }).click();
  const solved = await snapshot(board);
  const records = await page.evaluate(() => localStorage.getItem('mariotrivia_order_times_v1')!);
  const frames = JSON.parse(records)[0].replay.frames;
  await page.locator('.board-replay > button').click();
  const replay = page.getByRole('dialog');
  expect(await snapshot(replay.locator('[data-board="order"]'))).toEqual(initial);
  await playTo(page, frames, frames.findIndex((frame: { event: string }) => frame.event === 'Tile selected'));
  expect(await snapshot(replay.locator('[data-board="order"]'))).toEqual(selected);
  await replay.getByRole('button', { name: 'Start replay' }).click();
  for (let i = 1; i < frames.length; i++) await page.clock.runFor(Math.max(80, frames[i].atMs - frames[i - 1].atMs));
  expect(await snapshot(replay.locator('[data-board="order"]'))).toEqual(solved);
  await expect(replay.locator('.order-correct').first()).toHaveCSS('background-color', 'rgb(40, 87, 73)');
  await page.screenshot({ path: 'test-results/shared-order-replay.png' });
  await replay.getByRole('button', { name: 'Back', exact: false }).click();
  await page.clock.runFor(10000);
  expect(await snapshot(board)).toEqual(solved);
  expect(await page.evaluate(() => localStorage.getItem('mariotrivia_order_times_v1'))).toBe(records);
});

test('Hunt replay retains live card sizes, pictures, matched colours and target unlock state', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 'Match & Hunt');
  await page.locator('.setup-settings > summary').click();
  await page.getByRole('group', { name: 'Hunt timer' }).getByRole('button', { name: 'On' }).click();
  await page.getByRole('group', { name: 'Hunt target mode' }).getByRole('button', { name: 'Choose' }).click();
  await page.getByLabel('Target name').selectOption('mario-Nintendo DS');
  await page.getByRole('group', { name: 'Target unlock' }).getByRole('button', { name: '1', exact: true }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
  await page.clock.runFor(3000);
  const board = page.locator('[data-board="pairs"]');
  const initial = await snapshot(board);
  const ids = await board.locator('[data-kind="word"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-pair-id')!).filter(id => id !== 'mario-Nintendo DS'));
  await page.clock.runFor(200);
  await board.locator(`[data-pair-id="${ids[0]}"][data-kind="icon"]`).click();
  const flipped = await snapshot(board);
  await page.clock.runFor(200);
  await board.locator(`[data-pair-id="${ids[0]}"][data-kind="word"]`).click();
  await expect(page.locator('.hunt-target-banner')).toContainText('Unlocked!');
  await page.clock.runFor(200);
  await board.locator('[data-pair-id="mario-Nintendo DS"][data-kind="icon"]').click();
  await page.clock.runFor(200);
  await board.locator('[data-pair-id="mario-Nintendo DS"][data-kind="word"]').click();
  const completed = await snapshot(board);
  const records = await page.evaluate(() => localStorage.getItem('mariotrivia_pair_times_v1')!);
  const saved = JSON.parse(records)[0].replay;
  expect(saved.targetUnlockPairs).toBe(1);
  expect(saved.frames[0].tiles.every((tile: { kind?: string }) => !!tile.kind)).toBe(true);
  await page.locator('.board-replay > button').click();
  const replay = page.getByRole('dialog');
  expect(await snapshot(replay.locator('[data-board="pairs"]'))).toEqual(initial);
  await expect(replay.locator('.hunt-target-banner')).toContainText('Unlocks after 1');
  await playTo(page, saved.frames, 1);
  expect(await snapshot(replay.locator('[data-board="pairs"]'))).toEqual(flipped);
  await replay.getByRole('button', { name: 'Start replay' }).click();
  for (let i = 1; i < saved.frames.length; i++) await page.clock.runFor(Math.max(80, saved.frames[i].atMs - saved.frames[i - 1].atMs));
  await expect(replay.locator('.hunt-target-banner')).toContainText('Nintendo DS');
  await expect(replay.locator('.hunt-target-banner')).toContainText('Unlocked!');
  expect(await snapshot(replay.locator('[data-board="pairs"]'))).toEqual(completed);
  await expect(replay.locator('.hunt-target-banner strong')).toHaveCSS('float', 'none');
  const back = await replay.getByRole('button', { name: 'Back', exact: false }).boundingBox();
  expect(back!.y).toBeGreaterThanOrEqual(0);
  expect(back!.y + back!.height).toBeLessThan(844);
  await page.screenshot({ path: 'test-results/shared-hunt-replay.png' });
  await replay.getByRole('button', { name: 'Back', exact: false }).click();
  expect(await snapshot(board)).toEqual(completed);
  expect(await page.evaluate(() => localStorage.getItem('mariotrivia_pair_times_v1'))).toBe(records);
});

test('replay validation accepts legacy tiles and rejects invalid new presentation fields', () => {
  const tile = { id: 'a', label: 'A', state: 'shown' };
  const replay = { version: 1, kind: 'order', title: 'Legacy', frames: [{ atMs: 0, event: 'Start', tiles: [tile] }] };
  expect(validReplay(replay)).toBe(true);
  for (const bad of [{ year: '2007' }, { feedback: 'anything' }, { kind: 'script' }, { iconKind: 'html' }]) {
    expect(validReplay({ ...replay, frames: [{ ...replay.frames[0], tiles: [{ ...tile, ...bad }] }] })).toBe(false);
  }
  expect(validReplay({ ...replay, targetUnlockPairs: -1 })).toBe(false);
});
