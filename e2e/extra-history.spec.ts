import { expect, test } from '@playwright/test';
import { extraKnowledgeId, QUESTION_FUN_FACTS, withVariedFunFacts } from '../src/mario/funFacts.ts';
import { QUESTIONS } from '../src/mario/questions.ts';
import { availableModes, createRounds } from '../src/mario/rounds.ts';

test('all game modes suppress seen extras and shared fact pools exhaust without repeating', () => {
  const question = QUESTIONS.find(q => q.id === 'mario-explorer-1')!;
  const first = withVariedFunFacts([question], () => 0)[0].funFact;
  const second = withVariedFunFacts([{ ...question, id: 'round-1', factPoolId: question.id }], () => 0, [extraKnowledgeId(first)])[0].funFact;
  expect(second).not.toBe(first);
  expect(QUESTION_FUN_FACTS[question.id]).toContain(second);
  expect(withVariedFunFacts([question], () => 0, [first, second].map(extraKnowledgeId))[0].funFact).toBe('');
  for (const mode of availableModes('mixed')) {
    const random = () => { let seed = 32; return () => ((seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 2 ** 32); };
    const rounds = createRounds(mode, 'mixed', 'explorer', random());
    const history = [...Object.values(QUESTION_FUN_FACTS).flat(), ...rounds.map(round => round.funFact)].filter(Boolean).map(extraKnowledgeId);
    const again = createRounds(mode, 'mixed', 'explorer', random(), undefined, undefined, undefined, history);
    expect(again.map(round => round.id)).toEqual(rounds.map(round => round.id));
    expect(again.every(round => round.funFact === ''), mode).toBe(true);
  }
});

test('only revealed extras are saved for both humans and exhausted feedback omits the label', async ({ page }) => {
  const wanted = QUESTIONS.find(q => q.id === 'mario-explorer-1')!;
  const oldQuestions = QUESTIONS.filter(q => q.knowledgeId !== wanted.knowledgeId).map(q => q.knowledgeId);
  await page.goto('./');
  await page.evaluate(history => localStorage.setItem('mariotrivia_question_history_v1', JSON.stringify({ ada: history })), oldQuestions);
  const start = async (two = false) => {
    await page.getByRole('button', { name: 'Play Games' }).click();
    await page.getByRole('button', { name: 'Quiz Battle', exact: false }).click();
    if (await page.locator('.setup-settings:not([open])').count()) await page.locator('.setup-settings > summary').click();
    await page.getByLabel('Player name', { exact: true }).fill('Ada');
    if (two) {
      await page.getByRole('button', { name: 'Two Players', exact: true }).click();
      await page.getByLabel('Player 2 name').fill('Ben');
    }
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
  };
  const extras = () => page.evaluate(() => Object.fromEntries(Object.entries(JSON.parse(localStorage.getItem('mariotrivia_question_history_v1')!)).map(([name, ids]) => [name, (ids as string[]).filter(id => id.startsWith('extra:'))])));
  await start(true);
  await expect(page.locator('.quiz-playing h1')).toHaveText(wanted.prompt);
  expect((await extras()).ada).toEqual([]);
  await page.locator('.answer-grid').getByText(wanted.answer, { exact: true }).click();
  const fact = (await page.locator('.feedback p').filter({ hasText: /^Fun fact:/ }).innerText()).replace(/^Fun fact:\s*/, '');
  expect((await extras()).ada).toEqual([extraKnowledgeId(fact)]);
  expect((await extras()).ben).toEqual([extraKnowledgeId(fact)]);
  await page.reload();
  await page.evaluate(({ ids, facts }) => localStorage.setItem('mariotrivia_question_history_v1', JSON.stringify({ ada: [...ids, ...facts], ben: [] })), { ids: oldQuestions, facts: QUESTION_FUN_FACTS[wanted.id].map(extraKnowledgeId) });
  await start();
  await expect(page.locator('.quiz-playing h1')).toHaveText(wanted.prompt);
  await page.locator('.answer-grid').getByText(wanted.answer, { exact: true }).click();
  await expect(page.locator('.feedback')).not.toContainText('Fun fact:');
  await expect(page.locator('.feedback')).toContainText(wanted.explanation);
  await expect(page.getByRole('link', { name: 'Tip / fun fact source', exact: false })).toHaveCount(0);
});
