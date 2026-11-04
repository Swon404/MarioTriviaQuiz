# Kart Quest: board-race proposal

Status: proposed; the board mode is not implemented.

## The experience

Two karts race along a colourful 24-space track. Take turns rolling a die,
land on a game space, and both play a short challenge. Pipes are shortcuts;
bananas and shells create small setbacks. Match & Hunt and Game Order get
the most spaces because those are the family's favourites.

Aim for 10–15 minutes, to be measured in family play rather than promised.
Start with two people sharing one phone. No computer opponent in the first version.

## A turn

1. The active player rolls 1–6 and moves. Show the roll and destination clearly.
2. The destination announces a game and any item or hazard before play starts.
3. Both players play one short round. Alternate who goes first in timed games;
   use equally sized boards and the same rules. Competitive Quiz gets one attempt.
4. The challenge winner moves two bonus spaces; a draw moves both one space.
5. Apply the announced space effect, show what changed, then pass the phone.

Bonus moves, pipes and setbacks never trigger another challenge or space effect.
This prevents chains of extra turns. Never skip a player's turn or remove points.
Use each game's existing winner rules, so finding more pairs does not create
a larger movement bonus than winning a quiz question.

## Finish and fairness

- Crossing space 24 needs no exact roll. Finish the current pair of turns so
  both players have rolled equally often; allow positions beyond 24 to settle it.
- Furthest kart wins after that pair; equal positions share the victory.
- Cap the race at six rolls each. Furthest wins then if nobody reached the finish.
- Roll the starting player randomly. Dice and challenge bonuses both affect the race.
- Keep race standings separate from Championship records. Count ordinary earned
  game points toward lifetime progress once, using existing completion safeguards.

## First track

Use a fixed, balanced track with eight Match & Hunt spaces, six Game Order,
three Quiz Battle, three Clue Duel, two Track Finder and two Category Finder.
Keep Clue Match Up as an optional replacement, limited to one appearance per race.
Shuffle challenge content, not the track balance. Avoid repeating the previous
challenge where the content pool permits it.

Every space has a game; a few also have a clearly marked effect:

| Effect | Rule |
| --- | --- |
| Mushroom | Active kart gets one extra space after the challenge. |
| Pipe | Active kart takes a marked shortcut of three spaces. |
| Banana | Active kart slips back one space. |
| Shell | Active kart moves the other kart back one space. |
| Star | Shield against the next banana or shell; one held at a time. |

Effects happen automatically in the first version. Explain a shield block on
screen. Never move below the start. Keep hazards away from the opening spaces.
Do not add hidden catch-up rules; tune the small effects after family testing.

## Phone presentation

Show a compact track with both kart markers, current turn and large Roll button.
Use icons plus names on spaces, a readable text position summary, and a clear
preview of the next challenge. Open games in their existing full-screen layouts;
return to the board for a brief movement celebration. Respect reduced motion.
Avoid shrinking all 24 numbered spaces into tiny tap targets: spaces are a map,
with a separate readable panel for the current destination.

## Build stages

1. **Playable race:** pure rules/state, fixed track, dice, two players, Match & Hunt
   and Order challenges, finish rules and save/resume. Review this first.
2. **Variety and items:** remaining challenge adapters, the five effects, balanced
   track and no-repeat selection. Commit each completed stage.
3. **Phone polish:** movement feedback, sound controls, reduced motion, clear
   winner explanation and separate race history.
4. **Family trial:** measure duration, waiting time, whether luck feels fair and
   whether another race is appealing. Tune before adding tracks or a computer.

Test duplicate taps, refresh during a roll/challenge/effect, one-time awards,
blocked hazards, tied games, equal final turns, the turn cap, and offline resume.
Run the repository's full verification gate before committing application stages.

## Delivered alongside this proposal

Championship now offers Super Quick: one round per selected game. Time Trial
uses a nine-pair board with a three-pair goal. Random games selects three
available modes and leaves the selection editable before starting.
