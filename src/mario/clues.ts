import type { Topic } from './questions.ts';
import { WORLD_COURSES } from './worldTracks.ts';
import { ITEM_CLUES } from './itemClues.ts';
import { ADVENTURE_CLUES, ODYSSEY_PLACES } from './adventureClues.ts';

export type ClueSubject = {
  id: string;
  topic: Topic;
  answer: string;
  clues: readonly [string, string, string, string, string];
  explanation: string;
  funFact: string;
  funFactSourceUrl?: string;
  sourceUrl: string;
  kind?: 'item' | 'place';
  game?: string;
};

const characters = 'https://www.nintendo.com/en-ca/explore/characters/mario/friends/';
const courses = 'https://en-americas-support.nintendo.com/app/answers/detail/a_id/57858/';
const friends = 'https://www.nintendo.com/en-ca/explore/characters/mario/friends/';
const wave3 = 'https://www.nintendo.com/us/whatsnew/mario-kart-8-deluxe-booster-course-pass-wave-3-brings-merry-mountain-mayhem-with-eight-additional-courses-on-dec-7/';
const wave2 = 'https://www.nintendo.com/us/whatsnew/mario-kart-8-deluxe-booster-course-pass-wave-2-approaches-the-starting-line-on-aug-4/';
const coconutTips = 'https://www.nintendo.com/en-za/Support/Legacy-system/Shave-seconds-off-your-time-in-Mario-Kart-Wii-613215.html';
const ninjaTour = 'https://www.nintendo.com/us/whatsnew/race-under-the-cover-of-darkness-in-new-course-ninja-hideaway/';
const oceanTour = 'https://www.nintendo.com/us/whatsnew/mobilenews-enjoy-maritime-mayhem-aboard-gcn-daisy-cruiser-in-the-ocean-tour/';
const explorationTour = 'https://www.nintendo.com/us/whatsnew/mobilenews-discover-the-all-new-course-piranha-plant-cove-with-the-exploration-tour/';

// Editorial similarity groups, not extra facts shown to players. Prefer related
// alternatives so a broad opening clue does not leave one obvious candidate.
export const CLUE_CHOICE_GROUPS: readonly (readonly string[])[] = [
  ADVENTURE_CLUES.filter(subject => subject.kind === 'item').map(subject => subject.id),
  [...ADVENTURE_CLUES.filter(subject => !subject.kind).map(subject => subject.id), 'char-goomba', 'char-boo', 'char-bowser'],
  ODYSSEY_PLACES.map(subject => subject.id),
  ITEM_CLUES.map(item => item.id),
  WORLD_COURSES.map(course => course.id),
  ['world-boo', 'world-spaceport', 'world-crown', 'track-coconut', 'track-waluigi'],
  ['world-acorn', 'world-dandelion', 'world-jungle', 'track-maple', 'track-gardens'],
  ['world-salty', 'world-falls', 'track-piranha', 'track-daisy', 'track-boo-lake'],
  ['world-starview', 'world-ruins', 'world-spaceport', 'track-rock', 'track-merry'],
  ['char-toad', 'char-cappy', 'char-mario', 'char-luigi', 'char-yoshi'],
  ['char-diddy', 'char-dk', 'char-mario', 'char-yoshi'],
  ['char-goomba', 'char-boo', 'char-bowser', 'char-junior'],
  ['char-mario', 'char-luigi', 'char-wario', 'char-waluigi'], // caps/overalls
  ['char-peach', 'char-daisy', 'char-rosalina'], // princess characters
  ['char-bowser', 'char-junior', 'char-dk', 'char-wario'], // powerful rivals
  ['char-bowser', 'char-junior', 'char-wario', 'char-waluigi', 'char-boo'], // troublemakers
  ['char-mario', 'char-luigi', 'char-yoshi', 'char-peach', 'char-rosalina'], // adventuring allies
  ['track-coconut', 'track-maple', 'track-daisy'], // home-console origins
  ['track-waluigi', 'track-gardens', 'track-boo-lake', 'track-rock'], // handheld origins
  ['track-rome', 'track-ninja', 'track-piranha', 'track-merry'], // mobile origins
  ['track-maple', 'track-gardens', 'track-merry', 'track-rock', 'track-boo-lake'], // outdoor scenery
  ['track-coconut', 'track-waluigi', 'track-daisy', 'track-ninja'], // built environments
  ['track-sundae', 'track-waluigi', 'track-merry'], // outsized/playful settings
];

