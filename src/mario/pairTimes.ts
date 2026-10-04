import type { Difficulty } from './questions.ts';
import type { PairRound } from './rounds.ts';
import type { BoardReplay } from './replay.ts';

export const PAIR_RULESET = 'pairs-v1';
const KEY = 'mariotrivia_pair_times_v1';
export type PairTime = {
  id: string; player: string; difficulty: Difficulty; ruleset: string;
  variant: 'hunt' | 'time-trial'; pairs: number; goal: number;
  target: string | null; unlockPairs: number; elapsedMs: number;
  moves: number; completedAt: string; replay?: BoardReplay;
};
export function pairConfiguration(round: PairRound, difficulty: Difficulty) {
  return { difficulty, ruleset: PAIR_RULESET, variant: round.variant, pairs: round.pairs.length,
    goal: round.goal, target: round.targetPairId, unlockPairs: round.unlockPairs };
}
export function pairTimeKey(item: ReturnType<typeof pairConfiguration>): string {
  return JSON.stringify([item.ruleset, item.difficulty, item.variant, item.pairs, item.goal, item.target, item.unlockPairs]);
}
export function getPairTimes(raw?: string | null): PairTime[] {
  try {
    const parsed: unknown = JSON.parse(raw === undefined ? localStorage.getItem(KEY) ?? '[]' : raw ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is PairTime => Boolean(item
      && typeof item.id === 'string' && typeof item.player === 'string' && typeof item.ruleset === 'string'
      && ['explorer', 'scientist', 'professor'].includes(item.difficulty)
      && ['hunt', 'time-trial'].includes(item.variant)
      && Number.isInteger(item.pairs) && item.pairs > 0 && item.pairs <= 40
      && Number.isInteger(item.goal) && item.goal > 0 && item.goal <= item.pairs
      && (item.target === null || typeof item.target === 'string')
      && Number.isInteger(item.unlockPairs) && item.unlockPairs >= 0 && item.unlockPairs < item.pairs
      && Number.isFinite(item.elapsedMs) && item.elapsedMs > 0
      && Number.isInteger(item.moves) && item.moves > 0 && typeof item.completedAt === 'string')) : [];
  } catch { return []; }
}
export function savePairTime(item: PairTime, eligible: boolean): boolean {
  if (!eligible) return false;
  try {
    const existing = getPairTimes();
    if (!existing.some(value => value.id === item.id)) localStorage.setItem(KEY, JSON.stringify([item, ...existing].slice(0, 1000)));
    return true;
  } catch { return false; }
}
export function pairLeaderboard(round: PairRound, difficulty: Difficulty): PairTime[] {
  const key = pairTimeKey(pairConfiguration(round, difficulty));
  return getPairTimes().filter(item => pairTimeKey(item) === key)
    .sort((a, b) => a.elapsedMs - b.elapsedMs || a.moves - b.moves).slice(0, 10);
}
