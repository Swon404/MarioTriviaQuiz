import { createClient } from '@supabase/supabase-js';
import type { OrderTime } from './gameOrder.ts';
import type { PairTime } from './pairTimes.ts';
import { validReplay, type BoardReplay } from './replay.ts';

const URL = import.meta.env?.VITE_SUPABASE_URL;
const KEY = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY;
export const onlineConfigured = Boolean(URL && KEY?.startsWith('sb_publishable_'));
const client = onlineConfigured ? createClient(URL, KEY, {
  auth: { storageKey: 'mushroom_online_auth', detectSessionInUrl: false },
  global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15000) }) },
}) : null;
const PREF = 'mushroom_online_sharing_v1';
const QUEUE = 'mushroom_online_queue_v1';
const ALIASES = 'mushroom_online_aliases_v1';
export type OnlineKind = 'order' | 'trial';
type Upload = { run: string; kind: OnlineKind; config: unknown[]; nickname: string; ms: number; moves: number; replay: BoardReplay | null };
export type OnlineTime = { id: string; nickname: string; elapsed_ms: number; moves: number; has_replay: boolean };
let message = '';
let running: Promise<void> | null = null;
const announce = (text: string) => { message = text; window.dispatchEvent(new Event('online-scores')); };
export function sharingEnabled(): boolean { try { return localStorage.getItem(PREF) === 'yes'; } catch { return false; } }
function queue(): Upload[] {
  const raw = JSON.parse(localStorage.getItem(QUEUE) ?? '[]');
  if (!Array.isArray(raw)) throw new Error('Invalid upload queue');
  return raw;
}
export function onlineStatus() {
  try { return { enabled: sharingEnabled(), pending: queue().length, aliases: Object.values(JSON.parse(localStorage.getItem(ALIASES) ?? '{}')).filter((value): value is string => typeof value === 'string' && /^Racer-[A-F0-9]{8}$/.test(value)), message }; }
  catch { return { enabled: sharingEnabled(), pending: 0, aliases: [] as string[], message: 'Online queue unavailable. Your local scores are unchanged.' }; }
}
export function setSharing(enabled: boolean): boolean {
  try {
    localStorage.setItem(PREF, enabled ? 'yes' : 'no');
    if (!enabled) localStorage.removeItem(QUEUE);
    announce(enabled ? 'New eligible times will be shared. Existing scores stay private.' : 'Sharing off. Previously uploaded times remain public until removed.');
    if (enabled) void syncOnlineScores();
    return true;
  } catch { announce('Could not save your sharing preference. Check browser storage.'); return false; }
}
function publicAlias(player: string): string {
  const aliases: Record<string, string> = JSON.parse(localStorage.getItem(ALIASES) ?? '{}');
  const key = JSON.stringify(player);
  if (!Object.hasOwn(aliases, key) || !/^Racer-[A-F0-9]{8}$/.test(aliases[key])) {
    aliases[key] = 'Racer-' + crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase();
    localStorage.setItem(ALIASES, JSON.stringify(aliases));
  }
  return aliases[key];
}
export function queueOnlineTime(kind: OnlineKind, record: OrderTime | PairTime): void {
  if (!onlineConfigured || !sharingEnabled()) return;
  try {
    let config: unknown[];
    if (kind === 'order') {
      const item = record as OrderTime;
      if (item.ruleset !== 'order-v3') return;
      config = [item.ruleset, null, item.challenge, item.tiles];
    } else {
      const item = record as PairTime;
      if (item.variant !== 'time-trial' || item.ruleset !== 'pairs-v1') return;
      config = [item.ruleset, item.variant, item.pairs, item.goal, false, 0];
    }
    const nickname = publicAlias(record.player);
    // Never publish a real player name through the replay title.
    let replay = validReplay(record.replay) ? { ...record.replay, title: nickname + ' · ' + (kind === 'order' ? 'Game Order' : 'Time Trial') } : null;
    if (replay && new TextEncoder().encode(JSON.stringify(replay)).length > 180000) replay = null;
    const pending = queue();
    if (!pending.some(item => item.run === record.id && item.kind === kind)) {
      if (pending.length >= 50) { announce('Online queue is full. This time is saved locally only; sync pending times first.'); return; }
      pending.push({ run: record.id, kind, config, nickname, ms: Math.round(record.elapsedMs), moves: 'attempts' in record ? record.attempts : record.moves, replay });
      localStorage.setItem(QUEUE, JSON.stringify(pending));
    }
    announce('Time queued for the community leaderboard.');
    void syncOnlineScores();
  } catch { announce('Online upload could not be queued. Your local score is still saved.'); }
}
export function syncOnlineScores(): Promise<void> {
  if (running) return running;
  running = sync().finally(() => { running = null; });
  return running;
}
async function sync(): Promise<void> {
  if (!client || !sharingEnabled()) return;
  try {
    if (!queue().length) return;
    if (!navigator.onLine) { announce('Offline. Queued times will upload when connected.'); return; }
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (!data.session) {
      const signed = await client.auth.signInAnonymously();
      if (signed.error) throw signed.error;
    }
    for (const item of queue()) {
      if (!sharingEnabled()) break;
      const { error } = await client.rpc('submit_community_time', { p_run: item.run, p_kind: item.kind, p_config: item.config, p_nickname: item.nickname, p_ms: item.ms, p_moves: item.moves, p_replay: item.replay });
      if (error) throw error;
      localStorage.setItem(QUEUE, JSON.stringify(queue().filter(value => value.run !== item.run || value.kind !== item.kind)));
    }
    announce(sharingEnabled() ? 'Queued times uploaded.' : 'Sharing off. Previously uploaded times remain public until removed.');
  } catch { announce('Online sync unavailable. Queued times are kept on this device; retry when the service is ready.'); }
}
export async function readOnlineTimes(kind: OnlineKind, config: unknown[]): Promise<OnlineTime[]> {
  if (!client) throw new Error('Online leaderboard is not configured.');
  const { data, error } = await client.rpc('community_top_times', { p_kind: kind, p_config: config });
  if (error) throw error;
  if (!Array.isArray(data)) throw new Error('Invalid leaderboard response');
  return data.filter((row): row is OnlineTime => typeof row.id === 'string' && /^Racer-[A-F0-9]{8}$/.test(row.nickname)
    && Number.isFinite(row.elapsed_ms) && row.elapsed_ms >= 100 && Number.isInteger(row.moves) && row.moves > 0 && typeof row.has_replay === 'boolean').slice(0, 5);
}
export async function readOnlineReplay(id: string): Promise<BoardReplay> {
  if (!client) throw new Error('Not configured');
  const { data, error } = await client.rpc('community_replay', { p_id: id });
  if (error || !validReplay(data)) throw new Error('Replay unavailable');
  return data;
}
export async function removeOnlineTimes(): Promise<void> {
  if (!client || !setSharing(false)) throw new Error('Could not stop sharing');
  await running;
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  if (data.session) {
    const result = await client.rpc('remove_my_community_times');
    if (result.error) throw result.error;
  }
  announce('Online times for this browser identity removed. Local scores are unchanged.');
}
export function startOnlineSync(): () => void {
  const retry = () => { void syncOnlineScores(); };
  window.addEventListener('online', retry);
  const interval = window.setInterval(retry, 60000);
  retry();
  return () => { window.removeEventListener('online', retry); window.clearInterval(interval); };
}