export function clueSimilarity(subjectId: string, candidateId: string): number {
  return CLUE_CHOICE_GROUPS.filter(group => group.includes(subjectId) && group.includes(candidateId)).length;
}

// Clues move from shared traits to distinctive details. The first two must not
// contain words from the answer, so a multiple-choice label cannot give them away.
export const CLUE_SUBJECTS: readonly ClueSubject[] = [
  ...ADVENTURE_CLUES, ...ODYSSEY_PLACES,
  ...ITEM_CLUES,
  ...WORLD_COURSES.map(course => ({ id: course.id, topic: 'kart' as const, answer: course.title,
    game: course.game, clues: course.clues, explanation: course.explanation, funFact: course.funFact, sourceUrl: course.sourceUrl })),
  {
    id: 'char-toad', topic: 'mario', answer: 'Toad',
    clues: ['Helping others can put me in danger.', 'I stand by friends when trouble arrives.', 'I serve a princess.', 'Others of my kind come in several colours.', 'The red spots on my head are a familiar sight beside Peach.'],
    explanation: "Red spots and a job helping Peach identify Toad. Other Toads come in different colours.",
    funFact: "Toad is the fast runner in 3D World. The smallest-looking teammate can be the one racing ahead.", funFactSourceUrl: "https://play.nintendo.com/news-tips/tips-tricks/tips-tricks-super-mario-3d-world-bowsers-fury/", sourceUrl: characters,
  },
  {
    id: 'char-diddy', topic: 'mario', answer: 'Diddy Kong',
    clues: ['Speed helps me support my friends.', 'I make up for size with agility.', 'I help protect a supply of bananas.', 'My red shirt has yellow stars.', 'I am Donkey Kong’s smaller partner in a red cap.'],
    explanation: "Diddy is Donkey Kong’s speedy partner: red cap, starred shirt and plenty of agility.",
    funFact: "In Donkey Kong Country Returns, Diddy’s Peanut Popgun fires peanuts and his Barrel Jet helps him hover. Small Kong, serious equipment.", funFactSourceUrl: "https://www.mariowiki.com/Diddy_Kong", sourceUrl: characters,
  },
  {
    id: 'char-cappy', topic: 'mario', answer: 'Cappy',
    clues: ['Helping a hero is my role.', 'I bring abilities that my partner lacks.', 'Objects as well as enemies respond to my power.', 'My home is the Cap Kingdom.', 'I am the hat-shaped partner who gives Mario his Capture ability.'],
    explanation: "Cappy is Mario’s hat-shaped partner. Capture lets Mario borrow the abilities of creatures and objects.",
    funFact: "Odyssey lets Cappy capture a T-Rex as well as tiny Goombas. One hat fits an astonishing range of heads.", funFactSourceUrl: "https://www.nintendo.com/en-gb/News/2017/November/10-awesome-things-to-Capture-in-Super-Mario-Odyssey-1314655.html", sourceUrl: 'https://play.nintendo.com/themes/friends/cappy/',
  },
  {
    id: 'char-goomba', topic: 'mario', answer: 'Goomba',
    clues: ['I am not the most fearsome foe.', 'I belong to a much larger force.', 'That force works for the Koopa king.', 'A well-timed landing can defeat me.', 'I am the familiar mushroom-shaped enemy usually beaten with a jump.'],
    explanation: "A stomp usually flattens a Goomba. Aim for its top, not its side!",
    funFact: "In Odyssey, captured Goombas can stack into a tower. A pile of tiny enemies becomes a way to reach higher places.", funFactSourceUrl: "https://www.nintendo.com/en-gb/News/2017/November/10-awesome-things-to-Capture-in-Super-Mario-Odyssey-1314655.html", sourceUrl: 'https://play.nintendo.com/themes/friends/goomba/',
  },
  {
    id: 'char-mario', topic: 'mario', answer: 'Mario',
    clues: ['Helping friends keeps me busy.', 'Jumping is one of my strengths.', 'I wear overalls and a cap.', 'My cap is red and my overalls are blue.', 'My brother is Luigi.'],
    explanation: "Red cap, blue overalls, brother called Luigi: it has to be Mario.",
    funFact: "Mario’s hat saved his designers from animating hair. His moustache helped make a face readable in a tiny sprite.", funFactSourceUrl: "https://iwataasks.nintendo.com/interviews/wii/nsmb/0/1/", sourceUrl: characters,
  },
  {
    id: 'char-luigi', topic: 'mario', answer: 'Luigi',
    clues: ['I can be cautious, but I still help others.', 'I share adventures with someone in my family.', 'Ghosts can make me nervous.', 'I dress in green and can jump high.', 'My brother is Mario.'],
    explanation: "Green clothes and high jumps point to Luigi. Ghosts scare him, but he still shows up.",
    funFact: "In Luigi’s Mansion 3, Gooigi can slip through bars and cross spikes. Water is his weakness: the green helper dissolves!", funFactSourceUrl: "https://www.mariowiki.com/Gooigi", sourceUrl: characters,
  },
  {
    id: 'char-peach', topic: 'mario', answer: 'Princess Peach',
    clues: ['I like both sport and cooking.', 'I want people to live happily together.', 'I look after a kingdom.', 'I often wear pink.', 'I am the princess of the Mushroom Kingdom.'],
    explanation: "Peach is the Mushroom Kingdom’s princess. Pink clothes are the clue; the kingdom settles it.",
    funFact: "In 3D World, Peach can float briefly without a power-up. Try her when a narrow landing keeps catching you out.", funFactSourceUrl: "https://play.nintendo.com/news-tips/tips-tricks/tips-tricks-super-mario-3d-world-bowsers-fury/", sourceUrl: characters,
  },
  {
    id: 'char-yoshi', topic: 'mario', answer: 'Yoshi',
    clues: ['A friend can depend on me for help.', 'Fruit is on my menu.', 'Members of my kind come in several colours.', 'I use my long tongue to turn food and enemies into eggs.', 'I am the egg-making friend whose name begins with Y.'],
    explanation: "Long tongue, enormous appetite, throwable eggs: that’s Yoshi’s recipe for an adventure.",
    funFact: "In Super Mario World, a blue shell gives Yoshi wings while he holds it in his mouth. Don’t swallow your flight plan!", funFactSourceUrl: "https://www.mariowiki.com/Shell", sourceUrl: characters,
  },
  {
    id: 'char-bowser', topic: 'mario', answer: 'Bowser',
    clues: ['My plans do not always work out.', 'Strength helps me challenge my rivals.', 'Many familiar enemies work for me.', 'I am strong and can breathe fire.', 'I am King of the Koopas.'],
    explanation: "Bowser is the fire-breathing Koopa king. His army supplies plenty of backup.",
    funFact: "Let Fury Bowser blast stubborn blocks: his attacks can uncover secrets for you. Free demolition, slightly dangerous contractor.", funFactSourceUrl: "https://play.nintendo.com/news-tips/tips-tricks/tips-tricks-super-mario-3d-world-bowsers-fury/", sourceUrl: characters,
  },
  {
    id: 'char-daisy', topic: 'mario', answer: 'Daisy',
    clues: ['I bring plenty of energy to a competition.', 'Sport is something I enjoy with friends.', 'I often wear yellow.', 'Flowers decorate my outfit.', 'I am the princess of Sarasaland.'],
    explanation: "Sarasaland’s princess is Daisy. Look for yellow clothes and flower accessories.",
    funFact: "Daisy’s first rescue was in Super Mario Land, where Mario faced the alien Tatanga rather than Bowser.", funFactSourceUrl: "https://www.mariowiki.com/Super_Mario_Land", sourceUrl: characters,
  },
  {
    id: 'char-wario', topic: 'mario', answer: 'Wario',
    clues: ['Small problems do not worry me much.', 'I have known another racer since we were young.', 'I like garlic almost as much as money.', 'I wear purple overalls and a yellow hat.', 'I call myself Mario\'s rival and have a zigzag moustache.'],
    explanation: "Garlic, money and a yellow hat identify Wario. He has appointed himself Mario’s rival.",
    funFact: "Land 2 introduced Wario as the villain who stole Mario’s castle. Mario was rescuing his own home this time.", funFactSourceUrl: "https://www.mariowiki.com/Super_Mario_Land_2:_6_Golden_Coins", sourceUrl: characters,
  },
  {
    id: 'char-rosalina', topic: 'mario', answer: 'Rosalina',
    clues: ['There is more kindness in me than you might first guess.', 'Looking after my family matters to me.', 'My home is far from the usual kingdom.', 'I travel through space with small star-like creatures.', 'Those creatures are the Lumas, and I am their adoptive mother.'],
    explanation: "Rosalina travels with the Lumas as their adoptive mother. Those stars are family.",
    funFact: "Hungry Lumas in Galaxy gobble Star Bits, then transform. Feeding one can open a whole new place to explore.", funFactSourceUrl: "https://www.mariowiki.com/Hungry_Luma", sourceUrl: characters,
  },

  {
    id: 'track-coconut', topic: 'kart', answer: 'Coconut Mall',
    clues: ['Choosing your route matters here.', 'Some of the surfaces carrying racers move too.', 'I first appeared on Wii.', 'My escalators lead racers between floors.', 'My name combines a tropical fruit with a shopping centre.'],
    explanation: "Coconut Mall’s escalators carry racers between floors. Choose one moving your way.",
    funFact: "In Mario Kart Wii’s Coconut Mall, a Mushroom lets you cut through an open shop. Shopping can be a shortcut!", funFactSourceUrl: "https://www.nintendo.com/en-za/Support/Legacy-system/Shave-seconds-off-your-time-in-Mario-Kart-Wii-613215.html", sourceUrl: coconutTips,
  },
  {
    id: 'track-waluigi', topic: 'kart', answer: 'Waluigi Pinball',
    clues: ['I turn indoor entertainment into a racetrack.', 'Lights and sound effects surround the racing line.', 'My first version was on Nintendo DS.', 'I finish the Turnip Cup.', 'My name pairs Luigi\'s purple-clad rival with a bouncing arcade game.'],
    explanation: "Waluigi Pinball puts the race inside a giant pinball table. It began on Nintendo DS.",
    funFact: "Mario Kart DS has boss fights! Finish a set of Mission Mode challenges to face enemies such as Big Bully or King Boo.", funFactSourceUrl: "https://www.mariowiki.com/Mario_Kart_DS", sourceUrl: wave2,
  },
  {
    id: 'track-maple', topic: 'kart', answer: 'Maple Treeway',
    clues: ['I take racers into a landscape filled with plants.', 'The season gives my scenery warm colours.', 'Huge trees form part of the route.', 'Watch out for the large Wigglers.', 'My name pairs an autumn tree with a route through it.'],
    explanation: "Maple Treeway races through enormous autumn trees. The wandering Wigglers make the woodland less peaceful.",
    funFact: "In Mario Kart Wii, Maple Treeway’s leaf piles can hide Mushrooms or Bananas. One pile might help; the next might spin you out.", funFactSourceUrl: "https://www.mariowiki.com/Maple_Treeway", sourceUrl: wave3,
  },
  {
    id: 'track-rome', topic: 'kart', answer: 'Rome Avanti',
    clues: ['My racing history began on a phone.', 'I arrived in the final wave of the Booster Course Pass.', 'The place in my name is a real city.', 'I open the Acorn Cup.', 'That city is Italy\'s capital.'],
    explanation: "Rome Avanti brings Italy’s capital to the starting grid. It opens Acorn Cup.",
    funFact: "Rome Avanti takes you inside the Colosseum. In Mario Kart, sightseeing includes dodging Chain Chomps in an ancient arena.", funFactSourceUrl: "https://www.mariowiki.com/Rome_Avanti", sourceUrl: courses,
  },
  {
    id: 'track-daisy', topic: 'kart', answer: 'Daisy Cruiser',
    clues: ['Water surrounds the setting for this race.', 'I began on a home console, before returning on phones and Switch.', 'My first console was the GameCube.', 'Racers drive aboard a ship rather than along a seaside road.', 'My name combines a yellow-clad princess with a ship.'],
    explanation: "Daisy Cruiser takes the race aboard a ship. Its original voyage was on GameCube.",
    funFact: "Double Dash puts two characters in one kart: one drives, one handles items. In co-op, two players can share that same vehicle.", funFactSourceUrl: "https://www.mariowiki.com/Mario_Kart:_Double_Dash!!", sourceUrl: oceanTour,
  },
  {
    id: 'track-ninja', topic: 'kart', answer: 'Ninja Hideaway',
    clues: ['Darkness is part of my atmosphere.', 'My first race took place in a phone game.', 'Moonlight lights the route through my setting.', 'I finish the Lucky Cat Cup.', 'My name suggests a secret place for a stealthy warrior.'],
    explanation: "Ninja Hideaway is the moonlit manor at the end of Lucky Cat Cup. Its racing debut was in Tour.",
    funFact: "Ninja Hideaway’s ninja Shy Guys can vanish into Bananas in 8 Deluxe. Watch what they leave behind as well as where they stand.", funFactSourceUrl: "https://www.mariowiki.com/Ninja_Hideaway", sourceUrl: ninjaTour,
  },
  {
    id: 'track-sundae', topic: 'kart', answer: 'Sky-High Sundae',
    clues: ['Everyday things look enormous around my racers.', 'I made my series debut in the second Booster Course Pass wave.', 'The oversized scenery includes sweet treats.', 'I finish the Propeller Cup.', 'My name sounds like a dessert served high above the ground.'],
    explanation: "Giant desserts identify Sky-High Sundae. It debuted in 8 Deluxe’s second DLC wave.",
    funFact: "Sky-High Sundae’s railings give Spin Boosts when you drive through them. Here, brushing the rail can actually help.", funFactSourceUrl: "https://www.mariowiki.com/Sky-High_Sundae", sourceUrl: wave2,
  },
  {
    id: 'track-piranha', topic: 'kart', answer: 'Piranha Plant Cove',
    clues: ['Water is an important part of my setting.', 'Some of my structures have seen better days.', 'My island has temples beneath the water.', 'I close the Acorn Cup.', 'My name combines a toothy plant with a sheltered stretch of water.'],
    explanation: "Piranha Plant Cove explores a sinking island and underwater temples. Bring a kart, not walking boots.",
    funFact: "A giant Maw-Ray swims ahead as Piranha Plant Cove changes route. Follow the race into the cave, but give the enormous eel some space.", funFactSourceUrl: "https://www.mariowiki.com/Piranha_Plant_Cove", sourceUrl: explorationTour,
  },
  {
    id: 'char-waluigi', topic: 'mario', answer: 'Waluigi',
    clues: ['I enjoy competing against familiar heroes.', 'I put effort into annoying my opponents.', 'My long limbs help in sports.', 'I often team up with Wario.', 'I call myself Luigi’s rival.'],
    explanation: "Waluigi is Wario’s partner and Luigi’s self-declared rival. Purple clothes, very long limbs.",
    funFact: "Waluigi made his debut in Mario Tennis on Nintendo 64. His career began with a racket, not a platform adventure.", funFactSourceUrl: "https://www.mariowiki.com/Waluigi", sourceUrl: friends,
  },
  {
    id: 'char-junior', topic: 'mario', answer: 'Bowser Jr.',
    clues: ['I cause trouble for the heroes.', 'Strength runs in my family.', 'I am small but powerful.', 'My mask has a mouth drawn on it.', 'My father is the Koopa king.'],
    explanation: "Bowser Jr. is the Koopa king’s son. The scary mouth is drawn on his face covering.",
    funFact: "Bowser Jr. helps Mario in Bowser’s Fury. Even Junior needs backup when his dad turns into a rampaging giant.", funFactSourceUrl: "https://www.nintendo.com/sg/switch/auzp/furyworld/index.html", sourceUrl: friends,
  },
  {
    id: 'char-dk', topic: 'mario', answer: 'Donkey Kong',
    clues: ['I have plenty of strength.', 'I keep food at home.', 'I can throw huge barrels.', 'My red tie carries my initials.', 'I hoard bananas in a treehouse.'],
    explanation: "DK on a red tie identifies Donkey Kong. He has the strength to back up those barrel throws.",
    funFact: "DK Mountain fires you out of a barrel cannon onto a volcano. The climb is instant; the hairpin-filled descent is your problem.", funFactSourceUrl: "https://www.mariowiki.com/DK_Mountain", sourceUrl: friends,
  },
  {
    id: 'char-boo', topic: 'mario', answer: 'Boo',
    clues: ['I can cause mischief.', 'I prefer gloomy, deserted places.', 'Being watched makes me shy.', 'I freeze and hide my eyes.', 'I am a bashful ghost.'],
    explanation: "A Boo freezes when you look at it. Turning around can be a surprisingly good defence.",
    funFact: "Mario Kart 8 Deluxe turns Boo into an item thief. Use him to vanish briefly and steal from a rival.", funFactSourceUrl: "https://www.nintendo.com/au/games/nintendo-switch/mario-kart-8-deluxe/", sourceUrl: friends,
  },
  {
    id: 'track-gardens', topic: 'kart', answer: 'Peach Gardens',
    clues: ['Plants help shape the scenery around my route.', 'My first racers played on a two-screen handheld.', 'Chain Chomps move around here.', 'I surround a princess’s castle.', 'My name links that princess with planted grounds.'],
    explanation: "Peach Gardens surrounds the castle with hedges and Chain Chomps. The original course was on DS.",
    funFact: "In 8 Deluxe, Peach Gardens changes direction on the final lap. Learn the arrows; the route you memorised is about to change.", funFactSourceUrl: "https://www.mariowiki.com/DS_Peach_Gardens", sourceUrl: wave3,
  },
  {
    id: 'track-boo-lake', topic: 'kart', answer: 'Boo Lake',
    clues: ['My first game was on a handheld.', 'My setting mixes water and spooks.', 'I returned in the Rock Cup.', 'I began in Mario Kart: Super Circuit.', 'My name joins a ghost and inland water.'],
    explanation: "Boo Lake is the haunted Super Circuit course. It returns in Rock Cup.",
    funFact: "Boo Lake’s remake takes part of the track underwater. The old wooden boardwalk is now only part of the adventure.", funFactSourceUrl: "https://www.mariowiki.com/Boo_Lake", sourceUrl: wave3,
  },
  {
    id: 'track-merry', topic: 'kart', answer: 'Merry Mountain',
    clues: ['My first game was on phones.', 'Pine trees line snowy slopes.', 'Racers can ride a halfpipe.', 'Wrapped presents decorate the route.', 'A flying sleigh train adds festive cheer.'],
    explanation: "Merry Mountain mixes snow, presents and a flying sleigh train. Christmas traffic has got unusual.",
    funFact: "Merry Mountain has a halfpipe on its snowy slopes. Use the banked route rather than treating every snowy edge as scenery.", funFactSourceUrl: "https://www.nintendo.com/us/whatsnew/mario-kart-8-deluxe-booster-course-pass-wave-3-brings-merry-mountain-mayhem-with-eight-additional-courses-on-dec-7/", sourceUrl: wave3,
  },
  {
    id: 'track-rock', topic: 'kart', answer: 'Rock Rock Mountain',
    clues: ['My route takes racers high above the lowlands.', 'Tight bends test your steering.', 'Bouncing boulders threaten racers.', 'A warp-pipe ramp launches you airborne.', 'My name repeats a word for stone.'],
    explanation: "Rock Rock Mountain combines bouncing boulders with big glides. The warp-pipe ramp is the giveaway.",
    funFact: "Mario Kart 7 introduced gliders and underwater driving. A kart could suddenly turn a ramp into a flight and keep racing beneath the waves.", funFactSourceUrl: "https://www.mariowiki.com/Mario_Kart_7", sourceUrl: wave3,
  },
];
