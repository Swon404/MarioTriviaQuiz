import { canonicalKnowledge, normalizeKnowledge } from './knowledge.ts';

const KEY = 'mariotrivia_question_history_v1';
type History = Record<string, string[]>;
const playerKey = (name: string) => name.trim().toLowerCase();

// Lower ranks come first: unseen material, then the oldest seen material.
export function knowledgeRank(id: string, recent: readonly string[]): number {
  const index = recent.findIndex(seen => canonicalKnowledge(seen) === canonicalKnowledge(id));
  return index < 0 ? -recent.length - 1 : -index;
}

function readHistory(): History {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([, ids]) => Array.isArray(ids) && ids.every(id => typeof id === 'string')).map(([name, ids]) => [name, normalizeKnowledge(ids).slice(0, 1000)]));
  } catch { return {}; }
}

// Most-recent first. On shared-screen games, avoid material either human saw.
export function recentKnowledge(players: readonly string[]): string[] {
  const history = readHistory();
  return [...new Set(players.flatMap(name => Object.hasOwn(history, playerKey(name)) ? history[playerKey(name)] : []))];
}

export function recordSeenKnowledge(players: readonly string[], ids: readonly string[]): void {
  if (!ids.length) return;
  try {
    const history = readHistory();
    for (const name of new Set(players.map(playerKey).filter(Boolean))) {
      // defineProperty also safely supports names such as "__proto__".
      Object.defineProperty(history, name, { value: normalizeKnowledge([...ids, ...(Object.hasOwn(history, name) ? history[name] : [])]).slice(0, 1000), enumerable: true, configurable: true, writable: true });
    }
    localStorage.setItem(KEY, JSON.stringify(history));
  } catch { /* Private browsing/full storage must not stop a game. */ }
}
