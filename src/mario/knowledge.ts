// Only equivalent facts belong here. Replaced questions keep their old IDs:
// for example expanded-27 (old wording) is not expanded-27-v2 automatically.
const ALIASES: Readonly<Record<string, string>> = {
  'mario-professor-8': 'mario-explorer-5',
  'mario-professor-2': 'mario-professor-1',
  'mario-professor-10': 'mario-professor-3',
  'expanded-28': 'kart-explorer-4',
  'expanded-35': 'kart-explorer-5',
  'fresh-27': 'kart-scientist-10',
  'fresh-17': 'mario-professor-3',
  'expanded-27-v2': 'kart-professor-10',
  'expanded-42': 'kart-professor-9',
  'fresh-8': 'expanded-8',
};

export function canonicalKnowledge(id: string): string {
  return Object.hasOwn(ALIASES, id) ? ALIASES[id] : id;
}

// Preserve the most recent occurrence when old and new IDs both exist.
export function normalizeKnowledge(ids: readonly string[]): string[] {
  return [...new Set(ids.map(canonicalKnowledge))];
}
