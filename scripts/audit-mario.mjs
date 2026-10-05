import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { QUESTIONS, createQuiz } from '../src/mario/questions.ts';
import { canonicalKnowledge } from '../src/mario/knowledge.ts';
import { GAMEPLAY_QUESTIONS, GAMEPLAY_REVIEW } from '../src/mario/gameplayQuestions.ts';
import { BOOSTER_COURSES } from '../src/mario/courses.ts';
import { TRACK_CHALLENGES, trackLabel } from '../src/mario/trackChallenges.ts';
import { availableModes, createRounds, DEFAULT_PAIR_OPTIONS, isCorrect, MARIO_TIMELINE } from '../src/mario/rounds.ts';
import { CLUE_SUBJECTS, CLUE_CHOICE_GROUPS, clueSimilarity } from '../src/mario/clues.ts';
import { CATEGORY_ITEMS, fitsCategory } from '../src/mario/categoryCatalog.ts';
import { ICON_PAIRS } from '../src/mario/pairCatalog.ts';
import { advanceVersusQuiz, answerVersusQuiz, attemptVersusQuiz, rewindVersusQuiz, startVersusQuiz } from '../src/mario/versus.ts';
import { advance, attemptQuiz, rewind, startSession, submit } from '../src/mario/session.ts';
import { calculatePoints } from '../src/mario/scoring.ts';
import { championshipPoints, championshipRoundCount, computerChampionshipAnswers, createChampionshipRounds } from '../src/mario/championship.ts';
import { newTurnScores, scoreTurn } from '../src/mario/turns.ts';
import { orderTileOptions } from '../src/mario/gameOrder.ts';
import { MATCH_CLUES, knowledgeLevel } from '../src/mario/matchClues.ts';
import { chooseMemoryCard, rememberCard, seededBotRandom } from '../src/mario/memoryBot.ts';
import { computerRoundTime } from '../src/mario/botTiming.ts';

function orderWork(round) {
  const permutation = round.tiles.map(tile => round.correctIds.indexOf(tile.id));
  const visited = new Set();
  let cycles = 0;
  for (let index = 0; index < permutation.length; index++) {
    if (visited.has(index)) continue;
    cycles++;
    for (let next = index; !visited.has(next); next = permutation[next]) visited.add(next);
  }
  return [permutation.length - cycles, permutation.filter((value, index) => value === index).length];
}
for (const level of ['explorer', 'scientist', 'professor']) {
  for (const tiles of orderTileOptions(level)) {
    for (const challenge of ['easy', 'medium', 'hard']) {
      for (let seed = 0; seed < 20; seed++) {
        const options = { tiles, challenge };
        const rounds = createChampionshipRounds('game-order', 'mixed', level, 'epic', seededBotRandom(`order-${level}-${tiles}-${challenge}-${seed}`), DEFAULT_PAIR_OPTIONS, 2, options);
        assert.equal(rounds.length, 10);
        assert.equal(new Set(rounds.map(round => round.id)).size, 10);
        for (let index = 0; index < rounds.length; index += 2) {
          const [first, second] = rounds.slice(index, index + 2);
          assert.deepEqual(orderWork(first), orderWork(second), 'Opponents have equal minimum swaps and starting correct positions');
          assert.ok(orderWork(first)[0] > 0, 'Neither board starts solved');
          if (challenge !== 'hard') assert.equal(orderWork(first)[1], 0);
          assert.equal(first.tiles.length, tiles);
          assert.ok(first.tiles.every(tile => !second.correctIds.includes(tile.id)), 'Opponent must not repeat the same titles');
          const strata = round => round.correctIds.map(id => Math.floor(MARIO_TIMELINE.findIndex(game => game.id === id) / 2));
          assert.deepEqual(strata(first), strata(second), 'Both players draw from matching chronological neighbourhoods');
        }
      }
    }
  }
}

assert.equal(new Set(ICON_PAIRS.map(pair => `${pair.iconKind}:${pair.icon}`)).size, ICON_PAIRS.length, 'Different pair names must not share identical art');
assert.equal(new Set(MATCH_CLUES.map(item => item.clue)).size, MATCH_CLUES.length);
assert.equal(QUESTIONS.find(question => question.id === 'mario-professor-8').knowledgeId,
  QUESTIONS.find(question => question.id === 'mario-explorer-5').knowledgeId,
  'Reworded Rosalina/Luma questions share history across levels');
