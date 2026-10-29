import { getOrderTimes, ORDER_RULES, orderUsesSharedPool, orderTimeKey } from './mario/gameOrder.ts';
import ReplayViewer from './ReplayViewer.tsx';
import { useState } from 'react';
import ScoreCleanup from './ScoreCleanup.tsx';

export default function OrderLeaderboards() {
  const [, refresh] = useState(0);
  const records = getOrderTimes();
  const keyFor = orderTimeKey;
  return <section><h3>Game Order · fastest times</h3><p>Tables separate challenge, tile count and ruleset. Current times combine the old Rookie, Pro and Legend labels. Legacy times keep their levels because they used smaller title pools and may include restarts.</p>
    {!records.length && <p>No Game Order times yet.</p>}
    <p>Replay is available for newly recorded rounds; older times have no recording.</p>
    <ScoreCleanup kind="order" onChange={() => refresh(value => value + 1)} />
    {[...new Set(records.map(keyFor))].map(key => {
      const group = records.filter(item => keyFor(item) === key).sort((a, b) => a.elapsedMs - b.elapsedMs || a.attempts - b.attempts);
      const first = group[0];
      return <section className="order-leaderboard" key={key}><h4>{!orderUsesSharedPool(first.ruleset) ? `${({ explorer: 'Rookie', scientist: 'Pro', professor: 'Legend' })[first.difficulty]} · ` : ''}{ORDER_RULES[first.challenge].label} · {first.tiles} tiles · {first.ruleset ?? 'Legacy'}</h4><ol>{group.slice(0, 5).map(item => <li key={item.id}><span>{item.player}</span><strong>{(item.elapsedMs / 1000).toFixed(1)}s</strong><ReplayViewer replay={item.replay} /></li>)}</ol></section>;
    })}
  </section>;
}
