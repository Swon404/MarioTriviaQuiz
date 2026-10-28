# Difficulty control audit — 28 October 2026

Reviewed the seven games reachable through MarioApp, their standalone Solo/Two Players/Shroomer formats, championships, round generation, retry rules, saved settings, recovery, result labels and score grouping. The older Elemental screens in this repository are not mounted by the Mario entry point.

| Game | Rookie / Pro / Legend effect | Decision |
| --- | --- | --- |
| Quiz Battle | Distinct question banks; 4 / 2 / 1 attempts. Shroomer accuracy also changes. | Keep. |
| Clue Match Up | 4 / 6 / 8 pairs; eligible knowledge level; board ends on the 4th / 2nd / 1st wrong match. | Keep. |
| Clue Duel | 4 / 6 / 8 plausible answer choices. The five clues stay the same. | Keep. |
| Track Finder | 4 / 6 / 9 tiles; 3 / 4 / 5 standalone rounds. Championship length sets rounds instead. | Keep; describe championship tile changes without promising different round counts. |
| Category Finder | Broad groups at Rookie; game-specific relationships with one valid tile at Pro; abilities and original-release relationships at Legend. | Keep. |
| Match & Hunt, Hunt and Time Trial | No human board effect. Shroomer remembers 6 / 12 / 40 revealed cards. | Hide for humans; retain as Shroomer memory. |
| Game Order | Same title pool and rules for identical tile/challenge choices. Old levels selected stored tile counts and 3 / 4 / 5 rounds; Shroomer pace changes. | Remove human levels. Use independent tiles, rounds and Easy/Medium/Hard controls. Keep explicitly labelled Shroomer pace. |

Championship levels now describe only the selected games. Human championships containing just Game Order and Match & Hunt hide the level selector entirely. Computer championships keep Shroomer controls. Championship length remains responsible for the round count.

Game Order's tile and round preferences are independent of the last quiz or Shroomer level. Existing saved tile preferences are used on migration. Recovery retains the compatible checkpoint shape and restores the saved board's settings.

Current Game Order times combine old level labels when challenge, tile count and ruleset match. Legacy times retain level separation because their title pools differed. No stored record is deleted or relabelled. Explicit cleanup uses the same grouping and retains its existing backup/undo behaviour. Finished human Game Order scores and board-only championships ignore irrelevant levels while still separating actual configuration, length, format and scoring version; computer competitions retain level separation.

Verification covers all retained level effects, identical generated human boards at fixed settings, actual Shroomer pace, setup visibility, settings persistence, round counts, reload/resume, leaderboard preservation and cleanup undo. Inspected iPhone WebKit screenshots of standalone Game Order and a board-only championship. The layout regression advances the browser clock through preparation instead of racing a real-time countdown. Final `npm run test:all` passed: the content/rules audit, all 234 Chromium/WebKit tests, TypeScript and the production/PWA build. `git diff --check` passed before commit.
