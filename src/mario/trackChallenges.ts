import { BOOSTER_COURSES, BOOSTER_SOURCE } from './courses.ts';
import { TRACK_DISCOVERIES } from './discoveries.ts';

export type TrackChallenge = {
  id: string; kind: 'cup' | 'system' | 'feature'; prompt: string;
  correctIds: readonly string[]; explanation: string; funFact: string; funFactSourceUrl?: string; sourceUrl: string;
};
const wave3 = 'https://www.nintendo.com/us/whatsnew/mario-kart-8-deluxe-booster-course-pass-wave-3-brings-merry-mountain-mayhem-with-eight-additional-courses-on-dec-7/';
const wave5 = 'https://www.nintendo.com/us/whatsnew/mario-kart-8-deluxe-booster-course-pass-more-courses-more-characters-more-giant-toilets/';
const features = [
  ['bathroom', 'Find the track set inside a giant bathroom.', 'Squeaky Clean Sprint', 'Squeaky Clean Sprint shrinks the racers down for a wild bathroom lap.', wave5],
  ['wigglers', 'Find the autumn forest track with huge trees and Wigglers.', 'Wii Maple Treeway', 'Autumn leaves and enormous trees identify Maple Treeway. Your road runs through the branches.', wave3],
  ['boulders', 'Find the mountain track with bouncing boulders and a warp-pipe ramp.', '3DS Rock Rock Mountain', 'Rock Rock Mountain mixes sharp bends, bouncing boulders and big glides.', wave3],
  ['holiday', 'Find the festive mountain track with snowy peaks and towering pine trees.', 'Merry Mountain', 'Merry Mountain is the festive climb: snow, pine trees and giant presents.', wave3],
] as const;

export const TRACK_CHALLENGES: readonly TrackChallenge[] = [
  ...[...new Set(BOOSTER_COURSES.map(course => course.cup))].map(cup => {
    const courses = BOOSTER_COURSES.filter(course => course.cup === cup);
    return { id: `cup-${cup}`, kind: 'cup' as const, prompt: `Find one track from the ${cup}.`, correctIds: courses.map(course => course.id),
      explanation: `${cup}: ${courses.map(course => trackLabel(course.title)).join(' → ')}.`,
      funFact: TRACK_DISCOVERIES[`cup-${cup}`].text,
      funFactSourceUrl: TRACK_DISCOVERIES[`cup-${cup}`].sourceUrl, sourceUrl: BOOSTER_SOURCE };
  }),
  ...([['SNES', 'Super Nintendo'], ['N64', 'Nintendo 64'], ['GBA', 'Game Boy Advance'], ['GCN', 'GameCube'], ['DS', 'Nintendo DS'], ['Wii', 'Wii'], ['3DS', 'Nintendo 3DS']] as const).map(([prefix, system]) => ({
    id: `system-${prefix}`, kind: 'system' as const,
    prompt: `Find one track that first appeared on ${system}.`,
    correctIds: BOOSTER_COURSES.filter(course => course.title.startsWith(`${prefix} `)).map(course => course.id),
    explanation: `${prefix} marks a ${system} original.`,
    funFact: TRACK_DISCOVERIES[`system-${prefix}`].text,
    funFactSourceUrl: TRACK_DISCOVERIES[`system-${prefix}`].sourceUrl, sourceUrl: BOOSTER_SOURCE,
  })),
  ...features.map(([id, prompt, title, explanation, sourceUrl]) => ({ id: `feature-${id}`, kind: 'feature' as const, prompt, correctIds: [BOOSTER_COURSES.find(course => course.title === title)!.id], explanation,
    funFact: TRACK_DISCOVERIES[`feature-${id}`].text, funFactSourceUrl: TRACK_DISCOVERIES[`feature-${id}`].sourceUrl, sourceUrl })),
];

// Origin labels would give away system questions. Keep duplicate names off a board.
export function trackLabel(title: string): string {
  return title.replace(/^(Tour|SNES|N64|GBA|GCN|DS|Wii|3DS) /, '');
}
