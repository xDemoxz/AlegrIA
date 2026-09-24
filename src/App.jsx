import { useEffect } from 'react';
import { useAppStore, SECTION } from './store/useAppStore';
import HeaderBanner from './components/layout/HeaderBanner';
import MarqueeStrip from './components/layout/MarqueeStrip';
import FooterBajero from './components/layout/FooterBajero';
import BaldosaPattern from './components/motifs/BaldosaPattern';

import Module1Timeline from './modules/module1-timeline';
import Module2Future from './modules/module2-future';
import Module3Poster from './modules/module3-poster';
import Module4AR from './modules/module4-ar';

const MODULES = {
  [SECTION.MOD1_TIMELINE]: Module1Timeline,
  [SECTION.MOD2_FUTURE]: Module2Future,
  [SECTION.MOD3_POSTER]: Module3Poster,
  [SECTION.MOD4_AR]: Module4AR,
};

/**
 * App — chasis global de AlegrIA. Renderiza header/marquee/footer del
 * sistema de diseño una sola vez y conmuta el módulo activo según
 * useAppStore. Cada compañero trabaja dentro de su carpeta en
 * src/modules/** sin tocar este archivo.
 */
export default function App() {
  const section = useAppStore((s) => s.section);
  const ActiveModule = MODULES[section];

  // Reservado: aquí se conectará Lenis (smooth scroll) cuando el Módulo 1
  // esté listo para consumirlo — no inicializar antes de tiempo.
  useEffect(() => {}, []);

  return (
    <div className="relative min-h-screen bg-yellow pb-24 overflow-hidden">
      <BaldosaPattern className="absolute inset-0 pointer-events-none" opacity={0.13} />

      <HeaderBanner />
      <MarqueeStrip />

      <main className="relative z-[2]">
        <ActiveModule />
      </main>

      <FooterBajero />
    </div>
  );
}
