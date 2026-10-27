import { CHARACTER_DISCOVERIES, POWER_DISCOVERIES, GAME_DISCOVERIES, type Discovery } from './discoveries.ts';

export type BaseCategory = 'friend' | 'baddie' | 'power-up' | 'game' | 'system';
export type FinderCategory = BaseCategory | 'classic-game' | 'wii-game' | 'switch-game' | 'handheld-game'
  | 'wonder-power' | 'world-newcomer' | '3d-power' | 'wonder-player' | '3d-starter' | 'wonder-safe' | 'classic-handheld';
export const CATEGORY_LABELS: Record<FinderCategory, string> = {
  friend: 'friendly character', baddie: 'baddie', 'power-up': 'power-up',
  game: 'Mario game', system: 'Nintendo system',
  'classic-game': 'Mario game released before 2000',
  'wii-game': 'Mario game originally released for Wii',
  'switch-game': 'Mario game originally released for Nintendo Switch',
  'handheld-game': 'Mario game originally released for Game Boy, DS or 3DS',
  'wonder-power': 'power-up introduced in Super Mario Bros. Wonder',
  'world-newcomer': 'driver who made their Mario Kart racing debut in World',
  '3d-power': 'power-up for cloning yourself or climbing walls in Super Mario 3D World',
  'wonder-player': 'playable character in the original Switch version of Wonder',
  '3d-starter': 'character available before any unlocks in Super Mario 3D World',
  'wonder-safe': 'character who takes no enemy damage in the original Wonder',
  'classic-handheld': 'Mario game first released on a handheld before 2000',
};

export type CategoryItem = {
  id: string;
  number: number;
  name: string;
  category: BaseCategory;
  memberships?: readonly FinderCategory[];
  detail: string;
  detailSourceUrl?: string;
  sourceUrl: string;
};

const characters = 'https://mario.nintendo.com/characters/';
const baddies = 'https://media.nintendo.com/supermarioparty/characters/';
const powers = 'https://supermariobroswonder.nintendo.com/';
const extraPowers = 'https://www.nintendo.com/us/whatsnew/wahoo-see-the-platforming-history-of-super-mario-and-even-get-a-few-fun-facts/';
const history = 'https://www.nintendo.com/us/explore/characters/mario/history/';
const wonder = 'https://supermariobroswonder.nintendo.com/';
const world = 'https://www.nintendo.com/us/whatsnew/mario-kart-world-direct-revs-up-new-details-on-the-biggest-mario-kart-ever-coming-to-nintendo-switch-2-at-launch/';
const world3d = 'https://www.nintendo.com/sg/switch/auzp/3dworld/index.html';

type Entry = readonly [name: string, detail: string, sourceUrl: string];
const groups: Record<BaseCategory, readonly Entry[]> = {
  friend: [
    ['Mario', 'Mario is a plumber and an all-round Mushroom Kingdom hero.', characters],
    ['Luigi', 'Luigi is taller than Mario and can jump higher.', characters],
    ['Princess Peach', 'Peach enjoys baking and playing sports.', characters],
    ['Toad', 'Toad helps Peach and the Mario brothers protect the kingdom.', characters],
    ['Yoshi', 'Yoshi can turn things he eats into eggs to throw.', characters],
    ['Daisy', 'Daisy is the cheerful princess of Sarasaland.', characters],
    ['Rosalina', 'Rosalina looks after a family of star-like Lumas.', characters],
    ['Toadette', 'Toadette is one of the playable friends in Super Mario Bros. Wonder.', wonder],
  ],
  baddie: [
    ['Bowser', 'Bowser is the King of the Koopas and Mario’s archrival.', characters],
    ['Bowser Jr.', 'Bowser Jr. is the only son of Bowser.', characters],
    ['Boo', 'Boos are shy ghosts that cover their eyes when spotted.', characters],
    ['Goomba', 'Goombas are among Bowser’s familiar underlings.', characters],
    ['Koopa Troopa', 'Koopa Troopa carries its home on its back.', baddies],
    ['Hammer Bro', 'Hammer Bro wears a helmet and throws hammers.', baddies],
    ['Shy Guy', 'Shy Guy hides behind a mask.', baddies],
    ['Dry Bones', 'Dry Bones can fall apart and recover.', baddies],
  ],
  'power-up': [
    ['Super Mushroom', 'The Super Mushroom makes small Mario bigger.', powers],
    ['Fire Flower', 'The Fire Flower lets Mario throw bouncing fireballs.', powers],
    ['Elephant Fruit', 'The Elephant Fruit gives Mario a useful trunk.', powers],
    ['Bubble Flower', 'Bubbles can trap enemies or serve as short-lived platforms.', powers],
    ['Drill Mushroom', 'The Drill Mushroom lets Mario burrow through some ground.', powers],
    ['Super Star', 'The Super Star is one of Mario’s long-running power-ups.', extraPowers],
    ['Super Leaf', 'Nintendo lists the Super Leaf among Mario’s iconic power-ups.', extraPowers],
    ['Boomerang Flower', 'Nintendo lists the Boomerang Flower among Mario’s power-ups.', extraPowers],
  ],
  game: [
    ['Super Mario Bros.', 'This NES game begins Nintendo’s Super Mario history timeline.', history],
    ['Super Mario World', 'Nintendo lists Super Mario World for the Super Nintendo.', history],
    ['Super Mario 64', 'Nintendo lists Super Mario 64 for Nintendo 64.', history],
    ['Super Mario Sunshine', 'Nintendo lists Sunshine for the GameCube.', history],
    ['Super Mario Galaxy', 'Nintendo lists Galaxy for Wii.', history],
    ['Super Mario 3D World', 'Nintendo lists 3D World for Wii U.', history],
    ['Super Mario Odyssey', 'Nintendo lists Odyssey for Nintendo Switch.', history],
    ['Super Mario Bros. Wonder', 'Nintendo lists Wonder for Nintendo Switch.', history],
  ],
  system: [
    ['NES', 'Nintendo lists the first Super Mario Bros. game for this system.', history],
    ['Game Boy', 'Nintendo lists Super Mario Land for this handheld.', history],
    ['Super Nintendo', 'Nintendo lists Super Mario World for this system.', history],
    ['Nintendo 64', 'Nintendo lists Super Mario 64 for this system.', history],
    ['GameCube', 'Nintendo lists Super Mario Sunshine for this system.', history],
    ['Wii', 'Nintendo lists Super Mario Galaxy for this system.', history],
    ['Nintendo 3DS', 'Nintendo lists Super Mario 3D Land for this handheld.', history],
    ['Nintendo Switch', 'Nintendo lists Super Mario Odyssey for this system.', history],
  ],
};

