import type { Category, Difficulty, Topic, TriviaQuestion } from './questions.ts';

// Each question has its own short explanation, related fun fact, and Nintendo source.
const sources = {
  wonder: 'https://www.nintendo.com/us/whatsnew/super-mario-bros-wonder-jump-into-the-unexpected-with-mario-and-his-friends-surprises-ahead/',
  wonderPowers: 'https://www.nintendo.com/us/whatsnew/get-a-jump-on-super-mario-bros-wonder-with-these-powerful-power-ups/',
  history: 'https://www.nintendo.com/us/explore/characters/mario/history/',
  historyFacts: 'https://www.nintendo.com/us/whatsnew/wahoo-see-the-platforming-history-of-super-mario-and-even-get-a-few-fun-facts/',
  cat: 'https://www.nintendo.com/us/whatsnew/unravel-new-paw-sibilities-in-super-mario-3d-world-bowsers-fury-for-nintendo-switch/',
  booster: 'https://en-americas-support.nintendo.com/app/answers/detail/a_id/57858/',
  world: 'https://www.nintendo.com/us/whatsnew/mario-kart-world-direct-revs-up-new-details-on-the-biggest-mario-kart-ever-coming-to-nintendo-switch-2-at-launch/',
} as const;

type Source = keyof typeof sources;
type Entry = readonly [Topic, Difficulty, Category, string, string, string, string, string, string, string, Source];

