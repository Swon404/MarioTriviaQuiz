import { EXPANDED_QUESTIONS } from './expandedQuestions.ts';
import { FRESH_QUESTIONS } from './freshQuestions.ts';
import { GAMEPLAY_QUESTIONS } from './gameplayQuestions.ts';
import { canonicalKnowledge, normalizeKnowledge } from './knowledge.ts';
import { withVariedFunFacts } from './funFacts.ts';

export type Difficulty = 'explorer' | 'scientist' | 'professor';
export type Topic = 'mario' | 'kart';
export type Category = 'characters' | 'baddies' | 'power-ups' | 'games' | 'consoles' | 'tracks' | 'glitches';

export type TriviaQuestion = {
  id: string;
  knowledgeId: string;
  review?: boolean;
  topic: Topic;
  difficulty: Difficulty;
  category: Category;
  prompt: string;
  choices: readonly string[];
  answer: string;
  explanation: string;
  funFact: string;
  sourceUrl: string;
  sourceReview?: { checkedOn: string; status: 'source-checked'; gameVersion: string };
};

const SOURCES = {
  characters: 'https://www.nintendo.com/en-ca/explore/characters/mario/friends/',
  history: 'https://www.nintendo.com/us/explore/characters/mario/history/',
  kart: 'https://mariokart8deluxe.nintendo.com/',
  booster: 'https://en-americas-support.nintendo.com/app/answers/detail/a_id/57858/',
  world: 'https://www.nintendo.com/us/whatsnew/mario-kart-world-direct-revs-up-new-details-on-the-biggest-mario-kart-ever-coming-to-nintendo-switch-2-at-launch/',
} as const;

type SourceId = keyof typeof SOURCES;
type Row = readonly [prompt: string, answer: string, wrong1: string, wrong2: string, wrong3: string, explanation: string, funFact: string, source: SourceId];

const marioExplorer: readonly Row[] = [
  ['Who is Mario’s brother?', 'Luigi', 'Wario', 'Toad', 'Bowser Jr.', 'Luigi joins Mario on many adventures. He wears green and can jump higher than Mario.', 'Luigi is taller than Mario too.', 'characters'],
  ['Who is the princess of the Mushroom Kingdom?', 'Princess Peach', 'Rosalina', 'Daisy', 'Birdo', 'Peach is the Mushroom Kingdom’s princess. She also joins Mario and friends in sports and racing games.', 'Nintendo says Peach enjoys baking and cooking.', 'characters'],
  ['Which character is King of the Koopas?', 'Bowser', 'Wario', 'Donkey Kong', 'Toad', 'Bowser is the Koopa king and Mario’s archrival. He often stands in the way of Mario’s adventures.', 'Bowser Jr. is Bowser’s son.', 'characters'],
  ['Who wears a green hat and shirt?', 'Luigi', 'Mario', 'Waluigi', 'Diddy Kong', 'Green is Luigi’s signature colour. Mario’s familiar hat and shirt are red.', 'Luigi can be nervous around ghosts.', 'characters'],
  ['Which character travels with star-like Lumas?', 'Rosalina', 'Peach', 'Daisy', 'Toad', 'Rosalina cares for the Lumas and is connected with adventures among the stars.', 'Nintendo describes Rosalina as the Lumas’ adoptive mother.', 'characters'],
  ['Who wears a face covering with a fearsome mouth drawn on it?', 'Bowser Jr.', 'Shy Guy', 'Wario', 'Bowser', 'The painted mouth belongs to his outfit, not his face. He has inherited his father’s strength despite his small size.', 'His father is the Koopa king.', 'characters'],
  ['Which character is known for a yellow hat and purple overalls?', 'Wario', 'Mario', 'Luigi', 'Waluigi', 'Wario’s yellow and purple outfit makes him easy to spot. He calls himself Mario’s rival.', 'Wario loves garlic, according to Nintendo’s character guide.', 'characters'],
  ['Who is Wario’s pal and Luigi’s self-declared rival?', 'Waluigi', 'Bowser Jr.', 'Toad', 'Diddy Kong', 'Waluigi often teams up with Wario. He tries hard to beat Luigi and Mario in sports.', 'His very long arms and legs help him compete.', 'characters'],
  ['Which character serves Princess Peach?', 'Toad', 'Bowser', 'Wario', 'Donkey Kong', 'Toad is a resident of the Mushroom Kingdom who helps Princess Peach.', 'Toad belongs to a group of Mushroom Kingdom residents also called Toads.', 'characters'],
  ['Who is the princess of Sarasaland?', 'Daisy', 'Peach', 'Rosalina', 'Pauline', 'Sarasaland is her kingdom, rather than Peach’s Mushroom Kingdom. Her outfit uses flowers and yellow as its main themes.', 'She also enjoys competing in sports.', 'characters'],
];

