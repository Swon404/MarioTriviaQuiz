import { expect, test } from '@playwright/test';
import { createProgressBackup, importProgressBackup, parseBackup, recoverProgressImport } from '../src/mario/progressBackup.ts';

const RESULTS = 'mariotrivia_results_v1';
const HISTORY = 'mariotrivia_question_history_v1';
const JOURNAL = 'mariotrivia_import_recovery_v1';
const record = (id: string) => ({ id, player: 'Blaize', correct: 3, total: 3, points: 3, difficulty: 'explorer', topic: 'mixed', elapsedMs: 1000, completedAt: '2026-10-28T12:00:00Z' });
function memory() {
  const map = new Map<string, string>();
  return { get length() { return map.size; }, clear: () => map.clear(), key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => { map.set(key, value); }, removeItem: (key: string) => { map.delete(key); } } satisfies Storage;
}
const incoming = () => parseBackup(JSON.stringify({ format: 'mushroom-power-progress', version: 1, createdAt: '2026-10-28T12:00:00Z', data: {
  [RESULTS]: [record('new'), record('old')], [HISTORY]: { blaize: ['new-fact'] },
} }));

test('backup merge keeps old IDs, adds new records once and excludes active rounds/settings', () => {
  const storage = memory();
  storage.setItem(RESULTS, JSON.stringify([{ ...record('old'), points: 2 }]));
  storage.setItem(HISTORY, JSON.stringify({ blaize: ['old-fact'] }));
  storage.setItem('mariotrivia_checkpoint_v1', 'active');
  storage.setItem('mariotrivia_setting_player-name', 'Ada');
  importProgressBackup(incoming(), storage);
  importProgressBackup(incoming(), storage);
  expect(JSON.parse(storage.getItem(RESULTS)!)).toEqual([{ ...record('old'), points: 2 }, record('new')]);
  expect(JSON.parse(storage.getItem(HISTORY)!)).toEqual({ blaize: ['old-fact', 'new-fact'] });
  expect(createProgressBackup(storage).data).not.toHaveProperty('mariotrivia_checkpoint_v1');
  expect(storage.getItem('mariotrivia_checkpoint_v1')).toBe('active');
  expect(storage.getItem(JOURNAL)).toBeNull();
});

test('every interrupted backup write rolls back original bytes and a crash is recoverable', () => {
  for (const failAt of [1, 2, 3]) {
    const storage = memory();
    const old = JSON.stringify([record('old')], null, 2);
    storage.setItem(RESULTS, old);
    const write = storage.setItem;
    let writes = 0;
    storage.setItem = (key, value) => { if (++writes === failAt) throw new Error('Quota exceeded'); write(key, value); };
    expect(() => importProgressBackup(incoming(), storage)).toThrow();
    expect(storage.getItem(RESULTS)).toBe(old);
    expect(storage.getItem(HISTORY)).toBeNull();
  }
  const storage = memory();
  storage.setItem(JOURNAL, JSON.stringify({ [RESULTS]: '[]', [HISTORY]: null }));
  storage.setItem(RESULTS, JSON.stringify([record('partial')]));
  storage.setItem(HISTORY, '{}');
  expect(recoverProgressImport(storage)).toBe(true);
  expect(storage.getItem(RESULTS)).toBe('[]');
  expect(storage.getItem(HISTORY)).toBeNull();
});

test('invalid, unrelated and duplicate backups cannot modify existing progress', () => {
  for (const data of [{ unexpected: [] }, { [RESULTS]: [{ ...record('bad'), points: -1 }] }, { [RESULTS]: [record('same'), record('same')] }, { [RESULTS]: [{ id: 'incomplete' }] }]) {
    expect(() => parseBackup(JSON.stringify({ ...incoming(), data }))).toThrow();
  }
  const storage = memory();
  storage.setItem(RESULTS, 'damaged bytes');
  expect(() => importProgressBackup(incoming(), storage)).toThrow();
  expect(storage.getItem(RESULTS)).toBe('damaged bytes');
  expect(storage.getItem(JOURNAL)).toBeNull();
});

test('phone import previews and cancels without changes, then merges only on request', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: RESULTS, value: [record('old')] });
  await page.getByRole('button', { name: /High Scores/ }).click();
  await page.getByText('Back up or restore progress', { exact: true }).click();
  const file = { name: 'progress.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(incoming())) };
  await page.getByLabel('Choose progress backup').setInputFiles(file);
  await expect(page.getByText('results: 2', { exact: true })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).length, RESULTS)).toBe(1);
  await page.getByRole('button', { name: 'Cancel import' }).click();
  await expect(page.getByRole('button', { name: 'Merge this backup' })).toHaveCount(0);
  await page.getByLabel('Choose progress backup').setInputFiles(file);
  await page.getByRole('button', { name: 'Merge this backup' }).click();
  await expect(page.getByRole('button', { name: 'Play Games' })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).map((v: { id: string }) => v.id), RESULTS)).toEqual(['old', 'new']);
});
