import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ReplayFrame } from './mario/replay.ts';
import { OrderTiles, orderTilesFor } from './GameBoards.tsx';
import ReplayViewer from './ReplayViewer.tsx';
import TimerCountdown from './TimerCountdown.tsx';
import GameHelp from './GameHelp.tsx';
import type { OrderRound } from './mario/rounds.ts';
import type { Difficulty } from './mario/questions.ts';
import { ORDER_RULES, orderLeaderboard, saveOrderTime, isOrderPractice, markOrderPractice, type OrderOptions } from './mario/gameOrder.ts';

export type OrderCheckpoint = { resultId: string; tiles: string[]; selected: number | null; started: number | null; elapsed: number; penalty: number; attempts: number; feedback: string[]; solved: boolean; recordMessage: string; frames: ReplayFrame[]; practice: boolean };

export default function OrderBoard({ round, difficulty, options, player, resultId, onSolved, onNext, onRestart, nextLabel, resultMessage, initialCheckpoint, onCheckpoint, firstRound, computer = false }: {
  round: OrderRound; difficulty: Difficulty; options: OrderOptions; player: string; resultId: string; onSolved: (elapsedMs: number) => void;
  onNext: () => void; onRestart: () => void; nextLabel: string; resultMessage?: string;
  computer?: boolean; firstRound?: boolean; initialCheckpoint?: OrderCheckpoint | null; onCheckpoint?: (value: OrderCheckpoint) => void;
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
  useLayoutEffect(() => {
    onCheckpoint?.({ resultId, tiles, selected, started, elapsed: solved ? elapsed : 0, penalty, attempts, feedback, solved, recordMessage, frames: frames.current, practice: isOrderPractice(resultId) });
  }, [resultId, tiles, selected, started, penalty, attempts, feedback, solved, recordMessage, onCheckpoint]);
  const recordFrame = (event: string, ids: string[], selection: number | null, positions: string[] = [], atMs?: number) => {
    if (frames.current.length >= 2000) return;
    frames.current.push({ atMs: Math.max(0, Math.round(atMs ?? (started === null ? 0 : Date.now() - started + penalty))), event,
      tiles: orderTilesFor(round, ids, selection, positions, rules.hints, options.challenge === 'hard') });
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
      const saved = !computer && saveOrderTime({ id: resultId, player, difficulty, ...options, elapsedMs: time, attempts: tries, completedAt: new Date().toISOString(), replay: frames.current.length < 2000 ? { version: 1, kind: 'order', title: `${player} · Game Order`, frames: frames.current } : undefined });
      setRecordMessage(computer ? '' : isOrderPractice(resultId) ? 'Practice complete — restarted boards do not enter the leaderboard.' : saved ? '' : 'Time could not be saved on this device.');
      onSolved(time);
    } else setPenalty(value => value + rules.penalty);
  };
  useEffect(() => {
    if (!computer || started === null || solved) return;
    const timer = window.setTimeout(() => {
      const index = tiles.findIndex((id, position) => id !== round.correctIds[position]);
      if (index < 0) { check(); return; }
      if (selected === null) {
        recordFrame('Tile selected', tiles, index);
        setSelected(index);
      } else {
        const next = [...tiles];
        const other = next.indexOf(round.correctIds[selected]);
        [next[selected], next[other]] = [next[other], next[selected]];
        recordFrame('Tiles swapped', next, null);
        setTiles(next); setSelected(null); setFeedback([]);
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [computer, started, solved, tiles, selected]);
  const scores = useMemo(() => orderLeaderboard(difficulty, options), [difficulty, options.challenge, options.tiles, solved]);
  return <div className="order-challenge">
    <GameHelp first={!!firstRound && started === null} hint="Oldest → newest. Tap two tiles to swap.">
      Read left to right, then the next row. Keep checking until solved; fastest time wins.
      Years follow Nintendo’s US release timeline. Every puzzle uses different years.
    </GameHelp>
    {isOrderPractice(resultId) && <p className="review-note">Practice board — your original time stays on the leaderboard.</p>}
    {started === null && <p className="help-copy">Ready? The tiles appear on Go!</p>}
    <TimerCountdown autoStart={computer} ready={started === null} onGo={() => { frames.current = []; recordFrame('Timer started', tiles, null, [], 0); setStarted(Date.now()); }} />
    {started !== null && <>
      <div className="order-big-timer" aria-label="Puzzle time">{(elapsed / 1000).toFixed(1)}<small>s</small></div>
      <OrderTiles tiles={orderTilesFor(round, tiles, selected, feedback, rules.hints, options.challenge === 'hard')} disabled={solved || computer} onChoose={index => {
        if (selected === null) { recordFrame('Tile selected', tiles, index, feedback); setSelected(index); }
        else { const next = [...tiles]; [next[selected], next[index]] = [next[index], next[selected]]; recordFrame(selected === index ? 'Selection cleared' : 'Tiles swapped', next, null); setTiles(next); setSelected(null); setFeedback([]); }
      }} />
      {!solved && !computer && <button className="start-btn check-button" onClick={check}>Check order</button>}
      {feedback.length > 0 && <p className="order-feedback" role="status">{solved ? `Solved in ${(elapsed / 1000).toFixed(1)} seconds! ${attempts} ${attempts === 1 ? 'check' : 'checks'}.` : `${feedback.filter(value => value === 'correct').length}/${tiles.length} correct positions. Keep going!${rules.penalty ? ' +1 second.' : ''}`}</p>}
      {solved && <>{resultMessage && !resultMessage.startsWith('Time recorded.') && <p className="order-result">{resultMessage}</p>}{recordMessage && <p role="status">{recordMessage}</p>}<div className="feedback-actions"><button className="back-btn" onClick={() => { markOrderPractice(resultId); onRestart(); }}>Rewind</button><button className="start-btn" onClick={onNext}>{nextLabel}</button></div></>}
    </>}
    <section className="order-leaderboard" aria-label="Game Order Top 5"><h3>Game Order Top 5</h3><p>{options.tiles} tiles · {rules.label}</p>{scores.length ? <ol>{scores.map(score => <li key={score.id}><span>{score.player}</span><strong>{(score.elapsedMs / 1000).toFixed(1)}s</strong><ReplayViewer replay={score.replay} /></li>)}</ol> : <p>No times yet. Set the first!</p>}</section>
  </div>;
}
