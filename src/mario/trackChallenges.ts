import { BOOSTER_COURSES, BOOSTER_SOURCE } from './courses.ts';

export type TrackChallenge = {
  id: string; kind: 'cup' | 'system' | 'feature'; prompt: string;
  correctIds: readonly string[]; explanation: string; funFact: string; sourceUrl: string;
};
const wave3 = 'https://www.nintendo.com/us/whatsnew/mario-kart-8-deluxe-booster-course-pass-wave-3-brings-merry-mountain-mayhem-with-eight-additional-courses-on-dec-7/';
const wave5 = 'https://www.nintendo.com/us/whatsnew/mario-kart-8-deluxe-booster-course-pass-more-courses-more-characters-more-giant-toilets/';
const features = [
  ['bathroom', 'Find the track set inside a giant bathroom.', 'Squeaky Clean Sprint', 'Everyday bathroom fittings become enormous obstacles when you race from a tiny kart’s viewpoint.', 'The route drops down a bathtub drain. Something normally too small to notice becomes part of the racetrack!', wave5],
  ['wigglers', 'Find the autumn forest track with huge trees and Wigglers.', 'Wii Maple Treeway', 'The autumn colours and giant trees identify Maple Treeway. Those trees form part of the route, not just the backdrop.', 'The large Wigglers are moving hazards here, so leave them room while you race past.', wave3],
  ['boulders', 'Find the mountain track with bouncing boulders and a warp-pipe ramp.', '3DS Rock Rock Mountain', 'Rock Rock Mountain mixes tight bends with gliding. Reaching the airborne section changes how you choose your route.', 'A warp pipe doubles as a ramp: it launches your kart rather than taking it through a tunnel.', wave3],
  ['holiday', 'Find the festive mountain track with snowy peaks and towering pine trees.', 'Merry Mountain', 'Merry Mountain combines a snowy climb with festive decorations. The holiday theme distinguishes it from other mountain courses.', 'Listen for the seasonal music too: the course builds its atmosphere with sound as well as snow and presents.', wave3],
] as const;

export const TRACK_CHALLENGES: readonly TrackChallenge[] = [
  ...[...new Set(BOOSTER_COURSES.map(course => course.cup))].map(cup => {
    const courses = BOOSTER_COURSES.filter(course => course.cup === cup);
    return { id: `cup-${cup}`, kind: 'cup' as const, prompt: `Find one track from the ${cup}.`, correctIds: courses.map(course => course.id),
      explanation: `${cup} starts with ${trackLabel(courses[0].title)} and finishes with ${trackLabel(courses[3].title)}. Those two ends help you remember the lineup.`,
      funFact: `${trackLabel(courses[1].title)} comes immediately before ${trackLabel(courses[2].title)}. These are the cup’s middle races, not its opening or finale.`, sourceUrl: BOOSTER_SOURCE };
  }),
  ...([['SNES', 'Super Nintendo'], ['N64', 'Nintendo 64'], ['GBA', 'Game Boy Advance'], ['GCN', 'GameCube'], ['DS', 'Nintendo DS'], ['Wii', 'Wii'], ['3DS', 'Nintendo 3DS']] as const).map(([prefix, system]) => ({
    id: `system-${prefix}`, kind: 'system' as const,
    prompt: `Find one track that first appeared on ${system}.`,
    correctIds: BOOSTER_COURSES.filter(course => course.title.startsWith(`${prefix} `)).map(course => course.id),
    explanation: `The ${prefix} label means this course began on ${system}. Playing its remake on Switch does not change that origin.`,
    funFact: (() => {
      const returning = BOOSTER_COURSES.filter(course => course.title.startsWith(`${prefix} `));
      return `The pass brings back ${returning.length} ${system} courses, including ${trackLabel(returning[0].title)} and ${trackLabel(returning[returning.length - 1].title)}.`;
    })(), sourceUrl: BOOSTER_SOURCE,
  })),
  ...features.map(([id, prompt, title, explanation, funFact, sourceUrl]) => ({ id: `feature-${id}`, kind: 'feature' as const, prompt, correctIds: [BOOSTER_COURSES.find(course => course.title === title)!.id], explanation, funFact, sourceUrl })),
];

// Origin labels would give away system questions. Keep duplicate names off a board.
export function trackLabel(title: string): string {
  return title.replace(/^(Tour|SNES|N64|GBA|GCN|DS|Wii|3DS) /, '');
}
