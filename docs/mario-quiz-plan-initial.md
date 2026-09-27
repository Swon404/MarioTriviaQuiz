# Text-only Mario Quiz: implementation checklist

Status: planned; implementation has not started.
Created: 27 September 2026.

## Goal and agreed direction

Create a separate Mario-based edition of ElementalQuiz with original text questions about Mario characters, games, items and places. Retain the accessible, relaxed experience for children around 8–12, with deeper knowledge available at higher levels.

The initial release target is a free web/PWA edition without adverts or purchases. Develop and playtest locally first; consider phone app packaging after the web version works well.

This is the concrete first subject adaptation of [the game-series plan](game-series-plan.md). For this edition, Mario replaces Animals as the next subject. Start with Quiz Battle rather than the earlier plan's matching/category prototype. Extract reusable code as each mode needs it.

Working repository name: `MarioTriviaQuiz` (provisional internal name). The public app name remains undecided.

## 1. Establish the fork

- [ ] Create a separate repository/fork and checkout for the Mario edition.
- [ ] Record the source commit and run `npm run test:all` to establish the baseline.
- [ ] Review inherited repository licence and asset permissions.
- [ ] Set the fork's Git remote, package identity and README.
- [ ] Review `.github/workflows/deploy.yml` before enabling deployment; assign a separate hosting destination.
- [ ] Change the Vite base path, router configuration, PWA manifest, icons and service-worker scope for the new app.
- [ ] Give profiles, results, replays and settings a new storage namespace; retain original ElementalQuiz data untouched.
- [ ] Record the fork owner and deployment URL when selected.

Done when: the fork builds and runs independently, and its storage and deployment cannot overwrite ElementalQuiz.

## 2. Define the content pack and app identity

- [ ] Create a typed Mario content pack with stable IDs for characters, games, items, places, facts and questions.
- [ ] Store sources, review dates and content version alongside authored content.
- [ ] Support names, category tags, game appearances, matching relationships, ordering values and clue sequences without chemistry fields.
- [ ] Expose only the small interfaces needed by each migrated mode; avoid a full engine rewrite upfront.
- [ ] Make mode names, instructions, enabled games and difficulty labels configurable through the pack.
- [ ] Retain Explorer, Scientist and Professor internally initially; review their visible names during playtesting.
- [ ] Replace chemistry branding and the Elementor mascot with original neutral text/UI. Use a generic bot label provisionally, not a Nintendo character impersonation.
- [ ] Keep graphics, icons, typography and sounds original or appropriately licensed. Mario content is text only.

Start in `src/games/catalog.ts`, `src/engine/questionGenerator.ts`, `src/engine/questionFeedback.ts` and the data layer. Review `src/engine/storage.ts` and `src/engine/gameResults.ts` for isolation. Migrate solo and two-player screens incrementally.

Done when: one Mario question can pass through generation, answering, feedback and saved results without element-specific assumptions.

## 3. Build and review a starter question bank

Initial editorial scope: main Mario platform games and Mario Kart. Include other series only when the question explicitly identifies the relevant game or series.

- [ ] Author 60 distinct questions for the first playable milestone: 20 per difficulty.
- [ ] Expand toward at least 240 distinct reviewed general Mario knowledge items for the first fuller release, initially targeting 80 per difficulty, plus the dedicated Mario Kart pool below.
- [ ] Cover characters, relationships, games, gameplay mechanics, items, locations and release history; avoid relying heavily on dates alone.
- [ ] Give every multiple-choice question exactly four distinct options and one unambiguous answer.
- [ ] Use plausible distractors of the same kind as the answer.
- [ ] Give each question both a question ID and a knowledge ID. Alternate wording does not count as a new fact.
- [ ] Explain the answer in two or three short, readable sentences that add context instead of repeating the question.
- [ ] Add a reviewed pool of fun facts linked to the question's character, game or subject; show one relevant, unseen fact after the answer.
- [ ] Omit the extra fun fact when its relevant pool is exhausted.
- [ ] Write in plain language suitable for 8–12-year-olds; explain unfamiliar terms and keep advanced knowledge separate from difficult wording.
- [ ] Research facts using reliable sources, favouring official game pages and manuals where available; write the content in our own words.
- [ ] Specify the game/version for mechanics that differ between titles.
- [ ] Define release ordering as first commercial release anywhere, using exact dates where necessary. Treat remakes separately and exclude unresolved ties.
- [ ] Review prompts, answers, distractors, explanations and facts for accuracy and readability.

