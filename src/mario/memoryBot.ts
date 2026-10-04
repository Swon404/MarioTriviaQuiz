import type { Difficulty } from './questions.ts';

export type SeenCard = { position: number; pairId: string; kind: 'icon' | 'word' };
export type CardMemory = readonly SeenCard[];

export function rememberCard(memory: CardMemory, card: SeenCard, difficulty: Difficulty): CardMemory {
  const capacity = { explorer: 6, scientist: 12, professor: 40 }[difficulty];
  return [...memory.filter(item => item.position !== card.position), card].slice(-capacity);
}

// Deliberately receives only positions and previously seen cards, never the
// hidden board. Card IDs in the UI contain answers and must not be passed here.
export function chooseMemoryCard(available: readonly number[], memory: CardMemory, random: () => number, first?: SeenCard): number {
  if (!available.length) throw new Error('No available card for Mushbot');
  const known = memory.filter(item => available.includes(item.position));
  if (first) {
    const partner = known.find(item => item.pairId === first.pairId && item.kind !== first.kind);
    if (partner) return partner.position;
  } else {
    const completePair = known.find(item => known.some(other => other.pairId === item.pairId && other.kind !== item.kind));
    if (completePair) return completePair.position;
  }
  const unseen = available.filter(position => !known.some(item => item.position === position));
  const candidates = unseen.length ? unseen : available;
  return candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
}

export function seededBotRandom(seed: string): () => number {
  let state = 2166136261;
  for (const character of seed) state = Math.imul(state ^ character.charCodeAt(0), 16777619);
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
}
