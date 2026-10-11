export type ReplayTile = { id: string; label: string; image?: string; detail?: string; year?: number; feedback?: 'correct' | 'wrong'; pairId?: string; kind?: 'icon' | 'word'; iconKind?: 'emoji' | 'text' | 'svg' | 'image'; state: 'hidden' | 'shown' | 'selected' | 'matched' | 'correct' | 'wrong' };
export type ReplayFrame = { atMs: number; event: string; tiles: ReplayTile[] };
export type BoardReplay = { version: 1; kind: 'order' | 'pairs'; title: string; target?: string; targetUnlockPairs?: number; frames: ReplayFrame[] };

// Bound stored snapshots and validate them before rendering browser-owned data.
export function validReplay(value: unknown): value is BoardReplay {
  if (!value || typeof value !== 'object') return false;
  const replay = value as BoardReplay;
  return replay.version === 1 && ['order', 'pairs'].includes(replay.kind) && typeof replay.title === 'string'
    && (replay.target === undefined || typeof replay.target === 'string')
    && (replay.targetUnlockPairs === undefined || Number.isInteger(replay.targetUnlockPairs) && replay.targetUnlockPairs >= 0 && replay.targetUnlockPairs <= 40)
    && Array.isArray(replay.frames) && replay.frames.length > 0 && replay.frames.length <= 2000
    && replay.frames.every((frame, index) => frame && Number.isFinite(frame.atMs) && frame.atMs >= 0
      && (index === 0 || frame.atMs >= replay.frames[index - 1].atMs) && typeof frame.event === 'string'
      && Array.isArray(frame.tiles) && frame.tiles.length > 0 && frame.tiles.length <= 80
      && frame.tiles.every(tile => tile && typeof tile.id === 'string' && typeof tile.label === 'string'
        && (tile.detail === undefined || typeof tile.detail === 'string')
        && (tile.year === undefined || Number.isInteger(tile.year) && tile.year >= 1900 && tile.year <= 2200)
        && (tile.feedback === undefined || ['correct', 'wrong'].includes(tile.feedback))
        && (tile.pairId === undefined || typeof tile.pairId === 'string')
        && (tile.kind === undefined || ['icon', 'word'].includes(tile.kind))
        && (tile.iconKind === undefined || ['emoji', 'text', 'svg', 'image'].includes(tile.iconKind))
        && (tile.image === undefined || /^match-icons\/[a-z0-9-]+\.(?:svg|png|jpe?g|webp)$/.test(tile.image))
        && ['hidden', 'shown', 'selected', 'matched', 'correct', 'wrong'].includes(tile.state)));
}
