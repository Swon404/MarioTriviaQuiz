import { getOrderTimes } from './gameOrder.ts';
import { getPairTimes } from './pairTimes.ts';
import { validReplay } from './replay.ts';

export const BACKUP_KEYS = ['mariotrivia_results_v1', 'mariotrivia_championships_v1', 'mariotrivia_lifetime_v1',
  'mariotrivia_order_times_v1', 'mariotrivia_pair_times_v1', 'mariotrivia_question_history_v1'] as const;
const JOURNAL = 'mariotrivia_import_recovery_v1';
type Key = typeof BACKUP_KEYS[number];
type RecordData = Record<string, unknown> & { id: string };
type Data = Partial<Record<Key, RecordData[] | Record<string, string[]>>>;
export type ProgressBackup = { format: 'mushroom-power-progress'; version: 1; createdAt: string; data: Data };
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown) => typeof v === 'string' && v.length > 0 && v.length <= 512;
const number = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const date = (v: unknown) => typeof v === 'string' && Number.isFinite(Date.parse(v));
const modes = ['quiz', 'game-order', 'track-finder', 'match-hunt', 'pair-match', 'clue-duel', 'category-finder'];
const level = (v: unknown) => ['explorer', 'scientist', 'professor'].includes(v as string);
const optional = (v: Record<string, unknown>, key: string, valid: (v: unknown) => boolean) => v[key] === undefined || valid(v[key]);
function result(v: Record<string, unknown>, lifetime = false) {
  return text(v.player) && number(v.correct) && number(v.total) && (v.correct as number) <= (v.total as number)
    && ['points', 'bestStreak', 'opponentCorrect', 'opponentPoints', 'opponentBestStreak'].every(key => optional(v, key, number))
    && optional(v, 'opponent', text) && optional(v, 'format', value => ['solo', 'two-player', 'computer'].includes(value as string))
    && (lifetime || (number(v.elapsedMs) && date(v.completedAt) && level(v.difficulty)
      && ['mario', 'kart', 'mixed'].includes(v.topic as string) && optional(v, 'mode', value => modes.includes(value as string))));
}
function leg(v: unknown) {
  return object(v) && modes.includes(v.mode as string) && number(v.correct) && number(v.total) && number(v.points)
    && optional(v, 'variant', value => ['hunt', 'time-trial'].includes(value as string));
}
function validateData(key: Key, data: unknown): asserts data is Data[Key] {
  if (key === 'mariotrivia_question_history_v1') {
    if (!object(data) || !Object.entries(data).every(([name, ids]) => name.length <= 512 && Array.isArray(ids) && ids.length <= 1000 && ids.every(text))) throw new Error('Invalid learning history.');
    return;
  }
  if (!Array.isArray(data) || data.length > 100000 || !data.every(v => object(v) && text(v.id))) throw new Error('Invalid progress records.');
  if (new Set(data.map(v => v.id)).size !== data.length) throw new Error('Duplicate record IDs in backup.');
  const valid = data.every(v => {
    if (key === 'mariotrivia_results_v1') return result(v);
    if (key === 'mariotrivia_lifetime_v1') return result(v, true);
    if (key === 'mariotrivia_championships_v1') return text(v.player) && number(v.points) && date(v.completedAt) && level(v.difficulty)
      && ['mario', 'kart', 'mixed'].includes(v.topic) && ['quick', 'standard', 'epic'].includes(v.size)
      && Array.isArray(v.games) && v.games.length > 0 && v.games.length <= 7 && v.games.every(leg)
      && optional(v, 'opponent', text) && optional(v, 'opponentPoints', number)
      && optional(v, 'opponentGames', value => Array.isArray(value) && value.length === v.games.length && value.every(leg));
    if (!date(v.completedAt) || !optional(v, 'replay', validReplay)) return false;
    return (key === 'mariotrivia_order_times_v1' ? getOrderTimes(JSON.stringify([v])) : getPairTimes(JSON.stringify([v]))).length === 1;
  });
  if (!valid) throw new Error(`Invalid records in ${key.replace('mariotrivia_', '').replace('_v1', '')}. Nothing was imported.`);
}
export function parseBackup(raw: string): ProgressBackup {
  if (raw.length > 20 * 1024 * 1024) throw new Error('Backup is too large (maximum 20 MB).');
  const value: unknown = JSON.parse(raw);
  if (!object(value) || value.format !== 'mushroom-power-progress' || value.version !== 1 || !date(value.createdAt) || !object(value.data)) throw new Error('This is not a supported Mushroom Power Quiz backup.');
  for (const [key, data] of Object.entries(value.data)) {
    if (!BACKUP_KEYS.includes(key as Key)) throw new Error('The backup contains an unsupported data section.');
    validateData(key as Key, data);
  }
  if (!Object.keys(value.data).length) throw new Error('This backup has no progress sections.');
  return value as ProgressBackup;
}
export function createProgressBackup(storage: Storage = localStorage): ProgressBackup {
  const data: Data = {};
  for (const key of BACKUP_KEYS) {
    const raw = storage.getItem(key);
    if (raw === null) continue;
    const value: unknown = JSON.parse(raw);
    validateData(key, value);
    data[key] = value;
  }
  if (!Object.keys(data).length) data.mariotrivia_results_v1 = [];
  return parseBackup(JSON.stringify({ format: 'mushroom-power-progress', version: 1, createdAt: new Date().toISOString(), data }));
}
export const previewBackup = (backup: ProgressBackup) => Object.entries(backup.data).map(([key, data]) => ({
  section: key.replace('mariotrivia_', '').replace('_v1', '').replaceAll('_', ' '), count: Array.isArray(data) ? data.length : Object.keys(data).length,
}));

