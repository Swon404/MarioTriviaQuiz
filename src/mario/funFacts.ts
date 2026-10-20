// Question-specific pools: alternatives must add to the explanation, not repeat
// the answer. These character facts share the question's official source link.
export const FUN_FACT_REVIEW = {
  checkedOn: '2026-10-06',
  sourceUrl: 'https://www.nintendo.com/en-ca/explore/characters/mario/friends/',
} as const;

const luigiMoustache = 'Try telling the brothers apart without their hats: their moustaches have different shapes too.';
const luigiGhosts = 'Luigi can be frightened of ghosts and still face danger. Being brave does not mean never feeling scared.';
export const QUESTION_FUN_FACTS: Readonly<Record<string, readonly string[]>> = {
  'mario-explorer-1': [luigiMoustache, luigiGhosts],
  'mario-explorer-4': [luigiMoustache, luigiGhosts, 'Luigi is taller and known for higher jumps: the green outfit is not his only difference from Mario.'],
  'mario-explorer-2': [
    'Peach enjoys cooking and baking—a quieter side to someone who also races and plays sports with Mario.',
    'Peach’s goal is a kingdom where everyone lives happily together, not simply keeping a crown for herself.',
  ],
  'mario-explorer-3': [
    'Size is not Bowser’s only weapon: he combines huge strength with fire breath.',
    'Bowser’s followers are not all Koopas. Goombas, Bullet Bills and Shy Guys also serve in his forces.',
  ],
  'mario-explorer-7': [
    'Wario loves garlic as well as money—not the usual wish list for a hero rescuing a kingdom.',
    'Wario and Mario’s rivalry goes back a long way: they have known each other since they were babies.',
  ],
  'mario-explorer-9': [
    'Red spots identify Toad, but other Toads wear different colours. A crowd of Toads is not a crowd of identical copies.',
    'Toad is willing to face danger for Peach and the kingdom; helping is not always a safe sideline.',
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