const marioScientist: readonly Row[] = [
  ['Which console originally hosted Super Mario 64?', 'Nintendo 64', 'Wii', 'GameCube', 'Nintendo DS', 'Super Mario 64 appears under Nintendo 64 on Nintendo’s history timeline. It marked a major 3D Mario adventure.', 'The game appears in the 1996 part of that timeline.', 'history'],
  ['Which console did Super Mario Sunshine first appear on?', 'GameCube', 'Nintendo 64', 'Wii U', 'Game Boy', 'Super Mario Sunshine is listed as a Nintendo GameCube game.', 'Nintendo places it between Super Mario 64 and New Super Mario Bros. on its timeline.', 'history'],
  ['Which console originally hosted Super Mario Galaxy?', 'Wii', 'Nintendo DS', 'Nintendo 3DS', 'Wii U', 'Super Mario Galaxy is listed for Wii. Its sequel appears later on the same system.', 'Super Mario Galaxy 2 is also a Wii title.', 'history'],
  ['Which system did Super Mario Odyssey launch on?', 'Nintendo Switch', 'Wii U', 'Nintendo 3DS', 'GameCube', 'Nintendo’s history lists Super Mario Odyssey on Nintendo Switch.', 'It appears in the 2017 part of the timeline.', 'history'],
  ['Which handheld originally hosted Super Mario 3D Land?', 'Nintendo 3DS', 'Game Boy', 'Nintendo DS', 'Game Boy Advance', 'Super Mario 3D Land appears on the Nintendo 3DS part of Nintendo’s timeline.', 'New Super Mario Bros. 2 is another 3DS game on the timeline.', 'history'],
  ['Which console did the first Super Mario Maker launch on?', 'Wii U', 'Wii', 'Nintendo Switch', 'Nintendo 64', 'Nintendo lists Super Mario Maker as a Wii U title. Super Mario Maker 2 came later on Switch.', 'The first Super Mario Maker appears in the 2015 part of Nintendo’s timeline.', 'history'],
  ['Which handheld originally hosted Super Mario Land?', 'Game Boy', 'Nintendo DS', 'Nintendo 3DS', 'Game Boy Advance', 'Super Mario Land appears on Game Boy in Nintendo’s history.', 'Super Mario Land 2: 6 Golden Coins is also listed for Game Boy.', 'history'],
  ['Which console did Super Mario World first appear on?', 'Super Nintendo', 'Nintendo 64', 'GameCube', 'Wii', 'Nintendo’s timeline places Super Mario World on the Super Nintendo Entertainment System.', 'It follows the NES games on the history timeline.', 'history'],
  ['Which system did Super Mario Bros. Wonder launch on?', 'Nintendo Switch', 'Wii U', 'Nintendo 3DS', 'Wii', 'Super Mario Bros. Wonder appears in the Nintendo Switch part of Nintendo’s history.', 'Nintendo’s timeline places it in 2023.', 'history'],
  ['Which platform did Super Mario Run launch on?', 'Mobile', 'Nintendo 3DS', 'Game Boy', 'Wii U', 'Nintendo’s timeline places Super Mario Run in its Mobile category.', 'It appears between Super Mario Maker and Super Mario Odyssey on the timeline.', 'history'],
];

