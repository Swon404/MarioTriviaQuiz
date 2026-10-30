# Mushroom Power Quiz — main experience plan

Updated 30 October 2026. **This is the main plan and single active backlog.**

It combines the 18 October whole-game audit with every outstanding workstream
and acceptance check from the [previous roadmap](family-experience-roadmap-2026-10-11.md).
That roadmap and earlier plans remain historical evidence, not competing task lists.
Unchecked items below are not claimed complete merely because they have tests or
appear in this document. Proposed rule changes still require a family decision.

## 29 October — implementation checkpoint, not family acceptance

- User approved **one competitive attempt**. Implemented for new two-player,
  Shroomer and competitive Championship Quiz. Solo retries and old checkpoints
  retain their prior rules; score configurations distinguish the new competition.
- User approved the [balanced Championship rule](championship-balance-proposal-2026-10-28.md):
  game win 1, loss 0, draw 1 each. Implemented for new competitive runs; raw
  game points still feed lifetime progress. Old runs and solo keep action totals.
  User also requested one Clue Match Up board per player in new Championships.
  Standalone matching and old Championships retain their previous board counts.
- [x] Expand to **252 Quiz/Learning records / 240 distinct facts / 125 matching
  clues**, with the complete [coverage register](content-coverage-2026-10-29.md).
- [x] Expand and audit the other catalogues: 30 Order titles, 66 Clue Duel subjects,
  58 Finder courses/33 tasks, 60 Category tiles. The 41 Hunt pictures remain.
  See the [mode audit](mode-audit-2026-10-29.md) for exact scope and sources.
- [x] Add ten extra-fact pools, revealed-feedback exposure and semantic links;
  suppress exhausted extras. Correct ambiguous matching clues and equivalent
  answer labels. Preserve old IDs and unrelated facts about the same character.
- [x] Add comparable timed personal-best improvements, preserve old Order rules
  on resume, show check penalties by the timer, and fix singular point labels.
- [x] Remove silent 200-result/100-Championship caps. Preserve existing records
  on failed writes. **The reported restart score loss remains unresolved.**
- [x] Implement [manual backup/merge and failure recovery](progress-backup-2026-10-29.md).
  Existing IDs win; no cloud account or automatic transmission.
- [x] Implement safe PWA updates, visible build, Home Screen icons, zoom,
  complete reduced-motion styling and readable slow/error artwork fallbacks.
  Production-worker update/offline checks are now part of `test:all`.
- [x] Refresh browser compatibility data. No target-browser changes reported.
- [x] Focused checks: Quick/Standard/Epic each complete all seven games, reload
  each leg and verify carried totals. Phone stress checks pass in Chromium and
  WebKit. Competitive attempts, backup failure/recovery and history checks pass.
- Verification history: the first 289-test run passed 284; five stale assertions
  expected plural "1 points", the old Cappy search count or competitive Rewind.
  Updated assertions retain score/recovery checks. Screenshot review then exposed
  enlarged-text word splitting; fixed the grid and checked all 41 labels. All 26
  affected layout/replay/difficulty checks passed before the final full rerun.
- [x] Stage-one final gate passed: 289 browser tests (213 Chromium, 76 WebKit),
  content audit, TypeScript/production build and real production-worker update/offline
  checks. Whitespace check passed. This verifies the expansion/reliability stage.
- [ ] [Rank/milestone pacing](progression-pacing-proposal-2026-10-29.md) is approved;
  implementing in the following stage. Thresholds have not changed yet.
- [ ] Physical Safari/Home Screen, Files backup, family challenge/interest and
  Shroomer calibration remain. Use the [three-session checklist](phone-acceptance-2026-10-29.md).
  These are acceptance work, not unfinished implementation to hide with test counts.
- Stage one committed as `a6b712e`. User requested stage-by-stage commits.
- Stage two implements balanced Championship and one matching board per player;
  final `test:all` passed 297 browser checks (217 Chromium, 80 WebKit), content
  audit, TypeScript/production build and production-worker update/offline checks.
  Phone result screenshot and whitespace checks passed. Ready for its stage commit.
  No push or deployment of this local batch is claimed.

## 28 October — earlier checkpoint and World content batch