const entries: readonly Entry[] = [
  // Mario: Rookie
  ['mario','explorer','games','Where do Mario and his friends travel in Super Mario Bros. Wonder?','Flower Kingdom','Sarasaland','Metro Kingdom','Donkey Kong Island','The adventure takes place in the Flower Kingdom, a neighbour of the Mushroom Kingdom. Bowser arrives and causes trouble there.','Bowser even turns himself into a giant flying castle in this adventure.','wonder'],
  ['mario','explorer','power-ups','What can happen after touching a Wonder Flower?','Pipes can come alive','The console turns off','Every coin disappears','The timer skips a day','A Wonder Flower changes a course in a surprising way. One example is pipes suddenly moving around.','Some Wonder Flower effects change the view of a level instead.','wonder'],
  ['mario','explorer','power-ups','Which badge helps a player float over gaps in Super Mario Bros. Wonder?','Parachute Badge','Invisibility Badge','Speed Badge','Coin Badge','The Parachute Badge makes a large cap act like a parachute, helping with a careful landing.','Badges let players add an ability without changing their favourite character.','wonder'],
  ['mario','explorer','characters','Which Super Mario Bros. Wonder character can avoid enemy damage?','Nabbit','Bowser','Wario','Goomba','Nabbit is one of the easier characters to try because enemies do not hurt him. He does not transform with power-ups.','The playable Yoshis also avoid damage from enemies in Wonder.','wonder'],
  ['mario','explorer','power-ups','Which item gives Mario a cat makeover in Super Mario 3D World?','Super Bell','Elephant Fruit','Bubble Flower','Super Mushroom','A Super Bell gives Mario catlike abilities in Super Mario 3D World. The cat form can climb and scratch.','The Switch release pairs Super Mario 3D World with Bowser’s Fury.','cat'],
  ['mario','explorer','games','Which tool did the creators use to plan the first Super Mario Bros.?','Graph paper','A map of the Moon','Toy bricks','A racing wheel','The team sketched the first Super Mario Bros. on graph paper. Its neat squares helped lay out the platforming stages.','Early Mario artwork had to fit into a tiny 16-by-16-pixel space.','historyFacts'],

  // Mario: Pro
  ['mario','scientist','power-ups','What does the Invisibility Badge hide in Super Mario Bros. Wonder?','The player from enemies and themselves','All the coins','Only the timer','The whole course map','The badge makes the character invisible to enemies. It also hides the character from the person playing, making jumps harder.','A Parachute Badge can make tricky jumps easier instead.','wonder'],
  ['mario','scientist','power-ups','Where can Drill Mario travel besides some floors?','Inside certain ceilings','Through every locked door','Across open water','Into the pause menu','The Drill form can burrow into some ceilings. That can reveal paths that ordinary jumps cannot reach.','The drill on Mario’s head can protect him from some falling enemies.','wonderPowers'],
  ['mario','scientist','games','How many friends can join you locally in Super Mario Bros. Wonder?','Three','One','Five','Seven','Up to four people can play on one course together, so one player can invite three friends.','Online players can place standees that help revive someone in trouble.','wonder'],
  ['mario','scientist','consoles','Which system received Super Mario 3D All-Stars on Nintendo’s timeline?','Nintendo Switch','Wii U','Nintendo 3DS','Nintendo 64','Nintendo lists the collection in the Nintendo Switch part of its history. It appears between Super Mario Maker 2 and Bowser’s Fury.','Nintendo dates Super Mario 3D All-Stars to 2020 on the timeline.','history'],
  ['mario','scientist','games','Which Mario game arrived on Nintendo’s timeline in 2019?','Super Mario Maker 2','Super Mario Sunshine','Super Mario Galaxy 2','Super Mario 3D Land','Super Mario Maker 2 is the 2019 entry. It followed the first Maker game, which Nintendo lists for Wii U.','The sequel sits between New Super Mario Bros. U Deluxe and 3D All-Stars on the timeline.','history'],
  ['mario','scientist','characters','Why did early Mario wear bright white gloves?','To make his movements easier to see','To hold a steering wheel','To stay warm in snow','To hide a power-up','White gloves helped show Mario’s hand movements when he jumped in his tiny early sprite.','That original Mario sprite was only 16 by 16 pixels.','historyFacts'],

  // Mario: Legend
  ['mario','professor','games','About how many sticky-note ideas were tested while making Super Mario Bros. Wonder?','More than 2,000','About 20','Exactly 100','Fewer than 10','Developers invited ideas from across the team and prototyped more than 2,000 notes. They wanted surprising new play ideas.','Even sound designers and programmers joined the idea-sharing session.','historyFacts'],
  ['mario','professor','characters','What name did Shigeru Miyamoto first consider for Mario?','Mr. Video','Captain Star','Professor Jump','Red Rocket','Miyamoto thought about Mr. Video before the character became known as Jumpman and then Mario.','He wanted this character to appear in many games he made.','historyFacts'],
  ['mario','professor','games','Which event can a Wonder Flower set off in Super Mario Bros. Wonder?','A Bulrush stampede','A kart pit stop','A tennis match','A console update','Wonder Flowers can suddenly change what a course does. A rushing herd of Bulrushes is one of Nintendo’s examples.','Another Wonder effect can make ordinary pipes move about.','wonder'],
  ['mario','professor','games','Which 2012 Mario game came before New Super Mario Bros. U?','New Super Mario Bros. 2','Super Mario Maker','Super Mario Galaxy 2','Super Mario 3D World','Nintendo places New Super Mario Bros. 2 in August 2012 and the Wii U game that November.','The earlier game is listed for Nintendo 3DS, not Wii U.','history'],
  ['mario','professor','consoles','Which system had the original Super Mario 3D World in 2013?','Wii U','Nintendo 64','GameCube','Wii','The original Super Mario 3D World appears in Nintendo’s 2013 Wii U timeline. A later version came to Switch.','The Switch version adds Bowser’s Fury alongside the 3D World adventure.','history'],
  ['mario','professor','characters','How many pixels wide was the original Mario sprite?','16','8','32','64','Early game hardware gave Mario very little room on screen: his sprite was 16 pixels wide and 16 pixels tall.','His bright gloves helped make his tiny jumping movements visible.','historyFacts'],

  // Mario Kart: Rookie
  ['kart','explorer','games','What do you collect to win Coin Runners in Mario Kart World?','Coins','Wonder Seeds','Power Moons','Stars','Coin Runners is a Battle Mode contest about gathering more coins than rivals. It is not a normal lap race.','Balloon Battle is another Battle Mode game in Mario Kart World.','world'],
  ['kart','explorer','games','What are players trying to pop in Balloon Battle?','Rivals’ balloons','Course signs','Coin boxes','Pipes','Items can burst the balloons carried by other racers. A player who loses every balloon is out.','Mario Kart World also brings back Coin Runners in Battle Mode.','world'],
  ['kart','explorer','characters','Which surprising animal can race in Mario Kart World?','Cow','Elephant','Penguin','Dolphin','Nintendo names Cow as one of the unusual playable racers. The line-up also includes familiar Mario friends.','Goomba and Spike are other unexpected drivers Nintendo highlights.','world'],
  ['kart','explorer','power-ups','What can Dash Food do after a stop at Yoshi’s in Mario Kart World?','Give a speed boost','Erase a cup','Turn off steering','Empty your coins','A drive-through order gives the racer a speed boost. Some food can also unlock a new outfit.','The unlocked outfits can be picked from the character selection screen.','world'],
  ['kart','explorer','tracks','Which Booster Course Pass course is set on a mountain?','DK Mountain','Tokyo Blur','Peach Gardens','Coconut Mall','GCN DK Mountain is a course in the Acorn Cup. The other choices have very different settings.','The Acorn Cup was added in the sixth and final wave.','booster'],
  ['kart','explorer','tracks','Which Booster Course Pass course takes racers to a garden?','Peach Gardens','Boo Lake','Shroom Ridge','Wario Shipyard','DS Peach Gardens is one of four courses in the Moon Cup of Mario Kart 8 Deluxe.','That cup finishes on 3DS Rainbow Road.','booster'],

  // Mario Kart: Pro
  ['kart','scientist','power-ups','What does a Coin Shell leave behind in Mario Kart World?','Coins','Balloons','Power Moons','Wonder Seeds','A Coin Shell can hit rivals and create coins on the track. Racers who collect them can gain speed.','The Ice Flower is another Mario Kart World item; it makes rivals spin.','world'],
  ['kart','scientist','power-ups','What can the Hammer briefly put in a rival’s path in Mario Kart World?','An obstacle','A new cup','A finish line','A shortcut map','A thrown Hammer can strike a rival or briefly block their way. It is one of the game’s items.','Nintendo also brought back the Mega Mushroom for growing large.','world'],
  ['kart','scientist','games','Where can a Charge Jump land your kart in Mario Kart World?','On a grind rail','Inside the score screen','At the next cup automatically','In another game','Charge Jump can launch a driver onto rails or toward a wall ride. Those moves open different routes.','Linked wall rides can uncover a hidden path.','world'],
  ['kart','scientist','characters','Which racer joined Mario Kart 8 Deluxe with Wave 4?','Birdo','Pauline','Funky Kong','Peachette','Birdo is the extra playable racer listed for the fourth Booster Course Pass wave.','Wave 4 also brought the Fruit Cup and Boomerang Cup.','booster'],
  ['kart','scientist','tracks','Which cup includes GBA Boo Lake?','Rock Cup','Moon Cup','Fruit Cup','Acorn Cup','Boo Lake is the second Rock Cup course, between London Loop and Rock Rock Mountain.','Wii Maple Treeway closes the Rock Cup.','booster'],
  ['kart','scientist','tracks','Which cup includes Tour Bangkok Rush?','Boomerang Cup','Fruit Cup','Lucky Cat Cup','Feather Cup','Bangkok Rush opens the Boomerang Cup. Three other courses follow it in that cup.','Singapore Speedway closes the same cup.','booster'],

  // Mario Kart: Legend
  ['kart','professor','games','How many racers can join a local wireless Mario Kart World game?','Up to eight','Exactly two','Up to 24','Only one','Nintendo lists local wireless play for up to eight people, with at most two on each Switch 2 system.','A single system can show four players at once in split screen.','world'],
  ['kart','professor','games','How many teams can VS Race use in Mario Kart World?','Two, three or four','Only one','Exactly five','Up to eight','VS Race lets players choose two, three, or four teams and adjust the racing rules.','Players can choose a classic three-lap race or drive between courses.','world'],
  ['kart','professor','characters','Which racer was added with the final Booster Course Pass wave?','Funky Kong','Birdo','Wiggler','Petey Piranha','Funky Kong joined in Wave 6, together with Diddy Kong, Pauline, and Peachette.','Wave 6 also added the Acorn Cup and Spiny Cup.','booster'],
  ['kart','professor','tracks','What is the second course in the Booster Course Pass Acorn Cup?','GCN DK Mountain','Tour Rome Avanti','Wii Daisy Circuit','Piranha Plant Cove','DK Mountain follows Rome Avanti. Daisy Circuit and Piranha Plant Cove come later in the Acorn Cup.','This cup was one of the two released in Wave 6.','booster'],
  ['kart','professor','tracks','Which course sits between GBA Snow Land and Sky-High Sundae?','Wii Mushroom Gorge','Tour Sydney Sprint','DS Waluigi Pinball','N64 Kalimari Desert','Mushroom Gorge is third in the Propeller Cup. Snow Land comes before it and Sky-High Sundae after.','Sydney Sprint is the opening course of that cup.','booster'],
  ['kart','professor','tracks','Which course begins the Mushroom Cup in Mario Kart World?','Mario Bros. Circuit','Boo Cinema','Starview Peak','Crown City','The Mushroom Cup starts at Mario Bros. Circuit. The next race takes drivers along the road toward Crown City.','In World, Grand Prix racers drive between courses rather than only loading a new track.','world'],
];

export const FRESH_QUESTIONS: readonly TriviaQuestion[] = entries.map((entry, index) => {
  const [topic, difficulty, category, prompt, answer, wrong1, wrong2, wrong3, explanation, funFact, source] = entry;
  return {
    id: `fresh-${index + 1}`, knowledgeId: `fresh-${index + 1}`,
    topic, difficulty, category, prompt, choices: [answer, wrong1, wrong2, wrong3],
    answer, explanation, funFact, sourceUrl: sources[source],
  };
});
