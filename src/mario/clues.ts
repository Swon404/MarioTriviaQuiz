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

const characters = 'https://mario.nintendo.com/characters/';
const courses = 'https://en-americas-support.nintendo.com/app/answers/detail/a_id/57858/';

// Clues move from shared traits to distinctive details. The first two must not
// contain words from the answer, so a multiple-choice label cannot give them away.
export const CLUE_SUBJECTS: readonly ClueSubject[] = [
  {
    id: 'char-mario', topic: 'mario', answer: 'Mario',
    clues: ['I have starred in adventures and joined races.', 'I often help friends in a kingdom.', 'I wear overalls and a cap.', 'My cap is red and my overalls are blue.', 'My brother is Luigi.'],
    explanation: 'Mario is the Mushroom Kingdom hero and Luigi\'s brother. His jumping skills help him through many adventures.',
    funFact: 'Nintendo says Mario is a plumber, but also a jack of all trades.', sourceUrl: characters,
  },
  {
    id: 'char-luigi', topic: 'mario', answer: 'Luigi',
    clues: ['I have joined adventures and races.', 'I often help a family member.', 'Ghosts can make me nervous.', 'I dress in green and can jump high.', 'My brother is Mario.'],
    explanation: 'Luigi is Mario\'s brother. He is taller, wears green and can jump higher than Mario.',
    funFact: 'Nintendo points out that Luigi\'s moustache has a different shape from Mario\'s.', sourceUrl: characters,
  },
  {
    id: 'char-peach', topic: 'mario', answer: 'Princess Peach',
    clues: ['I join adventures and sports.', 'I look after a kingdom.', 'I also enjoy baking.', 'I often wear pink.', 'I am the princess of the Mushroom Kingdom.'],
    explanation: 'Princess Peach looks after the Mushroom Kingdom. She also joins Mario in adventures and sports.',
    funFact: 'Peach and Mario are good friends who help each other.', sourceUrl: characters,
  },
  {
    id: 'char-yoshi', topic: 'mario', answer: 'Yoshi',
    clues: ['I join adventures and races.', 'Members of my kind come in several colours.', 'I come from an island named after my kind.', 'I use my long tongue to turn food and enemies into eggs.', 'I am the egg-making friend whose name begins with Y.'],
    explanation: 'Yoshi uses his tongue to grab fruit and enemies, then can make eggs to throw.',
    funFact: 'Nintendo lists red, blue, pink and yellow Yoshis as well as green ones.', sourceUrl: characters,
  },
  {
    id: 'char-bowser', topic: 'mario', answer: 'Bowser',
    clues: ['I join adventures and races.', 'A family member sometimes joins the action too.', 'Many familiar enemies work for me.', 'I am strong and can breathe fire.', 'I am King of the Koopas.'],
    explanation: 'Bowser leads the Koopas and repeatedly challenges Mario in the Mushroom Kingdom.',
    funFact: 'Bowser Jr. is Bowser\'s only son, according to Nintendo\'s character guide.', sourceUrl: characters,
  },
  {
    id: 'char-daisy', topic: 'mario', answer: 'Daisy',
    clues: ['I join sports and races.', 'People describe me as energetic.', 'I often wear yellow.', 'Flowers decorate my outfit.', 'I am the princess of Sarasaland.'],
    explanation: 'Daisy is the princess of Sarasaland. She brings lots of energy to Mario\'s sports games.',
    funFact: 'Sarasaland is not the same kingdom as Peach\'s Mushroom Kingdom.', sourceUrl: characters,
  },
  {
    id: 'char-wario', topic: 'mario', answer: 'Wario',
    clues: ['I turn up in races and other games.', 'I have known another racer since we were young.', 'I like garlic almost as much as money.', 'I wear purple overalls and a yellow hat.', 'I call myself Mario\'s rival and have a zigzag moustache.'],
    explanation: 'Wario styles himself as Mario\'s rival. His yellow hat and purple overalls stand out.',
    funFact: 'Nintendo says Wario and Mario have known each other since they were babies.', sourceUrl: characters,
  },
  {
    id: 'char-rosalina', topic: 'mario', answer: 'Rosalina',
    clues: ['I join adventures and races.', 'I care for a family.', 'My home is far from the usual kingdom.', 'I travel through space with small star-like creatures.', 'Those creatures are the Lumas, and I am their adoptive mother.'],
    explanation: 'Rosalina cares for the Lumas. Nintendo describes her as mysterious but kind-hearted.',
    funFact: 'Rosalina travels across the galaxy with her Luma family.', sourceUrl: characters,
  },

  {
    id: 'track-coconut', topic: 'kart', answer: 'Coconut Mall',
    clues: ['I returned as an extra course.', 'My first version was on a home console.', 'That console was the Wii.', 'I finish the Golden Dash Cup.', 'My name combines a tropical fruit with a shopping centre.'],
    explanation: 'Coconut Mall is the fourth Golden Dash Cup course in the Booster Course Pass.',
    funFact: 'The same cup begins with Paris Promenade.', sourceUrl: courses,
  },
  {
    id: 'track-waluigi', topic: 'kart', answer: 'Waluigi Pinball',
    clues: ['I returned as an extra course.', 'My first version was on a handheld console.', 'That handheld was the Nintendo DS.', 'I finish the Turnip Cup.', 'My name pairs Mario\'s purple-clad rival with a bouncing arcade game.'],
    explanation: 'Waluigi Pinball is the fourth Turnip Cup course in the Booster Course Pass.',
    funFact: 'The Turnip Cup also contains Kalimari Desert.', sourceUrl: courses,
  },
  {
    id: 'track-maple', topic: 'kart', answer: 'Maple Treeway',
    clues: ['A later cup brought me back as an extra course.', 'My first version was on a home console.', 'That console was the Wii.', 'I finish the Rock Cup.', 'My name pairs an autumn tree with a route through it.'],
    explanation: 'Maple Treeway is a returning Wii track and the fourth course in the Rock Cup.',
    funFact: 'London Loop opens the Rock Cup.', sourceUrl: courses,
  },
  {
    id: 'track-rome', topic: 'kart', answer: 'Rome Avanti',
    clues: ['I joined an extra-course cup.', 'My original version was made for phones.', 'The place in my name is a real city.', 'I open the Acorn Cup.', 'That city is Italy\'s capital.'],
    explanation: 'Rome Avanti opens the Acorn Cup in the final Booster Course Pass wave.',
    funFact: 'The Acorn Cup ends with Piranha Plant Cove.', sourceUrl: courses,
  },
  {
    id: 'track-daisy', topic: 'kart', answer: 'Daisy Cruiser',
    clues: ['I returned as an extra course.', 'My first version was on a home console.', 'That console was the GameCube.', 'I am second in the Feather Cup.', 'My name combines a yellow-clad princess with a ship.'],
    explanation: 'Daisy Cruiser is a GameCube track placed second in the Feather Cup.',
    funFact: 'Wii Moonview Highway follows Daisy Cruiser in that cup.', sourceUrl: courses,
  },
  {
    id: 'track-ninja', topic: 'kart', answer: 'Ninja Hideaway',
    clues: ['I returned as an extra course.', 'My original version was made for phones.', 'The same cup begins with Tokyo Blur.', 'I finish the Lucky Cat Cup.', 'My name suggests a secret place for a stealthy warrior.'],
    explanation: 'Ninja Hideaway closes the Lucky Cat Cup in the Booster Course Pass.',
    funFact: 'Tokyo Blur opens the Lucky Cat Cup.', sourceUrl: courses,
  },
  {
    id: 'track-sundae', topic: 'kart', answer: 'Sky-High Sundae',
    clues: ['I appear in a cup of extra courses.', 'My cup arrived before the final waves of the pass.', 'My cup also includes Mushroom Gorge.', 'I finish the Propeller Cup.', 'My name sounds like a dessert served high above the ground.'],
    explanation: 'Sky-High Sundae is the fourth course in the Propeller Cup.',
    funFact: 'The same cup also contains Mushroom Gorge.', sourceUrl: courses,
  },
  {
    id: 'track-piranha', topic: 'kart', answer: 'Piranha Plant Cove',
    clues: ['I appear in a cup of extra courses.', 'My cup came late in the pass.', 'My cup opens with Rome Avanti.', 'I close the Acorn Cup.', 'My name combines a toothy plant with a sheltered stretch of water.'],
    explanation: 'Piranha Plant Cove is the last Acorn Cup course in the Booster Course Pass.',
    funFact: 'The Acorn Cup is part of the sixth and final pass wave.', sourceUrl: courses,
  },
];
