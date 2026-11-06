import KartStakes, { kartDistance } from './KartStakes.tsx';
import { useState, useRef, useLayoutEffect, type RefObject } from 'react';
import { kartPoint, kartMotion } from './mario/kartMotion.ts';
import { KART_TRACK, KART_EFFECTS, kartActive, rollKart, chooseKartRoute, safeKartMushroom, claimKartItem, nextKartTurn, type KartRace } from './mario/kartQuest.ts';
import './kartQuest.css';
import KartSpaceIcon from './KartSpaceIcon.tsx';
import { kartHistory, saveKartHistory } from './mario/kartHistory.ts';
import { useEffect } from 'react';

export const KART_GAME_NAMES: Record<string, string> = { 'pair-match': 'Match & Hunt', 'game-order': 'Game Order', quiz: 'Quiz Battle', 'clue-duel': 'Clue Duel', 'track-finder': 'Track Finder', 'category-finder': 'Category Finder' };
const ROAD_PATH = 'M50 20V50H350Q375 50 375 100T350 150H50Q25 150 25 200T50 250H350Q375 250 375 300T350 350H50Q25 350 25 400T50 450H350Q375 450 375 500T350 550H50';
const DIE_PIPS = [[4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];

function DieFace({ value, rolling = false }: { value: number; rolling?: boolean }) {
  return <span className={`kart-die-face ${rolling ? 'kart-die-rolling' : ''}`} aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} className={DIE_PIPS[value - 1].includes(index) ? 'die-pip' : ''} />)}</span>;
}

function KartToken({ player }: { player: number }) {
  return <svg className={`kart-token kart-token-${player}`} viewBox="0 0 48 56" aria-hidden="true"><rect x="3" y="12" width="9" height="15" rx="3" fill="#101827" /><rect x="36" y="12" width="9" height="15" rx="3" fill="#101827" /><rect x="3" y="35" width="9" height="15" rx="3" fill="#101827" /><rect x="36" y="35" width="9" height="15" rx="3" fill="#101827" /><path d="M15 4h18l5 14v31H10V18Z" fill="currentColor" stroke="white" strokeWidth="2" /><rect x="16" y="15" width="16" height="17" rx="6" fill="#18283f" /><circle cx="24" cy="24" r="6" fill="#ffe4b3" /><path d="M15 40h18M20 5v8h8V5" stroke="white" strokeWidth="4" /><text x="24" y="49" textAnchor="middle" fill="white" fontSize="10" fontWeight="900">{player + 1}</text></svg>;
}

export type KartPositionMemory = RefObject<({ id: string; position: number } | null)[]>;

