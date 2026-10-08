# Mario family experience — active plan

Reviewed against the working code on **4 October 2026**. This replaces the duplicated audit/task lists previously in this file. The earlier Elemental audit is historical reference, not a second active backlog.

## Remaining-work summary — 4 October 2026

This is a quick overview of the detailed checklist below, not a separate backlog. **7 October priority update: iPhone readability and the complete next-go loop come first**, followed by content quality and variety, not more game modes.

- [ ] Review the remaining **94 of 138 original questions** for accuracy, wording giveaways, plausible choices and useful explanations. Forty-four are reviewed.
- [ ] Expand the genuinely new, reviewed question batch from **28 to roughly 60**, covering a wider range of subjects without filler.
- [ ] Expand relevant fun-fact pools: six Quiz Battle questions now have a reviewed pilot, with within-quiz selection protection. Cross-game fact history and the rest of the bank remain outstanding.
- [ ] Finish linking overlapping knowledge across Clue Duel and Finder modes, building on the implemented quiz/matching history protection.
- [ ] Broaden Track Finder with landmark/gameplay questions, level-appropriate knowledge and tracks beyond the current 48-course selection.
- [ ] Improve Clue Duel openings and plausible choices; review Clue Match Up for ambiguity and harder same-type alternatives.
- [ ] Continue tidying Match & Hunt target/turn information. Visible private timed matching is implemented for Shroomer; further family readability feedback remains.
- [ ] Test more championship combinations and interrupted bot turns, including restart, rewind, Next and storage failures.
- [ ] Test on physical iPhone and Android devices: voice, larger text, backgrounding and returning to play. Gather both players' fairness/readability feedback; these require devices and family input.

Already implemented and tested: remembered settings, same-device reload recovery, lifetime progress, timed leaderboards, replays and substantial repetition protection. Broader validation remains as listed below. These changes are not necessarily committed or deployed.

## Shroomer and matching update — 4 October 2026

- [x] Remove all nine track scenery cards from new Match & Hunt boards, replacing them with nine distinctive character/racer images. Keep the 40-pair catalogue and existing board sizes; keep Track Finder and quiz questions unchanged. Retain old images for historical replays and let invalid saved Hunt target choices fall back to a valid current target.
- [x] Follow-up: replace the rejected hand-drawn matching icons with 38 web-sourced images, including real console photos, character/item art, course screenshots and cup emblems. Keep source-file links in `matching-artwork-sources.md` and retain old SVGs for existing replays. Grand Prix/Time Trials still use trophy/stopwatch symbols; Shroomer's portrait is unchanged.
- [x] Rename the live computer UI to Shroomer and replace the robot portrait with a smiling red mushroom, white spots and a face.
- [x] Add recognisable locally drawn character/power-up SVGs to Match & Hunt, replacing the misleading generic images. This user-requested icon refresh supersedes the earlier generic-art-only decision; it is not a rights-clearance claim.
- [x] Make shared-board versus separate-timed-turn selection explicit. Preserve three private rounds per player, full-board Time Trial via All, Hunt targets/unlock rules and distinct boards.
- [x] Show actual private matching moves using observed-card memory, with real elapsed time rather than a generated result. Exclude computer times from human records.
- [x] Verify timed Hunt completion, Time Trial flips, restart cancellation, reload continuation and no stale moves after Next. Game Order's simulated computer turn is unchanged; this implementation concerns Match & Hunt.
- [x] Content/rules audit passed. Full browser run: 99/100 passed, with one obsolete robot-description assertion; after updating it, all 29 affected game/character tests passed. The earlier focused matching/parity/recovery run passed 38 tests. Inspected Shroomer's hub portrait and the rendered icon contact sheet. Production build and whitespace checks passed.

## Keep these decisions

- Seven existing games, the current backdrop, mixed Mario/Kart content by default and Elemental-style navigation. No new modes or topic-button row in this work.
- Clear English appropriate to the son's reported **11–12-year reading level**, with proper gaming vocabulary and challenging specialist knowledge. Do not equate age eight with beginner knowledge.
- Championship totals remain points earned in each game. Existing retries, board-size choices and Quick/Standard/Epic lengths remain unchanged.
- Individual turns, except the intentionally shared Clue Duel subject and relaxed Hunt board. Timed Hunt/Time Trial have three rounds each.
- Implemented does not mean published: current changes remain local until committed and deployed.

## Verified complete

### Navigation and rules

