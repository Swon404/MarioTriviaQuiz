# Same-device game recovery

All seven modes now write one current-game checkpoint after meaningful state changes. A refresh opens Home with a Resume game offer rather than exposing a multiplayer question immediately. Starting a new game replaces the saved game; discarding it asks for confirmation. Confirmed exit clears it. Browser/site-data deletion still removes it; this is not cross-device sync or a backup service.

The snapshot keeps the round index, generated puzzles, retries, rejected choices, score state, active player, championship legs, game settings and current board state. Game Order additionally keeps tile order, selection, checks, penalties and replay frames. Matching keeps revealed cards, found pairs, target, moves, observed bot memory, practice eligibility and replay frames. Rewind still operates on the current go only; Next does not create a back-history.

Running timers include time away, including a refresh. A timer not yet started stays unstarted; a solved time stays frozen and is not saved again. Restored card animations are cancelled: an already-counted shared mismatch passes the turn, while an interrupted bot reveal clears its temporary cards and leaves the bot ready to continue. No pending callback from the old page can award points.

Completion IDs derive from the existing run ID rather than being regenerated on completion. Restoring a stale pre-completion checkpoint therefore cannot award the same result again. Existing championship summary IDs are already idempotent. Checkpoints retain the original IDs throughout recovery.

The storage envelope has a schema version, a size limit and a checksum to detect accidental corruption/truncation. The checksum is not a security/authentication feature. Invalid saved data is not offered and is retained until a new game replaces it or site data is cleared. Failed saves display a warning: the last successful checkpoint may be older than the current screen. Timers do not trigger repeated checkpoint writes. Future incompatible snapshot changes must bump the schema/kind version.

Automated coverage includes all-mode reloads, restored quiz retries, hidden two-player/Mushbot handovers, Next boundaries, timed card state, Game Order selection/solved-state recovery, duplicate-award protection and corrupt/full storage. Real iPhone/Android process eviction, background/foreground behaviour, large text and family usability still require physical-device testing. A second tab can replace the single saved checkpoint; there is no concurrent-session manager.
