// Checkpoints are same-device recovery, not a cloud backup. A checksum catches
// truncated or altered payloads; it is not an authentication/security mechanism.
const VERSION = 1;
const KEY = 'mariotrivia_checkpoint_v1';
const LIMIT = 2_000_000;
function checksum(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return hash >>> 0;
}
export function readCheckpoint<T>(): T | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw || raw.length > LIMIT) return null;
    const envelope = JSON.parse(raw);
    if (envelope.version !== VERSION || typeof envelope.payload !== 'string' || checksum(envelope.payload) !== envelope.checksum) return null;
    const payload = JSON.parse(envelope.payload);
    return payload && typeof payload === 'object' && !Array.isArray(payload) ? payload as T : null;
  } catch { return null; }
}
export function saveCheckpoint(value: object): boolean {
  try {
    const payload = JSON.stringify(value);
    const envelope = JSON.stringify({ version: VERSION, payload, checksum: checksum(payload) });
    if (envelope.length > LIMIT) return false;
    localStorage.setItem(KEY, envelope);
    return true;
  } catch { return false; }
}
export function clearCheckpoint(): boolean {
  try { localStorage.removeItem(KEY); return true; } catch { return false; }
}
