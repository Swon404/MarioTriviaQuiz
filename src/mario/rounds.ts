import { BOOSTER_COURSES, type CourseAppearance } from './courses.ts';
import { TRACK_CHALLENGES, trackLabel, type TrackChallenge } from './trackChallenges.ts';
import { createQuiz, shuffled, type Difficulty, type Topic, type TriviaQuestion } from './questions.ts';
import { CLUE_SUBJECTS, clueSimilarity } from './clues.ts';
import { CATEGORY_ITEMS, CATEGORY_LABELS, categoryMemberships, categoryContext, fitsCategory, type CategoryItem, type FinderCategory } from './categoryCatalog.ts';
import { ICON_PAIRS, type IconKind, type IconPair } from './pairCatalog.ts';
import type { OrderOptions } from './gameOrder.ts';
import { MATCH_CLUES, knowledgeLevel } from './matchClues.ts';
import { knowledgeRank } from './questionHistory.ts';

export type GameMode = 'quiz' | 'game-order' | 'track-finder' | 'match-hunt' | 'pair-match' | 'clue-duel' | 'category-finder';
export type Section = Topic | 'mixed';
export type PairVariant = 'hunt' | 'time-trial';
export type HuntTargetMode = 'none' | 'random' | 'choose';
export type TrialTarget = 3 | 4 | 5 | 8 | 'all';
export type PairMatchOptions = {
  variant: PairVariant;
  pairCount: number;
  trialTarget: TrialTarget;
  huntTimed: boolean;
  targetMode: HuntTargetMode;
  chosenTargetId: string | null;
  unlockPairs: number;
  roundCount?: number;
};
export const DEFAULT_PAIR_OPTIONS: PairMatchOptions = {
  variant: 'hunt', pairCount: 12, trialTarget: 5, huntTimed: false,
  targetMode: 'none', chosenTargetId: null, unlockPairs: 0,
};

const HISTORY_SOURCE = 'https://www.nintendo.com/us/explore/characters/mario/history/';

export type TimelineGame = { id: string; title: string; year: number; system: string };

export const MARIO_TIMELINE: readonly TimelineGame[] = [
  { id: 'smb', title: 'Super Mario Bros.', year: 1985, system: 'NES' },
  { id: 'smb2', title: 'Super Mario Bros. 2', year: 1988, system: 'NES' },
  { id: 'land', title: 'Super Mario Land', year: 1989, system: 'Game Boy' },
  { id: 'smb3', title: 'Super Mario Bros. 3', year: 1990, system: 'NES' },
  { id: 'world', title: 'Super Mario World', year: 1991, system: 'Super Nintendo' },
  { id: 'land2', title: 'Super Mario Land 2: 6 Golden Coins', year: 1992, system: 'Game Boy' },
  { id: 'mario64', title: 'Super Mario 64', year: 1996, system: 'Nintendo 64' },
  { id: 'sunshine', title: 'Super Mario Sunshine', year: 2002, system: 'GameCube' },
  { id: 'new-ds', title: 'New Super Mario Bros.', year: 2006, system: 'Nintendo DS' },
  { id: 'galaxy', title: 'Super Mario Galaxy', year: 2007, system: 'Wii' },
  { id: 'new-wii', title: 'New Super Mario Bros. Wii', year: 2009, system: 'Wii' },
  { id: 'galaxy2', title: 'Super Mario Galaxy 2', year: 2010, system: 'Wii' },
  { id: 'land3d', title: 'Super Mario 3D Land', year: 2011, system: 'Nintendo 3DS' },
  { id: 'new2', title: 'New Super Mario Bros. 2', year: 2012, system: 'Nintendo 3DS' },
  { id: 'world3d', title: 'Super Mario 3D World', year: 2013, system: 'Wii U' },
  { id: 'maker', title: 'Super Mario Maker', year: 2015, system: 'Wii U' },
  { id: 'run', title: 'Super Mario Run', year: 2016, system: 'Mobile' },
  { id: 'odyssey', title: 'Super Mario Odyssey', year: 2017, system: 'Nintendo Switch' },
  { id: 'maker2', title: 'Super Mario Maker 2', year: 2019, system: 'Nintendo Switch' },
  { id: 'all-stars-3d', title: 'Super Mario 3D All-Stars', year: 2020, system: 'Nintendo Switch' },
  { id: 'fury', title: 'Super Mario 3D World + Bowser’s Fury', year: 2021, system: 'Nintendo Switch' },
  { id: 'wonder', title: 'Super Mario Bros. Wonder', year: 2023, system: 'Nintendo Switch' },
];

