-- Run in this project's Supabase SQL Editor. Never put administrator keys in the app.
begin;
create table if not exists public.community_times (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  run_id text not null check (length(run_id) between 1 and 160),
  kind text not null check (kind in ('order', 'trial')),
  configuration jsonb not null,
  nickname text not null check (nickname ~ '^Racer-[A-F0-9]{8}$'),
  elapsed_ms integer not null check (elapsed_ms between 100 and 86400000),
  moves integer not null check (moves between 1 and 10000),
  replay jsonb,
  created_at timestamptz not null default now(),
  unique(owner_id, kind, run_id)
);
alter table public.community_times enable row level security;
revoke all on public.community_times from anon, authenticated;
create index if not exists community_times_ranking on public.community_times(kind, configuration, elapsed_ms, moves, created_at);
create index if not exists community_times_rate on public.community_times(owner_id, created_at);

create or replace function public.submit_community_time(
  p_run text, p_kind text, p_config jsonb, p_nickname text,
  p_ms integer, p_moves integer, p_replay jsonb default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  who uuid := auth.uid(); existing uuid; new_id uuid; amount integer; goal integer;
begin
  if who is null then raise exception 'Sign in required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(who::text, 0));
  select id into existing from public.community_times where owner_id = who and kind = p_kind and run_id = p_run;
  if existing is not null then return existing; end if;
  if not coalesce(p_kind in ('order', 'trial') and jsonb_typeof(p_config) = 'array', false) then raise exception 'Invalid configuration'; end if;
  if p_kind = 'order' then
    if not coalesce(jsonb_array_length(p_config) = 4 and p_config->>0 = 'order-v3'
      and p_config->1 = 'null'::jsonb and p_config->>2 in ('easy','medium','hard')
      and p_config->3 in ('4'::jsonb,'6'::jsonb,'8'::jsonb), false) then raise exception 'Unsupported order settings'; end if;
  else
    if not coalesce(jsonb_array_length(p_config) = 6 and p_config->>0 = 'pairs-v1' and p_config->>1 = 'time-trial'
      and p_config->4 = 'false'::jsonb and p_config->5 = '0'::jsonb
      and p_config->2 in ('9'::jsonb,'12'::jsonb,'15'::jsonb,'16'::jsonb,'20'::jsonb)
      and jsonb_typeof(p_config->3) = 'number', false) then raise exception 'Unsupported trial settings'; end if;
    amount := (p_config->>2)::integer; goal := (p_config->>3)::integer;
    if goal not in (3,4,5,8,amount) or p_moves < goal then raise exception 'Invalid trial goal or moves'; end if;
  end if;
  if (select count(*) from public.community_times where owner_id = who and created_at > now() - interval '1 hour') >= 30
    or (select count(*) from public.community_times where owner_id = who and created_at > now() - interval '1 day') >= 200 then
    raise exception 'Upload limit reached; retry later';
  end if;
  if p_replay is not null then
    if not coalesce(octet_length(p_replay::text) <= 200000 and jsonb_typeof(p_replay) = 'object'
      and p_replay->>'version' = '1' and p_replay->>'kind' = case when p_kind = 'order' then 'order' else 'pairs' end
      and jsonb_typeof(p_replay->'frames') = 'array', false) then raise exception 'Invalid replay'; end if;
    if jsonb_array_length(p_replay->'frames') not between 1 and 2000 then raise exception 'Invalid replay length'; end if;
    p_replay := jsonb_set(p_replay, '{title}', to_jsonb(p_nickname || ' replay'));
  end if;
  insert into public.community_times(owner_id,run_id,kind,configuration,nickname,elapsed_ms,moves,replay)
    values(who,p_run,p_kind,p_config,p_nickname,p_ms,p_moves,p_replay) returning id into new_id;
  return new_id;
end $$;

create or replace function public.community_top_times(p_kind text, p_config jsonb)
returns table(id uuid, nickname text, elapsed_ms integer, moves integer, has_replay boolean)
language sql stable security definer set search_path = '' as $$
  select t.id, t.nickname, t.elapsed_ms, t.moves, t.replay is not null
  from public.community_times t where t.kind = p_kind and t.configuration = p_config
  order by t.elapsed_ms, t.moves, t.created_at, t.id limit 5;
$$;
create or replace function public.community_replay(p_id uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select replay from public.community_times where id = p_id;
$$;
create or replace function public.remove_my_community_times() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  delete from public.community_times where owner_id = auth.uid();
end $$;
revoke all on function public.submit_community_time(text,text,jsonb,text,integer,integer,jsonb) from public, anon;
revoke all on function public.remove_my_community_times() from public, anon;
revoke all on function public.community_top_times(text,jsonb) from public;
revoke all on function public.community_replay(uuid) from public;
grant execute on function public.submit_community_time(text,text,jsonb,text,integer,integer,jsonb) to authenticated;
grant execute on function public.remove_my_community_times() to authenticated;
grant execute on function public.community_top_times(text,jsonb) to anon, authenticated;
grant execute on function public.community_replay(uuid) to anon, authenticated;
commit;
