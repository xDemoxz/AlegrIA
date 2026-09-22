import { useState } from 'react';
import TimelineRail from '../../components/data/TimelineRail';
import StickerCard from '../../components/data/StickerCard';
import QuoteCard from '../../components/data/QuoteCard';
import barrioAbajoData from '../../data/barrioAbajoData.json';

/**
 * MÓDULO 1 — Línea del Tiempo (Sebastián)
 * ------------------------------------------------------------------
 * Responsable: Sebastián — DOM, scroll (GSAP/Anime.js), panel lateral
 * (aside), render de hitos pasados/presentes.
 *
 * Lo que ya está listo para ti:
 *  - TimelineRail / TimelineBadge (components/data, components/controls)
 *  - StickerCard y QuoteCard para renderizar cada hito
 *  - barrioAbajoData.json como mock de datos (hitos[])
 *
 * Lo que falta implementar aquí:
 *  - Scrollytelling real con GSAP ScrollTrigger / Lenis
 *  - El "aside" para alternar Pasado ↔ Presente
 *  - (Opcional) integración de gestos MediaPipe sobre el scroll
 *
 * No necesitas tocar useAppStore: cuando el módulo termine su recorrido,
 * llama a next() del store para pasar al Módulo 2.
 *
 */
export default function Module1Timeline() {
  const [activeYear, setActiveYear] = useState(barrioAbajoData.hitos[0].year);
  const activeHito = barrioAbajoData.hitos.find((h) => h.year === activeYear);

  return (
    <section className="max-w-[1240px] mx-auto px-6 pt-12 flex flex-col gap-7">
      <TimelineRail
        hitos={barrioAbajoData.hitos}
        activeYear={activeYear}
        onSelect={setActiveYear}
      />

      <div className="grid gap-7" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {activeHito?.quote ? (
          <QuoteCard year={activeHito.year} quote={activeHito.quote} />
        ) : (
          activeHito && (
            <StickerCard
              year={activeHito.year}
              category={activeHito.category}
              title={activeHito.title}
              text={activeHito.text}
            />
          )
        )}
      </div>

      {/* TODO(Sebastián): reemplazar este grid estático por el recorrido de
          scrollytelling real (GSAP ScrollTrigger) que va disparando cada hito. */}
    </section>
  );
}
