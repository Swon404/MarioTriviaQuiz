import { expect, test, type Page } from '@playwright/test';
import type { GameRound } from '../src/mario/rounds.ts';
import { fitsCategory } from '../src/mario/categoryCatalog.ts';
import { trackLabel } from '../src/mario/trackChallenges.ts';
import { championshipRoundCount } from '../src/mario/championship.ts';

async function snapshot(page: Page): Promise<{ session: { rounds: GameRound[]; index: number }; mode: string }> {
  return page.evaluate(() => JSON.parse(JSON.parse(localStorage.getItem('mariotrivia_checkpoint_v1')!).payload));
}
async function solve(page: Page, round: GameRound) {
  if (round.mode === 'quiz') await page.locator('.answer-grid').getByText(round.question.answer, { exact: true }).click();
  if (round.mode === 'clue-duel') await page.locator('.answer-grid').getByText(round.choices.find(c => c.id === round.answerId)!.label, { exact: true }).click();
  if (round.mode === 'track-finder') {
    const title = round.tiles.find(t => round.correctIds.includes(t.id))!.title;
    await page.locator('.finder-grid').getByText(round.challengeKind === 'system' ? trackLabel(title) : title, { exact: true }).click();
  }
  if (round.mode === 'category-finder') await page.locator('.finder-grid').getByText(round.tiles.find(t => fitsCategory(t, round.targetCategory))!.name, { exact: true }).click();
  if (round.mode === 'match-hunt') for (const pair of round.pairs) {
    await page.locator('.match-column').first().getByRole('button', { name: pair.name, exact: true }).click();
    await page.locator('.match-column').last().getByRole('button', { name: pair.clue, exact: true }).click();
  }
  if (round.mode === 'pair-match' || round.mode === 'game-order') {
    await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
    await page.clock.runFor(3000);
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
}

for (const size of ['quick', 'standard', 'epic'] as const) test(`${size} Championship enters and leaves all seven games with reloads and carried totals`, async ({ page }) => {
  test.setTimeout(150_000); // Seven complete games, including timed boards and reloads.
  await page.clock.install();
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Championship', exact: false }).click();
  await page.locator('.setup-settings > summary').click();
  await page.getByRole('button', { name: size[0].toUpperCase() + size.slice(1), exact: true }).click();
  await page.getByRole('group', { name: 'Matching mode' }).getByRole('button', { name: /Time Trial/ }).click();
  await expect(page.locator('.champ-game-toggle.selected')).toHaveCount(7);
  await page.getByRole('button', { name: 'Start Solo Championship', exact: true }).click();
  let total = 0;
  const visited: string[] = [];
  for (let leg = 0; leg < 7; leg++) {
    const state = await snapshot(page);
    const mode = state.session.rounds[0].mode;
    visited.push(mode);
    expect(state.session.rounds).toHaveLength(championshipRoundCount(mode, size));
    for (let index = 0; index < state.session.rounds.length; index++) {
      await solve(page, state.session.rounds[index]);
      if (index === 0) {
        await page.reload();
        await page.getByRole('button', { name: 'Resume game', exact: true }).click();
        expect((await snapshot(page)).session.index).toBe(0);
      }
      await page.locator('.feedback-actions .start-btn').click();
    }
    const scores = page.getByRole('table', { name: 'Game results' }).locator('tbody td');
    await expect(scores).toHaveCount(2);
    const values = (await scores.allTextContents()).map(Number);
    const expected = mode === 'match-hunt' ? 4 : championshipRoundCount(mode, size);
    expect(values[0]).toBe(expected);
    total += expected;
    expect(values[1]).toBe(total);
    await page.getByRole('button', { name: leg === 6 ? 'See championship result' : /^Next:/ }).click();
  }
  await expect(page.getByText('CHAMPIONSHIP COMPLETE', { exact: true })).toBeVisible();
  const records = await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_championships_v1')!));
  expect(records).toHaveLength(1);
  expect(records[0].points).toBe(total);
  expect(records[0].games.map((game: { mode: string }) => game.mode)).toEqual(visited);
});
