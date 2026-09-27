import { BOOSTER_COURSES, BOOSTER_SOURCE, type CourseAppearance } from './courses.ts';
import { QUESTIONS, createQuiz, shuffled, type Difficulty, type Topic, type TriviaQuestion } from './questions.ts';
import { CLUE_SUBJECTS } from './clues.ts';
import { CATEGORY_ITEMS, CATEGORY_LABELS, type CategoryItem, type FinderCategory } from './categoryCatalog.ts';

export type GameMode = 'quiz' | 'game-order' | 'track-finder' | 'match-hunt' | 'clue-duel' | 'category-finder';
export type Section = Topic | 'mixed';

const HISTORY_SOURCE = 'https://www.nintendo.com/us/explore/characters/mario/history/';

export type TimelineGame = { id: string; title: string; year: number; system: string };

export const MARIO_TIMELINE: readonly TimelineGame[] = [
  { id: 'smb', title: 'Super Mario Bros.', year: 1985, system: 'NES' },
  { id: 'land', title: 'Super Mario Land', year: 1989, system: 'Game Boy' },
  { id: 'smb3', title: 'Super Mario Bros. 3', year: 1990, system: 'NES' },
  { id: 'world', title: 'Super Mario World', year: 1991, system: 'Super Nintendo' },
  { id: 'mario64', title: 'Super Mario 64', year: 1996, system: 'Nintendo 64' },
  { id: 'sunshine', title: 'Super Mario Sunshine', year: 2002, system: 'GameCube' },
  { id: 'galaxy', title: 'Super Mario Galaxy', year: 2007, system: 'Wii' },
  { id: 'galaxy2', title: 'Super Mario Galaxy 2', year: 2010, system: 'Wii' },
  { id: 'world3d', title: 'Super Mario 3D World', year: 2013, system: 'Wii U' },
  { id: 'odyssey', title: 'Super Mario Odyssey', year: 2017, system: 'Nintendo Switch' },
  { id: 'wonder', title: 'Super Mario Bros. Wonder', year: 2023, system: 'Nintendo Switch' },
];

type RoundBase = { id: string; prompt: string; explanation: string; funFact: string; sourceUrl: string };
export type QuizRound = RoundBase & { mode: 'quiz'; question: TriviaQuestion };
export type OrderRound = RoundBase & { mode: 'game-order'; tiles: readonly TimelineGame[]; correctIds: readonly string[] };
export type FinderRound = RoundBase & { mode: 'track-finder'; tiles: readonly CourseAppearance[]; targetCup: string; width: number };
export type MatchPair = { id: string; name: string; clue: string };
export type MatchRound = RoundBase & { mode: 'match-hunt'; pairs: readonly MatchPair[]; nameIds: readonly string[]; clueIds: readonly string[]; targetId: string };
export type ClueRound = RoundBase & { mode: 'clue-duel'; clues: readonly string[]; choices: readonly { id: string; label: string }[]; answerId: string };
export type CategoryRound = RoundBase & { mode: 'category-finder'; tiles: readonly CategoryItem[]; targetCategory: FinderCategory; width: number };
export type GameRound = QuizRound | OrderRound | FinderRound | MatchRound | ClueRound | CategoryRound;

export function availableModes(section: Section): GameMode[] {
  return section === 'mario' ? ['quiz', 'game-order', 'match-hunt', 'clue-duel', 'category-finder'] : section === 'kart' ? ['quiz', 'track-finder', 'match-hunt', 'clue-duel'] : ['quiz', 'game-order', 'track-finder', 'match-hunt', 'clue-duel'];
}

function makeCategoryRounds(difficulty: Difficulty, random: () => number): CategoryRound[] {
  const width = difficulty === 'explorer' ? 3 : difficulty === 'scientist' ? 4 : 5;
  const size = width * width;
  const candidates = shuffled(Array.from({ length: CATEGORY_ITEMS.length - size + 1 }, (_, start) => {
    const tiles = CATEGORY_ITEMS.slice(start, start + size);
    return [...new Set(tiles.map(tile => tile.category))].map(targetCategory => ({ start, tiles, targetCategory }));
  }).flat(), random);
  const usedStarts = new Set<number>();
  const usedCategories = new Set<FinderCategory>();
  const rounds: CategoryRound[] = [];
  for (const { start, tiles, targetCategory } of candidates) {
    if (usedStarts.has(start) || usedCategories.has(targetCategory)) continue;
    const featured = tiles.find(tile => tile.category === targetCategory)!;
    rounds.push({
      id: `category-${start}-${targetCategory}`, mode: 'category-finder',
      width, tiles, targetCategory,
      prompt: `Find one ${CATEGORY_LABELS[targetCategory]}.`,
      explanation: `In this window, ${tiles.filter(tile => tile.category === targetCategory).map(tile => tile.name).join(' and ')} ${tiles.filter(tile => tile.category === targetCategory).length === 1 ? 'is' : 'are'} in that group.`,
      funFact: featured.detail, sourceUrl: featured.sourceUrl,
    });
    usedStarts.add(start);
    usedCategories.add(targetCategory);
    if (rounds.length === 3) return rounds;
  }
  throw new Error('Not enough distinct Category Finder rounds are available.');
}

