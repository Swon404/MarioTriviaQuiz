# Post-answer feedback review — 20 October 2026

Blaize's feedback: explanations and fun facts feel bland. Treat this as a quality
issue, not a request for more exclamation marks, baby language or longer paragraphs.

## Editorial standard

### Pre-commit verification — 21 October

At the user's commit/push request, a fresh `npm run test:all` passed the content
audit, all 200 browser tests (163 Chromium, 37 WebKit), TypeScript and the complete
production/PWA build. Championship recovery passed in that full run. Whitespace
checks passed. Earlier failures below remain historical evidence: no root-cause
fix for the intermittent Windows WebKit setup click is claimed. GitHub tests and
deployment must still be checked against the pushed commit.

### Follow-up: agreed tips/tricks/glitches direction

The user explicitly chose useful tips, tricks, glitches and funny details.
`src/mario/playfulFeedback.ts` records 17 concise extras with source URLs,
content type and (where relevant) patch version. The original answer source is
retained; a supplementary link is displayed when the extra uses another page.
This layer is applied consistently to the quiz bank, Learning Zone and matching
spotlights without adding questions or changing the correct answers.

Sources checked for this batch:

- [World update history](https://www.nintendo.com/en-gb/Support/Nintendo-Switch-2/Game-Updates/How-to-Update-Mario-Kart-World-2842542.html): P Switch travel, ghost replay, UFO transformation, and explicitly patched bugs in v1.3.0–v1.7.0.
- [World launch guide](https://www.nintendo.com/us/whatsnew/mario-kart-world-direct-revs-up-new-details-on-the-biggest-mario-kart-ever-coming-to-nintendo-switch-2-at-launch/): Charge Jump as a defensive move.
- [World developer interview](https://www.nintendo.com/en-ca/whatsnew/ask-the-developer-vol-18-mario-kart-world-part-3/): the hamburger prototype that revived food.
- [Wonder power-up tips](https://www.nintendo.com/us/whatsnew/get-a-jump-on-super-mario-bros-wonder-with-these-powerful-power-ups/): spraying Goombas and exploring ceilings.
- [Odyssey secrets](https://play.nintendo.com/news-tips/tips-tricks/super-mario-odyssey-secrets-tips-tricks/): sparkling Moon clues and nearby seed pots.
- [3D World/Fury tips](https://play.nintendo.com/news-tips/tips-tricks/tips-tricks-super-mario-3d-world-bowsers-fury/): crown stealing and using Bowser to break blocks.
- [Wii multiplayer guide](https://www.nintendo.com/en-gb/News/2009/Multiplayer-mayhem-galore-in-new-Mario-adventure--251452.html): take control during the help demonstration.

Five focused tests pass: all extras and versions, serialised sources across quiz
and both matching modes, phone solo/two-player feedback, speech, Learning Zone
and rewind. An initial test sampled only Pro matching (which had no selected
extras); it now explicitly covers Rookie matching and requires actual matches.
The full final gate passed the content audit and 199/200 browser tests. WebKit
Championship recovery timed out at `resume.spec.ts:169` while clicking the
visible/enabled/stable Two Players button, before its click completed. This is
the previously observed setup-click symptom; its cause remains unresolved.
Three isolated single-worker reruns passed. No assertion was weakened, no retry
was added to the suite, and no app/test edits followed the full run. A separate
production build passed (TypeScript, Vite and PWA); it was run separately because
the failed suite stopped the chained build. Whitespace checks passed. Do not call
this a clean release gate. Phone feedback was visually checked;
physical-device acceptance remains open. This is a content batch, not whole-bank
acceptance, and nothing was committed or pushed.

### 21 October: family rejected the current quality

The completed rewrites below are historical delivery records, not quality
acceptance. Seven entries now have more specific feedback: `fresh-13`, `fresh-21`,
`gameplay-3dw-rescue`, `gameplay-3dw-float`, `gameplay-3dw-cherry`,
`gameplay-3dw-rosalina`, and `gameplay-world-kamek`. The remaining bank and other
modes still need substantive review; do not call a paraphrase a new fun fact.

Sources checked on 21 October:

- [Nintendo's 3D World tips](https://play.nintendo.com/news-tips/tips-tricks/tips-tricks-super-mario-3d-world-bowsers-fury/): regrouping clones and character switches.
- [Nintendo's 3D World guide](https://www.nintendo.com/sg/switch/auzp/3dworld/index.html): crown bonus and wearable Cannon Box.
- [World developer interview, part 3](https://www.nintendo.com/en-ca/whatsnew/ask-the-developer-vol-18-mario-kart-world-part-3/): Cow's jump pose, truck sketch and the link to Kamek's item.
- [Wonder developer interview, part 1](https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-11-super-mario-bros-wonder-part-1/): rejected live-action Mario idea.

Question IDs, prompts, choices, correct answers and difficulty are unchanged.
Three source links were deliberately replaced with the better supporting page;
the answer-key/source snapshot was updated accordingly. Later individual source
reviews now survive the older blanket review function.

Pro Category Finder now has one correct tile, eight same-family alternatives,
and priority near misses. All seeded tests require exactly one answer and every
curated near miss. Phone tests cover wrong/correct feedback, reload and rewind;
score tests keep the older easier boards separate. Advanced feedback no longer
prints its relationship note twice. Saved games retain their original boards.

Focused verification: content audit and 17 browser tests passed. The first full
run exposed one older test expecting three correct Pro tiles; that assertion was
updated to one without removing its original-release or highlighting checks.
After the final test edit, `npm run test:all` passed: content/rules audit, all
195 browser tests (158 Chromium, 37 iPhone/WebKit), TypeScript and production/PWA
build. The 390px Pro board screenshot was visually inspected. Whitespace checks
passed. Physical-phone/family acceptance remains open. No commit or deployment
requested; changes are local. The build's stale Browserslist-data warning is
non-fatal and dependency updates are outside this batch.

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
