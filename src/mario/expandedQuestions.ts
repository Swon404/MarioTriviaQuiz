import type { Category, Difficulty, Topic, TriviaQuestion } from './questions.ts';

// Short, original wording based on Nintendo's game pages, manuals and update notes.
// Bugs below are historical fixed issues, never instructions for reproducing them.
const sources = {
  characters: 'https://mario.nintendo.com/characters/',
  enemies: 'https://media.nintendo.com/supermarioparty/characters/',
  history: 'https://www.nintendo.com/us/explore/characters/mario/history/',
  historyFacts: 'https://www.nintendo.com/us/whatsnew/wahoo-see-the-platforming-history-of-super-mario-and-even-get-a-few-fun-facts/',
  wonder: 'https://supermariobroswonder.nintendo.com/',
  wonderPowers: 'https://www.nintendo.com/us/whatsnew/get-a-jump-on-super-mario-bros-wonder-with-these-powerful-power-ups/',
  kartItems: 'https://mariokart8deluxe.nintendo.com/',
  kartCourses: 'https://en-americas-support.nintendo.com/app/answers/detail/a_id/57858/',
  kartWorld: 'https://www.nintendo.com/us/whatsnew/mario-kart-world-direct-revs-up-new-details-on-the-biggest-mario-kart-ever-coming-to-nintendo-switch-2-at-launch/',
  kartUpdates: 'https://en-americas-support.nintendo.com/app/answers/detail/a_id/68580/',
} as const;

type Source = keyof typeof sources;
type Entry = readonly [
  topic: Topic, difficulty: Difficulty, category: Category, prompt: string,
  answer: string, wrong1: string, wrong2: string, wrong3: string,
  explanation: string, funFact: string, source: Source,
];

