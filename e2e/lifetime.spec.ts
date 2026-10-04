import { expect, test } from '@playwright/test';

const RESULTS = 'mariotrivia_results_v1';
const LIFETIME = 'mariotrivia_lifetime_v1';
const PROFILE = 'mariotrivia_profile_v1';
const sample = { id: 'original', player: 'Ada', topic: 'mixed', difficulty: 'explorer', correct: 1, total: 1, points: 100, bestStreak: 7, elapsedMs: 1000, completedAt: '2026-10-04T10:00:00Z' };

test('Lifetime migrates old results and preserves EP, streak and milestones beyond 200 games', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(({ sample, RESULTS, PROFILE }) => {
    localStorage.setItem(PROFILE, 'Ada');
    localStorage.setItem(RESULTS, JSON.stringify(Array.from({ length: 200 }, (_, index) => index === 0 ? sample : { ...sample, id: `old-${index}`, points: 1, correct: 0, bestStreak: 0 }).reverse()));
  }, { sample, RESULTS, PROFILE });
  await page.reload();
  await expect(page.getByText('299 EP', { exact: true })).toBeVisible();
  const state = await page.evaluate(async ({ sample, RESULTS, LIFETIME }) => {
    const path = '/MarioTriviaQuiz/src/mario/storage.ts';
    const { saveResult } = await import(path);
    saveResult({ ...sample, id: 'new', points: 1, bestStreak: 0, correct: 0 });
    saveResult({ ...sample, points: 99999 }); // old ID has already been awarded
    saveResult({ ...sample, id: 'new', points: 99999 });
    return { recent: JSON.parse(localStorage.getItem(RESULTS)!), lifetime: JSON.parse(localStorage.getItem(LIFETIME)!) };
  }, { sample, RESULTS, LIFETIME });
  expect(state.recent).toHaveLength(200);
  expect(state.recent.some((result: { id: string }) => result.id === 'original')).toBe(false);
  expect(state.lifetime).toHaveLength(201);
  expect(state.lifetime[0]).not.toHaveProperty('elapsedMs');
  await page.reload();
  await expect(page.getByText('300 EP', { exact: true })).toBeVisible();
  await expect(page.getByText('Star Player', { exact: true })).toBeVisible();
  await expect(page.getByText('🔥 Best streak: 7', { exact: true })).toBeVisible();
  await expect(page.getByText('🏆 201 games', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /milestones/ }).click();
  await expect(page.locator('.milestone-done').filter({ hasText: 'Perfect Game' })).toHaveCount(1);
});

test('Shared results preserve both players awards and Player 2 perfect-game milestone', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(async ({ sample, PROFILE }) => {
    const path = '/MarioTriviaQuiz/src/mario/storage.ts';
    const { saveResult } = await import(path);
    const result = { ...sample, points: 5, correct: 1, total: 2, bestStreak: 1, opponent: 'Ben', opponentPoints: 20, opponentCorrect: 2, opponentBestStreak: 2, format: 'two-player' };
    saveResult(result);
    saveResult(result);
    localStorage.setItem(PROFILE, 'Ben');
  }, { sample, PROFILE });
  await page.reload();
  await expect(page.getByText('20 EP', { exact: true })).toBeVisible();
  await expect(page.getByText('🏆 1 games', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /milestones/ }).click();
  await expect(page.locator('.milestone-done').filter({ hasText: 'Perfect Game' })).toHaveCount(1);
  await page.evaluate(key => localStorage.setItem(key, 'Ada'), PROFILE);
  await page.reload();
  await expect(page.getByText('5 EP', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /milestones/ }).click();
  await expect(page.locator('.milestone-locked').filter({ hasText: 'Perfect Game' })).toHaveCount(1);
});

test('Damaged lifetime records are preserved, with recoverable results and a warning', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(({ sample, RESULTS, LIFETIME, PROFILE }) => {
    localStorage.setItem(PROFILE, 'Ada');
    localStorage.setItem(RESULTS, JSON.stringify([sample]));
    localStorage.setItem(LIFETIME, '{damaged');
  }, { sample, RESULTS, LIFETIME, PROFILE });
  await page.reload();
  await expect(page.getByText('100 EP', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('could not be saved');
  expect(await page.evaluate(key => localStorage.getItem(key), LIFETIME)).toBe('{damaged');
  await page.evaluate(async sample => {
    const path = '/MarioTriviaQuiz/src/mario/storage.ts';
    const { saveResult } = await import(path);
    saveResult({ ...sample, id: 'another', points: 10 });
  }, sample);
  await page.reload();
  await expect(page.getByText('110 EP', { exact: true })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), LIFETIME)).toBe('{damaged');
});

test('Full storage retains awards in the tab and retries persistence when storage recovers', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(key => localStorage.setItem(key, 'Ada'), PROFILE);
  await page.reload();
  await page.evaluate(async sample => {
    const path = '/MarioTriviaQuiz/src/mario/storage.ts';
    const { saveResult } = await import(path);
    const original = Storage.prototype.setItem;
    (window as typeof window & { restoreStorage?: () => void }).restoreStorage = () => { Storage.prototype.setItem = original; };
    Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
    saveResult(sample);
    saveResult(sample);
  }, sample);
  await page.getByRole('button', { name: 'Voice Settings' }).click();
  await expect(page.getByRole('alert')).toContainText('Keep this tab open');
  await expect(page.getByText('100 EP', { exact: true })).toBeVisible();
  await page.evaluate(async () => {
    (window as typeof window & { restoreStorage?: () => void }).restoreStorage!();
    const path = '/MarioTriviaQuiz/src/mario/lifetimeProgress.ts';
    const { lifetimeProgress } = await import(path);
    lifetimeProgress([], 'Ada');
  });
  await page.reload();
  await expect(page.getByText('100 EP', { exact: true })).toBeVisible();
  await expect(page.getByText('🏆 1 games', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});
