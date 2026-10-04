import type { Difficulty } from './questions.ts';
import type { BoardReplay } from './replay.ts';

export type OrderChallenge = 'easy' | 'medium' | 'hard';
export type OrderOptions = { challenge: OrderChallenge; tiles: number };
export const ORDER_RULES = {
  easy: { label: 'Easy', description: 'Direction hints after checking. Years revealed when solved. No time penalty.', hints: true, penalty: 0 },
  medium: { label: 'Medium', description: 'Position feedback, no arrows. Years revealed when solved. +1 second per wrong check.', hints: false, penalty: 1000 },
  hard: { label: 'Hard', description: 'Only the number of correct positions. Years revealed when solved. +1 second per wrong check.', hints: false, penalty: 1000 },
} as const;
export const orderTileOptions = (difficulty: Difficulty) => difficulty === 'explorer' ? [3, 4, 5] : difficulty === 'scientist' ? [4, 5, 6] : [5, 6, 8];
export const ORDER_RULESET = 'order-v2';
const practised = new Set<string>();
export const markOrderPractice = (id: string) => { practised.add(id); };
export const isOrderPractice = (id: string) => practised.has(id);
export type OrderTime = { id: string; player: string; difficulty: Difficulty; challenge: OrderChallenge; tiles: number; elapsedMs: number; attempts: number; completedAt: string; ruleset?: string; replay?: BoardReplay };
const KEY = 'mariotrivia_order_times_v1';
export function getOrderTimes(raw?: string | null): OrderTime[] {
  try {
    const parsed: unknown = JSON.parse(raw === undefined ? localStorage.getItem(KEY) ?? '[]' : raw ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((value): value is OrderTime => Boolean(value && typeof value.id === 'string' && typeof value.player === 'string' && (value.ruleset === undefined || typeof value.ruleset === 'string') && ['explorer', 'scientist', 'professor'].includes(value.difficulty) && ['easy', 'medium', 'hard'].includes(value.challenge) && Number.isFinite(value.elapsedMs) && value.elapsedMs > 0 && Number.isInteger(value.tiles) && value.tiles >= 3 && value.tiles <= 8 && Number.isInteger(value.attempts) && value.attempts > 0)) : [];
  } catch { return []; }
}
export function saveOrderTime(value: OrderTime): boolean {
  if (isOrderPractice(value.id)) return false;
  try {
    const existing = getOrderTimes();
    if (!existing.some(item => item.id === value.id)) localStorage.setItem(KEY, JSON.stringify([{ ...value, ruleset: ORDER_RULESET }, ...existing].slice(0, 1000)));
    return true;
  } catch { return false; }
}
export function orderLeaderboard(difficulty: Difficulty, options: OrderOptions): OrderTime[] {
  return getOrderTimes().filter(item => item.ruleset === ORDER_RULESET && item.difficulty === difficulty && item.challenge === options.challenge && item.tiles === options.tiles).sort((a, b) => a.elapsedMs - b.elapsedMs || a.attempts - b.attempts).slice(0, 10);
}
