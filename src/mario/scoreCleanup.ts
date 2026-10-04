import { getOrderTimes, type OrderTime } from './gameOrder.ts';
import { getPairTimes, pairTimeKey, type PairTime } from './pairTimes.ts';

export type TimedGame = 'order' | 'pairs';
const keyFor = (kind: TimedGame) => kind === 'order' ? 'mariotrivia_order_times_v1' : 'mariotrivia_pair_times_v1';
type Record = OrderTime | PairTime;
function read(kind: TimedGame, raw: string | null): Record[] {
  const parsed: unknown = JSON.parse(raw ?? '[]');
  const records = kind === 'order' ? getOrderTimes(raw) : getPairTimes(raw);
  if (!Array.isArray(parsed) || records.length !== parsed.length) throw new Error('Damaged score data');
  return records;
}
const groupKey = (record: Record) => 'variant' in record ? pairTimeKey(record)
  : JSON.stringify([record.ruleset ?? 'legacy', record.difficulty, record.challenge, record.tiles]);
const attempts = (record: Record) => 'moves' in record ? record.moves : record.attempts;

export function hasCleanupBackup(kind: TimedGame): boolean {
  try { return localStorage.getItem(keyFor(kind) + '_cleanup_backup') !== null; } catch { return false; }
}
export function keepBestTimes(kind: TimedGame): { ok: boolean; removed: number } {
  try {
    const key = keyFor(kind);
    const raw = localStorage.getItem(key);
    const records = read(kind, raw);
    const sorted = [...records].sort((a, b) => a.elapsedMs - b.elapsedMs || attempts(a) - attempts(b));
    const best = new Map<string, Record>();
    sorted.forEach(record => { if (!best.has(groupKey(record))) best.set(groupKey(record), record); });
    const kept = [...best.values()];
    if (kept.length === records.length) return { ok: true, removed: 0 };
    // Never delete unless a recoverable copy has been written successfully.
    // Retain the oldest pending backup if cleanup is used again before Undo.
    const backupKey = key + '_cleanup_backup';
    const previous = read(kind, localStorage.getItem(backupKey));
    const backup = new Map([...previous, ...records].map(record => [record.id, record]));
    localStorage.setItem(backupKey, JSON.stringify([...backup.values()]));
    localStorage.setItem(key, JSON.stringify(kept));
    return { ok: true, removed: records.length - kept.length };
  } catch { return { ok: false, removed: 0 }; }
}
export function undoScoreCleanup(kind: TimedGame): boolean {
  try {
    const key = keyFor(kind);
    const backupKey = key + '_cleanup_backup';
    const backup = localStorage.getItem(backupKey);
    if (backup === null) return false;
    const old = read(kind, backup);
    const current = read(kind, localStorage.getItem(key));
    const merged = new Map([...old, ...current].map(record => [record.id, record]));
    localStorage.setItem(key, JSON.stringify([...merged.values()]));
    localStorage.removeItem(backupKey);
    return true;
  } catch { return false; }
}
