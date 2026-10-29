import { EXPANDED_QUESTIONS } from './expandedQuestions.ts';
import { FRESH_QUESTIONS } from './freshQuestions.ts';
import { GAMEPLAY_QUESTIONS } from './gameplayQuestions.ts';
import { MARIO_SIDE_QUESTIONS } from './marioSideQuestions.ts';
import { FAMILY_QUESTIONS } from './familyQuestions.ts';
import { WORLD_QUESTIONS } from './worldQuestions.ts';
import { canonicalKnowledge, normalizeKnowledge } from './knowledge.ts';
import { withVariedFunFacts } from './funFacts.ts';
import { ADVENTURE_QUESTIONS } from './adventureQuestions.ts';
import { PLATFORM_QUESTIONS } from './platformQuestions.ts';
import { withCompletedOriginalReview } from './originalReview.ts';
import { withPlayfulFeedback } from './playfulFeedback.ts';

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
  funFactSourceUrl?: string;
  sourceUrl: string;
  sourceReview?: { checkedOn: string; status: 'source-checked'; gameVersion: string };
};

const SOURCES = {
  characters: 'https://www.nintendo.com/en-ca/explore/characters/mario/friends/',
  history: 'https://www.nintendo.com/us/explore/characters/mario/history/',
  kart: 'https://mariokart8deluxe.nintendo.com/',
  booster: 'https://en-americas-support.nintendo.com/app/answers/detail/a_id/57858/',
  world: 'https://www.nintendo.com/us/whatsnew/mario-kart-world-direct-revs-up-new-details-on-the-biggest-mario-kart-ever-coming-to-nintendo-switch-2-at-launch/',
  wave2: 'https://www.nintendo.com/us/whatsnew/mario-kart-8-deluxe-booster-course-pass-wave-2-approaches-the-starting-line-on-aug-4/',
  wiiRoutes: 'https://www.nintendo.com/en-za/Support/Legacy-system/Shave-seconds-off-your-time-in-Mario-Kart-Wii-613215.html',
  kart64: 'https://www.nintendo.com/en-za/Games/Nintendo-64/Mario-Kart-64-269558.html',
} as const;

type SourceId = keyof typeof SOURCES;
type Row = readonly [prompt: string, answer: string, wrong1: string, wrong2: string, wrong3: string, explanation: string, funFact: string, source: SourceId];

const marioExplorer: readonly Row[] = [
  ['Who is Mario’s brother?', 'Luigi', 'Wario', 'Toad', 'Bowser Jr.', "Luigi is Mario’s younger brother: taller, greener and just as ready for an adventure.", 'Compare their faces as well as their hats: Luigi and Mario have differently shaped moustaches.', 'characters'],
  ['Who is the princess of the Mushroom Kingdom?', 'Princess Peach', 'Rosalina', 'Daisy', 'Birdo', "Peach is the Mushroom Kingdom’s princess. Pink dress, crown, and plenty of adventures of her own!", 'Away from adventures and competitions, Peach enjoys cooking and baking.', 'characters'],
  ['Which character is King of the Koopas?', 'Bowser', 'Wario', 'Donkey Kong', 'Toad', "Bowser is the Koopa king: a fire-breathing powerhouse with an army of troublemakers.", 'The Koopa king is also a dad: Bowser Jr. is his son.', 'characters'],
  ['Who wears a green hat and shirt?', 'Luigi', 'Mario', 'Waluigi', 'Diddy Kong', "Green cap, green shirt: that’s Luigi. Mario usually wears red.", 'Their differences are not just colours: Luigi is taller and is known for jumping higher.', 'characters'],
  ['Which character travels with star-like Lumas?', 'Rosalina', 'Peach', 'Daisy', 'Toad', "Those little stars are Lumas. Rosalina travels through space with them as their adoptive mother.", 'Her calm, distant appearance hides a kind heart—Nintendo describes her as the Lumas’ adoptive mother.', 'characters'],
  ['Who wears a face covering with a fearsome mouth drawn on it?', 'Bowser Jr.', 'Shy Guy', 'Wario', 'Bowser', "That scary mouth is painted on Bowser Jr.’s face covering. His real mouth is hiding behind it!", 'Being smaller does not mean being weak: Junior has inherited strength from Bowser.', 'characters'],
  ['Which character is known for a yellow hat and purple overalls?', 'Wario', 'Mario', 'Luigi', 'Waluigi', "Yellow hat and purple overalls mean Wario. The zigzag moustache seals it.", 'Wario’s favourite things include garlic and making money—a rather different list from rescuing princesses.', 'characters'],
  ['Who is Wario’s pal and Luigi’s self-declared rival?', 'Waluigi', 'Bowser Jr.', 'Toad', 'Diddy Kong', "Waluigi teams up with Wario and calls himself Luigi’s rival. Nobody asked Luigi!", 'Those unusually long arms and legs are useful when he competes in sports.', 'characters'],
  ['Which character serves Princess Peach?', 'Toad', 'Bowser', 'Wario', 'Donkey Kong', "Toad is Peach’s loyal helper. He’ll brave danger to protect her kingdom.", 'Toad has red spots, but the wider group of Toads includes other colours. Not every Toad you meet is the same character.', 'characters'],
  ['Who is the princess of Sarasaland?', 'Daisy', 'Peach', 'Rosalina', 'Pauline', "Daisy is Sarasaland’s princess. Peach rules the Mushroom Kingdom.", 'Daisy’s flower theme is not just her name: look for flowers in her yellow outfit.', 'characters'],
];