- [x] Championship first; setup choices remembered locally.
- [x] Solo, two-player and Mushbot formats for all seven games.
- [x] Alternating championship questions/boards with separate generated pools; live game and championship totals.
- [x] Clue Duel passes clues/turns and gives the opponent the Elemental-style bonus chance.
- [x] Shared Hunt keeps a turn on a match and passes on a miss; timed matching alternates three private boards per player.
- [x] Game Order: neutral tiles, hidden years until solved, unlimited checks, difficulty-based arrows/colours, selectable tiles and immediately saved configuration-specific times.
- [x] Game Order tries varied all-misplaced shuffles before a rotation fallback.
- [x] Track Finder: 4/6/9 tiles, every valid tile accepted, explicit success/failure.

### First experience-improvement batch

- [x] Different matching pairs no longer share identical assets. Peach is a name card, Boo Cinema has a cinema-screen drawing, Crown City keeps its crown. Visual identity uniqueness is audited.
- [x] **105 dedicated matching clues**, adapted from existing sourced questions—not 105 new facts. Never borrow harder questions to fill a board. The history continuation now prefers unseen eligible facts, then the selected level among equally fresh candidates.
- [x] Matching text stays at least 16 px in the tested phone layout; selected clues can be read aloud.
- [x] Category Finder retains stable consecutive windows without repeating category columns. Arbitrary visible numbers are hidden; feedback uses labels/ticks as well as colour.
- [x] Shared-Hunt Mushbot uses observed-card memory and sequential visible flips. Restart clears memory, resets its choice sequence and cancels pending flips.
- [x] Timed Mushbot estimates depend on the relevant board/goal and difficulty. They are explicitly labelled simulated; full animated private timed runs are still unfinished.
- [x] Clue Duel reads revealed clues and choices without leaking hidden clues.

### Current continuation: reduce Quiz Battle repetition

- [x] Per-player local history records facts actually displayed, not hidden handovers or future generated rounds.
- [x] Both humans' histories inform shared-screen quizzes; solo/Mushbot uses the human's history.
- [x] Solo, versus and championship quizzes prefer unseen eligible facts before reviewing older ones.
- [x] Repeated questions carry a clear review label. Pool exhaustion does not prevent play.
- [x] Quiz Battle and Clue Match Up avoid facts already shown in either mode. Clue Duel and Track Finder now also have their own challenge histories; semantic links between these challenges and individual quiz facts remain incomplete.
- [x] Four known pairs of reworded questions now share knowledge IDs; duplicate knowledge cannot appear twice in one quiz. The full semantic content audit remains unfinished.
- [x] History survives reload, normalises player names, tolerates corrupt/unavailable storage and retains up to 1,000 fact IDs per player.

## Continuation progress

### Track Finder continuation

- [x] 23 distinct tasks: 12 cups, seven original consoles and four course-feature clues. Each normal session mixes all three kinds without repeating a task.
- [x] Shuffled boards with one valid choice on Rookie and up to two on Pro/Legend, plus distractors. Every valid displayed choice is accepted; tile counts stay 4/6/9.
- [x] Origin questions hide console prefixes. Both Rainbow Road variants are excluded from these questions because their unprefixed names are ambiguous.
- [x] Generalised feedback and championship/Mushbot answer handling for all question types.
- [x] Track tiles use at least 16 px text on phones; checked all three task types at a 390 px viewport without horizontal overflow.
- [x] Sources: Nintendo's Booster Course Pass course list, Wave 3 course descriptions and Wave 5 bathroom-course article, reviewed on 4 October. This is still the 48-course DLC catalogue, not all Mario Kart tracks.
- [x] Rewrote `expanded-22` frozen-dessert giveaway and `expanded-23` secret-hideout giveaway as debut/route questions, with matching clues updated too. New knowledge IDs prevent old name-question history from hiding these rewritten facts.
- [x] Replaced Rookie patch-note recall (`expanded-26`/`expanded-27`) with P Switch missions and Rewind gameplay in Mario Kart World. Both receive new knowledge IDs; advanced patch questions still need a version-specific review.

### Clue Duel and editorial continuation

- [x] Expanded Clue Duel from 16 to 24 subjects: 12 characters and 12 tracks. Added Waluigi, Bowser Jr., Donkey Kong, Boo, Peach Gardens, Boo Lake, Merry Mountain and Rock Rock Mountain.
- [x] New track clues include scenery, obstacles and route features, not just cup order. Five clues, existing choice counts, scoring and alternating-turn rules are unchanged.
- [x] Corrected the Waluigi Pinball clue: Waluigi claims Luigi, not Mario, as his rival.
- [x] Updated the audit to allow different names with the same initial; the UI independently labels choices A–H. Exact-name browser selection distinguishes Bowser from Bowser Jr.
- [x] Choice selection now prefers editorially related characters/tracks, with random ordering among equal matches. Audits exercise all 24 subjects at all three levels and check that stronger alternatives are not omitted in favour of weaker ones.
- [x] Solo Clue Duel remembers all rejected guesses in the current round, disables and marks them, and clears them on rewind/Next. Two-player bonus-turn rules remain unchanged.
- [x] Removed the old six-glitch-question quota; Rookie content is explicitly checked to exclude patch-note trivia. That batch replaced questions without changing the then-138-record bank; the later gameplay pilot expands it below.