// Preserve every previous byte until the merge commits. Interrupted imports
// roll back before gameplay is allowed to write more progress.
export function recoverProgressImport(storage: Storage = localStorage): boolean {
  let raw: string | null;
  try { raw = storage.getItem(JOURNAL); } catch { return true; } // Normal private/full-storage play still works.
  try {
    if (raw === null) return true;
    const before: unknown = JSON.parse(raw);
    if (!object(before) || !Object.entries(before).every(([key, value]) => BACKUP_KEYS.includes(key as Key) && (value === null || typeof value === 'string'))) return false;
    for (const [key, value] of Object.entries(before)) {
      if (value === null) storage.removeItem(key); else storage.setItem(key, value as string);
    }
    storage.removeItem(JOURNAL);
    return true;
  } catch { return false; }
}
export function importProgressBackup(input: ProgressBackup, storage: Storage = localStorage): void {
  const backup = parseBackup(JSON.stringify(input));
  if (!recoverProgressImport(storage)) throw new Error('An earlier import needs recovery before you can import again.');
  const before: Record<string, string | null> = {};
  const writes: Record<string, string> = {};
  for (const [key, incoming] of Object.entries(backup.data) as [Key, Data[Key]][]) {
    before[key] = storage.getItem(key);
    const current: unknown = before[key] === null ? key === 'mariotrivia_question_history_v1' ? {} : [] : JSON.parse(before[key]!);
    validateData(key, current);
    if (key === 'mariotrivia_question_history_v1') {
      const a = current as Record<string, string[]>;
      const b = incoming as Record<string, string[]>;
      writes[key] = JSON.stringify(Object.fromEntries([...new Set([...Object.keys(a), ...Object.keys(b)])].map(name => [name,
        [...new Set([...(Object.hasOwn(a, name) ? a[name] : []), ...(Object.hasOwn(b, name) ? b[name] : [])])].slice(0, 1000)])));
    } else {
      const combined = new Map((current as RecordData[]).map(v => [v.id, v]));
      for (const value of incoming as RecordData[]) if (!combined.has(value.id)) combined.set(value.id, value);
      writes[key] = JSON.stringify([...combined.values()]);
    }
  }
  storage.setItem(JOURNAL, JSON.stringify(before));
  try {
    for (const [key, value] of Object.entries(writes)) storage.setItem(key, value);
    storage.removeItem(JOURNAL);
  } catch {
    const recovered = recoverProgressImport(storage);
    throw new Error(recovered ? 'Storage could not save the import. Your previous progress was restored.' : 'Import interrupted. Reload to recover your previous progress before playing.');
  }
}
export function downloadProgress(backup: ProgressBackup) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url; link.download = `mushroom-quiz-progress-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
