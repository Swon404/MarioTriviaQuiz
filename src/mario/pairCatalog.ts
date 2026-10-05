import { QUESTIONS, type Topic, type TriviaQuestion } from './questions.ts';
import { WEB_ARTWORK } from './webArtwork.ts';

export type IconKind = 'emoji' | 'svg' | 'image' | 'text';
export type IconPair = { id: string; topic: Topic; name: string; icon: string; iconKind: IconKind; iconAlt: string; question: TriviaQuestion };

// Legacy drawings remain for saved replays. New boards use reviewed web artwork.
type IconRow = readonly [name: string, icon: string, kind?: IconKind, alt?: string];
const ICON_NAMES: Record<Topic, readonly IconRow[]> = {
  mario: [
    ['Elephant Fruit', 'match-icons/elephant-fruit.svg', 'svg', 'red Elephant Fruit with ears and a trunk'], ['Bubble Flower', 'match-icons/bubble-flower.svg', 'svg', 'pink Bubble Flower with eyes'], ['Fire Flower', 'match-icons/fire-flower.svg', 'svg', 'red and yellow Fire Flower with eyes'],
    ['Drill Mushroom', 'match-icons/drill-mushroom.svg', 'svg', 'silver spiral Drill Mushroom'], ['Super Bell', 'match-icons/super-bell.svg', 'svg', 'golden cat-eared Super Bell'], ['Boo', 'match-icons/boo.svg', 'svg', 'white Boo ghost with a tongue'],
    ['Koopa Troopa', 'match-icons/koopa-troopa.svg', 'svg', 'upright yellow Koopa with a green shell and shoes'], ['Hammer Bro', 'match-icons/hammer-bro.svg', 'svg', 'green helmeted Hammer Bro holding a hammer'], ['Donkey Kong', 'match-icons/donkey-kong.svg', 'svg', 'brown Donkey Kong with a red DK tie'],
    ['Rosalina', 'match-icons/rosalina.svg', 'svg', 'Rosalina in turquoise with a star wand'], ['Princess Peach', 'match-icons/peach.svg', 'svg', 'Princess Peach with a crown and pink dress'], ['Bowser', 'match-icons/bowser.svg', 'svg', 'horned Bowser with red hair and fangs'],
    ['Game Boy', 'match-icons/handheld.svg', 'svg', 'classic handheld console'], ['Nintendo DS', 'match-icons/dual-screen.svg', 'svg', 'folding console with two screens'], ['Wii', 'match-icons/white-console.svg', 'svg', 'white home console and controller'],
    ['Yoshi', 'match-icons/yoshi.svg', 'svg', 'green Yoshi with orange shoes'], ['Monty Mole', 'match-icons/monty-mole.svg', 'svg', 'brown Monty Mole with a big nose and front teeth'], ['Shy Guy', 'match-icons/shy-guy.svg', 'svg', 'red hooded Shy Guy with a white mask'],
    ['Daisy', 'match-icons/daisy.svg', 'svg', 'white daisy flower'], ['Toad', 'match-icons/toad.svg', 'svg', 'Toad with a red-spotted cap and blue vest'],
  ],
  kart: [
    ['Mushroom', 'match-icons/super-mushroom.svg', 'svg', 'red Super Mushroom with white spots'], ['Blooper', 'match-icons/blooper.svg', 'svg', 'white Blooper squid with black eyes'], ['Coin', '🪙'],
    ['Super Horn', '📣'], ['Feather', 'match-icons/white-feather.svg', 'svg', 'white feather'], ['Piranha Plant', 'match-icons/piranha-plant.svg', 'svg', 'red white-spotted Piranha Plant with white jaws'],
    ['Luigi', 'LUIGI', 'text'], ['Wario', 'WARIO', 'text'], ['Waluigi', 'WALUIGI', 'text'],
    ['Bowser Jr.', 'BOWSER JR.', 'text'], ['Dry Bones', 'DRY BONES', 'text'], ['Cow', 'COW', 'text'],
    ['Birdo', 'BIRDO', 'text'], ['Funky Kong', 'FUNKY KONG', 'text'], ['Kamek', 'KAMEK', 'text'],
    ['Fruit Cup', '🍎'], ['Moon Cup', '🌙'], ['Rock Cup', 'match-icons/rock.svg', 'svg', 'faceted grey rock'],
    ['Grand Prix', '🏆'], ['Time Trials', '⏱️'],
  ],
};

export const ICON_PAIRS: readonly IconPair[] = (Object.keys(ICON_NAMES) as Topic[]).flatMap(topic =>
  ICON_NAMES[topic].map(([name, icon, iconKind = 'emoji', iconAlt = icon]) => {
    // Racers also appear in the Mario question bank; reuse their existing facts.
    const question = QUESTIONS.find(item => item.topic === topic && item.answer === name) ?? QUESTIONS.find(item => item.answer === name);
    if (!question) throw new Error(`No reviewed question for pair ${topic}: ${name}`);
    const artwork = WEB_ARTWORK[name];
    return { id: `${topic}-${name}`, topic, name, icon: artwork?.path ?? icon, iconKind: artwork ? 'image' : iconKind, iconAlt: artwork ? `${name} — game artwork or photograph` : iconAlt, question };
  }),
);