const marioProfessor: readonly Row[] = [
  ['Which of these games was released first?', 'Super Mario Sunshine', 'Super Mario Galaxy', 'Super Mario Galaxy 2', 'Super Mario Odyssey', 'Sunshine appears in 2002 and Galaxy in 2007 on Nintendo’s timeline.', 'Sunshine is listed for GameCube, while Galaxy is listed for Wii.', 'history'],
  ['Which title came directly after Super Mario 64 among these games on Nintendo’s timeline?', 'Super Mario Sunshine', 'Super Mario Odyssey', 'Super Mario Galaxy 2', 'Super Mario Bros. Wonder', 'Nintendo lists Super Mario 64 in 1996 and Sunshine in 2002, before the other choices.', 'The two games were listed for different consoles: Nintendo 64 and GameCube.', 'history'],
  ['Which 2013 game is listed for Wii U on Nintendo’s Mario timeline?', 'Super Mario 3D World', 'Super Mario 3D Land', 'Super Mario Galaxy', 'Super Mario Odyssey', 'Super Mario 3D World is the 2013 Wii U entry. Super Mario 3D Land was earlier on 3DS.', 'Nintendo later listed Super Mario 3D World + Bowser’s Fury for Switch.', 'history'],
  ['Which game on Nintendo’s timeline arrived between Super Mario Galaxy and Super Mario Galaxy 2?', 'New Super Mario Bros. Wii', 'Super Mario 3D Land', 'Super Mario Maker', 'Super Mario Odyssey', 'New Super Mario Bros. Wii appears in 2009, between Galaxy in 2007 and Galaxy 2 in 2010.', 'All three are listed as Wii games.', 'history'],
  ['Which two games on Nintendo’s timeline share the Game Boy?', 'Super Mario Land and Super Mario Land 2', 'Super Mario 64 and Sunshine', 'Super Mario Galaxy and Galaxy 2', 'Super Mario Maker and Maker 2', 'Nintendo lists both Super Mario Land games for Game Boy.', 'The second game’s full title is Super Mario Land 2: 6 Golden Coins.', 'history'],
  ['Which game is listed immediately before Super Mario Odyssey on Nintendo’s timeline?', 'Super Mario Run', 'Super Mario Maker 2', 'Super Mario Bros. Wonder', 'Super Mario Galaxy 2', 'Super Mario Run appears in 2016; Odyssey follows in 2017.', 'Nintendo places Super Mario Run in its Mobile category.', 'history'],
  ['Which character does Nintendo say can jump higher than Mario?', 'Luigi', 'Wario', 'Bowser', 'Toad', 'Luigi’s jumping ability is one way he differs from his brother Mario.', 'Nintendo also describes Luigi as taller than Mario.', 'characters'],
  ['Who does Nintendo describe as the adoptive mother of the Lumas?', 'Rosalina', 'Princess Peach', 'Daisy', 'Birdo', 'Rosalina looks after the star-like Lumas as her family.', 'Nintendo says she seems distant but is kind-hearted.', 'characters'],
  ['Which character is described by Nintendo as loving garlic?', 'Wario', 'Waluigi', 'Bowser', 'Donkey Kong', 'Wario’s appetite for garlic is part of his boisterous personality.', 'Nintendo also says Wario likes making money.', 'characters'],
  ['Which Mario title is listed for Wii U before Super Mario Maker?', 'Super Mario 3D World', 'Super Mario Odyssey', 'Super Mario 3D Land', 'Super Mario Galaxy 2', 'Super Mario 3D World appears in 2013; Super Mario Maker follows in 2015.', 'Both are listed as Wii U titles on Nintendo’s history page.', 'history'],
];

