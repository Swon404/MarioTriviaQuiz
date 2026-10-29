import type { ClueSubject } from './clues.ts';
import { QUESTIONS } from './questions.ts';

// Reviewed 2026-10-29. These reuse sourced Quiz knowledge, not extra quiz facts.
const shared: readonly [string, string, string, ClueSubject['kind'], ClueSubject['clues']][] = [
  ['expanded-1', 'Elephant Fruit', 'Super Mario Bros. Wonder', 'item', ['I change how a hero handles obstacles.', 'My new form is much bulkier.', 'I can help smash blocks.', 'Getting wet lets my new body store water.', 'I give you a trunk to swing or spray with.']],
  ['expanded-2', 'Bubble Flower', 'Super Mario Bros. Wonder', 'item', ['I can help you cross an awkward gap.', 'My projectiles need not be used as weapons.', 'You can jump onto what I create.', 'Your temporary foothold pops when used.', 'I make round floating stepping stones that can also trap enemies.']],
  ['expanded-8', 'Drill Mushroom', 'Super Mario Bros. Wonder', 'item', ['I can change your route through a course.', 'Hiding is one of my useful tricks.', 'Some ceilings become places to travel.', 'My pointed headgear also guards against attacks from above.', 'I let you burrow inside suitable floors and ceilings.']],
  ['expanded-9', 'Fire Flower', 'Super Mario Bros. Wonder', 'item', ['I let you attack from a distance.', 'I am useful against frozen obstacles.', 'My shots bounce along the ground.', 'My bright projectiles are hot.', 'I turn Mario into the form that throws fireballs.']],
  ['fresh-5', 'Super Bell', 'Super Mario 3D World', 'item', ['I give you another way to reach a ledge.', 'My new form can attack at close range.', 'You grow a tail and pointed ears.', 'Claws help you climb walls.', 'Pick me up to become Cat Mario.']],
  ['gameplay-3dw-cherry', 'Double Cherry', 'Super Mario 3D World', 'item', ['I help one player occupy several places.', 'Keeping everyone together takes care.', 'Your controls move all the copies.', 'Some platforms need several characters standing on them.', 'This paired red fruit creates another copy of you.']],
  ['platform-3dw-cannon', 'Cannon Box', 'Super Mario 3D World', 'item', ['I am equipment you can wear.', 'My attack can reach farther if you wait.', 'Cracked walls can be broken with my shots.', 'Teammates can be hurt by my projectiles too.', 'My barrel fires cannonballs from a box over your head.']],
  ['platform-3dw-lucky', 'Lucky Bell', 'Super Mario 3D World', 'item', ['I can turn a safe drop into a reward.', 'My effect gives you an animal form.', 'A ground pound changes you into a statue.', 'Falling in that form produces coins.', 'I give the cat suit a gold statue trick.']],
  ['adventure-wonder-hoppo', 'Hoppo', '', undefined, ['My size can get in the way.', 'I can become useful after moving.', 'I roll through the Flower Kingdom.', 'Getting wedged in a gap changes how you use me.', 'This round hippo-like creature becomes a bouncy platform.']],
  ['adventure-wonder-condart', 'Condart', '', undefined, ['I attack by charging.', 'Dodging me can create a safe moment.', 'My beak can smash Brick Blocks in Wonder.', 'An unbreakable wall briefly traps my beak.', 'I am Wonder’s dart-like bird that dives straight at you.']],
  ['adventure-wonder-maw', 'Maw-Maw', '', undefined, ['Getting too close to me is dangerous.', 'I have a very big appetite.', 'Wonder’s Goomba form is especially vulnerable to me.', 'A low ceiling can stun me when I open my mouth.', 'I am the enormous-mouthed creature that can swallow Goomba Mario.']],
  ['adventure-odyssey-pokio', 'Pokio', '', undefined, ['I can help a visitor reach higher ground.', 'My body has a useful pointed tool.', 'Cappy can capture me in Bowser’s Kingdom.', 'Stick my beak into a suitable wall and flick upward.', 'I am Odyssey’s small bird capture that climbs by pecking.']],
];

