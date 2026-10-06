import { createServer } from 'vite';

export default async function setup() {
  const server = await createServer({
    // The interactive dev server can run at the same time. Its dependency
    // optimiser must not invalidate modules loaded by a test browser.
    cacheDir: 'node_modules/.vite-e2e',
    server: { host: '127.0.0.1', port: 4192, strictPort: true, hmr: false },
  });
  await server.listen();
  return async () => { await server.close(); };
}
