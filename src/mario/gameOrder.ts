import type { Difficulty } from './questions.ts';

export type OrderChallenge = 'easy' | 'medium' | 'hard';
export type OrderOptions = { challenge: OrderChallenge; tiles: number };
export const ORDER_RULES = {
  easy: { label: 'Easy', description: 'Direction hints after checking. Years revealed when solved. No time penalty.', hints: true, penalty: 0 },
  medium: { label: 'Medium', description: 'Position feedback, no arrows. Years revealed when solved. +1 second per wrong check.', hints: false, penalty: 1000 },
  hard: { label: 'Hard', description: 'Only the number of correct positions. Years revealed when solved. +1 second per wrong check.', hints: false, penalty: 1000 },
} as const;
export const orderTileOptions = (difficulty: Difficulty) => difficulty === 'explorer' ? [3, 4, 5] : difficulty === 'scientist' ? [4, 5, 6] : [5, 6, 8];
export type OrderTime = { id: string; player: string; difficulty: Difficulty; challenge: OrderChallenge; tiles: number; elapsedMs: number; attempts: number; completedAt: string };
const KEY = 'mariotrivia_order_times_v1';
export function getOrderTimes(): OrderTime[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((value): value is OrderTime => Boolean(value && typeof value.id === 'string' && typeof value.player === 'string' && ['explorer', 'scientist', 'professor'].includes(value.difficulty) && ['easy', 'medium', 'hard'].includes(value.challenge) && Number.isFinite(value.elapsedMs) && value.elapsedMs > 0 && Number.isInteger(value.tiles) && value.tiles >= 3 && value.tiles <= 8 && Number.isInteger(value.attempts) && value.attempts > 0)) : [];
  } catch { return []; }
}
export function saveOrderTime(value: OrderTime): void {
  try { localStorage.setItem(KEY, JSON.stringify([value, ...getOrderTimes().filter(item => item.id !== value.id)].slice(0, 1000))); } catch { /* Keep playing if storage is full. */ }
}
export function orderLeaderboard(difficulty: Difficulty, options: OrderOptions): OrderTime[] {
  return getOrderTimes().filter(item => item.difficulty === difficulty && item.challenge === options.challenge && item.tiles === options.tiles).sort((a, b) => a.elapsedMs - b.elapsedMs || a.attempts - b.attempts).slice(0, 10);
}
