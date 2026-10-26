# Difficulty controls audit — 26 October 2026

Reviewed all seven games in the active Mario app, including standalone, two-player, Shroomer and championship paths.

| Game | What Rookie / Pro / Legend actually change | Action |
| --- | --- | --- |
| Match & Hunt | Nothing in the human board or timer. Shroomer remembers 6 / 12 / 40 revealed cards. Board size, find count, target and unlock count come from separate settings. | Removed the selector and level label for Solo and Two Players. Labelled the computer selector “Shroomer’s memory”. Human timed leaderboards combine legacy levels without rewriting records. Human finished-score groups also ignore the old level; computer points retain the opponent level. |
| Quiz Battle | Level-specific question pools; 4 / 2 / 1 attempts per question. All levels offer four answers and award one point per correct answer. | Replaced generic descriptions with question and attempt information. |
| Clue Match Up | 4 / 6 / 8 clue pairs, level-appropriate clue content, and a round ending on the 4th / 2nd / 1st wrong match. | State the pair count and wrong-match limit. |
| Clue Duel | 4 / 6 / 8 answer choices. The subject pool and five clues do not change with level. | State the choice count rather than promising harder clues. |
| Track Finder | 4 / 6 / 9 tiles and 3 / 4 / 5 standalone rounds. Pro and Legend boards may contain up to two correct tracks; any correct track completes the round. | State the actual tile and round counts. |
| Category Finder | Nine tiles at every level. Rookie uses broad categories; Pro uses game-specific groups with exactly one correct answer; Legend uses abilities and release-history categories and can have more than one valid tile. | Remove the misleading implication that Legend has a larger board. Describe the categories instead. |
| Game Order | 3 / 4 / 5 standalone rounds and a separately remembered tile count for each level (initially 4 / 6 / 8). All levels allow 4, 6 or 8 tiles. The separate Easy / Medium / Hard setting controls hints and penalties. | Retain the selector because it affects game length; show the selected tile count, round count and direction to the actual challenge settings. |

Championship length supplies round counts instead of the standalone level defaults. Its Time Trial board size and find count come from championship length. Match & Hunt still does not use the championship level for human gameplay. Other computer opponents use the selected level for accuracy or timing as appropriate.

The shared timer switch in the question/clue/finder games genuinely changes whether elapsed time is shown; it does not introduce a countdown deadline or a points multiplier. Matching's own mode, timer, turn, board, target and unlock controls were also traced to their gameplay effects.

Sources inspected: `src/MarioApp.tsx`, `src/mario/rounds.ts`, `questions.ts`, `retries.ts`, `session.ts`, `versus.ts`, `gameOrder.ts`, `memoryBot.ts`, `championship.ts`, `pairTimes.ts` and `scoreGroups.ts`.

Layout changes remove the idle countdown element from layout, combine matching progress and Restart in one row, and tighten the matching header and stopwatch. Card sizes and a minimum 44px Restart target are preserved. Regression checks cover first-card position and three complete visible rows at 390px and 800px widths, plus Safari/WebKit.