const marioScientist: readonly Row[] = [
  ['Which console originally hosted Super Mario 64?', 'Nintendo 64', 'Wii', 'GameCube', 'Nintendo DS', "Super Mario 64 launched on Nintendo 64 in 1996. The number gives this one away!", 'Nintendo’s timeline puts it in 1996, six years before the next listed 3D adventure, Super Mario Sunshine.', 'history'],
  ['Which console did Super Mario Sunshine first appear on?', 'GameCube', 'Nintendo 64', 'Wii U', 'Game Boy', "Sunshine brought Mario to GameCube in 2002, armed with a water-spraying backpack.", 'The US timeline places Sunshine in 2002 and Galaxy in 2007: a five-year gap between the two adventures.', 'history'],
  ['Which console originally hosted Super Mario Galaxy?', 'Wii', 'Nintendo DS', 'Nintendo 3DS', 'Wii U', "Galaxy first blasted off on Wii in 2007. Its sequel stayed on Wii too.", 'Galaxy and Galaxy 2 both belong to the Wii era; the sequel did not need a new console generation.', 'history'],
  ['Which system did Super Mario Odyssey launch on?', 'Nintendo Switch', 'Wii U', 'Nintendo 3DS', 'GameCube', "Odyssey launched on Nintendo Switch in 2017, with Cappy joining Mario for the trip.", 'Odyssey appears in 2017 on Nintendo’s timeline—ten years after Super Mario Galaxy.', 'history'],
  ['Which handheld originally hosted Super Mario 3D Land?', 'Nintendo 3DS', 'Game Boy', 'Nintendo DS', 'Game Boy Advance', "3D Land is the 3DS game. 3D World began on Wii U—one word, different adventures.", 'The 3DS also had New Super Mario Bros. 2: not every Mario game on that handheld had ‘3D’ in its title.', 'history'],
  ['Which console did the first Super Mario Maker launch on?', 'Wii U', 'Wii', 'Nintendo Switch', 'Nintendo 64', "The first Mario Maker launched on Wii U in 2015. Maker 2 followed on Switch.", 'Nintendo’s timeline puts Maker in 2015, thirty years after the original Super Mario Bros.', 'history'],
  ['Which handheld originally hosted Super Mario Land?', 'Game Boy', 'Nintendo DS', 'Nintendo 3DS', 'Game Boy Advance', "Super Mario Land squeezed a new Mario adventure onto Game Boy in 1989.", 'Both Land and Land 2 appeared on Game Boy. The second adventure’s full name adds ‘6 Golden Coins’.', 'history'],
  ['Which console did Super Mario World first appear on?', 'Super Nintendo', 'Nintendo 64', 'GameCube', 'Wii', "Super Mario World began on Super Nintendo. It brought Yoshi along for the ride.", 'In Nintendo’s US timeline, World is from 1991 and Super Mario 64 from 1996: the names mark different console generations.', 'history'],
  ['Which system did Super Mario Bros. Wonder launch on?', 'Nintendo Switch', 'Wii U', 'Nintendo 3DS', 'Wii', "Wonder launched on Nintendo Switch in 2023, taking Mario and friends to the Flower Kingdom.", 'Wonder’s 2023 entry sits six years after Odyssey on Nintendo’s timeline—two very different Switch adventures.', 'history'],
  ['Which platform did Super Mario Run launch on?', 'Mobile', 'Nintendo 3DS', 'Game Boy', 'Wii U', "Super Mario Run was built for phones and tablets. Mario runs; your taps handle the jumps.", 'The US timeline places Run in 2016, between the first Mario Maker and Odyssey.', 'history'],
];