type RoundBase = { id: string; prompt: string; explanation: string; funFact: string; sourceUrl: string; review?: boolean; reviewCount?: number };
export type QuizRound = RoundBase & { mode: 'quiz'; question: TriviaQuestion };
export type OrderRound = RoundBase & { mode: 'game-order'; tiles: readonly TimelineGame[]; correctIds: readonly string[] };
export type FinderRound = RoundBase & { mode: 'track-finder'; tiles: readonly CourseAppearance[]; correctIds: readonly string[]; challengeKind: TrackChallenge['kind']; width: number };
export type MatchPair = { id: string; name: string; clue: string };
export type MatchRound = RoundBase & { mode: 'match-hunt'; pairs: readonly MatchPair[]; nameIds: readonly string[]; clueIds: readonly string[]; targetId: string };
export type PairCard = { id: string; pairId: string; kind: 'icon' | 'word'; label: string; iconKind?: IconKind; iconAlt?: string };
export type PairRound = RoundBase & { mode: 'pair-match'; variant: PairVariant; pairs: readonly IconPair[]; cards: readonly PairCard[]; completionId: string; targetPairId: string | null; unlockPairs: number; goal: number; timed: boolean };
export type ClueRound = RoundBase & { mode: 'clue-duel'; clues: readonly string[]; choices: readonly { id: string; label: string }[]; answerId: string };
export type CategoryRound = RoundBase & { mode: 'category-finder'; tiles: readonly CategoryItem[]; targetCategory: FinderCategory; width: number };
export type GameRound = QuizRound | OrderRound | FinderRound | MatchRound | PairRound | ClueRound | CategoryRound;

export function availableModes(section: Section): GameMode[] {
  return section === 'mario' ? ['quiz', 'game-order', 'match-hunt', 'pair-match', 'clue-duel', 'category-finder'] : section === 'kart' ? ['quiz', 'track-finder', 'match-hunt', 'pair-match', 'clue-duel'] : ['quiz', 'game-order', 'track-finder', 'match-hunt', 'pair-match', 'clue-duel', 'category-finder'];
}

function makePairRounds(section: Section, options: PairMatchOptions, random: () => number, recent: readonly string[] = []): PairRound[] {
  const pool = shuffled(ICON_PAIRS.filter(pair => section === 'mixed' || pair.topic === section), random)
    .sort((a, b) => knowledgeRank(`memory-pair-${a.id}`, recent) - knowledgeRank(`memory-pair-${b.id}`, recent));
  const count = Math.min(options.pairCount, pool.length);
  const chosen = options.variant === 'hunt' && options.targetMode === 'choose'
    ? pool.find(pair => pair.id === options.chosenTargetId) : undefined;
  if (options.variant === 'hunt' && options.targetMode === 'choose' && !chosen) throw new Error('The chosen Hunt target is not in this topic.');
  const available = chosen ? pool.filter(pair => pair.id !== chosen.id) : pool;
  const roundCount = options.roundCount ?? (options.variant === 'time-trial' || options.huntTimed ? 3 : 1);
  return Array.from({ length: roundCount }, (_, roundIndex) => {
    const offset = (roundIndex * (count - Number(!!chosen))) % available.length;
    const pairs = shuffled([
      ...(chosen ? [chosen] : []),
      ...Array.from({ length: count - Number(!!chosen) }, (_, index) => available[(offset + index) % available.length]),
    ], random);
    const target = options.variant !== 'hunt' || options.targetMode === 'none' ? null
      : chosen ?? pairs[Math.floor(random() * pairs.length)];
    const featured = target ?? pairs[0];
    const goal = options.variant === 'time-trial'
      ? options.trialTarget === 'all' ? count : Math.min(options.trialTarget, count)
      : count;
    const cards = shuffled(pairs.flatMap(pair => [
      { id: `${pair.id}-icon`, pairId: pair.id, kind: 'icon' as const, label: pair.icon, iconKind: pair.iconKind, iconAlt: pair.iconAlt },
      { id: `${pair.id}-word`, pairId: pair.id, kind: 'word' as const, label: pair.name },
    ]), random);
    const base = {
      id: `pair-${options.variant}-${roundIndex}-${pairs.map(pair => pair.id).join('-')}`,
      mode: 'pair-match' as const, variant: options.variant, pairs, cards,
      reviewCount: pairs.filter(pair => recent.includes(`memory-pair-${pair.id}`)).length,
      completionId: `pair-complete-${roundIndex}`,
      targetPairId: target?.id ?? null,
      unlockPairs: target ? Math.min(options.unlockPairs, count - 1) : 0,
      goal, timed: options.variant === 'time-trial' || options.huntTimed,
      prompt: options.variant === 'time-trial' ? `Find ${goal} icon-and-word pairs.` : target ? 'Hunt for the target pair.' : 'Find every icon-and-word pair.',
      explanation: `Spotlight: ${featured.name}. ${featured.question.explanation}`,
      funFact: featured.question.funFact,
      sourceUrl: featured.question.sourceUrl,
    };
    return base;
  });
}

