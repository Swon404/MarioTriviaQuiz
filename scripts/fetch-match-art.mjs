// Download only the reviewed, pinned images. Do not auto-select new page art.
import { writeFile, mkdir } from 'node:fs/promises';
import { WEB_ARTWORK } from '../src/mario/webArtwork.ts';
if (!process.argv.includes('--download')) {
  console.log(JSON.stringify(WEB_ARTWORK, null, 2));
} else {
  await mkdir('public/match-icons', { recursive: true });
  for (const [name, art] of Object.entries(WEB_ARTWORK)) {
    if (new URL(art.url).hostname !== 'mario.wiki.gallery' || !/^match-icons\/web-[a-z0-9-]+\.(png|jpg|jpeg|webp)$/.test(art.path)) throw new Error('Invalid artwork source or path');
    const response = await fetch(art.url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`${name}: HTTP ${response.status}`);
    const data = Buffer.from(await response.arrayBuffer());
    if (data.length > 2000000) throw new Error(`${name}: exceeds 2MB budget`);
    await writeFile(`public/${art.path}`, data);
    console.log(`${name}: ${data.length} bytes`);
  }
}
