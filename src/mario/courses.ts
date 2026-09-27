export const BOOSTER_SOURCE = 'https://en-americas-support.nintendo.com/app/answers/detail/a_id/57858/';

export type CourseAppearance = {
  id: string;
  title: string;
  game: 'Mario Kart 8 Deluxe';
  content: 'Booster Course Pass';
  cup: string;
  wave: number;
  position: number;
  sourceUrl: string;
};

type Cup = readonly [name: string, courses: readonly [string, string, string, string]];

const WAVES: readonly (readonly [Cup, Cup])[] = [
  [
    ['Golden Dash Cup', ['Tour Paris Promenade', '3DS Toad Circuit', 'N64 Choco Mountain', 'Wii Coconut Mall']],
    ['Lucky Cat Cup', ['Tour Tokyo Blur', 'DS Shroom Ridge', 'GBA Sky Garden', 'Tour Ninja Hideaway']],
  ],
  [
    ['Turnip Cup', ['Tour New York Minute', 'SNES Mario Circuit 3', 'N64 Kalimari Desert', 'DS Waluigi Pinball']],
    ['Propeller Cup', ['Tour Sydney Sprint', 'GBA Snow Land', 'Wii Mushroom Gorge', 'Sky-High Sundae']],
  ],
  [
    ['Rock Cup', ['Tour London Loop', 'GBA Boo Lake', '3DS Rock Rock Mountain', 'Wii Maple Treeway']],
    ['Moon Cup', ['Tour Berlin Byways', 'DS Peach Gardens', 'Merry Mountain', '3DS Rainbow Road']],
  ],
  [
    ['Fruit Cup', ['Tour Amsterdam Drift', 'GBA Riverside Park', 'Wii DK Summit', "Yoshi's Island"]],
    ['Boomerang Cup', ['Tour Bangkok Rush', 'DS Mario Circuit', 'GCN Waluigi Stadium', 'Tour Singapore Speedway']],
  ],
  [
    ['Feather Cup', ['Tour Athens Drift', 'GCN Daisy Cruiser', 'Wii Moonview Highway', 'Squeaky Clean Sprint']],
    ['Cherry Cup', ['Tour Los Angeles Laps', 'GBA Sunset Wilds', 'Wii Koopa Cape', 'Tour Vancouver Velocity']],
  ],
  [
    ['Acorn Cup', ['Tour Rome Avanti', 'GCN DK Mountain', 'Wii Daisy Circuit', 'Piranha Plant Cove']],
    ['Spiny Cup', ['Tour Madrid Drive', "3DS Rosalina's Ice World", 'SNES Bowser Castle 3', 'Wii Rainbow Road']],
  ],
];

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const BOOSTER_COURSES: readonly CourseAppearance[] = WAVES.flatMap((cups, waveIndex) =>
  cups.flatMap(([cup, courses]) => courses.map((title, courseIndex) => ({
    id: `mk8dx-bcp-${slug(title)}`,
    title,
    game: 'Mario Kart 8 Deluxe' as const,
    content: 'Booster Course Pass' as const,
    cup,
    wave: waveIndex + 1,
    position: courseIndex + 1,
    sourceUrl: BOOSTER_SOURCE,
  }))),
);
