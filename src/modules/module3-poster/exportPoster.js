/**
 * exportPoster — exporta el nodo del canvas del póster a PNG usando
 * html2canvas (import dinámico para no inflar el bundle inicial).
 * Dispara la descarga en el navegador y devuelve el data URL por si el
 * caller quiere hacer algo más con la imagen (preview, subir, etc.).
 */
export async function exportPosterToPng(node, filename = 'cartel-alegria.png') {
  if (!node) throw new Error('exportPosterToPng: no se recibió el nodo del canvas');

  const { default: html2canvas } = await import('html2canvas');

  // Esperar a que las imágenes dentro del nodo estén cargadas
  const images = node.querySelectorAll('img');
  await Promise.all(
    Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    })
  );

  // Renderizado normal primero: con foreignObjectRendering el cartel (que ahora
  // lleva imágenes de fondo/estampitas) salía TRANSPARENTE, porque un SVG no
  // puede cargar recursos externos. foreignObject queda como plan B por si
  // algún color oklab/oklch de Tailwind v4 rompe el renderizado normal.
  const options = (foreignObjectRendering) => ({
    backgroundColor: null,
    scale: 2,
    useCORS: true,
    logging: false,
    foreignObjectRendering,
    onclone: (clonedDoc) => {
      // (No forzar img.crossOrigin aquí: fuerza una recarga en el clon y las
      // imágenes —fondo y estampitas, todas del mismo origen— salen vacías.)
      // Forzar colores computados a formato compatible (hex/rgb) para html2canvas
      const walker = document.createTreeWalker(clonedDoc.body, NodeFilter.SHOW_ELEMENT);
      while (walker.nextNode()) {
        const el = walker.currentNode;
        // El clon reinicia las animaciones CSS (ej. el fade-in del fondo, que
        // arranca en opacity 0) y se capturaría casi invisible.
        el.style.setProperty('animation', 'none');
        const style = clonedDoc.defaultView.getComputedStyle(el);
        ['backgroundColor', 'color', 'borderColor', 'boxShadow'].forEach((prop) => {
          const val = style.getPropertyValue(prop);
          if (val && (val.includes('oklab') || val.includes('oklch'))) {
            // html2canvas no soporta oklab/oklch; forzar a rgb
            el.style.setProperty(prop, val.replace(/okla?b?\([^)]+\)/g, 'transparent'));
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

  // Usar blob en lugar de data URL para evitar bloqueos de descarga en algunos navegadores
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('No se pudo generar el blob de la imagen');

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Limpiar el object URL después de un tiempo
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return url;
}
