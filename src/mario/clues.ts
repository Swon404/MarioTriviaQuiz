import type { Topic } from './questions.ts';

export type ClueSubject = {
  id: string;
  topic: Topic;
  answer: string;
  clues: readonly [string, string, string, string, string];
  explanation: string;
  funFact: string;
  sourceUrl: string;
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
  {
    id: 'char-mario', topic: 'mario', answer: 'Mario',
    clues: ['Helping friends keeps me busy.', 'Jumping is one of my strengths.', 'I wear overalls and a cap.', 'My cap is red and my overalls are blue.', 'My brother is Luigi.'],
    explanation: 'Mario is the Mushroom Kingdom hero and Luigi\'s brother. His jumping skills help him through many adventures.',
    funFact: 'Nintendo says Mario is a plumber, but also a jack of all trades.', sourceUrl: characters,
  },
  {
    id: 'char-luigi', topic: 'mario', answer: 'Luigi',
    clues: ['I can be cautious, but I still help others.', 'I share adventures with someone in my family.', 'Ghosts can make me nervous.', 'I dress in green and can jump high.', 'My brother is Mario.'],
    explanation: 'Luigi is Mario\'s brother. He is taller, wears green and can jump higher than Mario.',
    funFact: 'Nintendo points out that Luigi\'s moustache has a different shape from Mario\'s.', sourceUrl: characters,
  },
  {
    id: 'char-peach', topic: 'mario', answer: 'Princess Peach',
    clues: ['I like both sport and cooking.', 'I want people to live happily together.', 'I look after a kingdom.', 'I often wear pink.', 'I am the princess of the Mushroom Kingdom.'],
    explanation: 'Princess Peach looks after the Mushroom Kingdom. She also joins Mario in adventures and sports.',
    funFact: 'Peach and Mario are good friends who help each other.', sourceUrl: characters,
  },
  {
    id: 'char-yoshi', topic: 'mario', answer: 'Yoshi',
    clues: ['A friend can depend on me for help.', 'Fruit is on my menu.', 'Members of my kind come in several colours.', 'I use my long tongue to turn food and enemies into eggs.', 'I am the egg-making friend whose name begins with Y.'],
    explanation: 'Yoshi uses his tongue to grab fruit and enemies, then can make eggs to throw.',
    funFact: 'Nintendo lists red, blue, pink and yellow Yoshis as well as green ones.', sourceUrl: characters,
  },
  {
    id: 'char-bowser', topic: 'mario', answer: 'Bowser',
    clues: ['My plans do not always work out.', 'Strength helps me challenge my rivals.', 'Many familiar enemies work for me.', 'I am strong and can breathe fire.', 'I am King of the Koopas.'],
    explanation: 'Bowser leads the Koopas and repeatedly challenges Mario in the Mushroom Kingdom.',
    funFact: 'Bowser Jr. is Bowser\'s only son, according to Nintendo\'s character guide.', sourceUrl: characters,
  },
  {
    id: 'char-daisy', topic: 'mario', answer: 'Daisy',
    clues: ['I bring plenty of energy to a competition.', 'Sport is something I enjoy with friends.', 'I often wear yellow.', 'Flowers decorate my outfit.', 'I am the princess of Sarasaland.'],
    explanation: 'Daisy is the princess of Sarasaland. She brings lots of energy to Mario\'s sports games.',
    funFact: 'Sarasaland is not the same kingdom as Peach\'s Mushroom Kingdom.', sourceUrl: characters,
  },
  {
    id: 'char-wario', topic: 'mario', answer: 'Wario',
    clues: ['Small problems do not worry me much.', 'I have known another racer since we were young.', 'I like garlic almost as much as money.', 'I wear purple overalls and a yellow hat.', 'I call myself Mario\'s rival and have a zigzag moustache.'],
    explanation: 'Wario styles himself as Mario\'s rival. His yellow hat and purple overalls stand out.',
    funFact: 'Nintendo says Wario and Mario have known each other since they were babies.', sourceUrl: characters,
  },
  {
    id: 'char-rosalina', topic: 'mario', answer: 'Rosalina',
    clues: ['There is more kindness in me than you might first guess.', 'Looking after my family matters to me.', 'My home is far from the usual kingdom.', 'I travel through space with small star-like creatures.', 'Those creatures are the Lumas, and I am their adoptive mother.'],
    explanation: 'Rosalina cares for the Lumas. Nintendo describes her as mysterious but kind-hearted.',
    funFact: 'Rosalina travels across the galaxy with her Luma family.', sourceUrl: characters,
  },

  {
    id: 'track-coconut', topic: 'kart', answer: 'Coconut Mall',
    clues: ['Choosing your route matters here.', 'Some of the surfaces carrying racers move too.', 'I first appeared on Wii.', 'My escalators lead racers between floors.', 'My name combines a tropical fruit with a shopping centre.'],
    explanation: 'Coconut Mall turns a shopping trip into a race. Choosing the escalator moving your way helps you keep going instead of fighting against it.',
    funFact: 'In the Wii version, a Mushroom lets you cut through an open shop for a shortcut.', sourceUrl: coconutTips,
  },
  {
    id: 'track-waluigi', topic: 'kart', answer: 'Waluigi Pinball',
    clues: ['I turn indoor entertainment into a racetrack.', 'Lights and sound effects surround the racing line.', 'My first version was on Nintendo DS.', 'I finish the Turnip Cup.', 'My name pairs Luigi\'s purple-clad rival with a bouncing arcade game.'],
    explanation: 'Waluigi Pinball is the fourth Turnip Cup course in the Booster Course Pass.',
    funFact: 'The Turnip Cup also contains Kalimari Desert.', sourceUrl: wave2,
  },
  {
    id: 'track-maple', topic: 'kart', answer: 'Maple Treeway',
    clues: ['I take racers into a landscape filled with plants.', 'The season gives my scenery warm colours.', 'Huge trees form part of the route.', 'Watch out for the large Wigglers.', 'My name pairs an autumn tree with a route through it.'],
    explanation: 'Maple Treeway is a returning Wii track and the fourth course in the Rock Cup.',
    funFact: 'London Loop opens the Rock Cup.', sourceUrl: wave3,
  },
  {
    id: 'track-rome', topic: 'kart', answer: 'Rome Avanti',
    clues: ['My racing history began on a phone.', 'I arrived in the final wave of the Booster Course Pass.', 'The place in my name is a real city.', 'I open the Acorn Cup.', 'That city is Italy\'s capital.'],
    explanation: 'Rome Avanti opens the Acorn Cup in the final Booster Course Pass wave.',
    funFact: 'The Acorn Cup ends with Piranha Plant Cove.', sourceUrl: courses,
  },
  {
    id: 'track-daisy', topic: 'kart', answer: 'Daisy Cruiser',
    clues: ['Water surrounds the setting for this race.', 'I began on a home console, before returning on phones and Switch.', 'My first console was the GameCube.', 'Racers drive aboard a ship rather than along a seaside road.', 'My name combines a yellow-clad princess with a ship.'],
    explanation: 'Daisy Cruiser takes the race aboard a ship. The GameCube course later returned in Mario Kart Tour and the Feather Cup in Mario Kart 8 Deluxe.',
    funFact: 'Its Ocean Tour appearance also introduced a sailor outfit for Daisy.', sourceUrl: oceanTour,
  },
  {
    id: 'track-ninja', topic: 'kart', answer: 'Ninja Hideaway',
    clues: ['Darkness is part of my atmosphere.', 'My first race took place in a phone game.', 'Moonlight lights the route through my setting.', 'I finish the Lucky Cat Cup.', 'My name suggests a secret place for a stealthy warrior.'],
    explanation: 'Ninja Hideaway closes the Lucky Cat Cup in the Booster Course Pass.',
    funFact: 'The event that introduced this course also put Shy Guy in a ninja outfit.', sourceUrl: ninjaTour,
  },
  {
    id: 'track-sundae', topic: 'kart', answer: 'Sky-High Sundae',
    clues: ['Everyday things look enormous around my racers.', 'I made my series debut in the second Booster Course Pass wave.', 'The oversized scenery includes sweet treats.', 'I finish the Propeller Cup.', 'My name sounds like a dessert served high above the ground.'],
    explanation: 'Sky-High Sundae makes desserts into giant racing scenery. It closes the Propeller Cup, after Mushroom Gorge.',
    funFact: 'The same cup starts with Sydney Sprint, swapping giant desserts for Australian city sights.', sourceUrl: wave2,
  },
  {
    id: 'track-piranha', topic: 'kart', answer: 'Piranha Plant Cove',
    clues: ['Water is an important part of my setting.', 'Some of my structures have seen better days.', 'My island has temples beneath the water.', 'I close the Acorn Cup.', 'My name combines a toothy plant with a sheltered stretch of water.'],
    explanation: 'Piranha Plant Cove mixes underwater temples, caves and jungle ruins. Its setting is a sinking island, not just a road beside the sea.',
    funFact: 'This course debuted in the Exploration Tour, with explorer outfits for light-blue and yellow Shy Guys.', sourceUrl: explorationTour,
  },
  {
    id: 'char-waluigi', topic: 'mario', answer: 'Waluigi',
    clues: ['I enjoy competing against familiar heroes.', 'I put effort into annoying my opponents.', 'My long limbs help in sports.', 'I often team up with Wario.', 'I call myself Luigi’s rival.'],
    explanation: 'Waluigi competes with Luigi; Wario claims Mario as his rival.',
    funFact: 'His reach helps him stay competitive.', sourceUrl: friends,
  },
  {
    id: 'char-junior', topic: 'mario', answer: 'Bowser Jr.',
    clues: ['I cause trouble for the heroes.', 'Strength runs in my family.', 'I am small but powerful.', 'My mask has a mouth drawn on it.', 'My father is the Koopa king.'],
    explanation: 'Bowser Jr. inherited his father’s strength.',
    funFact: 'He gets cross when plans fail.', sourceUrl: friends,
  },
  {
    id: 'char-dk', topic: 'mario', answer: 'Donkey Kong',
    clues: ['I have plenty of strength.', 'I keep food at home.', 'I can throw huge barrels.', 'My red tie carries my initials.', 'I hoard bananas in a treehouse.'],
    explanation: 'Donkey Kong is a powerful jungle resident.',
    funFact: 'His ground-pounding can shake the earth.', sourceUrl: friends,
  },
  {
    id: 'char-boo', topic: 'mario', answer: 'Boo',
    clues: ['I can cause mischief.', 'I prefer gloomy, deserted places.', 'Being watched makes me shy.', 'I freeze and hide my eyes.', 'I am a bashful ghost.'],
    explanation: 'Boos stop when watched directly.',
    funFact: 'These spooky enemies are surprisingly shy.', sourceUrl: friends,
  },
  {
    id: 'track-gardens', topic: 'kart', answer: 'Peach Gardens',
    clues: ['Plants help shape the scenery around my route.', 'My first racers played on a two-screen handheld.', 'Chain Chomps move around here.', 'I surround a princess’s castle.', 'My name links that princess with planted grounds.'],
    explanation: 'Peach Gardens began on Nintendo DS.',
    funFact: 'Look for the shaped bushes!', sourceUrl: wave3,
  },
  {
    id: 'track-boo-lake', topic: 'kart', answer: 'Boo Lake',
    clues: ['My first game was on a handheld.', 'My setting mixes water and spooks.', 'I returned in the Rock Cup.', 'I began in Mario Kart: Super Circuit.', 'My name joins a ghost and inland water.'],
    explanation: 'Boo Lake is a haunted-water course.',
    funFact: 'Its original system was Game Boy Advance.', sourceUrl: wave3,
  },
  {
    id: 'track-merry', topic: 'kart', answer: 'Merry Mountain',
    clues: ['My first game was on phones.', 'Pine trees line snowy slopes.', 'Racers can ride a halfpipe.', 'Wrapped presents decorate the route.', 'A flying sleigh train adds festive cheer.'],
    explanation: 'Merry Mountain has a holiday theme.',
    funFact: 'Giant candy canes decorate the course.', sourceUrl: wave3,
  },
  {
    id: 'track-rock', topic: 'kart', answer: 'Rock Rock Mountain',
    clues: ['My route takes racers high above the lowlands.', 'Tight bends test your steering.', 'Bouncing boulders threaten racers.', 'A warp-pipe ramp launches you airborne.', 'My name repeats a word for stone.'],
    explanation: 'Rock Rock Mountain began on Nintendo 3DS.',
    funFact: 'Gliding breaks up the rocky driving sections.', sourceUrl: wave3,
  },
];
