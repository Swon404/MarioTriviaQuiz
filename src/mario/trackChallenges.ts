import { BOOSTER_COURSES, BOOSTER_SOURCE } from './courses.ts';

export type TrackChallenge = {
  id: string; kind: 'cup' | 'system' | 'feature'; prompt: string;
  correctIds: readonly string[]; explanation: string; funFact: string; sourceUrl: string;
};
const wave3 = 'https://www.nintendo.com/us/whatsnew/mario-kart-8-deluxe-booster-course-pass-wave-3-brings-merry-mountain-mayhem-with-eight-additional-courses-on-dec-7/';
const wave5 = 'https://www.nintendo.com/us/whatsnew/mario-kart-8-deluxe-booster-course-pass-more-courses-more-characters-more-giant-toilets/';
const features = [
  ['bathroom', 'Find the track set inside a giant bathroom.', 'Squeaky Clean Sprint', 'You race past oversized bathroom fittings on this course.', 'The route even takes racers down a bathtub drain!', wave5],
  ['wigglers', 'Find the autumn forest track with huge trees and Wigglers.', 'Wii Maple Treeway', 'Maple Treeway sends you racing among autumn leaves and enormous trees.', 'The big Wigglers are obstacles, not racers you can steer.', wave3],
  ['boulders', 'Find the mountain track with bouncing boulders and a warp-pipe ramp.', '3DS Rock Rock Mountain', 'Rock Rock Mountain combines rocky bends with airborne sections.', 'Watch the road as well as the sky: falling boulders can interrupt your racing line.', wave3],
  ['holiday', 'Find the festive mountain track with snowy peaks and towering pine trees.', 'Merry Mountain', 'Merry Mountain has a wintry holiday setting.', 'Its seasonal music is part of the festive atmosphere, alongside the scenery.', wave3],
] as const;

export const TRACK_CHALLENGES: readonly TrackChallenge[] = [
  ...[...new Set(BOOSTER_COURSES.map(course => course.cup))].map(cup => {
    const courses = BOOSTER_COURSES.filter(course => course.cup === cup);
    const companion = BOOSTER_COURSES.find(course => course.wave === courses[0].wave && course.cup !== cup)!.cup;
    return { id: `cup-${cup}`, kind: 'cup' as const, prompt: `Find one track from the ${cup}.`, correctIds: courses.map(course => course.id), explanation: `This question uses the cups in Mario Kart 8 Deluxe's Booster Course Pass.`, funFact: `The ${cup} arrived in Wave ${courses[0].wave} alongside the ${companion}.`, sourceUrl: BOOSTER_SOURCE };
  }),
  ...([['SNES', 'Super Nintendo'], ['N64', 'Nintendo 64'], ['GBA', 'Game Boy Advance'], ['GCN', 'GameCube'], ['DS', 'Nintendo DS'], ['Wii', 'Wii'], ['3DS', 'Nintendo 3DS']] as const).map(([prefix, system]) => ({
    id: `system-${prefix}`, kind: 'system' as const,
    prompt: `Find one track that first appeared on ${system}.`,
    correctIds: BOOSTER_COURSES.filter(course => course.title.startsWith(`${prefix} `)).map(course => course.id),
    explanation: `Look for the track's original game, not the console you can play its remake on.`,
    funFact: `In the Booster Course Pass list, ${prefix} marks courses brought back from ${system}.`, sourceUrl: BOOSTER_SOURCE,
  })),
  ...features.map(([id, prompt, title, explanation, funFact, sourceUrl]) => ({ id: `feature-${id}`, kind: 'feature' as const, prompt, correctIds: [BOOSTER_COURSES.find(course => course.title === title)!.id], explanation, funFact, sourceUrl })),
];

// Origin labels would give away system questions. Keep duplicate names off a board.
export function trackLabel(title: string): string {
  return title.replace(/^(Tour|SNES|N64|GBA|GCN|DS|Wii|3DS) /, '');
}
