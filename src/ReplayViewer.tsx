import { OrderTiles, PairCards, HuntTarget } from './GameBoards.tsx';
import { createPortal } from 'react-dom';
import { memo, useEffect, useLayoutEffect, useState, useRef, type CSSProperties } from 'react';
import { validReplay, type BoardReplay } from './mario/replay.ts';

function ReplayViewer({ replay }: { replay: BoardReplay | undefined }) {
  const [position, setPosition] = useState(0);
  const [clockMs, setClockMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [opened, setOpened] = useState(false);
  const [surfaceStyle, setSurfaceStyle] = useState<CSSProperties>({});
  const [host, setHost] = useState<HTMLElement | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const valid = validReplay(replay);
  useLayoutEffect(() => {
    if (opened && dialog.current) {
      // Classic scrollbars consume layout width in some WebKit environments.
      // Preserve the live board's content width, within the viewport limit.
      dialog.current.style.width = `${surfaceStyle.width}px`;
      dialog.current.showModal();
      const gutter = dialog.current.offsetWidth - dialog.current.clientWidth;
      if (gutter > 0) dialog.current.style.width = `${Number(surfaceStyle.width) + gutter}px`;
      dialog.current.scrollTop = 0;
    }
  }, [opened, surfaceStyle]);
  useEffect(() => {
    if (!valid || !opened || !playing) return;
    if (position >= replay.frames.length - 1) {
      setClockMs(replay.frames[position].atMs);
      setPlaying(false);
      return;
    }
    const from = replay.frames[position].atMs;
    const to = replay.frames[position + 1].atMs;
    // Keep very rapid selections visible, but never invent extra recorded time.
    const delay = Math.max(80, to - from);
    const started = performance.now();
    const ticker = window.setInterval(() => {
      setClockMs(from + (to - from) * Math.min(1, (performance.now() - started) / delay));
    }, 20);
    const timer = window.setTimeout(() => {
      setClockMs(to);
      setPosition(value => value + 1);
    }, delay);
    return () => { window.clearInterval(ticker); window.clearTimeout(timer); };
  }, [replay, valid, opened, playing, position]);
  const close = () => {
    dialog.current?.close();
    setPlaying(false);
    setOpened(false);
  };
  if (!valid) return null;
  const frame = replay.frames[position];
  const ended = position === replay.frames.length - 1;
  return <div className="board-replay">
    <button className="back-btn" onClick={event => {
      const game = event.currentTarget.closest<HTMLElement>('.mario-game');
      const app = event.currentTarget.closest<HTMLElement>('.mario-app')!;
      const style = getComputedStyle(game ?? app);
      const width = game ? game.getBoundingClientRect().width : app.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      setSurfaceStyle({ width, padding: game ? style.padding : undefined });
      setHost(app);
      setPosition(0); setClockMs(replay.frames[0].atMs); setPlaying(false); setOpened(true);
    }}>▶ Replay</button>
    {host && createPortal(<dialog ref={dialog} style={surfaceStyle} className="replay-stage mario-game quiz-panel" aria-label={replay.title} onCancel={close} onClose={() => { setPlaying(false); setOpened(false); }}>
    {opened && <>
    <div className="game-topbar"><button className="back-btn" onClick={close}>← Back</button><span>Replay</span></div>
    <h1>{replay.title}</h1>
    <HuntTarget name={replay.target} unlockPairs={replay.targetUnlockPairs} matchedPairs={frame.tiles.filter(tile => tile.state === 'matched').length / 2} />
    <div className="order-big-timer" role="timer" aria-label="Replay time">{(clockMs / 1000).toFixed(1)}<small>s</small></div>
    <p aria-live="polite">{(frame.atMs / 1000).toFixed(1)}s · {frame.event} {ended && '· Replay finished'}</p>
    {replay.kind === 'order'
      ? <div className="order-challenge"><OrderTiles tiles={frame.tiles} disabled replay /></div>
      : <PairCards tiles={frame.tiles} disabled replay />}
    <div className="replay-controls">
      <button className="start-btn" disabled={playing && !ended} onClick={() => { setPosition(0); setClockMs(replay.frames[0].atMs); setPlaying(true); }}>Start replay</button>
      <button className="back-btn" disabled={!playing || ended} onClick={() => setPlaying(false)}>Stop replay</button>
    </div>
    </>}
    </dialog>, host)}
  </div>;
}
export default memo(ReplayViewer);