const marioProfessor: readonly Row[] = [
  ['Which of these games was released first?', 'Super Mario Sunshine', 'Super Mario Galaxy', 'Super Mario Galaxy 2', 'Super Mario Odyssey', "Sunshine wins this race through time: 2002, ahead of Galaxy (2007), Galaxy 2 (2010) and Odyssey (2017).", 'The first two answers in that sequence cross console generations: Sunshine is GameCube; Galaxy is Wii.', 'history'],
  ['Which title came directly after Super Mario 64 among these games on Nintendo’s timeline?', 'Super Mario Sunshine', 'Super Mario Odyssey', 'Super Mario Galaxy 2', 'Super Mario Bros. Wonder', "Sunshine is next among these choices: Mario 64 in 1996, then Sunshine in 2002.", 'That is a six-year gap, rather than a new adventure on the same machine the following year.', 'history'],
  ['Which 2013 game is listed for Wii U on Nintendo’s Mario timeline?', 'Super Mario 3D World', 'Super Mario 3D Land', 'Super Mario Galaxy', 'Super Mario Odyssey', "3D World is the 2013 Wii U adventure. The similarly named 3D Land is the earlier 3DS game.", 'The later Switch release has an extra name attached: Super Mario 3D World + Bowser’s Fury.', 'history'],
  ['Which game on Nintendo’s timeline arrived between Super Mario Galaxy and Super Mario Galaxy 2?', 'New Super Mario Bros. Wii', 'Super Mario 3D Land', 'Super Mario Maker', 'Super Mario Odyssey', "Galaxy (2007), New Super Mario Bros. Wii (2009), Galaxy 2 (2010): the 2D adventure sits between the space trips.", 'All three belong to Wii. Switching between their adventures did not require switching to a different console.', 'history'],
  ['Which two games on Nintendo’s timeline share the Game Boy?', 'Super Mario Land and Super Mario Land 2', 'Super Mario 64 and Sunshine', 'Super Mario Galaxy and Galaxy 2', 'Super Mario Maker and Maker 2', "Both Land games began on Game Boy. Land 2 adds “6 Golden Coins” to its title.", 'The first Land is listed in 1989 and 6 Golden Coins in 1992: a three-year gap.', 'history'],
  ['Which game is listed immediately before Super Mario Odyssey on Nintendo’s timeline?', 'Super Mario Run', 'Super Mario Maker 2', 'Super Mario Bros. Wonder', 'Super Mario Galaxy 2', "Run (2016) comes just before Odyssey (2017) on Nintendo’s timeline: a phone adventure, then a Switch one.", 'Those neighbouring entries jump from mobile devices to Nintendo Switch.', 'history'],
  ['Which character does Nintendo say can jump higher than Mario?', 'Luigi', 'Wario', 'Bowser', 'Toad', "Luigi can jump higher than Mario. Long legs come in handy!", 'Look at their silhouettes: Luigi is taller, and their moustaches have different shapes too.', 'characters'],
  ['Who does Nintendo describe as the adoptive mother of the Lumas?', 'Rosalina', 'Princess Peach', 'Daisy', 'Birdo', "Rosalina is the Lumas’ adoptive mother. That starry crowd is her family.", 'Rosalina may look distant, but Nintendo describes her as kind-hearted.', 'characters'],
  ['Which character is described by Nintendo as loving garlic?', 'Wario', 'Waluigi', 'Bowser', 'Donkey Kong', "Wario loves garlic—and money. His shopping list practically writes itself.", 'Wario and Mario go back a long way: Nintendo says they have known each other since they were babies.', 'characters'],
  ['Which Mario title is listed for Wii U before Super Mario Maker?', 'Super Mario 3D World', 'Super Mario Odyssey', 'Super Mario 3D Land', 'Super Mario Galaxy 2', "3D World arrived on Wii U in 2013; Mario Maker followed in 2015.", 'The two-year gap separates a ready-made Mario adventure from a game about building courses yourself.', 'history'],
];

