import { expect, test } from '@playwright/test';

for (const format of ['Solo', 'Two Players', 'Play Mushbot']) {
  test(`${format} accidental exit can be cancelled without losing the question`, async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Play Games' }).click();
    await page.getByRole('button', { name: 'Quiz Battle' }).click();
    if (format !== 'Solo') await page.getByRole('button', { name: format, exact: true }).click();
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    const heading = await page.locator('.quiz-playing h1').textContent();
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.dismiss();
    });
    await page.getByRole('button', { name: '← Games', exact: true }).click();
    await expect(page.locator('.quiz-playing h1')).toHaveText(heading!);
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: '← Games', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Choose a game' })).toBeVisible();
    await expect(page.locator('.quiz-playing')).toHaveCount(0);
  });
}
