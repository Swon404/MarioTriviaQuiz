# World content batch — 28 October 2026

First expansion under section 2 of the main experience plan. Adds 20 questions
and 20 distinct knowledge IDs: 191/180 becomes **211/200**. Seven Rookie, seven
Pro, six Legend. Eight dedicated matching clues take the catalogue from 108 to
116; these reuse the same facts and do not inflate the knowledge count.

All records concern **Mario Kart World on Nintendo Switch 2**. Source pages
were read on 28 October 2026; interview claims are described as development
stories, not promises about current gameplay. Three detailed course entries use
Mario Wiki, with explicit World context. Learning Zone labels those separately
from Nintendo. No existing prompts, answers, IDs, history aliases or scoring
rules change. Old answer-key regression hash remains unchanged.

## Coverage register

Each ID below has the `world-` prefix in both `id` and `knowledgeId`.
Source abbreviations map to the exact links in `WORLD_SOURCES` in
`src/mario/worldQuestions.ts`; each card carries its own clickable source.

| ID suffix | Level | Distinct knowledge | Source | Matching |
| --- | --- | --- | --- | --- |
| coin-cap | Rookie | World race coin capacity | tips | Yes |
| drafting | Rookie | Position needed to draft | tips | |
| third-turbo | Pro | Assist restricting third Mini-Turbo level | tips | Yes |
| quick-turn | Legend | Standard-control quick turnaround | tips | |
| coin-block | Rookie | Repeated-use coin-producing item | moves | Yes |
| rocket-start | Rookie | Start-boost timing | moves | |
| landing-boost | Pro | When a successful trick pays its boost | moves | |
| rail-surfaces | Pro | Rideable narrow surfaces | moves | |
| feather-route | Rookie | World item leap for evasion | direct | Yes |
| catch-up-items | Pro | Position affects comeback-item likelihood | direct | |
| western-desert | Rookie | Placement of the dry region | landscape | |
| music-gate | Legend | Knockout Tour musical transition at gates | landscape | |
| roaming-music | Legend | Source material for Free Roam arrangements | landscape | |
| volcano-food | Rookie | Bowser-inspired volcanic food design | design | |
| food-prototype | Legend | Prototype that revived the food feature | design | Yes |
| engine-sounds | Legend | Unusual sound used in engine experiments | design | Yes |
| banked-turns | Pro | Terrain communicates race direction | navigation | |
| salty-statue | Pro | Character depicted in a course landmark | salty | Yes |
| falls-current | Legend | River side-current direction | falls | |
| dinosaur-ramp | Pro | A dinosaur usable as a ramp | jungle | Yes |

## Editorial and behaviour checks

- Checked the existing bank for semantic duplication. The existing Feather
  question tests **MK8 Deluxe Battle exclusivity**; the new one tests **World's
  evasion item**, with game names explicit. Existing Charge Jump questions test
  the move; the new rail question tests its usable surfaces.
- Distractors use comparable items, characters, controls or effects. No new
  release-date or cup-order questions. Explanations describe a consequence or
  something to try; extras add a separate detail.
- New IDs append to the bank. Quiz and matching share exposure IDs; unseen-first
  selection makes this batch available to returning players without resetting
  their history. Learning Zone inherits reviewed additions.
- Regression coverage checks all levels across 20 seeds, the unchanged 191-record
  answer key, matching exposure and level restrictions, all new card sources,
  phone layout, and correct/wrong/retry feedback for one new question per level.
- Physical-iPhone and family enjoyment checks remain open. World Track Finder,
  Clue Duel, extra-fact exposure rotation and later content batches are still
  separate tasks in the main plan.

Final `npm run test:all` passed: content/rules audit (211 questions and 900
generated quizzes), all **240 browser checks** (185 Chromium + 55 WebKit),
TypeScript and production/PWA build. Inspected the new searchable Learning Zone
card at 390px: readable text and correctly labelled source, no horizontal
overflow. `git diff --check` passed. This batch remains local, not committed,
pushed or deployed.
