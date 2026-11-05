import { useState } from 'react';
import { KART_TRACK, KART_EFFECTS, kartActive, rollKart, chooseKartRoute, safeKartMushroom, claimKartItem, nextKartTurn, type KartRace } from './mario/kartQuest.ts';
import './kartQuest.css';
import { kartHistory, saveKartHistory } from './mario/kartHistory.ts';
import { useEffect } from 'react';

export const KART_GAME_NAMES: Record<string, string> = { 'pair-match': 'Match & Hunt', 'game-order': 'Game Order', quiz: 'Quiz Battle', 'clue-duel': 'Clue Duel', 'track-finder': 'Track Finder', 'category-finder': 'Category Finder' };
const ROAD_PATH = 'M50 50H350Q375 50 375 100T350 150H50Q25 150 25 200T50 250H350Q375 250 375 300T350 350H50Q25 350 25 400T50 450H350Q375 450 375 500T350 550H50';

function KartToken({ player }: { player: number }) {
  return <svg className={`kart-token kart-token-${player}`} viewBox="0 0 48 56" aria-hidden="true"><rect x="3" y="12" width="9" height="15" rx="3" fill="#101827" /><rect x="36" y="12" width="9" height="15" rx="3" fill="#101827" /><rect x="3" y="35" width="9" height="15" rx="3" fill="#101827" /><rect x="36" y="35" width="9" height="15" rx="3" fill="#101827" /><path d="M15 4h18l5 14v31H10V18Z" fill="currentColor" stroke="white" strokeWidth="2" /><rect x="16" y="15" width="16" height="17" rx="6" fill="#18283f" /><circle cx="24" cy="24" r="6" fill="#ffe4b3" /><path d="M15 40h18M20 5v8h8V5" stroke="white" strokeWidth="4" /><text x="24" y="49" textAnchor="middle" fill="white" fontSize="10" fontWeight="900">{player + 1}</text></svg>;
}

