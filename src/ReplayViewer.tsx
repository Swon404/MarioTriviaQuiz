import { memo, useEffect, useState, useRef } from 'react';
import { validReplay, type BoardReplay } from './mario/replay.ts';

function ReplayViewer({ replay }: { replay: BoardReplay | undefined }) {
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [opened, setOpened] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const valid = validReplay(replay);
  useEffect(() => {
    if (!valid || !playing || position >= replay.frames.length - 1) return;
    const delay = Math.max(80, replay.frames[position + 1].atMs - replay.frames[position].atMs);
    const timer = window.setTimeout(() => setPosition(value => value + 1), delay);
    return () => window.clearTimeout(timer);
  }, [replay, valid, playing, position]);
  if (!valid) return null;
  const frame = replay.frames[position];
  const ended = position === replay.frames.length - 1;
  return <div className="board-replay">
    <button className="back-btn" onClick={() => { setPosition(0); setPlaying(false); setOpened(true); dialog.current?.showModal(); }}>▶ Replay</button>
    <dialog ref={dialog} className="replay-stage" aria-label={replay.title} onClose={() => { setPlaying(false); setOpened(false); }}>
    {opened && <>
    <button className="back-btn" onClick={() => dialog.current?.close()}>← Back</button>
    <h4>{replay.title}</h4>
    {replay.target && <p><strong>Hunt target:</strong> {replay.target}</p>}
    <div className="order-big-timer">{(frame.atMs / 1000).toFixed(1)}<small>s</small></div>
    <p aria-live="polite">{(frame.atMs / 1000).toFixed(1)}s · {frame.event} {ended && '· Replay finished'}</p>
    <div className={`${replay.kind === 'order' ? 'order-tiles' : 'pair-card-grid'} replay-${replay.kind}`}>{frame.tiles.map(tile => <button disabled key={tile.id} className={`replay-tile replay-${tile.state} ${replay.kind === 'pairs' ? 'pair-card' : ''} ${tile.state === 'selected' ? 'selected-tile' : tile.state === 'correct' ? 'order-correct' : tile.state === 'wrong' ? 'order-wrong' : tile.state === 'matched' ? 'pair-card-found' : ''}`}>
      {tile.state === 'hidden' ? '?' : tile.image ? <img src={`${import.meta.env.BASE_URL}${tile.image}`} alt={tile.label} /> : tile.label}
      {tile.state !== 'hidden' && tile.detail && <small>{tile.detail}</small>}
      {tile.state === 'selected' && <small>Selected</small>}
      {tile.state === 'matched' && <small>✓ Matched</small>}
    </button>)}</div>
    <div className="replay-controls">
      <button className="start-btn" disabled={playing && !ended} onClick={() => { setPosition(0); setPlaying(true); }}>Start replay</button>
      <button className="back-btn" disabled={!playing || ended} onClick={() => setPlaying(false)}>Stop replay</button>
    </div>
    </>}
    </dialog>
  </div>;
}
export default memo(ReplayViewer);
