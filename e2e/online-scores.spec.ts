import { expect, test, type Page } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const origin = 'https://kfychkbtavpxlwcmsiqi.supabase.co';
const QUEUE = 'mushroom_online_queue_v1';
const record = { id: 'trial-one', player: 'Private family name', difficulty: 'explorer', ruleset: 'pairs-v1', variant: 'time-trial', pairs: 12, goal: 5, target: null, unlockPairs: 0, elapsedMs: 12345, moves: 5, completedAt: '2026-11-12T12:00:00Z' };
async function seedAuth(page: Page) {
  await page.addInitScript(() => {
    const user = { id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', aud: 'authenticated', role: 'authenticated', email: '', app_metadata: {}, user_metadata: {}, created_at: '2026-11-12T12:00:00Z' };
    const token = [btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })), btoa(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })), 'test'].join('.');
    localStorage.setItem('mushroom_online_auth', JSON.stringify({ access_token: token, refresh_token: 'test-only', expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600, token_type: 'bearer', user }));
  });
}
test('online sharing defaults off and only queues new eligible times after consent', async ({ page }) => {
  let requests = 0;
  await page.route(origin + '/**', async route => { requests++; await route.abort(); });
  await page.goto('./');
  await page.evaluate(async base => {
    const path = '/MarioTriviaQuiz/src/mario/pairTimes.ts';
    const { savePairTime } = await import(path);
    savePairTime(base, true);
  }, record);
  expect(await page.evaluate(key => localStorage.getItem(key), QUEUE)).toBeNull();
  expect(requests).toBe(0);
  await page.evaluate(async base => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    const path = '/MarioTriviaQuiz/src/mario/onlineScores.ts';
    const { setSharing } = await import(path); setSharing(true);
    const timesPath = '/MarioTriviaQuiz/src/mario/pairTimes.ts';
    const { savePairTime } = await import(timesPath);
    savePairTime(base, true); // Existing score must not be silently published.
    savePairTime({ ...base, id: 'practice' }, false);
    savePairTime({ ...base, id: 'hunt', variant: 'hunt' }, true);
    savePairTime({ ...base, id: 'new' }, true);
    savePairTime({ ...base, id: 'new' }, true);
  }, record);
  const queued = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), QUEUE);
  expect(queued).toHaveLength(1);
  expect(queued[0]).toMatchObject({ run: 'new', kind: 'trial', config: ['pairs-v1', 'time-trial', 12, 5, false, 0] });
  expect(queued[0].nickname).toMatch(/^Racer-[A-F0-9]{8}$/);
  expect(JSON.stringify(queued)).not.toContain(record.player);
  expect(requests).toBe(0);
});

test('failed upload survives reload, retries once and keeps local scores', async ({ page }) => {
  await seedAuth(page);
  let ready = false;
  const uploads: unknown[] = [];
  await page.route(origin + '/**', async route => {
    if (route.request().url().endsWith('/rpc/submit_community_time')) {
      uploads.push(route.request().postDataJSON());
      await route.fulfill({ status: ready ? 200 : 503, contentType: 'application/json', body: ready ? JSON.stringify('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa') : JSON.stringify({ message: 'Unavailable' }) });
    } else await route.fulfill({ contentType: 'application/json', body: '[]' });
  });
  await page.goto('./');
  await page.evaluate(async base => {
    const path = '/MarioTriviaQuiz/src/mario/onlineScores.ts';
    const { setSharing, syncOnlineScores } = await import(path);
    setSharing(true); await syncOnlineScores();
    const timesPath = '/MarioTriviaQuiz/src/mario/pairTimes.ts';
    const { savePairTime } = await import(timesPath); savePairTime(base, true);
    await syncOnlineScores();
  }, record);
  expect(uploads).toHaveLength(1);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).length, QUEUE)).toBe(1);
  ready = true;
  await page.reload();
  await expect.poll(() => uploads.length).toBe(2);
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).length, QUEUE)).toBe(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_pair_times_v1')!).length)).toBe(1);
  expect(uploads[0]).toEqual(uploads[1]);
});