function RoadRacer({ race, player, memory }: { race: KartRace; player: number; memory: KartPositionMemory }) {
  const element = useRef<HTMLSpanElement>(null);
  const journey = useRef<{ id: string; to: number; from: number } | null>(null);
  const position = race.positions[player];
  const point = kartPoint(position);
  const shared = Math.min(24, race.positions[0]) === Math.min(24, race.positions[1]);
  const row = Math.floor((Math.max(1, Math.min(24, position)) - 1) / 4);
  useLayoutEffect(() => {
    const previous = memory.current[player];
    if (journey.current?.id !== race.id || journey.current.to !== position) journey.current = { id: race.id, to: position, from: previous?.id === race.id ? previous.position : position };
    memory.current[player] = { id: race.id, position };
    const from = journey.current.from;
    if (!element.current || from === position || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const frames = kartMotion(from, position);
    const duration = Math.min(4400, Math.max(650, Math.abs(Math.min(24, position) - Math.min(24, from)) * 550));
    // Hold at the starting space while the road comes into view, then travel
    // slowly enough to follow each space. The saved outcome is unchanged.
    const timing: KeyframeAnimationOptions = { duration, delay: 350, fill: 'backwards', easing: 'linear' };
    const movement = element.current.animate(frames.map(({ left, top }) => ({ left, top })), timing);
    const steering = element.current.querySelector('.kart-token')!.animate(frames.map(({ angle }) => ({ transform: `rotate(${angle}deg)` })), timing);
    const camera = window.requestAnimationFrame(() => {
      const activeMarker = document.getElementById(`kart-player-${kartActive(race)}`);
      // When both move, follow the current player rather than competing scrolls.
      if (player === kartActive(race) || !activeMarker?.getAnimations().length) element.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    return () => { window.cancelAnimationFrame(camera); movement.cancel(); steering.cancel(); };
  }, [race.id, position, player, memory]);
  return <span ref={element} id={`kart-player-${player}`} tabIndex={-1} className={`kart-road-racer kart-road-racer-${player} ${shared ? 'kart-sharing-space' : ''} ${point.x === 50 ? 'kart-edge-left' : point.x === 350 ? 'kart-edge-right' : ''} ${row % 2 ? 'kart-facing-left' : ''}`} style={{ left: `${point.x / 4}%`, top: `${point.y / 6}%` }} aria-label={position === 0 ? `${race.players[player]} at the start` : `${race.players[player]} on space ${position}`}><KartToken player={player} /><span className="kart-player-number" aria-hidden="true">{player + 1}</span><span className="kart-racer-name"><span>{race.players[player]}</span><b>{position === 0 ? 'START' : position >= 24 ? kartDistance(position) : position}</b></span></span>;
}

export default function KartQuest({ race: savedRace, positionMemory, names, onStart, onChange, onChallenge, onExit }: {
  positionMemory: KartPositionMemory;
  race: KartRace | null; names: [string, string]; onStart: (names: [string, string]) => void;
  onChange: (change: (race: KartRace) => KartRace) => void; onChallenge: () => void; onExit: () => void;
}) {
  const [first, setFirst] = useState(names[0]);
  const [second, setSecond] = useState(names[1]);
  const [rolling, setRolling] = useState<KartRace | null>(null);
  const [rollingFace, setRollingFace] = useState(1);
  const race = rolling ?? savedRace;
  useEffect(() => {
    if (!rolling) return;
    const faces = window.setInterval(() => setRollingFace(face => face % 6 + 1), 85);
    const finish = window.setTimeout(() => setRolling(null), 1600);
    return () => { window.clearInterval(faces); window.clearTimeout(finish); };
  }, [rolling]);
  const rollDie = (boost = false) => {
    if (!savedRace || savedRace.phase !== 'roll' || rolling) return;
    // Commit the real roll immediately. The animation never determines the
    // outcome, and reloading mid-roll restores it rather than rolling again.
    const result = rollKart(savedRace, boost);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRollingFace(1);
      setRolling(savedRace);
    }
    onChange(current => current.id === savedRace.id && current.turn === savedRace.turn && current.phase === 'roll' ? result : current);
  };
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
    <p>Match & Hunt, Game Order and Clue Duel lead the way — seven spaces each. Clue Duel is one shared challenge; other games give you one short go each. Reach 24, then finish the pair of turns. Furthest wins, including spaces past the finish. Six rolls each at most.</p>
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
    <div className="kart-standings" aria-label="Race positions">{race.players.map((name, i) => <button key={i} type="button" aria-label={`Find ${name}'s kart`} onClick={() => { const marker = document.getElementById(`kart-player-${i}`); marker?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); marker?.focus({ preventScroll: true }); }} className={`kart-driver kart-driver-${i} ${!finished && active === i ? 'kart-driver-active' : ''}`}><KartToken player={i} /><span className="kart-driver-info"><strong><span className="kart-driver-number">{i + 1}</span> {name}</strong><span><b>{kartDistance(race.positions[i])}</b></span><small>{race.items[i] === 'star' ? '⭐ Star shield' : race.items[i] === 'mushroom' ? '🍄 Mushroom boost' : 'Item slot empty'}</small><small className="kart-find-hint">Find my kart ↗</small></span>{!finished && active === i && <span className="kart-turn-light" aria-label="Current player" />}</button>)}</div>
    <div className="kart-turn-heading">{finished ? <h2 role="status">{winning}</h2> : <><h2>{race.players[active]}'s turn</h2><span>{race.turn >= 10 ? 'FINAL ROUND' : <>ROLL <b>{Math.floor(race.turn / 2) + 1}</b> / 6</>}</span></>}</div>
    <p className="kart-message" role="status">{rolling ? 'Rolling the die…' : race.turn === 0 && race.phase === 'roll' ? 'Roll out! Race to 24. Both players get equal turns.' : race.message}</p>
    {!rolling && race.phase === 'landed' && <div className="kart-roll-result" aria-label={`Dice result: ${race.die}`}><DieFace value={race.die} /><strong>You rolled {race.die}</strong></div>}
    {race.phase === 'roll' && <div className="kart-actions">
      {race.turn % 2 === 1 && Math.max(...race.positions) >= 24 && <p>Final chance! Both players get equal rolls. Furthest distance wins, including spaces beyond 24.</p>}
      <button className="start-btn kart-roll" aria-label="🎲 Roll die" disabled={!!rolling} onClick={() => rollDie()}><DieFace value={rolling ? rollingFace : 5} rolling={!!rolling} /><span>{rolling ? 'Rolling…' : 'Roll die'}<small>{rolling ? 'Here we go!' : 'Let’s hit the track'}</small></span><span className="kart-roll-arrow" aria-hidden="true">→</span></button>
      {race.items[active] === 'mushroom' && <button className="round-btn" disabled={!!rolling} onClick={() => rollDie(true)}>Use Mushroom: roll +2</button>}
    </div>}
    {race.phase === 'landed' && <div className="kart-destination">
      {!race.routeChosen ? <><h3>Choose your route</h3><p>Both routes play {KART_GAME_NAMES[space.mode]}.</p><button className="round-btn" onClick={() => onChange(current => chooseKartRoute(current, true))}>Open road: winner +2</button><button className="round-btn" onClick={() => onChange(current => chooseKartRoute(current, false))}>{effect.icon} {effect.name}: winner +3</button></> : <>
        <KartStakes race={race} /><p><strong>{KART_GAME_NAMES[space.mode]}</strong> · {space.mode === 'clue-duel' ? 'One shared clue challenge' : 'One short round each'} · {race.players[active]} plays first.</p>
        {race.effect === 'mushroom' && <button className="round-btn" onClick={() => onChange(current => safeKartMushroom(current))}>Take safe +1</button>}
        <button className="start-btn" onClick={onChallenge}>{race.effect === 'mushroom' ? 'Race for +3' : 'Play challenge'}</button>
      </>}
    </div>}
    {race.phase === 'reward' && race.rewardPlayer !== null && <div className="kart-destination"><h3>{race.players[race.rewardPlayer]}, choose your item</h3><p>One item at a time. Choosing replaces your current item.</p><button className="round-btn" onClick={() => onChange(current => claimKartItem(current, 'mushroom'))}>🍄 Mushroom: next roll +2</button><button className="round-btn" onClick={() => onChange(current => claimKartItem(current, 'star'))}>⭐ Star: block one banana</button></div>}
    {race.phase === 'summary' && <button className="start-btn" onClick={() => onChange(nextKartTurn)}>{(race.turn + 1) % 2 === 0 && (Math.max(...race.positions) >= 24 || race.turn >= 11) ? 'See race result' : 'Next roll'}</button>}
    {finished && <><p>Finished after {race.turn / 2} rolls each. {race.players[0]}: {kartDistance(race.positions[0])} · {race.players[1]}: {kartDistance(race.positions[1])}. Furthest wins, including distance beyond 24.</p><button className="start-btn" onClick={() => onStart(race.players)}>Race again</button></>}
    <div className="kart-course">
      <div className="kart-course-heading"><span>START <span aria-hidden="true">→</span></span><span>FOLLOW THE ROAD TO <b>24</b> 🏁</span></div>
      <div className="kart-road-board">
        <svg className="kart-road" viewBox="0 0 400 600" preserveAspectRatio="none" aria-hidden="true"><path d={ROAD_PATH} /><path d={ROAD_PATH} className="kart-road-surface" /><path d={ROAD_PATH} className="kart-road-line" /></svg>
        <ol className="kart-track" aria-label="Race track">{KART_TRACK.map((tile, index) => <li key={index} style={{ gridRow: Math.floor(index / 4) + 1, gridColumn: Math.floor(index / 4) % 2 === 0 ? index % 4 + 1 : 4 - index % 4 }} className={`kart-space kart-space-${tile.effect} ${race.space === index + 1 ? 'kart-landed' : ''} ${index === 23 ? 'kart-finish' : ''} ${race.positions.some(pos => Math.min(24, pos) === index + 1) ? 'kart-occupied' : ''}`} aria-label={`Space ${index + 1}: ${KART_EFFECTS[tile.effect].name}, ${KART_GAME_NAMES[tile.mode]}`}><span className="kart-space-number">{index + 1}</span><span className="kart-space-icon" aria-hidden="true"><KartSpaceIcon effect={index === 23 ? 'rival' : tile.effect} left={Math.floor(index / 4) % 2 === 1} /></span><small>{tile.mode === 'pair-match' ? 'Match' : tile.mode === 'game-order' ? 'Order' : tile.mode === 'quiz' ? 'Quiz' : tile.mode === 'clue-duel' ? 'Clues' : 'Find'}</small>{tile.fork && <span className="kart-fork" aria-label="Route choice">⑂</span>}</li>)}</ol>
        <div className="kart-racer-layer">{race.players.map((_, player) => <RoadRacer key={`${race.id}:${player}`} race={race} player={player} memory={positionMemory} />)}</div>
      </div>
      <div className="kart-course-legend"><span>🍌 Dodge</span><span>🟢 Shortcut</span><span>❓ Item</span><span>🏁 Race</span></div>
    </div>
    <details><summary>Track rules and items</summary><p>Roll 1–6. Bonus moves never trigger another space. No missed turns. A Star is used automatically when a banana would move you back. A Mushroom adds two to a roll when you choose to use it.</p>{Object.values(KART_EFFECTS).map(item => <p key={item.name}><strong>{item.icon} {item.name}:</strong> {item.rule}</p>)}</details>
    {race.log.length > 0 && <details><summary>Race recap</summary><ol>{race.log.map((line, i) => <li key={i}>{line}</li>)}</ol></details>}
    {historyPanel}
  </section>;
}
