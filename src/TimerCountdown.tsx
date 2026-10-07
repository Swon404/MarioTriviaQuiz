import { useEffect, useRef, useState } from 'react';
import './TimerCountdown.css';

/** Preparation only: callers reveal the board and start their stopwatch on Go. */
export default function TimerCountdown({ ready, onGo, label = 'Start Timer' }: {
  ready: boolean; onGo: () => void; label?: string;
}) {
  const [count, setCount] = useState<number | null>(null);
  const pending = useRef<number[]>([]);
  const callback = useRef(onGo);
  callback.current = onGo;
  const cancel = () => {
    pending.current.forEach(window.clearTimeout);
    pending.current = [];
  };
  useEffect(() => {
    if (ready) { cancel(); setCount(null); }
    return cancel;
  }, [ready]);
  useEffect(() => {
    if (count !== 0) return;
    const timeout = window.setTimeout(() => setCount(null), 750);
    return () => window.clearTimeout(timeout);
  }, [count]);
  const start = () => {
    if (pending.current.length || !ready) return;
    setCount(3);
    pending.current = [1, 2, 3].map(second => window.setTimeout(() => {
      setCount(3 - second);
      if (second === 3) callback.current();
    }, second * 1000));
  };
  return <>
    <div className={`timer-countdown${count === null ? ' timer-countdown-idle' : count === 0 ? ' timer-countdown-go' : ''}`} role="status" aria-live="assertive" aria-atomic="true">
      {count !== null && <><span className="timer-countdown-caption">{count ? 'Get ready!' : 'Timer started'}</span><strong>{count || 'Go!'}</strong></>}
    </div>
    {ready && (count === null
      ? <button className="start-btn" onClick={start}>{label}</button>
      : <button className="back-btn" onClick={() => { cancel(); setCount(null); }}>Cancel countdown</button>)}
  </>;
}