The P Switch/Rewind replacements were checked against [Nintendo's Mario Kart World Direct overview](https://www.nintendo.com/us/whatsnew/mario-kart-world-direct-revs-up-new-details-on-the-biggest-mario-kart-ever-coming-to-nintendo-switch-2-at-launch/). Related-choice groups are editorial selection aids, not a claim that every early clue fits every offered answer.

- [ ] Older repetitive openings and distractor compatibility still need review. This is an initial content batch, not completion of the full 138-question audit or the new-facts pilot.

Sources reviewed on 4 October: [Nintendo character profiles](https://www.nintendo.com/en-ca/explore/characters/mario/friends/), [Nintendo Wave 3 course descriptions](https://www.nintendo.com/us/whatsnew/mario-kart-8-deluxe-booster-course-pass-wave-3-brings-merry-mountain-mayhem-with-eight-additional-courses-on-dec-7/), [Nintendo Wave 2 announcement](https://www.nintendo.com/us/whatsnew/mario-kart-8-deluxe-booster-course-pass-wave-2-approaches-the-starting-line-on-aug-4/) and [Apple's Ninja Tour feature](https://apps.apple.com/at/story/id1555639062?l=en-GB). The two rewritten quiz records retain their record IDs but version their knowledge IDs.

### Gameplay content pilot

- [x] Added 12 new tested facts: six Mario and six Kart, with two per topic/level. The quiz bank is now 150 records.
- [x] Added stable descriptive IDs, source-review metadata and a [record-by-record review register](gameplay-content-review-2026-10-04.md).
- [x] Reworked Waluigi Pinball's opening clues and Maple Treeway's clue progression around course features. Other repetitive openings remain to review.
- [x] Updated pool-exhaustion tests to derive available facts from the bank rather than hard-coding the previous pool size.
- [ ] Continue the roughly 60-item pilot beyond the current 28 questions; do not count earlier rewrites as new records.

## Remaining work, in order

### History continuation

- [x] Canonicalised equivalent facts in both current questions and older saved histories. Added Rewind/rivals, connecting roads and Drill ceilings links; retained distinct IDs for genuinely replaced facts. Reads do not rewrite storage; the next normal history save deduplicates aliases while preserving unrelated knowledge. Cross-mode conceptual links beyond quiz/matching remain outstanding.
- [x] Clue Duel prefers unseen subjects within its existing Mario/Kart allocation; exhausted pools revisit older subjects and show a review label.
- [x] Track Finder prefers unseen tasks within its cup/system/feature rotation, then older tasks. The four-feature pool can repeat before the larger cup pool is exhausted; retaining three task kinds is intentional.
- [x] Clue Match Up prioritises unseen eligible facts, keeps its level ceiling and unique-name rule, and labels the number of familiar matches when reuse is necessary.
- [x] Standalone two-player games combine both actual player histories, including the second generation pass used to make alternating rounds. Championship uses the same generation helpers.
- [x] Only visible rounds are recorded. A Clue Duel subject counts as started when its first clue is displayed; later clues, future rounds and handovers are not pre-recorded. Bots do not get human history profiles.
- [x] Category Finder now prefers unseen window/category combinations, keyed by board width, and labels reviews. Memory boards prefer unrevealed pairs and record only cards actually observed, including shared human viewers. Explicit chosen targets remain honoured. Semantic links beyond quiz/matching still need review.

### Lifetime progress continuation

- [x] Home-screen EP, ranks, best streak, games played and milestones use a separate compact lifetime ledger, independent of the latest 200 detailed results.
- [x] Existing results still on the device are imported automatically. Results already discarded by older versions cannot be reconstructed.
- [x] Completion IDs remain in the ledger so duplicate saves cannot award points twice, including after a result leaves the recent list. Championship summaries are not awarded again on top of saved legs.
- [x] Player 2 now receives the Perfect Game milestone from shared two-player results when appropriate.
- [x] Lifetime data is written before trimming detailed history. A failed lifetime write prevents trimming, keeps recoverable awards in the current tab and displays a warning. Persistence is retried on later progress reads; closing/reloading before recovery can lose unsaved data.
- [x] Damaged lifetime storage is retained rather than silently overwritten. Available detailed results remain a fallback; recovery beyond those records needs investigation.
- [ ] The ledger is compact, not unlimited: browser storage limits and clearing site data still apply. Cross-device accounts/backups remain outside this batch.

### Learning and navigation continuation

- [x] Replace empty Learning Zone placeholders with 12 source-checked pilot cards, searchable by wording and filterable by Mario/Kart. Keep the separate 48-track guide.
- [x] Link reviewed quiz feedback to an expandable card without navigating away from the current round. Older, unaudited records are not presented as reviewed cards.
- [x] Expanded Learning Zone to 19 cards as seven older records passed source review. Card eligibility now follows each question's review metadata, rather than a hard-coded pilot list.
- [x] Ask before leaving an unfinished solo, multiplayer, Mushbot or championship game. Cancel preserves the current screen; confirmed exit cancels pending pair flips and speech.
- [x] Explain Game Order's row-by-row reading order; use earlier/later wording instead of ambiguous left/right-only hints.
- [x] Same-device reload recovery now covers all seven modes, settings and championship state, with a Home-screen Resume offer, storage warnings and stable completion IDs. Running timers include time away. See [recovery behaviour and limits](recovery-review-2026-10-04.md).
- [ ] Expand the reviewed knowledge catalogue; verify real-device background/foreground behaviour.

### 1. Content quality and depth

- [ ] Review all 138 original quiz records: prompts, four choices, explanations, facts and supporting evidence. Forty-four records reviewed in the [original question audit](original-question-audit-2026-10-04.md); 94 remain. Reviewed records automatically enter the Learning Zone, now 72 cards including the pilot.
- [ ] Remove wording giveaways and implausible distractors; use plausible answers of the same type and specify game/version where needed.
- [ ] Finish linking reworded facts. Extend history-aware selection to matching, clues and finder tasks without starving their pools.
- [ ] Expand relevant, non-repeating fun-fact pools beyond the six-question character pilot. Explain why/how rather than echoing the answer; retain useful detail instead of imposing a rigid sentence count. Cross-game fact history remains outstanding.
- [ ] Complete the initial reviewed batch of roughly 60 genuinely new knowledge items across enemies, power-ups, locations, mechanics, consoles and track features. First 28 quiz records added; family playtesting remains pending.
- [ ] Research from official manuals, game pages and patch notes where appropriate. Store sources, game/version and review status; independently verify obscure or changing claims.
- [x] All four existing glitch questions name their fixed version and have source-review metadata. They remain outside Rookie. Apply this rule to future additions too.

The earlier 540-item ambition remains a long-term content goal, **not a quota or justification for filler**. Expand after the pilot and family play. No assumption has been made about the family's favourite titles.

### 2. Broaden the narrower modes

| Mode | Still needed |
| --- | --- |
| Quiz Battle | Editorial review, broader knowledge, better distractors and relevant fact variety. Retain the new history protection. |
| Game Order | Expanded from 11 to 22 titles using Nintendo's US history timeline. Multiplayer and championship puzzles now pair distinct titles from the same chronological neighbourhoods, with equal minimum swaps and starting correct-position counts. Familiarity with a particular title remains personal; family fairness testing is still required. |
| Track Finder | Initial console/setting/hazard batch, shuffled balanced boards and history protection are done. Add deeper landmark/gameplay tasks and level-appropriate knowledge selection. Expand beyond the 48-course Booster subset, title by title. |
| Clue Match Up | Playtest the new clues for ambiguity and trivial elimination. Improve same-type distractors at higher levels without using reading length as difficulty. |
| Match & Hunt | Family recognisability review of the new character/item icons; reduce remaining header clutter and keep target/turn clear. Shroomer's private timed play is now visible, using actual flips and elapsed time. |
| Clue Duel | Now 24 subjects, related-choice selection, rejected-guess tracking and subject history. Eight character sets and eight track sets have revised openings; every subject now has a distinct first clue. Track clues use more route/scenery details, with stronger hints later. A clue-by-clue distractor plausibility review and family difficulty testing remain unfinished. |
| Category Finder | Expanded to 46 entities and nine groups. Pro/Legend add original-platform and pre-2000 questions; shared membership checks accept every valid group in human scoring, bot choices and feedback. Rookie retains basic recognition. Phone text increased from roughly 11px to 14px for Legend and 16px for other boards, preserving 3×3/4×4/5×5 windows. Long names still wrap on a 360px phone; family/large-text review remains. |

### 3. Protect progress and improve replay value

- [x] Confirm exit and restore the current go after reload, preserving retries, board state, score/turn state and the Next boundary. Physical-device background/eviction verification remains in the device gate below.
- [x] Make lifetime progress independent of the capped 200-result history, with migration and duplicate-award protection.
- [x] Save timed Match & Hunt records immediately per round/configuration; exclude simulated bots from human leaderboards. Tables separate level, variant, pair count, goal, actual target, unlock threshold and ruleset. Restarted matching boards are practice; the original completion cannot be overwritten by a duplicate save.
- [x] Record and play back Game Order selections/swaps/checks and timed Match & Hunt flips/matches with the original target. Replay controls support play/pause, event stepping and restart, on round tables and High Scores. Older records have no retrospective replay; very long recordings reaching the 2,000-frame safety limit omit playback.
- [x] Add confirmed keep-best-per-settings cleanup for both timed modes. Write a backup before deleting; Undo restores removed records/replays while keeping scores earned since cleanup. Earned EP and lifetime progress are not touched.
- [x] Version timed Game Order and Match & Hunt rulesets so unlike records are not compared; explain that restarted boards are practice. Preserve legacy Order records in a separate table, and prevent duplicate IDs replacing original times.
- [x] Replace Learning Zone placeholders with reviewed, searchable cards linked from game feedback. Initial 12-card pilot is live; expand alongside the content audit.

## Removed or parked from active work

- Removed duplicate descriptions of fixed bugs and checkboxes merely saying to preserve existing behaviour. Completed work appears once above.
- Removed speculative smaller-board defaults, extra practice modes, automatic pair collapsing, parent-control filters, knowledge-age assumptions and arbitrary per-mode quantity quotas from the implementation queue.
- Championship reweighting, partial matching credit, retry reward changes and per-player competitive handicaps are **not approved changes**. Keep current rules unless the family explicitly chooses otherwise.
- Account systems, cross-device sync, chemistry collection/lab features, rebranding, app-store work and an art overhaul are outside this experience-fix batch.
- Physical-device checks and human factual review remain outstanding; automated checks are not substitutes.

## Verification

- [x] Semantic-history continuation passed the 166-question/900-generated-quiz content audit, 19 existing history browser tests and two new alias/migration regressions. Production build passed. Initial new tests had a negative-zero expectation and attempted to import a source module from the production preview; both test issues were corrected and rerun successfully. `git diff --check` passed.
- [x] First batch passed 47 browser tests, the rules/content audit and production build.
- [x] Question-history continuation passed **52 browser tests**, the expanded rules/content audit and production build on 4 October.
- [x] Track Finder continuation passed **53 browser tests**, 300 additional generated Finder sessions and the production build. The final phone-text adjustment also passed all four focused Finder browser tests and a fresh build.
- [x] Clue Duel/editorial continuation passed the expanded content audit, **53 browser tests** and production build on 4 October; `git diff --check` passed.
- [x] Related-choice/rejected-guess continuation passed the content audit (including all 24 subjects at three levels), **53 browser tests** and production build. Browser checks cover two rejected guesses staying disabled, rewind restoring both and Next clearing the state.
- [x] Twelve-question gameplay pilot passed the 150-record content audit, **56 browser tests** and production build. Three new phone tests exercise all 12 pilot records and unseen-history priority. Corrected an ambiguous Wii/Wii U test selector; the subsequent full run passed. Phone screenshot inspected; `git diff --check` passed.
- [x] Cross-game history continuation passed the content/rules audit, **61 browser tests** and production build. New tests cover fresh challenges after reload, both-player histories, hidden handovers, quiz-to-matching avoidance and labelled review fallback.
- [x] Lifetime-progress continuation passed the 150-record content/rules audit, **65 browser tests** and production build. New tests cover migration across the 200-result boundary, duplicate completions, Player 2 milestones, damaged storage and recovery after full storage. `git diff --check` passed.
- [x] Learning/navigation continuation passed the content audit, **68 browser tests** and production build. Covers searchable reviewed cards, inline feedback cards, earlier/later order hints and cancellation/confirmation of exits in three formats. One prior run had an obsolete link selector and a championship timeout; the clean rerun passed.
- [x] Timed matching continuation passed three focused browser tests covering immediate human saves, excluded bot/practice times, target/unlock grouping and idempotent completions. Included in the later full regression below.
- [x] Expanded Game Order and timed matching passed the content/rules audit, **71 browser tests** and production build. Inspected the wrapped phone board screenshot.
- [x] Replay/cleanup continuation passed the content/rules audit, **75 browser tests** and production build. Covers selected tiles and checks, correct Hunt targets, automatic playback/event stepping, confirmation/cancellation, recoverable cleanup, preserving newly earned records and refusing cleanup when a backup cannot be saved. Inspected the 360px phone replay screenshot; `git diff --check` passed.
- [x] Category/memory history continuation passed the content/rules audit, **80 browser tests** and production build. Tests cover category reloads/both-player histories and revealed-pair-only history in solo, two-player and Mushbot games. Memoised replay viewers avoid unnecessary rerenders from the live timer.
- [x] First original-question audit batch and 19-card Learning Zone passed the content/rules audit, **81 browser tests** and production build. Added a private-Mushbot finder-history test; hidden matching boards are also excluded. Corrected an exact-answer test selector that confused Game Boy with Game Boy Advance. Seven of the 138 older records are reviewed, not the whole bank.
- [ ] Complete editorial/factual review; structural assertions do not establish factual accuracy.
- [x] Second gameplay batch adds 16 new questions; 23 older release-history records also passed review. Bank: 166 questions; pilot: 28; reviewed Learning Zone: 72. Content/rules audit, 46 quiz/history browser tests and production build passed. `git diff --check` passed. Original-bank review is 44/138, still incomplete.
- [x] All-mode recovery passed the content/rules audit, **96 browser tests** and production build. Thirteen new tests cover reloads across seven modes, retries, hidden turns, Next boundaries, frozen completed times, championship leg continuity, interrupted Hunt mismatches, duplicate-award protection and damaged/full recovery storage. Fixed the initial restored-timer display and two test-only label assumptions. `git diff --check` passed.
- [x] Category continuation passed the content/rules audit, ten focused category/championship browser tests, two category tests including a new overlapping-membership regression, and production build. After phone styling refinement, the 360px Legend test passed again and its screenshot was inspected. There are now 83 browser tests. This is not physical-device or family readability validation.
- [x] Comparable Game Order pairing passed 2,700 generated-pair checks, the full 81-test browser suite and production build. Added a further passing standalone two-player handover test (82 tests now in the suite). Its initial failure was an incorrect test expectation of “Correct” rather than the existing “Solved in” message. See [fairness details](game-order-fairness-2026-10-04.md). `git diff --check` passed.
- [x] Historical-bug/character audit added 14 reviewed records and expanded Learning Zone to 33 cards. The 45-test quiz/history browser subset passed; after aligning matching clues and consolidating a duplicate Daisy fact, all 19 history tests, the content/rules audit and production build passed again. Rosalina and Daisy equivalents now share history across levels. Original-record audit is 21/138, not complete.
- [ ] Play on physical iPhone Safari and Android Chrome, including larger text, voice and background/foreground behaviour. Initial phone viewport checks are done, but are not physical-device tests.
- [ ] Exercise all modes/formats/levels and championship variants; inspect fairness, timing, repetition and controls, not just crashes.
- [ ] Test full/blocked storage, reload, rewind, Next and restart during bot animation; no duplicate awards or stale callbacks.
- [ ] Ask both players what felt unfair/confusing and whether they want another round. Record knowledge difficulty separately from reading time.

Next content batch: review the weakest existing questions and broaden Track Finder/Clue Duel. Do not restart work already checked off above.

### 5 October continuation: character clue openings

- [x] Rewrite the eight generic character openings, keeping five clues, existing scoring and related-choice selection. Delay Yoshi's distinctive colour clue until clue three. Avoid early answer-name hints.
- [x] Check revised character details against [Nintendo's character guide](https://www.nintendo.com/en-ca/explore/characters/mario/friends/); replace the failing older character-source link with this working official page.
- [x] Add audit checks for unique character openings and reject generic adventures/races/games participation openers. These structural checks do not prove difficulty or distractor plausibility.
- [x] Final `npm run test:all` passed: 166-question content/rules audit, all 101 browser tests and production/PWA build. `git diff --check` passed. Browserslist reported outdated compatibility data (non-blocking).
- [x] Rewrite repetitive track openings (6 October batch below).
- [ ] Review candidate plausibility after each clue and playtest with the family. These editorial batches do not claim the whole Clue Duel audit is finished.

### 6 October continuation: track clue variety

- [x] Revise eight track sets: Coconut Mall, Rome Avanti, Daisy Cruiser, Ninja Hideaway, Sky-High Sundae, Piranha Plant Cove, Peach Gardens and Rock Rock Mountain. Preserve five clues, answer IDs, subject history, choice counts and scoring.
- [x] Replace vague extra-course openings with route, setting or original-platform clues. Keep obvious answer-name descriptions for clue five. All 12 track opening strings are distinct; this is not a claim that every early clue has equal difficulty.
- [x] Improve feedback for Coconut Mall, Daisy Cruiser, Sky-High Sundae and Piranha Plant Cove. Replace the duplicate Ninja Hideaway and Sundae fun facts with related information not repeated in their clues.
- [x] Check additions against Nintendo's [Wii shortcut guide](https://www.nintendo.com/en-za/Support/Legacy-system/Shave-seconds-off-your-time-in-Mario-Kart-Wii-613215.html), [Ninja Tour](https://www.nintendo.com/us/whatsnew/race-under-the-cover-of-darkness-in-new-course-ninja-hideaway/), [Ocean Tour](https://www.nintendo.com/us/whatsnew/mobilenews-enjoy-maritime-mayhem-aboard-gcn-daisy-cruiser-in-the-ocean-tour/), [Exploration Tour](https://www.nintendo.com/us/whatsnew/mobilenews-discover-the-all-new-course-piranha-plant-cove-with-the-exploration-tour/), Wave 2/Wave 3 announcements and the official course listing. Historical Tour events are described in the past tense, not as currently available events.
- [x] Add track opening uniqueness, non-generic opening and exact fun-fact/clue duplication assertions. Semantic overlap still needs editorial review; these checks are not a substitute.
- [ ] Complete candidate plausibility review, particularly narrow course-origin clues with a small answer pool. No new subjects were added in this batch; quiz-bank review and expansion counts are unchanged.
- [x] Content/rules audit and separate production/PWA build passed on 6 October. Whitespace check passed.
- [x] Investigate initial release-check failures and obtain a clean full run (see timeout investigation below). Historical runs: 91 passes/ten timeouts with six workers, then 99 passes/two timeouts with two workers. Neither was counted as a full pass. No commit or push made.

### 6 October continuation: timeout investigation

- [x] Repeat both outstanding cases three times with one worker. Memory history passed all three; the championship passed once and exceeded the overall 30-second budget twice. One failure snapshot had already reached CHAMPIONSHIP COMPLETE.
- [x] Inspect the saved trace: the championship advanced through matching boards, with many successful actions taking roughly 1–2 seconds. No consistently blocked selector was identified. This supports an insufficient whole-workflow budget on this machine, not a proven game-logic fix.
- [x] Separate time budgets: 60 seconds per end-to-end test, 10 seconds per action, 30 seconds per navigation, unchanged five-second assertions and two workers. No retries, removed assertions or forced clicks were added. Game timers and scoring are unchanged.
- [x] First full run with the new workflow budget: 100 passed, including both matching regressions; one initial-page navigation exceeded the initially selected 15-second cap. Corrected that navigation budget to 30 seconds. This intermediate run was not a full pass.
- [x] Final `npm run test:all` passed on 6 October: 166-question content/rules audit, all 101 browser tests (4.3 minutes), and production/PWA build (88 precached assets). No test retries. Whitespace check passed. Browserslist's outdated compatibility-data warning remains non-blocking. This verifies the current local changes; GitHub has not run these unpushed changes.

### 6 October continuation: fun-fact pool pilot

- [x] Add question-specific pools for six Rookie character questions (two Luigi questions, Peach, Bowser, Wario and Toad): 13 pool entries, 11 distinct fact texts. Checked against [Nintendo's character guide](https://www.nintendo.com/en-ca/explore/characters/mario/friends/); question source links cover the alternatives.
- [x] Select exactly one fact when generating the quiz, prefer facts not already selected in that quiz, and preserve the chosen text in the existing round/checkpoint. This applies to solo, versus and championship Quiz Battle through their shared generator. Rewind/reload does not reroll facts. Unreviewed questions keep their existing fact.
- [x] Add selection, deterministic RNG, non-mutation, pool exhaustion, source association and browser rewind/reload regression tests. Repeats are allowed only when no unused candidate exists for the current question; this is not global semantic duplicate detection.
- [ ] Expand to other questions/modes, add per-player cross-game fact history, and review semantic overlap with other questions. This pilot adds feedback variety, not new tested knowledge: the quiz bank stays at 166 and the new-question pilot at 28.
- [ ] Full release verification for this pilot is NOT complete. Focused fact tests passed; the complete run had 102 passes and a Resume click timeout in an existing Hunt recovery test. That recovery test passed three isolated repeats unchanged. A second full attempt stalled on several unrelated clicks (including the new fact rewind check) and was stopped. No limits or assertions were relaxed, and no commit/push was made. Local execution stalls remain suspected, not proven; a clean full run is still required before publishing this pilot.
- [x] Separate production/PWA build and content audit passed; final whitespace check passed. Build reported non-blocking plugin timing and outdated Browserslist-data warnings.

### 6 October release preparation

- [x] Isolate the test server's Vite dependency cache from the interactive dev server and disable test hot reload after observing an unexpected navigation during a history assertion. This prevents that source of interference, without claiming it explains every timeout.
- [x] Replace real-time polling of Shroomer's 650 ms first-card window with a paused test clock. Assert one revealed card, restart, then advance three seconds and verify callbacks remain cancelled. Three isolated repeats passed; gameplay timing is unchanged.
- [x] Run the complete final-code local gate: content audit passed; browser result was 101 passed and two 60-second whole-test timeouts in long matching workflows (10.8 minutes total). No full local pass claimed. No additional limits were relaxed.
- [x] Confirm revision `2d157d7` on [GitHub Actions run 37515373366](https://github.com/Swon404/MarioTriviaQuiz/actions/runs/37515373366): all 103 browser tests, content audit, production build and deployment passed. This completes release verification of the fun-fact pilot above.

### 6 October continuation: timed-round countdown

- [x] Add a shared, accessible 3–2–1–Go countdown to Game Order and timed Match & Hunt (Hunt timer and Time Trial), including multiplayer/championship turns and Shroomer's timed turns. Untimed matching stays unchanged.
- [x] Keep boards hidden until Go; start stopwatch and replay capture only then. Show Go without moving the board. Cancel preparation safely; unmount cancels pending callbacks. Reload during preparation returns to Start Timer, while already-running rounds preserve their existing recovery behaviour.
- [x] Add four countdown tests covering exact timing, cancellation and reload for both games. Update existing browser workflows to wait for revealed boards; advance controlled clocks before checking Shroomer's moves. Focused nine-test run passed.
- [x] Final `npm run test:all` passed: 166-question/900-quiz/48-track content audit, all 107 browser tests (3.7 minutes), TypeScript and production/PWA build (88 precached assets). Whitespace check passed. Non-blocking Browserslist data-age warning remains. No commit or push requested in this turn.
- [ ] Consider countdowns for the optional timers in the other quiz/finder modes; this batch covers the ordering and memory-board timed events, not every optional timer.

### 7 October: iPhone play and next-go flow

Audit at 390 × 740 in Chromium phone emulation, not physical Safari: Game Order/Match & Hunt setup exceeded 1,200px; the matching board began around 379px down and Clue Duel answers around 502px. Next appeared around 766–897px in sampled quizzes and 1,400px in timed Hunt. Rules repeated on subsequent goes and navigation had no explicit scroll reset.

- [x] Add concise mode help with expandable rules. Phone play shows the question and optional How to play instead of a repeated instruction paragraph; desktop first rounds retain a short hint. Reset expanded help when changing rounds.
- [x] Put phone Next/Rewind in a fixed bottom action bar with safe-area padding and scrolling space below content. Preserve explanations, one fun fact, source links and learning cards. Move focus to the result after answering.
- [x] Reset scroll and focus for new screens, questions and player handovers. Shorten shared handover wording. Preserve hidden puzzles and timed countdowns.
- [x] Put voice beside the question, use opaque playing surfaces, tighten spacing, compact level/settings controls, enlarge buttons to at least 44 × 44 CSS pixels in sampled phone layouts, and keep the setup Start action sticky. Preserve all settings and rules; show the selected Game Order rule description.
- [x] Collapse timed leaderboards during play; open them on completion. Preserve replay access and existing saved times. Keep matching cards a stable height as they flip.
- [x] Nine focused phone checks passed: all seven setup/play screens for button sizing and horizontal overflow, three consecutive quiz questions, and two timed Hunt boards for reachable Next, scroll reset and non-repeated help.
- [x] Final `npm run test:all` passed: 166-question content/rules audit, all 116 browser tests (3.2 minutes), TypeScript and production/PWA build (88 precached assets). Whitespace check passed. Reviewed phone screenshots of Clue Duel and matching; Clue Duel answers start roughly 140px higher and matching roughly 70px higher than the audit samples. Browserslist data-age warning remains non-blocking.
- [ ] Physical iPhone Safari checks: browser bars, safe areas, larger text, voice, rotation and background/foreground. Automated phone checks are not a substitute.
- [x] Follow-up: collapsed remembered-settings summary (continuation below).
- [ ] Further merge championship score strips and add explicit rapid-double-tap protection across round transitions. These are not claimed complete by the compact-layout pass.
- [ ] Larger 16/20-pair boards and longer clues still need scrolling. Do not shrink text or remove pairs merely to force every board onto one screen; assess with the family.

No content-bank expansion or rule/scoring changes in this mobile-layout batch.

### 7 October release and compact-setup continuation

- [x] Commit and push countdown/mobile-flow work as `93e20db`. [GitHub run 37698531407](https://github.com/Swon404/MarioTriviaQuiz/actions/runs/37698531407) completed successfully: test and deploy jobs both passed. The first iPhone-layout pass is live.
- [x] Add a compact remembered-settings summary to all seven standalone modes and championship setup. Collapse controls initially on phones, keep them expanded on wider screens, and expose Change/Hide settings. Keep Start outside the collapsed panel.
- [x] Summaries update with player names, opponent, difficulty and relevant settings. Matching includes board size, goal/target, timer and unlock count; Game Order includes tile count and challenge; championship includes length and game count. No saved-setting format changes.
- [x] Verify all seven phone Start buttons are within the 390 × 740 viewport, all expanded controls remain reachable, settings survive reload, the actual matching board agrees with the summary, and championship cannot start with fewer than two games. Eleven focused phone tests passed. Inspected the compact championship screenshot.
- [x] Full final-code `npm run test:all` passed: content/rules audit, all 118 browser tests (2.8 minutes), TypeScript and production/PWA build (88 precached assets). Whitespace check passed; the existing Browserslist data-age warning is non-blocking. The compact-setup continuation is local and is not part of published `93e20db`.
