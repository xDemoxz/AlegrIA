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
          if (val && (val.includes('oklab') || val.includes('oklch'))) {
            // html2canvas no soporta oklab/oklch
            el.style[prop] = val.replace(/okl(?:ab|ch)\([^)]+\)/g, 'transparent');
          }
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