const kartExplorer: readonly Row[] = [
  ['Which Mario Kart World course has “Cinema” in its name?', 'Boo Cinema', 'Crown City', 'Starview Peak', 'Mario Bros. Circuit', 'Boo Cinema is one of the new Mario Kart World courses named by Nintendo.', 'Nintendo also names Starview Peak as a snowy course.', 'world'],
  ['Which Mario Kart World course is described as snowy?', 'Starview Peak', 'Crown City', 'Boo Cinema', 'Mario Bros. Circuit', 'Starview Peak has snowy trails. Nintendo names it among the new World courses.', 'Crown City is described as having modern streets.', 'world'],
  ['Which Mario Kart World course is set among modern city streets?', 'Crown City', 'Starview Peak', 'Boo Cinema', 'Mario Bros. Circuit', 'Crown City is the modern city course named in Nintendo’s World preview.', 'World also has roads linking its courses together.', 'world'],
  ['What can you explore without racing in Mario Kart World?', 'Free Roam', 'Grand Prix', 'Time Trials', 'Knockout Tour', 'Free Roam lets you explore the connected world at your own pace.', 'You can find hidden coins and P Switch missions while exploring.', 'world'],
  ['Which Mario Kart World mode eliminates racers at checkpoints?', 'Knockout Tour', 'Free Roam', 'Time Trials', 'Balloon Battle', 'Knockout Tour is a long rally with checkpoints. Racers who fall below the cut are eliminated.', 'It can feature up to 24 racers.', 'world'],
  ['What does an Ice Flower do in Mario Kart World?', 'Makes rivals spin', 'Builds a bridge', 'Changes the weather', 'Unlocks a cup', 'The Ice Flower chills opponents and sends them spinning.', 'The game also includes a Coin Shell that makes coins appear.', 'world'],
  ['Which Mario Kart 8 Deluxe extra course is named after a shopping centre?', 'Coconut Mall', 'Choco Mountain', 'Sky Garden', 'Shroom Ridge', 'Wii Coconut Mall appears in the Golden Dash Cup of the Booster Course Pass.', 'It is one of the returning Wii courses in that pass.', 'booster'],
  ['Which Mario Kart 8 Deluxe extra course is named after a pinball game?', 'Waluigi Pinball', 'Peach Gardens', 'Shroom Ridge', 'Kalimari Desert', 'DS Waluigi Pinball appears in the Turnip Cup.', 'The DS prefix identifies the game in which that course first appeared.', 'booster'],
  ['Which Mario Kart 8 Deluxe extra course has “Mountain” in its name?', 'Choco Mountain', 'Sky Garden', 'Coconut Mall', 'Shroom Ridge', 'N64 Choco Mountain is listed in the Golden Dash Cup.', 'The N64 prefix points to its earlier Nintendo 64 appearance.', 'booster'],
  ['Which mode in Mario Kart World lets you race against the clock?', 'Time Trials', 'Free Roam', 'Balloon Battle', 'Coin Runners', 'Time Trials is the mode for racing against the clock.', 'World lets players compare against online ghost data in Time Trials.', 'world'],
];