Content record: ID, knowledge ID, topic, related entity IDs, difficulty, prompt, four answer options, correct option ID, explanation, related fun-fact IDs, sources and review status.

The content target is a starting point. Generation tests must prove that each supported session has enough eligible, non-repeating knowledge items. Increase the pool or constrain the session before enabling unsupported combinations.

Done when: all starter questions pass validation and a human content review, with no repeated knowledge in a supported session.

### Dedicated Mario Kart section: tracks and racing

Mario Kart is a major selectable section, with tracks as its largest topic. Players should be able to choose General Mario, Mario Kart or a mixture, and narrow Mario Kart to tracks or particular games they know. Keep these choices simple and remember them between sessions.

#### Coverage and content targets

- [ ] Build an inventory of Mario Kart titles and their courses from verified sources, recording what is covered and what still needs research.
- [ ] Cover the console and handheld series, including Mario Kart World, and explicitly catalogue Tour and arcade material so their inclusion can be managed separately.
- [ ] Treat Mario Kart 8 and Mario Kart 8 Deluxe as distinct editions where their content or mechanics differ; identify downloadable course packs explicitly.
- [ ] Make the catalogue comprehensive for each enabled title: every race course and cup must be accounted for. Track battle arenas separately from race courses.
- [ ] Start with 30 Mario Kart questions within the 60-question prototype, including at least 18 track questions spread across all three difficulties.
- [ ] Build a dedicated release pool of at least 300 reviewed Mario Kart knowledge items, including at least 180 about tracks. These are additional to the 240 general Mario items.
- [ ] Aim for 100 Mario Kart knowledge items per difficulty. Add content beyond these minimums until every enabled course has meaningful coverage and supported filtered sessions can run without repeats.
- [ ] Maintain a coverage report by title, course, topic and difficulty. Label partially covered titles clearly rather than claiming complete coverage.

#### Track catalogue and version rules

- [ ] Give each distinct course a stable ID and each appearance in a game its own ID; do not merge unrelated courses merely because their names match.
- [ ] Record official English display names, regional aliases, debut game and subsequent appearances.
- [ ] Store cup membership, course position, base-game/downloadable status and any route variant against the relevant appearance, not as universal properties of a track.
- [ ] Write original short descriptions of settings, landmarks, obstacles, hazards, route features and distinctive race mechanics.
- [ ] Record verified differences between original and returning versions, including layout or mechanic changes where relevant.
- [ ] Handle changing routes, section-based races, connected routes and other title-specific structures explicitly; do not assume every race has three laps or every cup follows one structure.
- [ ] Keep battle arenas in their own category with their own game/version context.
- [ ] Scope all claims such as “first”, “only”, lap counts and cup membership to a source-backed game/version and review date.

Course appearance record: appearance ID, course ID, game/edition ID, official name, aliases, cup/position where applicable, content pack, route variant, setting tags, landmarks, hazards, mechanics, source references and review status. Keep unknown fields unknown rather than inventing facts.

#### Question variety

- [ ] Identify a course from a short description of its setting, landmarks or hazards.
- [ ] Ask which cup contains a course, or which course belongs to a named cup, always naming the game/edition.
- [ ] Ask where a course first appeared and distinguish debut questions from returning-course questions.
- [ ] Compare an original course with a specific later appearance using verified differences.
- [ ] Ask about track-specific obstacles, moving features, surface types and race mechanics.
- [ ] Cover course sequence within a specified cup where there is a fixed, unambiguous order.
- [ ] Include character rosters, items and their effects, vehicles, drifting/boosting, race rules and battle modes, with game-specific wording.
- [ ] Avoid subjective questions about the “best” track, character, shortcut or vehicle, and avoid time-sensitive competitive rankings.
- [ ] Balance generation across topics and courses so a session cannot become mostly cup-membership or debut-year questions.
- [ ] Use plausible course-name distractors; validate exactly one correct answer rather than assuming similarly themed tracks are interchangeable.

Example prompt templates to populate only after source review:

- “In [game], which cup includes [course]?”
- “Which course in [game] has [distinctive feature]?”
- “In which game did [course] first appear?”
- “What changes on [course] in [specified appearance]?”

