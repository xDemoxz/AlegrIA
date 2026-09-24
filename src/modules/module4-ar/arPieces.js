/**
 * Piezas del recorrido AR (Módulo 4).
 *
 * Espejo de MUSEUM_MODELS en el proyecto de Mattercraft (MuseumContext.ts):
 * mismo orden que los Image Targets (01 → 09). Aquí solo se usa para el
 * teaser de la web; la experiencia real (detección + modelos 3D + panel de
 * info) vive en Mattercraft y se embebe por iframe en /ra.
 * Si agregás o cambiás una pieza en Mattercraft, actualizala acá también.
 */
export const AR_PIECES = [
  { id: 'casa_historica', name: 'Casa Histórica', target: '01-marimonda-ojos' },
  { id: 'tienda_esquina', name: 'Tienda de Esquina', target: '02-marimonda-retazos' },
  { id: 'sombrero_vueltiao', name: 'Sombrero Vueltiao', target: '03-marimonda-orejas' },
  { id: 'tambor_alegre', name: 'Tambor Alegre', target: '04-garabato-cruz' },
  { id: 'mascara_marimonda', name: 'Máscara Marimonda', target: '05-garabato-muerte' },
  { id: 'pico_verbenero', name: 'Picó Verbenero', target: '06-monocuco-lentejuelas' },
  { id: 'carretilla_frutas', name: 'Carretilla de Frutas', target: '07-monocuco-capucha' },
  { id: 'mesa_domino', name: 'Mesa de Dominó', target: '08-tambores-tambora' },
  { id: 'tinaja_totuma', name: 'Tinaja y Totuma', target: '09-tambores-alegre' },
];

/**
 * URL pública de la experiencia publicada en ZapWorks (ver .env.example).
 * Si se pega sin protocolo, se antepone https:// — sin él el navegador la
 * resuelve como ruta relativa y el iframe cargaría localhost/<url>.
 */
const rawArUrl = (import.meta.env.VITE_AR_URL || '').trim();
export const AR_URL = rawArUrl && !/^https?:\/\//i.test(rawArUrl) ? `https://${rawArUrl}` : rawArUrl;
