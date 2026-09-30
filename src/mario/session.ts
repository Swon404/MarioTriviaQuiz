import { correctLabel, isCorrect, type GameRound } from './rounds.ts';
import type { Difficulty } from './questions.ts';
import { calculatePoints } from './scoring.ts';
import { QUIZ_RETRIES } from './retries.ts';

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
  wrongAnswers: readonly string[];
  complete: boolean;
};

export function startSession(rounds: readonly GameRound[], difficulty: Difficulty = 'explorer'): GameSession {
  if (rounds.length === 0) throw new Error('A game needs at least one round.');
  return { rounds, difficulty, index: 0, correct: 0, points: 0, streak: 0, bestStreak: 0, submission: null, wrongAnswers: [], complete: false };
}

export function attemptQuiz(session: GameSession, answer: string): GameSession {
  const round = session.rounds[session.index];
  if (session.complete || session.submission || round?.mode !== 'quiz' || !round.question.choices.includes(answer) || session.wrongAnswers.includes(answer)) return session;
  if (answer === round.question.answer) return submit(session, answer);
  const wrongAnswers = [...session.wrongAnswers, answer];
  const next = { ...session, wrongAnswers };
  return wrongAnswers.length <= QUIZ_RETRIES[session.difficulty] ? next : submit(next, answer);
}

export function submit(session: GameSession, answer: Answer, pointsOverride?: number): GameSession {
  if (session.complete || session.submission) return session;
  const round = session.rounds[session.index];
  const correct = isCorrect(round, answer);
  return { ...session, submission: { answer, correct, correctLabel: correctLabel(round), points: correct && pointsOverride !== undefined ? pointsOverride : calculatePoints(session.difficulty, correct, session.streak) } };
}

export function rewind(session: GameSession): GameSession {
  if (session.complete || (!session.submission && session.wrongAnswers.length === 0)) return session;
  return { ...session, submission: null, wrongAnswers: [] };
}

export function advance(session: GameSession): GameSession {
  if (session.complete || !session.submission) return session;
  const correct = session.correct + Number(session.submission.correct);
  const streak = session.submission.correct ? session.streak + 1 : 0;
  const nextIndex = session.index + 1;
  return { ...session, correct, points: session.points + session.submission.points, streak, bestStreak: Math.max(session.bestStreak, streak), index: nextIndex, submission: null, wrongAnswers: [], complete: nextIndex === session.rounds.length };
}
