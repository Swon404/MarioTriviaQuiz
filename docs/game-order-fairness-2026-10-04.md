# Comparable Game Order turns

The previous generator picked opponents' boards independently. One player could receive a nearly solved board while the other needed many swaps, or their games could span very different eras.

Two-player and Mushbot sessions now generate adjacent turns as a pair, including championship legs:

- Divide the reviewed chronological catalogue into neighbouring pairs and select the requested number of pairs.
- Give each player one title from every selected pair. Their boards share no titles within that duel and cover corresponding parts of the timeline.
- Randomise the first board under the existing challenge rules. Relabel its permutation for the second board, preserving cycle lengths. This gives both boards equal minimum swaps and equal numbers of initially correct tiles while allowing different arrangements.
- Retain the existing Easy/Medium rule that no tile starts correctly placed. Hard never starts fully solved.
- Reject repeated whole-board sets within the session. Solo generation is unchanged.

This is structural comparability, not a promise that every title is equally familiar. Adjacent catalogue entries can be several years apart. The family should still judge whether knowledge difficulty feels comparable. Hint rules, penalties, tile choices, scoring and leaderboard rulesets are unchanged.

The content/rules audit exercises all nine level/tile combinations and all three hint settings over twenty deterministic seeds, with ten-turn Epic championships: 2,700 paired puzzles checked for matching chronological groups, equal swap work, no shared titles within a pair, no solved starts and no repeated board sets. Browser regressions exercise the existing handovers and championship flow.