- Released through `1ef4bf5`: clearer timed Hunt results/leaderboards, compact
  boards, the whole-bank feedback refresh and item follow-up, and removal of
  irrelevant human difficulty controls. See the
  [feedback audit](feedback-audit-2026-10-27.md) and
  [difficulty audit](difficulty-audit-2026-10-28.md).
  That release passed 234 browser checks (179 Chromium + 55 WebKit), content
  audit and production/PWA build; GitHub test and deployment both succeeded.
- Earlier dated local verification/release statements below describe those
  batches at the time. They do not override this checkpoint.
- [x] Implement the first World-first expansion: 20 new distinct quiz facts,
  seven Rookie, seven Pro and six Legend; eight matching clues share their
  history IDs. Learning Zone includes all 20. See the
  [coverage/source register](world-content-batch-2026-10-28.md).
  Current totals: **211 quiz records / 200 distinct facts / 116 matching clues**.
- [x] Final `npm run test:all` passed for this local batch: 211-question content
  audit / 900 generated quizzes, all 240 browser checks (185 Chromium + 55
  WebKit), TypeScript and production/PWA build. Inspected the new Learning Zone
  card at 390px; whitespace check passed. Not committed, pushed or deployed.
- [ ] Family acceptance of the revised writing and new facts remains open.
  More content and passing tests do not establish that Blaize wants another go.
- Next content work: World Track Finder/Clue Duel expansion, followed by the
  next reviewed batch towards 240 distinct facts. This batch adds Quiz, Learning
  Zone and Clue Match Up content; it does not expand the other mode catalogues.
- The score-loss report, Championship weighting/retry decisions, real-iPhone
  acceptance and later backup/progression work remain open below.

## 22 October — score-loss report and Championship audit

- [ ] Unresolved: Dad reports scores disappeared after a restart. The exact score
  type, browser/installation context and cause are unknown; no recovery or fix
  claimed. Dad will watch for recurrence and asked to continue the plan. If it
  recurs, capture player name, URL, Safari/Home Screen context, score type and
  any storage warning before clearing data. Do not assume user error or deletion.
- [x] Inspect Championship scoring opportunities across all seven modes and all
  sizes: [source-backed comparison](championship-scoring-audit-2026-10-22.md).
  One-point arithmetic is preserved; matching and untimed Hunt have greater
  influence than some other games. Family rule decisions and runtime acceptance
  remain open. This documentation-only audit does not claim new test coverage.

## Latest family feedback — quality review reopened, 21 October

The family still finds Quiz Battle feedback bland and Pro Category Finder too
easy. Earlier whole-bank rewriting is completed editorial work, **not accepted
evidence that the content is interesting**. Keep the quality work open.

- [x] Pro Category Finder: exactly one correct tile among nine; prefer close
  alternatives within the same family (Wii versus Wii U/DS releases, familiar
  earlier racers versus World newcomers). Rookie/Legend rules remain unchanged.
- [x] Preserve question-history IDs and saved rounds. Separate new one-answer
  Pro scores from previous rules; do not relabel or delete old scores.
- [x] Remove repeated relationship notes from advanced Category Finder feedback.
- [x] Replace seven Quiz Battle feedback entries with concrete gameplay tricks,
  visual details and developer stories, checking their Nintendo sources. This
  includes Double Cherry regrouping, character-specific switches, Kamek/Cow,
  and Wonder's rejected live-action Mario idea. No new questions claimed.
- [x] Complete the substantive editorial feedback review across the remaining quiz bank,
  Clue Duel, Track Finder and Category Finder. Prefer one useful trick, surprising
  detail or story beyond the answer; avoid repeating the explanation, generic
  encouragement, or an unrelated fact attached merely to fill the space.
- [x] Replace dry original-release/cup-list facts where a source-supported,
  relevant gameplay detail is available. Keep original-edition precision.
- [ ] Have Dad and Blaize try the revised feedback and Pro boards. Check whether
  Legend now feels easier than Pro before changing its rules; no family verdict yet.

Verification details: [feedback review](feedback-review-2026-10-20.md).

### Agreed content direction — tips, glitches, tricks and funny discoveries

Dad's preference, confirmed 21 October: prioritise useful things to try and
amusing discoveries, not dry release/cup lists. Keep explanations brief; the
extra must add something beyond the answer. Mario Kart World comes first.

- [x] Deliver a 17-entry sourced feedback batch: World practice/navigation tips,
  funny food/UFO details, version-labelled historical glitches, Wonder and
  Odyssey secrets, 3D World/Fury tricks and Wii's playable help demonstration.
