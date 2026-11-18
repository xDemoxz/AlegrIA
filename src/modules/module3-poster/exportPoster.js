/**
 * exportPoster — convierte el nodo del cartel en PNG (html2canvas, import
 * dinámico para no inflar el bundle inicial) y lo guarda en el dispositivo.
 *
 * Dos pasos separados a propósito:
 *  1. renderPosterToBlob: el render tarda (fuentes, imágenes, html2canvas).
 *  2. savePosterBlob: compartir/descargar. En móvil se llama desde un
 *     SEGUNDO toque del usuario (hoja de resultado), porque Web Share exige
 *     un gesto reciente y el render se come esa ventana (iOS lo rechaza con
 *     NotAllowedError si se llama tras un await largo).
 */

/** Ancho final del PNG: 1080×1920, formato historia de Instagram/WhatsApp. */
export const EXPORT_WIDTH = 1080;

/** Nombre de archivo seguro a partir del título del cartel. */
export function sanitizeFilename(title) {
  const base = String(title ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `${base || 'cartel'}-alegria.png`;
}

/** Escala de html2canvas para que el PNG salga a EXPORT_WIDTH sin importar el tamaño en pantalla. */
export function getExportScale(nodeWidth) {
  if (!nodeWidth || nodeWidth <= 0) return 2;
  return EXPORT_WIDTH / nodeWidth;
}

// ---------------------------------------------------------------------------
// Colores oklch/oklab → sRGB
// ---------------------------------------------------------------------------
// Tailwind v4 emite sus tokens en oklch y html2canvas solo entiende hex/rgb.
// Antes el clon reemplazaba la declaración completa por `transparent`: si el
// navegador reportaba el color del título en oklch, el texto desaparecía del
// PNG. Aquí se convierte el color al espacio sRGB (misma matemática que la
// especificación CSS Color 4), con alfa incluida.

const clamp01 = (n) => Math.min(1, Math.max(0, n));

/** '70%' → 0.7; '0.7' → 0.7. `percentScale` define cuánto vale 100 %. */
function parseFraction(raw, percentScale = 1) {
  if (raw === 'none') return 0;
  const value = String(raw).trim();
  if (value.endsWith('%')) {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? (n / 100) * percentScale : null;
  }
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function parseAngle(raw) {
  if (raw === 'none') return 0;
  const value = String(raw).trim().toLowerCase();
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return null;
  if (value.endsWith('rad')) return n;
  if (value.endsWith('turn')) return n * Math.PI * 2;
  if (value.endsWith('grad')) return (n * Math.PI) / 200;
  return (n * Math.PI) / 180; // deg o número sin unidad
}

function parseAlpha(raw) {
  const a = parseFraction(raw);
  return a === null ? null : clamp01(a);
}

/** Convierte un color `oklch(...)`/`oklab(...)` completo a `rgba(...)`. */
export function oklchToRgb(color) {
  const text = String(color ?? '').trim();
  const match = /^okl(ab|ch)\(\s*([^)]+)\)$/i.exec(text);
  if (!match) return null;

  const isPolar = match[1].toLowerCase() === 'ch';
  const [rawValues, rawAlpha = '1'] = match[2].split('/');
  const parts = rawValues.trim().split(/[\s,]+/).filter(Boolean);
  if (parts.length < 3) return null;

  const alpha = parseAlpha(rawAlpha);
  if (alpha === null) return null;

  const L = parseFraction(parts[0]);
  if (L === null) return null;

  let a;
  let b;
  if (isPolar) {
    const C = parseFraction(parts[1], 0.4);
    const H = parseAngle(parts[2]);
    if (C === null || H === null) return null;
    a = C * Math.cos(H);
    b = C * Math.sin(H);
  } else {
    a = parseFraction(parts[1]);
    b = parseFraction(parts[2]);
    if (a === null || b === null) return null;
  }

  // OKLab → LMS → sRGB lineal.
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  // sRGB lineal → gamma compuesta (la que consumen canvas y html2canvas).
  const toByte = (value) => {
    const c = clamp01(value);
    const gamma = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(clamp01(gamma) * 255);
  };

  const [r, g, b2] = linear.map(toByte);
  return `rgba(${r}, ${g}, ${b2}, ${Number(alpha.toFixed(3))})`;
}

/**
 * Sustituye cada oklch/oklab de un valor CSS (p. ej. el color de un
 * `box-shadow` compuesto) por su equivalente rgba. Si un token no se puede
 * interpretar usa `fallback`.
 */
export function replaceUnsupportedColors(value, fallback = 'transparent') {
  const text = String(value ?? '');
  if (!/okl(?:ab|ch)\(/i.test(text)) return text;
  return text.replace(/okl(?:ab|ch)\([^)]*\)/gi, (token) => oklchToRgb(token) ?? fallback);
}


/** Pantalla táctil como puntero principal (teléfonos/tablets). */
export function isTouchDevice() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;
}

/** iOS/iPadOS (el iPad moderno se reporta como MacIntel con touch). */
export function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/** ¿El navegador puede compartir este archivo con la hoja nativa (Web Share nivel 2)? */
export function canShareFile(file) {
  try {
    return typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare?.({ files: [file] });
  } catch {
    return false;
  }
}

