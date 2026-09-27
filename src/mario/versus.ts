import { createQuiz, shuffled, type Difficulty, type TriviaQuestion } from './questions.ts';
import type { Section } from './rounds.ts';
import { calculatePoints } from './scoring.ts';

export type OpponentKind = 'human' | 'computer';
export type VersusTurn = {
  id: string;
  playerIndex: 0 | 1;
  question: TriviaQuestion;
  computerAnswer?: string;
};
export type VersusSubmission = { answer: string; correct: boolean; points: number };
export type VersusQuiz = {
  turns: readonly VersusTurn[];
  difficulty: Difficulty;
  index: number;
  scores: readonly [number, number];
  points: readonly [number, number];
  streaks: readonly [number, number];
  bestStreaks: readonly [number, number];
  submission: VersusSubmission | null;
  complete: boolean;
};

const QUESTIONS_PER_PLAYER = 5;
const COMPUTER_ACCURACY: Record<Difficulty, number> = {
  explorer: 0.55, scientist: 0.7, professor: 0.85,
};

export function startVersusQuiz(section: Section, difficulty: Difficulty, opponent: OpponentKind, random = Math.random): VersusQuiz {
  const questions = createQuiz(section, difficulty, QUESTIONS_PER_PLAYER * 2, random);
  const turns: VersusTurn[] = questions.map((question, index) => {
    const playerIndex = (index % 2) as 0 | 1;
    let computerAnswer: string | undefined;
    if (playerIndex === 1 && opponent === 'computer') {
      computerAnswer = random() < COMPUTER_ACCURACY[difficulty]
        ? question.answer
        : shuffled(question.choices.filter(choice => choice !== question.answer), random)[0];
    }
    return { id: `${question.id}-player-${playerIndex}`, playerIndex, question, computerAnswer };
  });
  return { turns, difficulty, index: 0, scores: [0, 0], points: [0, 0], streaks: [0, 0], bestStreaks: [0, 0], submission: null, complete: false };
}

export function answerVersusQuiz(game: VersusQuiz, answer: string): VersusQuiz {
  if (game.complete || game.submission) return game;
  const turn = game.turns[game.index];
  if (!turn.question.choices.includes(answer)) return game;
  if (turn.computerAnswer !== undefined && answer !== turn.computerAnswer) return game;
  const correct = answer === turn.question.answer;
  return { ...game, submission: { answer, correct, points: calculatePoints(game.difficulty, correct, game.streaks[turn.playerIndex]) } };
}

export function rewindVersusQuiz(game: VersusQuiz): VersusQuiz {
  if (game.complete || !game.submission) return game;
  return { ...game, submission: null };
}

export function advanceVersusQuiz(game: VersusQuiz): VersusQuiz {
  if (game.complete || !game.submission) return game;
  const scores: [number, number] = [...game.scores];
  const points: [number, number] = [...game.points];
  const streaks: [number, number] = [...game.streaks];
  const bestStreaks: [number, number] = [...game.bestStreaks];
  const player = game.turns[game.index].playerIndex;
  if (game.submission.correct) scores[player] += 1;
  points[player] += game.submission.points;
  streaks[player] = game.submission.correct ? streaks[player] + 1 : 0;
  bestStreaks[player] = Math.max(bestStreaks[player], streaks[player]);
  const index = game.index + 1;
  return { ...game, index, scores, points, streaks, bestStreaks, submission: null, complete: index === game.turns.length };
}
