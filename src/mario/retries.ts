import type { Difficulty } from './questions.ts';

export const QUIZ_RETRIES: Record<Difficulty, number> = { explorer: 3, scientist: 1, professor: 0 };