function waitForImages(node) {
  return Promise.all(
    Array.from(node.querySelectorAll('img')).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    })
  );
}

/**
 * El ancho del cartel en pantalla es fraccionario (28svh), así que
 * alto × escala no cae exacto (ej. 1922px). Se redibuja a medida exacta
 * (EXPORT_WIDTH × alto proporcional); la diferencia es de 1–2 px.
 */
function normalizeSize(canvas, node) {
  const { width, height } = node.getBoundingClientRect();
  if (!width || !height) return canvas;
  const targetH = Math.round((EXPORT_WIDTH * height) / width);
  if (canvas.width === EXPORT_WIDTH && canvas.height === targetH) return canvas;
  const out = document.createElement('canvas');
  out.width = EXPORT_WIDTH;
  out.height = targetH;
  out.getContext('2d').drawImage(canvas, 0, 0, EXPORT_WIDTH, targetH);
  return out;
}

/** Renderiza el cartel a un Blob PNG de EXPORT_WIDTH de ancho. */
export async function renderPosterToBlob(node) {
  if (!node) throw new Error('renderPosterToBlob: no se recibió el nodo del canvas');

  const { default: html2canvas } = await import('html2canvas');

  // Sin fuentes cargadas, html2canvas dibuja el título con la fuente fallback.
  await document.fonts?.ready;
  await waitForImages(node);

  // Renderizado normal primero: con foreignObjectRendering el cartel (que
  // lleva imágenes de fondo/estampitas) salía TRANSPARENTE, porque un SVG no
  // puede cargar recursos externos. foreignObject queda como plan B por si
  // algún color oklab/oklch de Tailwind v4 rompe el renderizado normal.
  const options = (foreignObjectRendering) => ({
    backgroundColor: '#121212',
    scale: getExportScale(node.getBoundingClientRect().width),
    useCORS: true,
    logging: false,
    foreignObjectRendering,
    onclone: (clonedDoc) => {
      // (No forzar img.crossOrigin aquí: fuerza una recarga en el clon y las
      // imágenes —fondo y estampitas, todas del mismo origen— salen vacías.)

      // El PNG sale a sangre: sin esquinas redondeadas (quedarían
      // transparentes/negras en la galería del teléfono) ni sombra.
      const root = clonedDoc.querySelector('[data-poster-canvas]');
      if (root) {
        root.style.setProperty('border-radius', '0');
        root.style.setProperty('box-shadow', 'none');
      }

      // Forzar colores computados a formato compatible (hex/rgb) para html2canvas
      const walker = clonedDoc.createTreeWalker(clonedDoc.body, NodeFilter.SHOW_ELEMENT);
      while (walker.nextNode()) {
        const el = walker.currentNode;
        // El clon reinicia las animaciones CSS (ej. el fade-in del fondo, que
        // arranca en opacity 0) y se capturaría casi invisible.
        el.style.setProperty('animation', 'none');
        const style = clonedDoc.defaultView.getComputedStyle(el);
        ['backgroundColor', 'color', 'borderColor', 'boxShadow'].forEach((prop) => {
          const val = style[prop];
          if (!val || !/okl(?:ab|ch)\(/i.test(val)) return;
          // El texto cae a negro (legible) si el token no se puede convertir;
          // fondos y bordes caen a transparente como antes.
          el.style[prop] = replaceUnsupportedColors(val, prop === 'color' ? '#000000' : 'transparent');
        });
      }
    },
  });

  let canvas;
  try {
    canvas = await html2canvas(node, options(false));
  } catch (err) {
    console.warn('[exportPoster] renderizado normal falló, reintentando con foreignObject:', err);
    canvas = await html2canvas(node, options(true));
  }
  canvas = normalizeSize(canvas, node);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('No se pudo generar el blob de la imagen');
  return blob;
}

/** Descarga clásica con <a download> + object URL. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Safari necesita que la URL viva un rato después del click.
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Guarda el PNG en el dispositivo.
 * - preferShare: abre la hoja nativa (en iOS trae "Guardar imagen" → Fotos).
 *   Si no hay Web Share con archivos, o falla, cae a descarga.
 * @returns {Promise<'shared'|'downloaded'|'cancelled'>}
 */
export async function savePosterBlob(blob, filename, { preferShare = false } = {}) {
  if (preferShare) {
    const file = new File([blob], filename, { type: 'image/png' });
    if (canShareFile(file)) {
      try {
        await navigator.share({ files: [file], title: 'Mi cartel · Barrio Abajo' });
        return 'shared';
      } catch (err) {
        // El usuario cerró la hoja: no es un error ni hay que descargar.
        if (err?.name === 'AbortError') return 'cancelled';
        console.warn('[exportPoster] share falló, se descarga en su lugar:', err);
      }
    }
  }
  downloadBlob(blob, filename);
  return 'downloaded';
}

/** Atajo (escritorio): renderizar y descargar en un solo paso. */
export async function exportPosterToPng(node, filename = 'cartel-alegria.png') {
  const blob = await renderPosterToBlob(node);
  downloadBlob(blob, filename);
  return blob;
}
