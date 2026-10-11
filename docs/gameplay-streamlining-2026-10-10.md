# Gameplay streamlining — release scope

## Included in this change

- Automatic Quiz Battle answers from Shroomer after one second, with choices visible.
- Immediate two-player questions/boards with an active-player banner instead of routine handover screens.
- Automatic Shroomer moves in matching and Clue Duel, and visible selections/swaps in Game Order.
- Settings collapsed by default; standalone player name remains directly editable.
- Game Order offers 4, 6 or 8 tiles, with two-column titles that do not break words.
- Timed leaderboard displays limited to five records.
- Large replay dialog using the game tile styling, Start/Stop playback and a Back control.
- Repeated How to Play panels and the successful Clue Match Up bottom message removed.
- Larger next-clue button, faster matching, and local icon preload/decode.
- Updated regression coverage for automatic turns, replay controls, countdowns and recovery.

## Still outstanding

- [ ] Expand Track Finder beyond its current 48 Booster Course Pass courses. Earlier source checks did not yet result in a committed content expansion.
- [ ] Complete a physical iPhone Safari check, including cold-cache image loading, voice, larger text and background/resume.
- [ ] Further gameplay/content auditing remains separate from this interaction-focused release.

Current deployed commit is **54517a4**. Its [GitHub test and deployment jobs succeeded](https://github.com/Swon404/MarioTriviaQuiz/actions/runs/38165160446). Remaining work is consolidated in the [active family experience roadmap](family-experience-roadmap-2026-10-11.md).
This document records scope, not a claim that every earlier requested improvement is complete.

## Shared-board replay follow-up — 11 October 2026

- Game Order and Match & Hunt now share their live tile components and snapshot builders with replay.
- Removed replay-only tile CSS: card columns, image sizes, fonts, selection borders and feedback colours come from the live board.
- New recordings preserve Order years and feedback separately, and matching card type plus Hunt unlock state. Existing version-1 recordings still play.
- Replay renders outside the leaderboard markup so leaderboard text styles cannot alter it. Back and Start/Stop remain reachable on a phone.
- Added live-versus-replay comparisons for layout, colours, selections, years, pictures, target state and unchanged saved scores.
- Track Finder expansion and physical-iPhone verification remain outstanding.
- Verification: all 122 browser tests, the content/rules audit and the production/PWA build passed locally. Phone-viewport screenshots were reviewed. This follow-up is committed and deployed in `54517a4`; GitHub tests and deployment passed. Physical-iPhone verification remains outstanding.