Explanations should describe what makes the course or mechanic interesting, rather than simply repeat its name or cup. The single fun fact should relate to that course or the subject asked about and add different information.

#### Difficulty and game modes

- [ ] Explorer: familiar courses, recognisable settings and straightforward item effects; distinct distractors.
- [ ] Scientist: cups, hazards, returning tracks and differences between named games; closer distractors.
- [ ] Professor: deeper course history, route variants and precise version differences; retain simple language.
- [ ] Add Track Clue Duel with five increasingly revealing text clues and a decisive final clue.
- [ ] Add track-to-description Match & Hunt using unique descriptions within each board.
- [ ] Let Category Finder ask for one course from a specified game, cup or verified setting category; accept every valid tile if several qualify.
- [ ] Adapt ordering to fixed cup sequences or course debut dates, excluding ambiguous date ties.
- [ ] Offer a Mario Kart-only championship using the supported modes, plus Mario Kart content in mixed championships.
- [ ] Carry the selected titles/topics through every championship leg, including tie-breaks, and include those filters in leaderboard configuration keys.
- [ ] Keep all modes text based; track maps, screenshots and racing simulation are outside this edition's scope.

#### Mario Kart validation checklist

- [ ] Audit course inventory completeness against sources for each enabled title and downloadable pack.
- [ ] Test same-name courses, regional names, returning-course versions and cup membership for ambiguity.
- [ ] Verify four-choice questions have one correct option within the named edition and route context.
- [ ] Test each supported game/topic/difficulty filter for sufficient content across the longest available session and championship.
- [ ] If a filter has too little content, offer a shorter session or an explicit broader selection; never silently add games the player did not choose.
- [ ] Prevent repeated knowledge when the same course fact appears in quiz, clue, matching or category modes.
- [ ] Playtest tracks with your son to check that descriptions are recognisable without images and do not give away the answer.

Done when: Mario Kart has its own playable section, comprehensive course records for enabled titles, a substantial varied track question bank, and working filtered sessions and championships.

## 4. First playable milestone: Quiz Battle

- [ ] Adapt solo Quiz Battle using the starter pack.
- [ ] Support the three difficulty levels and existing optional timing.
- [ ] Use the original interface with clear four-choice answer buttons and obvious selection feedback.
- [ ] Show the focused explanation and one relevant fun fact after answering correctly or incorrectly.
- [ ] Prevent repeated knowledge within a game; handle pool exhaustion explicitly instead of silently repeating.
- [ ] Preserve rewind before Next, and lock it after advancing.
- [ ] Save scores in the new namespace and display them on High Scores.
- [ ] Adapt human-versus-human and versus-bot Quiz Battle using the same content rules.
- [ ] Test with your son and record unclear language, accidental taps, repeated facts and difficulty mismatches.

Done when: a complete quiz works in all three player formats, saves correctly and feels enjoyable in a real play session.

## 5. Adapt the remaining suitable modes

| Existing mode | Proposed Mario edition | Rule to preserve or define |
| --- | --- | --- |
| Atomic Order | Game Order | Order named games by the defined release date; avoid ambiguous ties. |
| Element Match / Hunt | Match & Hunt | Match text names to unique short descriptions; hunt for a named entity present on the board. |
| Clue Duel | Clue Duel | Five authored clues per subject; harder subjects at higher difficulty, with clues becoming more revealing within a turn. |
| Family Finder | Category Finder | Find one character, item, location or other requested category in a text grid. |
| True or False Blitz | True or False Blitz | Optional separate mode with reviewed statements; Quiz Battle always remains four-choice. |
| Symbol Pick / Atom Quiz | Deferred | Enable only after defining a useful Mario-specific mechanic; exclude from initial championships. |

- [ ] Implement Game Order with sufficient date-separated games at each difficulty.
- [ ] Record ordering selections, swaps and checks for faithful replays.
- [ ] Implement Match & Hunt with validated one-to-one pairs for each generated board. Do not use ambiguous relationships such as an item appearing in many games.
- [ ] Preserve three-round timed Match/Hunt, with separate timed turns for each player.
- [ ] Make timed Match/Hunt rewind restart the entire go, including timer, board and score.
- [ ] Store the actual Hunt target and initial board in every replay.
- [ ] Author five-clue sequences; use a decisive final textual clue since there is no chemical-symbol equivalent. Playtest the reveal order before locking it down.
- [ ] Implement Category Finder with readable difficulty-scaled grids, including 4×4 for Scientist; ask for one matching tile and always provide a valid answer.
- [ ] Retain an optional Category Finder timer and a short introduction explaining only how to play.
- [ ] Add reviewed True or False content if the core five modes are ready and the pool supports it.