const entries: readonly Entry[] = [
  // Mario: Explorer
  ['mario','explorer','power-ups','In Super Mario Bros. Wonder, which item turns Mario into an elephant?','Elephant Fruit','Bubble Flower','Drill Mushroom','Fire Flower','The Elephant Fruit gives Mario a trunk. He can use it to hit enemies and break blocks.','Elephant Mario can scoop up water and spray it from his trunk.','wonder'],
  ['mario','explorer','power-ups','Which Wonder power-up makes bubbles you can jump on?','Bubble Flower','Elephant Fruit','Drill Mushroom','Super Mushroom','The Bubble Flower lets you blow bubbles. They can trap enemies or act as short-lived platforms.','A bubble pops after you jump on it, so plan the next landing.','wonderPowers'],
  ['mario','explorer','power-ups','What does a Super Mushroom do to Mario in Super Mario Bros. Wonder?','Makes him bigger','Lets him drill underground','Gives him a trunk','Makes him blow bubbles','The Super Mushroom changes small Mario into Super Mario. It is one of the series’ best-known power-ups.','Nintendo jokes that the Super Mushroom is a power-up that really grows on you.','wonderPowers'],
  ['mario','explorer','baddies','Which Mario enemy wears a shell on its back?','Koopa Troopa','Goomba','Boo','Shy Guy','A Koopa Troopa is one of Bowser’s familiar underlings. Its shell is the big clue here.','Koopa Troopa is also a playable character in Super Mario Party.','enemies'],
  ['mario','explorer','baddies','Which shy Mario enemy is a ghost?','Boo','Goomba','Hammer Bro','Monty Mole','Boos are ghosts that appear in spooky places. They often stop moving when someone looks at them.','Nintendo says Boos cover their eyes when they are seen.','characters'],
  ['mario','explorer','games','Which game lets you build your own Super Mario levels?','Super Mario Maker','Super Mario Galaxy','Super Mario Run','Super Mario Sunshine','Super Mario Maker is about making and playing Mario courses. Nintendo first listed it for Wii U.','A sequel, Super Mario Maker 2, later arrived on Nintendo Switch.','history'],
  ['mario','explorer','characters','Which Mario friend uses a long tongue to gobble up enemies?','Yoshi','Toad','Luigi','Diddy Kong','Yoshi can catch fruit and enemies with his tongue. He can turn what he eats into eggs to throw.','Yoshis can be green, red, blue, pink or yellow.','characters'],

  // Mario: Scientist
  ['mario','scientist','power-ups','Which Wonder power-up lets you burrow through some floors and ceilings?','Drill Mushroom','Bubble Flower','Elephant Fruit','Fire Flower','The Drill Mushroom gives Mario a drill. He can hide underground and reach some secret spaces in ceilings.','The drill can also protect Mario from certain enemies falling on his head.','wonderPowers'],
  ['mario','scientist','power-ups','Which Wonder power-up shoots bouncing fireballs?','Fire Flower','Bubble Flower','Drill Mushroom','Elephant Fruit','The Fire Flower lets Mario throw fireballs that bounce along. Those shots can also help with icy blocks.','Fire Mario can throw fireballs while crouching in Super Mario Bros. Wonder.','wonderPowers'],
  ['mario','scientist','baddies','Which masked troublemaker is playable in Super Mario Party?','Shy Guy','Boo','Goomba','Dry Bones','Shy Guy hides behind a mask and often gets in the way. Super Mario Party lets players choose him.','Nintendo describes Shy Guy as a masked rascal.','enemies'],
  ['mario','scientist','baddies','Which enemy throws hammers and wears a helmet?','Hammer Bro','Monty Mole','Goomba','Boo','Hammer Bro is one of Bowser’s Koopa Troop. A helmet and thrown hammers make him easy to recognise.','Hammer Bro became playable in Super Mario Party.','enemies'],
  ['mario','scientist','games','Which Mario game sends its adventure across the galaxy?','Super Mario Galaxy','Super Mario Sunshine','Super Mario Land','Super Mario Maker','Super Mario Galaxy took Mario into space on Wii. Nintendo lists a sequel on the same console.','Super Mario Galaxy 2 followed in 2010 on Nintendo’s timeline.','history'],
  ['mario','scientist','consoles','Which handheld did New Super Mario Bros. first appear on?','Nintendo DS','Game Boy','Nintendo 3DS','Game Boy Advance','Nintendo lists New Super Mario Bros. as a Nintendo DS game. It arrived before the Wii follow-up.','Nintendo places the DS game in 2006 and the Wii game in 2009.','history'],
  ['mario','scientist','characters','Which princess comes from Sarasaland?','Daisy','Peach','Rosalina','Toadette','Daisy is the princess of Sarasaland, a different kingdom from Peach’s Mushroom Kingdom.','Daisy is fond of sport and often joins Mario and friends in games.','characters'],

  // Mario: Professor
  ['mario','professor','power-ups','In Super Mario Bros. Wonder, which form can water a wilted flower bud?','Elephant form','Bubble form','Drill form','Fire form','Elephant Mario can carry water in his trunk and spray it. The spray can affect things in a course.','The elephant trunk can also swat enemies and break blocks.','wonderPowers'],
  ['mario','professor','power-ups','Which Wonder form can make bubbles to the left and right during a spin jump?','Bubble form','Fire form','Elephant form','Drill form','Bubble Mario can send bubbles in both directions during a spin jump. It helps when enemies crowd around.','Those bubbles can double as tiny platforms for a tricky jump.','wonderPowers'],
  ['mario','professor','baddies','Which Super Mario Party character is a mole?','Monty Mole','Dry Bones','Pom Pom','Hammer Bro','Monty Mole is a mischievous mole. Super Mario Party made the character playable.','Nintendo called it Monty Mole’s first playable Mario Party appearance.','enemies'],
  ['mario','professor','baddies','Which baddie can fall apart and then recover in Super Mario Party?','Dry Bones','Shy Guy','Goomba','Boo','Dry Bones is a skeletal enemy. Nintendo says it falls apart under pressure but recovers quickly.','Dry Bones can be chosen as a character in Super Mario Party.','enemies'],
  ['mario','professor','games','What name did Mario have in the 1981 Donkey Kong arcade game?','Jumpman','Mr. L','Captain Toad','Professor E. Gadd','Nintendo says the character went by Jumpman in Donkey Kong. Mario’s familiar name came later.','Shigeru Miyamoto first considered calling the character Mr. Video.','historyFacts'],
  ['mario','professor','consoles','Which Nintendo handheld had Super Mario Land 2: 6 Golden Coins?','Game Boy','Nintendo DS','Nintendo 3DS','Game Boy Advance','Nintendo places the second Super Mario Land game on Game Boy. It followed the first one on the same handheld.','The subtitle names the six Golden Coins that Mario must collect.','history'],
  ['mario','professor','characters','Which character has a red necktie marked with his initials?','Donkey Kong','Diddy Kong','Bowser','Wario','Donkey Kong wears a red DK tie. Nintendo describes him as the king of the jungle.','His treehouse holds a large stash of bananas.','characters'],

  // Mario Kart: Explorer
  ['kart','explorer','tracks','Which Booster Course Pass track is named after a frozen dessert?','Sky-High Sundae','Choco Mountain','Coconut Mall','Snow Land','Sky-High Sundae is a sweetly named course in the Propeller Cup. Its name is the clue.','The same cup also includes Sydney Sprint.','kartCourses'],
  ['kart','explorer','tracks','Which Booster Course Pass track has a secret-hideout name?','Ninja Hideaway','Shroom Ridge','Boo Lake','Maple Treeway','Ninja Hideaway closes the Lucky Cat Cup in Mario Kart 8 Deluxe.','The Lucky Cat Cup begins with Tokyo Blur.','kartCourses'],
  ['kart','explorer','power-ups','In Mario Kart 8 Deluxe, which item gives your kart a short speed boost?','Mushroom','Banana','Blooper','Lightning','A Mushroom gives a quick burst of speed. It can help you catch a rival or take a shortcut.','The Golden Mushroom lets you use repeated boosts for a short time.','kartItems'],
  ['kart','explorer','power-ups','Which Mario Kart 8 Deluxe item drops ink over racers ahead?','Blooper','Boo','Bullet Bill','Bob-omb','Blooper sprays ink that briefly blocks the view of drivers in front of you.','Unlike Blooper, Boo can make your kart ghostly for a while.','kartItems'],
  ['kart','explorer','glitches','Nintendo fixed a Mario Kart World bug where a racer could get stuck on a fence in which course?','Mario Circuit','Boo Cinema','Rainbow Road','Choco Mountain','An older Mario Kart World version could trap a Mega Mushroom driver on a Mario Circuit fence. Nintendo listed a fix.','The same update also fixed a wall-riding problem on Mario Circuit.','kartUpdates'],
  ['kart','explorer','glitches','Which Mario Kart World course once had item boxes that sometimes failed to appear?','Wario Shipyard','Crown City','Boo Cinema','Starview Peak','Nintendo’s update notes describe missing item boxes on Wario Shipyard. The bug was fixed in an update.','Another Shipyard fix stopped racers slipping through the bottom of a rock.','kartUpdates'],
  ['kart','explorer','games','Which Mario Kart game lets you explore in Free Roam?','Mario Kart World','Mario Kart 8 Deluxe','Mario Kart Wii','Mario Kart DS','Free Roam is a Mario Kart World mode for exploring its connected setting outside a race.','Nintendo says players can find hidden coins while exploring.','kartWorld'],

  // Mario Kart: Scientist
  ['kart','scientist','tracks','Which Booster Course Pass cup contains GBA Snow Land?','Propeller Cup','Rock Cup','Fruit Cup','Cherry Cup','Snow Land is a returning Game Boy Advance course in the Propeller Cup.','The Propeller Cup closes with Sky-High Sundae.','kartCourses'],
  ['kart','scientist','tracks','Which Booster Course Pass cup contains GBA Sunset Wilds?','Cherry Cup','Feather Cup','Acorn Cup','Moon Cup','Sunset Wilds is a Game Boy Advance course in the Cherry Cup.','That cup opens with Los Angeles Laps.','kartCourses'],
  ['kart','scientist','power-ups','Which Mario Kart 8 Deluxe item can send nearby items flying with a honk?','Super Horn','Blooper','Coin','Feather','The Super Horn creates a loud blast around your kart. It can knock away nearby vehicles and items.','The same game also has a Piranha Plant item that bites ahead of your kart.','kartItems'],
  ['kart','scientist','power-ups','Which Mario Kart 8 Deluxe item gives you two coins?','Coin','Mushroom','Feather','Crazy Eight','The Coin item adds two coins to your total. Holding more coins can make your kart faster.','Crazy Eight, by contrast, puts eight different items around your kart.','kartItems'],
  ['kart','scientist','glitches','In a fixed Mario Kart World bug, which racer could fall through the ground near Dry Bones Burnout?','Dry Bones','Yoshi','Toad','Wario','Nintendo reported that Dry Bones could fall through the ground near Dry Bones Burnout. An update fixed it.','The update also addressed racers falling off routes after certain shortcuts.','kartUpdates'],
  ['kart','scientist','glitches','A fixed Mario Kart World bug made which item fail to disappear after lightning struck?','The second item in a slot','A thrown banana','A used mushroom','A rival’s coin','Nintendo noted that the second held item could sometimes remain after Lightning. That was a bug, not a rule.','Lightning normally makes rivals drop items and become smaller.','kartUpdates'],
  ['kart','scientist','games','Which Mario Kart World mode removes racers at checkpoints?','Knockout Tour','Free Roam','Time Trials','Grand Prix','Knockout Tour is a long rally. Players below the cutoff at a checkpoint leave the race.','Nintendo says a Knockout Tour can have up to 24 racers.','kartWorld'],

  // Mario Kart: Professor
  ['kart','professor','tracks','Which course comes directly before SNES Bowser Castle 3 in the Booster Course Pass Spiny Cup?','3DS Rosalina’s Ice World','Tour Madrid Drive','Wii Rainbow Road','GCN DK Mountain','Rosalina’s Ice World is second in the Spiny Cup, just before Bowser Castle 3.','Madrid Drive opens this cup.','kartCourses'],
  ['kart','professor','tracks','Which course closes the Booster Course Pass Cherry Cup?','Tour Vancouver Velocity','Wii Koopa Cape','GBA Sunset Wilds','Tour Los Angeles Laps','Vancouver Velocity is fourth in the Cherry Cup. It comes after Koopa Cape.','The Cherry Cup arrived in Wave 5.','kartCourses'],
  ['kart','professor','power-ups','In Mario Kart 8 Deluxe, which item is available only in Battle mode?','Feather','Super Horn','Boo','Coin','The Feather makes a kart leap over obstacles. Nintendo marks it as a Battle-mode-only item.','A jump with the Feather can steal a rival’s balloon in Battle mode.','kartItems'],
  ['kart','professor','power-ups','Which Mario Kart 8 Deluxe item gives a slight boost when it bites?','Piranha Plant','Boomerang Flower','Blooper','Super Horn','The Piranha Plant sits at the front of the kart and snaps at things. Each lunge gives a small speed boost.','Nintendo also lists the Boomerang Flower, which can be thrown three times.','kartItems'],
  ['kart','professor','glitches','Nintendo fixed a Mario Kart World bug where using a Feather shortcut could give a wrong final ranking on which course?','Rainbow Road','Crown City','Boo Cinema','Mario Circuit','A former Rainbow Road bug could miscalculate the result after a Feather shortcut. Nintendo listed the correction in its update notes.','The same update fixed Spike Balls moving oddly on Rainbow Road.','kartUpdates'],
  ['kart','professor','glitches','Which Mario Kart World course once had a Bullet Bill that could leave the course on its final curve?','Boo Cinema','DK Pass','Crown City','Wario Stadium','Nintendo documented a fixed Boo Cinema bug where Bullet Bill could run off course on the final bend.','Another older Boo Cinema issue could make Bullet Bill repeatedly hit a wall near the finish.','kartUpdates'],
  ['kart','professor','games','In Mario Kart World Grand Prix, what can racers drive between courses?','Connecting roads','A ferry deck','A warp pipe','An airport runway','Mario Kart World links its courses with roads. Grand Prix racers can drive along those links instead of only racing isolated tracks.','Nintendo says the Mushroom Cup begins at Mario Bros. Circuit.','kartWorld'],
];

export const EXPANDED_QUESTIONS: readonly TriviaQuestion[] = entries.map((entry, index) => {
  const [topic, difficulty, category, prompt, answer, wrong1, wrong2, wrong3, explanation, funFact, source] = entry;
  return {
    id: `expanded-${index + 1}`, knowledgeId: `expanded-${index + 1}`,
    topic, difficulty, category, prompt,
    choices: [answer, wrong1, wrong2, wrong3], answer, explanation, funFact,
    sourceUrl: sources[source],
  };
});
