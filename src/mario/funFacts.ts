// Every alternative carries the source that supports that particular extra.
import { CHARACTER_DISCOVERIES, DISCOVERY_SOURCES } from './discoveries.ts';
import { ADVENTURE_QUESTIONS } from './adventureQuestions.ts';
import { PLATFORM_QUESTIONS } from './platformQuestions.ts';
import { extraKnowledgeId, extraQuizKnowledge } from './extraKnowledge.ts';
export { extraKnowledgeId } from './extraKnowledge.ts';
export const FUN_FACT_REVIEW = {
  checkedOn: '2026-10-27',
  sourceUrl: 'https://www.nintendo.com/en-ca/explore/characters/mario/friends/',
} as const;

const luigiMoustache = 'In Luigi’s Mansion 3, Gooigi can squeeze through bars and cross spikes. Luigi has to find a different way around.';
const luigiGhosts = 'Keep Gooigi away from water in Luigi’s Mansion 3: the squishy green helper dissolves. Even a puddle can spoil his shortcut.';
// Additional extras use each question's reviewed, edition-specific source.
const addedExtras: Readonly<Record<string, string>> = {
  'adventure-wonder-hoppo': 'Ordinary Hoppos do not hurt you on contact. Their size makes them look scarier than they are.',
  'adventure-wonder-condart': 'Watch which way a Condart faces: it can charge sideways as well as downwards.',
  'adventure-wonder-maw': 'A Maw-Maw facing a fireball can swallow it and spit it back. Try another angle.',
  'adventure-odyssey-pokio': 'Poke a suitable wall to anchor Pokio’s beak, then pull back and fling yourself upwards.',
  'adventure-odyssey-gushen': 'In the Seaside boss rematch, the rain gives your Gushen an endless water supply.',
  'adventure-odyssey-tyfoo': 'Snow Kingdom’s Ty-foos wear Santa hats. Knock a hat off before trying to capture its owner.',
  'adventure-odyssey-jizo': 'A captured Jizo gets around in little hops. Shake the controller to move it faster.',
  'platform-3dw-cannon': 'The Cannon Box changes colour to match the character wearing it.',
  'platform-3dw-ant': 'Ant Troopers march along walls as well as floors. Check where their line is heading.',
  'platform-fury-shards': 'Bowser Jr. can collect Cat Shine Shards too. A second player can help search.',
};
const addedQuestions = [...ADVENTURE_QUESTIONS, ...PLATFORM_QUESTIONS].filter(question => Object.hasOwn(addedExtras, question.id));
export const QUESTION_FUN_FACTS: Readonly<Record<string, readonly string[]>> = {
  ...Object.fromEntries(addedQuestions.map(question => [question.id, [question.funFact, addedExtras[question.id]]])),
  'mario-explorer-1': [luigiMoustache, luigiGhosts],
  'mario-explorer-4': [luigiMoustache, luigiGhosts],
  'mario-explorer-2': [
    CHARACTER_DISCOVERIES['Princess Peach'].text,
    'Some 3D World switches only work for a particular character. Bring Peach back to her switch to uncover its secret.',
  ],
  'mario-explorer-3': [
    CHARACTER_DISCOVERIES.Bowser.text,
    'In Bowser’s Fury, lighthouses make useful lookout towers. Climb high and scan for secrets you cannot spot from the ground.',
  ],
  'mario-explorer-7': [
    'Wario loves garlic and making money. Treasure hunting with him might be profitable, but sharing a lift sounds risky.',
    'Mario and Wario have known each other since they were babies. This rivalry has had years of practice.',
  ],
  'mario-explorer-9': [
    CHARACTER_DISCOVERIES.Toad.text,
    'In 3D World, Toad’s speed is only one option: Luigi jumps high and Peach floats. Change character when a course gives you trouble.',
  ],
};

export const QUESTION_FACT_SOURCES: Readonly<Record<string, string>> = {
  ...Object.fromEntries(addedQuestions.map(question => [question.id, question.sourceUrl])),
  'mario-explorer-1': CHARACTER_DISCOVERIES.Luigi.sourceUrl,
  'mario-explorer-4': CHARACTER_DISCOVERIES.Luigi.sourceUrl,
  'mario-explorer-2': DISCOVERY_SOURCES.cat,
  'mario-explorer-3': DISCOVERY_SOURCES.cat,
  'mario-explorer-7': FUN_FACT_REVIEW.sourceUrl,
  'mario-explorer-9': DISCOVERY_SOURCES.cat,
};

export function withVariedFunFacts<T extends { id: string; funFact: string; factPoolId?: string }>(
  questions: readonly T[], random = Math.random, recent: readonly string[] = [],
): T[] {
  const used = new Set(recent);
  return questions.map(question => {
    const id = question.factPoolId ?? question.id;
    const pool = Object.hasOwn(QUESTION_FUN_FACTS, id)
      ? QUESTION_FUN_FACTS[id] : [question.funFact];
    const fresh = pool.filter(fact => fact && !used.has(extraKnowledgeId(fact)) && !extraQuizKnowledge(fact).some(id => used.has(id)));
    const funFact = fresh.length ? fresh[Math.floor(random() * fresh.length)] : '';
    if (funFact) used.add(extraKnowledgeId(funFact));
    return { ...question, funFact, ...(QUESTION_FACT_SOURCES[id] ? { funFactSourceUrl: QUESTION_FACT_SOURCES[id] } : {}) };
  });
}
