/**
 * exportPoster — exporta el nodo del canvas del póster a PNG usando
 * html2canvas (import dinámico para no inflar el bundle inicial).
 * Dispara la descarga en el navegador y devuelve el data URL por si el
 * caller quiere hacer algo más con la imagen (preview, subir, etc.).
 */
export async function exportPosterToPng(node, filename = 'cartel-alegria.png') {
  if (!node) throw new Error('exportPosterToPng: no se recibió el nodo del canvas');

  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(node, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
  });

  const dataUrl = canvas.toDataURL('image/png');

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return dataUrl;
}
