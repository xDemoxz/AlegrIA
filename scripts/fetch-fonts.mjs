/**
 * Descarga una sola vez las fuentes latinas de Google Fonts a
 * src/assets/fonts, para que el sitio no dependa de fonts.googleapis.com.
 * Uso puntual: `node scripts/fetch-fonts.mjs`.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'src/assets/fonts');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const url =
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Work+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,500&display=swap';

const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
const blocks = css.split('/* latin */').slice(1);

await mkdir(OUT, { recursive: true });

const slug = (family) => family.toLowerCase().replace(/\s+/g, '-');

for (const block of blocks) {
  const face = block.slice(0, block.indexOf('}'));
  const family = /font-family:\s*'([^']+)'/.exec(face)?.[1];
  const weight = /font-weight:\s*(\d+)/.exec(face)?.[1];
  const style = /font-style:\s*(\w+)/.exec(face)?.[1];
  const file = /url\((https:[^)]+\.woff2)\)/.exec(face)?.[1];
  if (!family || !weight || !file) continue;

  const name = `${slug(family)}-latin-${weight}${style === 'italic' ? '-italic' : ''}.woff2`;
  const buffer = Buffer.from(await (await fetch(file)).arrayBuffer());
  await writeFile(path.join(OUT, name), buffer);
  console.log(`✓ ${name} — ${Math.round(buffer.length / 1024)} KB`);
}
