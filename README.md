# Mushroom Power Quiz (working title)

The public-facing title is deliberately neutral and provisional; it has not been cleared for release. The app describes its Mario subject matter plainly without using Nintendo's name or a named item as the app brand. The repository and Pages URL still use the internal `MarioTriviaQuiz` name.

Championship combines two or more supported games in Quick, Standard or Epic length. Choose Solo, Two Players or Play Computer. In versus play, each side gets the same rounds in separate turns with a handover screen; the Computer's answers are fixed before its turn. The selected difficulty carries through every leg, earned points add to each player's total, and Match & Hunt always has three rounds. Championship results are saved locally and shown on High Scores. The Elemental Quiz flip-card/time-trial Match variant remains future work.

The Elemental Quiz-style voice controls are present on the home screen, with read-aloud buttons for questions and feedback. Correct answers earn difficulty-based EP with streak bonuses; the home screen shows the player's Mario rank, EP progress, best streak and milestones. Championship totals add the EP actually earned in each game. The optional timer is currently a stopwatch, so it does not award the original countdown speed bonus.

Explore now opens a Learning Zone scaffold. Its planned character, power-up and game sections are clearly marked as unconfirmed; the reviewed Booster Course Pass track list is reached from its Mario Kart section.

A text-only, unofficial fan quiz about Mario games and Mario Kart. This is a separate local fork of ElementalQuiz at source commit `acbe7c70c4ecc9ad35020bd855b7955afce35d1f`.

The current playable milestone has six solo games: Quiz Battle, Game Order, Track Finder, Match & Hunt, Clue Duel and Category Finder. Quiz Battle also supports alternating two-player turns and a local Computer opponent, with five distinct questions per side and a handover screen. Its home screen, game hub, setup screens, round layout and results use the Elemental Quiz visual style and navigation pattern. Quiz Battle draws from 102 sourced multiple-choice questions: 51 general Mario and 51 Mario Kart, tagged by subject and balanced across categories in each game. Topics include characters, baddies, power-ups and items, games, consoles, tracks, and documented bugs that Nintendo has fixed. Game Order uses dated titles from Nintendo's Mario history; Track Finder uses the Mario Kart 8 Deluxe Booster Course Pass catalogue. Match & Hunt presents three fresh name-to-clue boards, with a target guaranteed to appear on each board. Clue Duel uses five progressively revealing clues for each of 16 authored character or track subjects, with five non-repeating rounds and more answer choices at higher levels. Category Finder uses a 40-item numbered Mario catalogue; its three rounds show consecutive 3×3, 4×4 or 5×5 windows with a valid target type. Choose Rookie, Pro or Legend and optionally show a timer for solo games. Feedback adds a related fact, and Rewind restarts the current round before Next; Match & Hunt also lets you restart a go mid-round. Completed results are saved locally and visible on the High Scores screen. A text guide lists all 48 Booster Course Pass tracks by wave and cup.

The games share `src/mario/rounds.ts` for round creation and answer checks and `src/mario/session.ts` for submitting, rewinding, scoring and advancing. Championship rules and fixed Computer answers are in `src/mario/championship.ts`. Standalone two-player and Computer Quiz Battle use the same question bank with a separate turn-state engine in `src/mario/versus.ts`. Rewind does not reroll Computer answers.

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
