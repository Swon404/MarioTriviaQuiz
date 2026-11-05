import { useState } from 'react';
import { KART_TRACK, KART_EFFECTS, kartActive, rollKart, chooseKartRoute, safeKartMushroom, claimKartItem, nextKartTurn, type KartRace } from './mario/kartQuest.ts';
import './kartQuest.css';
import { kartHistory, saveKartHistory } from './mario/kartHistory.ts';
import { useEffect } from 'react';

export const KART_GAME_NAMES: Record<string, string> = { 'pair-match': 'Match & Hunt', 'game-order': 'Game Order', quiz: 'Quiz Battle', 'clue-duel': 'Clue Duel', 'track-finder': 'Track Finder', 'category-finder': 'Category Finder' };

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
    <button className="back-btn" onClick={onExit}>← Games</button>
    <h1>🏎️ Kart Quest</h1>
    {historyWarning && <p role="alert">This race could not be saved to history. Keep this tab open and try again when storage is available.</p>}
    <div className="kart-standings" aria-label="Race positions">{race.players.map((name, i) => <div key={i} className={`kart-driver kart-driver-${i}`}><strong>{i === 0 ? '🔴' : '🔵'} {name}</strong><span>Space {race.positions[i]} / 24</span><small>{race.items[i] === 'star' ? '⭐ Star shield' : race.items[i] === 'mushroom' ? '🍄 Mushroom boost' : 'No item'}</small></div>)}</div>
    {finished ? <h2 role="status">{winning}</h2> : <h2>{race.players[active]}'s roll · {Math.floor(race.turn / 2) + 1}/6 each</h2>}
    <p className="kart-message" role="status">{race.message}</p>
    {race.phase === 'roll' && <div className="kart-actions">
      {race.turn % 2 === 1 && Math.max(...race.positions) >= 24 && <p>Final roll! Both players get equal turns.</p>}
      <button className="start-btn" onClick={() => onChange(current => rollKart(current))}>🎲 Roll die</button>
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
    <ol className="kart-track" aria-label="Race track">{KART_TRACK.map((tile, index) => <li key={index} style={{ gridRow: Math.floor(index / 4) + 1, gridColumn: Math.floor(index / 4) % 2 === 0 ? index % 4 + 1 : 4 - index % 4 }} className={race.space === index + 1 ? 'kart-landed' : ''} aria-label={`Space ${index + 1}: ${KART_EFFECTS[tile.effect].name}, ${KART_GAME_NAMES[tile.mode]}`}><span>{index + 1} {index === 23 ? '🏁' : KART_EFFECTS[tile.effect].icon}</span><small>{tile.mode === 'pair-match' ? 'Match' : tile.mode === 'game-order' ? 'Order' : tile.mode === 'quiz' ? 'Quiz' : tile.mode === 'clue-duel' ? 'Clues' : 'Find'}</small><b>{race.positions.map((pos, player) => Math.min(24, pos) === index + 1 ? player === 0 ? '🔴' : '🔵' : '').join('')}</b></li>)}</ol>
    <details><summary>Track rules and items</summary><p>Roll 1–6. Bonus moves never trigger another space. No missed turns. A Star is used automatically when a banana would move you back. A Mushroom adds two to a roll when you choose to use it.</p>{Object.values(KART_EFFECTS).map(item => <p key={item.name}><strong>{item.icon} {item.name}:</strong> {item.rule}</p>)}</details>
    {race.log.length > 0 && <details><summary>Race recap</summary><ol>{race.log.map((line, i) => <li key={i}>{line}</li>)}</ol></details>}
    {historyPanel}
  </section>;
}
