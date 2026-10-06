// Question-specific pools: alternatives must add to the explanation, not repeat
// the answer. These character facts share the question's official source link.
export const FUN_FACT_REVIEW = {
  checkedOn: '2026-10-06',
  sourceUrl: 'https://www.nintendo.com/en-ca/explore/characters/mario/friends/',
} as const;

const luigiMoustache = 'Look closely: Luigi’s moustache has a different shape from Mario’s.';
const luigiGhosts = 'Even a hero gets nervous: ghosts can give Luigi a fright.';
export const QUESTION_FUN_FACTS: Readonly<Record<string, readonly string[]>> = {
  'mario-explorer-1': [luigiMoustache, luigiGhosts],
  'mario-explorer-4': [luigiMoustache, luigiGhosts, 'Luigi is taller than Mario and can jump higher.'],
  'mario-explorer-2': [
    'Peach enjoys cooking and baking when she is not adventuring.',
    'Peach wants a kingdom where everyone can live happily together.',
  ],
  'mario-explorer-3': [
    'Bowser combines enormous strength with the ability to breathe fire.',
    'Goombas, Bullet Bills and Shy Guys all appear among Bowser’s followers.',
  ],
  'mario-explorer-7': [
    'Garlic is one of Wario’s favourite things, alongside making money.',
    'Wario and Mario have known each other since they were babies.',
  ],
  'mario-explorer-9': [
    'Toad has red spots, but other Toads come in different colours.',
    'Toad helps protect the kingdom even when it puts him in danger.',
  ],
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
    return { ...question, funFact };
  });
}
