# Mushroom Power Quiz (working title)

An unofficial family game about Mario and Mario Kart, with seven modes, solo play,
two players on one device, and the visible computer challenger **Shroomer**.
The [main experience plan](docs/family-experience-plan-2026-10-18.md) is the active
backlog and verification record. Earlier plans describe historical versions.

## Games and current content

| Game | Current behaviour |
| --- | --- |
| Quiz Battle | 252 reviewed records covering 240 distinct facts. New competitive games allow one attempt; solo learning keeps level-based retries. |
| Game Order | 30 titles ordered by original US release year. Choose 4/6/8 tiles and Easy/Medium/Hard feedback. Years stay hidden until solved; checking penalties appear by the timer. |
| Track Finder | 48 Mario Kart 8 Deluxe Booster courses and ten Mario Kart World courses, with 33 tasks. Rookie uses landmarks/features; higher levels also use cups and origins. |
| Clue Match Up | 125 sourced name/clue pairs. Two boards in standalone play, one board per player in new Championships. |
| Match & Hunt | 41 picture/name pairs, Hunt or Time Trial, shared relaxed play or separate timed turns. Timed games use three rounds; target and unlock options remain explicit. |
| Clue Duel | 66 characters, tracks, items and places, with five progressively clearer clues and compatible choices. Shared competitive clues allow bonus guesses. |
| Category Finder | 60 tiles across broad groups and game-specific relationships. Pro presents exactly one correct tile among nine. |

Rookie/Pro/Legend controls appear where they affect knowledge or Shroomer's behaviour.
Human Game Order and Match & Hunt use explicit board/settings controls.
Matching targets are worth one point, like other pairs. There are no streak,
difficulty or speed multipliers; streaks remain available for achievements.

Explore offers searchable Learning Zone cards, source links and a separate track
guide. Seen knowledge and revealed extra facts are remembered for the human viewers.
Eligible unseen material comes first; exhausted extras are omitted. Sources,
editions and review dates are listed in the
[coverage register](docs/content-coverage-2026-10-29.md).

## Championship and progress

Choose two or more games and Quick, Standard or Epic length. In new competitive
Championships, **each game win earns one Championship point; a drawn game earns
one each**. Equal final totals mean a draw. The result breakdown shows game scores
and Championship awards separately. Solo Championship sums game points.

Game points continue to feed lifetime progress, without adding Championship points
again. Ranks unlock at **0/20/60/120/240/400** points; point milestones at **100/500**.
Existing points and earned achievements are preserved. Older results and resumed
Championships keep their recorded scoring and matching-board rules.

Shroomer takes visible turns. Its matching decisions use observed-card memory;
Game Order uses separately labelled simulated computer times. Bot and practice
attempts cannot enter human timed leaderboards.

## Saving, phone play and offline use

- One unfinished game can resume on the same browser after reload. Running timers
  include time away; completed times freeze. Starting another game replaces that
  active checkpoint.
- Timed results save immediately to comparable human Top 5 tables. Saved replays
  show the actual boards, selections, targets and clock. Restarted boards are practice.
- Result history is not silently trimmed. Confirmed keep-best cleanup has Undo;
  lifetime awards use a separate ledger to prevent duplicate credit.
- High Scores offers [progress backup and merge](docs/progress-backup-2026-10-29.md),
  including lifetime progress, results, timed replays and learning history.
  Active games and device settings are excluded. Existing record IDs win on merge.
- Storage failures warn; interrupted imports retain a recovery copy. Browser
  storage limits and clearing site data still apply. The reported restart-related
  score loss remains unresolved; it has not been claimed fixed.
- Updates are offered between games. Activating an update in another tab must not
  reload an active board. A visible build, Home Screen icons, zoom, reduced motion
  and readable slow/error artwork fallbacks support phone use.

Data stays in local browser storage under the `mariotrivia_` prefix. No account,
cloud sync or AI API is needed. ElementalQuiz data is not read or changed.
Physical iPhone/Safari, Home Screen, VoiceOver and family acceptance remain separate
from browser emulation: use the [short acceptance checklist](docs/phone-acceptance-2026-10-29.md).

## Development and verification

```sh
npm ci --legacy-peer-deps
npx playwright install chromium webkit
npm run dev
npm run test:all
```

The full gate runs the content/rules audit, complete browser suite, TypeScript and
production build, then the actual production service-worker update/offline test.
Run phone checks with `npx playwright test --project=webkit-phone`.
WebKit uses an iPhone 13 profile; it does not certify physical-device behaviour.
Set `PLAYWRIGHT_WORKERS=1` on resource-constrained machines.

Round creation is in `src/mario/rounds.ts`; session/competitive Quiz state is in
`session.ts` and `versus.ts`; Championship rules are in `championship.ts`.
Follow [AGENTS.md](AGENTS.md) before committing or publishing.

GitHub Actions tests pushes and pull requests. A passing main build deploys to
[GitHub Pages](https://swon404.github.io/MarioTriviaQuiz/). Local commits are not
proof that the deployed site contains those changes; check the exact commit's
test and deployment jobs.

## Attribution and release scope

This is a separate fork of ElementalQuiz at source commit
`acbe7c70c4ecc9ad35020bd855b7955afce35d1f`. The title is provisional and has not
been cleared for public release. Nintendo owns the Mario names, characters and
games referenced here; this project is not affiliated with or endorsed by Nintendo.

The landscape background is original AI-generated platform-game scenery.
Matching artwork includes individually credited Nintendo artwork, screenshots and
console photographs from Super Mario Wiki; legacy SVGs remain for older replays.
See [artwork sources](docs/matching-artwork-sources.md). Attribution is not rights
clearance for distribution.
