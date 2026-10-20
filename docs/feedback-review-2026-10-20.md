# Post-answer feedback review — 20 October 2026

Blaize's feedback: explanations and fun facts feel bland. Treat this as a quality
issue, not a request for more exclamation marks, baby language or longer paragraphs.

## Editorial standard

- Explain the mechanism or consequence in one or two concrete sentences.
- Add a related detail that changes what the player notices or tries next time.
- Keep explanations within 48 words and facts within 35 for this batch.
- Avoid filler such as "the option can be switched off", repeating the answer,
  unrelated trivia, patronising encouragement or unsupported superlatives.
- Make edition-specific facts explicit; retain the source and review date.
- Facts should feel different from explanations, not merely rephrase them.
- Do not change answers, difficulty, history IDs or scoring just to enliven feedback.

## First completed editorial batch

18 existing `family-*` questions, across all three levels:

| Group | Count | Review evidence |
| --- | --- | --- |
| New Super Mario Bros. Wii | 3 | [Nintendo multiplayer guide](https://www.nintendo.com/en-gb/News/2009/Multiplayer-mayhem-galore-in-new-Mario-adventure--251452.html) |
| Odyssey captures | 3 | [Nintendo capture guide](https://www.nintendo.com/en-gb/News/2017/November/10-awesome-things-to-Capture-in-Super-Mario-Odyssey-1314655.html) |
| Odyssey exploration | 3 | [Play Nintendo secrets guide](https://play.nintendo.com/news-tips/tips-tricks/super-mario-odyssey-secrets-tips-tricks/) |
| Wonder powers | 3 | [Nintendo power-up guide](https://www.nintendo.com/us/whatsnew/get-a-jump-on-super-mario-bros-wonder-with-these-powerful-power-ups/) |
| Wonder help/exploration | 3 | [Nintendo support guide](https://www.nintendo.com/en-gb/Support/Nintendo-Switch/General-Tips-for-Playing-Super-Mario-Bros-Wonder-2468068.html) |
| Mario Kart World | 3 | [Nintendo World Direct overview](https://www.nintendo.com/us/whatsnew/mario-kart-world-direct-revs-up-new-details-on-the-biggest-mario-kart-ever-coming-to-nintendo-switch-2-at-launch/) |

These are editorial improvements, not 18 new questions or 18 new knowledge IDs.
The bank remains 191 questions / 180 distinct facts. Existing Learning Zone cards
use the same refreshed copy. Older saved sessions retain their saved text.

## Whole Quiz Battle bank follow-through

- [x] Rewrote the remaining 173 explanations and facts, including the two original
  Super Mario Bros. entries. Together with the first batch, all 191 quiz records
  now have the editorial pass; this is not a new-question expansion.
- [x] Rewrote every alternative in the six rotating character-fact pools.
- [x] Kept prompts, choices, answers, difficulty, sources and knowledge IDs intact.
  A bank snapshot checks that an editorial pass cannot silently change the answer key.
- [x] Checked length limits across the complete bank (48-word explanations,
  35-word facts), with six additional phone flows covering source groups,
  correct answers, wrong-answer retries and exhausted Pro attempts.
- Existing source-reviewed knowledge was reworded, contrasted or connected;
  this is an editorial review, not a claim that every source was newly rechecked.
  The character guide, US timeline and World overview were spot-checked again.
  Existing source-review dates remain factual review dates, not copy-edit dates.
- The shared quiz bank also supplies Learning Zone and selected matching/category
  feedback. Separate Clue Duel and Track Finder banks are not included in the 191.

## Remaining work

- [x] Review remaining quiz feedback, including World, Wonder, Odyssey, 3D World, Wii and SMB.
- [x] Apply this standard to all 28 Clue Duel and 23 Track Finder feedback records.
- [ ] Review Category Finder's independent relationship notes and matching-specific
  presentation for repeated text; the shared quiz copy is already refreshed.
- [x] Revisit the original six character fun-fact pools; preserve their variety/history behaviour.
- [ ] Ask Blaize which new details he enjoyed and which still feel obvious.
- [ ] Expand subject-specific fact pools after quality review; do not count rewordings as variety.
- [ ] Fix singular point labels: the phone feedback screenshot shows "1 points"
  in the player header and "+1 points" in the award. Keep the scoring unchanged.

Automated length/identity checks cannot establish that a fact is interesting.
Browser tests verify the revised text reaches answer feedback, speech, Learning
Zone and rewind without horizontal overflow. Family judgement remains essential.

Final local verification: `npm run test:all` passed the content/rules audit,
all 188 browser checks (151 Chromium, 37 WebKit), TypeScript and production/PWA
build. `git diff --check` passed. The previous intermittent WebKit click failure
did not recur in this run; its cause is not claimed fixed. Nothing was published.

## Clue Duel and Track Finder follow-through

All 28 Clue Duel explanations/facts have been rewritten to connect the clue
sequence to the answer. All 23 Track Finder tasks now use specific feedback:
cup bookends and middle races, original-system labels with examples and counts,
and four course-feature explanations. This is editorial work, not new content.
The Wave 3 and Wave 5 Nintendo sources linked in the data were checked for the
scenery descriptions; existing clue facts and course catalogue supply the rest.

Four new focused checks passed. Snapshots protect all existing clues, prompts,
answers, IDs and sources. Browser tests cover both Clue Duel outcomes and speech,
and all three Track Finder types with rewind. Phone screenshots were inspected.
Final `npm run test:all` passed for this follow-through: 192/192 browser tests
(155 Chromium, 37 WebKit), content/rules audit, TypeScript and production/PWA build.
Whitespace checks passed. The earlier WebKit click failure did not recur; its
cause remains unconfirmed. Changes remain local, not committed or deployed.
