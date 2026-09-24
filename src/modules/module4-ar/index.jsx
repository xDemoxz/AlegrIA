import PopAlert from '../../components/feedback/PopAlert';

/**
 * MÓDULO 4 (provisional) — Realidad Aumentada con Zappar (Nicolás)
 * ------------------------------------------------------------------
 * Responsable: Nicolás — setup del SDK de Zappar (Universal AR / WebAR),
 * disparador AR. Integración final de gestos + AR en Fase 2 junto a José.
 *
 * Instalar cuando arranques este módulo:
 *   npm install @zappar/zappar-react-three-fiber
 *   (o @zappar/zappar-threejs, según cómo lo integres con Módulo 2)
 */
export default function Module4AR() {
  return (
    <section className="max-w-[1240px] mx-auto px-6 pt-14 flex flex-col gap-5">
      <PopAlert tone="info">
        Módulo de Realidad Aumentada (Zappar) — setup pendiente. Placeholder mientras se define
        el disparador AR final.
      </PopAlert>
      <div className="border-3 border-ink rounded-sticker bg-cream p-10 text-center">
        <p className="text-base font-medium">Aquí se monta el canvas/disparador de Zappar.</p>
      </div>
    </section>
  );
}