function makeClueRounds(section: Section, difficulty: Difficulty, random: () => number): ClueRound[] {
  const mario = shuffled(CLUE_SUBJECTS.filter(subject => subject.topic === 'mario'), random);
  const kart = shuffled(CLUE_SUBJECTS.filter(subject => subject.topic === 'kart'), random);
  const chosen = section === 'mario' ? mario.slice(0, 5) : section === 'kart' ? kart.slice(0, 5) : shuffled([...mario.slice(0, 2), ...kart.slice(0, 3)], random);
  const maxChoices = difficulty === 'explorer' ? 4 : difficulty === 'scientist' ? 6 : 8;
  return chosen.map((subject, index) => {
    const distractors = shuffled(CLUE_SUBJECTS.filter(other => other.topic === subject.topic && other.id !== subject.id), random);
    const choiceCount = Math.min(maxChoices, 4 + index);
    const choices = shuffled([subject, ...distractors.slice(0, choiceCount - 1)], random).map(item => ({ id: item.id, label: item.answer }));
    return {
      id: `clue-${subject.id}`, mode: 'clue-duel' as const,
      prompt: subject.topic === 'mario' ? 'Which Mario character am I?' : 'Which Mario Kart track am I?',
      clues: subject.clues, choices, answerId: subject.id,
      explanation: subject.explanation, funFact: subject.funFact, sourceUrl: subject.sourceUrl,
    };
  });
}

function makeMatchRounds(section: Section, difficulty: Difficulty, random: () => number): MatchRound[] {
  const pairCount = difficulty === 'explorer' ? 4 : difficulty === 'scientist' ? 6 : 8;
  const required = pairCount * 3;
  // A name occurs only once in the whole game, even when different quiz questions use it.
  const seenNames = new Set<string>();
  // Matching difficulty comes mainly from board size; draw from all question levels
  // to leave enough distinct, source-backed names for three fresh boards.
  const candidates = shuffled(QUESTIONS.filter(question => section === 'mixed' || question.topic === section), random).filter(question => {
    if (question.answer.length > 28 || seenNames.has(question.answer)) return false;
    seenNames.add(question.answer);
    return true;
  });
  if (candidates.length < required) throw new Error(`Only ${candidates.length} unique matches are available for ${section}.`);
  return Array.from({ length: 3 }, (_, roundIndex) => {
    const chosen = candidates.slice(roundIndex * pairCount, (roundIndex + 1) * pairCount);
    const target = chosen[Math.floor(random() * chosen.length)];
    return {
      id: `match-${roundIndex}-${chosen.map(question => question.id).join('-')}`,
      mode: 'match-hunt' as const,
      prompt: 'Match each name to its clue.',
      pairs: chosen.map(question => ({ id: question.id, name: question.answer, clue: question.prompt })),
      nameIds: shuffled(chosen.map(question => question.id), random),
      clueIds: shuffled(chosen.map(question => question.id), random),
      targetId: target.id,
      explanation: target.explanation,
      funFact: target.funFact,
      sourceUrl: target.sourceUrl,
    };
  });
}

function makeOrderRound(difficulty: Difficulty, random: () => number): OrderRound {
  const count = difficulty === 'explorer' ? 3 : difficulty === 'scientist' ? 4 : 5;
  const selected = shuffled(MARIO_TIMELINE, random).slice(0, count);
  const correct = [...selected].sort((a, b) => a.year - b.year);
  const tiles = shuffled(selected, random);
  if (tiles.every((game, index) => game.id === correct[index].id)) {
    [tiles[0], tiles[1]] = [tiles[1], tiles[0]];
  }
  return {
    id: `order-${selected.map(game => game.id).sort().join('-')}`,
    mode: 'game-order', prompt: 'Put these Mario games in release order. Oldest first.',
    tiles, correctIds: correct.map(game => game.id),
    explanation: correct.map(game => `${game.title} (${game.year})`).join(' → '),
    funFact: `This line-up stretches from ${correct[0].title} on ${correct[0].system} to ${correct[correct.length - 1].title} on ${correct[correct.length - 1].system}.`,
    sourceUrl: HISTORY_SOURCE,
  };
}

