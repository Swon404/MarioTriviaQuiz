import { test, expect } from '@playwright/test';
import { QUESTIONS } from '../src/mario/questions.ts';
import { PLAYFUL_FEEDBACK, PLAYFUL_FEEDBACK_REVIEWED_ON } from '../src/mario/playfulFeedback.ts';
import { createRounds } from '../src/mario/rounds.ts';
import { seededBotRandom } from '../src/mario/memoryBot.ts';

test('17 useful extras have sources, short copy and explicit patched-glitch versions', () => {
  expect(Object.keys(PLAYFUL_FEEDBACK)).toHaveLength(17);
  expect(PLAYFUL_FEEDBACK_REVIEWED_ON).toBe('2026-10-21');
  expect(new Set(Object.values(PLAYFUL_FEEDBACK).map(extra => extra.text)).size).toBe(17);
  for (const [id, extra] of Object.entries(PLAYFUL_FEEDBACK)) {
    const question = QUESTIONS.find(q => q.id === id)!;
    expect(question, id).toBeTruthy();
    expect(question.funFact).toBe(extra.text);
    expect(question.funFactSourceUrl).toBe(extra.sourceUrl);
    expect(extra.text.split(/\s+/).length).toBeLessThanOrEqual(35);
    expect(new URL(extra.sourceUrl).hostname).toMatch(/(^|\.)nintendo\.com$/);
    if (extra.kind === 'patched-glitch') {
      expect(extra.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(extra.text).toContain(`Patched in v${extra.version}:`);
    }
  }
  for (const question of QUESTIONS.filter(q => q.category === 'glitches')) expect(question.difficulty).toBe('professor');
});

test('quiz and matching rounds preserve each extra source through serialisation', () => {
  for (const mode of ['quiz', 'match-hunt', 'pair-match'] as const) {
    let checked = 0;
    for (let seed = 0; seed < 25; seed++) {
      const rounds = createRounds(mode, 'mixed', mode === 'match-hunt' ? 'explorer' : (['explorer', 'scientist', 'professor'] as const)[seed % 3], seededBotRandom(`extras-${seed}`));
      for (const round of rounds) {
        const extra = Object.values(PLAYFUL_FEEDBACK).find(value => value.text === round.funFact);
        if (extra) {
          checked++;
          expect(JSON.parse(JSON.stringify(round)).funFactSourceUrl).toBe(extra.sourceUrl);
        }
      }
    }
    expect(checked, mode).toBeGreaterThan(0);
  }
});

for (const [id, format] of [['fresh-22', 'solo'], ['expanded-41', 'solo'], ['fresh-22', 'two-player']] as const) {
  test(`${id} ${format}: phone feedback, speech, Learning Zone and rewind show the sourced extra`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 740 });
    const question = QUESTIONS.find(q => q.id === id)!;
    await page.goto('./');
    await page.evaluate(history => localStorage.setItem('mariotrivia_question_history_v1', JSON.stringify({ blaize: history, dad: history })),
      QUESTIONS.filter(q => q.knowledgeId !== question.knowledgeId).map(q => q.knowledgeId));
    await page.getByRole('button', { name: 'Play Games' }).click();
    await page.getByRole('button', { name: 'Quiz Battle' }).click();
    await page.locator('.setup-settings > summary').click();
    await page.getByLabel('Player name', { exact: true }).fill('Blaize');
    if (format === 'two-player') {
      await page.getByRole('button', { name: 'Two Players' }).click();
      await page.getByLabel('Player 2 name').fill('Dad');
    }
    await page.getByRole('group', { name: 'Difficulty', exact: true }).getByRole('button', { name: question.difficulty === 'explorer' ? /Rookie/ : /Legend/ }).click();
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    await expect(page.getByRole('heading', { name: question.prompt, exact: true })).toBeVisible();
    await page.locator('.answer-grid').getByText(question.answer, { exact: true }).click();
    await expect(page.locator('.feedback')).toContainText(question.funFact);
    await expect(page.locator('.feedback > p').getByRole('link', { name: 'Tip / fun fact source ↗' })).toHaveAttribute('href', question.funFactSourceUrl!);
    await page.evaluate(() => { window.speechSynthesis.speak = utterance => { document.body.dataset.lastSpoken = utterance.text; }; });
    await page.getByRole('button', { name: 'Read explanation aloud' }).click();
    await expect(page.locator('body')).toHaveAttribute('data-last-spoken', `${question.explanation} Fun fact: ${question.funFact}`);
    await page.getByText('Open Learning Zone card', { exact: true }).click();
    await expect(page.locator('.learning-topic-card')).toContainText(question.funFact);
    await expect(page.locator('.learning-topic-card').getByRole('link', { name: 'Tip / fun fact source ↗' })).toHaveAttribute('href', question.funFactSourceUrl!);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath('playful-feedback-phone.png'), fullPage: true });
    await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
    await page.locator('.answer-grid').getByText(question.answer, { exact: true }).click();
    await expect(page.locator('.feedback')).toContainText(question.funFact);
  });
}
