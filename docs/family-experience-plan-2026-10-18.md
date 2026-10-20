# Mushroom Power Quiz — main experience plan

Updated 20 October 2026. **This is the main plan and single active backlog.**

It combines the 18 October whole-game audit with every outstanding workstream
and acceptance check from the [previous roadmap](family-experience-roadmap-2026-10-11.md).
That roadmap and earlier plans remain historical evidence, not competing task lists.
Unchecked items below are not claimed complete merely because they have tests or
appear in this document. Proposed rule changes still require a family decision.

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

| Area | Current coverage |
| --- | --- |
| Quiz Battle / Learning Zone | 191 reviewed questions/cards, 180 distinct facts; 69 Rookie / 65 Pro / 57 Legend records |
| Clue Match Up | 108 dedicated clues derived from quiz knowledge; two boards per player |
| Clue Duel | 28 subjects: 16 characters and 12 tracks |
| Track Finder | 48 MK8 Deluxe DLC courses; 23 cup/origin/feature tasks |
| Game Order | 22 titles; documented US release chronology |
| Match & Hunt | 41 picture/name pairs, including Goomba; track-scenery pairs excluded |
| Category Finder | 52 tiles; five basic groups and eleven advanced relationships |

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
- [ ] Review Category Finder's independent relationship notes and matching-specific
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
- [ ] Fix singular point labels spotted in the phone screenshot ("1 points",
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

- [ ] Compare scoring opportunities across every selected game and Championship size.
  Concrete concern: Quick Rookie Quiz offers 3 answer points, while two Clue Match
  boards offer 8 pair points. Simple arithmetic does not ensure equal game influence.
- [ ] Observe actual game contributions in family play; report evidence before changing rules.
- [ ] **Decision required:** agree whether to equalise opportunities through board/round
  sizes or accept different game weights. Preserve one-point scoring unless explicitly changed.
  Two Clue Match rounds remain the approved rule; do not silently alter them for balance.
- [ ] Make available points and the winner/draw explanation clear with minimal text.
- [ ] Audit comparable Order work, Hunt goals/unlocks, distinct questions where intended,
  three-round timed turns, carried totals and documented draws/tiebreakers.
- [ ] Test every mode entering/leaving Championship, Quick/Standard/Epic sequences,
  reloads and interruptions during Shroomer's turn.
- [ ] Playtest difficulty with both humans; calibrate Shroomer accuracy, memory and pace
  from observed runs, with no hidden-information advantage in memory games.
- [ ] **Decision required:** competitive retries. Rookie Quiz currently offers four attempts
  for four choices. Consider a smaller allowance for competition without removing relaxed
  learning play. Handicaps, per-player competitive levels and score weighting also need approval.

Acceptance: both players can explain who won and why; totals match earned actions;
both find a satisfying challenge and enjoy close games. No silent rebalancing.

## 2. Expand the knowledge the family actually enjoys

- [ ] Add reviewed batches of approximately 20 distinct facts, across levels and subjects.
  Reach about 240 distinct reviewed facts (currently 180), then assess variety before
  setting another count target. Rewordings and matching versions are not new facts.
- [ ] Prioritise World courses, landmarks, racers, items and gameplay; then the other
  confirmed favourites. Expand Party/sports/RPG/Luigi's Mansion after those favourites.
- [ ] Cover decisions, powers, enemies, bosses, worlds, secrets, collectibles and development
  details—not mainly release dates, consoles or cups. Keep patch trivia on Legend.
- [ ] Use believable comparable distractors, no joke answers or name giveaways, and
  explicit game/edition context wherever rules differ.
- [ ] Preserve useful explanations: usually two short how/why sentences and one relevant
  fun fact. Check every question, choice, answer, explanation, fact and source together.
- [ ] Expand subject-specific fun-fact pools beyond the six-question pilot; remember exposure
  across games and omit an exhausted extra fact rather than immediately repeating it.
- [ ] Finish semantic history links across Quiz, matching, Clue Duel and Finder tasks.
  Revealed feedback counts as exposure; unrelated facts about one character are not duplicates.
- [ ] Maintain a game/subject/difficulty/source/knowledge-ID coverage register and test pool
  capacity for the longest supported sessions. Keep exact edition and review dates.
- [ ] Grow Learning Zone with reviewed content; check search, sources, readable context
  and the separate track guide as the catalogue expands.

Acceptance: every enabled record is reviewed; unseen eligible knowledge takes priority;
review labels are honest; recent sessions feel varied to both players, not just larger by count.

## 3. Finish each mode's strengths

| Mode | Remaining work and acceptance |
| --- | --- |
| Quiz Battle | Broader gameplay knowledge, believable distractors and family-calibrated levels. Wrong answers teach something; retain automatic visible Shroomer turns. Retry change is a decision in section 1, not authorised implementation. |
| Game Order | Expand the 22-title catalogue after review; preserve explicit release region and unambiguous ties. Test long names, 8 tiles, comparable opponent boards and per-level feedback. No early year leaks; show any time penalty clearly by the clock. |
| Track Finder | World first, using recognisable landmarks, hazards and routes. Retain MK8 Deluxe base-course expansion in the later backlog, then other titles with explicit supported coverage. Keep obscure cup/origin questions off beginner-heavy play; accept every valid visible answer. Explain misses with a memorable course detail and keep the guide useful. |
| Clue Match Up | Review all 108 clues for ambiguity and plausible same-kind alternatives. Shorten where useful, reduce space above the board, preserve readable text, stable feedback and two rounds. Each clue has one intended match on its board; matched/remaining tiles are obvious. |
| Match & Hunt | Family-check all 41 pairs, replacing only unrecognisable images. Verify target presence/unlocks, first-flip image readiness, rapid flips, and 16/20-pair readability. Keep Shroomer's moves visible without long dead time; no track-scenery pictures. |
| Clue Duel | Audit all 28 five-clue sequences and offered choices, then expand World content and Mario items/enemies/places with compatible prompts. Early clues fit several options, middle clues reward knowledge and final clues decide fairly. Keep guesses, bonus turns and the large Next Clue button clear. |
| Category Finder | Validate the completed Pro/Legend relationship changes with the family. Broaden useful memberships in the existing layout; every valid answer accepted and explained, every board solvable. Difficulty must not come from tiny text or obscure labels. |

## 4. Prove the phone experience and reliability

- [ ] Complete real iPhone testing in Safari and Home Screen mode: first/repeat load,
  portrait/rotation, browser bars/safe areas, larger text, voice/silent play, lock,
  app switching, reload and offline revisit. Check all modes and subsequent goes.
- [ ] Add automated Safari/WebKit coverage alongside Chromium; it supplements rather
  than replaces physical-device testing.
- [ ] Test accidental/rapid taps on answers, Check, Next, restart, exit, replay and settings.
  Add guards where needed: no duplicate points, skipped rounds or stale bot callbacks.
- [ ] Finish long-name/long-clue, 8-tile Order, 16/20-pair Hunt and Legend board layout checks.
  Prefer purposeful scrolling to tiny text; no exit/score/voice overlap or shifting buttons.
- [ ] Measure cold-load image behaviour on the phone before further resizing artwork.
  All revealed cards need ready, recognisable artwork or a readable privacy-safe fallback.
- [ ] Check touch-target spacing, keyboard focus, screen-reader labels, ticks/text as well
  as colour, reduced motion and voice cancellation. No hidden-answer speech or sound-only turns.
- [ ] Verify interruption timing: running timers include time away, completed times freeze,
  preparation resumes safely and restarted/practice attempts cannot replace ranked records.
- [ ] Physically check both replay types: board proportions, target, selections, continuous
  clock, frozen Stop/final time, simple controls and unchanged live scores. Do not rebuild them.
- [ ] Validate PWA update behaviour during active sessions; offer safe updates between games,
  a visible app version and appropriate Home Screen icons. Check offline recovery and storage failures.
- [ ] Keep help optional and concise for newcomers, reachable without adding repeated panels.
- [ ] Maintain CI dependencies/runners and release checks; address deprecation warnings without
  confusing successful deployment with untested device behaviour.

Acceptance: start, play three consecutive rounds, rewind where allowed, view replay
and exit without assistance; no obscured controls or mistaken turn. Record device,
iOS/browser and settings so each failure can become a regression test.

## 5. Reward return visits and protect progress

- [ ] Recalibrate rank/milestone pacing after the simple-points change; review 500/2,000-point
  milestones against real session earnings. Preserve historical progress and achievements;
  obtain agreement on new thresholds, with no unapproved bonus currency or multipliers.
- [ ] Show useful personal-best improvements only against the same rules/configuration;
  keep bot and practice records separate.
- [ ] Ensure fresh sessions feel fresh while retaining preferred settings; no extra reward popups.
- [ ] **New proposal:** manual progress export/import, not accounts or cloud sync. Define
  scope and safe merge/restore behaviour first; validate malformed files, preserve current
  progress on failure and explain that existing recovery is only on this device.
- [ ] Keep full-storage warnings and cleanup/Undo useful; never discard older bests or replays
  silently. Check Learning Zone remains pleasant to browse as its reviewed content grows.

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
