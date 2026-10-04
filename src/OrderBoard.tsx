import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReplayFrame, ReplayTile } from './mario/replay.ts';
import ReplayViewer from './ReplayViewer.tsx';
import type { OrderRound } from './mario/rounds.ts';
import type { Difficulty } from './mario/questions.ts';
import { ORDER_RULES, orderLeaderboard, saveOrderTime, isOrderPractice, markOrderPractice, type OrderOptions } from './mario/gameOrder.ts';

export type OrderCheckpoint = { resultId: string; tiles: string[]; selected: number | null; started: number | null; elapsed: number; penalty: number; attempts: number; feedback: string[]; solved: boolean; recordMessage: string; frames: ReplayFrame[]; practice: boolean };

export default function OrderBoard({ round, difficulty, options, player, resultId, onSolved, onNext, onRestart, nextLabel, resultMessage, initialCheckpoint, onCheckpoint }: {
  round: OrderRound; difficulty: Difficulty; options: OrderOptions; player: string; resultId: string; onSolved: (elapsedMs: number) => void;
  onNext: () => void; onRestart: () => void; nextLabel: string; resultMessage?: string;
  initialCheckpoint?: OrderCheckpoint | null; onCheckpoint?: (value: OrderCheckpoint) => void;
}) {
  const initial = initialCheckpoint?.resultId === resultId ? initialCheckpoint : null;
  const [tiles, setTiles] = useState(initial?.tiles ?? round.tiles.map(tile => tile.id));
  const [selected, setSelected] = useState<number | null>(initial?.selected ?? null);
  const [started, setStarted] = useState<number | null>(initial?.started ?? null);
  const [elapsed, setElapsed] = useState(initial?.started && !initial.solved ? Math.max(0, Date.now() - initial.started + initial.penalty) : initial?.elapsed ?? 0);
  const [penalty, setPenalty] = useState(initial?.penalty ?? 0);
  const [attempts, setAttempts] = useState(initial?.attempts ?? 0);
  const [feedback, setFeedback] = useState<string[]>(initial?.feedback ?? []);
  const [solved, setSolved] = useState(initial?.solved ?? false);
  const [recordMessage, setRecordMessage] = useState(initial?.recordMessage ?? '');
  const frames = useRef<ReplayFrame[]>(initial?.frames ?? []);
  useEffect(() => {
    onCheckpoint?.({ resultId, tiles, selected, started, elapsed: solved ? elapsed : 0, penalty, attempts, feedback, solved, recordMessage, frames: frames.current, practice: isOrderPractice(resultId) });
  }, [resultId, tiles, selected, started, penalty, attempts, feedback, solved, recordMessage, onCheckpoint]);
  const recordFrame = (event: string, ids: string[], selection: number | null, positions: string[] = [], atMs?: number) => {
    if (frames.current.length >= 2000) return;
    const finished = positions.length > 0 && positions.every(value => value === 'correct');
    frames.current.push({ atMs: Math.max(0, Math.round(atMs ?? (started === null ? 0 : Date.now() - started + penalty))), event,
      tiles: ids.map((id, index): ReplayTile => {
        const tile = round.tiles.find(item => item.id === id)!;
        const shown = options.challenge !== 'hard' || finished;
        const state = selection === index ? 'selected' : shown && positions[index] ? positions[index] === 'correct' ? 'correct' : 'wrong' : 'shown';
        return { id, label: tile.title, state, detail: finished ? String(tile.year) : positions[index] && shown ? positions[index] === 'correct' ? '✓ Correct position' : rules.hints ? positions[index] === 'left' ? '← Move earlier' : 'Move later →' : 'Wrong position' : undefined };
      }) });
  };
  const rules = ORDER_RULES[options.challenge];
  useEffect(() => {
    if (started === null || solved) return;
    const timer = window.setInterval(() => setElapsed(Date.now() - started + penalty), 50);
    return () => clearInterval(timer);
  }, [started, solved, penalty]);
  const check = () => {
    if (started === null || solved) return;
    const positions = tiles.map((id, index) => round.correctIds.indexOf(id) === index ? 'correct' : round.correctIds.indexOf(id) < index ? 'left' : 'right');
    setFeedback(positions);
    setSelected(null);
    const tries = attempts + 1;
    setAttempts(tries);
    recordFrame(`Check ${tries}: ${positions.filter(value => value === 'correct').length}/${tiles.length} correct`, tiles, null, positions);
    if (positions.every(value => value === 'correct')) {
      const time = Math.max(1, Math.round(Date.now() - started + penalty));
      setElapsed(time);
      setSolved(true);
      const saved = saveOrderTime({ id: resultId, player, difficulty, ...options, elapsedMs: time, attempts: tries, completedAt: new Date().toISOString(), replay: frames.current.length < 2000 ? { version: 1, kind: 'order', title: `${player} · Game Order`, frames: frames.current } : undefined });
      setRecordMessage(isOrderPractice(resultId) ? 'Practice complete — restarted boards do not enter the leaderboard.' : saved ? 'Time saved to the leaderboard!' : 'Time could not be saved on this device.');
      onSolved(time);
    } else setPenalty(value => value + rules.penalty);
  };
  const scores = useMemo(() => orderLeaderboard(difficulty, options), [difficulty, options.challenge, options.tiles, solved]);
  return <div className="order-challenge">
    <p className="help-copy">Oldest to newest, reading left to right and then the next row. Tap two tiles to swap them. Keep trying until solved; your time is the challenge.</p>
    <p className="help-copy">Years follow Nintendo’s US Mario history timeline, not each game’s earliest worldwide release. Every puzzle uses different years.</p>
    {isOrderPractice(resultId) && <p className="review-note">Practice board — your original time stays on the leaderboard.</p>}
    {started === null ? <div className="pair-timer-ready"><p>The timer starts when the tiles appear.</p><button className="start-btn" onClick={() => { frames.current = []; recordFrame('Timer started', tiles, null, [], 0); setStarted(Date.now()); }}>Start Timer</button></div> : <>
      <div className="order-big-timer" aria-label="Puzzle time">{(elapsed / 1000).toFixed(1)}<small>s</small></div>
      <div className="order-tiles">{tiles.map((id, index) => {
        const tile = round.tiles.find(item => item.id === id)!;
        const state = feedback[index];
        return <button key={id} disabled={solved} aria-pressed={selected === index} className={`${selected === index ? 'selected-tile' : ''} ${options.challenge !== 'hard' || solved ? state === 'correct' ? 'order-correct' : state ? 'order-wrong' : '' : ''}`} onClick={() => {
          if (selected === null) { recordFrame('Tile selected', tiles, index, feedback); setSelected(index); }
          else { const next = [...tiles]; [next[selected], next[index]] = [next[index], next[selected]]; recordFrame(selected === index ? 'Selection cleared' : 'Tiles swapped', next, null); setTiles(next); setSelected(null); setFeedback([]); }
        }}><span>{tile.title}</span>{solved && <small className="order-year">{tile.year}</small>}{state && (options.challenge !== 'hard' || solved) && <small className="order-position-feedback">{state === 'correct' ? '✓ Correct position' : rules.hints ? state === 'left' ? '← Move earlier' : 'Move later →' : 'Wrong position'}</small>}</button>;
      })}</div>
      {!solved && <button className="start-btn check-button" onClick={check}>Check order</button>}
      {feedback.length > 0 && <p className="order-feedback" role="status">{solved ? `Solved in ${(elapsed / 1000).toFixed(1)} seconds! ${attempts} ${attempts === 1 ? 'check' : 'checks'}.` : `${feedback.filter(value => value === 'correct').length}/${tiles.length} correct positions. Keep going!${rules.penalty ? ' +1 second.' : ''}`}</p>}
      {solved && <>{resultMessage && <p className="order-result">{resultMessage}</p>}<p role="status">{recordMessage}</p><div className="feedback-actions"><button className="back-btn" onClick={() => { markOrderPractice(resultId); onRestart(); }}>Rewind</button><button className="start-btn" onClick={onNext}>{nextLabel}</button></div></>}
    </>}
    <section className="order-leaderboard"><h3>Game Order Top 10</h3><p>{options.tiles} tiles · {rules.label} · fastest times</p>{scores.length ? <ol>{scores.map(score => <li key={score.id}><span>{score.player} · {score.attempts} checks</span><strong>{(score.elapsedMs / 1000).toFixed(1)}s</strong><ReplayViewer replay={score.replay} /></li>)}</ol> : <p>No times yet. Set the first!</p>}</section>
  </div>;
}
