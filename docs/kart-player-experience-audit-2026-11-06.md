# Kart Quest player experience audit

6 November 2026. Reviewed current rules, turn handling, results, mobile styling
and a fresh browser session at 390 × 740: setup, starting grid, banana landing
and entry into Match & Hunt. Other outcomes were traced through source and
existing tests, not all manually played. This is a design assessment, not a
child playtest or a new full regression run. No gameplay was changed.

## Implementation follow-up

The user approved implementation after this audit. Race challenges now show
named movement stakes and current positions, with standalone leaderboards and
redundant point totals hidden. Rewind/restart actions are disabled only in Kart
Quest. Existing timer/checkpoint recovery is preserved.

Finish distances are shown as Finish +N, the sixth round is explicitly final,
and a podium and named race-history winner explain the result. Track icons open
rule details, the legend uses the same artwork, and a bottom shortcut returns
players to the turn controls when they scroll out of view. Route choice is now
labelled as a stakes choice.

New races use versioned Star rules: a held Star adds +3 on the next challenge
win OR blocks a banana slip, then is consumed. Draws and ordinary losses retain
it. Mushrooms remain +2 on a chosen roll. A Star-space reward cannot overwrite a
held item in new races; item boxes let the player keep their current item.
Saved races without the new rules marker keep their original Star behaviour.

Family acceptance testing below remains a real-person task. Shuffled layouts,
harder races and comeback bonuses remain deferred until playtest evidence shows
which would help; no claim is made that automated tests establish fun.

## Overall judgement

The core is promising: recognisable pieces, a real road, anticipation from the
die and movement, favourite games, and a reason for both players to stay involved.
One shared Clue Duel is a particularly good fit. Compact challenge results now
show actual movement and both times. No missed turns and equal rolls are good
family-game choices.

The main weakness is continuity. The race disappears during a challenge, and
players are asked to understand generic scores, different hazard rules and an
unusual finish condition. Improve those before adding more modes or effects.

## Priority findings

### 1. Keep the race stakes visible during challenges — high

Observed phone screen: two points displays, round count, timer and a Top 5 panel,
but no Kart Quest label or reminder of the banana just landed on. Feedback talks
about earning one point even though the meaningful reward is track movement.

Use a compact Kart Quest strip: player colours, current spaces and the stakes.
Example: “Dad's banana: Dad wins +2; Blaize wins +2 and Dad slips back 1.”
Hide standalone leaderboard panels and redundant point totals in this mode.
Keep the timer, game instructions and useful answer explanation.

Acceptance: either player can explain what winning this challenge does without
returning to the board. Match, Order and Clue Duel all retain the same race strip.

### 2. Make the finish understandable — high

Positions can exceed 24 and furthest distance wins. Both pieces visually stop at
24 and show FINISH, even if one is on 25 and the other on 29. A player may cross
the line first, still play a challenge, then lose after the rival's final roll.
The equal-roll rule is reasonable but the road does not explain the outcome.

Preserve the current rules initially: announce the final chance, show “Finish
+5” for distance beyond 24, and explain the result with both distances. Mark the
sixth roll as FINAL ROUND even when neither player has reached the line.
Changing to first-past-the-post would be a separate scoring decision.

Acceptance: a 25–29 finish and a six-roll finish below 24 both explain the winner
without opening rules. Do not hide unequal distances behind two identical tokens.

### 3. Competitive retries undermine the race — high

Non-Quiz feedback still offers Rewind. The undo handler resets the same round;
practice tracking excludes timed leaderboard records, but does not exclude that
attempt from the Kart Quest winner calculation. A player can learn a revealed
answer or board, retry, and still affect the race.

Choose an explicit competitive retry rule. Recommended: no answer-revealing
rewind or fresh-timer restart during a scored Kart Quest challenge. Preserve a
safe way to recover from interruptions without granting a faster practice run.
This changes available competitive actions, so implement as a distinct stage.

Acceptance: replaying a known answer cannot change who receives track movement.
Reloading still preserves the current turn and elapsed time correctly.

