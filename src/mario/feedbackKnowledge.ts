import { ADVENTURE_CLUE_KNOWLEDGE } from './adventureClues.ts';
// Links describe facts actually stated by the revealed explanation, not every
// fact about its subject. Do not record these when only a vague first clue shows.
const courses = ['boo', 'spaceport', 'acorn', 'dandelion', 'ruins', 'starview', 'salty', 'falls', 'jungle', 'crown'];
const courseQuiz: Record<string, readonly string[]> = {
  salty: ['world-salty-statue'], jungle: ['world-dinosaur-ramp'],
};
const LINKS: Readonly<Record<string, readonly string[]>> = {
  ...ADVENTURE_CLUE_KNOWLEDGE,
  // Cup feedback reveals the complete ordered lineup. Wave numbers are not
  // shown there, so the Spiny Cup wave question deliberately stays fresh.
  'finder-cup-Golden Dash Cup': ['kart-scientist-1'],
  'finder-cup-Lucky Cat Cup': ['kart-scientist-5'],
  'finder-cup-Turnip Cup': ['kart-scientist-2'],
  'finder-cup-Propeller Cup': ['expanded-29', 'fresh-35'],
  'finder-cup-Rock Cup': ['kart-scientist-3', 'kart-professor-5', 'fresh-29'],
  'finder-cup-Moon Cup': ['kart-scientist-7', 'kart-professor-6'],
  'finder-cup-Fruit Cup': ['kart-scientist-8', 'kart-professor-4'],
  'finder-cup-Boomerang Cup': ['kart-scientist-9', 'fresh-30'],
  'finder-cup-Feather Cup': ['kart-scientist-4', 'kart-professor-3'],
  'finder-cup-Cherry Cup': ['expanded-30', 'expanded-37'],
  'finder-cup-Acorn Cup': ['kart-professor-2', 'fresh-34'],
  'finder-cup-Spiny Cup': ['kart-scientist-6', 'kart-professor-1', 'expanded-36'],
  ...Object.fromEntries(courses.flatMap(id => [
    [`clue-world-${id}`, [`finder-world-${id}`, ...(courseQuiz[id] ?? [])]],
    [`finder-world-${id}`, [`clue-world-${id}`, ...(courseQuiz[id] ?? [])]],
  ])),
  'clue-char-toad': ['mario-explorer-9'],
  'clue-char-cappy': ['gameplay-odyssey-cappy'],
  'clue-char-goomba': ['goomba-jump'],
  'clue-char-mario': ['mario-explorer-1'],
  'clue-char-luigi': ['mario-explorer-4', 'mario-professor-7'],
  'clue-char-peach': ['mario-explorer-2'],
  'clue-char-yoshi': ['expanded-7'],
  'clue-char-bowser': ['mario-explorer-3'],
  'clue-char-daisy': ['expanded-14'],
  'clue-char-rosalina': ['mario-explorer-5'],
  'clue-char-junior': ['mario-explorer-6-v2'],
  'clue-char-dk': ['expanded-21'],
  'clue-char-boo': ['expanded-5'],
  'clue-char-wario': ['mario-explorer-7'],
  'clue-char-waluigi': ['mario-explorer-8'],
  'clue-track-coconut': ['kart-explorer-7-v2'],
  'clue-track-waluigi': ['kart-explorer-8-v2'],
  'clue-track-gardens': ['fresh-24-v2'],
  'clue-track-rock': ['finder-feature-boulders'],
  'finder-feature-boulders': ['clue-track-rock'],
  'clue-track-maple': ['finder-feature-wigglers'],
  'finder-feature-wigglers': ['clue-track-maple'],
  'clue-track-merry': ['finder-feature-holiday'],
  'finder-feature-holiday': ['clue-track-merry'],
  'clue-world-item-feather': ['world-feather-route'],
  'clue-world-item-coin-shell': ['fresh-25'],
  'clue-world-item-hammer': ['fresh-26'],
  'clue-world-item-ice-flower': ['kart-explorer-6'],
  'clue-world-item-block': ['world-coin-block'],
  'clue-world-item-kamek': ['gameplay-world-kamek'],
};

export const feedbackKnowledge = (id: string): readonly string[] => Object.hasOwn(LINKS, id) ? LINKS[id] : [];

// Selection can recognise the tested fact without treating a whole character as
// exhausted. Course pairs share the same explanation; their Quiz counterpart,
// where present, describes that exact landmark rather than the entire course.
export function selectionKnowledge(id: string): readonly string[] {
  const linked = feedbackKnowledge(id);
  const quiz = linked.filter(key => !key.startsWith('finder-') && !key.startsWith('clue-'));
  return quiz.length ? quiz : linked;
}