const kartScientist: readonly Row[] = [
  ['In Mario Kart 8 Deluxe, which cup contains Wii Coconut Mall?', 'Golden Dash Cup', 'Lucky Cat Cup', 'Turnip Cup', 'Moon Cup', 'Coconut Mall closes the four-course Golden Dash Cup in the Booster Course Pass.', 'Paris Promenade opens that cup.', 'booster'],
  ['In Mario Kart 8 Deluxe, which cup contains DS Waluigi Pinball?', 'Turnip Cup', 'Propeller Cup', 'Fruit Cup', 'Rock Cup', 'Waluigi Pinball is the fourth course in the Turnip Cup.', 'That cup also includes N64 Kalimari Desert.', 'booster'],
  ['In Mario Kart 8 Deluxe, which cup contains Wii Maple Treeway?', 'Rock Cup', 'Moon Cup', 'Fruit Cup', 'Spiny Cup', 'Maple Treeway appears in the Rock Cup of the Booster Course Pass.', 'The Moon Cup follows it in the same release wave.', 'booster'],
  ['In Mario Kart 8 Deluxe, which cup contains GCN Daisy Cruiser?', 'Feather Cup', 'Cherry Cup', 'Bell Cup', 'Acorn Cup', 'Daisy Cruiser is listed in the Feather Cup.', 'The Cherry Cup was released in the same Booster Course Pass wave.', 'booster'],
  ['In Mario Kart 8 Deluxe, which cup contains Tour Tokyo Blur?', 'Lucky Cat Cup', 'Golden Dash Cup', 'Turnip Cup', 'Propeller Cup', 'Tokyo Blur opens the Lucky Cat Cup in the Booster Course Pass.', 'Shroom Ridge and Sky Garden follow it in that cup.', 'booster'],
  ['In Mario Kart 8 Deluxe, which cup contains Wii Rainbow Road?', 'Spiny Cup', 'Acorn Cup', 'Moon Cup', 'Feather Cup', 'Wii Rainbow Road closes the Spiny Cup as its fourth and final course.', 'It appeared in the final Booster Course Pass wave.', 'booster'],
  ['In Mario Kart 8 Deluxe, which cup contains DS Peach Gardens?', 'Moon Cup', 'Rock Cup', 'Lucky Cat Cup', 'Fruit Cup', 'Peach Gardens appears in the Moon Cup alongside Merry Mountain.', 'That cup ends with 3DS Rainbow Road.', 'booster'],
  ['In Mario Kart 8 Deluxe, which cup contains GBA Riverside Park?', 'Fruit Cup', 'Boomerang Cup', 'Turnip Cup', 'Propeller Cup', 'Riverside Park is in the Fruit Cup, between Amsterdam Drift and DK Summit.', 'The Fruit Cup also includes Yoshi’s Island.', 'booster'],
  ['In Mario Kart 8 Deluxe, which cup contains Tour Singapore Speedway?', 'Boomerang Cup', 'Fruit Cup', 'Cherry Cup', 'Lucky Cat Cup', 'Singapore Speedway closes the Boomerang Cup.', 'Bangkok Rush opens that cup.', 'booster'],
  ['Which Mario Kart World move lets you reach rails and ride on walls?', 'Charge Jump', 'Smart Steering', 'Auto-Accelerate', 'Rewind', 'Charge Jump can help a driver reach rails and wall rides.', 'Nintendo says linked wall rides can reveal hidden routes.', 'world'],
];

