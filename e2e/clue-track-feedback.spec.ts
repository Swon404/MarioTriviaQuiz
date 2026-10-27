import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { CLUE_SUBJECTS } from '../src/mario/clues.ts';
import { TRACK_CHALLENGES, trackLabel } from '../src/mario/trackChallenges.ts';
import { BOOSTER_COURSES } from '../src/mario/courses.ts';
import { TRACK_DISCOVERIES } from '../src/mario/discoveries.ts';
import { captureSpeech } from './speech-capture.ts';

test('feedback refresh preserves every clue, target and answer while staying concise', () => {
  for (const [bank, expected] of [
    [CLUE_SUBJECTS, '0f7cc59a531bacbe0d6f8c66f383623f28ff3ddc2b22b797b4e4e06e33d9acfe'],
    [TRACK_CHALLENGES, '4ceb039f13b294ac2f444f119bc9239bac074c95326aaf60f8d520b2f67c302f'],
  ] as const) {
    const key = bank.map(({ explanation, funFact, funFactSourceUrl, ...unchanged }) => unchanged);
    expect(createHash('sha256').update(JSON.stringify(key)).digest('hex')).toBe(expected);
    for (const item of bank) {
      expect(item.explanation.split(/\s+/).length, item.id).toBeLessThanOrEqual(48);
      expect(item.funFact.split(/\s+/).length, item.id).toBeLessThanOrEqual(35);
      expect(item.funFact, item.id).not.toBe(item.explanation);
    }
  }
  expect(CLUE_SUBJECTS).toHaveLength(28);
  expect(TRACK_CHALLENGES).toHaveLength(23);
  for (const task of TRACK_CHALLENGES.filter(task => task.kind === 'cup')) {
    const cup = BOOSTER_COURSES.filter(course => task.correctIds.includes(course.id));
    expect(task.explanation).toContain(trackLabel(cup[0].title));
    expect(task.explanation).toContain(trackLabel(cup[3].title));
    expect(task.explanation).toContain(trackLabel(cup[1].title));
    expect(task.explanation).toContain(trackLabel(cup[2].title));
    expect(task.funFact).toBe(TRACK_DISCOVERIES[task.id].text);
    expect(task.funFactSourceUrl).toBe(TRACK_DISCOVERIES[task.id].sourceUrl);
  }
});

for (const correct of [true, false]) {
  test(`Clue Duel ${correct ? 'correct' : 'wrong'} answer shows refreshed feedback and speaks it`, async ({ page }) => {
    await captureSpeech(page);
    await page.setViewportSize({ width: 390, height: 740 });
    await page.goto('./');
    await page.getByRole('button', { name: 'Play Games' }).click();
    await page.getByRole('button', { name: 'Clue Duel' }).click();
    await page.getByRole('button', { name: 'Start!', exact: true }).click();
    for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Show next clue' }).click();
    const clues = await page.locator('.clue-list li').allTextContents();
    const subject = CLUE_SUBJECTS.find(item => JSON.stringify(item.clues) === JSON.stringify(clues))!;
    expect(subject).toBeDefined();
    await expect(page.locator('.feedback')).toHaveCount(0);
    const answers = page.locator('.answer-grid button');
    if (correct) await answers.getByText(subject.answer, { exact: true }).click();
    else await answers.filter({ hasNotText: subject.answer }).first().click();
    await expect(page.locator('.feedback')).toContainText(subject.explanation);
    await expect(page.locator('.feedback')).toContainText(subject.funFact);
    await page.getByRole('button', { name: 'Read explanation aloud' }).click();
    await expect(page.locator('body')).toHaveAttribute('data-spoken', `${subject.explanation} Fun fact: ${subject.funFact}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath('clue-feedback-phone.png'), fullPage: true, animations: 'disabled' });
  });
}

test('Track Finder cup, system and feature feedback follows the actual board and survives rewind', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Play Games' }).click();
  await page.getByRole('button', { name: 'Track Finder' }).click();
  await page.getByRole('button', { name: 'Start!', exact: true }).click();
  const kinds = new Set<string>();
  for (let round = 0; round < 3; round++) {
    const prompt = await page.locator('.quiz-panel h1').textContent();
    const task = TRACK_CHALLENGES.find(item => item.prompt === prompt)!;
    expect(task).toBeDefined();
    kinds.add(task.kind);
    await expect(page.locator('.feedback')).toHaveCount(0);
    const visible = await page.locator('.finder-grid button').allTextContents();
    const label = (title: string) => task.kind === 'system' ? trackLabel(title) : title;
    const answer = BOOSTER_COURSES.find(course => task.correctIds.includes(course.id) && visible.includes(label(course.title)))!;
    expect(answer).toBeDefined();
    for (let attempt = 0; attempt < 2; attempt++) {
      await page.locator('.finder-grid button').getByText(label(answer.title), { exact: true }).click();
      await expect(page.locator('.feedback')).toContainText(task.explanation);
      await expect(page.locator('.feedback')).toContainText(task.funFact);
      const sourceLabel = task.funFactSourceUrl === task.sourceUrl ? 'Check the source ↗' : 'Tip / fun fact source ↗';
      await expect(page.locator('.feedback').getByRole('link', { name: sourceLabel })).toHaveAttribute('href', task.funFactSourceUrl!);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (!attempt) await page.getByRole('button', { name: '↶ Rewind', exact: true }).click();
    }
    await page.screenshot({ path: test.info().outputPath(`${task.kind}-feedback-phone.png`), fullPage: true, animations: 'disabled' });
    if (round < 2) await page.getByRole('button', { name: /^Next question/ }).click();
  }
  expect([...kinds].sort()).toEqual(['cup', 'feature', 'system']);
});