### 4. Explain hazards with names, not a rule paragraph — high

The banana panel says “landing player”, “rival”, win/loss/draw and Star in one
paragraph. The player must translate all of that while excited about the roll.

Show two short named outcomes, then a smaller draw line. On a pipe, say exactly
where the shortcut ends, e.g. “Blaize wins: space 5 → 9”. Use the same custom
icons on landing cards and the legend as on the road. Allow tapping a board icon
to read its rule; current board cells are not interactive.

Acceptance: the child can identify their own win/loss movement before starting.

### 5. The power-up choice is lopsided — medium, balance decision

Mushroom offers a guaranteed +2 on a chosen future roll. Star only prevents one
possible -1 banana slip, and requires landing on a banana and losing. Mushroom
is usually the obvious pick on movement value. Stars can also automatically
replace a held Mushroom after winning a Star space.

Rework Star into a comparable, clearly explained benefit, or make shields a
separate slot so earning one cannot overwrite a boost. Decide the exact rule
before implementation. Do not add several more items until these two feel useful.

Acceptance: both item choices have a situation where a player wants them, and
no surprise replacement destroys a more desirable reward without clear notice.

### 6. Route choice is really a stakes choice — medium

The Open Road and Rival Race choices use the same game and same visual road.
Only the winner's movement changes (+2 versus +3); either player can win. It is
a real tactical choice based on confidence and lead, but not a different route.

Rename it “Choose the stakes” with “Winner +2” / “Winner +3 — either of you!”,
or draw actual branching routes. Renaming is the simpler first improvement.
Explain draw movement on this screen too.

### 7. Reduce scrolling and repeated confirmation — medium

Observed at phone size: the road starts about 340px down the initial screen and
extends below the viewport. Automatic movement scrolling can take turn and
player cards out of view. Landing instructions and Play challenge sit above the
road, so later positions can take the player away from the next action.

Keep the slower dice and car movement requested by the family. Add a compact
sticky turn/action area, with a clear “Continue” action after movement settles.
Avoid duplicate reward narration across result, board summary and Next roll.
Keep answer feedback available rather than removing useful learning content.

Acceptance: after moving near space 24, the next action and current player remain
visible without searching or scrolling back through the entire track.

### 8. Repeated races need gentle variation — medium, test with family

Seven spaces each for Match, Order and Clue Duel is a good starting distribution,
but equal tile counts do not guarantee equal plays: dice, bonuses and finishing
early affect which spaces are reached. The mode layout is fixed and difficulty
is always Rookie/Easy (Order four tiles; matching find three of nine pairs).

First observe several races: record actual mode counts, race length and points
where attention drops. Then consider shuffled mode labels with the same hazards
and 7/7/7 totals, or an optional harder race for familiar players. Keep the current
accessible race as the default. No evidence yet that a comeback bonus is needed.

### 9. Make the finish more rewarding — lower

The final screen is mostly the same board with a winner heading and Race again.
Past races list names, positions and roll count without a clear winner label.

Add a brief podium, explicit winner/draw and one earned highlight (fastest
challenge or biggest shortcut, only if supported by recorded data). Offer rematch
prominently. Respect reduced motion; don't make players wait through a celebration.

## Suggested implementation order

1. Race context, named hazard outcomes, compact phone controls and clearer final
   round/finish display. Preserve scoring.
2. Competitive retry policy, then Star/Mushroom balance as separate reviewed rules.
3. Stakes-choice wording, podium and history clarity.
4. Family playtest, then replay variety based on observed boredom points.

## Family acceptance check

Play one race without explaining the interface. Ask at the natural moments:
“Whose turn?”, “What happens if you win?”, “Why did that kart move?”, “Who is
winning?”, and “Why did the race finish?” Note hesitation rather than coaching.
Repeat once with a banana loss, a shared Clue Duel pass, an item replacement and
both karts past 24. Success means understandable outcomes and both players still
wanting the next roll, not merely passing automated tests.
