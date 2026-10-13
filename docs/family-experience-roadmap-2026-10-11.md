# Mario family experience: the road to a 10/10

Updated 13 October 2026. **This is the active experience and content plan.**
It supersedes the remaining-work lists in the October 2 family plan and the
original implementation plan; those documents remain historical records.

## Who this is for

Two Mario fans: a parent and an eight-year-old who reads at roughly an
11–12-year-old level. Prioritise their gaming knowledge, enjoyment and iPhone
comfort—not an assumption that a child needs easy questions or babyish wording.
Keep instructions short; make knowledge challenging without making prose hard.

**Mario games only:** Mario platformers, Mario Kart, Mario Party, Mario sports,
Paper Mario, Mario & Luigi and Luigi's Mansion. Nintendo hardware is relevant
when tied to Mario games. Do not expand into unrelated Nintendo franchises.
Existing crossover characters appearing in Mario games remain valid subjects.

“10/10” is a family playtest goal, not a score established by passing tests.
The aim is: both players want another go, understand every outcome, get a fair
challenge, discover interesting Mario details and rarely have to fight the UI.

## Verified baseline

Last verified deployment before this audit: **7d038e6**. Local full gate: **123 browser tests**,
content/rules audit and production build passed. [GitHub tests and deployment
also passed](https://github.com/Swon404/MarioTriviaQuiz/actions/runs/38294296384).
This review inspected code and test coverage; it is **not a new physical-iPhone
or family playtest**.

| Area | Current coverage, measured from code |
| --- | --- |
| Quiz Battle | 170 records, 159 distinct knowledge IDs; 61 Rookie / 58 Pro / 51 Legend records |
| Editorial/source review | All 170 reviewed: 138 original + 28 gameplay + 4 Luigi's Mansion |
| Learning Zone | 170 reviewed cards, plus the separate track guide |
| Clue Match Up | 108 dedicated clues derived from quiz knowledge, not 108 extra facts |
| Clue Duel | 24 subjects: 12 characters and 12 tracks |
| Track Finder | 48 Booster Course Pass courses; 23 tasks: cup, origin and feature questions |
| Game Order | 22 Mario titles, using the documented US release chronology |
| Match & Hunt | 40 pairs; track-scenery images excluded from new boards |
| Category Finder | 46 entries, nine groups; overlapping valid memberships supported |

Counts are not a quality rating. Rewordings, duplicated knowledge across levels
and matching versions must not be counted as genuinely new facts.

Counts above include the completed original-question audit after release 7d038e6:
five Wonder records, six Kart item records and the remaining 75 original records.
The final batch replaces giveaways, corrects matching links, preserves picture-card
identities and moves basic recognition out of Legend. Source review is complete;
broader content expansion and family difficulty calibration are not.
Physical iPhone and family acceptance checks remain outstanding.

Final local verification on 13 October 2026: `npm run test:all` passed the
content/rules audit (170 records, 900 generated quizzes), all 123 browser tests,
TypeScript and production/PWA build. Release requires the matching GitHub run's
test and deployment jobs to pass as well.

Release follow-up: the first audit push (`56214a8`) passed locally but GitHub caught
a nondeterministic history-test assumption: both Rosalina clue wordings now belong
to Rookie. The test now checks the exact four unseen canonical facts and their
stored history, rather than one particular wording. All 12 focused repeat runs
and the final complete local gate passed (123 browser tests, content audit and
production/PWA build). A successful new GitHub run is required before deployment.

### Done—do not rebuild these

- [x] Seven modes with solo, two-player and Shroomer formats; Championship first.
- [x] Remembered setup, collapsed settings, editable names and Quick/Standard/Epic championships.
- [x] Clear active-player display; automatic Shroomer turns instead of reveal buttons.
- [x] Visible Shroomer selections/swaps/flips; human timed tables exclude bot results.
- [x] Routine handover popups and repeated How to Play panels removed.
- [x] Game Order 4/6/8 tiles, unlimited checks, hidden years until solved and defined challenge feedback.
- [x] Shared Hunt and private timed turns; three private matching rounds per player.
- [x] 3–2–1–Go before timed Order and matching; preparation excluded from the timer.
- [x] Immediate timed records, Top 5 tables and dedicated High Scores page.
- [x] Order and matching replays use the actual live board components, including selections, target and colours; Start/Stop/Back controls.
- [x] Rewind/restart rules, exit confirmation, same-device reload recovery and lifetime-progress protection.
- [x] Per-player unseen-first selection; shared quiz/matching knowledge history and separate histories in other modes.
- [x] Phone action bars, scroll/focus resets, larger controls and stable matching-card sizes.
- [x] Current release passed local and GitHub verification, including deployment.

## Priority 1 — make every go comfortable and dependable

Do this before adding features. Preserve the short interface the family requested.

### Screenshot follow-up — 11 October 2026 (released in a4eb75c)

- [x] Keep timed Top 5 tables open; compact rows show rank, player, Replay and time without checks/moves clutter.
- [x] Replace visible EP terminology with points across play, results, championships and lifetime progress. Keep existing earned points and saved history unchanged: lifetime progress is the sum of game awards, not a separate currency.
- [x] Label live championship columns This game / Championship; show both players together in the game-result table, followed by the championship total.
- [x] Restrict all patch-version questions to Legend. Move two existing Wonder gameplay questions to Pro in their place; this is difficulty reclassification, not new content.
- [x] Focused phone, replay and championship tests passed (13); inspect phone scoreboard screenshot.
- [x] Final full regression gate: content/rules audit, all 122 browser tests and production/PWA build passed on 11 October 2026.
- [ ] Continue broader Mario-world question expansion and family difficulty checks; moving four records does not complete that work.

### Matching follow-up — 11 October 2026 (released in a4eb75c)

- [x] Reserve a two-line feedback area in Clue Match Up so retry messages do not move the board.
- [x] Set new Clue Match Up games to two rounds per player, including all championship lengths. Existing saved sessions retain their original boards; timed picture Match & Hunt still has three rounds.
- [x] Check packaged artwork loads and decodes; inspect its contact sheet. The cropped broken-image screenshot does not identify the failing asset or establish its original cause.
- [x] Add a readable pair-name fallback for failed images in live boards and replays; preserve hidden-card privacy. Handle already-rooted image URLs without prepending the app base twice.
- [x] Add stable-board, two-round totals and simulated-image-failure regression checks; seven focused tests passed.
- [x] Final full regression gate: content/rules audit, all 123 browser tests and production/PWA build passed. Local app started and returned HTTP 200.

- [ ] **Complete the physical iPhone check**, in Safari and Home Screen mode:
  first load, repeat visit, portrait, rotation, browser bars, safe areas, larger
  text, voice, silent play, screen lock, app switching, reload and offline revisit.
  Test all seven modes and the next go, not just the first board.
- [ ] **Test accidental and rapid taps** on answers, Check, Next, restart, exit,
  replay and settings. Add transition guards only where needed. Prove one tap
  cannot award twice, skip a question or let an old Shroomer callback change a new board.
- [ ] **Finish the space/readability pass** for long game names, 8-tile Order,
  16/20-pair matching, Legend categories and long clues. Keep normal text readable;
  allow purposeful scrolling rather than tiny text. No exit/score/voice overlaps.
- [ ] **Measure cold-load image behaviour on the real phone** before resizing
  assets further. Every revealed card must have its image ready; preserve recognisability.
- [ ] **Check accessibility without extra clutter:** visible keyboard focus,
  labels/ticks as well as colour, reduced motion, reliable voice cancellation,
  no hidden-answer speech, and no dependence on sound to know whose turn it is.
- [ ] **Check timer fairness after interruption.** Verify the documented behaviour
  (running timers include time away), completed times freeze, preparation resumes
  safely and practice/restarted attempts cannot replace competitive records.

Acceptance: both players can start, play three consecutive rounds, rewind where
allowed, view a replay and exit without help; no obscured action or mistaken
turn; rapid taps never change the number of rounds or earned points. Record
device/iOS/browser, settings and any failure so it can become a regression test.

## Priority 2 — make the Mario knowledge worth coming back for

- [x] Review four Wonder power-up records (`expanded-1`, `expanded-2`, `expanded-8`, `expanded-9`) against Nintendo's gameplay guide. Improve wording and useful feedback, preserve knowledge history, and expose reviewed Learning Zone cards. This is an editorial batch, not four new facts.
- [x] Follow-up batch: improve Dash Food, Hammer and Charge Jump choices/feedback; replace the Waluigi Pinball name giveaway with a course-feature question and matching clue. Four records source-checked; no increase to the 170-record bank.
- [x] Move four cup-location records from Pro to Legend and four broader World racing records to Pro. Pro cup questions reduced from 13 to nine; retain history and matching difficulty links. This does not complete level calibration.
- [x] Review five more Wonder records: kingdom, shared badge, Nabbit, Drill movement and local co-op. Replace the badge-name giveaway with a team-play rule; use playable-character distractors, neighbouring player counts and no pause-menu joke. Preserve existing knowledge history except the genuinely replaced badge fact; update matching clues. Source details are in original-question audit batch 6.
- [x] Review six MK8 Deluxe item records: Mushroom, Blooper, Super Horn, Coin, Feather and Piranha Plant. Ask for Coin's count and the plant's movement effect; remove Horn's sound giveaway and unrelated item facts. Preserve fact history, synchronise matching clues and decouple the two effect-answer records from picture-card names. Original-question audit batch 7 records source evidence and limitations.
- [x] **Finish the remaining 75-record original audit.** Check question, all four choices,
  answer, explanation, fun fact, source and edition. Replace course-name and Galaxy
  giveaways, fix World item/mode choices, retain source-supported cup facts and
  synchronise matching clues. All 170 records now have explicit review metadata;
  future additions do not inherit it. See original-question audit batch 8.
- [ ] **Ask which 3–5 Mario games each player loves/knows.** Start the next batches
  there; do not guess their favourites or add a topic-button row to the play screen.
- [ ] **Expand in reviewed batches of about 20 distinct facts**, spanning all
  levels and several subjects. First coverage milestone: approximately **240
  distinct reviewed facts** across the Mario bank, then assess repetition before
  increasing further. This replaces the old 540-record quota as the near-term goal.
- [ ] Cover gameplay decisions, power-ups, enemies, bosses, worlds, secrets,
  collectibles, characters and development details—not mainly console/date trivia.
  Broaden Mario Party, sports, RPG and Luigi's Mansion coverage after favourites.
- [ ] Make wrong choices believable and comparable: characters against characters,
  items against items, plausible actions against actions. No joke options or clues
  that expose the answer through its name. Identify the exact game when rules differ.
- [ ] Keep explanations useful: usually two short sentences explaining how or why,
  followed by one genuinely relevant fun fact. Preserve detail without fact-dumping.
- [ ] Grow question/subject-specific fun-fact pools beyond the existing six-question
  pilot. Track recently shown facts across games; if a pool runs out, omit the extra
  fact instead of immediately repeating it. No unrelated random trivia.
- [ ] Finish semantic repetition links across Quiz, matching, Clue Duel and Finder
  tasks. Showing the answer in feedback counts as exposure too. Do not treat
  unrelated facts about the same character as duplicates.
- [ ] Maintain a coverage register by game, subject, difficulty, source review and
  unique knowledge ID. Add pool-capacity tests for the longest supported sessions.

Acceptance: every enabled record is reviewed; no repeated knowledge within one
game where a fresh eligible fact exists; repeats across sessions use honest review
labels; both players report that recent sessions feel varied. Counts alone do not pass this gate.

## Priority 3 — finish each game's particular strengths

These are remaining tasks, not permission to replace existing rules or add modes.

| Game | Next improvement | Acceptance check |
| --- | --- | --- |
| Quiz Battle | Better distractors, broader gameplay knowledge and level calibration; preserve instant, visible Shroomer answers | Neither player wins mainly by spotting silly options; wrong answers teach something; no unwanted handover/reveal click |
| Game Order | Expand the 22-title catalogue after source review; keep one explicit release-region rule and unambiguous ties; verify long names and per-level feedback | Parent and child get different but comparable boards; no years/hints leak too early; sorting remains a timed challenge |
| Track Finder | Add the 48 base MK8 Deluxe courses to the existing 48 DLC courses, then expand other Mario Kart games title by title; add landmarks, hazards and route questions | Complete supported title coverage with correct edition/cup/origin; fewer obscure cup-order tests on Rookie; every valid visible answer accepted |
| Clue Match Up | Review all 108 clues for ambiguity; make higher-level boards contain more plausible same-kind alternatives | One intended pairing per clue in its board, meaningful challenge, obvious matched/remaining tiles without a bottom status paragraph |
| Match & Hunt | Family-test all 40 images; replace only unrecognisable ones; verify target unlocks, flip responsiveness and readable large boards | Both players recognise the pictures; target is always present and clear; no blank first flip; Shroomer is visible without long dead time |
| Clue Duel | Audit all 24 five-clue sequences and their offered choices before adding more subjects; expand to Mario items/enemies/places only with compatible prompt/choice support | Early clues leave several believable possibilities, middle clues reward knowledge, final clue is decisive; wrong guesses and bonus turns stay clear |
| Category Finder | Broaden Mario-specific categories and useful memberships within the existing layout; avoid difficulty based only on tiny tiles or obscure labels | Clear reason a tile qualifies; every valid membership accepted; board never starts without a valid answer; comfortable Legend text |

Track Finder should explain a missed answer using one memorable course detail,
not merely the cup name again. Keep the separate guide useful for learning.
Do not bring hard-to-distinguish track scenery back into picture Match & Hunt.

## Priority 4 — make parent/child competition feel fair

- [ ] Playtest Rookie/Pro/Legend against **both players**, rather than assuming
  the parent knows more. Knowledge difficulty is not reading difficulty.
- [ ] Review Shroomer's accuracy, memory and pace at each level. Record observed
  behaviour across several runs; check it uses the visible board and does not
  get hidden-information advantages in memory games.
- [ ] Audit equal opportunity in each championship format: comparable Order work,
  matching goals and unlock thresholds, distinct questions where intended, correct
  three-round timed turns, carried totals and correct draws/tiebreakers.
- [ ] Test every mode's entry/exit as a championship leg, plus representative
  Quick/Standard/Epic sequences, reloads and an interruption on Shroomer's turn.
- [ ] Make winning, losing and drawing unmistakable and friendly. Keep scoring
  explainable from the displayed moves/answers and earned points.
- [ ] Observe whether a single game dominates total points. Report the evidence
  to the family before proposing scoring changes—do not silently rebalance.

Acceptance: both players can explain who won and why, have enjoyed close games,
and find at least one satisfying challenge level. Handicaps, per-player competitive
levels, retry changes and score weighting require an explicit family decision.

## Priority 5 — give good reasons to play again, without more clutter

- [ ] Continue Learning Zone growth through reviewed Mario content. Check search,
  source links and readable game/context labels as the catalogue grows.
- [ ] Show a useful personal-best improvement when meaningful, using only records
  from the same rules/configuration; keep Shroomer and practice results separate.
- [ ] Complete physical-phone replay checks: same board proportions, original
  target, legible selections and no changes to live scores. Same-board rendering
  is done; do not rebuild it or restore the old event-control panel.
- [ ] Validate that a fresh session feels fresh while remembering the family's
  preferred setup. Avoid daily-pressure mechanics, adverts or extra reward popups.

## Family acceptance — the actual 10/10 decision

- [ ] Agree favourite Mario games and what each player finds too easy, too hard
  or annoying. No assumptions about sensory preferences; ask and observe.
- [ ] Run three short family play sessions on the real iPhone: normal two-player
  favourites; a championship including a timed game; and Shroomer plus a replay.
  Cover remaining modes in short follow-up goes instead of one exhausting audit.
- [ ] Note unnecessary taps, confusing outcomes, repeated facts, unreadable text,
  unrecognisable pictures and moments of waiting. Ask each player separately what
  made them want another go and what they would remove.
- [ ] Fix the repeated pain points, add targeted regression tests and retest them.
- [ ] Require zero known score-loss, missing-target, stuck-turn, skipped-round or
  hidden-answer bugs before calling the experience finished.
- [ ] Both players can play independently, enjoy an appropriate challenge, learn
  something interesting and voluntarily choose another game. Ask for their rating;
  don't substitute the developer's rating or a content count for their judgement.
- [ ] Run `npm run test:all` after the final code edit; check both GitHub tests and
  deployment after every requested push. Phone emulation is not physical Safari.

## Recommended implementation order

1. Physical-phone/rapid-tap audit and any real blocking bugs.
2. Original-question review plus the first favourite-game content batch.
3. Track Finder base-course expansion and Clue Duel/clue-choice review.
4. Remaining mode polish, fact-history links and championship/Shroomer fairness.
5. Family acceptance sessions, targeted fixes and verified release.

Work in small complete batches: implementation, tests, phone evidence, plan update.
Keep the existing games enjoyable while expanding—not a large engine rewrite.

## Not in this experience milestone

Unrelated Nintendo franchises; new game modes; a new mascot/background; account
systems, cross-device sync, monetisation, app-store packaging or a generic theme
engine. Public asset/licence review remains a separate release consideration;
the presence of source links is not a permission claim. Offline/PWA reliability
and local progress safety remain in scope because they directly affect phone play.

## Evidence used

Current `src/mario` catalogues, `LearningCards.tsx`, `GameBoards.tsx`,
`ReplayViewer.tsx`, `GameHelp.tsx`, retry and Order rules; browser tests for phone
flow, recovery, history, championship headers, Shroomer and shared-board replays.
Editorial details remain in `original-question-audit-2026-10-04.md` and
`gameplay-content-review-2026-10-04.md`. Proposed improvements above have not been
implemented or family-validated merely by being written into this plan.