const kartExplorer: readonly Row[] = [
  ['Which course debuted in Mario Kart World rather than returning from an older game?', 'Boo Cinema', 'Coconut Mall', 'Waluigi Pinball', 'Peach Gardens', "Boo Cinema debuted in Mario Kart World. The other three courses were returning favourites.", 'World does not keep every course isolated: roads connect its racing locations into a bigger setting.', 'world'],
  ['Which Mario Kart World course is described as snowy?', 'Starview Peak', 'Crown City', 'Boo Cinema', 'Mario Bros. Circuit', "Snowy slopes point to Starview Peak. Crown City swaps the mountain scenery for busy streets.", 'World’s scenery can change with weather and the day/night cycle, not just when you select a different course.', 'world'],
  ['Which Mario Kart World course is set among modern city streets?', 'Crown City', 'Starview Peak', 'Boo Cinema', 'Mario Bros. Circuit', "Crown City is the urban race: streets and buildings instead of snow or cinema screens.", 'In the Mushroom Cup, the journey towards Crown City is part of racing from one location to the next.', 'world'],
  ['Which Mario Kart World mode lets you explore without entering a race?', 'Free Roam', 'Grand Prix', 'Time Trials', 'Knockout Tour', "Free Roam lets you pick a direction and explore. No finishing position to defend!", 'P Switches turn exploration into driving challenges, so a relaxed drive can still teach you a new trick.', 'world'],
  ['Which Mario Kart World mode eliminates racers at checkpoints?', 'Knockout Tour', 'Free Roam', 'Time Trials', 'Balloon Battle', "Knockout Tour eliminates stragglers at checkpoints. Beat the cutoff or your race ends early.", 'It can begin with 24 racers, so surviving the early traffic is part of the challenge.', 'world'],
  ['What happens to rivals hit by an Ice Flower in Mario Kart World?', 'They spin after being chilled', 'They shrink and slow down', 'Their view is covered in ink', 'They change into another racer', "An Ice Flower chills rivals and sends them spinning. A slippery way to interrupt an overtake!", 'World’s Mega Mushroom threatens rivals another way: it makes its user large enough to squash them.', 'world'],
  ['In Mario Kart Wii, which course has escalators whose direction you need to watch?', 'Coconut Mall', 'Maple Treeway', 'Mushroom Gorge', 'Koopa Cape', "Pick the escalator moving your way. Fight the steps and Coconut Mall fights back.", 'Nintendo’s Wii route tip points to a time-saving path on the right after the first escalator.', 'wiiRoutes'],
  ['Which Mario Kart 8 Deluxe course launches racers into a giant arcade table with flashing lights?', 'Waluigi Pinball', 'Ribbon Road', 'Music Park', 'Electrodrome', "Waluigi Pinball fires your kart into a giant arcade table. You’re racing inside the game!", 'It started on Nintendo DS before returning in Mario Kart 8 Deluxe’s Booster Course Pass.', 'wave2'],
  ['Which Mario Kart 64 course makes racers dodge bouncing boulders?', 'Choco Mountain', 'Toad’s Turnpike', 'Moo Moo Farm', 'Koopa Troopa Beach', "Choco Mountain drops bouncing boulders into your path. Watch the road ahead, not just the next kart.", 'In the original Mario Kart 64, this rocky route belongs to the Flower Cup.', 'kart64'],
  ['Which mode in Mario Kart World lets you race against the clock?', 'Time Trials', 'Free Roam', 'Balloon Battle', 'Coin Runners', "Time Trials makes the stopwatch your rival. Every cleaner corner can beat your best.", 'World lets you compare your driving with online ghosts: recordings give you another route to study.', 'world'],
];

