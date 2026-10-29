import type { OrderRound, PairCard } from './mario/rounds.ts';
import type { ReplayTile } from './mario/replay.ts';
import { useState } from 'react';

function CardImage({ path, name }: { path: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const src = /^(https?:\/\/|\/|data:)/.test(path) ? path : `${import.meta.env.BASE_URL}${path}`;
  return <>{(!loaded || failed) && <span className="pair-card-word">{name}</span>}
    {!failed && <img className="pair-card-svg" src={src} alt="" aria-hidden="true" style={!loaded ? { display: 'none' } : undefined}
      onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}</>;
}

// Both live play and saved playback use these snapshots and these exact tiles.
export function orderTilesFor(round: OrderRound, ids: string[], selected: number | null, positions: string[], hints: boolean, countOnly: boolean): ReplayTile[] {
  const finished = positions.length > 0 && positions.every(value => value === 'correct');
  return ids.map((id, index) => {
    const tile = round.tiles.find(item => item.id === id)!;
    const position = !countOnly || finished ? positions[index] : undefined;
    const feedback = position ? position === 'correct' ? 'correct' : 'wrong' : undefined;
    return {
      id, label: tile.title, year: finished ? tile.year : undefined, feedback,
      state: selected === index ? 'selected' : feedback ?? 'shown',
      detail: position ? position === 'correct' ? '✓ Correct position' : hints ? position === 'left' ? '← Move earlier' : 'Move later →' : 'Wrong position' : undefined,
    };
  });
}

export function pairTilesFor(cards: readonly PairCard[], visible: string[], matched: string[]): ReplayTile[] {
  return cards.map(card => ({
    id: card.id, pairId: card.pairId, kind: card.kind, iconKind: card.iconKind,
    label: card.iconKind === 'svg' || card.iconKind === 'image' ? card.iconAlt ?? card.pairId : card.label,
    image: card.kind === 'icon' && (card.iconKind === 'svg' || card.iconKind === 'image') ? card.label : undefined,
    state: matched.includes(card.pairId) ? 'matched' : visible.includes(card.id) ? 'selected' : 'hidden',
  }));
}

export function OrderTiles({ tiles, disabled = false, onChoose, replay = false }: {
  tiles: ReplayTile[]; disabled?: boolean; onChoose?: (index: number) => void; replay?: boolean;
}) {
  return <div className="order-tiles" data-board="order">{tiles.map((tile, index) => {
    const feedback = tile.feedback ?? (tile.state === 'correct' || tile.state === 'wrong' ? tile.state : undefined);
    // Old recordings stored the final year in detail rather than its own field.
    const legacyYear = tile.state === 'correct' && /^\d{4}$/.test(tile.detail ?? '') ? Number(tile.detail) : undefined;
    const year = tile.year ?? legacyYear;
    const detail = legacyYear ? '✓ Correct position' : tile.detail;
    return <button key={tile.id} disabled={disabled} aria-pressed={tile.state === 'selected'}
      className={`${tile.state === 'selected' ? 'selected-tile' : ''} ${feedback ? 'order-' + feedback : ''} ${replay ? 'replay-' + tile.state : ''}`}
      onClick={() => onChoose?.(index)}>
      <span>{tile.label}</span>
      {year !== undefined && <small className="order-year">{year}</small>}
      {detail && <small className="order-position-feedback">{detail}</small>}
    </button>;
  })}</div>;
}

export function PairCards({ tiles, disabled = false, onChoose, replay = false }: {
  tiles: ReplayTile[]; disabled?: boolean; onChoose?: (id: string) => void; replay?: boolean;
}) {
  return <div className="pair-card-grid" data-board="pairs" aria-label="Face-down pair cards">{tiles.map((tile, index) => {
    const visible = tile.state !== 'hidden';
    const matched = tile.state === 'matched';
    const kind = tile.kind ?? (tile.image || tile.id.endsWith('-icon') ? 'icon' : 'word');
    const iconKind = tile.iconKind ?? (tile.image ? 'image' : 'emoji');
    return <button key={tile.id} type="button" data-pair-id={tile.pairId ?? tile.id.replace(/-(icon|word)$/, '')} data-kind={kind}
      disabled={matched || disabled} className={`pair-card ${visible ? 'pair-card-face' : 'pair-card-back'} ${matched ? 'pair-card-found' : ''} ${replay ? 'replay-' + tile.state : ''}`}
      aria-label={visible ? `${kind === 'word' ? 'Word' : 'Icon'}: ${tile.label}` : `Hidden card ${index + 1}`}
      aria-pressed={visible} onClick={() => onChoose?.(tile.id)}>
      {visible ? kind === 'word' ? <span className="pair-card-word">{tile.label}</span>
        : tile.image ? <CardImage key={tile.image} path={tile.image} name={tiles.find(other => other.kind === 'word' && other.pairId === tile.pairId)?.label ?? tile.label.split(' — ')[0]} />
        : <span className={iconKind === 'text' ? 'pair-card-text-icon' : 'pair-card-icon'}>{tile.label}</span>
        : <span className="pair-card-mark" aria-hidden="true">?</span>}
    </button>;
  })}</div>;
}

export function HuntTarget({ name, unlockPairs = 0, matchedPairs = 0 }: { name?: string; unlockPairs?: number; matchedPairs?: number }) {
  if (!name) return null;
  return <p className="hunt-target-banner">🎯 Hunt target: <strong>{name}</strong>{unlockPairs > 0 && <> · {matchedPairs >= unlockPairs ? 'Unlocked!' : `Unlocks after ${unlockPairs} other pairs (${matchedPairs}/${unlockPairs})`}</>}</p>;
}