function makeCategoryRounds(difficulty: Difficulty, random: () => number, count = 3, recent: readonly string[] = []): CategoryRound[] {
  const width = difficulty === 'explorer' ? 3 : difficulty === 'scientist' ? 4 : 5;
  const size = width * width;
  const candidates = shuffled(Array.from({ length: CATEGORY_ITEMS.length - size + 1 }, (_, start) => {
    const tiles = CATEGORY_ITEMS.slice(start, start + size);
    return [...new Set(tiles.flatMap(tile => difficulty === 'explorer' ? [tile.category] : categoryMemberships(tile)))].filter(targetCategory => tiles.some(tile => !fitsCategory(tile, targetCategory))).map(targetCategory => ({ start, tiles, targetCategory }));
  }).flat(), random).sort((a, b) => knowledgeRank(`category-${width}-${a.start}-${a.targetCategory}`, recent) - knowledgeRank(`category-${width}-${b.start}-${b.targetCategory}`, recent));
  const usedStarts = new Set<number>();
  const usedCategories = new Set<FinderCategory>();
  const rounds: CategoryRound[] = [];
  for (const { start, tiles, targetCategory } of candidates) {
    if (usedStarts.has(start) || (count <= 3 && usedCategories.has(targetCategory))) continue;
    const matches = tiles.filter(tile => fitsCategory(tile, targetCategory));
    const featured = matches[0];
    rounds.push({
      id: `category-${width}-${start}-${targetCategory}`, mode: 'category-finder',
      review: recent.includes(`category-${width}-${start}-${targetCategory}`),
      width, tiles, targetCategory,
      prompt: `Find one ${CATEGORY_LABELS[targetCategory]}.`,
      explanation: `In this window, ${matches.map(tile => tile.name).join(' and ')} ${matches.length === 1 ? 'is' : 'are'} in that group. ${categoryContext(targetCategory)}`.trim(),
      funFact: featured.detail, sourceUrl: featured.sourceUrl,
    });
    usedStarts.add(start);
    usedCategories.add(targetCategory);
    if (rounds.length === count) return rounds;
  }
  throw new Error('Not enough distinct Category Finder rounds are available.');
}

