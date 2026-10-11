import type { Difficulty, TriviaQuestion } from './questions.ts';

// Mario games only. Retain the Luigi's Mansion additions from the withdrawn
// Nintendo-wide batch; unrelated series must not enter the shared bank.
type Entry = readonly [key: string, level: Difficulty, category: TriviaQuestion['category'], prompt: string,
  choices: readonly [string, string, string, string], explanation: string, funFact: string, clue: string];
const ENTRIES: readonly Entry[] = [
  ['gooigi', 'explorer', 'characters', 'Who is Luigi’s green double in Luigi’s Mansion 3?', ['Gooigi', 'Professor E. Gadd', 'Polterpup', 'King Boo'], 'His unusual body can tackle obstacles Luigi cannot. A second player can control him during the adventure.', 'Spikes do not stop this squishy helper.', 'Luigi’s Mansion 3 helper who can walk on spikes.'],
  ['hotel', 'explorer', 'games', 'Where does Luigi search for his friends in Luigi’s Mansion 3?', ['The Last Resort hotel', 'Peach’s Castle', 'Evershade Valley', 'New Donk City'], 'Each floor has its own theme, puzzles and boss. Exploring a hotel replaces the usual holiday relaxation.', 'Even the décor changes between themed floors.', 'Haunted hotel explored in Luigi’s Mansion 3.'],
  ['vacuum', 'scientist', 'power-ups', 'Which ghost-catching machine does Luigi use in Luigi’s Mansion 3?', ['Poltergust G-00', 'Poltergust 3000', 'F.L.U.D.D.', 'Pixelator'], 'The machine does more than vacuum: its moves help control crowds and break ghostly defences.', 'Its Suction Shot is useful against protected enemies.', 'Ghost-catching machine used in Luigi’s Mansion 3.'],
  ['tower', 'professor', 'games', 'Which Luigi’s Mansion 3 mode supports an eight-player co-op climb?', ['ScareScraper', 'ScreamPark', 'Story Mode', 'ScareSprint'], 'Teams clear objectives before the timer expires. These can involve catching ghosts or rescuing Toads.', 'ScreamPark instead offers competitive team minigames.', 'Luigi’s Mansion 3 co-op tower for up to eight players.'],
];

export const MARIO_SIDE_QUESTIONS: readonly TriviaQuestion[] = ENTRIES.map(([key, difficulty, category, prompt, choices, explanation, funFact]) => ({
  id: `mario-luigi-${key}`, knowledgeId: `mario-luigi-${key}`, topic: 'mario', difficulty, category,
  prompt, choices, answer: choices[0], explanation, funFact,
  sourceUrl: 'https://www.nintendo.com/us/store/products/luigis-mansion-3-switch/',
  sourceReview: { checkedOn: '2026-10-11', status: 'source-checked', gameVersion: 'Luigi’s Mansion 3' },
}));
export const MARIO_SIDE_MATCH_CLUES: Readonly<Record<string, string>> = Object.fromEntries(
  ENTRIES.map(([key, , , , , , , clue]) => [`mario-luigi-${key}`, clue]),
);
