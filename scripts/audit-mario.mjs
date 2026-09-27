import assert from 'node:assert/strict';
import { QUESTIONS, createQuiz } from '../src/mario/questions.ts';
import { BOOSTER_COURSES } from '../src/mario/courses.ts';
import { createRounds, isCorrect, MARIO_TIMELINE } from '../src/mario/rounds.ts';
import { CLUE_SUBJECTS } from '../src/mario/clues.ts';
import { CATEGORY_ITEMS } from '../src/mario/categoryCatalog.ts';
import { advanceVersusQuiz, answerVersusQuiz, rewindVersusQuiz, startVersusQuiz } from '../src/mario/versus.ts';
import { advance, rewind, startSession, submit } from '../src/mario/session.ts';
import { calculatePoints } from '../src/mario/scoring.ts';
import { championshipPoints, computerChampionshipAnswers } from '../src/mario/championship.ts';

assert.equal(calculatePoints('explorer', true, 0), 12);
assert.equal(calculatePoints('scientist', true, 3), 50);
assert.equal(calculatePoints('professor', false, 12), 0);
assert.equal(championshipPoints([{ correct: 3, points: 36 }, { correct: 2, points: 24 }]), 60);
const computerRounds = createRounds('quiz', 'mario', 'explorer').slice(0, 3);
assert.deepEqual(computerChampionshipAnswers(computerRounds, 'explorer', () => 0), computerRounds.map(round => round.question.answer));
assert.ok(computerChampionshipAnswers(computerRounds, 'explorer', () => 0.99).every((answer, index) => answer !== computerRounds[index].question.answer));

assert.equal(QUESTIONS.length, 102, 'The expanded bank needs 102 questions');
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
      assert.equal(new Set(quiz.map(question => question.funFact)).size, 10, `${topic}/${difficulty}: repeated fun fact`);
      assert.ok(new Set(quiz.map(question => question.category)).size >= 3, `${topic}/${difficulty}: too few categories`);
      assert.ok(quiz.every(question => question.difficulty === difficulty && (topic === 'mixed' || question.topic === topic)));
    }
  }
}
assert.throws(() => createQuiz('kart', 'explorer', 18), /Only 17 questions/);
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
        assert.equal(round.tiles.length, expected * expected);
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
for (const difficulty of ['explorer', 'scientist', 'professor']) {
  const width = difficulty === 'explorer' ? 3 : difficulty === 'scientist' ? 4 : 5;
  for (let run = 0; run < 30; run += 1) {
    const rounds = createRounds('category-finder', 'mario', difficulty);
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
  assert.ok(subject.clues.every(clue => clue.length >= 16), `${subject.id}: thin clue`);
  assert.ok(subject.clues.slice(0, 4).every(clue => !clue.toLowerCase().includes(subject.answer.toLowerCase())), `${subject.id}: answer leaked early`);
  assert.ok(subject.sourceUrl.startsWith('https://'));
}
for (const section of ['mario', 'kart', 'mixed']) {
  for (const difficulty of ['explorer', 'scientist', 'professor']) {
    const rounds = createRounds('clue-duel', section, difficulty);
    assert.equal(rounds.length, 5);
    assert.equal(new Set(rounds.map(round => round.id)).size, 5, 'Clue subjects must not repeat');
    assert.equal(new Set(rounds.map(round => round.funFact)).size, 5, 'Clue fun facts must not repeat');
    for (const [index, round] of rounds.entries()) {
      assert.equal(round.mode, 'clue-duel');
      assert.equal(round.clues.length, 5);
      assert.equal(round.choices.length, Math.min(difficulty === 'explorer' ? 4 : difficulty === 'scientist' ? 6 : 8, 4 + index));
      assert.equal(new Set(round.choices.map(choice => choice.id)).size, round.choices.length);
      assert.equal(new Set(round.choices.map(choice => choice.label[0].toUpperCase())).size, round.choices.length, 'The last initial clue must identify one choice');
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
console.log(`Checked ${QUESTIONS.length} questions, 900 generated quizzes, 48 tracks, and the new round/session rules.`);
