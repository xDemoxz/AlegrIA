/**
 * Resuelve una ruta de /public contra la base de Vite.
 *
 * Con `base: '/'` devuelve la misma ruta de siempre (`/assets/...`), pero si
 * el sitio se publica en un subdirectorio (GitHub Pages: `/AlegrIA/`), el
 * navegador recibe `/AlegrIA/assets/...` y los assets no dan 404.
 */
const BASE = import.meta.env.BASE_URL;

export function asset(path) {
  return `${BASE}${String(path).replace(/^\/+/, '')}`;
}
