import { getPairTimes, pairTimeKey, type PairTime } from './mario/pairTimes.ts';
import { ICON_PAIRS } from './mario/pairCatalog.ts';
import ReplayViewer from './ReplayViewer.tsx';
import { useState } from 'react';
import ScoreCleanup from './ScoreCleanup.tsx';

export function PairTimeList({ records }: { records: PairTime[] }) {
  return records.length ? <ol>{records.map(item => <li key={item.id}><span>{item.player} · {item.moves} moves</span><strong>{(item.elapsedMs / 1000).toFixed(1)}s</strong><ReplayViewer replay={item.replay} /></li>)}</ol> : <p>No times yet for these settings.</p>;
}
export default function PairLeaderboards() {
  const [, refresh] = useState(0);
  const records = getPairTimes();
  return <section><h3>Match &amp; Hunt · fastest times</h3><p>Human first attempts only. Each board size, target and unlock setting has its own table.</p>
    {!records.length && <p>No timed matching records yet.</p>}
    <p>Replay is available for newly recorded rounds; older times have no recording.</p>
    <ScoreCleanup kind="pairs" onChange={() => refresh(value => value + 1)} />
    {[...new Set(records.map(pairTimeKey))].map(key => {
      const group = records.filter(item => pairTimeKey(item) === key).sort((a, b) => a.elapsedMs - b.elapsedMs || a.moves - b.moves);
      const first = group[0];
      const target = ICON_PAIRS.find(pair => pair.id === first.target)?.name ?? first.target;
      return <section className="order-leaderboard" key={key}><h4>{({ explorer: 'Rookie', scientist: 'Pro', professor: 'Legend' })[first.difficulty]} · {first.variant === 'hunt' ? 'Hunt' : 'Time Trial'} · {first.pairs} pairs</h4><p>{target ? `Target: ${target} · unlock after ${first.unlockPairs} pairs` : `Find ${first.goal} pairs`} · {first.ruleset}</p><PairTimeList records={group.slice(0, 10)} /></section>;
    })}
  </section>;
}
