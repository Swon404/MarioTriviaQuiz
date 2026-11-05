import type { KartRace } from './kartQuest.ts';
export const KART_HISTORY_KEY = 'mariotrivia_kart_races_v1';
export type KartResult = { id: string; players: [string, string]; positions: [number, number]; rolls: number; completedAt: string };
export function validKartResult(value: unknown): value is KartResult {
  if (!value || typeof value !== 'object') return false;
  const v = value as KartResult;
  return typeof v.id === 'string' && v.id.length > 0 && v.id.length <= 512
    && Array.isArray(v.players) && v.players.length === 2 && v.players.every(n => typeof n === 'string' && n.length > 0 && n.length <= 24)
    && Array.isArray(v.positions) && v.positions.length === 2 && v.positions.every(n => Number.isInteger(n) && n >= 0 && n <= 100)
    && Number.isInteger(v.rolls) && v.rolls >= 1 && v.rolls <= 6
    && typeof v.completedAt === 'string' && Number.isFinite(Date.parse(v.completedAt));
}
export function kartHistory(storage: Storage = localStorage): KartResult[] {
  const value: unknown = JSON.parse(storage.getItem(KART_HISTORY_KEY) ?? '[]');
  if (!Array.isArray(value) || !value.every(validKartResult)) throw new Error('Race history could not be read.');
  return value;
}
export function saveKartHistory(race: KartRace, storage: Storage = localStorage): boolean {
  if (race.phase !== 'finished') return true;
  try {
    const records = kartHistory(storage);
    if (!records.some(record => record.id === race.id)) {
      records.push({ id: race.id, players: race.players, positions: race.positions, rolls: race.turn / 2, completedAt: new Date().toISOString() });
      storage.setItem(KART_HISTORY_KEY, JSON.stringify(records));
    }
    return true;
  } catch { return false; }
}
