import { test, expect } from '@playwright/test';
import fs from 'node:fs';

/**
 * Módulo 3 (póster) en teléfono: layout, gestos táctiles reales (CDP) y
 * guardado del PNG en el dispositivo.
 */

/** Arrastre táctil real: touchStart → N touchMove → touchEnd vía CDP. */
async function touchDrag(page, from, to, steps = 12) {
  const cdp = await page.context().newCDPSession(page);
  const point = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(from.x, from.y) });
  for (let i = 1; i <= steps; i++) {
    const x = from.x + ((to.x - from.x) * i) / steps;
    const y = from.y + ((to.y - from.y) * i) / steps;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(x, y) });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

/** Deja el elemento en la parte baja de la pantalla, fuera del cartel sticky. */
const scrollToBottomOfScreen = (locator) =>
  locator.evaluate((el) => el.scrollIntoView({ block: 'end', inline: 'center' }));

const center = async (locator) => {
  const b = await locator.boundingBox();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
};

/** Ancho/alto de un PNG leyendo su cabecera IHDR. */
function pngSize(buf) {
  expect(buf.subarray(1, 4).toString()).toBe('PNG');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

test.beforeEach(async ({ page }) => {
  await page.goto('/poster');
  await expect(page.getByTestId('poster-canvas')).toBeVisible();
});

test('layout móvil: sin scroll horizontal, cartel arriba y a la vista', async ({ page }) => {
  const { scrollW, innerW } = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
  }));
  expect(scrollW).toBeLessThanOrEqual(innerW);

  const canvas = await page.getByTestId('poster-canvas').boundingBox();
  const vp = page.viewportSize();
  expect(canvas.y).toBeGreaterThanOrEqual(0);
  expect(canvas.y + canvas.height).toBeLessThan(vp.height * 0.7);
  expect(canvas.width).toBeGreaterThan(150);
  expect(canvas.height / canvas.width).toBeCloseTo(16 / 9, 1);
  await expect(page.getByRole('button', { name: /guarda tu cartel/i })).toBeInViewport();

  // Cartel sticky: al bajar al formulario sigue arriba.
  await page.getByLabel(/Escribe el texto/).scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 400);
  const after = await page.getByTestId('poster-canvas').boundingBox();
  expect(after.y).toBeGreaterThanOrEqual(0);
  expect(after.y).toBeLessThan(40);
});

test('tocar un fondo y una estampita los pone en el cartel', async ({ page }) => {
  await page.getByLabel('Fondo Selva').tap();
  await expect(page.getByTestId('poster-bg')).toHaveAttribute('src', /selva-tropical/);

  await page.getByLabel('Estampita Turbo').tap();
  await page.getByLabel('Estampita Raspao').tap();
  await expect(page.getByTestId('placed-sticker')).toHaveCount(2);
});

test('arrastrar con el dedo una estampita de la galería al cartel', async ({ page }) => {
  const tile = page.getByLabel('Estampita Mariposas');
  await scrollToBottomOfScreen(tile);
  const canvas = await page.getByTestId('poster-canvas').boundingBox();
  const target = { x: canvas.x + canvas.width * 0.3, y: canvas.y + canvas.height * 0.7 };

  await touchDrag(page, await center(tile), target);

  const placed = page.getByTestId('placed-sticker');
  await expect(placed).toHaveCount(1);
  const c = await center(placed);
  expect(Math.abs(c.x - target.x)).toBeLessThan(6);
  expect(Math.abs(c.y - target.y)).toBeLessThan(6);
});

test('mover con el dedo una estampita ya colocada', async ({ page }) => {
  await page.getByLabel('Estampita Turbo').tap();
  const placed = page.getByTestId('placed-sticker');
  const canvas = await page.getByTestId('poster-canvas').boundingBox();
  const start = await center(placed);
  const target = { x: canvas.x + canvas.width * 0.75, y: canvas.y + canvas.height * 0.8 };

  await touchDrag(page, start, target);

  const end = await center(placed);
  expect(Math.abs(end.x - target.x)).toBeLessThan(6);
  expect(Math.abs(end.y - target.y)).toBeLessThan(6);
});