function makeFinderRound(difficulty: Difficulty, random: () => number): FinderRound {
  const width = difficulty === 'explorer' ? 3 : difficulty === 'scientist' ? 4 : 5;
  const size = width * width;
  const start = Math.floor(random() * (BOOSTER_COURSES.length - size + 1));
  const tiles = BOOSTER_COURSES.slice(start, start + size);
  const targetCup = tiles[Math.floor(random() * tiles.length)].cup;
  const featured = tiles.find(course => course.cup === targetCup)!;
  const companionCup = Array.from(new Set(BOOSTER_COURSES.filter(course => course.wave === featured.wave).map(course => course.cup))).find(cup => cup !== targetCup)!;
  return {
    id: `finder-${start}-${targetCup}`,
    mode: 'track-finder', width, tiles, targetCup,
    prompt: `Find one track from the ${targetCup}.`,
    explanation: `The ${targetCup} tracks shown here are ${tiles.filter(course => course.cup === targetCup).map(course => course.title).join(', ')}.`,
    funFact: `The ${targetCup} arrived in Wave ${featured.wave} alongside the ${companionCup}.`,
    sourceUrl: BOOSTER_SOURCE,
  };
}

export function createRounds(mode: GameMode, section: Section, difficulty: Difficulty, random = Math.random): GameRound[] {
  if (!availableModes(section).includes(mode)) throw new Error(`${mode} is not available in ${section}.`);
  if (mode === 'match-hunt') return makeMatchRounds(section, difficulty, random);
  if (mode === 'clue-duel') return makeClueRounds(section, difficulty, random);
  if (mode === 'category-finder') return makeCategoryRounds(difficulty, random);
  if (mode === 'quiz') {
    return createQuiz(section, difficulty, 10, random).map(question => ({
      id: question.id, mode: 'quiz' as const, question, prompt: question.prompt,
      explanation: question.explanation, funFact: question.funFact, sourceUrl: question.sourceUrl,
    }));
  }
  const count = difficulty === 'explorer' ? 3 : difficulty === 'scientist' ? 4 : 5;
  const rounds: GameRound[] = [];
  const ids = new Set<string>();
  const facts = new Set<string>();
  const finderCups = new Set<string>();
  let attempts = 0;
  while (rounds.length < count && attempts < 200) {
    attempts += 1;
    const candidate = mode === 'game-order' ? makeOrderRound(difficulty, random) : makeFinderRound(difficulty, random);
    if (ids.has(candidate.id) || facts.has(candidate.funFact)) continue;
    if (candidate.mode === 'track-finder' && finderCups.has(candidate.targetCup)) continue;
    ids.add(candidate.id);
    facts.add(candidate.funFact);
    if (candidate.mode === 'track-finder') finderCups.add(candidate.targetCup);
    rounds.push(candidate);
  }
  if (rounds.length < count) throw new Error(`Not enough distinct ${mode} rounds are available.`);
  return rounds;
}

export function isCorrect(round: GameRound, answer: string | readonly string[]): boolean {
  if (round.mode === 'quiz') return answer === round.question.answer;
  if (round.mode === 'match-hunt') return answer === round.targetId && round.pairs.some(pair => pair.id === answer);
  if (round.mode === 'clue-duel') return answer === round.answerId;
  if (round.mode === 'category-finder') return typeof answer === 'string' && round.tiles.some(tile => tile.id === answer && tile.category === round.targetCategory);
  if (round.mode === 'track-finder') return typeof answer === 'string' && round.tiles.some(course => course.id === answer && course.cup === round.targetCup);
  return Array.isArray(answer) && answer.length === round.correctIds.length && answer.every((id, index) => id === round.correctIds[index]);
}

export function correctLabel(round: GameRound): string {
  if (round.mode === 'quiz') return round.question.answer;
  if (round.mode === 'match-hunt') return round.pairs.find(pair => pair.id === round.targetId)!.name;
  if (round.mode === 'clue-duel') return round.choices.find(choice => choice.id === round.answerId)!.label;
  if (round.mode === 'category-finder') return round.tiles.filter(tile => tile.category === round.targetCategory).map(tile => tile.name).join(' or ');
  if (round.mode === 'track-finder') return round.tiles.filter(course => course.cup === round.targetCup).map(course => course.title).join(' or ');
  return round.explanation;
}