const order: readonly BaseCategory[] = ['friend', 'baddie', 'power-up', 'game', 'system'];
const gameDiscoveryIds: Readonly<Record<string, string>> = {
  'Super Mario Bros.': 'smb', 'Super Mario World': 'world', 'Super Mario 64': 'mario64',
  'Super Mario Sunshine': 'sunshine', 'Super Mario Galaxy': 'galaxy', 'Super Mario 3D World': 'world3d',
  'Super Mario Odyssey': 'odyssey', 'Super Mario Bros. Wonder': 'wonder', 'Super Mario Land': 'land',
  'Super Mario Galaxy 2': 'galaxy2', 'New Super Mario Bros.': 'new-ds', 'Super Mario Maker 2': 'maker2',
  'Super Mario Land 2: 6 Golden Coins': 'land2', 'Super Mario 3D Land': 'land3d', 'New Super Mario Bros. Wii': 'new-wii',
  NES: 'smb', 'Game Boy': 'land', 'Super Nintendo': 'world', 'Nintendo 64': 'mario64',
  GameCube: 'sunshine', Wii: 'galaxy', 'Nintendo 3DS': 'land3d', 'Nintendo Switch': 'odyssey',
};
const worldDesign = 'https://www.nintendo.com/en-ca/whatsnew/ask-the-developer-vol-18-mario-kart-world-part-3/';
const cowDiscovery = { text: 'Cow became a racer after a designer drew her driving a truck. The team tried it, liked it, and gave the farm animal a career change.', sourceUrl: worldDesign };
function itemDiscovery(name: string): Discovery {
  if (name === 'Cow') return cowDiscovery;
  if (name === 'Spike') return { text: 'Spike normally spits spiked balls at Mario. World promotes this roadside troublemaker to the driving seat.', sourceUrl: 'https://www.mariowiki.com/Spike' };
  const discovery = CHARACTER_DISCOVERIES[name] ?? POWER_DISCOVERIES[name] ?? GAME_DISCOVERIES[gameDiscoveryIds[name]];
  if (!discovery) throw new Error(`Missing Category Finder discovery: ${name}`);
  return discovery;
}

