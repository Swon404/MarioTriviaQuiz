import { expect, test } from '@playwright/test';

for (const kind of ['order', 'pairs'] as const) {
  test(`${kind} cleanup keeps one winner per configuration and restores without losing new scores`, async ({ page }) => {
    await page.goto('./');
    const result = await page.evaluate(async kind => {
      const path = '/MarioTriviaQuiz/src/mario/scoreCleanup.ts';
      const { keepBestTimes, undoScoreCleanup } = await import(path);
      const key = kind === 'order' ? 'mariotrivia_order_times_v1' : 'mariotrivia_pair_times_v1';
      const base = { id: 'best', player: 'Ada', difficulty: 'explorer', elapsedMs: 1000, completedAt: new Date().toISOString(), ...(kind === 'order' ? { challenge: 'easy', tiles: 3, attempts: 1, ruleset: 'order-v2' } : { variant: 'hunt', pairs: 12, goal: 12, target: null, unlockPairs: 0, moves: 1, ruleset: 'pairs-v1' }) };
      const other = { ...base, id: 'other', ...(kind === 'order' ? { tiles: 4 } : { target: 'mario' }) };
      const replay = { version: 1, kind: 'order', title: 'Keep me', frames: [{ atMs: 0, event: 'Start', tiles: [{ id: 'one', label: 'One', state: 'shown' }] }] };
      localStorage.setItem(key, JSON.stringify([{ ...base, replay }, { ...base, id: 'slow', elapsedMs: 2000 }, other]));
      const lifetimeBefore = localStorage.getItem('mariotrivia_lifetime_v1');
      const cleaned = keepBestTimes(kind);
      const kept = JSON.parse(localStorage.getItem(key)!);
      localStorage.setItem(key, JSON.stringify([...kept, { ...base, id: 'new-after-cleanup', elapsedMs: 3000 }]));
      const restored = undoScoreCleanup(kind);
      return { cleaned, kept, restored, all: JSON.parse(localStorage.getItem(key)!), lifetimeUnchanged: localStorage.getItem('mariotrivia_lifetime_v1') === lifetimeBefore };
    }, kind);
    expect(result.cleaned).toEqual({ ok: true, removed: 1 });
    expect(result.kept.map((item: { id: string }) => item.id).sort()).toEqual(['best', 'other']);
    expect(result.kept[0].replay.title).toBe('Keep me');
    expect(result.restored).toBe(true);
    expect(result.all).toHaveLength(4);
    expect(result.lifetimeUnchanged).toBe(true);
  });
}

test('Score cleanup refuses damaged data and cannot delete without writing its backup', async ({ page }) => {
  await page.goto('./');
  const result = await page.evaluate(async () => {
    const path = '/MarioTriviaQuiz/src/mario/scoreCleanup.ts';
    const { keepBestTimes } = await import(path);
    const key = 'mariotrivia_order_times_v1';
    localStorage.setItem(key, '[{"id":"damaged"}]');
    const damaged = keepBestTimes('order');
    const damagedPreserved = localStorage.getItem(key);
    const base = { id: 'best', player: 'Ada', difficulty: 'explorer', challenge: 'easy', tiles: 3, attempts: 1, elapsedMs: 1000 };
    const original = JSON.stringify([base, { ...base, id: 'slow', elapsedMs: 2000 }]);
    localStorage.setItem(key, original);
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) { if (key.endsWith('_cleanup_backup')) throw new DOMException('Full', 'QuotaExceededError'); set.call(this, key, value); };
    const full = keepBestTimes('order');
    Storage.prototype.setItem = set;
    return { damaged, damagedPreserved, full, unchanged: localStorage.getItem(key) === original };
  });
  expect(result.damaged.ok).toBe(false);
  expect(result.damagedPreserved).toBe('[{"id":"damaged"}]');
  expect(result.full.ok).toBe(false);
  expect(result.unchanged).toBe(true);
});