const kartScientist: readonly Row[] = [
  ['In Mario Kart 8 Deluxe, which cup contains Wii Coconut Mall?', 'Golden Dash Cup', 'Lucky Cat Cup', 'Turnip Cup', 'Moon Cup', "Coconut Mall is race four in Golden Dash Cup—the shopping trip is the finale.", 'The cup begins with Paris Promenade: its opening and closing races come from different Mario Kart origins.', 'booster'],
  ['In Mario Kart 8 Deluxe, which cup contains DS Waluigi Pinball?', 'Turnip Cup', 'Propeller Cup', 'Fruit Cup', 'Rock Cup', "Waluigi Pinball closes Turnip Cup. Save your arcade skills for race four.", 'Kalimari Desert is in the same cup—an older N64 course beside a DS favourite.', 'booster'],
  ['In Mario Kart 8 Deluxe, which cup contains Wii Maple Treeway?', 'Rock Cup', 'Moon Cup', 'Fruit Cup', 'Spiny Cup', "Maple Treeway finishes Rock Cup. The trophy is a rock; the final track is up in the trees.", 'The Rock Cup and Moon Cup arrived together in the same Booster Course Pass wave.', 'booster'],
  ['In Mario Kart 8 Deluxe, which cup contains GCN Daisy Cruiser?', 'Feather Cup', 'Cherry Cup', 'Bell Cup', 'Acorn Cup', "Daisy Cruiser is Feather Cup’s second race. All aboard after Athens Drift!", 'Feather and Cherry were released together; they are two separate cups from the same wave.', 'booster'],
  ['In Mario Kart 8 Deluxe, which cup contains Tour Tokyo Blur?', 'Lucky Cat Cup', 'Golden Dash Cup', 'Turnip Cup', 'Propeller Cup', "Tokyo Blur opens Lucky Cat Cup, before Shroom Ridge, Sky Garden and Ninja Hideaway.", 'That opening sequence mixes a Tour course with tracks returning from older console games.', 'booster'],
  ['In Mario Kart 8 Deluxe, which cup contains Wii Rainbow Road?', 'Spiny Cup', 'Acorn Cup', 'Moon Cup', 'Feather Cup', "Wii Rainbow Road closes Spiny Cup—and the entire Booster Course Pass.", 'The Spiny Cup arrived in Wave 6, the last Booster Course Pass release.', 'booster'],
  ['In Mario Kart 8 Deluxe, which cup contains DS Peach Gardens?', 'Moon Cup', 'Rock Cup', 'Lucky Cat Cup', 'Fruit Cup', "Peach Gardens is Moon Cup’s second race, between Berlin Byways and Merry Mountain.", 'The Moon Cup saves 3DS Rainbow Road for last—not the Wii version found in Spiny Cup.', 'booster'],
  ['In Mario Kart 8 Deluxe, which cup contains GBA Riverside Park?', 'Fruit Cup', 'Boomerang Cup', 'Turnip Cup', 'Propeller Cup', "Riverside Park is Fruit Cup’s second race, after Amsterdam Drift and before DK Summit.", 'Yoshi’s Island closes the cup, giving you a useful final stop to remember.', 'booster'],
  ['In Mario Kart 8 Deluxe, which cup contains Tour Singapore Speedway?', 'Boomerang Cup', 'Fruit Cup', 'Cherry Cup', 'Lucky Cat Cup', "Singapore Speedway closes Boomerang Cup. Bangkok Rush starts the four-race trip.", 'Remembering the two city courses as bookends helps you separate this cup from the others.', 'booster'],
  ['Which Mario Kart World move lets you reach rails and ride on walls?', 'Charge Jump', 'Smart Steering', 'Auto-Accelerate', 'Rewind', "Charge Jump takes your kart off the road and onto rails or walls. Line up the landing!", 'Linking wall rides can reveal routes you would miss by keeping all four wheels on the road.', 'world'],
];

