import { QUESTIONS, type Topic, type TriviaQuestion } from './questions.ts';

export type IconKind = 'emoji' | 'svg' | 'text';
export type IconPair = { id: string; topic: Topic; name: string; icon: string; iconKind: IconKind; iconAlt: string; question: TriviaQuestion };

// The illustrations are original, generic SVGs. Other cards use emoji or text;
// no Nintendo sprites or logos are used. Names have reviewed question sources.
type IconRow = readonly [name: string, icon: string, kind?: IconKind, alt?: string];
const ICON_NAMES: Record<Topic, readonly IconRow[]> = {
  mario: [
    ['Elephant Fruit', '🐘'], ['Bubble Flower', '🫧'], ['Fire Flower', '🔥'],
    ['Drill Mushroom', '🛠️'], ['Super Bell', '🔔'], ['Boo', '👻'],
    ['Koopa Troopa', '🐢'], ['Hammer Bro', '🔨'], ['Donkey Kong', '🦍'],
    ['Rosalina', '🌌'], ['Princess Peach', '👑'], ['Bowser', '🐲'],
    ['Game Boy', '🎮'], ['Nintendo DS', '📱'], ['Wii', 'match-icons/white-console.svg', 'svg', 'white home console and controller'],
    ['Yoshi', '🦖'], ['Monty Mole', '🕳️'], ['Shy Guy', '🎭'],
    ['Daisy', 'DAISY', 'text', 'Daisy text badge'], ['Toad', '🧢'],
  ],
  kart: [
    ['Mushroom', '🍄'], ['Blooper', 'match-icons/blue-squid.svg', 'svg', 'blue squid'], ['Coin', '🪙'],
    ['Super Horn', '📣'], ['Feather', '🪶'], ['Piranha Plant', 'match-icons/carnivorous-flower.svg', 'svg', 'colourful carnivorous flower'],
    ['Coconut Mall', '🥥'], ['Choco Mountain', '🍫'], ['Rainbow Road', 'match-icons/rainbow-road.svg', 'svg', 'curving rainbow road'],
    ['Merry Mountain', '🏔️'], ['Sky-High Sundae', '🍦'], ['Ninja Hideaway', 'match-icons/ninja-hideaway.svg', 'svg', 'moonlit rooftop hideaway'],
    ['Boo Cinema', '👻'], ['Starview Peak', '⭐'], ['Crown City', '🏙️'],
    ['Fruit Cup', '🍎'], ['Moon Cup', '🌙'], ['Rock Cup', '🪨'],
    ['Grand Prix', '🏆'], ['Time Trials', '⏱️'],
  ],
};

export const ICON_PAIRS: readonly IconPair[] = (Object.keys(ICON_NAMES) as Topic[]).flatMap(topic =>
  ICON_NAMES[topic].map(([name, icon, iconKind = 'emoji', iconAlt = icon]) => {
    const question = QUESTIONS.find(item => item.topic === topic && item.answer === name);
    if (!question) throw new Error(`No reviewed question for pair ${topic}: ${name}`);
    return { id: `${topic}-${name}`, topic, name, icon, iconKind, iconAlt, question };
  }),
);
