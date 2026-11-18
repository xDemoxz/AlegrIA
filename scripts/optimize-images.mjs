/**
 * Genera las versiones WebP de las imágenes que sirve la app.
 *
 * Uso: npm run optimize:images
 *
 * Los originales viven en `design/source` (fuera de `public`, así Vite no los
 * copia al build) y las versiones optimizadas se escriben en
 * `public/assets/<carpeta>`. Este script es reproducible: se puede volver a
 * ejecutar cuando cambie un original.
 *
 * - Carrusel: 760×950 (2× la card de 340px), recorte 4:5.
 * - Timeline: 1280px de ancho; cubre el túnel a pantalla completa sin
 *   enviar originales de 4K.
 * - Logos: 320px (se muestran a 32–44px de alto; cubre pantallas 3×).
 * - Iconos del póster: 480px con transparencia (se usan como estampitas).
 */
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'design/source');
const OUTPUT = path.join(ROOT, 'public/assets');

async function newerThan(source, target) {
  try {
    const [s, t] = await Promise.all([stat(source), stat(target)]);
    return s.mtimeMs <= t.mtimeMs;
  } catch {
    return false;
  }
}

async function convert(dir, name, { width, height, quality }) {
  const source = path.join(SOURCE, dir, name);
  const target = path.join(OUTPUT, dir, name.replace(/\.(png|jpe?g)$/i, '.webp'));

  if (await newerThan(source, target)) {
    return { file: path.basename(target), skipped: true };
  }

  let pipeline = sharp(source).rotate();
  if (width || height) {
    pipeline = pipeline.resize({ width, height, fit: 'cover', withoutEnlargement: true });
  }

  const info = await pipeline.webp({ quality, effort: 5, alphaQuality: 100 }).toFile(target);
  return { file: path.basename(target), bytes: info.size, skipped: false };
}

async function jobsFor(dir, options) {
  const names = await readdir(path.join(SOURCE, dir));
  return names
    .filter((name) => /\.(png|jpe?g)$/i.test(name))
    .map((name) => convert(dir, name, options));
}

const results = await Promise.all([
  ...(await jobsFor('carrusel', { width: 760, height: 950, quality: 78 })),
  ...(await jobsFor('timeline', { width: 1280, quality: 80 })),
  ...(await jobsFor('logos', { width: 320, quality: 88 })),
  ...(await jobsFor('iconos', { width: 480, quality: 86 })),
]);

const created = results.filter((r) => !r.skipped);

for (const r of created) {
  console.log(`✓ ${r.file} — ${Math.round(r.bytes / 1024)} KB`);
}
console.log(`\n${created.length} generadas, ${results.length - created.length} ya estaban al día.`);
