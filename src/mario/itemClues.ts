import type { ClueSubject } from './clues.ts';
import { WORLD_SOURCES } from './worldQuestions.ts';

// World mechanics, not the similarly named items' rules in older Kart games.
// Reuse the same sourced feedback as the quiz where it tests the same mechanic.
type Entry = readonly [id: string, answer: string, clues: ClueSubject['clues'], explanation: string, fact: string, source: string];
const entries: readonly Entry[] = [
  ['feather', 'Feather',
    ['I can help you escape trouble.', 'My effect changes your movement.', 'I take your kart off the ground.', 'Good timing can carry you over an attack.', 'Use me for an instant leap without charging a jump.'],
    'Time the leap for the obstacle or attack ahead. A jump can turn a blocked path into an escape route.',
    'World lets you link wall rides into hidden routes. Practise the landing in Free Roam.', WORLD_SOURCES.direct],
  ['coin-shell', 'Coin Shell',
    ['I can affect more than one driver.', 'Other racers may benefit from what I leave behind.', 'I am thrown along the course.', 'My trail contains money for anyone to collect.', 'I am the golden projectile that scatters coins.'],
    'Aim at a rival, then watch the trail: the money is up for grabs, including by your opponents.',
    'Collecting coins increases speed. Your attack can accidentally help somebody else catch up.', WORLD_SOURCES.moves],
  ['hammer', 'Hammer',
    ['I can make a route less inviting.', 'I can still cause trouble after I land.', 'I travel through the air in an arc.', 'I briefly remain on the road as an obstacle.', 'I am a thrown tool with a handle and a heavy head.'],
    'Aim where a rival is going. Even a missed direct hit can leave a hazard in their path.',
    'Hammer Bros. also attack on Knockout Tour routes. Trouble can come from outside the racing pack.', WORLD_SOURCES.direct],
  ['ice-flower', 'Ice Flower',
    ['I let you attack from a distance.', 'My projectiles can interrupt an overtake.', 'A hit sends a rival spinning.', 'My attack gives opponents a sudden chill.', 'I launch freezing balls instead of fiery ones.'],
    'A hit chills the opponent and sends them spinning. Use the opening to slip past.',
    'World’s lower-placed racers are more likely to receive comeback items. Keep racing after a setback.', WORLD_SOURCES.direct],
  ['mega', 'Mega Mushroom',
    ['I change the driver as well as the vehicle.', 'I help you push through a crowded pack.', 'My effect includes a speed boost.', 'Your enlarged kart can flatten rivals.', 'I make you enormous instead of giving an ordinary mushroom dash.'],
    'Use your temporary size to threaten nearby rivals. The speed boost helps you reach them.',
    'In New Super Mario Bros., the giant form can smash through pipes and even the flagpole.', 'https://www.mariowiki.com/Mega_Mushroom'],
  ['block', '? Block',
    ['I reward using the item button repeatedly.', 'Each use gives a small burst of speed.', 'I add money to your carried total.', 'I pay out coins while you keep activating me.', 'My box-shaped body carries a question mark.'],
    'Keep using the item button to collect the payout. You get small speed bursts as you cash it in.',
    'World allows 20 carried coins, so there is room to build a bigger stash than in MK8 Deluxe.', WORLD_SOURCES.moves],
  ['kamek', 'Kamek',
    ['I can disrupt a whole group ahead.', 'My results can change from one use to another.', 'I can summon obstacles along the route.', 'Racers can be changed into other characters.', 'I call a broom-riding magician to cast a transformation spell.'],
    'The magic can turn rivals into unexpected drivers and fill the road with obstacles. Watch the route as well as your new face.',
    'A transformation can unlock a new racer. A spell that interrupts your drive can also grow your character collection.', 'https://www.mariowiki.com/Kamek_(item)'],
  ['food', 'Dash Food',
    ['I can change your appearance.', 'My varieties depend on where you find me.', 'I give a short speed boost when used.', 'Yoshi’s drive-thrus and trucks supply me.', 'Eat this takeaway to discover an outfit for your racer.'],
    'Try snacks in different regions to discover outfits. Some characters have several looks to collect.',
    'Unlocked outfits can be selected later: you do not need to find the same meal before every race.', 'https://www.mariowiki.com/Dash_Food'],
];
export const ITEM_CLUES: readonly ClueSubject[] = entries.map(([id, answer, clues, explanation, funFact, sourceUrl]) => ({
  id: `world-item-${id}`, topic: 'kart', kind: 'item', game: 'Mario Kart World', answer, clues, explanation, funFact, sourceUrl,
  ...(id === 'block' ? { funFactSourceUrl: WORLD_SOURCES.tips } : id === 'coin-shell' ? { funFactSourceUrl: WORLD_SOURCES.direct } : {}),
}));