export const CATEGORY_EXPLANATIONS: Record<FinderCategory, string> = {
  friend: 'These characters help Mario and his friends on their adventures.',
  baddie: 'These familiar troublemakers can stand between Mario and the goal.',
  'power-up': 'A power-up changes what your character can do. Pick one up and try its special ability.',
  game: 'These are games you can play, rather than characters or consoles.',
  system: 'These are Nintendo consoles or handhelds—the machines that run the games.',
  'classic-game': 'These adventures first launched before the year 2000.',
  'wii-game': 'These games began on Wii. A later re-release does not change their first home.',
  'switch-game': 'These adventures first launched on Nintendo Switch.',
  'handheld-game': 'Their first homes were Game Boy, DS or 3DS: Mario adventures made for handheld play.',
  'wonder-power': 'Elephant Fruit, Bubble Flower and Drill Mushroom made their debut in Wonder.',
  'world-newcomer': 'World gave these characters their Mario Kart racing debut.',
  '3d-power': 'The Super Bell gives climbing claws; the Double Cherry creates a copy of your character.',
  'wonder-player': 'These characters are playable in the original Switch version of Wonder.',
  '3d-starter': 'Mario, Luigi, Peach and Toad are ready from the start. Rosalina needs unlocking.',
  'wonder-safe': 'Yoshi avoids enemy damage in Wonder. Pits can still end the run!',
  'classic-handheld': 'These Game Boy adventures arrived before 2000.',
};

export const CATEGORY_DISCOVERIES: Partial<Record<FinderCategory, Discovery>> = {
  'classic-game': GAME_DISCOVERIES.smb,
  'wii-game': GAME_DISCOVERIES['new-wii'],
  'switch-game': GAME_DISCOVERIES.odyssey,
  'handheld-game': GAME_DISCOVERIES.land,
  'wonder-power': POWER_DISCOVERIES['Elephant Fruit'],
  'world-newcomer': cowDiscovery,
  '3d-power': POWER_DISCOVERIES['Double Cherry'],
  'wonder-player': { text: 'In Wonder co-op, another player can ride a Yoshi player. Your teammate can also be your transport.', sourceUrl: wonder },
  '3d-starter': CHARACTER_DISCOVERIES.Toad,
  'wonder-safe': { text: 'Yoshi cannot use Wonder’s usual power-up transformations. His flutter jump and tongue give him his own set of tricks instead.', sourceUrl: wonder },
  'classic-handheld': GAME_DISCOVERIES.land2,
};
const entries = Array.from({ length: 8 }, (_, row) =>
  order.map((category, column) => {
    const [name, detail, sourceUrl] = groups[category][row];
    return { id: `${category}-${row}`, number: row * order.length + column + 1, name, category, detail, sourceUrl };
  }),
).flat();

