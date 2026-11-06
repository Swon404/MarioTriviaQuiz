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
  return <aside className={`kart-stakes${compact ? ' kart-stakes-compact' : ''}`} aria-label="Race stakes">
    <strong className="kart-stakes-title"><span className="kart-mini-icon"><KartSpaceIcon effect={race.effect} /></span>{activeName ? `Kart Quest · ${KART_EFFECTS[race.effect].name}` : `${race.players[kartActive(race)]}'s ${KART_EFFECTS[race.effect].name.toLowerCase()}`}</strong>
    {activeName && <p className="kart-stakes-positions">{race.players.map((name, i) => <span key={i} className={`kart-colour-${i}`}>{name}: {kartDistance(race.positions[i])}</span>)}</p>}
    {race.players.map((name, i) => <p key={i}><b>{name} wins:</b> {kartOutcome(race, i)}</p>)}
    {race.effect === 'box' && <small>Winner also chooses a power-up.</small>}
    {race.effect === 'star' && <small>{race.itemRules === 'boost-star-v2' ? 'Winner gets a Star if their item slot is empty. Held items stay safe.' : 'Winner gets a Star shield, replacing any held item.'}</small>}
    {!compact && <small>Draw: {kartOutcome(race, null)}</small>}
  </aside>;
}