for (const [id, knowledgeId] of [['mario-explorer-6', 'mario-explorer-6-v2'], ['mario-explorer-10', 'expanded-14']]) {
  const question = QUESTIONS.find(question => question.id === id);
  assert.equal(question.knowledgeId, knowledgeId, 'Changed facts use a new identity or an existing equivalent');
  assert.equal(MATCH_CLUES.find(item => item.question.id === id).question.knowledgeId, question.knowledgeId);
}
for (const item of MATCH_CLUES) {
  assert.ok(item.clue.length <= 110, `Matching clue too long: ${item.id}`);
  assert.equal(item.name, item.question.answer);
  assert.notEqual(item.question.category, 'glitches', 'Patch trivia needs a separate advanced review before matching use');
}
for (let start = 0; start <= CATEGORY_ITEMS.length - 25; start++) {
  for (let column = 0; column < 5; column++) {
    assert.ok(new Set(Array.from({ length: 5 }, (_, row) => CATEGORY_ITEMS[start + row * 5 + column].category)).size > 1, 'Category cannot be inferred from a column');
  }
}
const observed = [{ position: 2, pairId: 'a', kind: 'word' }, { position: 4, pairId: 'a', kind: 'icon' }];
assert.equal(chooseMemoryCard([0, 1, 2, 3, 4], observed, () => 0.99), 2);
assert.equal(chooseMemoryCard([0, 1, 3, 4], observed, () => 0, observed[0]), 4);
assert.equal(chooseMemoryCard([0, 1, 3], observed, () => 0), 0, 'Unknown cards chosen by position, not hidden pair ID');
let memory = [];
for (let position = 0; position < 12; position++) memory = rememberCard(memory, { position, pairId: String(position), kind: 'word' }, 'explorer');
assert.equal(memory.length, 6);
assert.equal(memory[0].position, 6);
const randomA = seededBotRandom('same-board');
const randomB = seededBotRandom('same-board');
assert.deepEqual(Array.from({ length: 20 }, randomA), Array.from({ length: 20 }, randomB), 'Restarting the same board resets the bot random sequence');
const smallHunt = createRounds('pair-match', 'mixed', 'explorer', Math.random, { ...DEFAULT_PAIR_OPTIONS, pairCount: 12 })[0];
const largeHunt = createRounds('pair-match', 'mixed', 'explorer', Math.random, { ...DEFAULT_PAIR_OPTIONS, pairCount: 20 })[0];
assert.ok(computerRoundTime(largeHunt, 'explorer', () => 0.5) > computerRoundTime(smallHunt, 'explorer', () => 0.5));
assert.ok(computerRoundTime(smallHunt, 'professor', () => 0.5) < computerRoundTime(smallHunt, 'explorer', () => 0.5));

assert.equal(calculatePoints('explorer', true, 0), 12);
assert.equal(calculatePoints('scientist', true, 3), 50);
assert.equal(calculatePoints('professor', false, 12), 0);
for (const [difficulty, retries] of [['explorer', 3], ['scientist', 1], ['professor', 0]]) {
  let solo = startSession(createRounds('quiz', 'mixed', difficulty), difficulty);
  let duel = startVersusQuiz('mixed', difficulty, 'human');
  const soloQuestion = solo.rounds[0].question;
  const duelQuestion = duel.turns[0].question;
  for (let index = 0; index < Math.min(retries + 1, 3); index += 1) {
    const soloWrong = soloQuestion.choices.filter(choice => choice !== soloQuestion.answer)[index];
    const duelWrong = duelQuestion.choices.filter(choice => choice !== duelQuestion.answer)[index];
    solo = attemptQuiz(solo, soloWrong);
    duel = attemptVersusQuiz(duel, duelWrong);
    assert.equal(!!solo.submission, index >= retries);
    assert.equal(!!duel.submission, index >= retries);
    assert.equal(attemptQuiz(solo, soloWrong), solo, 'Duplicate taps cannot consume retries');
    assert.equal(attemptVersusQuiz(duel, duelWrong), duel);
    assert.equal(solo.points, 0);
    assert.deepEqual(duel.points, [0, 0]);
    if (!solo.submission) assert.equal(advance(solo), solo);
    if (!duel.submission) assert.equal(advanceVersusQuiz(duel), duel);
  }
  if (retries === 3) {
    solo = attemptQuiz(solo, soloQuestion.answer);
    duel = attemptVersusQuiz(duel, duelQuestion.answer);
    assert.ok(solo.submission.correct);
    assert.ok(duel.submission.correct);
  }
  assert.deepEqual(rewind(solo).wrongAnswers, []);
  assert.deepEqual(rewindVersusQuiz(duel).wrongAnswers, []);
  assert.deepEqual(advance(solo).wrongAnswers, []);
  assert.deepEqual(advanceVersusQuiz(duel).wrongAnswers, []);
  assert.equal(advance(solo).points, solo.submission.points);
  assert.equal(advanceVersusQuiz(duel).points[0], duel.submission.points);
}
assert.equal(championshipPoints([{ correct: 3, points: 36 }, { correct: 2, points: 24 }]), 60);
for (const size of ['quick', 'standard', 'epic']) assert.equal(championshipRoundCount('pair-match', size), 3);
const huntComputerRounds = createRounds('pair-match', 'mario', 'explorer');
assert.deepEqual(computerChampionshipAnswers(huntComputerRounds, 'explorer'), huntComputerRounds.map(round => round.completionId));
const computerRounds = createRounds('quiz', 'mario', 'explorer').slice(0, 3);
assert.deepEqual(computerChampionshipAnswers(computerRounds, 'explorer', () => 0), computerRounds.map(round => round.question.answer));
assert.ok(computerChampionshipAnswers(computerRounds, 'explorer', () => 0.99).every((answer, index) => answer !== computerRounds[index].question.answer));

