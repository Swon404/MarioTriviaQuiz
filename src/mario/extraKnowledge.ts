const normalise = (text: string) => text.trim().toLowerCase().replace(/\s+/g, ' ');
// Only explicit equivalent statements. Sharing a subject alone is not enough.
const groups: readonly { id: string; quiz?: string; texts: readonly string[] }[] = [
  { id: 'odyssey-goomba-stack', quiz: 'adventure-odyssey-goomba-stack', texts: [
    'In Odyssey, captured Goombas can stack into a tower. A pile of tiny enemies becomes a way to reach higher places.',
    'Captured Goombas have a different team trick: they can stack into towers. Sometimes several tiny enemies are more useful than one huge one.',
  ] },
  { id: 'wonder-bubble-spin', quiz: 'expanded-16', texts: [
    'A spin jump sends bubbles in both directions, helping when trouble is on either side.',
  ] },
  { id: 'wonder-fire-spin', texts: [
    'A spin jump lets Fire Mario shoot while turning—try comparing that move with Bubble Mario’s version.',
    'Fire Mario can combine spinning and shooting as well. Try the same move with a different Flower and compare the results.',
  ] },
];
const entries = new Map(groups.flatMap(group => group.texts.map(text => [normalise(text), group] as const)));
export function extraKnowledgeId(fact: string): string {
  const text = normalise(fact);
  return `extra:${entries.get(text)?.id ?? text}`;
}
export function extraQuizKnowledge(fact: string): readonly string[] {
  const id = entries.get(normalise(fact))?.quiz;
  return id ? [id] : [];
}
