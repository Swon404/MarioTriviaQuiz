import type { Difficulty } from './questions.ts';
import type { GameMode } from './rounds.ts';
import { MATCH_RETRIES, QUIZ_RETRIES } from './retries.ts';
import { MEMORY_CAPACITY } from './memoryBot.ts';

export const usesKnowledgeLevel = (mode: GameMode): boolean => mode !== 'pair-match' && mode !== 'game-order';

/** Describe the controls used by each game, rather than promising generic difficulty. */
export function difficultyDetails(mode: GameMode, level: Difficulty, _orderTiles = 4, championship = false, competitive = false): string {
  const index = ['explorer', 'scientist', 'professor'].indexOf(level);
  if (mode === 'quiz' && competitive) return `${['Familiar', 'Trickier', 'Expert'][index]} questions · one attempt each. Answers lock when revealed.`;
  if (championship) {
    switch (mode) {
      case 'quiz': return `${['Familiar', 'Trickier', 'Expert'][index]} questions, ${QUIZ_RETRIES[level] + 1} ${level === 'professor' ? 'attempt' : 'attempts'}.`;
      case 'match-hunt': return `${[4, 6, 8][index]} pairs, ${MATCH_RETRIES[level] + 1} ${level === 'professor' ? 'miss' : 'misses'} allowed.`;
      case 'clue-duel': return `${[4, 6, 8][index]} answer choices.`;
      case 'category-finder': return ['Broad groups.', 'Game-specific groups, one answer.', 'Abilities and original releases.'][index];
      case 'game-order': return `Shroomer: ${['slower', 'standard', 'faster'][index]} pace.`;
      case 'pair-match': return `Shroomer remembers ${MEMORY_CAPACITY[level]} cards.`;
    }
  }
  switch (mode) {
    case 'quiz': return `${['Familiar', 'Trickier', 'Expert'][index]} questions · ${QUIZ_RETRIES[level] + 1} ${level === 'professor' ? 'attempt' : 'attempts'} per question.`;
    case 'match-hunt': return `${[4, 6, 8][index]} clue pairs · up to ${MATCH_RETRIES[level] + 1} wrong ${level === 'professor' ? 'match' : 'matches'}.`;
    case 'clue-duel': return `${[4, 6, 8][index]} answer choices · the same five clues.`;
    case 'track-finder': return `${[4, 6, 9][index]} track tiles${championship ? '' : ` · ${index + 3} rounds`}.`;
    case 'category-finder': return [
      '9 tiles · broad groups such as friends, baddies and power-ups.',
      '9 tiles · game-specific groups with one correct answer.',
      '9 tiles · character abilities and original game releases.',
    ][index];
    case 'game-order': return `Shroomer uses a ${['slower', 'standard', 'faster'][index]} pace. Tiles and hints are set separately.`;
    case 'pair-match': return `Shroomer remembers ${MEMORY_CAPACITY[level]} revealed cards. Choose the board size below.`;
  }
}