Done when: each enabled mode works solo and in both versus formats, with appropriate pools, rewind behaviour and saved results.

## 6. Championships, scores and replays

- [ ] Build Quick, Standard and Epic championships from enabled modes only.
- [ ] Apply the difficulty selected at the start to every championship leg without asking again.
- [ ] Sum the actual points earned in each leg for championship totals; show total and current scores throughout.
- [ ] Keep knowledge repetition tracking across championship legs where they test the same fact.
- [ ] Define and test tie-break rules, including repeated ties and valid Hunt targets.
- [ ] Record each completed timed go immediately and exactly once; ensure rewind/retry cannot create duplicate valid results.
- [ ] Include mode, difficulty, board size, timing rules, content/rules version and relevant configuration in leaderboard grouping.
- [ ] Offer replays for recorded Game Order and timed Match/Hunt results on the High Scores page.
- [ ] Preserve replay snapshots so content changes do not change an old board, target or action sequence.
- [ ] Retain the option to clear lower scores while keeping the top entry in each leaderboard, with clear confirmation.

Done when: every championship size completes correctly and saved scores/replays match what was played.

## 7. Regression tests and phone checks

- [ ] Adapt the question audit to validate four choices, unique IDs, valid references, sources, reviewed content and answer correctness.
- [ ] Add seeded generation tests for repetition, category balance, pool exhaustion, valid Hunt targets, unique match pairs and ordering ties.
- [ ] Test full-turn timed rewind, player handovers and rewind locking after Next.
- [ ] Test championship totals, inherited difficulty, three-round time trials and tied tie-breaks.
- [ ] Test immediate result recording, duplicate prevention, reload persistence and storage separation.
- [ ] Test that replays show the recorded selections, checks, board and target.
- [ ] Extend Playwright coverage to the Mario mode names, all enabled setup screens, the full quiz flow and championships.
- [ ] Check keyboard navigation, focus, contrast, long names, small phone screens, selected states and exit-button overlap.
- [ ] Check the installed PWA on iPhone and Android, including offline play after first load and updates without lost scores.
- [ ] Run the adapted `npm run test:all` before each release candidate.

Done when: automated checks pass and phone playtesting reveals no blocking interaction or readability problems.

## 8. Prepare the free release

Text-only trivia reduces copied-asset concerns but is not automatic legal clearance. A disclaimer or free price does not establish permission. The previously suggested public title is provisional, not an approved naming recommendation.

- [ ] Choose and review the public title, icon, description and presentation for accurate descriptive use without suggesting Nintendo endorsement.
- [ ] Include a clear unofficial/unaffiliated notice; do not treat it as a substitute for reviewing the actual use.
- [ ] Review final content and branding for public distribution, obtaining appropriate IP advice before relying on uncertain uses.
- [ ] Verify all questions and explanations are original writing and that no Nintendo images, logos, audio, screenshots or copied passages are bundled.
- [ ] Publish basic help, data-storage/privacy information and a way to report incorrect questions.
- [ ] Deploy the reviewed web/PWA build to the fork's own destination and smoke-test the deployed version.
- [ ] Consider Capacitor and store submissions as a later milestone; check current store policies and tooling requirements at that time.

Background: [UK IPO copyright basics](https://www.gov.uk/government/publications/ip-basics/ip-basics), [Nintendo sharing guidelines and their limited scope](https://www.nintendo.co.jp/networkservice_guideline/en/index.html), [Apple App Review](https://developer.apple.com/app-store/review/), [Google Play intellectual property policy](https://support.google.com/googleplay/android-developer/answer/9888072?hl=en).

## Start here

First implementation batch: establish the fork, isolate its identity and storage, define the content types including course appearances, author/review the first 60 questions (30 general Mario and 30 Mario Kart, including at least 18 track questions), and finish solo Quiz Battle with General Mario/Mario Kart/Mixed selection. Use that working milestone and feedback from your son to guide the remaining modes and content expansion.

This document authorizes no deployment or repository creation by itself; those checklist items describe the next implementation work. No fork or public release has been created as part of writing this plan.
