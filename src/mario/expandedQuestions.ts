import type { Category, Difficulty, Topic, TriviaQuestion } from './questions.ts';

// Short, original wording based on Nintendo's game pages, manuals and update notes.
// Bugs below are historical fixed issues, never instructions for reproducing them.
const sources = {
  characters: 'https://www.nintendo.com/en-ca/explore/characters/mario/friends/',
  maker: 'https://www.nintendo.com/en-gb/News/2015/September/Create-share-and-play-a-near-infinite-array-of-Super-Mario-levels-from-Friday-with-Super-Mario-Maker-for-Wii-U-1049799.html',
  galaxy: 'https://www.nintendo.com/en-gb/Games/Wii/Super-Mario-Galaxy-283322.html',
  dryBones: 'https://play.nintendo.com/themes/friends/dry-bones/',
  enemies: 'https://media.nintendo.com/supermarioparty/characters/',
  history: 'https://www.nintendo.com/us/explore/characters/mario/history/',
  historyFacts: 'https://www.nintendo.com/us/whatsnew/wahoo-see-the-platforming-history-of-super-mario-and-even-get-a-few-fun-facts/',
  wonder: 'https://supermariobroswonder.nintendo.com/',
  wonderPowers: 'https://www.nintendo.com/us/whatsnew/get-a-jump-on-super-mario-bros-wonder-with-these-powerful-power-ups/',
  kartItems: 'https://mariokart8deluxe.nintendo.com/',
  kartItemGuide: 'https://www.nintendo.com/au/games/nintendo-switch/mario-kart-8-deluxe/',
  kartPlantGuide: 'https://mariokart8.nintendo.com/',
  kartCourses: 'https://en-americas-support.nintendo.com/app/answers/detail/a_id/57858/',
  kartWave2: 'https://www.nintendo.com/us/whatsnew/mario-kart-8-deluxe-booster-course-pass-wave-2-approaches-the-starting-line-on-aug-4/',
  ninjaTour: 'https://apps.apple.com/at/story/id1555639062?l=en-GB',
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
  ['mario','explorer','power-ups','In Super Mario Bros. Wonder, which item gives Mario a trunk?','Elephant Fruit','Bubble Flower','Drill Mushroom','Fire Flower','Swing it to swat enemies and smash blocks—even while crouching.','Getting wet can fill your trunk with water to spray.','wonderPowers'],
  ['mario','explorer','power-ups','In Super Mario Bros. Wonder, which item lets you blow your own stepping stones across a gap?','Bubble Flower','Elephant Fruit','Drill Mushroom','Super Mushroom','Jump on the floating bubbles to cross gaps. Each pops underfoot, so plan your next landing.','Spin-jumping lets you send bubbles in both directions.','wonderPowers'],
  ['mario','explorer','power-ups','What does a Super Mushroom do to Mario in Super Mario Bros. Wonder?','Makes him bigger','Lets him drill underground','Gives him a trunk','Makes him blow bubbles','It changes small Mario into Super Mario. The other abilities come from different power-ups.','The Drill Mushroom instead lets Mario burrow into suitable floors and ceilings.','wonderPowers'],
  ['mario','explorer','baddies','Which Mario enemy wears a shell on its back?','Koopa Troopa','Goomba','Boo','Shy Guy','A Koopa Troopa is one of Bowser’s familiar underlings. Its shell is the big clue here.','Koopa Troopa is also a playable character in Super Mario Party.','enemies'],
  ['mario','explorer','baddies','Which shy Mario enemy is a ghost?','Boo','Goomba','Hammer Bro','Monty Mole','Boos are ghosts that appear in spooky places. They often stop moving when someone looks at them.','Nintendo says Boos cover their eyes when they are seen.','characters'],
  ['mario','explorer','games','Which game lets you arrange blocks, enemies and pipes to build your own Mario courses?','Super Mario Maker','Super Mario Galaxy','Super Mario Run','Super Mario Sunshine','You design courses and then try playing them. Building is part of the game, not just something the developers do.','The original game arrived on Wii U in 2015.','maker'],
  ['mario','explorer','characters','Which Mario friend uses a long tongue to gobble up enemies?','Yoshi','Toad','Luigi','Diddy Kong','Yoshi can catch fruit and enemies with his tongue. He can turn what he eats into eggs to throw.','Yoshis can be green, red, blue, pink or yellow.','characters'],

  // Mario: Scientist
  ['mario','scientist','power-ups','In Super Mario Bros. Wonder, which item lets you hide inside certain floors and ceilings?','Drill Mushroom','Bubble Flower','Elephant Fruit','Fire Flower','Burrow below an enemy, then jump up to attack. Some ceilings lead to hidden areas.','Your pointed headgear can protect you from falling enemies.','wonderPowers'],
  ['mario','scientist','power-ups','In Super Mario Bros. Wonder, which item gives Mario bouncing shots that help against icy blocks?','Fire Flower','Bubble Flower','Drill Mushroom','Elephant Fruit','These shots bounce along instead of travelling straight. Mario can launch them while crouching, too.','Try shooting during a spin jump!','wonderPowers'],
  ['mario','scientist','baddies','Which masked troublemaker is playable in Super Mario Party?','Shy Guy','Boo','Goomba','Dry Bones','Shy Guy hides behind a mask and often gets in the way. Super Mario Party lets players choose him.','Nintendo describes Shy Guy as a masked rascal.','enemies'],
  ['mario','scientist','baddies','Which helmet-wearing member of Bowser’s Koopa Troop can you play as in Super Mario Party?','Hammer Bro','Monty Mole','Goomba','Boo','The helmet helps identify this elite Koopa Troop member. Here an enemy becomes a character you can choose.','Nintendo’s character guide also lists Koopa Troopa as playable.','enemies'],
  ['mario','scientist','games','In which Wii game do you point to collect Star Bits and shake the remote to spin?','Super Mario Galaxy','Super Paper Mario','New Super Mario Bros. Wii','Mario Party 8','The pointer gathers Star Bits while shaking triggers Mario’s spin. Both are useful during the adventure.','You can also fire Star Bits to stun enemies.','galaxy'],
  ['mario','scientist','consoles','Which handheld did New Super Mario Bros. first appear on?','Nintendo DS','Game Boy','Nintendo 3DS','Game Boy Advance','Nintendo lists New Super Mario Bros. as a Nintendo DS game. It arrived before the Wii follow-up.','Nintendo places the DS game in 2006 and the Wii game in 2009.','history'],
  ['mario','scientist','characters','Which princess comes from Sarasaland?','Daisy','Peach','Rosalina','Toadette','Daisy is the princess of Sarasaland, a different kingdom from Peach’s Mushroom Kingdom.','Daisy is fond of sport and often joins Mario and friends in games.','characters'],

  // Mario: Professor
  ['mario','professor','power-ups','In Super Mario Bros. Wonder, which form can water a wilted flower bud?','Elephant form','Bubble form','Drill form','Fire form','Elephant Mario can carry water in his trunk and spray it. The spray can affect things in a course.','The elephant trunk can also swat enemies and break blocks.','wonderPowers'],
  ['mario','professor','power-ups','Which form in Super Mario Bros. Wonder sends floating shots in both directions during a spin jump?','Bubble form','Fire form','Elephant form','Drill form','A spin jump sends bubbles to either side, helping when enemies crowd around.','Those bubbles can double as tiny platforms for a tricky jump.','wonderPowers'],
  ['mario','professor','baddies','Which enemy made its first playable Mario Party appearance in Super Mario Party (2018)?','Monty Mole','Koopa Troopa','Boo','Hammer Bro','This underground enemy joined the playable Mario Party cast in the 2018 game.','Pom Pom also made her playable Mario Party debut in that game.','enemies'],
  ['mario','professor','baddies','Which skeletal Mario enemy collapses when attacked, then rebuilds itself?','Dry Bones','Shy Guy','Goomba','Boo','These skeletal Koopa Troopas can get back up. Knocking one apart does not always remove the danger for good.','After rebuilding, it can attack again—so keep watching the path.','dryBones'],
  ['mario','professor','games','What name did Mario have in the 1981 Donkey Kong arcade game?','Jumpman','Mr. L','Captain Toad','Professor E. Gadd','Nintendo says the character went by Jumpman in Donkey Kong. Mario’s familiar name came later.','Shigeru Miyamoto first considered calling the character Mr. Video.','historyFacts'],
  ['mario','professor','consoles','Which Nintendo handheld had Super Mario Land 2: 6 Golden Coins?','Game Boy','Nintendo DS','Nintendo 3DS','Game Boy Advance','Nintendo places the second Super Mario Land game on Game Boy. It followed the first one on the same handheld.','Nintendo’s timeline dates this Game Boy adventure to 1992.','history'],
  ['mario','professor','characters','Which character has a red necktie marked with his initials?','Donkey Kong','Diddy Kong','Bowser','Wario','Donkey Kong wears a red DK tie. Nintendo describes him as the king of the jungle.','His treehouse holds a large stash of bananas.','characters'],

  // Mario Kart: Explorer
  ['kart','explorer','tracks','Which track made its series debut in Mario Kart 8 Deluxe’s second DLC wave?','Sky-High Sundae','Coconut Mall','Waluigi Pinball','Maple Treeway','Sky-High Sundae was new, rather than a remake of an older course. It arrived on Switch before appearing in Mario Kart Tour.','Enormous desserts fill the scenery, making the racers look tiny.','kartWave2'],
  ['kart','explorer','tracks','In Mario Kart Tour, which course lets you race inside a manor and across its tiled roof?','Ninja Hideaway','Daisy Cruiser','Peach Gardens','Coconut Mall','Ninja Hideaway has routes through rooms and over rooftops. Its upper and lower paths make choosing your route part of the challenge.','Illuminated cherry blossoms decorate the manor’s surroundings.','ninjaTour'],
  ['kart','explorer','power-ups','In Mario Kart 8 Deluxe, which item gives your kart one quick burst of speed?','Mushroom','Banana','Blooper','Lightning','Use the burst when you want to gain ground. Its effect is brief, not a permanent speed upgrade.','The Golden Mushroom allows repeated boosts for a limited time.','kartItemGuide'],
  ['kart','explorer','power-ups','Which Mario Kart 8 Deluxe item blocks other drivers’ view with ink?','Blooper','Boo','Bullet Bill','Bob-omb','The ink makes the track harder to see. It interferes with the driver’s view rather than simply being a shell to dodge.','Boo instead hides your own kart and may steal a rival’s item.','kartItemGuide'],
  ['kart','explorer','games','In Mario Kart World Free Roam, what can you activate to start a driving mission?','A P Switch','An item box','A Dash Panel','A starting-line signal','P Switches launch challenges while you explore. They give you something to aim for outside a normal race and help you practise driving.','Nintendo introduced Free Roam with hundreds of these missions to discover.','kartWorld'],
  ['kart','explorer','games','In Mario Kart World single-player races, what do your rivals do while you use Rewind?','Keep driving forwards','Rewind with you','Stop until you finish','Return to the starting line','Rewind lets you correct your own driving, but it does not turn back the whole race. Rivals can gain ground while you recover.','You can also use Rewind to retry a missed move in Free Roam.','kartWorld'],
  ['kart','explorer','games','Which Mario Kart game lets you explore in Free Roam?','Mario Kart World','Mario Kart 8 Deluxe','Mario Kart Wii','Mario Kart DS','Free Roam is a Mario Kart World mode for exploring its connected setting outside a race.','Nintendo says players can find hidden coins while exploring.','kartWorld'],

  // Mario Kart: Scientist
  ['kart','scientist','tracks','Which Booster Course Pass cup contains GBA Snow Land?','Propeller Cup','Rock Cup','Fruit Cup','Cherry Cup','Snow Land is a returning Game Boy Advance course in the Propeller Cup.','The Propeller Cup closes with Sky-High Sundae.','kartCourses'],
  ['kart','scientist','tracks','Which Booster Course Pass cup contains GBA Sunset Wilds?','Cherry Cup','Feather Cup','Acorn Cup','Moon Cup','Sunset Wilds is a Game Boy Advance course in the Cherry Cup.','That cup opens with Los Angeles Laps.','kartCourses'],
  ['kart','scientist','power-ups','In Mario Kart 8 Deluxe, which item blasts nearby vehicles and items away from your kart?','Super Horn','Boomerang Flower','Red Shell','Blooper','It acts around your kart, so nearby threats matter. You do not aim it down the track like a thrown shell.','The blast can affect vehicles as well as loose items.','kartItemGuide'],
  ['kart','scientist','power-ups','In Mario Kart 8 Deluxe, how many coins does one Coin item add when you have room for them?','Two','One','Three','Five','The item adds a pair of coins. That is different from picking up a single coin on the road.','Holding more coins can increase your kart’s speed.','kartItemGuide'],
  ['kart','scientist','glitches','Which racer could fall through the ground before a fix in Mario Kart World v1.7.0?','Dry Bones','Yoshi','Toad','Wario','The unwanted fall happened near Dry Bones Burnout. It was a bug, not a hidden racing ability.','That update also repaired falls on connecting routes.','kartUpdates'],
  ['kart','scientist','glitches','Which item could incorrectly survive a Lightning strike before Mario Kart World v1.3.0 fixed it?','The second held item','The first held item','A thrown banana','An item still inside a box','The reserve slot could retain its item after the hit. This was a fixed inventory bug, not special protection.','The issue involved something still held by the racer.','kartUpdates'],
  ['kart','scientist','games','Which Mario Kart World mode removes racers at checkpoints?','Knockout Tour','Free Roam','Time Trials','Grand Prix','Knockout Tour is a long rally. Players below the cutoff at a checkpoint leave the race.','Nintendo says a Knockout Tour can have up to 24 racers.','kartWorld'],

  // Mario Kart: Professor
  ['kart','professor','tracks','Which course comes directly before SNES Bowser Castle 3 in the Booster Course Pass Spiny Cup?','3DS Rosalina’s Ice World','Tour Madrid Drive','Wii Rainbow Road','GCN DK Mountain','Rosalina’s Ice World is second in the Spiny Cup, just before Bowser Castle 3.','Madrid Drive opens this cup.','kartCourses'],
  ['kart','professor','tracks','Which course closes the Booster Course Pass Cherry Cup?','Tour Vancouver Velocity','Wii Koopa Cape','GBA Sunset Wilds','Tour Los Angeles Laps','Vancouver Velocity is fourth in the Cherry Cup. It comes after Koopa Cape.','The Cherry Cup arrived in Wave 5.','kartCourses'],
  ['kart','professor','power-ups','In Mario Kart 8 Deluxe, which item is available only in Battle mode?','Feather','Super Horn','Boo','Coin','It lets your kart jump over hazards. Do not expect it in a normal Grand Prix item box in this game.','Its jump can help you dodge a banana or shell.','kartItemGuide'],
  ['kart','professor','power-ups','In Mario Kart 8 Deluxe, what extra effect does the Piranha Plant’s biting lunge give your kart?','A small speed boost','A higher top speed for the whole race','Automatic steering around corners','Invincibility until the next item box','The forward lunge gives a brief push as well as attacking. It is not a lasting upgrade to your vehicle.','The plant rides on the front of the kart and can bite nearby items and drivers.','kartPlantGuide'],
  ['kart','professor','glitches','Which course’s Feather-shortcut ranking bug was fixed in Mario Kart World v1.6.0?','Rainbow Road','Crown City','Boo Cinema','Mario Circuit','A shortcut could confuse the final placing calculation. The version matters: another course later received a similar fix.','This update also corrected erratic Spike Balls on the same course.','kartUpdates'],
  ['kart','professor','glitches','Which course’s final-bend Bullet Bill bug was fixed in Mario Kart World v1.4.0?','Boo Cinema','DK Pass','Crown City','Wario Stadium','The racer could leave the course at the last bend while using Bullet Bill. The update fixed this unwanted exit.','It also repaired places where Bullet Bill could get stuck.','kartUpdates'],
  ['kart','professor','games','In Mario Kart World Grand Prix, what can racers drive between courses?','Connecting roads','A ferry deck','A warp pipe','An airport runway','Mario Kart World links its courses with roads. Grand Prix racers can drive along those links instead of only racing isolated tracks.','Nintendo says the Mushroom Cup begins at Mario Bros. Circuit.','kartWorld'],
];

