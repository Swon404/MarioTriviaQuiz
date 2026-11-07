# Kart Quest — implemented rules and acceptance plan

Updated 7 November 2026. The user's approved banana challenge replaces the
original automatic penalty. Kart Quest is now implemented for two people
sharing one device; deployment has not been requested for this stage.

## Play

Open Play Games → Kart Quest, enter both names, and start. A randomly chosen
player rolls first. Each roll moves 1–6 spaces along a 24-space track, then
both players play the landing challenge. The landing player plays first;
this alternates with each roll. Matching uses a nine-pair Time Trial board
with a three-pair goal; Order uses four tiles on Easy. Knowledge challenges
use Rookie content with one competitive Quiz attempt.

The track prioritises Match & Hunt, Game Order and Clue Duel with seven spaces
each, plus one Quiz, one Track Finder and one Category Finder space. Clue Duel
uses one shared subject: players alternate guesses/passes, with the usual bonus
guess after a miss. Solving or revealing that subject ends the challenge; there
is no second subject. Other games keep one short go each. Existing active clue
sessions retain their saved rounds. Clue Match Up is not in this track. Each
challenge reuses the existing games, scoring, timers, feedback and history.

## Simple rules for new races

New races use `simple-v3`. Win: +2; draw: +1 each on every space. Item boxes,
Mushrooms and pipes automatically add another +2 for the winner, regardless of
who landed there. No reward selection, route choice or safe-Mushroom choice.
A Star only blocks one banana slip and never gives a win boost. Losing on your
banana moves you back one unless protected. Boosts do not launch another game.

The setup shows only Roll / Play / Race, names and Start. Each landing has one
short instruction, with details available on request. The finish still uses
equal rolls, a maximum of six rolls each and furthest distance wins.

Saved races retain their existing rules. The following effects describe those
older saves; they are not the default for new races.

## Legacy space effects

| Space | Landing player wins | Landing player loses | Draw |
| --- | --- | --- | --- |
| Open road | +2 | Rival +2 | Both +1 |
| Banana | Dodge and +2 | Slip −1; rival +2 | Neither moves |
| Pipe | Shortcut +4 | Stay; rival +2 | Neither moves |
| Rival race | +3 | Rival +3 | Both +1 |
| Mushroom dash | +3 | Stay; rival +2 | Neither moves |
| Item box | +2 and choose an item | Rival +2 and chooses | Both +1, no item |
| Star challenge | +2 and earn a Star | Rival +2 and earns a Star | Both +1, no item |

Mushroom spaces also offer a safe +1 without playing. Three junctions offer
a choice between Open Road (+2 to the winner) and a Rival Race (+3 to the
winner). These junctions feature Order, Clue Duel and Match & Hunt. Pipes
provide the larger shortcuts.

Hold one item at a time. In new races, an item-box winner chooses a Mushroom
(add +2 to a chosen future roll), Star (next challenge win adds +3, or block
one banana slip), or keeps their held item. A Star is consumed on either use;
draws and other losses retain it. A Star-space reward fills an empty slot but
never overwrites a held item. Saved races without `boost-star-v2` retain the
original shield-only Star and automatic Star-space replacement rules.
The table above shows base movement before a held Star's win boost.
No shells, skipped turns, hidden catch-up rules or chain reactions. Bonus
movement never launches another space. Competitive Kart Quest has no Rewind
or fresh-timer restart; interruption recovery preserves the same challenge.

## Finish

Reaching or passing 24 triggers the last pair of turns, so both players get
the same number of rolls. Positions may exceed 24. Furthest wins; equal
positions share the victory. End after six rolls each if neither reached 24.
The result states final positions and rolls. Race again keeps both names,
resets positions/items and generates fresh challenges.

## Saves and records

The existing recovery checkpoint stores the board, roll, item choices,
challenge, timer and result. Reload and choose Resume game to continue.
Leaving through Games explicitly confirms abandoning an unfinished race.
Starting another game replaces the single active checkpoint, as before.

Race movement is separate from game points. Completed challenges earn normal
lifetime points once, using a stable race-and-turn result ID. Finished race
positions are stored separately from Championship scores. Past races are
available in Kart Quest, and progress exports/imports include race history.
An active race is same-device recovery, not part of a progress backup.

## Implementation stage

- Pure race transitions with guards against duplicate rolls, resolutions and rewards.
- Phone board, named red/blue karts, visible positions, junction choices and items.
- All six challenge adapters; alternating first player and equal rules.
- Recovery, results, rematch, separate history and backup validation.
- Chromium and WebKit tests for rules, all adapters, reloads and a full race.
- Full repository verification required before the application commit.

## Family acceptance still needed

Play on a physical iPhone, including Home Screen/offline mode. Measure total
race duration and waiting time; the original 10–15 minute target is unverified.
Check whether dice versus challenge movement feels fair, whether +4 pipes
feel rewarding, and whether the child wants another race. Tune these values
from play rather than adding complexity immediately.

Possible later additions: character selection, themed tracks, sound effects,
shells, a computer opponent, and a genuinely branching track with different
routes to the finish. None is required to play this version.