export const ADVENTURE_CLUE_KNOWLEDGE = Object.fromEntries(shared.map(([id]) => [`clue-advent-${id}`, [QUESTIONS.find(q => q.id === id)!.knowledgeId]]));
export const ADVENTURE_CLUES: readonly ClueSubject[] = shared.map(([id, answer, game, kind, clues]) => {
  const q = QUESTIONS.find(item => item.id === id)!;
  return { id: `advent-${id}`, topic: 'mario', answer, game: game || undefined, kind, clues,
    explanation: q.explanation, funFact: q.funFact, sourceUrl: q.sourceUrl, funFactSourceUrl: q.funFactSourceUrl };
});

type Place = readonly [string, ClueSubject['clues'], string, string];
const places: readonly Place[] = [
  ['Cap', ['My streets have an unusual atmosphere.', 'My residents are not ordinary humans.', 'Fog surrounds my dark buildings.', 'Bonneters turn their homes into flying ships.', 'Cappy comes from my hat-shaped town of Bonneton.'],
    'Bonneton’s hat-shaped buildings and Bonneter residents identify Cappy’s home.', 'The Bonneters can add sails to their houses and turn them into airships.'],
  ['Cascade', ['My scenery looks very ancient.', 'A powerful capture can clear a blocked path.', 'Fossils and huge waterfalls fill the landscape.', 'A sleeping T-Rex can become your wrecking crew.', 'Fossil Falls is my local name.'],
    'Fossil Falls mixes dinosaur remains with roaring waterfalls. This is where Mario finds the Odyssey.', 'Capture a Big Chain Chomp or T-Rex to smash rubble and open a shortcut.'],
  ['Sand', ['My first visit has some unexpected weather.', 'Old ruins tower above the local town.', 'Huge ice pillars initially interrupt the desert.', 'An upside-down pyramid dominates Tostarena.', 'Despite the cold start, I am Odyssey’s desert kingdom.'],
    'Tostarena’s desert begins under an icy spell. Its upside-down pyramid is the unmistakable landmark.', 'After the first pyramid battle, the pyramid rises and leaves a huge hole to investigate.'],
  ['Lake', ['My residents are famous for their craft.', 'A wedding theft causes trouble here.', 'Much of the settlement lies underwater.', 'The stolen treasure is the Lochlady Dress.', 'Lake Lamode is the home of my fashion-loving Lochladies.'],
    'The Lochladies’ underwater Water Plaza and treasured dress identify this kingdom.', 'Capture a Cheep Cheep to reach the deep tunnel below Water Plaza without running out of air. Captain Toad waits below.'],
  ['Wooded', ['Nature and machinery share my landscape.', 'My residents carefully look after plants.', 'Red metal structures rise among the trees.', 'Steam Gardeners work beneath a huge dome.', 'My forest is also called Steam Gardens.'],
    'Steam Gardens combines forest, factory structures and robots that tend flowers.', 'Flower Roads grow into temporary bridges. Keep moving before the path disappears beneath you.'],
  ['Metro', ['My locals have a busy daily routine.', 'Music helps celebrate after trouble ends.', 'Mario can ride a scooter through my streets.', 'My mayor is Pauline.', 'New Donk City is my skyscraper-filled settlement.'],
    'New Donk City is the towering city led by Pauline. Its festival turns the rescue into a musical celebration.', 'Look for the jump-rope challenge in the city: Mario’s everyday jump becomes the whole contest.'],
  ['Snow', ['My residents compete in a surprising sport.', 'The main settlement shelters below the surface.', 'Four barriers initially block the racing entrance.', 'Capturing a Shiverian lets you enter the Bound Bowl Grand Prix.', 'Shiveria hides beneath my freezing white landscape.'],
    'Shiveria is the underground town where round Shiverians compete in bouncing races.', 'Collect the four nearby Power Moons to remove the barriers before joining the race.'],
  ['Seaside', ['Visitors come here to relax.', 'A stolen local drink causes a crisis.', 'Four fountains feed a huge glass tower.', 'Bubblaine’s snails wear berets.', 'My beach resort produces the famous Sparkle Water.'],
    'Bubblaine is the beach resort with fountains and a giant glass. Uncork the fountains to reclaim its drink.', 'A captured Gushen can spray away the lava covering Hot Spring Island before the boss is defeated.'],
];
export const ODYSSEY_PLACES: readonly ClueSubject[] = places.map(([name, clues, explanation, funFact]) => ({
  id: `advent-place-${name.toLowerCase()}`, topic: 'mario', kind: 'place', game: 'Super Mario Odyssey',
  answer: `${name} Kingdom`, clues, explanation, funFact, sourceUrl: `https://www.mariowiki.com/${name}_Kingdom`,
}));