function makeClueRounds(section: Section, difficulty: Difficulty, random: () => number, count = 5, recent: readonly string[] = []): ClueRound[] {
  const candidates = shuffled(CLUE_SUBJECTS, random).sort((a, b) => knowledgeRank(`clue-${a.id}`, recent) - knowledgeRank(`clue-${b.id}`, recent));
  const mario = candidates.filter(subject => subject.topic === 'mario');
  const kart = candidates.filter(subject => subject.topic === 'kart');
  const chosen = section === 'mario' ? mario.slice(0, count) : section === 'kart' ? kart.slice(0, count) : shuffled([...mario.slice(0, Math.floor(count / 2)), ...kart.slice(0, Math.ceil(count / 2))], random);
  if (chosen.length !== count) throw new Error('Not enough distinct Clue Duel subjects.');
  const maxChoices = difficulty === 'explorer' ? 4 : difficulty === 'scientist' ? 6 : 8;
  return chosen.map(subject => {
    const distractors = shuffled(CLUE_SUBJECTS.filter(other => other.topic === subject.topic && other.id !== subject.id), random)
      .sort((a, b) => clueSimilarity(subject.id, b.id) - clueSimilarity(subject.id, a.id));
    const choices = shuffled([subject, ...distractors.slice(0, maxChoices - 1)], random).map(item => ({ id: item.id, label: item.answer }));
    return {
      id: `clue-${subject.id}`, mode: 'clue-duel' as const,
      review: recent.includes(`clue-${subject.id}`),
      prompt: subject.topic === 'mario' ? 'Which Mario character am I?' : 'Which Mario Kart track am I?',
      clues: subject.clues, choices, answerId: subject.id,
      explanation: subject.explanation, funFact: subject.funFact, sourceUrl: subject.sourceUrl,
    };
  });
}

function makeMatchRounds(section: Section, difficulty: Difficulty, random: () => number, count = 3, recent: readonly string[] = []): MatchRound[] {
  const pairCount = difficulty === 'explorer' ? 4 : difficulty === 'scientist' ? 6 : 8;
  const required = pairCount * count;
  // A name occurs only once in the whole game, even when different quiz questions use it.
  const seenNames = new Set<string>();
  // Prefer unseen eligible knowledge, then the selected level among equally
  // fresh candidates. Never borrow harder material just to fill a board.
  const candidates = shuffled(MATCH_CLUES.filter(item => knowledgeLevel(item.difficulty) <= knowledgeLevel(difficulty) && (section === 'mixed' || item.question.topic === section)), random)
    .sort((a, b) => knowledgeRank(a.question.knowledgeId, recent) - knowledgeRank(b.question.knowledgeId, recent) || knowledgeLevel(b.difficulty) - knowledgeLevel(a.difficulty)).filter(item => {
    if (seenNames.has(item.name)) return false;
    seenNames.add(item.name);
    return true;
  });
  if (candidates.length < required) throw new Error(`Only ${candidates.length} unique matches are available for ${section}.`);
  return Array.from({ length: count }, (_, roundIndex) => {
    const chosen = candidates.slice(roundIndex * pairCount, (roundIndex + 1) * pairCount);
    const target = chosen[Math.floor(random() * chosen.length)];
    return {
      id: `match-${roundIndex}-${chosen.map(item => item.id).join('-')}`,
      mode: 'match-hunt' as const,
      reviewCount: chosen.filter(item => recent.includes(item.question.knowledgeId)).length,
      prompt: 'Match each name to its clue.',
      pairs: chosen.map(item => ({ id: item.id, name: item.name, clue: item.clue })),
      nameIds: shuffled(chosen.map(question => question.id), random),
      clueIds: shuffled(chosen.map(question => question.id), random),
      targetId: target.id,
      explanation: target.question.explanation,
      funFact: target.question.funFact,
      sourceUrl: target.question.sourceUrl,
    };
  });
}

function makeOrderRound(difficulty: Difficulty, random: () => number, options?: OrderOptions, selection?: readonly TimelineGame[]): OrderRound {
  const count = options?.tiles ?? (difficulty === 'explorer' ? 3 : difficulty === 'scientist' ? 4 : 5);
  const selected = selection ? [...selection] : shuffled(MARIO_TIMELINE, random).slice(0, count);
  const correct = [...selected].sort((a, b) => a.year - b.year);
  const tiles = shuffled(selected, random);
  if (tiles.every((game, index) => game.id === correct[index].id)) {
    [tiles[0], tiles[1]] = [tiles[1], tiles[0]];
  }
  if (options?.challenge !== 'hard') {
    for (let attempt = 0; attempt < 50 && tiles.some((game, index) => game.id === correct[index].id); attempt++) {
      tiles.splice(0, tiles.length, ...shuffled(selected, random));
    }
    if (tiles.some((game, index) => game.id === correct[index].id)) tiles.splice(0, tiles.length, ...correct.slice(1), correct[0]);
  }
  return orderRound(selected, tiles);
}

