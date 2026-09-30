# Elemental Quiz structure audit for the Mario fork

Checked against the sibling `ElementalQuiz` project on 28 September 2026. This is a structure comparison, not a promise to copy element-specific games or content.

| Part | Elemental Quiz | Mario fork now | Remaining difference |
| --- | --- | --- | --- |
| Home | Player greeting, progress, Play, Explore, Create, voice settings | Greeting, EP/rank, Play, Learning Zone, voice settings | Mario has no creation feature; do not add an empty Create button. |
| Player choice | Solo, 2 Players, Play Elementor chosen on the game hub | Solo, 2 Players, Play Mushbot chosen on the game hub; game setup can still change it | Matched basic navigation. Mushbot has an original spotted-red mascot. |
| Games | Eight games described by a central game catalog | Seven playable themed games, all with the three player formats and a combined Mario/Kart topic pool | Game counts and variants differ by theme; no need for one-to-one copies. |
| Championship | Quick, Standard, Epic; selected games; running totals | Same length choices, selected games, and EP totals | Mushbot is scored automatically after each game instead of showing a second playable leg. |
| Questions | Generated element facts, explanations, related fun facts, repetition checks | 138 reviewed four-choice Mario/Kart questions, explanations, fun facts, source links; category-balanced quiz selection now avoids the same answer within a game | Mario facts are authored rather than generated; continue extending the pool with source checks. |
| Scores | Per-game and Championship leaderboards; replay for some timed modes | Completed game and Championship scores, stored separately from Elemental Quiz | Replay and per-configuration top lists are not yet present. |
| Profiles | Multiple saved profiles with separate progress | Player name switch; progress is calculated from saved results by name | Full profile management and deletion are not yet present. |
| Explore | Populated periodic-table learning area | Learning Zone scaffold and verified Kart track guide | Character, item, and game guides remain intentionally unfilled pending content review. |

The fork now follows Elemental Quiz's basic path: Home → choose player format → choose game or Championship → setup → play → result → High Scores. The same image asset is used in the hub, setup, and results so the selected computer opponent has a consistent identity. The remaining differences above are larger feature projects, not hidden parity claims.
