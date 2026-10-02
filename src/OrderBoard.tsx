import { useEffect, useState } from 'react';
import type { OrderRound } from './mario/rounds.ts';
import type { Difficulty } from './mario/questions.ts';
import { ORDER_RULES, orderLeaderboard, saveOrderTime, type OrderOptions } from './mario/gameOrder.ts';

export default function OrderBoard({ round, difficulty, options, player, resultId, onSolved, onNext, onRestart, nextLabel, resultMessage }: {
  round: OrderRound; difficulty: Difficulty; options: OrderOptions; player: string; resultId: string; onSolved: (elapsedMs: number) => void;
  onNext: () => void; onRestart: () => void; nextLabel: string; resultMessage?: string;
}) {
  const [tiles, setTiles] = useState(round.tiles.map(tile => tile.id));
  const [selected, setSelected] = useState<number | null>(null);
  const [started, setStarted] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const rules = ORDER_RULES[options.challenge];
  useEffect(() => {
    if (started === null || solved) return;
    const timer = window.setInterval(() => setElapsed(performance.now() - started + penalty), 50);
    return () => clearInterval(timer);
  }, [started, solved, penalty]);
  const check = () => {
    if (started === null || solved) return;
    const positions = tiles.map((id, index) => round.correctIds.indexOf(id) === index ? 'correct' : round.correctIds.indexOf(id) < index ? 'left' : 'right');
    setFeedback(positions);
    setSelected(null);
    const tries = attempts + 1;
    setAttempts(tries);
    if (positions.every(value => value === 'correct')) {
      const time = Math.max(1, Math.round(performance.now() - started + penalty));
      setElapsed(time);
      setSolved(true);
      saveOrderTime({ id: resultId, player, difficulty, ...options, elapsedMs: time, attempts: tries, completedAt: new Date().toISOString() });
      onSolved(time);
    } else setPenalty(value => value + rules.penalty);
  };
  const scores = orderLeaderboard(difficulty, options);
  return <div className="order-challenge">
    <p className="help-copy">Oldest to newest. Tap two tiles to swap them. Keep trying until solved; your time is the challenge.</p>
    {started === null ? <div className="pair-timer-ready"><p>The timer starts when the tiles appear.</p><button className="start-btn" onClick={() => setStarted(performance.now())}>Start Timer</button></div> : <>
      <div className="order-big-timer" aria-label="Puzzle time">{(elapsed / 1000).toFixed(1)}<small>s</small></div>
      <div className="order-tiles">{tiles.map((id, index) => {
        const tile = round.tiles.find(item => item.id === id)!;
        const state = feedback[index];
        return <button key={id} disabled={solved} aria-pressed={selected === index} className={`${selected === index ? 'selected-tile' : ''} ${options.challenge !== 'hard' || solved ? state === 'correct' ? 'order-correct' : state ? 'order-wrong' : '' : ''}`} onClick={() => {
          if (selected === null) setSelected(index);
          else { const next = [...tiles]; [next[selected], next[index]] = [next[index], next[selected]]; setTiles(next); setSelected(null); setFeedback([]); }
        }}><span>{tile.title}</span>{solved && <small className="order-year">{tile.year}</small>}{state && (options.challenge !== 'hard' || solved) && <small className="order-position-feedback">{state === 'correct' ? '✓ Correct position' : rules.hints ? state === 'left' ? '← Move left' : 'Move right →' : 'Wrong position'}</small>}</button>;
      })}</div>
      {!solved && <button className="start-btn check-button" onClick={check}>Check order</button>}
      {feedback.length > 0 && <p className="order-feedback" role="status">{solved ? `Solved in ${(elapsed / 1000).toFixed(1)} seconds! ${attempts} ${attempts === 1 ? 'check' : 'checks'}.` : `${feedback.filter(value => value === 'correct').length}/${tiles.length} correct positions. Keep going!${rules.penalty ? ' +1 second.' : ''}`}</p>}
      {solved && <>{resultMessage && <p className="order-result">{resultMessage}</p>}<div className="feedback-actions"><button className="back-btn" onClick={onRestart}>Rewind</button><button className="start-btn" onClick={onNext}>{nextLabel}</button></div></>}
    </>}
    <section className="order-leaderboard"><h3>Game Order Top 10</h3><p>{options.tiles} tiles · {rules.label} · fastest times</p>{scores.length ? <ol>{scores.map(score => <li key={score.id}><span>{score.player} · {score.attempts} checks</span><strong>{(score.elapsedMs / 1000).toFixed(1)}s</strong></li>)}</ol> : <p>No times yet. Set the first!</p>}</section>
  </div>;
}
