import { useEffect, useState } from 'react';
import { onlineConfigured, onlineStatus, readOnlineReplay, readOnlineTimes, removeOnlineTimes, setSharing, syncOnlineScores, type OnlineKind, type OnlineTime } from './mario/onlineScores.ts';
import type { BoardReplay } from './mario/replay.ts';
import ReplayViewer from './ReplayViewer.tsx';

function OnlineReplay({ id }: { id: string }) {
  const [replay, setReplay] = useState<BoardReplay>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return replay ? <ReplayViewer replay={replay} /> : <span><button className="back-btn" disabled={busy} onClick={async () => {
    setBusy(true); setError('');
    try { setReplay(await readOnlineReplay(id)); } catch { setError('Replay unavailable. Try again.'); } finally { setBusy(false); }
  }}>{busy ? 'Loading…' : 'Load replay'}</button>{error && <small role="status">{error}</small>}</span>;
}
export default function OnlineLeaderboard() {
  const [status, setStatus] = useState(onlineStatus);
  const [kind, setKind] = useState<OnlineKind>('trial');
  const [pairs, setPairs] = useState(12);
  const [goal, setGoal] = useState(5);
  const [tiles, setTiles] = useState(4);
  const [challenge, setChallenge] = useState('easy');
  const [rows, setRows] = useState<OnlineTime[]>([]);
  const [state, setState] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [removing, setRemoving] = useState(false);
  useEffect(() => {
    const update = () => setStatus(onlineStatus());
    window.addEventListener('online-scores', update); window.addEventListener('storage', update);
    return () => { window.removeEventListener('online-scores', update); window.removeEventListener('storage', update); };
  }, []);
  useEffect(() => {
    if (!onlineConfigured) return;
    let active = true;
    setRows([]); setState('Loading online times…');
    const config = kind === 'trial' ? ['pairs-v1', 'time-trial', pairs, goal, false, 0] : ['order-v3', null, challenge, tiles];
    void readOnlineTimes(kind, config).then(result => { if (active) { setRows(result); setState(result.length ? '' : 'No online times for these settings yet.'); } })
      .catch(() => { if (active) setState('Online leaderboard unavailable. Your local scores below still work.'); });
    return () => { active = false; };
  }, [kind, pairs, goal, tiles, challenge, refresh]);
  return <section className="order-leaderboard online-leaderboard" aria-label="Community Top 5">
    <h3>Community Top 5 · everyone</h3>
    <p>Shared across devices. Community-submitted times, not independently verified.</p>
    {!onlineConfigured ? <p>Online setup is not connected yet. Local scores are unchanged.</p> : <>
      <label>Online game <select value={kind} onChange={event => setKind(event.target.value as OnlineKind)}><option value="trial">Time Trial</option><option value="order">Game Order</option></select></label>
      {kind === 'trial' ? <><label>Board pairs <select value={pairs} onChange={event => { const value = Number(event.target.value); setPairs(value); setGoal(goal === pairs ? value : Math.min(goal, value)); }}>{[9, 12, 15, 16, 20].map(n => <option key={n}>{n}</option>)}</select></label><label>Pairs to find <select value={goal} onChange={event => setGoal(Number(event.target.value))}>{[...new Set([3, 4, 5, 8, pairs])].map(n => <option key={n} value={n}>{n === pairs ? `All ${n}` : n}</option>)}</select></label></> : <><label>Order challenge <select value={challenge} onChange={event => setChallenge(event.target.value)}>{['easy', 'medium', 'hard'].map(value => <option key={value} value={value}>{value}</option>)}</select></label><label>Order tiles <select value={tiles} onChange={event => setTiles(Number(event.target.value))}>{[4, 6, 8].map(n => <option key={n}>{n}</option>)}</select></label></>}
      <button className="back-btn" onClick={() => setRefresh(value => value + 1)}>Refresh online times</button>
      <p role="status">{state}</p>
      <ol>{rows.map(row => <li key={row.id}><span>{row.nickname}</span><strong>{(row.elapsed_ms / 1000).toFixed(1)}s</strong>{row.has_replay && <OnlineReplay key={row.id} id={row.id} />}</li>)}</ol>
      <details><summary>Share my new times</summary>
        <p>Optional: publish future eligible Time Trial and Game Order times and replays. Each local player gets a random Racer alias; your player names stay on this device. Existing scores are not uploaded.</p>
        <label><input type="checkbox" checked={status.enabled} disabled={removing} onChange={event => setSharing(event.target.checked)} /> Share new times publicly</label>
        <p role="status">{status.pending} queued. {status.message}</p>
        {status.aliases.length > 0 && <p>Your public aliases: {status.aliases.join(', ')}</p>}
        <button className="back-btn" disabled={!status.enabled || removing} onClick={() => void syncOnlineScores()}>Retry uploads</button>
        <button className="back-btn" disabled={removing} onClick={async () => {
          if (!window.confirm('Remove all online times uploaded by this browser? Local scores will stay.')) return;
          setRemoving(true);
          try { await removeOnlineTimes(); setRefresh(value => value + 1); } catch { setState('Could not remove online times. Retry while connected.'); } finally { setRemoving(false); }
        }}>{removing ? 'Removing…' : 'Remove this browser’s online times'}</button>
        <p>This is not a progress backup or account sync. Clearing browser data loses this upload identity; contact the game owner to remove older public entries.</p>
      </details>
    </>}
  </section>;
}