const kartProfessor: readonly Row[] = [
  ['Which course ends the Spiny Cup in Mario Kart 8 Deluxe?', 'Wii Rainbow Road', 'SNES Bowser Castle 3', 'Tour Madrid Drive', '3DS Rosalina’s Ice World', "Wii Rainbow Road closes Spiny Cup—and the entire Booster Course Pass.", 'Two different consoles’ icy and rainbow courses share this cup: 3DS Rosalina’s Ice World and Wii Rainbow Road.', 'booster'],
  ['Which course opens the Acorn Cup in Mario Kart 8 Deluxe?', 'Tour Rome Avanti', 'GCN DK Mountain', 'Wii Daisy Circuit', 'Piranha Plant Cove', "Rome Avanti opens Acorn Cup. DK Mountain comes next.", 'Acorn and Spiny were the final two Booster Course Pass cups, released together in Wave 6.', 'booster'],
  ['Which course follows GCN Daisy Cruiser in the Mario Kart 8 Deluxe Feather Cup?', 'Wii Moonview Highway', 'Squeaky Clean Sprint', 'Tour Athens Drift', 'Wii Koopa Cape', "Moonview Highway follows Daisy Cruiser in Feather Cup. From a ship to a traffic-filled road!", 'That final Squeaky Clean Sprint race is a useful way to tell Feather Cup apart from Cherry Cup.', 'booster'],
  ['Which course closes the Mario Kart 8 Deluxe Fruit Cup?', 'Yoshi’s Island', 'Wii DK Summit', 'GBA Riverside Park', 'Tour Amsterdam Drift', "Yoshi’s Island finishes Fruit Cup. The colourful island is your fourth stop.", 'The cup begins in a city and ends in Yoshi’s world: its name is not a description of every course.', 'booster'],
  ['Which cup has Tour London Loop in Mario Kart 8 Deluxe?', 'Rock Cup', 'Moon Cup', 'Fruit Cup', 'Feather Cup', "London Loop opens Rock Cup. Boo Lake, Rock Rock Mountain and Maple Treeway follow.", 'Boo Lake is another Rock Cup race, so the same cup includes a city, a haunted lake and a woodland route.', 'booster'],
  ['Which course comes just before 3DS Rainbow Road in the Mario Kart 8 Deluxe Moon Cup?', 'Merry Mountain', 'DS Peach Gardens', 'Tour Berlin Byways', 'Wii Maple Treeway', "Merry Mountain comes just before 3DS Rainbow Road in Moon Cup. Snowy slopes, then outer space!", 'Berlin Byways starts the Moon Cup: the four races have very different settings despite sharing one trophy.', 'booster'],
  ['Which Booster Course Pass wave added the Spiny Cup?', 'Wave 6', 'Wave 3', 'Wave 4', 'Wave 5', "Spiny Cup arrived in Wave 6, the last Booster Course Pass release.", 'The same wave added Acorn Cup, so the pass finished with two more four-course lineups.', 'booster'],
  ['In Mario Kart World, what is the maximum field in a Grand Prix race?', '24 racers', '12 racers', '16 racers', '20 racers', 'World Grand Prix supports a field of 24 racers. That is a crowded fight for road space, not just a head-to-head race.', 'Knockout Tour can also start with 24, but checkpoint cutoffs make that field shrink during the journey.', 'world'],
  ['In Mario Kart World Grand Prix, what links one course to the next?', 'Driveable roads', 'A loading-only menu', 'A teleporting pipe', 'A ferry ride', 'Driveable roads join the courses. The connection can be part of the race, rather than only a menu break before another starting line.', 'The Mushroom Cup begins at Mario Bros. Circuit, then sends you towards Crown City.', 'world'],
  ['In Mario Kart World, what happens when you use Rewind?', 'Your vehicle returns while rivals keep moving', 'Every racer moves backward together', 'The whole race restarts', 'The timer pauses for everyone', 'Rewind takes your vehicle back, not everyone else’s. Correcting a mistake can still cost places because rivals keep racing.', 'Free Roam is a useful place to retry a missed move with Rewind without chasing a race position.', 'world'],
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
    sourceReview: source === 'wave2' ? { checkedOn: '2026-10-11', status: 'source-checked' as const, gameVersion: 'Mario Kart 8 Deluxe — DS Waluigi Pinball' } : source === 'history' ? { checkedOn: '2026-10-04', status: 'source-checked' as const, gameVersion: 'Nintendo’s US Mario release timeline' } : topic === 'mario' && difficulty === 'explorer'
      ? { checkedOn: '2026-10-04', status: 'source-checked' as const, gameVersion: 'Super Mario series — Nintendo character guide' }
      : undefined,
  }));
}

