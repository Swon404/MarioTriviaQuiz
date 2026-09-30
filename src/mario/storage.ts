import type { Difficulty, Topic } from './questions.ts';
import type { GameMode, PairVariant } from './rounds.ts';

const PROFILE_KEY = 'mariotrivia_profile_v1';
const RESULTS_KEY = 'mariotrivia_results_v1';
const CHAMPIONSHIPS_KEY = 'mariotrivia_championships_v1';

export type ChampionshipResult = {
  id: string;
  player: string;
  topic: Topic | 'mixed';
  difficulty: Difficulty;
  size: 'quick' | 'standard' | 'epic';
  games: { mode: GameMode; variant?: PairVariant; correct: number; total: number; points: number }[];
  points: number;
  format?: 'solo' | 'two-player' | 'computer';
  opponent?: string;
  opponentGames?: { mode: GameMode; variant?: PairVariant; correct: number; total: number; points: number }[];
  opponentPoints?: number;
  completedAt: string;
};

export type QuizResult = {
  id: string;
  mode?: GameMode;
  variant?: PairVariant;
  player: string;
  topic: Topic | 'mixed';
  difficulty: Difficulty;
  correct: number;
  total: number;
  points?: number;
  bestStreak?: number;
  opponent?: string;
  opponentCorrect?: number;
  opponentPoints?: number;
  opponentBestStreak?: number;
  format?: 'solo' | 'two-player' | 'computer';
  elapsedMs: number;
  completedAt: string;
};

export function getPlayer(): string {
  try { return localStorage.getItem(PROFILE_KEY) || ''; } catch { return ''; }
}

export function savePlayer(name: string): void {
  localStorage.setItem(PROFILE_KEY, name.trim().slice(0, 24));
}

export function getResults(): QuizResult[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(RESULTS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((value): value is QuizResult => Boolean(value && typeof value === 'object' && 'id' in value && 'correct' in value)) : [];
  } catch { return []; }
}

export function saveResult(result: QuizResult): void {
  const existing = getResults();
  if (existing.some(item => item.id === result.id)) return;
  localStorage.setItem(RESULTS_KEY, JSON.stringify([result, ...existing].slice(0, 200)));
}

export function getChampionshipResults(): ChampionshipResult[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(CHAMPIONSHIPS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((value): value is ChampionshipResult => Boolean(value && typeof value === 'object' && 'id' in value && 'points' in value && 'games' in value)) : [];
  } catch { return []; }
}

export function saveChampionshipResult(result: ChampionshipResult): void {
  const existing = getChampionshipResults();
  if (existing.some(item => item.id === result.id)) return;
  localStorage.setItem(CHAMPIONSHIPS_KEY, JSON.stringify([result, ...existing].slice(0, 100)));
}
