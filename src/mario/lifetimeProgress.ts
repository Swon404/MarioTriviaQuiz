import { playerProgress, type ProgressResult } from './scoring.ts';

const KEY = 'mariotrivia_lifetime_v1';
// Keep unsaved awards alive in this tab when storage is blocked or full.
let pending: ProgressResult[] = [];
let storageProblem = false;
let historyProblem = false;
export const progressStorageProblem = () => storageProblem || historyProblem;
export function reportProgressStorageProblem(problem = true): void { historyProblem = problem; }

function compact(result: ProgressResult): ProgressResult {
  const { id, player, correct, total, points, bestStreak, opponent, opponentCorrect, opponentPoints, opponentBestStreak, format } = result;
  return { id, player, correct, total, points, bestStreak, opponent, opponentCorrect, opponentPoints, opponentBestStreak, format };
}

function valid(value: unknown): value is ProgressResult {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'string' && typeof item.player === 'string'
    && typeof item.correct === 'number' && Number.isFinite(item.correct) && item.correct >= 0
    && typeof item.total === 'number' && Number.isFinite(item.total) && item.total >= 0
    && (item.opponent === undefined || typeof item.opponent === 'string')
    && ['points', 'bestStreak', 'opponentCorrect', 'opponentPoints', 'opponentBestStreak'].every(key => item[key] === undefined || (typeof item[key] === 'number' && Number.isFinite(item[key]) && item[key] >= 0));
}

function merge(...groups: readonly ProgressResult[][]): ProgressResult[] {
  const entries = new Map<string, ProgressResult>();
  for (const group of groups) for (const result of group) {
    if (valid(result) && !entries.has(result.id)) entries.set(result.id, compact(result));
  }
  return [...entries.values()];
}

// Persist before the visible result list is trimmed. IDs are retained to make
// retrying an old completion safe even after it leaves the Top Scores history.
export function syncLifetime(results: readonly ProgressResult[]): ProgressResult[] {
  let stored: ProgressResult[] = [];
  let readable = true;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw === null ? [] : JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(valid)) throw new Error('Invalid lifetime record');
    stored = parsed;
  } catch { readable = false; }
  const combined = merge(stored, pending, [...results]);
  try {
    // Do not overwrite a damaged record: retain it for possible recovery.
    if (!readable) throw new Error('Lifetime storage is unavailable');
    if (combined.length !== stored.length || pending.length) localStorage.setItem(KEY, JSON.stringify(combined));
    pending = [];
    storageProblem = false;
  } catch {
    pending = combined;
    storageProblem = true;
  }
  return combined;
}

export function lifetimeProgress(results: readonly ProgressResult[], player: string) {
  return playerProgress(syncLifetime(results), player);
}
