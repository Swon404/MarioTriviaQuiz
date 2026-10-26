import { getPairTimes, pairTimeKey, type PairTime } from './mario/pairTimes.ts';
import { ICON_PAIRS } from './mario/pairCatalog.ts';
import ReplayViewer from './ReplayViewer.tsx';
import { useState } from 'react';
import ScoreCleanup from './ScoreCleanup.tsx';

export function PairTimeList({ records, currentId }: { records: PairTime[]; currentId?: string }) {
  return records.length ? <ol>{records.map(item => <li key={item.id} className={item.id === currentId ? 'current-time' : undefined}><span>{item.player}{item.target && <small>{ICON_PAIRS.find(pair => pair.id === item.target)?.name ?? item.target}</small>}{item.id === currentId && <small>This run</small>}</span><strong>{(item.elapsedMs / 1000).toFixed(1)}s</strong><ReplayViewer replay={item.replay} /></li>)}</ol> : <p>No times yet for these settings.</p>;
}
export default function PairLeaderboards() {
  const [, refresh] = useState(0);
  const records = getPairTimes();
  return <section><h3>Match &amp; Hunt · fastest times</h3><p>Human first attempts only. Different targets share a table when the board size, number to find and unlock setting match. Each player can have more than one time.</p>
    {!records.length && <p>No timed matching records yet.</p>}
    <p>Replay is available for newly recorded rounds; older times have no recording.</p>
    <ScoreCleanup kind="pairs" onChange={() => refresh(value => value + 1)} />
    {[...new Set(records.map(pairTimeKey))].map(key => {
      const group = records.filter(item => pairTimeKey(item) === key).sort((a, b) => a.elapsedMs - b.elapsedMs || a.moves - b.moves);
      const first = group[0];
      return <section className="order-leaderboard" key={key}><h4>{first.variant === 'hunt' ? 'Hunt' : 'Time Trial'} · {first.pairs} pairs</h4><p>{first.target ? `All targets · unlock after ${first.unlockPairs} pairs` : `Find ${first.goal} pairs`} · {first.ruleset}</p><PairTimeList records={group.slice(0, 5)} /></section>;
    })}
  </section>;
}
