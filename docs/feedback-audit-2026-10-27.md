# Answer and discovery audit — 27 October 2026

Reviewed the full active Mario content bank: 191 quiz questions, 28 Clue Duel subjects, 23 Track Finder challenges covering 48 courses, 52 Category Finder items and 11 advanced category challenges, and all 22 Game Order titles. Matching games inherit the reviewed quiz feedback.

## Editorial decisions

- Rewrote 99 quiz explanations to answer directly and remove repetitive comparisons, instructions about reading labels, and filler.
- Replaced extras on 71 quiz records with separately sourced discoveries. Refreshed the six character fact pools as well, including their default matching facts and alternative quiz facts.
- Rewrote all 28 Clue Duel explanations and extras. The extra now goes beyond the five clues.
- Replaced all 23 Track Finder extras. Cup questions get a track feature or useful tip; origin questions get a distinctive feature of the original game. Removed the repeated list of valid answers from the explanation; the answer heading and green tiles retain every valid choice.
- Replaced Category Finder's catalogue labels and repeated rule notes with discoveries. Kept the original source for membership and a separate source for the extra.
- Added one discovery per Game Order title and displayed it after solving. Previously its generated “fact” merely restated the first and last games and was never displayed by the board.
- Retained useful existing material, including the developer stories about Cow and Dash Food, version-labelled patched glitches, practical Wonder/Odyssey tips and family co-op tricks. An audit does not require replacing a good fact with a weaker one.

## Examples

| Before | After |
| --- | --- |
| “The pass brings back 4 Nintendo DS courses…” | “Mario Kart DS has boss fights! Finish a set of Mission Mode challenges to face enemies such as Big Bully or King Boo.” |
| “These are the cup’s middle races…” | “Squeaky Clean Sprint flies over a giant toilet and dives down a bathtub drain. Mario finally brought the kart to a plumbing job.” |
| A six-year gap between Mario 64 and Sunshine | Sunshine's secret platform stages can take FLUDD away, forcing Mario to rely on his jumps. |
| A console name repeated as a category fact | Mario 64's Lakitu cameraman can be spotted in the castle mirror. |
| “This line-up stretches from…” | A short feature or tip from one of the games actually on the solved board. |

## Source policy and review

New extras have their own links, independent of the answer source. The app, speech payload and restored round use the same chosen text. Examples were checked against Nintendo guides and manuals where available, and the version-specific Super Mario Wiki articles for detailed course behaviour. No invented shortcuts or unlabelled fixed glitches were added. Humorous endings are commentary on the verified mechanic, not additional gameplay claims.

Sources and assignments live beside the copy in `src/mario/discoveries.ts`, `clues.ts`, `categoryCatalog.ts` and `funFacts.ts`. Representative checked sources:

- [Nintendo: 3D World and Bowser's Fury tips](https://play.nintendo.com/news-tips/tips-tricks/tips-tricks-super-mario-3d-world-bowsers-fury/) — character abilities, crowns, collecting copies and Bowser breaking blocks.
- [Nintendo: Wonder power-up tips](https://www.nintendo.com/us/whatsnew/get-a-jump-on-super-mario-bros-wonder-with-these-powerful-power-ups/) — trunk watering, crouching attacks, bubble jumps and ceiling routes.
- [Nintendo: Booster Course Pass Wave 3](https://www.nintendo.com/us/whatsnew/mario-kart-8-deluxe-booster-course-pass-wave-3-brings-merry-mountain-mayhem-with-eight-additional-courses-on-dec-7/) — pipe ramp, Wigglers, topiary and flying sleigh train.
- [Nintendo: Squeaky Clean Sprint](https://www.nintendo.com/us/whatsnew/mario-kart-8-deluxe-booster-course-pass-more-courses-more-characters-more-giant-toilets/) — toilet flyover and drain plunge.
- [Nintendo: original Super Mario Kart manual](https://www.nintendo.co.jp/clvs/manuals/common/pdf/CLV-P-SAAFE.pdf) — the Feather's jumping ability.
- [Mario Kart DS](https://www.mariowiki.com/Mario_Kart_DS) — Mission Mode and bosses.
- [Peach Gardens](https://www.mariowiki.com/DS_Peach_Gardens) — 8 Deluxe's reversed final lap.
- [Riverside Park](https://www.mariowiki.com/Riverside_Park) — Ptooies dropping Mushrooms and Bananas.
- [Yoshi's Island course](https://www.mariowiki.com/Yoshi%27s_Island_(race_course)) — the Winged Cloud's red bridge.

## Verification

Existing answer-key and clue/target hashes remain unchanged. Added checks cover discovery coverage, source preservation, short copy across all modes, both valid DS/SNES answers on phones, visible text versus spoken text, reload/resume, and the new Game Order completion fact. Chromium and iPhone WebKit share those checks. Headless WebKit uses an explicit speech-capture adapter because it has no installed speech engine; these assertions verify utterance content, not audio playback quality.

Phone screenshots were inspected for the DS and SNES examples. Final `npm run test:all` passed: the content/rules audit checked 191 questions, 900 generated quizzes and 48 tracks; all 225 Chromium/WebKit browser tests passed; TypeScript and the production/PWA build succeeded. Learning Zone search assertions include the additional Cappy mention in the revised Odyssey explanation. `git diff --check` passed before commit.
