# Elemental Quiz parity audit — 30 September 2026

Compared the actual sibling ElementalQuiz implementation, especially `GameHubScreen.tsx`, `TwoPlayerScreen.tsx`, `ElementOrderScreen.tsx`, `games/atomicOrder.ts`, `games/catalog.ts`, and `engine/storage.ts`. This replaces the earlier assumption that each player should complete a whole game using the same questions.

## Changes made

| Area | Elemental behaviour | Mario fork after this audit |
| --- | --- | --- |
| Game hub | Championship precedes individual games | Championship is first |
| Setup | Remembers player names, difficulty and game options | Persists both names, player format, difficulty, timer, championship format/length/game selection, all Hunt/Time Trial settings, and Game Order challenge and per-level tile count; speech settings remain persistent |
| Championship turns | Individual questions or timed puzzles alternate | Quiz, Track Finder, Category Finder, Clue Match Up and timed games hand over after one question/board; Mushbot has visible individual turns |
| Fresh questions | Players receive separate questions/puzzles | Generate the combined round pool once, without duplicate quiz knowledge, clue subjects, matching names, order puzzles or Track Finder target cups across both players |
| Clue Duel | Shared subject; passing reveals a clue and changes player; first wrong guess gives the opponent a bonus with two extra clues; the winner's opponent starts next | Same turn and bonus rules; each new subject is distinct; correct multiplayer guesses earn one point |
| Relaxed Hunt | Shared memory board; a match keeps the turn; a miss changes player | Same shared-board rule, including Mushbot; normal pair earns one point, target pair earns two plus a two-point Hunt win bonus |
| Timed Hunt / Time Trial | Private timed turns, three rounds each; fastest wins | Alternate six separate turns, three per player; compare each pair of times and award the faster player one point; equal times award one each |
| Game Order | Ready screen, start timer, unlimited checks, configurable tiles and feedback; solve time determines winner | Same core rules; Easy gives direction hints without penalty, Medium adds a one-second penalty, Hard hides years and gives only a correct-position count; fastest player wins each round |
| Game Order leaderboard | Saves a time when a puzzle is solved | Immediately saves each human result, grouped by difficulty, challenge and tile count; Top 10 is shown in the game and on High Scores |
| Track Finder | Themed game, so no direct Elemental equivalent | Reduced to 4/6/9 tiles for Rookie/Pro/Legend; explicit success/failure message, correct tiles marked with text and ticks, at least one valid and one invalid choice |
| Rewind | Current go only, before advancing | Restarts timed Order and matching boards; restores retries; shared Hunt restart also removes that board's awarded points |
| Artwork | Recognizable icons appropriate to the subject | White feather, grey rock, turtle, daisy, crown, dual-screen folding console and classic handheld; original vector drawings scale on phones |

Shared subjects in Clue Duel and shared cards in relaxed Hunt are intentional parts of those games, not duplicate private questions. A chosen Hunt target remains selected across boards, as configured.

## Remaining differences, not claimed as parity

- The Mario fork has seven themed games, including Clue Match Up. Elemental's chemistry-only games are not copied as empty modes.
- Championship lengths retain the fork's reviewed-content round counts. Quick/Standard/Epic are not an assertion of identical question counts to Elemental.
- Game Order currently has eleven dated titles. Its available tile counts are 3/4/5 for Rookie, 4/5/6 for Pro, and 5/6/8 for Legend, rather than Elemental's larger element-pool multipliers.
- Atomic Order and timed Hunt replay recording/playback have not been ported. The new Game Order board records time and checks, not replay events.
- Game Order now has per-configuration time leaderboards. Other Mario games retain their existing completed-game score history; Elemental's full per-configuration leaderboard and score-cleanup system has not been ported.
- Profile management, element collections and the creation/lab area remain Elemental features. Mario's Learning Zone is still a scaffold except for its reviewed track guide.

## Verification

The rules audit covers every championship length and difficulty, distinct two-player round pools, all selectable Game Order sizes and challenges, valid Track Finder boards, fastest-time scoring, and Clue Duel score ownership. Browser coverage exercises persistence after reload, question-by-question championship handovers and totals, Clue Duel passing/bonus turns, shared and timed Hunt, immediate Game Order saving, and the smaller Track Finder boards.
