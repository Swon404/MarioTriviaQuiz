# Shared leaderboards — initial release

Community Top 5 is in High Scores for Time Trial and Game Order. Local scores
and backups are unchanged. This is not progress sync, a private family board,
or an anti-cheat authority.

## Owner setup — required before live use

1. Open Supabase project `kfychkbtavpxlwcmsiqi`.
2. In SQL Editor run `supabase/community-leaderboards.sql` in full. It creates
   the private table and scoped RPCs. Never publish administrator credentials.
3. In Authentication → Sign In / Providers enable anonymous sign-ins and review
   Auth rate limits. An identity is created only when uploading, not viewing.
4. Before advertising widely, add CAPTCHA to the anonymous sign-in flow, including
   client UI/token handling, and moderation/reporting. Supabase recommends CAPTCHA
   against signup abuse. Current per-identity limits (30/hour, 200/day) are pilot
   safeguards, not protection against somebody creating many accounts. Enabling
   CAPTCHA without client integration blocks uploads; pending times stay queued.
5. `.env` contains only the supplied public URL/publishable key and is intentionally
   tracked. Shell/CI VITE variables can override them for another environment.
6. Complete the live acceptance checks below before claiming it ready.

## Privacy and lifecycle

- Sharing defaults off and publishes only future eligible completions, not old
  scores or imported backups. Existing eligibility checks exclude bots/practice.
- Local players get random Racer aliases. Player names are not uploaded; replay
  titles are replaced. The public row ID can be used when reporting a score.
- Stored data: anonymous owner ID, alias, run ID, rules/settings, time, moves,
  upload date and optional replay. Provider auth/network metadata is separate.
  Public reads do not expose owner IDs or run IDs. Direct table access is denied.
- Browser identity persists locally, but is not a recoverable account. Other
  devices can view scores without becoming their owner.
- Offline queue holds up to 50 entries and retries at startup, reconnect, every
  minute and manually. Server uniqueness makes lost-response retries idempotent.
  Queue/storage failures are shown; local times are never deleted by syncing.
- Turning sharing off clears pending uploads. An in-flight upload may finish.
  Remove online times stops sharing, waits for sync and deletes only this
  identity's records. Local data and other identities stay untouched.
- Clearing site data loses unsent uploads and ownership credentials. Existing
  public times remain; the game owner can remove reported row IDs in Supabase.
  Progress exports deliberately exclude credentials and sharing consent.
- Oversized replays are omitted without blocking the score. Downloaded replay
  structure and image paths are validated before rendering.
- Trial groups by pair count/goal; Order by current ruleset/challenge/tile count.
  Hunt and legacy Order are not uploaded in this initial release.

## Live acceptance — pending

- [x] Live read RPC now responds HTTP 200 with an empty leaderboard (12 November).
- [x] Anonymous sign-in enabled (verified 13 November).
- [x] An unauthenticated reader can view Top 5, but cannot access the table,
  submit records, or delete records directly.
- [x] Two independent identities submit and see each other's scores in the
  correct configuration. Duplicate retries create only one row.
- [x] Live database rejects direct cross-owner writes/deletes, invalid
  settings/times/moves and oversized replay payloads. Replay titles are redacted.
- [ ] Verify rate limiting live (already tested in embedded PostgreSQL).
- [ ] Offline completion survives a real app close/reopen and uploads once;
  service failures retain the queue and local scores.
- [ ] Opt-out stops new uploads; removal affects only the current identity.
- [ ] Physical iPhone Safari and Home Screen checks, including restart.
- [ ] Owner agrees retention, moderation and wider-release abuse protections.

Browser tests intercept Supabase responses: they verify integration, not actual
database permissions. Separate live API checks on 13 November verified the
permissions and two-identity behaviour checked off above. Each identity's removal
left the other's scores intact; cleanup removed all temporary scores. Two anonymous
test identities remain in Auth with no leaderboard rows. No existing player
records were changed. Physical-device/offline live acceptance remains pending.

Local verification on 12 November: `npm run test:all` passed all 365 browser
tests, content audit, embedded PostgreSQL permission/rule tests, TypeScript and
production build/PWA checks. New browser tests run on Chromium and iPhone-WebKit,
including persistent-profile browser close/reopen. Phone preview had no horizontal
overflow. No live score uploads or database writes were performed in that
12 November local-verification batch; the separate 13 November checks are above.

Non-blocking maintenance findings: build reports a >500 kB application chunk;
dependency installation reports 19 advisories (production-only audit reports 15,
including build-tool dependencies). These require a separate dependency review;
no blind/breaking audit-fix upgrade was attempted in this change.

References: https://supabase.com/docs/guides/auth/auth-anonymous,
https://supabase.com/docs/guides/database/secure-data,
https://supabase.com/docs/guides/getting-started/api-keys.