// Stable consecutive catalogue, but not five repeating category columns.
// Keep entity IDs independent of their display position.
const CATALOG_ORDER = [6,24,17,0,33,12,29,4,21,15,38,9,26,2,35,19,7,31,14,22,1,36,11,28,5,34,18,3,25,39,10,32,8,27,16,30,23,13,37,20];
const extraGames = [
  ['land', 'Super Mario Land', 'Game Boy, 1989.'],
  ['galaxy2', 'Super Mario Galaxy 2', 'Wii, 2010.'],
  ['new-ds', 'New Super Mario Bros.', 'Nintendo DS, 2006.'],
  ['maker2', 'Super Mario Maker 2', 'Nintendo Switch, 2019.'],
  ['land2', 'Super Mario Land 2: 6 Golden Coins', 'Game Boy, 1992.'],
  ['land3d', 'Super Mario 3D Land', 'Nintendo 3DS, 2011.'],
  ['new-wii', 'New Super Mario Bros. Wii', 'Wii, 2009.'],
] as const;
const contextual: Partial<Record<FinderCategory, readonly string[]>> = {
  'classic-game': ['Super Mario Bros.', 'Super Mario World', 'Super Mario 64', 'Super Mario Land', 'Super Mario Land 2: 6 Golden Coins'],
  'wii-game': ['Super Mario Galaxy', 'Super Mario Galaxy 2', 'New Super Mario Bros. Wii'],
  'switch-game': ['Super Mario Odyssey', 'Super Mario Bros. Wonder', 'Super Mario Maker 2'],
  'handheld-game': ['Super Mario Land', 'Super Mario Land 2: 6 Golden Coins', 'New Super Mario Bros.', 'Super Mario 3D Land'],
  'wonder-power': ['Elephant Fruit', 'Bubble Flower', 'Drill Mushroom'],
  'world-newcomer': ['Goomba', 'Cow', 'Spike'],
  '3d-power': ['Super Bell', 'Double Cherry'],
  'wonder-player': ['Mario', 'Luigi', 'Princess Peach', 'Toad', 'Yoshi', 'Daisy', 'Toadette'],
  '3d-starter': ['Mario', 'Luigi', 'Princess Peach', 'Toad'],
  'wonder-safe': ['Yoshi'],
  'classic-handheld': ['Super Mario Land', 'Super Mario Land 2: 6 Golden Coins'],
};
// Sources and pools describe the relationship, not just the selected character.
export const CATEGORY_CHALLENGES: Partial<Record<FinderCategory, { pool: 'game' | 'character' | 'power-up'; levels: readonly string[]; sourceUrl: string; note: string }>> = {
  ...Object.fromEntries(['classic-game', 'wii-game', 'switch-game', 'handheld-game'].map(id => [id, { pool: 'game' as const, levels: ['scientist', 'professor'], sourceUrl: history, note: 'Use the original release, not a later port or collection.' }])),
  'wonder-power': { pool: 'power-up', levels: ['scientist'], sourceUrl: wonder, note: 'Elephant Fruit, Bubble Flower and Drill Mushroom were new in Wonder.' },
  'world-newcomer': { pool: 'character', levels: ['scientist', 'professor'], sourceUrl: world, note: 'Goomba, Spike and Cow joined the racing roster in Mario Kart World.' },
  '3d-power': { pool: 'power-up', levels: ['scientist'], sourceUrl: world3d, note: 'The Super Bell gives you wall-climbing claws; the Double Cherry makes a copy of you.' },
  'wonder-player': { pool: 'character', levels: ['scientist'], sourceUrl: wonder, note: 'This asks about the original Switch game, without the Switch 2 expansion.' },
  '3d-starter': { pool: 'character', levels: ['professor'], sourceUrl: world3d, note: 'Mario, Luigi, Peach and Toad are available from the start. Rosalina must be unlocked.' },
  'wonder-safe': { pool: 'character', levels: ['professor'], sourceUrl: wonder, note: 'Yoshi and Nabbit avoid enemy damage, but can still fall into pits. Only Yoshi is on these boards.' },
  'classic-handheld': { pool: 'game', levels: ['professor'], sourceUrl: history, note: 'Super Mario Land and Land 2 began on Game Boy, before 2000.' },
};
export const CATEGORY_ITEMS: readonly CategoryItem[] = [
  ...CATALOG_ORDER.map(index => entries[index]),
  ...extraGames.map(([id, name, detail]) => ({ id: `game-${id}`, name, detail: `Nintendo's US timeline lists this game for ${detail}`, category: 'game' as const, sourceUrl: history })),
  ...(['Super Bell', 'Double Cherry', 'Mega Mushroom'] as const).map((name, index) => ({ id: `power-extra-${index}`, name, detail: ['The Super Bell gives you cat claws for climbing.', 'The Double Cherry makes another copy of your character.', 'The Mega Mushroom makes you enormous.'][index], category: 'power-up' as const, sourceUrl: world3d })),
  { id: 'friend-cow', name: 'Cow', detail: 'Cow joins the drivers in Mario Kart World.', category: 'friend' as const, sourceUrl: world },
  { id: 'baddie-spike', name: 'Spike', detail: 'Spike is another new racer in Mario Kart World.', category: 'baddie' as const, sourceUrl: world },
].map((item, position) => ({ ...item, detail: itemDiscovery(item.name).text, detailSourceUrl: itemDiscovery(item.name).sourceUrl, number: position + 1,
  memberships: [item.category, ...Object.entries(contextual).filter(([, names]) => names!.includes(item.name)).map(([category]) => category as FinderCategory)],
}));

export const categoryMemberships = (item: CategoryItem): readonly FinderCategory[] => item.memberships ?? [item.category];
export const fitsCategory = (item: CategoryItem, category: string): boolean => categoryMemberships(item).some(value => value === category);
// Prefer near misses before filling from the same broad family. Never put a
// second valid answer on Pro's board, even if it appears in this editorial list.
const CLOSE_ALTERNATIVES: Partial<Record<FinderCategory, readonly string[]>> = {
  'classic-game': ['Super Mario Sunshine', 'New Super Mario Bros.', 'Super Mario Galaxy'],
  'wii-game': ['Super Mario 3D World', 'New Super Mario Bros.', 'Super Mario 3D Land'],
  'switch-game': ['Super Mario 3D World', 'Super Mario Galaxy', 'Super Mario Sunshine'],
  'handheld-game': ['New Super Mario Bros. Wii', 'Super Mario 3D World', 'Super Mario World'],
  'wonder-power': ['Fire Flower', 'Super Mushroom', 'Super Star'],
  'world-newcomer': ['Koopa Troopa', 'Shy Guy', 'Dry Bones', 'Bowser Jr.', 'Boo'],
  '3d-power': ['Super Leaf', 'Boomerang Flower', 'Mega Mushroom', 'Fire Flower'],
  'wonder-player': ['Rosalina', 'Bowser Jr.', 'Koopa Troopa'],
};
export const categoryDistractorRank = (item: CategoryItem, category: FinderCategory): number =>
  CLOSE_ALTERNATIVES[category]?.includes(item.name) ? 1 : 0;
export const categoryContext = (category: FinderCategory): string => category.endsWith('-game')
  ? 'Use the original release on Nintendo’s US history timeline, not a later port or collection.' : '';
