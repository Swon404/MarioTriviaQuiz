import type { ChampionshipResult, QuizResult } from './storage.ts';
import type { GameRound } from './rounds.ts';
import type { OrderOptions } from './gameOrder.ts';

export const SCORE_VERSION = 'one-point-v1';
export type FinishedScore = QuizResult | ChampionshipResult;
export function scoreConfiguration(rounds: readonly GameRound[], order: OrderOptions): string {
  return [...new Set(rounds.map(round => {
    switch (round.mode) {
      case 'game-order': return `${round.tiles.length} tiles · ${order.challenge}`;
      case 'pair-match': return `${round.variant} · ${round.pairs.length} pairs · goal ${round.goal} · ${round.timed ? 'timed' : 'relaxed'} · target ${round.targetPairId ?? 'none'} · unlock ${round.unlockPairs}`;
      case 'match-hunt': return `${round.pairs.length} pairs`;
      case 'track-finder': case 'category-finder': return `${round.tiles.length} tiles`;
      case 'clue-duel': return `${round.choices.length} choices`;
      default: return 'Questions';
    }
  }))].sort().join(' / ');
}
export function rankingPoints(result: FinishedScore): number {
  const own = result.points ?? ('correct' in result ? result.correct : 0);
  // A bot is an opponent, never a human leaderboard entrant.
  return result.format === 'two-player' ? Math.max(own, result.opponentPoints ?? ('opponentCorrect' in result ? result.opponentCorrect ?? 0 : 0)) : own;
}
export function scoreGroupKey(result: FinishedScore): string {
  return JSON.stringify([result.scoringVersion, result.topic, result.difficulty, result.format ?? 'solo', result.scoreConfiguration,
    'games' in result ? [result.size, result.games.map(game => [game.mode, game.variant, game.total]).sort()] : [result.mode ?? 'quiz', result.variant, result.total]]);
}
export function groupedScores<T extends FinishedScore>(records: readonly T[]): { key: string; records: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const record of records) {
    if (!record.scoringVersion || !record.scoreConfiguration || ('championshipLeg' in record && record.championshipLeg)) continue;
    const key = scoreGroupKey(record);
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  return [...groups].map(([key, entries]) => ({ key, records: entries.sort((a, b) => rankingPoints(b) - rankingPoints(a) || a.completedAt.localeCompare(b.completedAt) || a.id.localeCompare(b.id)).slice(0, 5) }));
}