- [x] Keep answer sources and supplementary fact sources separate; show both
  where needed in solo/two-player feedback and Learning Zone cards. Carry extra
  sources into Clue Match Up and Match & Hunt spotlight feedback.
- [x] Preserve existing question IDs, answer keys, levels, history and scoring.
  Existing glitch questions remain Legend. Never present a patched glitch as
  a currently working trick; every historical-glitch extra names its fix version.
- [x] Extend this approach beyond the 17-entry batch and previous seven revisions;
  the whole-bank review and 29 October expansion cover independent Clue Duel and
  Track Finder content too. Semantic extra-history links avoid repeating the same tip.
- [ ] Family-vet these examples in real play before claiming editorial acceptance.
- [x] Release verification: a fresh `npm run test:all` passed all 200 tests
  (163 Chromium, 37 WebKit), content audit, TypeScript and production/PWA build
  before the requested commit/push on 21 October.
- [ ] Investigate the intermittent Windows WebKit setup-click timeout if it
  recurs. The prior 199/200 run and three isolated passes remain recorded; the
  clean full rerun does not establish a root-cause fix.

## Goal and boundaries

Build a game Dad and Blaize want to play again, comfortably on an iPhone.
Blaize is eight and reads at approximately an 11–12-year-old level: use short,
clear wording and interesting knowledge, not baby language. Do not assume the
parent knows more. Extend that clarity to newcomers and accessible play.

- Mario games only, including Mario Kart, platformers, Party, sports, RPGs and
  Luigi's Mansion. Hardware and crossover characters belong only in Mario context.
- Mario Kart World is the family's most-played game and highest content priority.
  Next: Wonder, Odyssey, 3D World, New Super Mario Bros. Wii, some Bowser's Fury
  and original SMB. CTGP and Retro Rewind facts need separate labels and sources.
- Favourite modes: Game Order, Match & Hunt, Quiz Battle and Clue Duel.
- Preserve the artwork, Shroomer, seven-mode structure and short interface.
  No new topic-button row, repeated tutorials, routine handover/reveal clicks,
  hidden bot results, or hard-to-distinguish track scenery in picture matching.
- No new modes, unrelated Nintendo franchises, accounts/cloud sync, adverts,
  pressure-based daily rewards, monetisation, app-store packaging or engine rewrite
  in this milestone. Local backup and offline/PWA reliability remain in scope.
- Public name/branding, inherited licence and asset-permission review remain a
  separate public-release consideration; source links do not establish permission.

## Verified starting point — preserve completed work

