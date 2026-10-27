import type { Difficulty, TriviaQuestion } from './questions.ts';

// Mario games only. Retain the Luigi's Mansion additions from the withdrawn
// Nintendo-wide batch; unrelated series must not enter the shared bank.
type Entry = readonly [key: string, level: Difficulty, category: TriviaQuestion['category'], prompt: string,
  choices: readonly [string, string, string, string], explanation: string, funFact: string, clue: string];
const ENTRIES: readonly Entry[] = [
  ['gooigi', 'explorer', 'characters', 'Who is Luigi’s green double in Luigi’s Mansion 3?', ['Gooigi', 'Professor E. Gadd', 'Polterpup', 'King Boo'], 'Gooigi is Luigi’s squishy green double. His unusual body lets him tackle obstacles Luigi cannot, and a second player can control him.', 'Spikes do not stop Gooigi, so the safest route for him may be a dangerous route for Luigi.', 'Luigi’s Mansion 3 helper who can walk on spikes.'],
  ['hotel', 'explorer', 'games', 'Where does Luigi search for his friends in Luigi’s Mansion 3?', ['The Last Resort hotel', 'Peach’s Castle', 'Evershade Valley', 'New Donk City'], "The Last Resort is Luigi’s haunted hotel. Each themed floor brings new puzzles and a boss.", 'A new floor can feel like a new setting, not just another corridor with different room numbers.', 'Haunted hotel explored in Luigi’s Mansion 3.'],
  ['vacuum', 'scientist', 'power-ups', 'Which ghost-catching machine does Luigi use in Luigi’s Mansion 3?', ['Poltergust G-00', 'Poltergust 3000', 'F.L.U.D.D.', 'Pixelator'], 'The Poltergust G-00 does more than suck up ghosts. Its different moves help Luigi handle crowds and break through defences.', 'The Suction Shot helps against protected enemies, so simply vacuuming harder is not always the answer.', 'Ghost-catching machine used in Luigi’s Mansion 3.'],
  ['tower', 'professor', 'games', 'Which Luigi’s Mansion 3 mode supports an eight-player co-op climb?', ['ScareScraper', 'ScreamPark', 'Story Mode', 'ScareSprint'], 'ScareScraper sends up to eight players through timed co-op objectives. Catching ghosts or rescuing Toads is a shared job.', 'ScreamPark is the competitive minigame option. Similar spooky names hide very different ways to play together.', 'Luigi’s Mansion 3 co-op tower for up to eight players.'],
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
