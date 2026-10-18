import { advance, startSession, submit, type Answer, type GameSession } from './session.ts';
import type { GameRound } from './rounds.ts';
import type { Difficulty } from './questions.ts';

export function playComputerRounds(rounds: readonly GameRound[], difficulty: Difficulty, answers: readonly Answer[]): GameSession {
  if (rounds.length !== answers.length) throw new Error('Every computer round needs an answer.');
  let game = startSession(rounds, difficulty);
  for (const answer of answers) {
    const round = game.rounds[game.index];
    const pairPoints = round.mode === 'pair-match'
      ? round.timed ? 1 : round.targetPairId ? round.unlockPairs + 1 : round.pairs.length
      : undefined;
    game = advance(submit(game, answer, pairPoints));
  }
  return game;
}
