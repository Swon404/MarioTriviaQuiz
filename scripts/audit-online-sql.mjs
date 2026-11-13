import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const a = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
const b = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
const config = ['pairs-v1', 'time-trial', 12, 5, false, 0];
const submit = (run, overrides = {}) => {
  const value = { kind: 'trial', config, nickname: 'Racer-ABCDEF12', ms: 5000, moves: 5, replay: null, ...overrides };
  return db.query('select public.submit_community_time($1,$2,$3::jsonb,$4,$5,$6,$7::jsonb) as id', [run, value.kind, JSON.stringify(value.config), value.nickname, value.ms, value.moves, value.replay === null ? null : JSON.stringify(value.replay)]);
};
const top = () => db.query('select * from public.community_top_times($1,$2::jsonb)', ['trial', JSON.stringify(config)]);
try {
  // Model Supabase roles/JWT identity locally, never use a real project.
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth to anon,authenticated;
    grant execute on function auth.uid() to anon,authenticated;
    insert into auth.users values ('${a}'),('${b}');`);
  const migration = await readFile(new URL('../supabase/community-leaderboards.sql', import.meta.url), 'utf8');
  await db.exec(migration);
  await db.exec(migration); // Safe to rerun setup without deleting scores.
  await db.exec('set role anon');
  assert.equal((await top()).rows.length, 0);
  await assert.rejects(submit('forbidden'), /permission denied/);
  await assert.rejects(db.query('select * from public.community_times'), /permission denied/);
  await assert.rejects(db.query('select public.remove_my_community_times()'), /permission denied/);
  await db.exec('reset role; set role authenticated');
  await assert.rejects(submit('no-identity'), /Sign in required/);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [a]);
  const idA = (await submit('same-run')).rows[0].id;
  assert.equal((await submit('same-run', { ms: 100 })).rows[0].id, idA);
  assert.equal((await top()).rows[0].elapsed_ms, 5000);
  for (const [label, patch] of Object.entries({ negative: { ms: -1 }, tooFast: { ms: 0 }, name: { nickname: 'Real name' }, wrongKind: { kind: 'hunt' }, nullConfig: { config: null }, missingSetting: { config: ['pairs-v1', 'time-trial', 12, 5, null, 0] }, invalidGoal: { config: ['pairs-v1', 'time-trial', 12, 6, false, 0] }, moves: { moves: 1 }, badReplay: { replay: {} }, hugeReplay: { replay: { data: 'x'.repeat(200001) } } })) {
    await assert.rejects(submit(label, patch));
  }
  await assert.rejects(db.query('update public.community_times set elapsed_ms=100'), /permission denied/);
  await assert.rejects(db.query('delete from public.community_times'), /permission denied/);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [b]);
  const idB = (await submit('same-run', { ms: 4000 })).rows[0].id;
  assert.notEqual(idA, idB);
  assert.deepEqual((await top()).rows.map(row => row.elapsed_ms), [4000, 5000]);
  await submit('different-settings', { config: ['pairs-v1', 'time-trial', 16, 8, false, 0], moves: 8 });
  assert.equal((await top()).rows.length, 2);
  const replay = { version: 1, kind: 'order', title: 'Private name', frames: [{ atMs: 0, event: 'Start', tiles: [] }] };
  const order = (await submit('order', { kind: 'order', config: ['order-v3', null, 'hard', 8], replay })).rows[0].id;
  const savedReplay = (await db.query('select public.community_replay($1) as replay', [order])).rows[0].replay;
  assert.equal(savedReplay.title, 'Racer-ABCDEF12 replay');
  await db.query('select public.remove_my_community_times()');
  assert.deepEqual((await top()).rows.map(row => row.id), [idA]);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [a]);
  for (let index = 0; index < 29; index++) await submit(`rate-${index}`, { ms: 6000 + index });
  assert.equal((await top()).rows.length, 5);
  await assert.rejects(submit('over-limit'), /Upload limit/);
  assert.equal((await submit('same-run')).rows[0].id, idA); // Retries remain safe at the cap.
  console.log('Community SQL verified: migration, permissions, two identities, grouping, deduplication, validation, replay redaction, deletion and rate cap.');
} finally { await db.close(); }
