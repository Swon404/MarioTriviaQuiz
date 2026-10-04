import { getOrderTimes, ORDER_RULES, type OrderTime } from './mario/gameOrder.ts';
import ReplayViewer from './ReplayViewer.tsx';
import { useState } from 'react';
import ScoreCleanup from './ScoreCleanup.tsx';

export default function OrderLeaderboards() {
  const [, refresh] = useState(0);
  const records = getOrderTimes();
  const keyFor = (item: OrderTime) => [item.ruleset ?? 'legacy', item.difficulty, item.challenge, item.tiles].join('/');
  return <section><h3>Game Order · fastest times</h3><p>Tables separate level, challenge, tile count and ruleset. Legacy times used the smaller title pool and may include restarts.</p>
    {!records.length && <p>No Game Order times yet.</p>}
    <p>Replay is available for newly recorded rounds; older times have no recording.</p>
    <ScoreCleanup kind="order" onChange={() => refresh(value => value + 1)} />
    {[...new Set(records.map(keyFor))].map(key => {
      const group = records.filter(item => keyFor(item) === key).sort((a, b) => a.elapsedMs - b.elapsedMs || a.attempts - b.attempts);
      const first = group[0];
      return <section className="order-leaderboard" key={key}><h4>{({ explorer: 'Rookie', scientist: 'Pro', professor: 'Legend' })[first.difficulty]} · {ORDER_RULES[first.challenge].label} · {first.tiles} tiles · {first.ruleset ?? 'Legacy'}</h4><ol>{group.slice(0, 10).map(item => <li key={item.id}><span>{item.player} · {item.attempts} checks</span><strong>{(item.elapsedMs / 1000).toFixed(1)}s</strong><ReplayViewer replay={item.replay} /></li>)}</ol></section>;
    })}
  </section>;
}