assert.equal(QUESTIONS.length, 166, 'Original bank plus 28 genuinely new gameplay questions');
const ids = new Set();
for (const mode of ['clue-duel', 'track-finder']) {
  const first = createRounds(mode, 'mixed', 'explorer');
  const history = first.map(round => round.id);
  const second = createRounds(mode, 'mixed', 'explorer', Math.random, DEFAULT_PAIR_OPTIONS, undefined, undefined, history);
  assert.ok(second.every(round => !history.includes(round.id) && !round.review), `${mode}: prefer unseen challenges`);
  const all = mode === 'clue-duel' ? CLUE_SUBJECTS.map(subject => `clue-${subject.id}`) : TRACK_CHALLENGES.map(task => `finder-${task.id}`);
  const exhausted = createRounds(mode, 'mixed', 'explorer', Math.random, DEFAULT_PAIR_OPTIONS, undefined, undefined, all);
  assert.ok(exhausted.every(round => round.review), `${mode}: exhaustion remains playable and labelled`);
  if (mode === 'track-finder') {
    for (const round of exhausted) {
      const oldest = TRACK_CHALLENGES.filter(task => task.kind === round.challengeKind).at(-1);
      assert.equal(round.id, `finder-${oldest.id}`, 'Review the oldest task in each required kind');
    }
  }
  const championship = createChampionshipRounds(mode, 'mixed', 'explorer', 'quick', Math.random, DEFAULT_PAIR_OPTIONS, 2, undefined, all);
  assert.ok(championship.every(round => round.review), 'Championship carries history through generation');
}
for (const difficulty of ['explorer', 'scientist', 'professor']) {
  const first = createRounds('match-hunt', 'mixed', difficulty, Math.random, DEFAULT_PAIR_OPTIONS, 1)[0];
  const history = first.pairs.map(pair => QUESTIONS.find(question => question.id === pair.id).knowledgeId);
  const next = createRounds('match-hunt', 'mixed', difficulty, Math.random, DEFAULT_PAIR_OPTIONS, 1, undefined, history)[0];
  assert.equal(next.reviewCount, 0, 'Matching avoids facts just seen in matching or Quiz Battle');
  assert.ok(next.pairs.every(pair => !history.includes(QUESTIONS.find(question => question.id === pair.id).knowledgeId)));
  const all = QUESTIONS.map(question => question.knowledgeId);
  const exhausted = createRounds('match-hunt', 'mixed', difficulty, Math.random, DEFAULT_PAIR_OPTIONS, undefined, undefined, all);
  assert.ok(exhausted.every(round => round.reviewCount === round.pairs.length));
}
const prompts = new Set();
for (const question of QUESTIONS) {
  assert.ok(!ids.has(question.id), `Duplicate ID: ${question.id}`);
  ids.add(question.id);
  assert.ok(!prompts.has(question.prompt), `Duplicate prompt: ${question.prompt}`);
  prompts.add(question.prompt);
  assert.equal(question.choices.length, 4, `${question.id}: choice count`);
  assert.equal(new Set(question.choices).size, 4, `${question.id}: duplicate choices`);
  assert.equal(question.choices.filter(choice => choice === question.answer).length, 1, `${question.id}: answer`);
  assert.ok(question.explanation.length > 40, `${question.id}: thin explanation`);
  assert.ok(question.funFact.length > 25, `${question.id}: thin fun fact`);
  assert.ok(question.sourceUrl.startsWith('https://'), `${question.id}: missing source`);
  assert.ok(['characters', 'baddies', 'power-ups', 'games', 'consoles', 'tracks', 'glitches'].includes(question.category), `${question.id}: invalid category`);
}
// Glitch trivia is optional advanced material, not a quota to fill with Rookie patch notes.
for (const category of ['characters', 'baddies', 'power-ups', 'games', 'consoles', 'tracks']) {
  assert.ok(QUESTIONS.filter(question => question.category === category).length >= 6, `${category}: too few questions`);
}
for (const topic of ['mario', 'kart', 'mixed']) {
  for (const difficulty of ['explorer', 'scientist', 'professor']) {
    for (let run = 0; run < 100; run += 1) {
      const quiz = createQuiz(topic, difficulty, 10);
      assert.equal(quiz.length, 10);
      assert.equal(new Set(quiz.map(question => question.knowledgeId)).size, 10, `${topic}/${difficulty}: repeated knowledge`);
      assert.equal(new Set(quiz.map(question => question.answer)).size, 10, `${topic}/${difficulty}: repeated answer`);
      assert.equal(new Set(quiz.map(question => question.funFact)).size, 10, `${topic}/${difficulty}: repeated fun fact`);
      assert.ok(new Set(quiz.map(question => question.category)).size >= 3, `${topic}/${difficulty}: too few categories`);
      assert.ok(quiz.every(question => question.difficulty === difficulty && (topic === 'mixed' || question.topic === topic)));
    }
  }
}
const rookieKartFacts = new Set(QUESTIONS.filter(question => question.topic === 'kart' && question.difficulty === 'explorer').map(question => question.knowledgeId)).size;
assert.throws(() => createQuiz('kart', 'explorer', rookieKartFacts + 1), /distinct facts/);
assert.equal(GAMEPLAY_QUESTIONS.length, 28);
assert.equal(GAMEPLAY_REVIEW.status, 'source-checked');
for (const topic of ['mario', 'kart']) {
  for (const difficulty of ['explorer', 'scientist', 'professor']) {
    const pilot = GAMEPLAY_QUESTIONS.filter(question => question.topic === topic && question.difficulty === difficulty);
    assert.ok(pilot.length >= 2, 'Pilot expands every topic/level combination');
    const seen = QUESTIONS.filter(question => !question.id.startsWith('gameplay-')).map(question => question.knowledgeId);
    const quiz = createQuiz(topic, difficulty, 10, Math.random, seen);
    assert.deepEqual(new Set(quiz.slice(0, pilot.length).map(question => question.id)), new Set(pilot.map(question => question.id)), 'Existing players receive the new facts first');
    assert.ok(quiz.slice(0, pilot.length).every(question => !question.review));
  }
}
for (const level of ['explorer', 'scientist', 'professor']) {
  const history = [];
  const unique = new Set(QUESTIONS.filter(item => item.difficulty === level).map(item => item.knowledgeId)).size;
  const rounds = Math.floor(unique / 10);
  for (let game = 0; game < rounds; game++) {
    const quiz = createQuiz('mixed', level, 10, Math.random, history);
    assert.ok(quiz.every(item => !history.includes(item.knowledgeId) && !item.review), 'Unseen knowledge must be preferred across games');
    history.unshift(...quiz.map(item => item.knowledgeId));
  }
  const allSeen = [...new Set(QUESTIONS.filter(item => item.difficulty === level).map(item => item.knowledgeId))];
  const review = createQuiz('mixed', level, 10, Math.random, allSeen);
  assert.ok(review.every(item => item.review));
  assert.deepEqual(review.map(item => item.knowledgeId), allSeen.slice(-10).reverse(), 'Oldest facts reviewed first');
}
assert.equal(QUESTIONS.find(item => item.id === 'expanded-28').knowledgeId, QUESTIONS.find(item => item.id === 'kart-explorer-4').knowledgeId);
assert.equal(BOOSTER_COURSES.length, 48);
assert.equal(new Set(BOOSTER_COURSES.map(course => course.id)).size, 48);
assert.equal(new Set(BOOSTER_COURSES.map(course => course.cup)).size, 12);
for (let wave = 1; wave <= 6; wave += 1) {
  assert.equal(BOOSTER_COURSES.filter(course => course.wave === wave).length, 8);
}
for (const cup of new Set(BOOSTER_COURSES.map(course => course.cup))) {
  const courses = BOOSTER_COURSES.filter(course => course.cup === cup);
  assert.deepEqual(courses.map(course => course.position), [1, 2, 3, 4]);
}
assert.equal(new Set(MARIO_TIMELINE.map(game => game.year)).size, MARIO_TIMELINE.length);
assert.equal(MARIO_TIMELINE.length, 22, 'Expanded source-checked Game Order pool');
assert.equal(new Set(MARIO_TIMELINE.map(game => game.id)).size, MARIO_TIMELINE.length);
assert.equal(ICON_PAIRS.length, 40);
assert.equal(new Set(ICON_PAIRS.map(pair => pair.id)).size, ICON_PAIRS.length);
assert.ok(ICON_PAIRS.every(pair => pair.icon && pair.name === pair.question.answer));
assert.ok(ICON_PAIRS.every(pair => ['emoji', 'svg', 'image', 'text'].includes(pair.iconKind)));
for (const pair of ICON_PAIRS.filter(item => item.iconKind === 'svg' || item.iconKind === 'image')) {
  assert.ok(existsSync(new URL(`../public/${pair.icon}`, import.meta.url)), `${pair.name}: missing icon`);
  assert.ok(pair.iconAlt.length > 8, `${pair.name}: missing accessible description`);
}
assert.equal(ICON_PAIRS.filter(pair => pair.iconKind === 'image').length, 38);
for (const name of ['Coconut Mall', 'Choco Mountain', 'Rainbow Road', 'Merry Mountain', 'Sky-High Sundae', 'Ninja Hideaway', 'Boo Cinema', 'Starview Peak', 'Crown City']) {
  assert.ok(!ICON_PAIRS.some(pair => pair.name === name), `${name}: track scenery must not return to matching`);
}
for (const name of ['Luigi', 'Wario', 'Waluigi', 'Bowser Jr.', 'Dry Bones', 'Cow', 'Birdo', 'Funky Kong', 'Kamek']) {
  assert.equal(ICON_PAIRS.find(pair => pair.name === name)?.iconKind, 'image', `${name}: missing replacement artwork`);
}
assert.equal(ICON_PAIRS.find(pair => pair.name === 'Daisy').iconKind, 'image');
for (const section of ['mario', 'kart', 'mixed']) {
  for (const difficulty of ['explorer', 'scientist', 'professor']) {
    for (const pairCount of [12, 16, 20]) {
      const rounds = createRounds('pair-match', section, difficulty, Math.random, { ...DEFAULT_PAIR_OPTIONS, pairCount });
      assert.equal(rounds.length, 1, 'Relaxed Hunt is one board outside a championship');
      for (const round of rounds) {
        assert.equal(round.mode, 'pair-match');
        assert.equal(round.variant, 'hunt');
        assert.equal(round.targetPairId, null);
        assert.equal(round.goal, pairCount);
        assert.equal(round.timed, false);
        assert.equal(round.pairs.length, pairCount);
        assert.equal(round.cards.length, pairCount * 2);
        assert.equal(new Set(round.pairs.map(pair => pair.id)).size, pairCount);
        for (const pair of round.pairs) {
          assert.deepEqual(new Set(round.cards.filter(card => card.pairId === pair.id).map(card => card.kind)), new Set(['icon', 'word']));
        }
        assert.ok(isCorrect(round, round.completionId));
        assert.ok(!isCorrect(round, 'incomplete-board'));
        assert.ok(round.sourceUrl.startsWith('https://'));
      }
    }
    const chosen = ICON_PAIRS.find(pair => section === 'mixed' || pair.topic === section);
    const hunt = createRounds('pair-match', section, difficulty, Math.random, { ...DEFAULT_PAIR_OPTIONS, targetMode: 'choose', chosenTargetId: chosen.id, unlockPairs: 2, huntTimed: true });
    assert.equal(hunt.length, 3);
    assert.ok(hunt.every(round => round.targetPairId === chosen.id && round.unlockPairs === 2 && round.timed));
    const trial = createRounds('pair-match', section, difficulty, Math.random, { ...DEFAULT_PAIR_OPTIONS, variant: 'time-trial', trialTarget: 5 });
    assert.equal(trial.length, 3);
    assert.ok(trial.every(round => round.targetPairId === null && round.goal === 5 && round.timed));
  }
}
for (const [size, goal] of [['quick', 3], ['standard', 4], ['epic', 5]]) {
  const rounds = createChampionshipRounds('pair-match', 'mario', 'explorer', size, Math.random, { ...DEFAULT_PAIR_OPTIONS, variant: 'time-trial' });
  assert.equal(rounds.length, 3);
  assert.ok(rounds.every(round => round.pairs.length === goal * 3 && round.goal === goal));
}
for (const task of TRACK_CHALLENGES) {
  assert.ok(task.correctIds.length > 0);
  assert.ok(task.correctIds.every(id => BOOSTER_COURSES.some(course => course.id === id)));
  assert.ok(task.sourceUrl.startsWith('https://'));
}
for (const difficulty of ['explorer', 'scientist', 'professor']) {
  for (let run = 0; run < 100; run++) {
    const rounds = createRounds('track-finder', 'mixed', difficulty);
    assert.equal(new Set(rounds.map(round => round.challengeKind)).size, 3, 'Each Finder session mixes cup, system and feature knowledge');
    for (const round of rounds) {
      const task = TRACK_CHALLENGES.find(task => task.prompt === round.prompt);
      assert.deepEqual(round.tiles.filter(tile => task.correctIds.includes(tile.id)).map(tile => tile.id).sort(), [...round.correctIds].sort(), 'Accept every valid tile, not only the featured answer');
      assert.equal(new Set(round.tiles.map(tile => tile.id)).size, round.tiles.length);
      assert.equal(isCorrect(round, 'not-on-this-board'), false);
      if (round.challengeKind === 'system') {
        assert.equal(new Set(round.tiles.map(tile => trackLabel(tile.title))).size, round.tiles.length, 'Origin questions cannot have indistinguishable names');
        assert.ok(round.tiles.every(tile => trackLabel(tile.title) !== 'Rainbow Road'), 'Do not ask the origin of an ambiguous Rainbow Road name');
      }
    }
  }
}
for (const difficulty of ['explorer', 'scientist', 'professor']) {
  for (const mode of ['game-order', 'track-finder']) {
    const rounds = createRounds(mode, mode === 'game-order' ? 'mario' : 'kart', difficulty);
    const expected = difficulty === 'explorer' ? 3 : difficulty === 'scientist' ? 4 : 5;
    assert.equal(rounds.length, expected);
    assert.equal(new Set(rounds.map(round => round.id)).size, expected);
    assert.equal(new Set(rounds.map(round => round.funFact)).size, expected, 'Fun facts must not repeat within a game');
    if (mode === 'track-finder') assert.equal(new Set(rounds.map(round => round.prompt)).size, expected);
    for (const round of rounds) {
      if (round.mode === 'game-order') {
        assert.equal(round.tiles.length, expected);
        assert.equal(isCorrect(round, round.tiles.map(tile => tile.id)), false, 'Order must start shuffled');
        assert.equal(isCorrect(round, round.correctIds), true);
      } else if (round.mode === 'track-finder') {
        assert.equal(round.tiles.length, difficulty === 'explorer' ? 4 : difficulty === 'scientist' ? 6 : 9);
        assert.ok(round.tiles.some(course => !round.correctIds.includes(course.id)), 'Finder needs at least one distractor');
        const valid = round.tiles.filter(course => round.correctIds.includes(course.id));
        assert.ok(valid.length > 0, 'Finder must show a valid target');
        assert.ok(valid.every(course => isCorrect(round, course.id)));
        assert.ok(round.tiles.filter(course => !round.correctIds.includes(course.id)).every(course => !isCorrect(round, course.id)));
      }
    }
  }
}
for (const section of ['mario', 'kart', 'mixed']) {
  for (const difficulty of ['explorer', 'scientist', 'professor']) {
    const expectedPairs = difficulty === 'explorer' ? 4 : difficulty === 'scientist' ? 6 : 8;
    for (let run = 0; run < 30; run += 1) {
      const rounds = createRounds('match-hunt', section, difficulty);
      assert.equal(rounds.length, 3);
      assert.ok(rounds.every(round => round.mode === 'match-hunt'));
      const pairs = rounds.flatMap(round => round.pairs);
      assert.ok(pairs.every(pair => knowledgeLevel(MATCH_CLUES.find(item => item.id === pair.id).difficulty) <= knowledgeLevel(difficulty)), 'Matching cannot borrow harder questions');
      assert.equal(pairs.length, expectedPairs * 3);
      assert.equal(new Set(pairs.map(pair => pair.id)).size, pairs.length, 'Match facts must not repeat');
      assert.equal(new Set(pairs.map(pair => pair.name)).size, pairs.length, 'Match names must not repeat');
      assert.equal(new Set(rounds.map(round => round.funFact)).size, 3, 'Match fun facts must not repeat');
      for (const round of rounds) {
        assert.ok(round.pairs.some(pair => pair.id === round.targetId), 'Hunt target must be on the board');
        assert.deepEqual(new Set(round.nameIds), new Set(round.pairs.map(pair => pair.id)));
        assert.deepEqual(new Set(round.clueIds), new Set(round.pairs.map(pair => pair.id)));
        assert.ok(isCorrect(round, round.targetId));
        assert.ok(!isCorrect(round, 'missing-target'));
      }
    }
  }
}
assert.equal(CATEGORY_ITEMS.length, 46);
assert.deepEqual(CATEGORY_ITEMS.map(item => item.number), Array.from({ length: CATEGORY_ITEMS.length }, (_, index) => index + 1));
assert.equal(new Set(CATEGORY_ITEMS.map(item => item.name)).size, CATEGORY_ITEMS.length);
const land = CATEGORY_ITEMS.find(item => item.name === 'Super Mario Land');
assert.ok(['game', 'classic-game', 'handheld-game'].every(category => fitsCategory(land, category)));
assert.ok(!fitsCategory(land, 'switch-game'), 'Later availability does not change the original system');
const contextualSeen = new Set();
assert.equal(availableModes('mixed').length, 7, 'All games must be available with mixed content');
for (const difficulty of ['explorer', 'scientist', 'professor']) {
  const width = difficulty === 'explorer' ? 3 : difficulty === 'scientist' ? 4 : 5;
  for (const section of ['mario', 'mixed']) for (let run = 0; run < 30; run += 1) {
    const rounds = createRounds('category-finder', section, difficulty);
    assert.equal(rounds.length, 3);
    assert.equal(new Set(rounds.map(round => round.id)).size, 3);
    assert.equal(new Set(rounds.map(round => round.targetCategory)).size, 3);
    for (const round of rounds) {
      contextualSeen.add(round.targetCategory);
      if (difficulty === 'explorer') assert.ok(!round.targetCategory.endsWith('-game'), 'Rookie retains basic type recognition');
      assert.equal(round.mode, 'category-finder');
      assert.equal(round.width, width);
      assert.equal(round.tiles.length, width * width);
      assert.deepEqual(round.tiles.map(tile => tile.number), Array.from({ length: width * width }, (_, index) => round.tiles[0].number + index));
      assert.ok(round.tiles.some(tile => fitsCategory(tile, round.targetCategory)));
      assert.ok(round.tiles.some(tile => !fitsCategory(tile, round.targetCategory)));
      assert.ok(round.tiles.every(tile => isCorrect(round, tile.id) === fitsCategory(tile, round.targetCategory)));
    }
  }
}
assert.throws(() => createRounds('category-finder', 'kart', 'explorer'), /not available/);
for (const category of ['classic-game', 'wii-game', 'switch-game', 'handheld-game']) assert.ok(contextualSeen.has(category), `Missing contextual task: ${category}`);
for (const section of ['mario', 'kart', 'mixed']) {
  for (const difficulty of ['explorer', 'scientist', 'professor']) {
    for (const opponent of ['human', 'computer']) {
      const match = startVersusQuiz(section, difficulty, opponent);
      assert.equal(match.turns.length, 10);
      assert.equal(new Set(match.turns.map(turn => turn.question.knowledgeId)).size, 10, 'Versus questions must not repeat');
      assert.deepEqual(match.turns.map(turn => turn.playerIndex), [0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);
      for (const turn of match.turns) {
        assert.equal(turn.computerAnswer !== undefined, opponent === 'computer' && turn.playerIndex === 1);
        if (turn.computerAnswer) assert.ok(turn.question.choices.includes(turn.computerAnswer));
      }
    }
  }
}
let versus = startVersusQuiz('mario', 'explorer', 'computer', () => 0);
assert.equal(advanceVersusQuiz(versus), versus, 'Versus Next is locked before an answer');
versus = answerVersusQuiz(versus, versus.turns[0].question.answer);
assert.deepEqual(versus.scores, [0, 0], 'Points are added only on Next');
versus = rewindVersusQuiz(versus);
assert.equal(versus.submission, null);
versus = answerVersusQuiz(versus, versus.turns[0].question.answer);
versus = advanceVersusQuiz(versus);
assert.deepEqual(versus.scores, [1, 0]);
assert.deepEqual(versus.points, [12, 0]);
const plannedComputerAnswer = versus.turns[1].computerAnswer;
assert.equal(answerVersusQuiz(versus, 'not-an-option'), versus);
versus = answerVersusQuiz(versus, plannedComputerAnswer);
versus = rewindVersusQuiz(versus);
assert.equal(versus.turns[1].computerAnswer, plannedComputerAnswer, 'Rewind must not reroll the Computer');
versus = answerVersusQuiz(versus, plannedComputerAnswer);
versus = advanceVersusQuiz(versus);
assert.deepEqual(versus.scores, [1, 1]);
assert.deepEqual(versus.points, [12, 12]);
assert.equal(CLUE_SUBJECTS.length, 24);
assert.equal(new Set(CLUE_SUBJECTS.map(subject => subject.id)).size, CLUE_SUBJECTS.length);
assert.equal(new Set(CLUE_SUBJECTS.map(subject => subject.answer)).size, CLUE_SUBJECTS.length);
for (const topic of ['mario', 'kart']) assert.equal(CLUE_SUBJECTS.filter(subject => subject.topic === topic).length, 12);
for (const id of ['expanded-22', 'expanded-23', 'expanded-26', 'expanded-27']) {
  const question = QUESTIONS.find(question => question.id === id);
  assert.equal(question.knowledgeId, canonicalKnowledge(`${id}-v2`), 'Rewritten facts must use the replacement knowledge, including genuine equivalents');
  assert.notEqual(question.knowledgeId, canonicalKnowledge(id), 'Rewritten facts must not inherit old name-giveaway history');
  assert.ok(!/named after|secret-hideout name/.test(question.prompt));
}
assert.ok(QUESTIONS.filter(question => question.difficulty === 'explorer').every(question => question.category !== 'glitches'), 'Rookie content should teach gameplay, not patch-note recall');
for (const question of QUESTIONS.filter(question => question.category === 'glitches')) {
  assert.match(question.prompt, /v\d+\.\d+\.\d+/, 'Historical bugs need a fixed version, not an unqualified present-day claim');
  assert.equal(question.sourceReview?.status, 'source-checked');
  assert.ok(!question.sourceReview.gameVersion.includes('undefined'));
}
for (const group of CLUE_CHOICE_GROUPS) {
  assert.equal(new Set(group).size, group.length);
  assert.ok(group.every(id => CLUE_SUBJECTS.some(subject => subject.id === id)));
}
for (const topic of ['mario', 'kart']) {
  for (const difficulty of ['explorer', 'scientist', 'professor']) {
    const rounds = createRounds('clue-duel', topic, difficulty, Math.random, DEFAULT_PAIR_OPTIONS, 12);
    assert.equal(new Set(rounds.map(round => round.answerId)).size, 12);
    for (const round of rounds) {
      const selected = round.choices.filter(choice => choice.id !== round.answerId);
      const omitted = CLUE_SUBJECTS.filter(subject => subject.topic === topic && !round.choices.some(choice => choice.id === subject.id));
      assert.ok(selected.filter(choice => clueSimilarity(round.answerId, choice.id) > 0).length >= 2, 'Every subject needs multiple related alternatives');
      assert.ok(selected.every(choice => omitted.every(subject => clueSimilarity(round.answerId, choice.id) >= clueSimilarity(round.answerId, subject.id))), 'Prefer related choices over arbitrary distractors');
    }
  }
}
for (const subject of CLUE_SUBJECTS) {
  assert.equal(subject.clues.length, 5, `${subject.id}: five clues required`);
  assert.equal(new Set(subject.clues).size, 5, `${subject.id}: clues should add new information`);
  assert.ok(subject.clues.every(clue => clue.length >= 16), `${subject.id}: thin clue`);
  assert.ok(subject.clues.slice(0, 4).every(clue => !clue.toLowerCase().includes(subject.answer.toLowerCase())), `${subject.id}: answer leaked early`);
  const answerWords = subject.answer.toLowerCase().match(/[a-z]{4,}/g) ?? [];
  for (const clue of subject.clues.slice(0, 2)) {
    const clueWords = new Set(clue.toLowerCase().match(/[a-z]+/g) ?? []);
    assert.ok(answerWords.every(word => !clueWords.has(word)), `${subject.id}: early clue repeats a word from the answer`);
  }
  assert.ok(subject.sourceUrl.startsWith('https://'));
}
for (const section of ['mario', 'kart', 'mixed']) {
  for (const difficulty of ['explorer', 'scientist', 'professor']) {
    const rounds = createRounds('clue-duel', section, difficulty);
    assert.equal(rounds.length, 5);
    assert.equal(new Set(rounds.map(round => round.id)).size, 5, 'Clue subjects must not repeat');
    assert.equal(new Set(rounds.map(round => round.funFact)).size, 5, 'Clue fun facts must not repeat');
    for (const round of rounds) {
      assert.equal(round.mode, 'clue-duel');
      assert.equal(round.clues.length, 5);
      assert.equal(round.choices.length, difficulty === 'explorer' ? 4 : difficulty === 'scientist' ? 6 : 8);
      assert.equal(new Set(round.choices.map(choice => choice.id)).size, round.choices.length);
      assert.equal(new Set(round.choices.map(choice => choice.label)).size, round.choices.length, 'Full answer names must remain distinguishable; A–H labels are assigned by position');
      assert.ok(round.choices.some(choice => choice.id === round.answerId));
      assert.ok(isCorrect(round, round.answerId));
    }
  }
}
const sampleRound = createRounds('game-order', 'mario', 'explorer')[0];
assert.equal(sampleRound.mode, 'game-order');
let game = startSession([sampleRound]);
assert.equal(advance(game), game, 'Next is locked before a check');
game = submit(game, sampleRound.tiles.map(tile => tile.id));
assert.equal(game.submission.correct, false);
game = rewind(game);
assert.equal(game.submission, null);
game = submit(game, sampleRound.correctIds);
assert.equal(game.submission.correct, true);
game = advance(game);
assert.equal(game.correct, 1);
assert.equal(game.points, 12);
assert.equal(game.bestStreak, 1);
assert.equal(game.complete, true);
assert.equal(rewind(game), game, 'Rewind is locked after Next');

for (const difficulty of ['explorer', 'scientist', 'professor']) {
  for (const size of ['quick', 'standard', 'epic']) {
    for (const mode of availableModes('mixed')) {
      const rounds = createChampionshipRounds(mode, 'mixed', difficulty, size, Math.random, DEFAULT_PAIR_OPTIONS, 2);
      assert.equal(rounds.length, championshipRoundCount(mode, size) * 2);
      assert.equal(new Set(rounds.map(round => round.id)).size, rounds.length, 'Players must get different rounds');
      if (mode === 'quiz') assert.equal(new Set(rounds.map(round => round.question.knowledgeId)).size, rounds.length);
      if (mode === 'clue-duel') assert.equal(new Set(rounds.map(round => round.answerId)).size, rounds.length);
      if (mode === 'match-hunt') {
        const names = rounds.flatMap(round => round.pairs.map(pair => pair.name));
        assert.equal(new Set(names).size, names.length, 'Both players need fresh matching clues');
      }
    }
  }
  for (const tiles of orderTileOptions(difficulty)) for (const challenge of ['easy', 'medium', 'hard']) {
    const rounds = createRounds('game-order', 'mixed', difficulty, Math.random, DEFAULT_PAIR_OPTIONS, 6, { tiles, challenge });
    assert.ok(rounds.every(round => round.tiles.length === tiles && !isCorrect(round, round.tiles.map(tile => tile.id))));
    if (challenge !== 'hard') assert.ok(rounds.every(round => round.tiles.every((tile, index) => tile.id !== round.correctIds[index])));
  }
}
let timedTurns = scoreTurn(newTurnScores(), 0, true, 999, 9000, true);
assert.deepEqual(timedTurns.points, [0, 0]);
assert.equal(timedTurns.active, 1);
timedTurns = scoreTurn(timedTurns, 1, true, 999, 7000, true);
assert.deepEqual(timedTurns.points, [0, 1], 'Faster player wins, not the player with fewer wrong answers');
assert.equal(timedTurns.active, 0);
const bonusWin = scoreTurn({ ...newTurnScores(), active: 1 }, 0, true, 1, 100, false);
assert.deepEqual(bonusWin.points, [0, 1], 'Clue bonus point belongs to the answering player');

console.log(`Checked ${QUESTIONS.length} questions, 900 generated quizzes, 48 tracks, and the new round/session rules.`);
