# Mushroom Power Quiz (working title)

The public-facing title is deliberately neutral and provisional; it has not been cleared for release. The app describes its Mario subject matter plainly without using Nintendo's name or a named item as the app brand. The repository and Pages URL still use the internal `MarioTriviaQuiz` name.

Championship combines two or more supported games in Quick, Standard or Epic length. Choose Solo, Two Players or Play Mushbot. Players alternate individual turns with separate questions and puzzles. Mushbot takes visible turns too. Clue Duel passes clues on a shared subject, and relaxed Hunt uses a shared memory board; timed Hunt uses separate boards. The selected difficulty carries through every game, earned points add to each player's total, and the matching games have three rounds. Championship results are saved locally and shown on High Scores.

The Elemental Quiz-style voice controls are present on the home screen, with read-aloud buttons for questions and feedback. Correct answers earn difficulty-based EP with streak bonuses; the home screen shows the player's Mario rank, EP progress, best streak and milestones. Championship totals add the EP actually earned in each game. The optional timer is currently a stopwatch, so it does not award the original countdown speed bonus.

Explore now opens a Learning Zone scaffold. Its planned character, power-up and game sections are clearly marked as unconfirmed; the reviewed Booster Course Pass track list is reached from its Mario Kart section.

An unofficial fan quiz about Mario games and Mario Kart. Match & Hunt uses original generic SVG illustrations, emoji and text rather than Nintendo artwork. This is a separate local fork of ElementalQuiz at source commit `acbe7c70c4ecc9ad35020bd855b7955afce35d1f`.

Game and championship setup use the combined Mario games and Mario Kart content pool automatically; there is no topic selector.

The current playable milestone has seven games: Quiz Battle, Game Order, Track Finder, Clue Match Up, Match & Hunt, Clue Duel and Category Finder. Pick Solo, 2 Players or Play Mushbot on the game hub, then choose a game. Quiz Battle alternates turns with five distinct questions per side; the other games alternate individual turns with distinct puzzles. Clue Duel and relaxed Hunt share their current subject or board, following Elemental's specific rules. Its home screen, game hub, setup screens, round layout and results use the Elemental Quiz visual style and navigation pattern. Quiz Battle draws from 138 sourced multiple-choice questions: 69 general Mario and 69 Mario Kart, tagged by subject and balanced across categories in each game; a game avoids repeating the same answer when possible. Topics include characters, baddies, power-ups and items, games, consoles, tracks, and documented bugs that Nintendo has fixed. Game Order uses dated titles from Nintendo's Mario history, unlimited timed checks, 3–8 selectable tiles, Easy/Medium/Hard feedback rules and immediately saved Top 10 times; Track Finder uses the Mario Kart 8 Deluxe Booster Course Pass catalogue. Clue Match Up presents three fresh name-to-clue boards; a wrong pair uses a retry, with three retries on Rookie, one on Pro and none on Legend. Match & Hunt is one face-down icon-and-word card game with a Hunt / Time Trial switch, as in Elemental Quiz. Its icons mix original generic illustrations, emoji and text. Hunt can be relaxed or timed, with no target, a random target or a chosen target and 0–5 pairs required to unlock it. Time Trial finds 3, 5, 8 or all pairs on a 12-, 16- or 20-pair board. Relaxed Hunt has one standalone board; timed Hunt and Time Trial have three. Championship always has three matching boards, and its Time Trial board contains three times the required matches. Normal pairs earn one point; the Hunt target earns two plus a two-point win bonus. Clue Duel uses five progressively revealing clues for each of 16 authored character or track subjects, with five non-repeating rounds and more answer choices at higher levels. Category Finder uses a 40-item numbered Mario catalogue; its three rounds show consecutive 3×3, 4×4 or 5×5 windows with a valid target type. Choose Rookie, Pro or Legend and optionally show a timer. Feedback adds a related fact, and Rewind restarts the current round before Next; both matching games let you restart a go mid-round. Completed results are saved locally and visible on the High Scores screen. A text guide lists all 48 Booster Course Pass tracks by wave and cup.

The games share `src/mario/rounds.ts` for round creation and answer checks and `src/mario/session.ts` for submitting, rewinding, scoring and advancing. Championship rules and fixed Mushbot answers are in `src/mario/championship.ts`. Standalone two-player and Mushbot Quiz Battle use the same question bank with a separate turn-state engine in `src/mario/versus.ts`. Rewind does not reroll Mushbot answers.

Development:

```sh
npm install --legacy-peer-deps
npm run dev
npm run test:all
```

The app currently uses a local browser profile name and the `mariotrivia_` storage prefix. No login, account service or AI API is needed to play. Existing ElementalQuiz saved data is not read or changed.

The fork lives in a public GitHub repository. GitHub Actions runs the question audit, browser tests and production build on pushes and pull requests; a passing `main` build deploys the playable site to [GitHub Pages](https://swon404.github.io/MarioTriviaQuiz/). The public name and branding are still under review. See [the implementation checklist](docs/mario-quiz-plan.md) for the remaining modes, Mario Kart catalogue and release work.

Nintendo owns the Mario names, characters and games referenced in the questions. This fan project is not affiliated with or endorsed by Nintendo.
The background in `public/platform-landscape.png` is original AI-generated platform-game scenery, not Nintendo artwork. Nintendo sprites and artwork have not been added. Their use in a distributed app needs separate rights review or permission; an unofficial label alone does not grant it.

Setup choices are remembered on this device. Track Finder uses 4/6/9 tiles by level with clear result feedback. See the [30 September Elemental parity audit](docs/elemental-parity-audit-2026-09-30.md) for the checked rules and remaining differences.
