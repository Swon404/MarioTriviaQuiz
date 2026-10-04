import type { Difficulty } from './questions.ts';
import type { GameRound } from './rounds.ts';

// A simulated opponent time, not a human leaderboard entry. Each timed mode
// uses its own task size; changing Game Order settings cannot change Hunt.
export function computerRoundTime(round: GameRound, difficulty: Difficulty, random = Math.random): number {
  const pace = { explorer: 1.3, scientist: 1, professor: 0.8 }[difficulty];
  let work = 10000;
  if (round.mode === 'game-order') work = 6000 + round.tiles.length * 2500;
  if (round.mode === 'pair-match') {
    const pairsNeeded = round.targetPairId ? Math.min(round.pairs.length, round.unlockPairs + 2) : round.goal;
    work = 4000 + round.cards.length * 350 + pairsNeeded * 1800;
  }
  return Math.round(work * pace * (0.9 + random() * 0.2));
}