const kartProfessor: readonly Row[] = [
  ['Which course ends the Spiny Cup in Mario Kart 8 Deluxe?', 'Wii Rainbow Road', 'SNES Bowser Castle 3', 'Tour Madrid Drive', '3DS Rosalina’s Ice World', 'Wii Rainbow Road is fourth in the Spiny Cup. The other options are the first three courses.', 'The Spiny Cup was part of the sixth Booster Course Pass wave.', 'booster'],
  ['Which course opens the Acorn Cup in Mario Kart 8 Deluxe?', 'Tour Rome Avanti', 'GCN DK Mountain', 'Wii Daisy Circuit', 'Piranha Plant Cove', 'Rome Avanti is first in the Acorn Cup. DK Mountain, Daisy Circuit and Piranha Plant Cove follow.', 'The Acorn Cup arrived in the final Booster Course Pass wave.', 'booster'],
  ['Which course follows GCN Daisy Cruiser in the Mario Kart 8 Deluxe Feather Cup?', 'Wii Moonview Highway', 'Squeaky Clean Sprint', 'Tour Athens Drift', 'Wii Koopa Cape', 'Moonview Highway comes directly after Daisy Cruiser in the Feather Cup.', 'Squeaky Clean Sprint closes that cup.', 'booster'],
  ['Which course closes the Mario Kart 8 Deluxe Fruit Cup?', 'Yoshi’s Island', 'Wii DK Summit', 'GBA Riverside Park', 'Tour Amsterdam Drift', 'Yoshi’s Island is the fourth course in the Fruit Cup.', 'The cup opens with Amsterdam Drift.', 'booster'],
  ['Which cup has Tour London Loop in Mario Kart 8 Deluxe?', 'Rock Cup', 'Moon Cup', 'Fruit Cup', 'Feather Cup', 'London Loop opens the Rock Cup of the Booster Course Pass.', 'That cup closes with Wii Maple Treeway.', 'booster'],
  ['Which course comes just before 3DS Rainbow Road in the Mario Kart 8 Deluxe Moon Cup?', 'Merry Mountain', 'DS Peach Gardens', 'Tour Berlin Byways', 'Wii Maple Treeway', 'Merry Mountain is third in the Moon Cup, immediately before 3DS Rainbow Road.', 'Berlin Byways opens the Moon Cup.', 'booster'],
  ['Which Booster Course Pass wave added the Spiny Cup?', 'Wave 6', 'Wave 3', 'Wave 4', 'Wave 5', 'The Spiny Cup came in Wave 6, the final wave of the pass.', 'Wave 6 also added the Acorn Cup.', 'booster'],
  ['Which Mario Kart World race can have up to 24 drivers?', 'Grand Prix', 'Four-player split screen', 'Time Trials ghost', 'Single-player Free Roam', 'Nintendo says Grand Prix and Knockout Tour can reach 24 racers.', 'World also supports four players sharing one screen locally.', 'world'],
  ['In Mario Kart World Grand Prix, what links one course to the next?', 'Driveable roads', 'A loading-only menu', 'A teleporting pipe', 'A ferry ride', 'World connects courses with roads that racers drive during a Grand Prix.', 'The Mushroom Cup starts at Mario Bros. Circuit before heading toward Crown City.', 'world'],
  ['In Mario Kart World, what happens when you use Rewind?', 'Your vehicle returns while rivals keep moving', 'Every racer moves backward together', 'The whole race restarts', 'The timer pauses for everyone', 'Rewind resets your vehicle’s position after a mistake. Rivals continue racing, so it can cost you places.', 'World lets players use Rewind in Free Roam or single-player modes.', 'world'],
];

function createRows(topic: Topic, difficulty: Difficulty, rows: readonly Row[], categories: readonly Category[]): TriviaQuestion[] {
  if (rows.length !== categories.length) throw new Error(`Missing category for ${topic}/${difficulty}`);
  return rows.map(([prompt, answer, wrong1, wrong2, wrong3, explanation, funFact, source], index) => ({
    id: `${topic}-${difficulty}-${index + 1}`,
    knowledgeId: `${topic}-${difficulty}-${index + 1}`,
    topic,
    difficulty,
    category: categories[index],
    prompt,
    choices: [answer, wrong1, wrong2, wrong3],
    answer,
    explanation,
    funFact,
    sourceUrl: SOURCES[source],
    sourceReview: source === 'history' ? { checkedOn: '2026-10-04', status: 'source-checked' as const, gameVersion: 'Nintendo’s US Mario release timeline' } : topic === 'mario' && difficulty === 'explorer'
      ? { checkedOn: '2026-10-04', status: 'source-checked' as const, gameVersion: 'Super Mario series — Nintendo character guide' }
      : undefined,
  }));
}

