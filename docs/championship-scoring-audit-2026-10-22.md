# Championship scoring opportunities — 22 October 2026

Source inspection at `2bc20be`. This is an audit of implemented rules, not a
family balance verdict or a change to scoring. No gameplay rules changed.

## Available points

| Mode | Quick | Standard | Epic | Meaning |
| --- | --- | --- | --- | --- |
| Quiz Battle | 3 | 5 | 8 | Maximum per player; one per correct answer |
| Game Order | 3 | 4 | 5 | Competitive: one per timed round won; exact ties award both players one. Solo: one per solved board |
| Track Finder | 3 | 4 | 5 | Maximum per player; one per correct selection |
| Clue Match Up — Rookie | 8 | 8 | 8 | Maximum per player: two boards of four pairs |
| Clue Match Up — Pro | 12 | 12 | 12 | Maximum per player: two boards of six pairs |
| Clue Match Up — Legend | 16 | 16 | 16 | Maximum per player: two boards of eight pairs |
| Match & Hunt — timed | 3 | 3 | 3 | Competitive: one per timed round won, one each on exact ties. Solo: one per completed board |
| Category Finder | 3 | 3 | 3 | Maximum per player; one per correct selection |
| Clue Duel | 3 solo / 6 shared | 4 solo / 8 shared | 5 solo / 10 shared | One point per solved subject. Competitive bonus guesses can transfer the opportunity; shared totals are not guaranteed equal personal allocations |

Untimed Match & Hunt uses three boards in Championship. Each matched pair
earns one point. In competition the players share the board and its points,
rather than receiving a full board each. With no target, 12/16/20-pair settings
therefore offer 36/48/60 shared points across the leg. A target can finish each
board early: its unlock setting and when it is found determine the actual
number of points available. Solo earns the points for pairs actually found.

Time Trial changes its board workload with Championship size: Quick uses nine
pairs with a three-pair goal, Standard twelve with a four-pair goal, Epic fifteen
with a five-pair goal. It still awards at most three timed wins per player.

## What this establishes

- The final Championship sums earned points directly. There is no game-weight
  normalisation or streak multiplier.
- A Quick Rookie Clue Match leg offers 8 points versus Quiz's 3. At Legend the
  same comparison is 16 versus 3. This is unequal opportunity, not an addition bug.
- Untimed Hunt can dominate a short Championship, especially with no target.
- Longer Championships do not increase all modes equally; matching and Category
  remain fixed while Quiz, Order, Track Finder and Clue Duel grow.
- Rookie Quiz allows three retries after the first attempt: all four choices can
  be tried. The nominal score ceiling is consequently much easier to reach.
- Timed competitions split wins between opponents (except ties), whereas both
  players can independently score full marks in Quiz/matching. Equal numerical
  ceilings alone would not guarantee equal difficulty or game influence.

## Decision before changing rules

Keep the approved one point per correct answer/pair or timed win, and the two
Clue Match boards. Ask whether the family prefers:

1. **Keep earned-point totals:** games deliberately have different influence;
   make each leg's scoring clear and accept the imbalance.
2. **Balance opportunities through game length/configuration:** preserve simple
   points, but agree which round counts or Hunt settings may change. This can
   lengthen sessions and cannot automatically equalise shared versus independent
   scoring. Do not silently reduce the approved two Clue Match boards.

Competitive retries are a separate decision. No retry or weighting change is
authorised by this audit.

## Evidence and remaining checks

Read `src/mario/championship.ts` (counts, options, sum), `rounds.ts` (boards,
goals, pair counts), `session.ts` (awards), `turns.ts` (timed wins/ties),
`retries.ts`, and `src/MarioApp.tsx` (shared Hunt, Clue Duel bonus guesses,
completion and Championship leg results).

This is static source evidence, not a fresh automated test run. Still required:
observed per-game contributions in family play, full sequence/recovery checks,
opponent-board comparability, and Shroomer calibration. The existing release's
200-test pass does not substitute for those acceptance checks.