test('deslizar de lado la tira de estampitas la desplaza sin agregar nada', async ({ page }) => {
  const strip = page.getByTestId('sticker-gallery');
  await scrollToBottomOfScreen(strip);
  const b = await strip.boundingBox();
  const y = b.y + 50;
  await touchDrag(page, { x: b.x + b.width - 30, y }, { x: b.x + 30, y }, 20);

  await expect.poll(() => strip.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  await expect(page.getByTestId('placed-sticker')).toHaveCount(0);
  await expect(page.getByTestId('drag-ghost')).toHaveCount(0);
});

test('guardar: genera un PNG 1080×1920 y lo guarda en el teléfono', async ({ page }, testInfo) => {
  const ios = testInfo.project.name === 'iphone';
  if (ios) {
    // Chromium en Windows no tiene la hoja nativa de iOS: se captura el
    // archivo que se le pasaría a navigator.share.
    await page.evaluate(() => {
      navigator.canShare = (data) => !!data?.files?.length;
      navigator.share = async ({ files }) => {
        const f = files[0];
        const bmp = await createImageBitmap(f);
        window.__shared = { name: f.name, type: f.type, size: f.size, width: bmp.width, height: bmp.height };
      };
    });
  }

  await page.getByLabel(/Nombre de tu cartel/).fill('Barrio Abajo');
  await page.getByLabel('Fondo Carnaval').tap();
  await page.getByLabel('Estampita Alegría').tap();
  await page.getByTestId('poster-canvas').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: /guarda tu cartel/i }).tap();

  const dialog = page.getByRole('dialog', { name: /tu cartel está listo/i });
  await expect(dialog).toBeVisible({ timeout: 30_000 });
  await expect(dialog.getByAltText('Vista previa de tu cartel')).toBeVisible();

  if (ios) {
    await dialog.getByRole('button', { name: /guardar en mi celular/i }).tap();
    await expect.poll(() => page.evaluate(() => window.__shared)).toBeTruthy();
    const shared = await page.evaluate(() => window.__shared);
    expect(shared).toMatchObject({ name: 'barrio-abajo-alegria.png', type: 'image/png', width: 1080, height: 1920 });
    expect(shared.size).toBeGreaterThan(50_000);
  } else {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      dialog.getByRole('button', { name: /guardar en mi celular/i }).tap(),
    ]);
    expect(download.suggestedFilename()).toBe('barrio-abajo-alegria.png');
    const buf = fs.readFileSync(await download.path());
    expect(pngSize(buf)).toEqual({ width: 1080, height: 1920 });
    expect(buf.length).toBeGreaterThan(50_000);
    await testInfo.attach('cartel.png', { body: buf, contentType: 'image/png' });
  }

  await expect(dialog).toBeHidden();
});

test('guardar: el PNG no incluye controles de edición y no sale vacío', async ({ page }) => {
  await page.getByLabel('Fondo Neón').tap();
  await page.getByLabel('Estampita Turbo').tap();
  await expect(page.getByLabel('Quitar estampita')).toBeVisible();
  await page.getByRole('button', { name: /guarda tu cartel/i }).tap();
  const img = page.getByRole('dialog').getByAltText('Vista previa de tu cartel');
  await expect(img).toBeVisible({ timeout: 30_000 });

  // Muestreo de píxeles del PNG: el fondo tiene que haberse dibujado (no un
  // cartel negro/transparente) y las esquinas son opacas (sin radio).
  const stats = await img.evaluate(async (el) => {
    const bmp = await createImageBitmap(await (await fetch(el.src)).blob());
    const c = new OffscreenCanvas(bmp.width, bmp.height);
    const ctx = c.getContext('2d');
    ctx.drawImage(bmp, 0, 0);
    const corner = ctx.getImageData(0, 0, 1, 1).data;
    const { data } = ctx.getImageData(0, 0, bmp.width, bmp.height);
    const colors = new Set();
    for (let i = 0; i < data.length; i += 4 * 997) colors.add(`${data[i] >> 4},${data[i + 1] >> 4},${data[i + 2] >> 4}`);
    return { cornerAlpha: corner[3], distinctColors: colors.size };
  });
  expect(stats.cornerAlpha).toBe(255);
  expect(stats.distinctColors).toBeGreaterThan(40);
});