// These edited records now ask a different fact; do not migrate their old history.
const KNOWLEDGE_EQUIVALENTS: Readonly<Record<string, string>> = {
  'mario-explorer-6': 'mario-explorer-6-v2',
  'mario-explorer-10': 'expanded-14',
};
export const QUESTIONS: readonly TriviaQuestion[] = [
  ...createRows('mario', 'explorer', marioExplorer, ['characters','characters','baddies','characters','characters','baddies','characters','characters','characters','characters']),
  ...createRows('mario', 'scientist', marioScientist, ['consoles','consoles','consoles','consoles','consoles','consoles','consoles','consoles','consoles','consoles']),
  ...createRows('mario', 'professor', marioProfessor, ['games','games','games','games','consoles','games','characters','characters','characters','games']),
  ...createRows('kart', 'explorer', kartExplorer, ['tracks','tracks','tracks','games','games','power-ups','tracks','tracks','tracks','games']),
  ...createRows('kart', 'scientist', kartScientist, ['tracks','tracks','tracks','tracks','tracks','tracks','tracks','tracks','tracks','games']),
  ...createRows('kart', 'professor', kartProfessor, ['tracks','tracks','tracks','tracks','tracks','tracks','tracks','games','games','games']),
  ...EXPANDED_QUESTIONS,
  ...FRESH_QUESTIONS,
  ...GAMEPLAY_QUESTIONS,
].map(question => ({ ...question, knowledgeId: canonicalKnowledge(KNOWLEDGE_EQUIVALENTS[question.id] ?? question.knowledgeId) }));

export function shuffled<T>(values: readonly T[], random = Math.random): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createQuiz(topic: Topic | 'mixed', difficulty: Difficulty, count: number, random = Math.random, recent: readonly string[] = []): TriviaQuestion[] {
  recent = normalizeKnowledge(recent);
  const pool = QUESTIONS.filter(question => question.difficulty === difficulty && (topic === 'mixed' || question.topic === topic));
  const uniqueFacts = new Set(pool.map(question => question.knowledgeId)).size;
  if (uniqueFacts < count) throw new Error(`Only ${uniqueFacts} distinct facts are available for ${topic}/${difficulty}.`);
  const byCategory = new Map<Category, TriviaQuestion[]>();
  for (const question of shuffled(pool, random)) {
    const group = byCategory.get(question.category) ?? [];
    group.push(question);
    byCategory.set(question.category, group);
  }
  const selected: TriviaQuestion[] = [];
  const used = new Map<Category, number>();
  const usedAnswers = new Set<string>();
  const usedKnowledge = new Set<string>();
  while (selected.length < count) {
    const remaining = [...byCategory].map(([category, group]) => [category, group.filter(question => !usedKnowledge.has(question.knowledgeId))] as const).filter(([, group]) => group.length > 0);
    const unseen = remaining.flatMap(([, group]) => group).some(question => !recent.includes(question.knowledgeId));
    // Prefer all unseen knowledge before reviewing. If exhausted, revisit the
    // least recently seen fact rather than repeatedly favouring thin categories.
    const oldest = Math.max(...remaining.flatMap(([, group]) => group.map(question => recent.indexOf(question.knowledgeId))));
    const available = remaining.map(([category, group]) => [category, group.filter(question => unseen ? !recent.includes(question.knowledgeId) : recent.indexOf(question.knowledgeId) === oldest)] as const).filter(([, group]) => group.length > 0);
    const fresh = available.filter(([, group]) => group.some(question => !usedAnswers.has(question.answer)));
    const eligible = fresh.length > 0 ? fresh : available;
    const smallest = Math.min(...eligible.map(([category]) => used.get(category) ?? 0));
    const candidates = eligible.filter(([category]) => (used.get(category) ?? 0) === smallest);
    const [category, group] = candidates[Math.floor(random() * candidates.length)];
    const index = group.findLastIndex(question => !usedAnswers.has(question.answer));
    const [question] = group.splice(index < 0 ? group.length - 1 : index, 1);
    selected.push(question);
    usedKnowledge.add(question.knowledgeId);
    usedAnswers.add(question.answer);
    used.set(category, (used.get(category) ?? 0) + 1);
  }
  return withVariedFunFacts(selected.map(question => ({ ...question, review: recent.includes(question.knowledgeId), choices: shuffled(question.choices, random) })), random);
}
