import type { TriviaQuestion } from './questions.ts';

// A separately sourced extra must not replace the source for the quiz answer.
// These are feedback improvements, not new questions or new history IDs.
const updates = 'https://www.nintendo.com/en-gb/Support/Nintendo-Switch-2/Game-Updates/How-to-Update-Mario-Kart-World-2842542.html';
const world = 'https://www.nintendo.com/us/whatsnew/mario-kart-world-direct-revs-up-new-details-on-the-biggest-mario-kart-ever-coming-to-nintendo-switch-2-at-launch/';
const design = 'https://www.nintendo.com/en-ca/whatsnew/ask-the-developer-vol-18-mario-kart-world-part-3/';
const wonder = 'https://www.nintendo.com/us/whatsnew/get-a-jump-on-super-mario-bros-wonder-with-these-powerful-power-ups/';
const odyssey = 'https://play.nintendo.com/news-tips/tips-tricks/super-mario-odyssey-secrets-tips-tricks/';
const catTips = 'https://play.nintendo.com/news-tips/tips-tricks/tips-tricks-super-mario-3d-world-bowsers-fury/';
const wii = 'https://www.nintendo.com/en-gb/News/2009/Multiplayer-mayhem-galore-in-new-Mario-adventure--251452.html';

type Extra = { text: string; sourceUrl: string; kind: 'tip' | 'funny' | 'patched-glitch'; version?: string };
export const PLAYFUL_FEEDBACK: Readonly<Record<string, Extra>> = {
  'gameplay-world-steering': { kind: 'tip', sourceUrl: world,
    text: 'Charge Jump is not just for shortcuts: you can leap over obstacles and dodge attacks. Try practising the timing away from a crowded race.' },
  'expanded-26': { kind: 'tip', sourceUrl: updates, version: '1.3.0',
    text: 'Since v1.3.0, visited P Switches appear on your map. Select one to travel nearby and practise its mission again.' },
  'family-world-time-ghosts': { kind: 'tip', sourceUrl: updates, version: '1.2.0',
    text: 'Since v1.2.0, downloaded ghosts have a View Replay option. Watch a fast driver’s route before trying to chase them.' },
  'expanded-28': { kind: 'funny', sourceUrl: updates, version: '1.3.0',
    text: 'Since v1.3.0, a Free Roam UFO can transform you into the character it pulls inside—unless character transformations are disabled.' },
  'fresh-22': { kind: 'funny', sourceUrl: design,
    text: 'World nearly lost its food feature! About two years after the idea began, a developer brought it back with a hamburger model. One burger helped rescue the menu.' },
  'gameplay-world-kamek': { kind: 'patched-glitch', sourceUrl: updates, version: '1.6.0',
    text: 'Patched in v1.6.0: creatures summoned by Kamek, including cows, could fall through the ground. Even magical cattle needed firmer footing!' },
  'expanded-33': { kind: 'patched-glitch', sourceUrl: updates, version: '1.7.0',
    text: 'Patched in v1.7.0: a Spiny Shell could break against a gold block or broadcast van. An unexpected win for television!' },
  'expanded-34': { kind: 'patched-glitch', sourceUrl: updates, version: '1.3.0',
    text: 'Patched in v1.3.0: a Spiny Shell could launch racers backwards an enormous distance. The wrong sort of shortcut!' },
  'expanded-40': { kind: 'patched-glitch', sourceUrl: updates, version: '1.6.0',
    text: 'Patched in v1.6.0: a fleeing Nabbit could fall through the ground in Free Roam. That was a bug, not an escape trick.' },
  'expanded-41': { kind: 'patched-glitch', sourceUrl: updates, version: '1.4.0',
    text: 'Patched in v1.4.0: Bullet Bill could get stuck in a DK Pass tree. Not the chauffeur you ordered!' },
  'expanded-3': { kind: 'funny', sourceUrl: wonder,
    text: 'After filling your trunk with water, try spraying a Goomba as well as thirsty flower buds. Elephant Mario has brought a water fight to the adventure.' },
  'fresh-8': { kind: 'tip', sourceUrl: wonder,
    text: 'Explore sideways inside suitable ceilings: some lead to hidden areas. The room above your head might be a route, not just a roof.' },
  'gameplay-odyssey-fuel': { kind: 'tip', sourceUrl: odyssey,
    text: 'Watch for sparkling objects and creatures: they may hide Power Moons. Stop and interact with the sparkle instead of racing straight past your next fuel supply.' },
  'family-odyssey-grown-flower': { kind: 'tip', sourceUrl: odyssey,
    text: 'Found a seed but no flowerpot? Search nearby for a pot of dirt. The game may have handed you the first half of a hidden Moon puzzle.' },
  'gameplay-fury-bell': { kind: 'tip', sourceUrl: catTips,
    text: 'Before fighting back, you can put Fury Bowser to work: his attacks break stubborn blocks that may hide secrets. Your enemy can become your demolition crew.' },
  'gameplay-3dw-rescue': { kind: 'funny', sourceUrl: catTips,
    text: 'The multiplayer winner’s crown can be stolen with a Ground Pound—or knocked off by an enemy. Winning the crown is one thing; keeping it is another!' },
  'family-wii-tilt': { kind: 'tip', sourceUrl: wii,
    text: 'Stuck on a stage? Wii’s help demonstration lets you jump in and take control while it is playing. Watch the difficult bit, then have a go yourself.' },
};

export const PLAYFUL_FEEDBACK_REVIEWED_ON = '2026-10-21';
export function withPlayfulFeedback(question: TriviaQuestion): TriviaQuestion {
  const extra = PLAYFUL_FEEDBACK[question.id];
  return extra ? { ...question, funFact: extra.text, funFactSourceUrl: extra.sourceUrl } : question;
}