export default function KartQuest({ race, names, onStart, onChange, onChallenge, onExit }: {
  race: KartRace | null; names: [string, string]; onStart: (names: [string, string]) => void;
  onChange: (change: (race: KartRace) => KartRace) => void; onChallenge: () => void; onExit: () => void;
}) {
  const [first, setFirst] = useState(names[0]);
  const [second, setSecond] = useState(names[1]);
  const [historyWarning, setHistoryWarning] = useState(false);
  const readHistory = () => { try { return kartHistory(); } catch { return null; } };
  const [history, setHistory] = useState(readHistory);
  useEffect(() => {
    if (race?.phase === 'finished') { setHistoryWarning(!saveKartHistory(race)); setHistory(readHistory()); }
  }, [race]);
  const historyPanel = <details><summary>Past races</summary>{history === null ? <p>Race history cannot be read on this device.</p> : history.length === 0 ? <p>Finish a race to start your history.</p> : <ol>{[...history].reverse().map(record => <li key={record.id}>{record.players[0]} {record.positions[0]} · {record.players[1]} {record.positions[1]} — {record.rolls} rolls each</li>)}</ol>}</details>;
  if (!race) return <section className="kart-quest">
    <button className="back-btn" onClick={onExit}>← Games</button>
    <p className="eyebrow">TWO PLAYERS · ONE PHONE</p><h1>🏎️ Kart Quest</h1>
    <p>Roll the die. Dodge bananas. Race through your favourite games!</p>
    <label className="field-label">Red kart name<input className="player-name-input" maxLength={24} value={first} onChange={e => setFirst(e.target.value)} /></label>
    <label className="field-label">Blue kart name<input className="player-name-input" maxLength={24} value={second} onChange={e => setSecond(e.target.value)} /></label>
    <p>Both play each challenge. Lots of Match & Hunt and Order, plus short quiz and clue games. Reach 24, then finish the pair of turns. Six rolls each at most.</p>
    <button className="start-btn" onClick={() => onStart([first, second])}>Start Kart Quest</button>
    {historyPanel}
  </section>;
  const active = kartActive(race);
  const effect = KART_EFFECTS[race.effect];
  const space = KART_TRACK[Math.max(0, race.space - 1)];
  const finished = race.phase === 'finished';
  const winning = race.positions[0] === race.positions[1] ? "It's a shared victory!" : `${race.players[race.positions[0] > race.positions[1] ? 0 : 1]} wins!`;
  return <section className="kart-quest">
    <header className="kart-header"><div><p className="kart-kicker">MUSHROOM MOTORWAY</p><h1>Kart Quest<span aria-hidden="true">🏁</span></h1></div><button className="back-btn" onClick={onExit}>← Games</button></header>
    {historyWarning && <p role="alert">This race could not be saved to history. Keep this tab open and try again when storage is available.</p>}
    <div className="kart-standings" aria-label="Race positions">{race.players.map((name, i) => <div key={i} className={`kart-driver kart-driver-${i} ${!finished && active === i ? 'kart-driver-active' : ''}`}><KartToken player={i} /><div className="kart-driver-info"><strong>{name}</strong><span><b>{race.positions[i]}</b><small> / 24 spaces</small></span><small>{race.items[i] === 'star' ? '⭐ Star shield' : race.items[i] === 'mushroom' ? '🍄 Mushroom boost' : 'Item slot empty'}</small></div>{!finished && active === i && <span className="kart-turn-light" aria-label="Current player" />}</div>)}</div>
    <div className="kart-turn-heading">{finished ? <h2 role="status">{winning}</h2> : <><h2>{race.players[active]}'s turn</h2><span>ROLL <b>{Math.floor(race.turn / 2) + 1}</b> / 6</span></>}</div>
    <p className="kart-message" role="status">{race.turn === 0 && race.phase === 'roll' ? 'Roll out! Race to 24. Both players get equal turns.' : race.message}</p>
    {race.phase === 'roll' && <div className="kart-actions">
      {race.turn % 2 === 1 && Math.max(...race.positions) >= 24 && <p>Final roll! Both players get equal turns.</p>}
      <button className="start-btn kart-roll" aria-label="🎲 Roll die" onClick={() => onChange(current => rollKart(current))}><span className="kart-die" aria-hidden="true">⚄</span><span>Roll die<small>Let’s hit the track</small></span><span className="kart-roll-arrow" aria-hidden="true">→</span></button>
      {race.items[active] === 'mushroom' && <button className="round-btn" onClick={() => onChange(current => rollKart(current, true))}>Use Mushroom: roll +2</button>}
    </div>}
    {race.phase === 'landed' && <div className="kart-destination">
      {!race.routeChosen ? <><h3>Choose your route</h3><p>Both routes play {KART_GAME_NAMES[space.mode]}.</p><button className="round-btn" onClick={() => onChange(current => chooseKartRoute(current, true))}>Open road: winner +2</button><button className="round-btn" onClick={() => onChange(current => chooseKartRoute(current, false))}>{effect.icon} {effect.name}: winner +3</button></> : <>
        <h3>{effect.icon} {effect.name}</h3><p>{effect.rule}</p><p><strong>{KART_GAME_NAMES[space.mode]}</strong> · One short round each · {race.players[active]} plays first.</p>
        {race.effect === 'mushroom' && <button className="round-btn" onClick={() => onChange(current => safeKartMushroom(current))}>Take safe +1</button>}
        <button className="start-btn" onClick={onChallenge}>{race.effect === 'mushroom' ? 'Race for +3' : 'Play challenge'}</button>
      </>}
    </div>}
    {race.phase === 'reward' && race.rewardPlayer !== null && <div className="kart-destination"><h3>{race.players[race.rewardPlayer]}, choose your item</h3><p>One item at a time. Choosing replaces your current item.</p><button className="round-btn" onClick={() => onChange(current => claimKartItem(current, 'mushroom'))}>🍄 Mushroom: next roll +2</button><button className="round-btn" onClick={() => onChange(current => claimKartItem(current, 'star'))}>⭐ Star: block one banana</button></div>}
    {race.phase === 'summary' && <button className="start-btn" onClick={() => onChange(nextKartTurn)}>{(race.turn + 1) % 2 === 0 && (Math.max(...race.positions) >= 24 || race.turn >= 11) ? 'See race result' : 'Next roll'}</button>}
    {finished && <><p>Final positions after {race.turn / 2} rolls each. Furthest wins; equal positions share the victory.</p><button className="start-btn" onClick={() => onStart(race.players)}>Race again</button></>}
    <div className="kart-course">
      <div className="kart-course-heading"><span>START <span aria-hidden="true">→</span></span><span>FOLLOW THE ROAD TO <b>24</b> 🏁</span></div>
      {race.positions.some(pos => pos === 0) && <div className="kart-start-grid" aria-label="Starting grid">{race.players.map((name, i) => race.positions[i] === 0 && <span key={i} aria-label={`${name} at the start`}><KartToken player={i} /><small>{name}</small></span>)}</div>}
      <div className="kart-road-board">
        <svg className="kart-road" viewBox="0 0 400 600" preserveAspectRatio="none" aria-hidden="true"><path d={ROAD_PATH} /><path d={ROAD_PATH} className="kart-road-surface" /><path d={ROAD_PATH} className="kart-road-line" /></svg>
        <ol className="kart-track" aria-label="Race track">{KART_TRACK.map((tile, index) => <li key={index} style={{ gridRow: Math.floor(index / 4) + 1, gridColumn: Math.floor(index / 4) % 2 === 0 ? index % 4 + 1 : 4 - index % 4 }} className={`kart-space kart-space-${tile.effect} ${race.space === index + 1 ? 'kart-landed' : ''} ${index === 23 ? 'kart-finish' : ''} ${race.positions.some(pos => Math.min(24, pos) === index + 1) ? 'kart-occupied' : ''}`} aria-label={`Space ${index + 1}: ${KART_EFFECTS[tile.effect].name}, ${KART_GAME_NAMES[tile.mode]}`}><span className="kart-space-number">{index + 1}</span><span className={`kart-space-icon ${tile.effect === 'box' ? 'kart-item-box' : ''}`} aria-hidden="true">{index === 23 ? '🏁' : tile.effect === 'box' ? '?' : tile.effect === 'pipe' ? <span className="kart-pipe" /> : tile.effect === 'road' ? Math.floor(index / 4) % 2 === 0 ? '→' : '←' : KART_EFFECTS[tile.effect].icon}</span><small>{tile.mode === 'pair-match' ? 'Match' : tile.mode === 'game-order' ? 'Order' : tile.mode === 'quiz' ? 'Quiz' : tile.mode === 'clue-duel' ? 'Clues' : 'Find'}</small>{tile.fork && <span className="kart-fork" aria-label="Route choice">⑂</span>}</li>)}</ol>
        <div className="kart-racer-layer">{race.players.map((name, player) => {
          if (race.positions[player] === 0) return null;
          const index = Math.min(24, race.positions[player]) - 1;
          const row = Math.floor(index / 4);
          const column = row % 2 === 0 ? index % 4 : 3 - index % 4;
          return <span key={player} className={`kart-road-racer kart-road-racer-${player} ${row % 2 ? 'kart-facing-left' : ''}`} style={{ left: `${(column + .5) * 25}%`, top: `${(row + .5) * 100 / 6}%` }} aria-label={`${name} on space ${race.positions[player]}`}><KartToken player={player} /><span className="kart-racer-name">{name}</span></span>;
        })}</div>
      </div>
      <div className="kart-course-legend"><span>🍌 Dodge</span><span>🟢 Shortcut</span><span>❓ Item</span><span>🏁 Race</span></div>
    </div>
    <details><summary>Track rules and items</summary><p>Roll 1–6. Bonus moves never trigger another space. No missed turns. A Star is used automatically when a banana would move you back. A Mushroom adds two to a roll when you choose to use it.</p>{Object.values(KART_EFFECTS).map(item => <p key={item.name}><strong>{item.icon} {item.name}:</strong> {item.rule}</p>)}</details>
    {race.log.length > 0 && <details><summary>Race recap</summary><ol>{race.log.map((line, i) => <li key={i}>{line}</li>)}</ol></details>}
    {historyPanel}
  </section>;
}