Release **00ada4a**: 142 local browser tests, content/rules audit and production/PWA
build passed. [GitHub tests and deployment passed](https://github.com/Swon404/MarioTriviaQuiz/actions/runs/39153511306).
The audit inspected source and phone-sized screenshots, **not a physical iPhone
or family playtest**. Documentation updates do not constitute a new app release.

| Area | Current local coverage (29 October) |
| --- | --- |
| Quiz Battle / Learning Zone | 252 reviewed questions/cards, 240 distinct facts; 90 Rookie / 87 Pro / 75 Legend records |
| Clue Match Up | 125 dedicated clues; two standalone boards, one per player in new Championships |
| Clue Duel | 66 subjects: 20 characters/enemies, 22 tracks, 16 items, eight places |
| Track Finder | 48 MK8 Deluxe DLC and ten World courses; 33 cup/origin/feature tasks |
| Game Order | 30 titles; documented original US release chronology |
| Match & Hunt | 41 picture/name pairs, including Goomba; track-scenery pairs excluded |
| Category Finder | 60 tiles; five basic groups and eleven advanced relationships |

- [x] All seven modes support solo, two players and Shroomer; Championship comes first.
- [x] Remembered settings, collapsed setup, editable names, Quick/Standard/Epic formats.
- [x] Active-player display and automatic, visible Shroomer answers/swaps/flips.
- [x] Game Order 4/6/8 tiles, unlimited checks, years hidden until solved, defined hints/penalties.
- [x] Shared Hunt and private timed turns; matching countdowns and three private rounds per player.
- [x] Preparation excluded from timed play; immediate records and configuration-specific human Top 5 tables.
- [x] Same-board replays show selections, targets and colours with a continuous clock and simple controls.
- [x] Restart/practice rules, exit confirmation, same-device recovery and lifetime-progress protection.
- [x] Unseen-first history, shared Quiz/matching knowledge, and other mode histories.
- [x] Phone action bars, focus/scroll resets, stable retry feedback and image-name failure fallbacks.
- [x] Comparable score groups, both-player Championship ranking, legacy history separation and cleanup Undo.
- [x] Simple points: 1 per correct answer or clue/untimed Hunt pair; no target/streak bonus.
- [x] Solo timed completion earns 1; competitive timed winner earns 1, exact tie earns 1 each.
- [x] Timed awards appear after the second result, with no duplicate award on Next; old results stay separate.
- [x] Original-question editorial review, first favourite-game expansion and advanced Category Finder improvements.

## 19 October reliability batch — local, not released

- Added a WebKit iPhone-profile project reusing 37 existing checks across phone
  layouts, countdowns, recovery, Championship scoring and shared-board replays.
  GitHub CI now installs both Chromium and WebKit; screenshots are project-isolated.
- WebKit screenshots exposed native controls falling back to a serif font. Controls
  now inherit the game's font, with assertions for all seven setup/play screens.
- Replay checks exposed a scrollbar consuming board width. The dialog now compensates
  within its viewport limit. Tests wait for the initial board and assert each replay
  frame after advancing the virtual clock, retaining exact live/replay comparisons.
- Verification is **not release-green**. Two complete `test:all` runs each finished
  178/179: the first timed out waiting for Resume in the WebKit Championship scoring
  test (then passed three unchanged isolated repetitions); the second passed all
  37 WebKit tests but timed out awaiting 32 cards after the Chromium settings/reload
  countdown. Both failure snapshots showed the awaited UI subsequently rendered.
  This suggests timing instability, not proof of its cause. Do not weaken assertions
  or publish on the strength of subset passes. Next: stabilise/reproduce those waits
  and obtain a clean full gate. No timeout limits or scoring rules were changed.
- The question audit and a separate `npm run build` passed, including TypeScript
  and PWA generation. Whitespace checks passed. Neither substitutes for the outstanding
  clean full-suite run; physical-device validation and GitHub publication remain pending.
- This does not complete real-iPhone, Home Screen, family acceptance or remaining
  accessibility checks. The new project and browser fixes are local, not released.

## 20 October feedback refresh — local, not released

- [x] Rewrite 18 favourite-game explanations and fun facts using official Nintendo
  sources: World, Wii, Odyssey and Wonder. Explain a mechanic or consequence, then
  offer a useful trick or surprising detail; avoid padding and baby language.
- [x] Add checks for concise, distinct facts and the visible feedback, read-aloud,
  Learning Zone and rewind paths. See the [editorial review](feedback-review-2026-10-20.md).
- [x] Apply this standard to the remaining 173 quiz records and six rotating
  character-fact pools. All 191 quiz explanations/facts have now been refreshed.
  Prompts, answer choices, correct answers, difficulty and history IDs are unchanged.
- [x] Apply the same editorial treatment to all 28 Clue Duel subjects and all
  23 Track Finder tasks (12 cup, 7 system, 4 feature). Explain the identifying
  clues, use concrete cup lineups and original-system examples, and keep copy short.
  Clues, choices, correct targets and source links are unchanged. These records
  are separate from the 191-question quiz count, not new questions.
- Four focused checks passed: unchanged answer/clue snapshots, correct and wrong
  Clue Duel feedback with speech, and all three Track Finder task types with
  rewind and phone overflow checks. Phone screenshots inspected. Final `test:all`
  passed: **192/192** tests (155 Chromium, 37 WebKit), content/rules audit and
  production/PWA build. Whitespace checks passed. Changes remain local; no commit
  or push requested. Prior WebKit flakiness did not recur but is not claimed fixed.
- [x] Review Category Finder's independent relationship notes and matching-specific
  feedback presentation for repeated text; both already inherit refreshed shared
  quiz copy where used. Do not count this editorial work as content expansion.
- [ ] Ask Dad and Blaize which facts actually taught them something or made them
  want to try a move. Automated checks cannot establish whether writing is fun.
- These are improvements to existing records, not 18 new facts: totals remain
  191 questions / 180 distinct facts. Answer choices and scoring are unchanged.
- Verification: content audit passed (191 questions / 900 generated quizzes),
  both new feedback tests passed, and phone screenshot inspected. Full `test:all`
  finished **180/181**: all 144 Chromium checks and 36/37 WebKit checks passed.
  WebKit timed-Hunt setup timed out clicking timer On before play started; trace
  shows the button resolved but click readiness did not complete. Cause unconfirmed.
  A repeated settings test also failed once at Start (5/6 passed), although that
  test passed in the full run. The countdown itself now uses the test clock.
  Keep the WebKit click-instability investigation open; do not claim release-green.
  Separate production build passed, including TypeScript and PWA generation;
  whitespace checks passed. No commit, push or GitHub deployment this batch.
- [x] Fix singular point labels spotted in the phone screenshot ("1 points",
  "+1 points") without changing scoring.
- Whole-bank follow-through: content audit and 11 focused feedback/fact-pool checks
  passed. The final `npm run test:all` passed: **188/188** browser checks
  (151 Chromium + 37 WebKit), content/rules audit and production/PWA build.
  Whitespace checks passed. This is the latest local verification, superseding
  the failed runs above; no commit, push or deployment was requested this turn.
  Earlier intermittent WebKit click instability remains tracked: one clean run
  does not establish its cause or prove it fixed. Real-iPhone/family acceptance
  still requires playtesting, not just browser emulation.

## 1. Make Championship fair and understandable

- [x] Compare implemented scoring opportunities across every game and Championship size
  in the [22 October audit](championship-scoring-audit-2026-10-22.md).
  Concrete concern: Quick Rookie Quiz offers 3 answer points, while two Clue Match
  boards offer 8 pair points. Simple arithmetic does not ensure equal game influence.
- [ ] Observe actual game contributions in family play; report evidence before changing rules.
- [x] **Decision received 29 October:** each competitive game win earns one
  Championship point, a draw one each. Preserve raw points for lifetime progress.
  Also approved: one matching board per player in new Championships; old saves
  retain two. No other board sizes or round counts changed.
- [x] Make available points and the winner/draw explanation clear with minimal text.
- [x] Audit comparable Order work, Hunt goals/unlocks, distinct questions where intended,
  three-round timed turns, carried totals and documented draws/tiebreakers.
- [x] Test every mode entering/leaving Championship in Quick/Standard/Epic solo
  sequences with reloads in each leg. Retain competitive carry/tie, visible Shroomer
  and pending-bot cancellation checks. Physical interruption acceptance remains below.
- [ ] Playtest difficulty with both humans; calibrate Shroomer accuracy, memory and pace
  from observed runs, with no hidden-information advantage in memory games.
- [x] **Decision received:** one competitive attempt, implemented for new competition.
  Solo learning retries and old checkpoints remain intact. Handicaps, per-player
  competitive levels have not been approved or changed. Weighting is approved above.

Acceptance: both players can explain who won and why; totals match the recorded rules;
both find a satisfying challenge and enjoy close games. No silent rebalancing.

## 2. Expand the knowledge the family actually enjoys

- [x] Add reviewed batches of approximately 20 distinct facts, across levels and subjects.
  Reach about 240 distinct reviewed facts (now 240), then assess variety before
  setting another count target. Rewordings and matching versions are not new facts.
- [x] Prioritise World courses, landmarks, racers, items and gameplay; then the other
  confirmed favourites. Expand Party/sports/RPG/Luigi's Mansion after those favourites.
- [x] Cover decisions, powers, enemies, bosses, worlds, secrets, collectibles and development
  details—not mainly release dates, consoles or cups. Keep patch trivia on Legend.
- [x] Use believable comparable distractors, no joke answers or name giveaways, and
  explicit game/edition context wherever rules differ.
- [x] Preserve useful explanations: usually two short how/why sentences and one relevant
  fun fact. Check every question, choice, answer, explanation, fact and source together.
- [x] Expand subject-specific fun-fact pools beyond the six-question pilot; remember exposure
  across games and omit an exhausted extra fact rather than immediately repeating it.
- [x] Finish reviewed semantic history links across Quiz, matching, Clue Duel and Finder tasks.
  Revealed feedback counts as exposure; unrelated facts about one character are not duplicates.
- [x] Maintain a game/subject/difficulty/source/knowledge-ID coverage register and test pool
  capacity for the longest supported sessions. Keep exact edition and review dates.
- [x] Grow Learning Zone with reviewed content; check search, sources, readable context
  and the separate track guide as the catalogue expands.

Acceptance: every enabled record is reviewed; unseen eligible knowledge takes priority;
review labels are honest; recent sessions feel varied to both players, not just larger by count.

## 3. Finish each mode's strengths

| Mode | Remaining work and acceptance |
| --- | --- |
| Quiz Battle | Expanded to 240 distinct facts with reviewed distractors and extras. One competitive attempt is approved and implemented; solo retries stay. Family-calibrate levels and judge whether wrong answers teach something interesting. |
| Game Order | Expanded to 30 sourced US releases. Eight tiles, long names, equal swap work, hidden years, check penalties and old-rule recovery checked. Family-check readability and challenge. |
| Track Finder | Ten World courses added through landmarks, hazards and routes; all 48 Booster courses retained. Rookie avoids cup/origin trivia. Valid visible answers and feedback audited. Family recognition remains; MK8 Deluxe base courses stay in the later backlog. |
| Clue Match Up | All 125 clues reviewed; ambiguous descriptions and equivalent answer labels corrected. Two standalone boards; one per player in new Championships. Compact layout and stable feedback retained. Family-check clarity and challenge. |
| Match & Hunt | Automated target/unlock, rapid-flip, image fallback and 16/20-pair checks pass. Enlarged text gets wider tiles; normal text keeps four columns at 390px. Family-check recognition of all 41 pairs and Shroomer's pace. No track-scenery pictures. |
| Clue Duel | Expanded to 66 five-clue subjects, including World tracks/items and Mario enemies, powers and places. Compatible choices, progressive clues, bonus turns and feedback audited. Family-check early-clue fairness and difficulty. |
| Category Finder | Expanded to 60 tiles within the existing layout; original-release memberships and near misses checked. Pro retains exactly one correct choice. Family judgement of Pro/Legend difficulty remains. |

## 4. Prove the phone experience and reliability

- [ ] Complete real iPhone testing in Safari and Home Screen mode: first/repeat load,
  portrait/rotation, browser bars/safe areas, larger text, voice/silent play, lock,
  app switching, reload and offline revisit. Check all modes and subsequent goes.
- [x] Add automated Safari/WebKit coverage alongside Chromium: the latest release
  includes 55 WebKit checks. This supplements rather than replaces physical-device
  testing; the intermittent setup-click investigation remains open above.
- [ ] Test accidental/rapid taps on answers, Check, Next, restart, exit, replay and settings.
  Add guards where needed: no duplicate points, skipped rounds or stale bot callbacks.
  Automated evidence covers duplicate answer/advance, rapid matching, stale saved
  completions, exit cancellation, restarted bot callbacks and replay Start/Stop.
  Complete the physical touch sweep across all listed controls during acceptance.
- [x] Complete automated long-name/clue, 8-tile Order, 16/20-pair Hunt and Legend
  layout checks. Inspect phone screenshots; enlarged matching text uses wider tiles
  and all 41 labels fit. Physical browser-bar/rotation acceptance remains open.
- [ ] Measure cold-load image behaviour on the phone before further resizing artwork.
  All revealed cards need ready, recognisable artwork or a readable privacy-safe fallback.
- [ ] Check touch-target spacing, keyboard focus, screen-reader labels, ticks/text as well
  as colour, reduced motion and voice cancellation. No hidden-answer speech or sound-only turns.
  Automated evidence covers control sizes, keyboard reveal, focus reset, hidden-card
  accessible names, revealed-only speech and reduced motion. Source review confirms
  speech cancellation on screen/round changes and exit; physical VoiceOver/audio remain.
- [x] Verify interruption timing in automated recovery/countdown checks: running timers include time away, completed times freeze,
  preparation resumes safely and restarted/practice attempts cannot replace ranked records.
- [ ] Physically check both replay types: board proportions, target, selections, continuous
  clock, frozen Stop/final time, simple controls and unchanged live scores. Do not rebuild them.
- [x] Validate production-worker updates during active sessions, including another tab
  activating an update. Safe-screen prompts, visible build and Home Screen icons added;
  automated offline recovery and storage failures checked. Physical Home Screen remains open.
- [x] Keep help optional and concise for newcomers, reachable without adding repeated panels.
- [x] Maintain CI release checks and browser compatibility data; production-worker checks
  now run in the full gate. Actual GitHub deployment and device acceptance remain separate.

Acceptance: start, play three consecutive rounds, rewind where allowed, view replay
and exit without assistance; no obscured controls or mistaken turn. Record device,
iOS/browser and settings so each failure can become a regression test.

## 5. Reward return visits and protect progress

- [ ] Recalibrate rank/milestone pacing after the simple-points change; review 500/2,000-point
  milestones against real session earnings. Preserve historical progress and achievements;
  obtain agreement on new thresholds, with no unapproved bonus currency or multipliers.
- [x] Show useful personal-best improvements only against the same rules/configuration;
  keep bot and practice records separate.
- [x] Prefer unseen eligible material while retaining preferred settings; no extra reward popups.
  Family judgement of variety remains open.
- [x] Manual progress export/import, not accounts or cloud sync. Define
  scope and safe merge/restore behaviour first; validate malformed files, preserve current
  progress on failure and explain that existing recovery is only on this device.
- [x] Keep full-storage warnings and cleanup/Undo; remove silent ordinary-result and
  Championship caps, preserve older timed bests/replays, and check Learning Zone search.
  Family browsing acceptance and the reported restart score loss remain unresolved.

## 6. Family acceptance — the actual 10/10 decision

- [x] Confirm favourite games, editions and priority modes; recorded in this plan.
- [ ] Ask each player what is too easy, hard or annoying; observe sensory preferences rather
  than assuming them. Include a newcomer usability check for broader-audience clarity.
- [ ] Run three short physical-phone sessions: two-player favourites; a Championship including
  timed play; Shroomer plus replay. Cover other modes in short follow-ups, not an exhausting audit.
- [ ] Record needless taps, confusing results, repeats, small text, unclear pictures and waiting.
  Ask each player separately what they would remove and what made them want another go.
- [ ] Fix repeated pain points, add targeted regression tests and retest with the family.
- [ ] Require zero known score-loss, missing-target, stuck-turn, skipped-round or hidden-answer bugs.
- [ ] Both players can play independently, find appropriate challenge, learn interesting facts
  and voluntarily choose another game. Their judgement—not a test count—defines success.
- [ ] After final app/test/config/asset edits run `npm run test:all`, then whitespace checks.
  For requested pushes verify the exact commit's GitHub tests AND deployment. Documentation-only
  changes need whitespace checks; do not claim another gameplay validation from those checks.

## Delivery order and decisions

1. Fix any blocking phone/data/turn issue first; complete scoring-opportunity evidence and
   ask for the Championship/retry decisions before changing approved rules.
2. World-first reviewed content batches and World Track Finder / Clue Duel improvements.
3. Remaining mode polish, history links, Shroomer calibration and physical/Safari checks.
4. Progression pacing and an agreed backup scope, then family acceptance and verified release.

Work in small batches: implementation, tests, relevant phone evidence, plan update.
Do not mark physical tests complete using emulation or reinstate completed features as tasks.

## Carry-forward check against the previous roadmap

| Previous workstream | Destination here |
| --- | --- |
| Release snapshots and completed scoreboard/replay/scoring work | Verified baseline; historical details retained in old roadmap |
| Priority 1: iPhone, rapid taps, readability, images, accessibility, timers | Section 4; score integrity also section 1 |
| Priority 2: favourite games, 240 facts, editorial quality, fact pools/history/capacity | Section 2; confirmed preferences in Goal |
| Priority 3: all seven mode-specific tasks | Section 3, updated counts; World supersedes MK8-first ordering, not the MK8 backlog |
| Priority 4: both-player difficulty, bot fairness, Championship opportunities/sequences | Section 1 and family acceptance |
| Priority 5: learning, comparable PBs, physical replays, remembered fresh sessions | Sections 2, 4 and 5 |
| Family acceptance, regression/release gates and scope exclusions | Section 6 and Goal; no outstanding acceptance gate removed |
| New audit additions | Explicit scoring example, WebKit/update checks, progression recalibration, optional backup and retry decision |

The original source audit and content-review documents remain supporting evidence.
Older unchecked historical boxes are not revived if the previous roadmap already
records their implementation as complete. No unfinished workstream from that roadmap
is discarded by this consolidation.
