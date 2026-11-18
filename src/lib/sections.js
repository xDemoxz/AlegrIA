/**
 * Secciones públicas de AlegrIA.
 *
 * El proyecto no usa un store global: cada módulo vive en su propia ruta y
 * el header solo necesita saber cuál está activa. Este enum reemplaza al
 * antiguo `useAppStore` (zustand), que ya no tenía consumidores.
 */
export const SECTION = {
  MOD1_TIMELINE: 'MOD1_TIMELINE',
  MOD3_POSTER: 'MOD3_POSTER',
  MOD4_AR: 'MOD4_AR',
};
