import { memo, useEffect, useState } from 'react';
import { validReplay, type BoardReplay } from './mario/replay.ts';

function ReplayViewer({ replay }: { replay: BoardReplay | undefined }) {
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
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
  return <details className="board-replay" onToggle={event => { if (!event.currentTarget.open) setPlaying(false); }}>
    <summary>▶ Replay</summary>
    <h4>{replay.title}</h4>
    {replay.target && <p><strong>Hunt target:</strong> {replay.target}</p>}
    <p aria-live="polite">{(frame.atMs / 1000).toFixed(1)}s · {frame.event} {ended && '· Replay finished'}</p>
    <div className={`replay-grid replay-${replay.kind}`}>{frame.tiles.map(tile => <div key={tile.id} className={`replay-tile replay-${tile.state}`}>
      {tile.state === 'hidden' ? '?' : tile.image ? <img src={`${import.meta.env.BASE_URL}${tile.image}`} alt={tile.label} /> : tile.label}
      {tile.state !== 'hidden' && tile.detail && <small>{tile.detail}</small>}
      {tile.state === 'selected' && <small>Selected</small>}
      {tile.state === 'matched' && <small>✓ Matched</small>}
    </div>)}</div>
    <div className="replay-controls">
      <button className="back-btn" disabled={position === 0} onClick={() => { setPlaying(false); setPosition(value => value - 1); }}>Previous event</button>
      <button className="back-btn" disabled={ended} onClick={() => setPlaying(value => !value)}>{playing && !ended ? 'Pause replay' : 'Play replay'}</button>
      <button className="back-btn" disabled={ended} onClick={() => { setPlaying(false); setPosition(value => value + 1); }}>Next event</button>
      <button className="back-btn" onClick={() => { setPlaying(false); setPosition(0); }}>Restart replay</button>
    </div>
  </details>;
}
export default memo(ReplayViewer);
