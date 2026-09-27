import type { Difficulty } from './questions.ts';
import { availableModes, createRounds, type GameMode, type GameRound, type Section } from './rounds.ts';
import type { Answer } from './session.ts';

export type ChampionshipSize = 'quick' | 'standard' | 'epic';
export const CHAMPIONSHIP_SIZES: readonly ChampionshipSize[] = ['quick', 'standard', 'epic'];

const ROUND_COUNTS: Record<GameMode, Record<ChampionshipSize, number>> = {
  quiz: { quick: 3, standard: 5, epic: 8 },
  'game-order': { quick: 3, standard: 4, epic: 5 },
  'track-finder': { quick: 3, standard: 4, epic: 5 },
  'match-hunt': { quick: 3, standard: 3, epic: 3 },
  'clue-duel': { quick: 3, standard: 4, epic: 5 },
  'category-finder': { quick: 3, standard: 3, epic: 3 },
};

export function championshipRoundCount(mode: GameMode, size: ChampionshipSize): number {
  return ROUND_COUNTS[mode][size];
}

export function createChampionshipRounds(mode: GameMode, section: Section, difficulty: Difficulty, size: ChampionshipSize, random = Math.random): GameRound[] {
  if (!availableModes(section).includes(mode)) throw new Error(`${mode} is not available in ${section}.`);
  return createRounds(mode, section, difficulty, random).slice(0, championshipRoundCount(mode, size));
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
    if (round.mode === 'track-finder') return (round.tiles.find(tile => right ? tile.cup === round.targetCup : tile.cup !== round.targetCup) ?? round.tiles[0]).id;
    if (round.mode === 'category-finder') return (round.tiles.find(tile => right ? tile.category === round.targetCategory : tile.category !== round.targetCategory) ?? round.tiles[0]).id;
    if (round.mode === 'clue-duel') return right ? round.answerId : round.choices.find(choice => choice.id !== round.answerId)!.id;
    // A completed matching board always finds its target.
    return round.targetId;
  });
}