export const EXPANDED_QUESTIONS: readonly TriviaQuestion[] = entries.map((entry, index) => {
  const [topic, difficulty, category, prompt, answer, wrong1, wrong2, wrong3, explanation, funFact, source] = entry;
  return {
    id: `expanded-${index + 1}`, knowledgeId: `expanded-${index + 1}${[11, 16, 21, 22, 25, 26].includes(index) ? '-v2' : ''}`,
    topic, difficulty: category === 'glitches' ? 'professor' : [14, 15].includes(index) ? 'scientist' : difficulty, category, prompt,
    choices: [answer, wrong1, wrong2, wrong3], answer, explanation, funFact,
    sourceUrl: sources[source],
    sourceReview: [23, 24, 30, 31, 37, 38].includes(index)
      ? { checkedOn: '2026-10-12', status: 'source-checked' as const, gameVersion: 'Mario Kart 8 Deluxe — Nintendo Switch item rules' }
      : [0, 1, 7, 8].includes(index)
      ? { checkedOn: '2026-10-11', status: 'source-checked' as const, gameVersion: 'Super Mario Bros. Wonder — Nintendo power-up guide' }
      : category === 'glitches' ? { checkedOn: '2026-10-04', status: 'source-checked' as const, gameVersion: `Mario Kart World — fixed in v${({ 32: '1.7.0', 33: '1.3.0', 39: '1.6.0', 40: '1.4.0' } as Record<number, string>)[index]}` } : [12, 19].includes(index) ? { checkedOn: '2026-10-04', status: 'source-checked' as const, gameVersion: 'Nintendo’s US Mario release timeline' } : undefined,
  };
});
