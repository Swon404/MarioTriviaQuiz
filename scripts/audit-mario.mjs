import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { QUESTIONS, createQuiz } from '../src/mario/questions.ts';
import { BOOSTER_COURSES } from '../src/mario/courses.ts';
import { availableModes, createRounds, DEFAULT_PAIR_OPTIONS, isCorrect, MARIO_TIMELINE } from '../src/mario/rounds.ts';
import { CLUE_SUBJECTS } from '../src/mario/clues.ts';
import { CATEGORY_ITEMS } from '../src/mario/categoryCatalog.ts';
import { ICON_PAIRS } from '../src/mario/pairCatalog.ts';
import { advanceVersusQuiz, answerVersusQuiz, attemptVersusQuiz, rewindVersusQuiz, startVersusQuiz } from '../src/mario/versus.ts';
import { advance, attemptQuiz, rewind, startSession, submit } from '../src/mario/session.ts';
import { calculatePoints } from '../src/mario/scoring.ts';
import { championshipPoints, championshipRoundCount, computerChampionshipAnswers, createChampionshipRounds } from '../src/mario/championship.ts';
import { newTurnScores, scoreTurn } from '../src/mario/turns.ts';
import { orderTileOptions } from '../src/mario/gameOrder.ts';

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

assert.equal(QUESTIONS.length, 138, 'The expanded bank needs 138 questions');
const ids = new Set();
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
for (const category of ['characters', 'baddies', 'power-ups', 'games', 'consoles', 'tracks', 'glitches']) {
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
assert.throws(() => createQuiz('kart', 'explorer', 24), /Only 23 questions/);
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
assert.equal(ICON_PAIRS.length, 40);
assert.equal(new Set(ICON_PAIRS.map(pair => pair.id)).size, ICON_PAIRS.length);
assert.ok(ICON_PAIRS.every(pair => pair.icon && pair.name === pair.question.answer));
assert.ok(ICON_PAIRS.every(pair => ['emoji', 'svg', 'text'].includes(pair.iconKind)));
for (const pair of ICON_PAIRS.filter(item => item.iconKind === 'svg')) {
  assert.ok(existsSync(new URL(`../public/${pair.icon}`, import.meta.url)), `${pair.name}: missing icon`);
  assert.ok(pair.iconAlt.length > 8, `${pair.name}: missing accessible description`);
}
assert.equal(ICON_PAIRS.find(pair => pair.name === 'Daisy').iconKind, 'svg');
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
for (const difficulty of ['explorer', 'scientist', 'professor']) {
  for (const mode of ['game-order', 'track-finder']) {
    const rounds = createRounds(mode, mode === 'game-order' ? 'mario' : 'kart', difficulty);
    const expected = difficulty === 'explorer' ? 3 : difficulty === 'scientist' ? 4 : 5;
    assert.equal(rounds.length, expected);
    assert.equal(new Set(rounds.map(round => round.id)).size, expected);
    assert.equal(new Set(rounds.map(round => round.funFact)).size, expected, 'Fun facts must not repeat within a game');
    if (mode === 'track-finder') assert.equal(new Set(rounds.map(round => round.targetCup)).size, expected);
    for (const round of rounds) {
      if (round.mode === 'game-order') {
        assert.equal(round.tiles.length, expected);
        assert.equal(isCorrect(round, round.tiles.map(tile => tile.id)), false, 'Order must start shuffled');
        assert.equal(isCorrect(round, round.correctIds), true);
      } else if (round.mode === 'track-finder') {
        assert.equal(round.tiles.length, difficulty === 'explorer' ? 4 : difficulty === 'scientist' ? 6 : 9);
        assert.ok(round.tiles.some(course => course.cup !== round.targetCup), 'Finder needs at least one distractor');
        const valid = round.tiles.filter(course => course.cup === round.targetCup);
        assert.ok(valid.length > 0, 'Finder must show a valid target');
        assert.ok(valid.every(course => isCorrect(round, course.id)));
        assert.ok(round.tiles.filter(course => course.cup !== round.targetCup).every(course => !isCorrect(round, course.id)));
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
assert.equal(CATEGORY_ITEMS.length, 40);
assert.deepEqual(CATEGORY_ITEMS.map(item => item.number), Array.from({ length: 40 }, (_, index) => index + 1));
assert.equal(new Set(CATEGORY_ITEMS.map(item => item.name)).size, 40);
assert.equal(availableModes('mixed').length, 7, 'All games must be available with mixed content');
for (const difficulty of ['explorer', 'scientist', 'professor']) {
  const width = difficulty === 'explorer' ? 3 : difficulty === 'scientist' ? 4 : 5;
  for (const section of ['mario', 'mixed']) for (let run = 0; run < 30; run += 1) {
    const rounds = createRounds('category-finder', section, difficulty);
    assert.equal(rounds.length, 3);
    assert.equal(new Set(rounds.map(round => round.id)).size, 3);
    assert.equal(new Set(rounds.map(round => round.targetCategory)).size, 3);
    for (const round of rounds) {
      assert.equal(round.mode, 'category-finder');
      assert.equal(round.width, width);
      assert.equal(round.tiles.length, width * width);
      assert.deepEqual(round.tiles.map(tile => tile.number), Array.from({ length: width * width }, (_, index) => round.tiles[0].number + index));
      assert.ok(round.tiles.some(tile => tile.category === round.targetCategory));
      assert.ok(round.tiles.every(tile => isCorrect(round, tile.id) === (tile.category === round.targetCategory)));
    }
  }
}
assert.throws(() => createRounds('category-finder', 'kart', 'explorer'), /not available/);
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
assert.equal(CLUE_SUBJECTS.length, 16);
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
      assert.equal(new Set(round.choices.map(choice => choice.label[0].toUpperCase())).size, round.choices.length, 'Answer labels must remain distinguishable');
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
