export type ReplayTile = { id: string; label: string; image?: string; detail?: string; state: 'hidden' | 'shown' | 'selected' | 'matched' | 'correct' | 'wrong' };
export type ReplayFrame = { atMs: number; event: string; tiles: ReplayTile[] };
export type BoardReplay = { version: 1; kind: 'order' | 'pairs'; title: string; target?: string; frames: ReplayFrame[] };

// Bound stored snapshots and validate them before rendering browser-owned data.
export function validReplay(value: unknown): value is BoardReplay {
  if (!value || typeof value !== 'object') return false;
  const replay = value as BoardReplay;
  return replay.version === 1 && ['order', 'pairs'].includes(replay.kind) && typeof replay.title === 'string'
    && (replay.target === undefined || typeof replay.target === 'string')
    && Array.isArray(replay.frames) && replay.frames.length > 0 && replay.frames.length <= 2000
    && replay.frames.every((frame, index) => frame && Number.isFinite(frame.atMs) && frame.atMs >= 0
      && (index === 0 || frame.atMs >= replay.frames[index - 1].atMs) && typeof frame.event === 'string'
      && Array.isArray(frame.tiles) && frame.tiles.length > 0 && frame.tiles.length <= 80
      && frame.tiles.every(tile => tile && typeof tile.id === 'string' && typeof tile.label === 'string'
        && (tile.detail === undefined || typeof tile.detail === 'string')
        && (tile.image === undefined || /^match-icons\/[a-z0-9-]+\.(?:svg|png|jpe?g|webp)$/.test(tile.image))
        && ['hidden', 'shown', 'selected', 'matched', 'correct', 'wrong'].includes(tile.state)));
}
