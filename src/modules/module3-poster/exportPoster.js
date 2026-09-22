/**
 * exportPoster — renderiza el nodo del cartel a PNG y dispara la descarga.
 * Usa html2canvas (agrégalo con `npm install html2canvas` si aún no está).
 */
export async function exportPosterToPng(
  node,
  filename = "mi-cartel-alegria.png"
) {
  const { default: html2canvas } = await import("html2canvas")
  const canvas = await html2canvas(node, {
    backgroundColor: null,
    scale: 2, // nitidez para impresión/proyección
    useCORS: true
  })

  const dataUrl = canvas.toDataURL("image/png")
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  return dataUrl
}
