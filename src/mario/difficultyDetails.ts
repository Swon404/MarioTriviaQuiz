import type { Difficulty } from './questions.ts';
import type { GameMode } from './rounds.ts';
import { MATCH_RETRIES, QUIZ_RETRIES } from './retries.ts';
import { MEMORY_CAPACITY } from './memoryBot.ts';

/** Describe the controls used by each game, rather than promising generic difficulty. */
export function difficultyDetails(mode: GameMode, level: Difficulty, orderTiles: number): string {
  const index = ['explorer', 'scientist', 'professor'].indexOf(level);
  switch (mode) {
    case 'quiz': return `${['Familiar', 'Trickier', 'Expert'][index]} questions · ${QUIZ_RETRIES[level] + 1} ${level === 'professor' ? 'attempt' : 'attempts'} per question.`;
    case 'match-hunt': return `${[4, 6, 8][index]} clue pairs · up to ${MATCH_RETRIES[level] + 1} wrong ${level === 'professor' ? 'match' : 'matches'}.`;
    case 'clue-duel': return `${[4, 6, 8][index]} answer choices · the same five clues.`;
    case 'track-finder': return `${[4, 6, 9][index]} track tiles · ${index + 3} rounds.`;
    case 'category-finder': return [
      '9 tiles · broad groups such as friends, baddies and power-ups.',
      '9 tiles · game-specific groups with one correct answer.',
      '9 tiles · character abilities and original game releases.',
    ][index];
    case 'game-order': return `${orderTiles} selected tiles · ${index + 3} rounds. Choose hints and penalties below.`;
    case 'pair-match': return `Shroomer remembers ${MEMORY_CAPACITY[level]} revealed cards. Choose the board size below.`;
  }
}
