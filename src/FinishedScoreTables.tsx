import { groupedScores, rankingPoints, type FinishedScore } from './mario/scoreGroups.ts';

const levels = { explorer: 'Rookie', scientist: 'Pro', professor: 'Legend' };
const modes: Record<string, string> = { quiz: 'Quiz Battle', 'game-order': 'Game Order', 'pair-match': 'Match & Hunt', 'match-hunt': 'Clue Match Up', 'clue-duel': 'Clue Duel', 'track-finder': 'Track Finder', 'category-finder': 'Category Finder' };
const formats = { solo: 'Solo', 'two-player': 'Two players', computer: 'Play Shroomer' };
function description(result: FinishedScore): string {
  const game = 'games' in result ? `${result.size} · ${result.games.map(game => modes[game.mode]).join(' + ')}` : `${modes[result.mode ?? 'quiz']}${result.variant ? ` · ${result.variant === 'hunt' ? 'Hunt' : 'Time Trial'}` : ''} · ${result.total} rounds`;
  return `${game} · ${levels[result.difficulty]} · ${formats[result.format ?? 'solo']} · ${result.topic === 'mixed' ? 'A bit of both' : result.topic === 'kart' ? 'Mario Kart' : 'Mario games'}`;
}
export default function FinishedScoreTables({ records }: { records: FinishedScore[] }) {
  const groups = groupedScores(records);
  const legacy = records.filter(record => !record.scoringVersion || !record.scoreConfiguration).sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  const row = (result: FinishedScore, ranked: boolean) => <li key={result.id}>
    <span><strong>{result.opponent ? `${result.player} vs ${result.opponent}` : result.player}</strong>
      <small>{description(result)}</small>
      {ranked && result.format === 'two-player' && <small>Best score: {(result.points ?? 0) === result.opponentPoints ? 'Draw' : (result.opponentPoints ?? 0) > (result.points ?? 0) ? result.opponent : result.player} · {rankingPoints(result)} points</small>}
    </span>
    <strong>{result.points ?? ('correct' in result ? result.correct : 0)}{result.opponent ? `–${result.opponentPoints ?? ('opponentCorrect' in result ? result.opponentCorrect ?? 0 : 0)}` : ''} points</strong>
  </li>;
  return <>
    {groups.map(group => <section className="finished-score-group" key={group.key}>
      <h4>{description(group.records[0])} · Top 5</h4>
      <details><summary>Table rules</summary><p>{group.records[0].scoreConfiguration}. Scoring: {group.records[0].scoringVersion}. {group.records[0].format === 'two-player' ? 'Ranked by the higher human score; both players are shown.' : 'Ranked by the human player’s points.'} Equal points keep the earlier result first.</p></details>
      <ol className="score-list">{group.records.map(result => row(result, true))}</ol>
    </section>)}
    {!!legacy.length && <section className="legacy-score-history"><h4>Earlier scores · history</h4><p>Rules were not recorded. Kept unchanged, outside the new rankings.</p><ol className="score-list">{legacy.map(result => row(result, false))}</ol></section>}
  </>;
}
