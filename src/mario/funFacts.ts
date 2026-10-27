// Every alternative carries the source that supports that particular extra.
import { CHARACTER_DISCOVERIES, DISCOVERY_SOURCES } from './discoveries.ts';
export const FUN_FACT_REVIEW = {
  checkedOn: '2026-10-27',
  sourceUrl: 'https://www.nintendo.com/en-ca/explore/characters/mario/friends/',
} as const;

const luigiMoustache = 'In Luigi’s Mansion 3, Gooigi can squeeze through bars and cross spikes. Luigi has to find a different way around.';
const luigiGhosts = 'Keep Gooigi away from water in Luigi’s Mansion 3: the squishy green helper dissolves. Even a puddle can spoil his shortcut.';
export const QUESTION_FUN_FACTS: Readonly<Record<string, readonly string[]>> = {
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
  'mario-explorer-1': CHARACTER_DISCOVERIES.Luigi.sourceUrl,
  'mario-explorer-4': CHARACTER_DISCOVERIES.Luigi.sourceUrl,
  'mario-explorer-2': DISCOVERY_SOURCES.cat,
  'mario-explorer-3': DISCOVERY_SOURCES.cat,
  'mario-explorer-7': FUN_FACT_REVIEW.sourceUrl,
  'mario-explorer-9': DISCOVERY_SOURCES.cat,
};

export function withVariedFunFacts<T extends { id: string; funFact: string }>(
  questions: readonly T[], random = Math.random,
): T[] {
  const used = new Set<string>();
  return questions.map(question => {
    const pool = Object.hasOwn(QUESTION_FUN_FACTS, question.id)
      ? QUESTION_FUN_FACTS[question.id] : [question.funFact];
    const fresh = pool.filter(fact => !used.has(fact));
    const candidates = fresh.length ? fresh : pool;
    const funFact = candidates[Math.floor(random() * candidates.length)];
    used.add(funFact);
    return { ...question, funFact, ...(QUESTION_FACT_SOURCES[question.id] ? { funFactSourceUrl: QUESTION_FACT_SOURCES[question.id] } : {}) };
  });
}
