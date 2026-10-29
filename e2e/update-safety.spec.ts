import { expect, test } from '@playwright/test';

test('updates wait until outside active play and zoom remains available', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.app-maintenance')).toContainText('Build');
  expect(await page.locator('meta[name="viewport"]').getAttribute('content')).not.toMatch(/user-scalable=no|maximum-scale=1/);
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Quiz Battle', exact: false }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  await page.evaluate(async () => {
    const module = await import('/MarioTriviaQuiz/src/pwa.ts');
    module.pwaLifecycle.onNeedRefresh();
  });
  await expect(page.getByRole('button', { name: 'Update now' })).toHaveCount(0);
  await expect(page.locator('.quiz-playing h1')).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '← Games', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Update now' })).toBeVisible();
  await page.getByRole('button', { name: 'Later' }).click();
  await expect(page.getByRole('button', { name: 'Update now' })).toHaveCount(0);
});
