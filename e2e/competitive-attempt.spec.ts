import { expect, test } from '@playwright/test';
import { QUESTIONS } from '../src/mario/questions.ts';
import { startVersusQuiz, attemptVersusQuiz, rewindVersusQuiz, advanceVersusQuiz } from '../src/mario/versus.ts';
import { startSession, attemptQuiz, rewind, advance } from '../src/mario/session.ts';
import { createRounds } from '../src/mario/rounds.ts';
import { scoreConfiguration, scoreGroupKey, SCORE_VERSION } from '../src/mario/scoreGroups.ts';
const DEFAULT_ORDER_OPTIONS = { challenge: 'easy' as const, tiles: 4 };

test('competitive attempts lock misses, resist duplicate actions and preserve legacy and solo rules', () => {
  for (const difficulty of ['explorer', 'scientist', 'professor'] as const) {
    let versus = startVersusQuiz('mixed', difficulty, 'human');
    const question = versus.turns[0].question;
    versus = attemptVersusQuiz(versus, question.choices.find(choice => choice !== question.answer)!);
    expect(versus.submission).toMatchObject({ correct: false, points: 0 });
    expect(attemptVersusQuiz(versus, question.answer)).toBe(versus);
    expect(rewindVersusQuiz(versus)).toBe(versus);
    const next = advanceVersusQuiz(versus);
    expect(advanceVersusQuiz(next)).toBe(next);
    expect(next.points).toEqual([0, 0]);
    const rounds = createRounds('quiz', 'mixed', difficulty);
    const first = rounds[0];
    if (first.mode !== 'quiz') throw new Error('Expected quiz');
    const wrong = first.question.choices.find(choice => choice !== first.question.answer)!;
    const competitive = attemptQuiz(startSession(rounds, difficulty, 1), wrong);
    expect(competitive.submission?.correct).toBe(false);
    expect(rewind(competitive)).toBe(competitive);
    expect(attemptQuiz(competitive, first.question.answer)).toBe(competitive);
    expect(advance(advance(competitive)).index).toBe(1);
    const solo = attemptQuiz(startSession(rounds, difficulty), wrong);
    expect(!!solo.submission).toBe(difficulty === 'professor');
    expect(rewind(solo).wrongAnswers).toEqual([]);
    const legacy = { ...startVersusQuiz('mixed', difficulty, 'human'), quizAttempts: undefined };
    const legacyQuestion = legacy.turns[0].question;
    const missed = attemptVersusQuiz(legacy, legacyQuestion.choices.find(choice => choice !== legacyQuestion.answer)!);
    expect(!!missed.submission).toBe(difficulty === 'professor');
    expect(rewindVersusQuiz(missed).wrongAnswers).toEqual([]);
    const record = { id: 'test', player: 'Dad', topic: 'mixed' as const, difficulty, correct: 3, total: 5, elapsedMs: 1000, completedAt: '2026-10-28T12:00:00Z', format: 'two-player' as const, scoringVersion: SCORE_VERSION };
    expect(scoreGroupKey({ ...record, scoreConfiguration: scoreConfiguration(rounds, DEFAULT_ORDER_OPTIONS, 1) }))
      .not.toBe(scoreGroupKey({ ...record, scoreConfiguration: scoreConfiguration(rounds, DEFAULT_ORDER_OPTIONS) }));
  }
});

for (const format of ['Two Players', 'Play Shroomer', 'Championship'] as const) {
  test(`${format}: one wrong answer ends the competitive question and stays locked after reload`, async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Play Games' }).click();
    await page.getByRole('button', { name: format === 'Championship' ? 'Championship' : 'Quiz Battle', exact: false }).click();
    await page.locator('.setup-settings > summary').click();
    await page.getByRole('button', { name: format === 'Championship' ? 'Two Players' : format, exact: true }).click();
    await expect(page.getByRole('button', { name: /^Rookie/ })).toContainText('one attempt');
    await page.getByRole('button', { name: format === 'Championship' ? 'Start Championship' : 'Start!', exact: true }).click();
    const prompt = await page.locator('.quiz-playing h1').innerText();
    const question = QUESTIONS.find(item => item.prompt === prompt)!;
    await expect(page.locator('.quiz-retries')).toHaveText('Attempts left: 1');
    await page.locator('.answer-grid').getByText(question.choices.find(choice => choice !== question.answer)!, { exact: true }).click();
    await expect(page.locator('.feedback h2')).toHaveText(`Answer: ${question.answer}`);
    await expect(page.locator('.mario-earned')).toHaveText('+0 points');
    await expect(page.getByRole('button', { name: /Rewind/ })).toHaveCount(0);
    await expect(page.locator('.answer-grid button:not([disabled])')).toHaveCount(0);
    await page.reload();
    await page.getByRole('button', { name: 'Resume game', exact: true }).click();
    await expect(page.locator('.feedback h2')).toHaveText(`Answer: ${question.answer}`);
    await expect(page.getByRole('button', { name: /Rewind/ })).toHaveCount(0);
    await page.getByRole('button', { name: 'Next turn', exact: false }).click();
    if (format === 'Play Shroomer') {
      await expect(page.locator('.feedback')).toBeVisible();
      await expect(page.getByRole('button', { name: /Rewind/ })).toHaveCount(0);
    } else {
      await expect(page.locator('.quiz-retries')).toHaveText('Attempts left: 1');
      await expect(page.locator('.feedback')).toHaveCount(0);
    }
  });
}
