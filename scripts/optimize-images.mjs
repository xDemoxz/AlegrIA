/**
 * Genera las versiones WebP de las imágenes de la primera pantalla
 * (carrusel) y de la línea de tiempo (fotos de hitos).
 *
 * Uso: npm run optimize:images
 *
 * - Carrusel: se redimensiona a 760px de ancho (2× la card de 340px) y se
 *   recorta a 4:5 para no pagar el alto sobrante del PNG original.
 * - Timeline: se mantiene el ancho original (se usa como textura a pantalla
 *   completa en el túnel WebGL); solo cambia el formato.
 *
 * Los PNG originales se conservan como fuente: este script debe poder
 * regenerar los .webp en cualquier momento.
 */
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');

async function newerThan(source, target) {
  try {
    const [s, t] = await Promise.all([stat(source), stat(target)]);
    return s.mtimeMs <= t.mtimeMs;
  } catch {
    return false;
  }
}

async function convert(relativePath, { width, height, quality }) {
  const source = path.join(ROOT, relativePath);
  const target = source.replace(/\.(png|jpe?g)$/i, '.webp');

  if (await newerThan(source, target)) {
    return { file: path.basename(target), skipped: true };
  }

  let pipeline = sharp(source).rotate();
  if (width || height) {
    pipeline = pipeline.resize({ width, height, fit: 'cover', withoutEnlargement: true });
  }

  const info = await pipeline.webp({ quality, effort: 5 }).toFile(target);
  return { file: path.basename(target), bytes: info.size, skipped: false };
}

const jobs = [];

const carruselDir = path.join(ROOT, 'public/assets/carrusel');
for (const name of await readdir(carruselDir)) {
  if (!name.endsWith('.png')) continue;
  jobs.push(convert(`public/assets/carrusel/${name}`, { width: 760, height: 950, quality: 78 }));
}

const timelineDir = path.join(ROOT, 'public/assets/timeline');
for (const name of await readdir(timelineDir)) {
  if (!/\.(png|jpe?g)$/i.test(name)) continue;
  // 1280px cubre el túnel a pantalla completa sin enviar originales de 4K.
  jobs.push(convert(`public/assets/timeline/${name}`, { width: 1280, quality: 80 }));
}

// Logos: se muestran a 32–44px de alto; 128px cubre pantallas 3×.
const logosDir = path.join(ROOT, 'public/assets/logos');
for (const name of await readdir(logosDir)) {
  if (!/\.(png|jpe?g)$/i.test(name)) continue;
  jobs.push(convert(`public/assets/logos/${name}`, { width: 320, quality: 88 }));
}

const results = await Promise.all(jobs);
const created = results.filter((r) => !r.skipped);
const skipped = results.filter((r) => r.skipped);

for (const r of created) {
  console.log(`✓ ${r.file} — ${Math.round(r.bytes / 1024)} KB`);
}
console.log(`\n${created.length} generadas, ${skipped.length} ya estaban al día.`);