function orderRound(selected: readonly TimelineGame[], tiles: readonly TimelineGame[]): OrderRound {
  const correct = [...selected].sort((a, b) => a.year - b.year);
  return {
    id: `order-${selected.map(game => game.id).sort().join('-')}`,
    mode: 'game-order', prompt: 'Put these Mario games in release order. Oldest first.',
    tiles, correctIds: correct.map(game => game.id),
    explanation: correct.map(game => `${game.title} (${game.year})`).join(' → '),
    funFact: `This line-up stretches from ${correct[0].title} on ${correct[0].system} to ${correct[correct.length - 1].title} on ${correct[correct.length - 1].system}.`,
    sourceUrl: HISTORY_SOURCE,
  };
}

// Pair nearby entries on the reviewed chronological catalogue, then give each
// player one title from each selected pair. No title is shared within a duel.
// Conjugating the first shuffle preserves cycle lengths, hence minimum swaps
// and correct-position count, while allowing a different position pattern.
export function makeComparableOrderPair(difficulty: Difficulty, random = Math.random, options?: OrderOptions): [OrderRound, OrderRound] {
  const count = options?.tiles ?? (difficulty === 'explorer' ? 3 : difficulty === 'scientist' ? 4 : 5);
  const groups = shuffled(Array.from({ length: Math.floor(MARIO_TIMELINE.length / 2) }, (_, index) =>
    shuffled(MARIO_TIMELINE.slice(index * 2, index * 2 + 2), random)), random).slice(0, count);
  const first = makeOrderRound(difficulty, random, options, groups.map(group => group[0]));
  const secondTitles = groups.map(group => group[1]).sort((a, b) => a.year - b.year);
  const permutation = first.tiles.map(tile => first.correctIds.indexOf(tile.id));
  const rename = shuffled(permutation.map((_, index) => index), random);
  const secondPermutation = rename.map(position => rename.indexOf(permutation[position]));
  return [first, orderRound(secondTitles, secondPermutation.map(index => secondTitles[index]))];
}

