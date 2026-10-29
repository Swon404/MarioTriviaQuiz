// Mario Kart World course features reviewed 28 October 2026. This is a
// deliberately labelled selection, not a claim to cover every World course.
export type WorldCourse = {
  id: string; title: string; game: 'Mario Kart World'; sourceUrl: string;
  feature: string; explanation: string; funFact: string;
  clues: readonly [string, string, string, string, string];
};
type Entry = readonly [id: string, title: string, page: string, feature: string, explanation: string, fact: string,
  clues: WorldCourse['clues']];
const entries: readonly Entry[] = [
  ['boo', 'Boo Cinema', 'Boo_Cinema', 'Find the course where you drive through a movie screen onto giant film strips.',
    'The screen becomes a doorway into the film. The road inside looks like enormous strips of movie footage.',
    'Watch the film for Peach in her holiday outfit. She has a starring role!',
    ['My route runs through a building.', 'Ordinary entertainment becomes a racing surface here.', 'A ghostly audience suits my setting.', 'Racers pass through a screen into sepia colours.', 'Giant film strips become the road inside this haunted theatre.']],
  ['spaceport', 'DK Spaceport', 'DK_Spaceport', 'Find the course that climbs zigzagging girders towards a giant robotic ape.',
    'Climb the metal structure towards Robo DK. The zigzag layout recalls the original Donkey Kong arcade game.',
    'This climb has six sections instead of three repeated laps. Keep looking ahead for the next stretch.',
    ['My route climbs above the water.', 'Metal structures dominate my scenery.', 'The road zigzags between different heights.', 'My design recalls an old arcade construction site.', 'A giant Robo DK waits at the top of this launch-site climb.']],
  ['acorn', 'Acorn Heights', 'Acorn_Heights', 'Find the course with a treetop village, leaf platforms and rivers around giant roots.',
    'The tree is the course: drive through its village, along leaves and down towards the roots.',
    'Skeeters skim the river section. Look for their long legs on the water.',
    ['Living things shape much of my road.', 'Water flows through part of my setting.', 'Racers travel along leaves and roots.', 'A small village sits in the treetops.', 'Huge oak nuts hang around the giant tree in the far north.']],
  ['dandelion', 'Dandelion Depths', 'Dandelion_Depths', 'Find the course that descends from high bridges into caves full of giant fluffy flowers.',
    'High bridges give way to a cavern filled with oversized flowers. The drifting fluff helps identify the place.',
    'Kamek can turn a racer into Swoop here. A cave is a fitting place to discover a bat driver.',
    ['My route has dramatic changes in height.', 'Structures outside give way to a sheltered interior.', 'Bridges lead towards a cave.', 'Pale plant particles drift through the air.', 'Giant puffball flowers fill my underground section.']],
  ['ruins', 'Great ? Block Ruins', 'Great_%3F_Block_Ruins', 'Find the floating ruins with a giant question-mark structure and bouncy clouds.',
    'The huge question-mark structure towers above the clouds. Your route mixes ancient-looking stone with springy cloud landings.',
    'The approach uses a huge geyser to launch racers through a tunnel in an enormous brick block.',
    ['My route sits far above the ground.', 'Ancient-looking structures form part of my scenery.', 'Clouds can act as springy landing spots.', 'Stacks of gold fill a huge structure.', 'A giant stone question-mark block gives this sky course its name.']],
  ['starview', 'Starview Peak', 'Starview_Peak', 'Find the icy mountaintop course with a building resembling Rosalina’s observatory.',
    'The observatory-like building sits high on a frozen mountain. Look for the different-height green and yellow paths.',
    'The higher yellow path has Dash Panels where the lower green path does not. Compare the two routes.',
    ['My route rewards careful cornering.', 'Racers travel through and around a building.', 'The surrounding landscape is frozen.', 'Green and yellow paths run at different heights.', 'An observatory-like building stands on this snowy summit.']],
  ['salty', 'Salty Salty Speedway', 'Salty_Salty_Speedway', 'Find the canal course with a mermaid statue of Birdo.',
    'Birdo’s mermaid statue overlooks a watery town. Much of the racing runs along its canals.',
    'You begin this race in boat mode: the starting grid is already afloat.',
    ['Buildings surround much of my route.', 'Water is part of the racing line.', 'Walkways sit beside channels through town.', 'Racers start with their vehicles in boat mode.', 'A mermaid Birdo statue watches over these canals.']],
  ['falls', 'Cheep Cheep Falls', 'Cheep_Cheep_Falls_(race_course)', 'Find the course with pagodas beside a rushing river and rideable branches in the water.',
    'The buildings and river identify this waterfall route. Branches offer Rail Rides above the flowing water.',
    'Coming from Dandelion Depths sends racers down from the big waterfall, giving the approach a different view.',
    ['My scenery mixes buildings with nature.', 'Water helps shape the route.', 'Racers pass beneath pagodas.', 'Branches in a river can be ridden like rails.', 'My name pairs Mario’s familiar fish with cascading water.']],
  ['jungle', 'Dino Dino Jungle', 'Dino_Dino_Jungle#Mario_Kart_World', 'Find the World course where a Triceratops can become a ramp beside a dinosaur laboratory.',
    'The three-horned dinosaur can help launch your kart. World adds a laboratory to this prehistoric route.',
    'Some long-necked reptiles can be used for Rail Rides. Even the wildlife offers alternative paths.',
    ['Wildlife shares my racing space.', 'Some creatures here can help your journey.', 'A laboratory occupies part of the route.', 'A three-horned animal can be used as a ramp.', 'T. Rexes roam this prehistoric forest course.']],
  ['crown', 'Crown City', 'Crown_City', 'Find the World course with a huge trophy-shaped landmark topped by a crowned tyre.',
    'Look up from the streets: a giant crowned tyre tops the trophy landmark. It is the skyline’s standout feature.',
    'Grand Prix uses this location twice, with different routes through its streets.',
    ['Man-made structures dominate my surroundings.', 'Different visits can take different routes.', 'A suspension bridge links me to another area.', 'A huge trophy-shaped landmark rises over the streets.', 'A crowned tyre stands above this busy urban course.']],
];

export const WORLD_COURSES: readonly WorldCourse[] = entries.map(([id, title, page, feature, explanation, funFact, clues]) => ({
  id: `world-${id}`, title, game: 'Mario Kart World', sourceUrl: `https://www.mariowiki.com/${page}`,
  feature, explanation, funFact, clues,
}));
