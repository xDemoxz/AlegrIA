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

  const canvas = await html2canvas(node, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
    logging: true,
    onclone: (clonedDoc) => {
      // Asegurar que las imágenes clonas tengan crossOrigin
      clonedDoc.querySelectorAll('img').forEach((img) => {
        img.crossOrigin = 'anonymous';
      });
    },
  });

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
