import { KART_GAME_NAMES } from './KartQuest.tsx';
import { kartActive, resolveKart, type KartRace } from './mario/kartQuest.ts';
import type { QuizResult } from './mario/storage.ts';

export function kartResultPoints(race: KartRace, result: QuizResult): [number, number] {
  return result.player === race.players[0]
    ? [result.points ?? 0, result.opponentPoints ?? 0]
    : [result.opponentPoints ?? 0, result.points ?? 0];
}

export default function KartChallengeResult({ race, result, onReturn, onExit }: {
  race: KartRace; result: QuizResult; onReturn: () => void; onExit: () => void;
}) {
  const points = kartResultPoints(race, result);
  const winner = points[0] === points[1] ? null : points[0] > points[1] ? 0 : 1;
  // Preview the actual race rules; only Return to track commits the movement.
  const next = resolveKart(race, points);
  const timed = result.mode === 'game-order' || result.mode === 'pair-match';
  const showTimes = timed && Number.isFinite(result.elapsedMs) && Number.isFinite(result.opponentElapsedMs);
  const active = kartActive(race);
  const shieldUsed = race.items[active] === 'star' && next.items[active] === null;
  return <section className="quiz-result result-panel kart-challenge-result" aria-label="Track challenge result">
    <p className="eyebrow">KART QUEST · {KART_GAME_NAMES[result.mode ?? 'quiz']}</p>
    <h1>{winner === null ? "It's a draw!" : `${race.players[winner]} wins!`}</h1>
    <div className="kart-result-moves" aria-label="Next track moves">
      {race.players.map((name, i) => {
        const move = next.positions[i] - race.positions[i];
        const time = name === result.player ? result.elapsedMs : result.opponentElapsedMs;
        return <div key={i} className={`kart-result-player kart-result-player-${i} ${winner === i ? 'kart-result-winner' : ''}`}>
          <span className="kart-result-identity"><span className="kart-result-number" aria-hidden="true">{i + 1}</span><span><strong>{name}</strong>{showTimes && <small aria-label={`${name}'s time`}>{(time! / 1000).toFixed(1)}s</small>}</span></span>
          <strong className="kart-result-move">{move === 0 ? 'Stays put' : `${move > 0 ? '+' : '−'}${Math.abs(move)} ${Math.abs(move) === 1 ? 'space' : 'spaces'}`}</strong>
        </div>;
      })}
    </div>
    {shieldUsed && <p className="kart-result-extra">⭐ {race.players[active]}’s Star blocked the banana!</p>}
    {next.rewardPlayer !== null && <p className="kart-result-extra">🎁 {race.players[next.rewardPlayer]}, choose a power-up back on the track.</p>}
    {race.effect === 'star' && winner !== null && <p className="kart-result-extra">⭐ {race.players[winner]} gets a Star shield.</p>}
    <button className="start-btn" onClick={onReturn}>Return to track</button>
    <button className="back-btn" onClick={onExit}>← Back to games</button>
  </section>;
}