// These edited records now ask a different fact; do not migrate their old history.
const KNOWLEDGE_EQUIVALENTS: Readonly<Record<string, string>> = {
  'mario-explorer-6': 'mario-explorer-6-v2',
  'mario-explorer-10': 'expanded-14',
  'kart-explorer-8': 'kart-explorer-8-v2',
  'kart-explorer-1': 'kart-explorer-1-v2',
  'kart-explorer-7': 'kart-explorer-7-v2',
  'kart-explorer-9': 'kart-explorer-9-v2',
};
// Difficulty is about game knowledge, not obscure cup recall. Keep IDs stable
// so reclassification does not reset a player's history or matching links.
const LEVEL_REVIEW: Readonly<Record<string, Difficulty>> = {
  'kart-scientist-1': 'professor', 'kart-scientist-2': 'professor',
  'kart-scientist-3': 'professor', 'kart-scientist-4': 'professor',
  'kart-professor-8': 'scientist', 'kart-professor-9': 'scientist',
  'kart-professor-10': 'scientist', 'fresh-31': 'scientist',
  'mario-professor-7': 'scientist', 'mario-professor-8': 'explorer',
  'mario-professor-9': 'scientist', 'expanded-21': 'explorer',
  'expanded-18': 'explorer', 'expanded-11': 'explorer',
  'expanded-22': 'scientist',
};
export const QUESTIONS: readonly TriviaQuestion[] = [
  {
    id: 'goomba-jump', knowledgeId: 'goomba-jump', topic: 'mario', difficulty: 'explorer', category: 'baddies',
    prompt: 'Which mushroom-shaped member of Bowser’s army can usually be defeated by jumping on it?',
    choices: ['Goomba', 'Boo', 'Blooper', 'Bullet Bill'], answer: 'Goomba',
    explanation: "Aim for the top! A stomp usually flattens a Goomba; running into its side hurts Mario.",
    funFact: 'These little mushroom-shaped enemies serve Bowser. An ordinary-looking opponent can still punish a badly timed landing.',
    sourceUrl: 'https://play.nintendo.com/themes/friends/goomba/',
    sourceReview: { checkedOn: '2026-10-14', status: 'source-checked', gameVersion: 'Super Mario series — Nintendo Goomba character guide' },
  } satisfies TriviaQuestion,
  ...createRows('mario', 'explorer', marioExplorer, ['characters','characters','baddies','characters','characters','baddies','characters','characters','characters','characters']),
  ...createRows('mario', 'scientist', marioScientist, ['consoles','consoles','consoles','consoles','consoles','consoles','consoles','consoles','consoles','consoles']),
  ...createRows('mario', 'professor', marioProfessor, ['games','games','games','games','consoles','games','characters','characters','characters','games']),
  ...createRows('kart', 'explorer', kartExplorer, ['tracks','tracks','tracks','games','games','power-ups','tracks','tracks','tracks','games']),
  ...createRows('kart', 'scientist', kartScientist, ['tracks','tracks','tracks','tracks','tracks','tracks','tracks','tracks','tracks','games']),
  ...createRows('kart', 'professor', kartProfessor, ['tracks','tracks','tracks','tracks','tracks','tracks','tracks','games','games','games']),
  ...EXPANDED_QUESTIONS,
  ...FRESH_QUESTIONS,
  ...GAMEPLAY_QUESTIONS,
  ...MARIO_SIDE_QUESTIONS,
  ...FAMILY_QUESTIONS,
  ...WORLD_QUESTIONS,
  ...ADVENTURE_QUESTIONS,
  ...PLATFORM_QUESTIONS,
].map(question => withVariedFunFacts([withPlayfulFeedback(withCompletedOriginalReview({ ...question, difficulty: LEVEL_REVIEW[question.id] ?? question.difficulty, knowledgeId: canonicalKnowledge(KNOWLEDGE_EQUIVALENTS[question.id] ?? question.knowledgeId) }))], () => 0)[0]);

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
  return withVariedFunFacts(selected.map(question => ({ ...question, review: recent.includes(question.knowledgeId), choices: shuffled(question.choices, random) })), random, recent);
}
