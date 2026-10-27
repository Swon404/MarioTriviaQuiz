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
  ['mario','explorer','power-ups','In Super Mario Bros. Wonder, which item gives Mario a trunk?','Elephant Fruit','Bubble Flower','Drill Mushroom','Fire Flower',"Swing Elephant Mario’s trunk to swat enemies and smash blocks. Even crouching elephants can pack a punch.",'Getting wet can fill the trunk with water. That turns the same tool from a swatter into a spray.','wonderPowers'],
  ['mario','explorer','power-ups','In Super Mario Bros. Wonder, which item lets you blow your own stepping stones across a gap?','Bubble Flower','Elephant Fruit','Drill Mushroom','Super Mushroom','The Bubble Flower lets you create temporary footholds. Leap onto a bubble to cross a gap, but be ready: it pops when you use it.','A spin jump sends bubbles in both directions, helping when trouble is on either side.','wonderPowers'],
  ['mario','explorer','power-ups','What does a Super Mushroom do to Mario in Super Mario Bros. Wonder?','Makes him bigger','Lets him drill underground','Gives him a trunk','Makes him blow bubbles','A Super Mushroom turns small Mario into Super Mario. A trunk, bubbles or drilling need their own power-ups instead.','Wonder’s Drill Mushroom changes where you can travel: suitable floors and ceilings become hiding places.','wonderPowers'],
  ['mario','explorer','baddies','Which Mario enemy wears a shell on its back?','Koopa Troopa','Goomba','Boo','Shy Guy',"The shell belongs to Koopa Troopa. Look for the turtle-shaped body and big shoes.",'Bowser’s underlings can become your teammates or rivals in another kind of contest: Koopa Troopa is playable in Super Mario Party.','enemies'],
  ['mario','explorer','baddies','Which shy Mario enemy is a ghost?','Boo','Goomba','Hammer Bro','Monty Mole',"Look a Boo in the face and it freezes. Turn away and that shy ghost becomes a problem again.",'Boos cover their eyes when seen—a useful visual clue to their strange behaviour.','characters'],
  ['mario','explorer','games','Which game lets you arrange blocks, enemies and pipes to build your own Mario courses?','Super Mario Maker','Super Mario Galaxy','Super Mario Run','Super Mario Sunshine',"Mario Maker lets you build the course, then try to survive your own creation.",'The first Maker arrived on Wii U in 2015, thirty years after the original Super Mario Bros.','maker'],
  ['mario','explorer','characters','Which Mario friend uses a long tongue to gobble up enemies?','Yoshi','Toad','Luigi','Diddy Kong',"Yoshi catches food and enemies with his long tongue, then makes eggs he can throw.",'Green is only one Yoshi colour; red, blue, pink and yellow Yoshis appear too.','characters'],

  // Mario: Scientist
  ['mario','scientist','power-ups','In Super Mario Bros. Wonder, which item lets you hide inside certain floors and ceilings?','Drill Mushroom','Bubble Flower','Elephant Fruit','Fire Flower','The Drill Mushroom opens routes inside suitable floors and ceilings. Burrow underneath an enemy, then pop up to attack from below.','The pointed helmet can protect Mario from falling enemies, so the drill is useful above ground too.','wonderPowers'],
  ['mario','scientist','power-ups','In Super Mario Bros. Wonder, which item gives Mario bouncing shots that help against icy blocks?','Fire Flower','Bubble Flower','Drill Mushroom','Elephant Fruit','The Fire Flower gives Mario bouncing fireballs. They are useful against icy blocks, and he can launch them from a crouch as well as standing.','A spin jump lets Fire Mario shoot while turning—try comparing that move with Bubble Mario’s version.','wonderPowers'],
  ['mario','scientist','baddies','Which masked troublemaker is playable in Super Mario Party?','Shy Guy','Boo','Goomba','Dry Bones',"The mask belongs to Shy Guy. In Super Mario Party, you can play as this familiar troublemaker.",'The mask is the clue, not the name: Boo is shy too, but is a ghost rather than this masked character.','enemies'],
  ['mario','scientist','baddies','Which helmet-wearing member of Bowser’s Koopa Troop can you play as in Super Mario Party?','Hammer Bro','Monty Mole','Goomba','Boo',"A helmet and flying hammers identify Hammer Bro. Super Mario Party lets you pick him as your player.",'Koopa Troopa is playable too; the helmet separates two characters from the same army.','enemies'],
  ['mario','scientist','games','In which Wii game do you point to collect Star Bits and shake the remote to spin?','Super Mario Galaxy','Super Paper Mario','New Super Mario Bros. Wii','Mario Party 8','Galaxy gives the Wii Remote two different jobs: point to collect Star Bits and shake to make Mario spin.','Star Bits are more than things to gather: you can fire them to stun enemies.','galaxy'],
  ['mario','scientist','consoles','Which handheld did New Super Mario Bros. first appear on?','Nintendo DS','Game Boy','Nintendo 3DS','Game Boy Advance',"New Super Mario Bros. began on Nintendo DS in 2006. The Wii adventure came later.",'Nintendo’s timeline puts three years between them: DS in 2006, Wii in 2009.','history'],
  ['mario','scientist','characters','Which princess comes from Sarasaland?','Daisy','Peach','Rosalina','Toadette',"Daisy rules Sarasaland. Yellow clothes and flower jewellery are her signature look.",'Daisy enjoys sport; she is more than a royal name to remember on a character list.','characters'],

  // Mario: Professor
  ['mario','professor','power-ups','In Super Mario Bros. Wonder, which form can water a wilted flower bud?','Elephant form','Bubble form','Drill form','Fire form','Elephant Mario stores water in his trunk, then sprays it onto the wilted bud. His transformation can help the scenery as well as defeat enemies.','That trunk also breaks blocks and swats enemies—even when Mario crouches.','wonderPowers'],
  ['mario','professor','power-ups','Which form in Super Mario Bros. Wonder sends floating shots in both directions during a spin jump?','Bubble form','Fire form','Elephant form','Drill form','Bubble Mario can spin-jump to release bubbles on both sides. That gives you more coverage than aiming in only one direction.','The bubbles also work as stepping stones, but each pops when you land on it.','wonderPowers'],
  ['mario','professor','baddies','Which enemy made its first playable Mario Party appearance in Super Mario Party (2018)?','Monty Mole','Koopa Troopa','Boo','Hammer Bro',"Monty Mole joined the playable Mario Party cast in Super Mario Party (2018). He was already an enemy before that.",'Pom Pom made her playable Mario Party debut in the same game.','enemies'],
  ['mario','professor','baddies','Which skeletal Mario enemy collapses when attacked, then rebuilds itself?','Dry Bones','Shy Guy','Goomba','Boo','Dry Bones can collapse and rebuild. Treat the heap of bones as a temporary gap in the danger, not proof the path is safe forever.','The name hides a family connection: Dry Bones is a skeletal Koopa Troopa.','dryBones'],
  ['mario','professor','games','What name did Mario have in the 1981 Donkey Kong arcade game?','Jumpman','Mr. L','Captain Toad','Professor E. Gadd','Mario was called Jumpman in the 1981 Donkey Kong arcade game. His familiar name was not there from the beginning.','Before that, Miyamoto considered ‘Mr. Video’, imagining a character who could appear in many games.','historyFacts'],
  ['mario','professor','consoles','Which Nintendo handheld had Super Mario Land 2: 6 Golden Coins?','Game Boy','Nintendo DS','Nintendo 3DS','Game Boy Advance',"Super Mario Land 2 is a Game Boy game. Its six golden coins are the keys to Mario’s castle.",'Its full title is 6 Golden Coins, and Nintendo’s timeline dates it to 1992.','history'],
  ['mario','professor','characters','Which character has a red necktie marked with his initials?','Donkey Kong','Diddy Kong','Bowser','Wario',"DK on a red tie? Donkey Kong. The banana stash is another giveaway.",'His treehouse contains a huge banana stash—a very different sort of treasure from Wario’s money.','characters'],

  // Mario Kart: Explorer
  ['kart','explorer','tracks','Which track made its series debut in Mario Kart 8 Deluxe’s second DLC wave?','Sky-High Sundae','Coconut Mall','Waluigi Pinball','Maple Treeway','Sky-High Sundae debuted with Wave 2 in Mario Kart 8 Deluxe. Unlike the returning courses, it was not a remake from an older game.','It appeared on Switch before Mario Kart Tour, even though it later became a Tour course too.','kartWave2'],
  ['kart','explorer','tracks','In Mario Kart Tour, which course lets you race inside a manor and across its tiled roof?','Ninja Hideaway','Daisy Cruiser','Peach Gardens','Coconut Mall','Ninja Hideaway takes you through a manor and onto its roofs. Choosing high or low routes changes how you tackle the course.','Look around the manor as well as at the road: illuminated cherry blossoms decorate the setting.','ninjaTour'],
  ['kart','explorer','power-ups','In Mario Kart 8 Deluxe, which item gives your kart one quick burst of speed?','Mushroom','Banana','Blooper','Lightning','Save your Mushroom for a chance to overtake. You can carry two items, so grabbing a boost need not mean using it immediately.','A Golden Mushroom works differently: it lets you boost repeatedly for a limited time.','kartItemGuide'],
  ['kart','explorer','power-ups','Which Mario Kart 8 Deluxe item blocks other drivers’ view with ink?','Blooper','Boo','Bullet Bill','Bob-omb','Blooper targets racers ahead of you. Use it while chasing the pack; it will not splash the drivers behind.','Boo has another kind of trick: hiding your kart and potentially taking a rival’s item.','kartItemGuide'],
  ['kart','explorer','games','In Mario Kart World Free Roam, what can you activate to start a driving mission?','A P Switch','An item box','A Dash Panel','A starting-line signal','Activate a P Switch to start a Free Roam driving challenge. It gives exploration a goal without turning it into a normal Grand Prix.','Nintendo introduced World with hundreds of these missions, making Free Roam more than a place to drive aimlessly.','kartWorld'],
  ['kart','explorer','games','In Mario Kart World single-player races, what do your rivals do while you use Rewind?','Keep driving forwards','Rewind with you','Stop until you finish','Return to the starting line','Your rivals keep moving while you Rewind. You can correct a bad move, but you cannot erase the time everyone else spent racing ahead.','Free Roam lets you practise the same trick without worrying about losing a race position.','kartWorld'],
  ['kart','explorer','games','Which Mario Kart game lets you explore in Free Roam?','Mario Kart World','Mario Kart 8 Deluxe','Mario Kart Wii','Mario Kart DS','World is the game with Free Roam. You can investigate its connected setting instead of staying inside a selected race.','Hidden coins give you a reason to look beyond the obvious road.','kartWorld'],

  // Mario Kart: Scientist
  ['kart','scientist','tracks','Which Booster Course Pass cup contains GBA Snow Land?','Propeller Cup','Rock Cup','Fruit Cup','Cherry Cup',"Snow Land is Propeller Cup’s second race. Watch those icy corners!",'Sky-High Sundae closes this cup, pairing returning courses with a course that debuted in the DLC.','kartCourses'],
  ['kart','scientist','tracks','Which Booster Course Pass cup contains GBA Sunset Wilds?','Cherry Cup','Feather Cup','Acorn Cup','Moon Cup',"Sunset Wilds is race two in Cherry Cup, between Los Angeles Laps and Koopa Cape.",'Los Angeles Laps opens Cherry Cup, and Vancouver Velocity finishes it.','kartCourses'],
  ['kart','scientist','power-ups','In Mario Kart 8 Deluxe, which item blasts nearby vehicles and items away from your kart?','Super Horn','Boomerang Flower','Red Shell','Blooper',"The Super Horn blasts nearby racers and items. Keep it ready for trouble heading straight at you.",'Its blast can affect both vehicles and items: it is not only an attack on other racers.','kartItemGuide'],
  ['kart','scientist','power-ups','In Mario Kart 8 Deluxe, how many coins does one Coin item add when you have room for them?','Two','One','Three','Five','Coins act like an engine upgrade: collecting them raises your top speed. That little bit of pocket money helps you pull ahead.','Coins contribute to speed, so collecting them is useful even though they cannot be thrown at a rival.','kartItemGuide'],
  ['kart','scientist','glitches','Which racer could fall through the ground before a fix in Mario Kart World v1.7.0?','Dry Bones','Yoshi','Toad','Wario','Dry Bones could fall through the ground near Dry Bones Burnout before v1.7.0 fixed it. This was broken behaviour, not a secret move to learn.','The same update repaired falls on connecting routes too; a bug can affect the journey as well as the named course.','kartUpdates'],
  ['kart','scientist','glitches','Which item could incorrectly survive a Lightning strike before Mario Kart World v1.3.0 fixed it?','The second held item','The first held item','A thrown banana','An item still inside a box','The second held item could incorrectly remain after Lightning. The v1.3.0 fix removed that unintended protection for the reserve slot.','‘Second item’ means the reserve item you are carrying—not something already thrown onto the road.','kartUpdates'],
  ['kart','scientist','games','Which Mario Kart World mode removes racers at checkpoints?','Knockout Tour','Free Roam','Time Trials','Grand Prix','Knockout Tour checks your position along the way. Fall below a checkpoint’s cutoff and your race ends there, even if the final finish is far away.','The starting field can contain 24 racers, but checkpoint eliminations steadily reduce it.','kartWorld'],

  // Mario Kart: Professor
  ['kart','professor','tracks','Which course comes directly before SNES Bowser Castle 3 in the Booster Course Pass Spiny Cup?','3DS Rosalina’s Ice World','Tour Madrid Drive','Wii Rainbow Road','GCN DK Mountain',"Rosalina’s Ice World sits directly before Bowser Castle 3 in Spiny Cup. Ice, then lava!",'That lineup mixes Tour, 3DS, SNES and Wii origins into one four-race cup.','kartCourses'],
  ['kart','professor','tracks','Which course closes the Booster Course Pass Cherry Cup?','Tour Vancouver Velocity','Wii Koopa Cape','GBA Sunset Wilds','Tour Los Angeles Laps',"Vancouver Velocity is Cherry Cup’s finale. Koopa Cape comes just before it.",'Los Angeles Laps starts the cup: remembering both city names gives you its two ends.','kartCourses'],
  ['kart','professor','power-ups','In Mario Kart 8 Deluxe, which item is available only in Battle mode?','Feather','Super Horn','Boo','Coin','Jump into a rival to steal a balloon while dodging shells and bananas. The Feather turns a defensive leap into a sneaky attack.','The Feather also appeared in the original Super Mario Kart on SNES. Back then, its big jump could clear obstacles during races too.','kartItemGuide'],
  ['kart','professor','power-ups','In Mario Kart 8 Deluxe, what extra effect does the Piranha Plant’s biting lunge give your kart?','A small speed boost','A higher top speed for the whole race','Automatic steering around corners','Invincibility until the next item box','The plant bites at nearby racers and items from the front of your kart. Point those teeth towards trouble.','It rides on the front of the kart and can bite both nearby drivers and items.','kartPlantGuide'],
  ['kart','professor','glitches','Which course’s Feather-shortcut ranking bug was fixed in Mario Kart World v1.6.0?','Rainbow Road','Crown City','Boo Cinema','Mario Circuit','The v1.6.0 fix concerned Rainbow Road: a Feather shortcut could cause the final positions to be calculated incorrectly.','That update also fixed erratic Spike Balls on Rainbow Road—two different problems on the same course.','kartUpdates'],
  ['kart','professor','glitches','Which course’s final-bend Bullet Bill bug was fixed in Mario Kart World v1.4.0?','Boo Cinema','DK Pass','Crown City','Wario Stadium','On Boo Cinema’s final bend, Bullet Bill could take a racer off the course. Version 1.4.0 corrected that unwanted exit.','The update also addressed places where Bullet Bill could become stuck, despite being an item intended to carry you forward.','kartUpdates'],
  ['kart','professor','games','In Mario Kart World Grand Prix, what can racers drive between courses?','Connecting roads','A ferry deck','A warp pipe','An airport runway',"World races along connecting roads between courses. Getting to the next track is part of the competition.",'Mushroom Cup starts at Mario Bros. Circuit before sending racers towards Crown City.','kartWorld'],
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
