# Mode and content audit — 29 October 2026

Local implementation; family acceptance and physical-phone checks are separate.
The final full-suite result is recorded in the main plan, not inferred from this audit.

## Reviewed expansion

The [coverage register](content-coverage-2026-10-29.md) lists all 252 Quiz/Learning
records, their 240 canonical facts, subjects, levels, editions, review dates and
sources. This follows the 20-question World batch with 20 Wonder/Odyssey and
21 other platform-game questions. One old Wonder spin-jump duplicate now shares
its existing knowledge ID: 200 + 41 − 1 = 240. No historical IDs are deleted.

The 41 new records cover movement, powers, enemies, captures, secrets and
cooperation. Read the complete prompt, all choices, answer, explanation and
extra together in `adventureQuestions.ts` and `platformQuestions.ts`.
Sources are linked per record. Notable edition checks: original Switch Wonder
badge rules; Wii's bubble/team-ground-pound controls; original NES enemy rules;
3D World/Fury Propeller Box rules, not Mario Maker's different boost rules.
New facts avoid patched-glitch claims. Existing historical glitches stay Legend.

| Mode | Local catalogue and audit |
| --- | --- |
| Quiz / Learning | 252 records, 240 distinct facts; 90 Rookie / 87 Pro / 75 Legend. Longest 16-question competitive Quiz pool checked across seeds and levels. |
| Clue Match Up | 125 sourced clues. All clue/answer pairs read for ambiguity. Two standalone boards; one per player in new Championships, as requested. No higher-level borrowing. |
| Game Order | 30 original US releases, all different years. Eight added games have individual release sources and an extra discovery. |
| Track Finder | 58 courses: all 48 MK8 Deluxe Booster courses plus ten labelled World courses. 33 tasks; Rookie uses landmarks/features. |
| Clue Duel | 66 subjects: 20 characters/enemies, 22 tracks, 16 items and eight Odyssey places. Five clues each; compatible item/place/character/track choices. |
| Match & Hunt | Existing 41 picture/name pairs retained. Slow/error artwork now has a visible name fallback after reveal. |
| Category Finder | 60 tiles, five basic groups, eleven advanced relationships. Eight sourced game additions broaden existing memberships and near misses. |

## Matching ambiguity corrections

- Toad's old generic helper clue could also describe Captain Toad. It now
  distinguishes the red-spotted attendant from the headlamp-wearing explorer.
- Boo Cinema's old “new World course” clue also fitted other visible World
  courses. It now identifies the haunted theatre and film-strip road.
- DK Mountain / GCN DK Mountain and the two equivalent speed-boost answers
  cannot appear together in a matching session, despite different display text.
- The Koopa clue now describes the walking turtle and kicked green shell.
- Console/cup/count answers retain explicit game context. No source-backed
  question answer was changed to manufacture a new fact.

## History and extras

Six original pool keys are extended with ten subject-specific pools. Seen extras
are recorded only on revealed feedback for the actual human viewers. Exhausted
extras are omitted. Exact shared facts reuse exposure IDs; curated equivalences
also cover differently worded Goomba towers and Wonder spin shots. Reading a
linked extra can mark that specific Quiz fact seen; unrelated character facts stay fresh.

Revealed Clue/Finder feedback links exact Quiz knowledge: character identities,
World item mechanics/landmarks, all twelve revealed ordered cup lineups and the
new adventure subjects. Vague opening clues do not reveal those linked facts.
Cup lineups do not mark wave-number questions seen. Learning catalogue browsing
remains freely available; simply rendering all its cards does not mark all facts read.

## Order and score integrity

Dad approved balanced competitive Championship on 29 October: one point per
game won, one each for a drawn game, equal final totals mean a draw. New records
carry `game-wins-v1`; old results/runs keep action totals. Game scores continue
to feed lifetime progress, without adding the Championship tally again. New
matching legs have one board per player; an old resumed run retains two even
when that leg has not started yet. Solo retains action totals.

New Order boards carry `order-v3`. Older resumed boards without metadata save as
`order-v2`; historical labels and score groups remain intact. Both v2 and v3
combine human level labels within their own catalogue. Opponents receive different
titles from comparable date bands, with equal minimum swap work.

Years and release-source details appear only after solving. Checking penalties
appear next to the clock. Hunt/Order personal-best messages compare the same
player and full matching configuration/ruleset history, including entries outside
Top 5. Practice and bot attempts cannot create those messages or human records.

Ordinary results no longer silently truncate at 200, nor Championships at 100.
Timed records/replays already retain older bests. Explicit cleanup/Undo remains.
Failed writes preserve existing stored bytes and show storage warnings. This does
not identify or prove a fix for Dad's separately reported restart-related score loss.

## Verification coverage

Focused checks passed for all seven games in Quick, Standard and Epic solo
Championship sequences, with a reload in each leg and exact carried/saved totals.
Existing competitive, timed tie, private/shared Hunt, visible bot, recovery and
replay checks remain. One-attempt competitive Quiz covers all levels, humans,
Shroomer and Championship; solo and legacy checkpoints retain their retry rules.

Phone stress checks cover 16/20 pairs, slow and failed artwork, hidden-card labels,
keyboard reveal, rapid repeated matching, 24px root text and reduced motion in
Chromium and WebKit. Normal text retains four columns at 390px; enlarged text
uses wider tiles, with all 41 catalogue labels checked for whole-word fit.
Eight-tile Order covers long player names, hidden years,
penalties, release sources and v2 recovery. Physical picture recognition, Safari
browser bars, rotation, speech and Home Screen acceptance still need the family.

Production-worker testing covers installation, safe update prompts, updating a
second tab during play, explicit update reload, offline navigation/Hunt and retained
storage. Zoom is enabled; 180/192/512 icons are provided. The browser-data refresh
changes only caniuse-lite/baseline-browser-mapping lock entries. The existing CI
peer-dependency option remains necessary for the current Vite/PWA combination;
the actual production worker is now tested rather than relying on build success.
