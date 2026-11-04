import { expect, test } from '@playwright/test';
import { randomChampionshipModes } from '../src/mario/championship.ts';
import { availableModes } from '../src/mario/rounds.ts';

test('random selection picks three distinct available games in every topic', () => {
  for (const topic of ['mario', 'kart', 'mixed'] as const) {
    for (const value of [0, 0.3, 0.7, 0.999]) {
      const modes = randomChampionshipModes(topic, () => value);
      expect(modes).toHaveLength(3);
      expect(new Set(modes).size).toBe(3);
      expect(modes.every(mode => availableModes(topic).includes(mode))).toBe(true);
    }
  }
});

test('phone setup remembers Super Quick and a random selection', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 });
  const open = async () => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Play Games' }).click();
    await page.getByRole('button', { name: 'Championship', exact: false }).click();
    await page.locator('.setup-settings > summary').click();
  };
  await open();
  await page.getByRole('button', { name: 'Super Quick', exact: true }).click();
  await page.getByRole('button', { name: 'Random games', exact: true }).click();
  const selected = page.locator('.champ-game-toggle.selected');
  await expect(selected).toHaveCount(3);
  for (const chip of await selected.all()) await expect(chip).toContainText('1 round');
  await expect(page.getByRole('button', { name: 'Start Solo Championship', exact: true })).toBeEnabled();
  const games = await selected.allTextContents();
  await open();
  await expect(page.getByRole('button', { name: 'Super Quick', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(selected).toHaveText(games);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
