export type BaseCategory = 'friend' | 'baddie' | 'power-up' | 'game' | 'system';
export type FinderCategory = BaseCategory | 'classic-game' | 'wii-game' | 'switch-game' | 'handheld-game';
export const CATEGORY_LABELS: Record<FinderCategory, string> = {
  friend: 'friendly character', baddie: 'baddie', 'power-up': 'power-up',
  game: 'Mario game', system: 'Nintendo system',
  'classic-game': 'Mario game released before 2000',
  'wii-game': 'Mario game originally released for Wii',
  'switch-game': 'Mario game originally released for Nintendo Switch',
  'handheld-game': 'Mario game originally released for Game Boy, DS or 3DS',
};

export type CategoryItem = {
  id: string;
  number: number;
  name: string;
  category: BaseCategory;
  memberships?: readonly FinderCategory[];
  detail: string;
  sourceUrl: string;
};

const characters = 'https://mario.nintendo.com/characters/';
const baddies = 'https://media.nintendo.com/supermarioparty/characters/';
const powers = 'https://supermariobroswonder.nintendo.com/';
const extraPowers = 'https://www.nintendo.com/us/whatsnew/wahoo-see-the-platforming-history-of-super-mario-and-even-get-a-few-fun-facts/';
const history = 'https://www.nintendo.com/us/explore/characters/mario/history/';
const wonder = 'https://supermariobroswonder.nintendo.com/';

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
] as const;
const contextual: Partial<Record<FinderCategory, readonly string[]>> = {
  'classic-game': ['Super Mario Bros.', 'Super Mario World', 'Super Mario 64', 'Super Mario Land', 'Super Mario Land 2: 6 Golden Coins'],
  'wii-game': ['Super Mario Galaxy', 'Super Mario Galaxy 2'],
  'switch-game': ['Super Mario Odyssey', 'Super Mario Bros. Wonder', 'Super Mario Maker 2'],
  'handheld-game': ['Super Mario Land', 'Super Mario Land 2: 6 Golden Coins', 'New Super Mario Bros.', 'Super Mario 3D Land'],
};
export const CATEGORY_ITEMS: readonly CategoryItem[] = [
  ...CATALOG_ORDER.map(index => entries[index]),
  ...extraGames.map(([id, name, detail]) => ({ id: `game-${id}`, name, detail: `Nintendo's US timeline lists this game for ${detail}`, category: 'game' as const, sourceUrl: history })),
].map((item, position) => ({ ...item, number: position + 1,
  memberships: [item.category, ...Object.entries(contextual).filter(([, names]) => names!.includes(item.name)).map(([category]) => category as FinderCategory)],
}));

export const categoryMemberships = (item: CategoryItem): readonly FinderCategory[] => item.memberships ?? [item.category];
export const fitsCategory = (item: CategoryItem, category: string): boolean => categoryMemberships(item).some(value => value === category);
export const categoryContext = (category: FinderCategory): string => category.endsWith('-game')
  ? 'Use the original release on Nintendo’s US history timeline, not a later port or collection.' : '';
