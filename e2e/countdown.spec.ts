import { expect, test } from '@playwright/test';

for (const game of ['Game Order', 'Match & Hunt']) {
  test(`${game}: countdown hides the board, can cancel, and excludes preparation from time`, async ({ page }) => {
    await page.clock.install({ time: new Date('2026-10-06T12:00:00Z') });
    await page.goto('./');
    await page.getByRole('button', { name: 'Play Games' }).click();
    await page.getByRole('button', { name: game, exact: false }).click();
    if (game === 'Match & Hunt') await page.getByRole('group', { name: 'Hunt timer' }).getByRole('button', { name: 'On' }).click();
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    await page.clock.pauseAt(new Date('2026-10-06T12:01:00Z'));
    const board = page.locator('.order-tiles button, .pair-card');
    const number = page.locator('.timer-countdown strong');
    await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
    await expect(number).toHaveText('3');
    await expect(board).toHaveCount(0);
    await page.clock.runFor(1000);
    await expect(number).toHaveText('2');
    await page.getByRole('button', { name: 'Cancel countdown' }).click();
    await page.clock.runFor(5000);
    await expect(board).toHaveCount(0);
    await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
    await page.clock.runFor(1000);
    await expect(number).toHaveText('2');
    await page.clock.runFor(1000);
    await expect(number).toHaveText('1');
    await expect(board).toHaveCount(0);
    await page.clock.runFor(1000);
    await expect(number).toHaveText('Go!');
    await expect(board.first()).toBeVisible();
    const timer = page.getByLabel(game === 'Game Order' ? 'Puzzle time' : 'Elapsed time', { exact: true });
    await expect(timer).toContainText('0.0');
    await page.clock.runFor(1000);
    await expect(timer).toContainText('1.0');
    await expect(number).toHaveCount(0);
  });

  test(`${game}: reload during preparation resumes at Start Timer`, async ({ page }) => {
    await page.clock.install();
    await page.goto('./');
    await page.getByRole('button', { name: 'Play Games' }).click();
    await page.getByRole('button', { name: game, exact: false }).click();
    if (game === 'Match & Hunt') await page.getByRole('group', { name: 'Hunt timer' }).getByRole('button', { name: 'On' }).click();
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    await page.clock.pauseAt(new Date(Date.now() + 60000));
    await page.getByRole('button', { name: 'Start Timer', exact: true }).click();
    await page.clock.runFor(1000);
    await page.reload();
    await page.getByRole('button', { name: 'Resume game', exact: true }).click();
    await page.clock.runFor(5000);
    await expect(page.getByRole('button', { name: 'Start Timer', exact: true })).toBeVisible();
    await expect(page.locator('.order-tiles button, .pair-card')).toHaveCount(0);
  });
}
