import type { GameMode } from './rounds.ts';

export type KartItem = 'mushroom' | 'star';
export type KartEffect = 'road' | 'banana' | 'pipe' | 'box' | 'star' | 'rival' | 'mushroom';
export type KartSpace = { mode: GameMode; effect: KartEffect; fork?: boolean };
const TRACK_MODES: readonly GameMode[] = [
  'pair-match', 'game-order', 'quiz', 'pair-match', 'clue-duel', 'game-order',
  'pair-match', 'game-order', 'clue-duel', 'pair-match', 'category-finder', 'clue-duel',
  'game-order', 'pair-match', 'track-finder', 'clue-duel', 'game-order', 'pair-match',
  'clue-duel', 'game-order', 'clue-duel', 'pair-match', 'game-order', 'clue-duel',
];
export const KART_TRACK: readonly KartSpace[] = Array.from({ length: 24 }, (_, i) => ({
  mode: TRACK_MODES[i],
  effect: (['road', 'box', 'road', 'banana', 'pipe', 'rival', 'mushroom', 'star', 'banana', 'box', 'pipe', 'rival'] as KartEffect[])[i % 12],
  fork: [5, 11, 17].includes(i),
}));
export const KART_EFFECTS: Record<KartEffect, { icon: string; name: string; rule: string }> = {
  road: { icon: '🏎️', name: 'Open road', rule: 'Winner moves +2. Draw: both +1.' },
  banana: { icon: '🍌', name: 'Banana challenge', rule: 'Landing player wins: dodge and move +2. Loses: slip −1; rival moves +2. Draw: nobody moves. A Star blocks the slip.' },
  pipe: { icon: '🟢', name: 'Pipe shortcut', rule: 'Landing player wins: take the +4 shortcut. Loses: stay here; rival moves +2. Draw: nobody moves.' },
  box: { icon: '❓', name: 'Item box', rule: 'Winner moves +2 and chooses a Mushroom or Star. Draw: both +1, no item.' },
  star: { icon: '⭐', name: 'Star challenge', rule: 'Winner moves +2 and earns a Star shield. Draw: both +1, no item.' },
  rival: { icon: '🏁', name: 'Rival race', rule: 'Winner moves +3. Draw: both +1.' },
  mushroom: { icon: '🍄', name: 'Mushroom dash', rule: 'Take a safe +1 without a challenge, or race: landing player wins +3, loses +0 while rival gets +2. Draw: nobody moves.' },
};
export type KartRace = {
  itemRules?: 'boost-star-v2' | 'simple-v3'; id: string; players: [string, string]; positions: [number, number]; items: [KartItem | null, KartItem | null];
  starter: 0 | 1; turn: number; phase: 'roll' | 'landed' | 'challenge' | 'reward' | 'summary' | 'finished';
  die: number; space: number; effect: KartEffect; routeChosen: boolean; rewardPlayer: 0 | 1 | null;
  message: string; log: string[];
};
export const kartActive = (race: KartRace): 0 | 1 => ((race.starter + race.turn) % 2) as 0 | 1;
export function newKartRace(players: [string, string], random = Math.random): KartRace {
  return { itemRules: 'simple-v3', id: crypto.randomUUID(), players, positions: [0, 0], items: [null, null], starter: random() < 0.5 ? 0 : 1,
    turn: 0, phase: 'roll', die: 0, space: 0, effect: 'road', routeChosen: false, rewardPlayer: null,
    message: 'Roll, land, then both play. First to 24 triggers the final pair of turns. Six rolls each at most.', log: [] };
}
function copy(race: KartRace): KartRace { return { ...race, positions: [...race.positions], items: [...race.items], log: [...race.log] }; }
export function rollKart(race: KartRace, boost = false, random = Math.random): KartRace {
  if (race.phase !== 'roll') return race;
  const next = copy(race), active = kartActive(race);
  next.die = Math.floor(random() * 6) + 1;
  const extra = boost && next.items[active] === 'mushroom' ? 2 : 0;
  if (extra) next.items[active] = null;
  next.positions[active] += next.die + extra;
  next.space = Math.min(24, next.positions[active]);
  next.effect = KART_TRACK[next.space - 1].effect;
  next.routeChosen = race.itemRules === 'simple-v3' || !KART_TRACK[next.space - 1].fork;
  next.phase = 'landed';
  next.message = `${next.players[active]} rolled ${next.die}${extra ? ' +2 Mushroom boost' : ''} and reached space ${next.positions[active]}.`;
  return next;
}
export function chooseKartRoute(race: KartRace, safe: boolean): KartRace {
  if (race.phase !== 'landed' || race.routeChosen) return race;
  return { ...race, effect: safe ? 'road' : race.effect, routeChosen: true };
}
export function beginKartChallenge(race: KartRace): KartRace {
  return race.phase === 'landed' && race.routeChosen ? { ...race, phase: 'challenge' } : race;
}
function summarise(next: KartRace, text: string): KartRace {
  next.message = text;
  next.log.push(text);
  next.phase = 'summary';
  return next;
}
export function safeKartMushroom(race: KartRace): KartRace {
  if (race.itemRules === 'simple-v3' || race.phase !== 'landed' || race.effect !== 'mushroom' || !race.routeChosen) return race;
  const next = copy(race), active = kartActive(race);
  next.positions[active]++;
  return summarise(next, `${next.players[active]} took the safe Mushroom: +1 space.`);
}
export function resolveKart(race: KartRace, points: [number, number]): KartRace {
  if (race.phase !== 'challenge') return race;
  const next = copy(race), active = kartActive(race);
  const winner = points[0] === points[1] ? null : points[0] > points[1] ? 0 : 1;
  const before = [...next.positions];
  let itemMessage = '';
  const boostStar = race.itemRules === 'boost-star-v2';
  const simple = race.itemRules === 'simple-v3';
  if (winner === null) {
    if (simple || !['banana', 'pipe', 'mushroom'].includes(race.effect)) { next.positions[0]++; next.positions[1]++; }
  } else {
    next.positions[winner] += simple ? 2 : race.effect === 'rival' ? 3 : winner === active && race.effect === 'pipe' ? 4 : winner === active && race.effect === 'mushroom' ? 3 : 2;
    if (simple && ['box', 'mushroom', 'pipe'].includes(race.effect)) {
      next.positions[winner] += 2;
      itemMessage += race.effect === 'pipe' ? ' Shortcut! +2 extra spaces.' : ' Mushroom boost! +2 extra spaces.';
    }
    if (boostStar && next.items[winner] === 'star') {
      next.positions[winner] += 3;
      next.items[winner] = null;
      itemMessage += ` ${next.players[winner]}'s Star added +3!`;
    }
    if (race.effect === 'banana' && winner !== active) {
      if (next.items[active] === 'star') { next.items[active] = null; itemMessage += ' Star blocked the banana!'; }
      else { next.positions[active] = Math.max(0, next.positions[active] - 1); if (simple) itemMessage += ` ${next.players[active]} slipped back 1!`; }
    }
    if (race.effect === 'star') {
      if (boostStar && next.items[winner] !== null) itemMessage += ` ${next.players[winner]} kept their ${next.items[winner]}; no item was replaced.`;
      else { next.items[winner] = 'star'; itemMessage += ` ${next.players[winner]} earned a Star${simple ? ' shield!' : boostStar ? ': next win +3, or block one banana slip' : ' shield (replacing any held item)'}.`; }
    }
    if (race.effect === 'box' && !simple) next.rewardPlayer = winner;
  }
  summarise(next, simple ? winner === null ? 'Draw! Both move forward 1.' : `${next.players[winner]} wins!${itemMessage}` : `${winner === null ? 'Draw' : `${next.players[winner]} wins`}. ${next.players.map((name, i) => `${name}: ${next.positions[i] - before[i] >= 0 ? '+' : ''}${next.positions[i] - before[i]} spaces`).join(' · ')}.${itemMessage}`);
  if (next.rewardPlayer !== null) next.phase = 'reward';
  return next;
}
export function claimKartItem(race: KartRace, item: KartItem): KartRace {
  if (race.phase !== 'reward' || race.rewardPlayer === null) return race;
  const next = copy(race);
  next.items[race.rewardPlayer] = item;
  next.rewardPlayer = null;
  next.phase = 'summary';
  next.message += ` ${race.players[race.rewardPlayer]} chose a ${item === 'star' ? 'Star' : 'Mushroom'}, replacing any held item.`;
  return next;
}
export function nextKartTurn(race: KartRace): KartRace {
  if (race.phase !== 'summary') return race;
  const turn = race.turn + 1;
  const finished = turn % 2 === 0 && (Math.max(...race.positions) >= 24 || turn >= 12);
  return { ...race, turn, phase: finished ? 'finished' : 'roll' };
}