function makeFinderRounds(difficulty: Difficulty, random: () => number, count: number, recent: readonly string[] = []): FinderRound[] {
  const size = difficulty === 'explorer' ? 4 : difficulty === 'scientist' ? 6 : 9;
  const groups = shuffled(['cup', 'system', 'feature'] as const, random).map(kind => shuffled(TRACK_CHALLENGES.filter(task => task.kind === kind), random)
    .sort((a, b) => knowledgeRank(`finder-${a.id}`, recent) - knowledgeRank(`finder-${b.id}`, recent)));
  const tasks: TrackChallenge[] = [];
  while (tasks.length < count && groups.some(group => group.length)) {
    for (const group of groups) {
      if (group.length && tasks.length < count) tasks.push(group.shift()!);
    }
  }
  if (tasks.length !== count) throw new Error('Not enough distinct Track Finder tasks.');
  return tasks.map(task => {
    // Both Rainbow Road variants lose their distinguishing prefix in system questions.
    const pool = BOOSTER_COURSES.filter(course => task.kind !== 'system' || trackLabel(course.title) !== 'Rainbow Road');
    const valid = shuffled(pool.filter(course => task.correctIds.includes(course.id)), random);
    const wrong = shuffled(pool.filter(course => !task.correctIds.includes(course.id)), random);
    const targets = valid.slice(0, Math.min(valid.length, difficulty === 'explorer' ? 1 : 2));
    const tiles = shuffled([...targets, ...wrong.slice(0, size - targets.length)], random);
    return {
      id: `finder-${task.id}`, mode: 'track-finder' as const,
      review: recent.includes(`finder-${task.id}`),
      width: difficulty === 'explorer' ? 2 : 3, tiles,
      challengeKind: task.kind, correctIds: targets.map(course => course.id),
      prompt: task.prompt,
      explanation: `${targets.map(course => course.title).join(' and ')} ${targets.length === 1 ? 'fits' : 'fit'} this clue. ${task.explanation}`,
      funFact: task.funFact, sourceUrl: task.sourceUrl,
    };
  });
}
export function createRounds(mode: GameMode, section: Section, difficulty: Difficulty, random = Math.random, pairOptions: PairMatchOptions = DEFAULT_PAIR_OPTIONS, roundCount?: number, orderOptions?: OrderOptions, recent: readonly string[] = [], pairedOrder = false): GameRound[] {
  if (!availableModes(section).includes(mode)) throw new Error(`${mode} is not available in ${section}.`);
  if (mode === 'match-hunt') return makeMatchRounds(section, difficulty, random, roundCount, recent);
  if (mode === 'pair-match') return makePairRounds(section, { ...pairOptions, roundCount: roundCount ?? pairOptions.roundCount }, random, recent);
  if (mode === 'clue-duel') return makeClueRounds(section, difficulty, random, roundCount, recent);
  if (mode === 'category-finder') return makeCategoryRounds(difficulty, random, roundCount, recent);
  if (mode === 'quiz') {
    return createQuiz(section, difficulty, roundCount ?? 10, random, recent).map(question => ({
      id: question.id, mode: 'quiz' as const, question, prompt: question.prompt,
      explanation: question.explanation, funFact: question.funFact, sourceUrl: question.sourceUrl,
    }));
  }
  const count = roundCount ?? (difficulty === 'explorer' ? 3 : difficulty === 'scientist' ? 4 : 5);
  if (mode === 'track-finder') return makeFinderRounds(difficulty, random, count, recent);
  if (pairedOrder && count % 2 !== 0) throw new Error('Paired Game Order needs an even number of turns.');
  const rounds: GameRound[] = [];
  const ids = new Set<string>();
  const facts = new Set<string>();
  let attempts = 0;
  while (rounds.length < count && attempts < 200) {
    attempts += 1;
    if (pairedOrder) {
      const pair = makeComparableOrderPair(difficulty, random, orderOptions);
      if (pair.some(candidate => ids.has(candidate.id))) continue;
      pair.forEach(candidate => { ids.add(candidate.id); rounds.push(candidate); });
      continue;
    }
    const candidate = makeOrderRound(difficulty, random, orderOptions);
    if (ids.has(candidate.id) || facts.has(candidate.funFact)) continue;
    ids.add(candidate.id);
    facts.add(candidate.funFact);
    rounds.push(candidate);
  }
  if (rounds.length < count) throw new Error(`Not enough distinct ${mode} rounds are available.`);
  return rounds;
}

export function isCorrect(round: GameRound, answer: string | readonly string[]): boolean {
  if (round.mode === 'quiz') return answer === round.question.answer;
  if (round.mode === 'match-hunt') return answer === round.targetId && round.pairs.some(pair => pair.id === answer);
  if (round.mode === 'pair-match') return answer === round.completionId;
  if (round.mode === 'clue-duel') return answer === round.answerId;
  if (round.mode === 'category-finder') return typeof answer === 'string' && round.tiles.some(tile => tile.id === answer && fitsCategory(tile, round.targetCategory));
  if (round.mode === 'track-finder') return typeof answer === 'string' && round.correctIds.includes(answer);
  return Array.isArray(answer) && answer.length === round.correctIds.length && answer.every((id, index) => id === round.correctIds[index]);
}

export function correctLabel(round: GameRound): string {
  if (round.mode === 'quiz') return round.question.answer;
  if (round.mode === 'match-hunt') return round.pairs.find(pair => pair.id === round.targetId)!.name;
  if (round.mode === 'pair-match') return round.targetPairId ? round.pairs.find(pair => pair.id === round.targetPairId)!.name : `${round.goal} icon-and-word pairs`;
  if (round.mode === 'clue-duel') return round.choices.find(choice => choice.id === round.answerId)!.label;
  if (round.mode === 'category-finder') return round.tiles.filter(tile => fitsCategory(tile, round.targetCategory)).map(tile => tile.name).join(' or ');
  if (round.mode === 'track-finder') return round.tiles.filter(course => round.correctIds.includes(course.id)).map(course => course.title).join(' or ');
  return round.explanation;
}
