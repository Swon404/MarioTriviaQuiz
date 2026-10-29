import type { Difficulty } from './questions.ts';
import { fitsCategory } from './categoryCatalog.ts';
import { availableModes, createRounds, DEFAULT_PAIR_OPTIONS, type GameMode, type GameRound, type PairMatchOptions, type Section } from './rounds.ts';
import type { Answer } from './session.ts';
import type { OrderOptions } from './gameOrder.ts';

export type ChampionshipSize = 'quick' | 'standard' | 'epic';
export const CHAMPIONSHIP_SIZES: readonly ChampionshipSize[] = ['quick', 'standard', 'epic'];

const ROUND_COUNTS: Record<GameMode, Record<ChampionshipSize, number>> = {
  quiz: { quick: 3, standard: 5, epic: 8 },
  'game-order': { quick: 3, standard: 4, epic: 5 },
  'track-finder': { quick: 3, standard: 4, epic: 5 },
  'match-hunt': { quick: 2, standard: 2, epic: 2 },
  'pair-match': { quick: 3, standard: 3, epic: 3 },
  'clue-duel': { quick: 3, standard: 4, epic: 5 },
  'category-finder': { quick: 3, standard: 3, epic: 3 },
};

export function championshipRoundCount(mode: GameMode, size: ChampionshipSize): number {
  return ROUND_COUNTS[mode][size];
}

export function championshipScoring(mode: GameMode, size: ChampionshipSize, difficulty: Difficulty, pairs: PairMatchOptions, competitive: boolean): string {
  const rounds = championshipRoundCount(mode, size);
  if (mode === 'match-hunt') return `1 per matched pair; up to ${rounds * ({ explorer: 4, scientist: 6, professor: 8 })[difficulty]} each.`;
  if (mode === 'pair-match' && pairs.variant === 'hunt' && !pairs.huntTimed) return `1 per pair found${competitive ? ', shared between players' : ''}. ${pairs.targetMode === 'none' ? 'Find every pair.' : 'Finding the unlocked target ends the board.'}`;
  if (mode === 'game-order' || mode === 'pair-match') return competitive
    ? `1 per timed round won; up to ${rounds} each. Exact ties give both 1.` : `1 per completed board; up to ${rounds}.`;
  if (mode === 'clue-duel') return competitive ? `${rounds * 2} subjects shared. 1 per solve; a bonus guess can win the point.` : `1 per solved subject; up to ${rounds}.`;
  return `1 per correct answer; up to ${rounds}${competitive ? ' each' : ''}.`;
}

export function createChampionshipRounds(mode: GameMode, section: Section, difficulty: Difficulty, size: ChampionshipSize, random = Math.random, pairOptions: PairMatchOptions = DEFAULT_PAIR_OPTIONS, players = 1, orderOptions?: OrderOptions, recent: readonly string[] = []): GameRound[] {
  if (!availableModes(section).includes(mode)) throw new Error(`${mode} is not available in ${section}.`);
  const atomicCount = ROUND_COUNTS['game-order'][size];
  const options = mode === 'pair-match' ? {
    ...pairOptions, roundCount: 3,
    pairCount: pairOptions.variant === 'time-trial' ? atomicCount * 3 : pairOptions.pairCount,
    trialTarget: pairOptions.variant === 'time-trial' ? atomicCount as 3 | 4 | 5 : pairOptions.trialTarget,
  } : pairOptions;
  return createRounds(mode, section, difficulty, random, options, championshipRoundCount(mode, size) * players, orderOptions, recent, players === 2);
}

export function championshipPoints(games: readonly { correct: number; points?: number }[]): number {
  return games.reduce((total, game) => total + (game.points ?? game.correct), 0);
}

export function computerChampionshipAnswers(rounds: readonly GameRound[], difficulty: Difficulty, random = Math.random): Answer[] {
  const accuracy = { explorer: 0.55, scientist: 0.7, professor: 0.85 }[difficulty];
  return rounds.map(round => {
    const right = random() < accuracy;
    if (round.mode === 'quiz') return right ? round.question.answer : round.question.choices.find(choice => choice !== round.question.answer)!;
    if (round.mode === 'game-order') return right ? round.correctIds : [...round.correctIds].reverse();
    if (round.mode === 'track-finder') return (round.tiles.find(tile => right ? round.correctIds.includes(tile.id) : !round.correctIds.includes(tile.id)) ?? round.tiles[0]).id;
    if (round.mode === 'category-finder') return (round.tiles.find(tile => right === fitsCategory(tile, round.targetCategory)) ?? round.tiles[0]).id;
    if (round.mode === 'clue-duel') return right ? round.answerId : round.choices.find(choice => choice.id !== round.answerId)!.id;
    if (round.mode === 'pair-match') return round.completionId;
    // A completed matching board always finds its target.
    return round.targetId;
  });
}
