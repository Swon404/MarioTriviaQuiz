import { correctLabel, isCorrect, type GameRound } from './rounds.ts';
import type { Difficulty } from './questions.ts';
import { calculatePoints } from './scoring.ts';

export type Answer = string | readonly string[];
export type Submission = { answer: Answer; correct: boolean; correctLabel: string; points: number };
export type GameSession = {
  rounds: readonly GameRound[];
  difficulty: Difficulty;
  index: number;
  correct: number;
  points: number;
  streak: number;
  bestStreak: number;
  submission: Submission | null;
  complete: boolean;
};

export function startSession(rounds: readonly GameRound[], difficulty: Difficulty = 'explorer'): GameSession {
  if (rounds.length === 0) throw new Error('A game needs at least one round.');
  return { rounds, difficulty, index: 0, correct: 0, points: 0, streak: 0, bestStreak: 0, submission: null, complete: false };
}

export function submit(session: GameSession, answer: Answer): GameSession {
  if (session.complete || session.submission) return session;
  const round = session.rounds[session.index];
  const correct = isCorrect(round, answer);
  return { ...session, submission: { answer, correct, correctLabel: correctLabel(round), points: calculatePoints(session.difficulty, correct, session.streak) } };
}

export function rewind(session: GameSession): GameSession {
  if (session.complete || !session.submission) return session;
  return { ...session, submission: null };
}

export function advance(session: GameSession): GameSession {
  if (session.complete || !session.submission) return session;
  const correct = session.correct + Number(session.submission.correct);
  const streak = session.submission.correct ? session.streak + 1 : 0;
  const nextIndex = session.index + 1;
  return { ...session, correct, points: session.points + session.submission.points, streak, bestStreak: Math.max(session.bestStreak, streak), index: nextIndex, submission: null, complete: nextIndex === session.rounds.length };
}