test('Game Order upload redacts replay title and practice never uploads', async ({ page }) => {
  await page.route(origin + '/**', route => route.abort());
  await page.goto('./');
  const queued = await page.evaluate(async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    const onlinePath = '/MarioTriviaQuiz/src/mario/onlineScores.ts';
    const { setSharing } = await import(onlinePath); setSharing(true);
    const path = '/MarioTriviaQuiz/src/mario/gameOrder.ts';
    const { saveOrderTime, markOrderPractice } = await import(path);
    const item = { id: 'order-one', player: 'Secret name', difficulty: 'explorer', ruleset: 'order-v3', challenge: 'hard', tiles: 4, elapsedMs: 5000, attempts: 2, completedAt: '2026-11-12T12:00:00Z', replay: { version: 1, kind: 'order', title: 'Secret name replay', frames: [{ atMs: 0, event: 'Timer started', tiles: [{ id: 'one', label: 'Mario', state: 'shown' }] }] } };
    saveOrderTime(item); markOrderPractice('practice'); saveOrderTime({ ...item, id: 'practice' });
    return JSON.parse(localStorage.getItem('mushroom_online_queue_v1')!);
  });
  expect(queued).toHaveLength(1);
  expect(queued[0].config).toEqual(['order-v3', null, 'hard', 4]);
  expect(JSON.stringify(queued)).not.toContain('Secret name');
  expect(queued[0].replay.title).toContain(queued[0].nickname);
});

test('community board separates configurations, handles failure and rejects unsafe replay', async ({ page }) => {
  await page.route(origin + '/**', async route => {
    const url = route.request().url();
    if (url.endsWith('/community_replay')) {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ version: 1, kind: 'pairs', title: 'Unsafe', frames: [{ atMs: 0, event: 'x', tiles: [{ id: 'x', label: 'x', state: 'shown', image: 'https://tracker.invalid/a.png' }] }] }) }); return;
    }
    const config = route.request().postDataJSON()?.p_config;
    if (config?.[2] === 16) { await route.fulfill({ status: 503, body: '{}' }); return; }
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(config?.[2] === 'easy' ? [] : [{ id: 'score-one', nickname: 'Racer-ABCDEF12', elapsed_ms: 4321, moves: 5, has_replay: true }]) });
  });
  await page.goto('./'); await page.getByRole('button', { name: 'High Scores' }).click();
  const board = page.getByRole('region', { name: 'Community Top 5', exact: true });
  await expect(board).toContainText('Racer-ABCDEF12'); await expect(board).toContainText('4.3s');
  await board.getByRole('button', { name: 'Load replay' }).click();
  await expect(board).toContainText('Replay unavailable. Try again.');
  await board.getByLabel('Online game').selectOption('order');
  await expect(board).toContainText('No online times for these settings yet.');
  await expect(board).not.toContainText('Racer-ABCDEF12');
  await board.getByLabel('Online game').selectOption('trial');
  await board.getByLabel('Board pairs').selectOption('16');
  await expect(board).toContainText('Online leaderboard unavailable');
  await expect(page.getByRole('heading', { name: 'Game Order · fastest times' })).toBeVisible();
});

test('removing public times stops sharing without clearing local records', async ({ page }) => {
  await seedAuth(page);
  let removed = 0;
  await page.route(origin + '/**', async route => {
    if (route.request().url().endsWith('/remove_my_community_times')) removed++;
    await route.fulfill({ contentType: 'application/json', body: 'null' });
  });
  await page.goto('./');
  await page.evaluate(async base => {
    localStorage.setItem('mariotrivia_pair_times_v1', JSON.stringify([base]));
    localStorage.setItem('mushroom_online_sharing_v1', 'yes');
    const path = '/MarioTriviaQuiz/src/mario/onlineScores.ts';
    const { removeOnlineTimes } = await import(path); await removeOnlineTimes();
  }, record);
  expect(removed).toBe(1);
  expect(await page.evaluate(() => localStorage.getItem('mushroom_online_sharing_v1'))).toBe('no');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_pair_times_v1')!)[0])).toEqual(record);
});

test('pending Time Trial survives a full browser close and reopened disk profile', async ({ playwright, browserName, baseURL }) => {
  const directory = await mkdtemp(join(tmpdir(), 'mushroom-online-test-'));
  let context = await playwright[browserName].launchPersistentContext(directory);
  try {
    await context.route(origin + '/**', route => route.abort());
    const page = await context.newPage(); await page.goto(baseURL!);
    await page.evaluate(async base => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
      const onlinePath = '/MarioTriviaQuiz/src/mario/onlineScores.ts';
      const { setSharing } = await import(onlinePath); setSharing(true);
      const timesPath = '/MarioTriviaQuiz/src/mario/pairTimes.ts';
      const { savePairTime } = await import(timesPath); savePairTime(base, true);
    }, record);
    await context.close();
    context = await playwright[browserName].launchPersistentContext(directory);
    await context.route(origin + '/**', route => route.abort());
    const reopened = await context.newPage(); await reopened.goto(baseURL!);
    expect(await reopened.evaluate(key => JSON.parse(localStorage.getItem(key)!).length, QUEUE)).toBe(1);
    expect(await reopened.evaluate(() => JSON.parse(localStorage.getItem('mariotrivia_pair_times_v1')!)[0].elapsedMs)).toBe(record.elapsedMs);
  } finally { await context.close(); await rm(directory, { recursive: true, force: true }); }
});
