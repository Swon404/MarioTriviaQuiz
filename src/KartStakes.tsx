import KartSpaceIcon from './KartSpaceIcon.tsx';
import { KART_EFFECTS, kartActive, resolveKart, type KartRace } from './mario/kartQuest.ts';

export const kartDistance = (position: number) => position >= 24 ? `Finish${position > 24 ? ` +${position - 24}` : ''}` : `Space ${position}`;

export function kartOutcome(race: KartRace, winner: number | null) {
  const next = resolveKart({ ...race, phase: 'challenge' }, winner === null ? [0, 0] : winner === 0 ? [1, 0] : [0, 1]);
  return race.players.map((name, i) => {
    const move = next.positions[i] - race.positions[i];
    return `${name} ${move === 0 ? 'stays put' : `${move > 0 ? '+' : '−'}${Math.abs(move)} → ${kartDistance(next.positions[i])}`}`;
  }).join(' · ');
}

export default function KartStakes({ race, activeName, compact = false }: { race: KartRace; activeName?: string; compact?: boolean }) {
  const simpleReward = {
    road: 'Winner moves forward 2 spaces.',
    rival: 'Winner moves forward 3 spaces.',
    banana: 'Win to dodge the banana!',
    pipe: 'Win to take a shortcut!',
    mushroom: 'Take a free step, or race for more!',
    box: 'Win a power-up!',
    star: 'Win a Star!',
  }[race.effect];
  const hasBoost = race.itemRules === 'boost-star-v2' && race.items.includes('star');
  return <aside className={`kart-stakes${compact ? ' kart-stakes-compact' : ''}`} aria-label="Race stakes">
    <strong className="kart-stakes-title"><span className="kart-mini-icon"><KartSpaceIcon effect={race.effect} /></span>{activeName ? 'Kart Quest' : KART_EFFECTS[race.effect].name}</strong>
    <p className="kart-simple-reward">{hasBoost && (race.effect === 'road' || race.effect === 'rival') ? 'Win to move ahead! Your Star adds a boost.' : simpleReward}</p>
    <details className="kart-stakes-rules"><summary>Rules</summary>
      <p>{race.players[kartActive(race)]} landed here.</p>
      {race.players.map((name, i) => <p key={i}><b>{name} wins:</b> {kartOutcome(race, i)}</p>)}
      <p>Draw: {kartOutcome(race, null)}</p>
      {race.effect === 'box' && <p>Winner also chooses a power-up.</p>}
      {race.effect === 'star' && <p>{race.itemRules === 'boost-star-v2' ? 'Winner gets a Star if their item slot is empty. Held items stay safe.' : 'Winner gets a Star shield, replacing any held item.'}</p>}
    </details>
  </aside>;
}
