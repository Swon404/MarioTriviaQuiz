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
  {
    id: 'char-toad', topic: 'mario', answer: 'Toad',
    clues: ['Helping others can put me in danger.', 'I stand by friends when trouble arrives.', 'I serve a princess.', 'Others of my kind come in several colours.', 'The red spots on my head are a familiar sight beside Peach.'],
    explanation: 'Serving Peach and standing by the Mario brothers point to Toad. The red spots separate this familiar helper from other Toads.',
    funFact: 'Toad can put himself in danger to help the kingdom. Loyalty is something he acts on, not just a description.', sourceUrl: characters,
  },
  {
    id: 'char-diddy', topic: 'mario', answer: 'Diddy Kong',
    clues: ['Speed helps me support my friends.', 'I make up for size with agility.', 'I help protect a supply of bananas.', 'My red shirt has yellow stars.', 'I am Donkey Kong’s smaller partner in a red cap.'],
    explanation: 'The cap and starred shirt identify Diddy, while agility distinguishes him from the stronger Donkey Kong.',
    funFact: 'Diddy helps guard Donkey Kong’s banana supply. His speed and jumping make him useful without matching his friend’s strength.', sourceUrl: characters,
  },
  {
    id: 'char-cappy', topic: 'mario', answer: 'Cappy',
    clues: ['Helping a hero is my role.', 'I bring abilities that my partner lacks.', 'Objects as well as enemies respond to my power.', 'My home is the Cap Kingdom.', 'I am the hat-shaped partner who gives Mario his Capture ability.'],
    explanation: 'Cappy’s Capture ability explains the clues about borrowing powers. Mario can control creatures and objects instead of solving everything with his usual jump.',
    funFact: 'An enemy can become a useful form after a hat throw: the thing blocking your route may help you cross it.', sourceUrl: 'https://play.nintendo.com/themes/friends/cappy/',
  },
  {
    id: 'char-goomba', topic: 'mario', answer: 'Goomba',
    clues: ['I am not the most fearsome foe.', 'I belong to a much larger force.', 'That force works for the Koopa king.', 'A well-timed landing can defeat me.', 'I am the familiar mushroom-shaped enemy usually beaten with a jump.'],
    explanation: 'The stomp is the key clue: landing on a Goomba usually defeats it. Running straight into the same enemy is dangerous.',
    funFact: 'Goombas serve Bowser despite being some of his less fearsome fighters. Size is not a guarantee of safety.', sourceUrl: 'https://play.nintendo.com/themes/friends/goomba/',
  },
  {
    id: 'char-mario', topic: 'mario', answer: 'Mario',
    clues: ['Helping friends keeps me busy.', 'Jumping is one of my strengths.', 'I wear overalls and a cap.', 'My cap is red and my overalls are blue.', 'My brother is Luigi.'],
    explanation: 'Luigi’s brother, the red cap and the jumping skills all point to Mario. Overalls alone would not separate him from several other characters.',
    funFact: 'Mario’s job is plumbing, but his talents stretch to tennis, golf, football and kart racing.', sourceUrl: characters,
  },
  {
    id: 'char-luigi', topic: 'mario', answer: 'Luigi',
    clues: ['I can be cautious, but I still help others.', 'I share adventures with someone in my family.', 'Ghosts can make me nervous.', 'I dress in green and can jump high.', 'My brother is Mario.'],
    explanation: 'Green clothes and a brother called Mario identify Luigi. His nervousness around ghosts does not stop him helping others.',
    funFact: 'Try spotting the brothers without using their hat colours: their moustaches have different shapes.', sourceUrl: characters,
  },
  {
    id: 'char-peach', topic: 'mario', answer: 'Princess Peach',
    clues: ['I like both sport and cooking.', 'I want people to live happily together.', 'I look after a kingdom.', 'I often wear pink.', 'I am the princess of the Mushroom Kingdom.'],
    explanation: 'The Mushroom Kingdom is the deciding clue for Peach. Pink clothes, cooking and sport help narrow down the answer before that.',
    funFact: 'Peach and Mario help each other. Their friendship is not only a story of Mario doing the rescuing.', sourceUrl: characters,
  },
  {
    id: 'char-yoshi', topic: 'mario', answer: 'Yoshi',
    clues: ['A friend can depend on me for help.', 'Fruit is on my menu.', 'Members of my kind come in several colours.', 'I use my long tongue to turn food and enemies into eggs.', 'I am the egg-making friend whose name begins with Y.'],
    explanation: 'The long tongue and egg-making ability identify Yoshi. Eating can provide something to throw, so food and attacks are connected.',
    funFact: 'Green is only one Yoshi colour: red, blue, pink and yellow Yoshis appear too.', sourceUrl: characters,
  },
  {
    id: 'char-bowser', topic: 'mario', answer: 'Bowser',
    clues: ['My plans do not always work out.', 'Strength helps me challenge my rivals.', 'Many familiar enemies work for me.', 'I am strong and can breathe fire.', 'I am King of the Koopas.'],
    explanation: 'The Koopa king is Bowser. Strength alone could describe several choices, but leading an army and breathing fire narrow it down.',
    funFact: 'Bowser’s followers include Goombas, Bullet Bills and Shy Guys—not just Koopas.', sourceUrl: characters,
  },
  {
    id: 'char-daisy', topic: 'mario', answer: 'Daisy',
    clues: ['I bring plenty of energy to a competition.', 'Sport is something I enjoy with friends.', 'I often wear yellow.', 'Flowers decorate my outfit.', 'I am the princess of Sarasaland.'],
    explanation: 'Sarasaland identifies Daisy, not Peach. Yellow clothes and flower accessories give you earlier clues to the same princess.',
    funFact: 'Peach’s Mushroom Kingdom and Daisy’s Sarasaland are different kingdoms, even when the princesses compete in the same games.', sourceUrl: characters,
  },
  {
    id: 'char-wario', topic: 'mario', answer: 'Wario',
    clues: ['Small problems do not worry me much.', 'I have known another racer since we were young.', 'I like garlic almost as much as money.', 'I wear purple overalls and a yellow hat.', 'I call myself Mario\'s rival and have a zigzag moustache.'],
    explanation: 'Yellow and purple, garlic and a rivalry with Mario point to Wario. Waluigi’s rivalry is with Luigi instead.',
    funFact: 'Wario has known Mario since they were babies: their connection goes back much further than the latest race.', sourceUrl: characters,
  },
  {
    id: 'char-rosalina', topic: 'mario', answer: 'Rosalina',
    clues: ['There is more kindness in me than you might first guess.', 'Looking after my family matters to me.', 'My home is far from the usual kingdom.', 'I travel through space with small star-like creatures.', 'Those creatures are the Lumas, and I am their adoptive mother.'],
    explanation: 'The Lumas are Rosalina’s family. Caring for these star-like creatures is the connection behind the clues about space and motherhood.',
    funFact: 'Her distant appearance can be misleading: Nintendo describes Rosalina as kind-hearted.', sourceUrl: characters,
  },

  {
    id: 'track-coconut', topic: 'kart', answer: 'Coconut Mall',
    clues: ['Choosing your route matters here.', 'Some of the surfaces carrying racers move too.', 'I first appeared on Wii.', 'My escalators lead racers between floors.', 'My name combines a tropical fruit with a shopping centre.'],
    explanation: 'The moving escalators identify Coconut Mall. Choosing one travelling your way helps rather than fighting against the steps.',
    funFact: 'In Mario Kart Wii, a Mushroom lets you take a shortcut through an open shop. The shopping centre offers more than one route.', sourceUrl: coconutTips,
  },
  {
    id: 'track-waluigi', topic: 'kart', answer: 'Waluigi Pinball',
    clues: ['I turn indoor entertainment into a racetrack.', 'Lights and sound effects surround the racing line.', 'My first version was on Nintendo DS.', 'I finish the Turnip Cup.', 'My name pairs Luigi\'s purple-clad rival with a bouncing arcade game.'],
    explanation: 'Arcade lights and sounds fit Waluigi Pinball. Its DS origin and Turnip Cup finale distinguish it from other indoor tracks.',
    funFact: 'Turnip Cup also includes Kalimari Desert: the same cup takes you from a desert railway to an enormous arcade game.', sourceUrl: wave2,
  },
  {
    id: 'track-maple', topic: 'kart', answer: 'Maple Treeway',
    clues: ['I take racers into a landscape filled with plants.', 'The season gives my scenery warm colours.', 'Huge trees form part of the route.', 'Watch out for the large Wigglers.', 'My name pairs an autumn tree with a route through it.'],
    explanation: 'Autumn trees and Wigglers point to Maple Treeway, the returning Wii course at the end of Rock Cup.',
    funFact: 'The trees form part of the racing route, rather than just lining an ordinary road.', sourceUrl: wave3,
  },
  {
    id: 'track-rome', topic: 'kart', answer: 'Rome Avanti',
    clues: ['My racing history began on a phone.', 'I arrived in the final wave of the Booster Course Pass.', 'The place in my name is a real city.', 'I open the Acorn Cup.', 'That city is Italy\'s capital.'],
    explanation: 'Italy’s capital identifies Rome Avanti. It began in Tour and opens Acorn Cup in the final Booster Course Pass wave.',
    funFact: 'Acorn Cup finishes at Piranha Plant Cove: the cup’s first and last settings are very different.', sourceUrl: courses,
  },
  {
    id: 'track-daisy', topic: 'kart', answer: 'Daisy Cruiser',
    clues: ['Water surrounds the setting for this race.', 'I began on a home console, before returning on phones and Switch.', 'My first console was the GameCube.', 'Racers drive aboard a ship rather than along a seaside road.', 'My name combines a yellow-clad princess with a ship.'],
    explanation: 'The GameCube ship is Daisy Cruiser. Its race takes place aboard a vessel, not simply on a road beside the sea.',
    funFact: 'When the course returned in Tour’s Ocean Tour, Daisy gained a sailor outfit to match the occasion.', sourceUrl: oceanTour,
  },
  {
    id: 'track-ninja', topic: 'kart', answer: 'Ninja Hideaway',
    clues: ['Darkness is part of my atmosphere.', 'My first race took place in a phone game.', 'Moonlight lights the route through my setting.', 'I finish the Lucky Cat Cup.', 'My name suggests a secret place for a stealthy warrior.'],
    explanation: 'The moonlit setting and Lucky Cat Cup finale point to Ninja Hideaway. Its first appearance was in Mario Kart Tour.',
    funFact: 'The Ninja Tour also dressed Shy Guy as a ninja: the event’s theme reached the racers as well as the course.', sourceUrl: ninjaTour,
  },
  {
    id: 'track-sundae', topic: 'kart', answer: 'Sky-High Sundae',
    clues: ['Everyday things look enormous around my racers.', 'I made my series debut in the second Booster Course Pass wave.', 'The oversized scenery includes sweet treats.', 'I finish the Propeller Cup.', 'My name sounds like a dessert served high above the ground.'],
    explanation: 'The giant desserts identify Sky-High Sundae. It debuted in 8 Deluxe’s second DLC wave and finishes Propeller Cup.',
    funFact: 'The same cup opens with Sydney Sprint, swapping city streets for oversized sweet treats by the finale.', sourceUrl: wave2,
  },
  {
    id: 'track-piranha', topic: 'kart', answer: 'Piranha Plant Cove',
    clues: ['Water is an important part of my setting.', 'Some of my structures have seen better days.', 'My island has temples beneath the water.', 'I close the Acorn Cup.', 'My name combines a toothy plant with a sheltered stretch of water.'],
    explanation: 'Underwater temples and a sinking island point to Piranha Plant Cove. Its route explores ruins rather than just following a shoreline.',
    funFact: 'Its debut Exploration Tour also gave light-blue and yellow Shy Guys explorer outfits.', sourceUrl: explorationTour,
  },
  {
    id: 'char-waluigi', topic: 'mario', answer: 'Waluigi',
    clues: ['I enjoy competing against familiar heroes.', 'I put effort into annoying my opponents.', 'My long limbs help in sports.', 'I often team up with Wario.', 'I call myself Luigi’s rival.'],
    explanation: 'Waluigi claims Luigi as his rival; Wario claims Mario. Remembering those two pairings helps untangle the similar names.',
    funFact: 'His long limbs help in sports. Reach gives him an advantage quite different from Bowser’s strength.', sourceUrl: friends,
  },
  {
    id: 'char-junior', topic: 'mario', answer: 'Bowser Jr.',
    clues: ['I cause trouble for the heroes.', 'Strength runs in my family.', 'I am small but powerful.', 'My mask has a mouth drawn on it.', 'My father is the Koopa king.'],
    explanation: 'The Koopa king’s son is Bowser Jr. The fierce mouth is drawn on his face covering, not part of his actual face.',
    funFact: 'Junior may be small, but he has inherited Bowser’s strength. A smaller opponent is not always a weaker one.', sourceUrl: friends,
  },
  {
    id: 'char-dk', topic: 'mario', answer: 'Donkey Kong',
    clues: ['I have plenty of strength.', 'I keep food at home.', 'I can throw huge barrels.', 'My red tie carries my initials.', 'I hoard bananas in a treehouse.'],
    explanation: 'The initials on the red tie identify Donkey Kong. His strength lets him hurl large barrels and protect his banana stash.',
    funFact: 'His ground pound is powerful enough to shake the ground—another way he uses strength besides throwing things.', sourceUrl: friends,
  },
  {
    id: 'char-boo', topic: 'mario', answer: 'Boo',
    clues: ['I can cause mischief.', 'I prefer gloomy, deserted places.', 'Being watched makes me shy.', 'I freeze and hide my eyes.', 'I am a bashful ghost.'],
    explanation: 'A ghost that freezes when watched is a Boo. Looking straight at it changes its behaviour, so turning around can matter.',
    funFact: 'Covering its eyes is a useful clue to that shyness: the animation helps explain what the enemy is doing.', sourceUrl: friends,
  },
  {
    id: 'track-gardens', topic: 'kart', answer: 'Peach Gardens',
    clues: ['Plants help shape the scenery around my route.', 'My first racers played on a two-screen handheld.', 'Chain Chomps move around here.', 'I surround a princess’s castle.', 'My name links that princess with planted grounds.'],
    explanation: 'Peach Gardens combines castle grounds, Chain Chomps and planted scenery. Its first version was on Nintendo DS.',
    funFact: 'The bushes are shaped into familiar figures. See which you recognise without forgetting to watch the Chain Chomps.', sourceUrl: wave3,
  },
  {
    id: 'track-boo-lake', topic: 'kart', answer: 'Boo Lake',
    clues: ['My first game was on a handheld.', 'My setting mixes water and spooks.', 'I returned in the Rock Cup.', 'I began in Mario Kart: Super Circuit.', 'My name joins a ghost and inland water.'],
    explanation: 'The haunted lake and Super Circuit origin identify Boo Lake. It returned as a Rock Cup course in 8 Deluxe.',
    funFact: 'The GBA label means Game Boy Advance: it names the original system, not the console running the remake.', sourceUrl: wave3,
  },
  {
    id: 'track-merry', topic: 'kart', answer: 'Merry Mountain',
    clues: ['My first game was on phones.', 'Pine trees line snowy slopes.', 'Racers can ride a halfpipe.', 'Wrapped presents decorate the route.', 'A flying sleigh train adds festive cheer.'],
    explanation: 'Presents, snow and the flying sleigh train point to Merry Mountain. It began in Mario Kart Tour.',
    funFact: 'Listen as well as look: seasonal music adds to the festive setting.', sourceUrl: wave3,
  },
  {
    id: 'track-rock', topic: 'kart', answer: 'Rock Rock Mountain',
    clues: ['My route takes racers high above the lowlands.', 'Tight bends test your steering.', 'Bouncing boulders threaten racers.', 'A warp-pipe ramp launches you airborne.', 'My name repeats a word for stone.'],
    explanation: 'Boulders and the warp-pipe ramp identify Rock Rock Mountain. This returning 3DS course alternates bends with airborne travel.',
    funFact: 'The ramp launches you into a glide, so choosing a route involves the air as well as the road.', sourceUrl: wave3,
  },
];
