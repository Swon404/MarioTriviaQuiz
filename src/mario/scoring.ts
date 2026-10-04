import type { Difficulty } from './questions.ts';
import type { QuizResult } from './storage.ts';

export const RANKS = [
  { name: 'Rookie Racer', minEP: 0, icon: '🏁' },
  { name: 'Coin Collector', minEP: 50, icon: '🪙' },
  { name: 'Power-Up Pro', minEP: 150, icon: '🍄' },
  { name: 'Star Player', minEP: 300, icon: '⭐' },
  { name: 'Castle Champion', minEP: 500, icon: '🏰' },
  { name: 'Rainbow Road Legend', minEP: 800, icon: '🌈' },
] as const;

export const MILESTONES = [
  { title: 'First Steps', description: 'Finish your first game', icon: '🎯' },
  { title: 'Regular Player', description: 'Finish five games', icon: '🎮' },
  { title: 'Game Fan', description: 'Finish ten games', icon: '🏁' },
  { title: 'Hat Trick', description: 'Get three right in a row', icon: '🔥' },
  { title: 'On Fire', description: 'Get five right in a row', icon: '🔥' },
  { title: 'Rising Star', description: 'Earn 500 EP', icon: '⭐' },
  { title: 'Super Star', description: 'Earn 2,000 EP', icon: '🌟' },
  { title: 'Perfect Game', description: 'Get every answer right in a game', icon: '🏅' },
] as const;

export function getRank(ep: number) { return [...RANKS].reverse().find(rank => ep >= rank.minEP) ?? RANKS[0]; }
export function getNextRank(ep: number) { return RANKS.find(rank => ep < rank.minEP) ?? null; }

export function calculatePoints(difficulty: Difficulty, correct: boolean, streakBeforeAnswer: number): number {
  if (!correct) return 0;
  const base = { explorer: 10, scientist: 20, professor: 30 }[difficulty];
  const multiplier = streakBeforeAnswer >= 12 ? 5 : streakBeforeAnswer >= 8 ? 4 : streakBeforeAnswer >= 5 ? 3 : streakBeforeAnswer >= 3 ? 2 : 1;
  const points = base * multiplier;
  // The original untimed quiz awards a fixed 25% bonus. Mario's optional timer
  // is a stopwatch, so it cannot award a countdown-based speed bonus yet.
  return points + Math.floor(points * 0.25);
}

export type ProgressResult = Pick<QuizResult, 'id' | 'player' | 'correct' | 'total' | 'points' | 'bestStreak' | 'opponent' | 'opponentCorrect' | 'opponentPoints' | 'opponentBestStreak' | 'format'>;

export function playerProgress(results: readonly ProgressResult[], player: string) {
  const games = results.filter(result => result.player === player || result.opponent === player);
  const totalEP = games.reduce((sum, result) => sum + (result.player === player ? result.points ?? result.correct : result.opponentPoints ?? result.opponentCorrect ?? 0), 0);
  const bestStreak = Math.max(0, ...games.map(result => result.player === player ? result.bestStreak ?? 0 : result.opponentBestStreak ?? 0));
  const perfect = games.some(result => (result.player === player ? result.correct : result.opponentCorrect) === result.total && result.total > 0);
  const milestoneUnlocks = [games.length >= 1, games.length >= 5, games.length >= 10, bestStreak >= 3, bestStreak >= 5, totalEP >= 500, totalEP >= 2000, perfect];
  return { totalEP, bestStreak, milestones: milestoneUnlocks.filter(Boolean).length, milestoneCount: MILESTONES.length, milestoneUnlocks, gamesPlayed: games.length };
}
