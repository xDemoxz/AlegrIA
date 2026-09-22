import { useAppStore, SECTION } from './store/useAppStore';
import HeaderBanner from './components/layout/HeaderBanner';
import MarqueeStrip from './components/layout/MarqueeStrip';
import FooterBajero from './components/layout/FooterBajero';
import BaldosaPattern from './components/motifs/BaldosaPattern';
import GestureCursor from './components/controls/GestureCursor';

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
 *
 * GestureCursor se monta aquí UNA sola vez: cuando el sistema de gestos de
 * tu compañero esté conectado (ver src/lib/gestureBridge.js), cualquier
 * módulo que use Pointer Events (como el drag de estampitas del Módulo 3)
 * ya responde a gestos sin cambios adicionales.
 */
export default function App() {
  const section = useAppStore((s) => s.section);
  const gestureControlEnabled = useAppStore((s) => s.gestureControlEnabled);
  const toggleGestureControl = useAppStore((s) => s.toggleGestureControl);
  const ActiveModule = MODULES[section];

  return (
    <div className="relative min-h-screen bg-yellow pb-24 overflow-hidden">
      <BaldosaPattern className="absolute inset-0 pointer-events-none" opacity={0.13} />

      <HeaderBanner />
      <MarqueeStrip />

      <main className="relative z-[2]">
        <ActiveModule />
      </main>

      <FooterBajero />

      <GestureCursor enabled={gestureControlEnabled} />

      {/* Toggle temporal de depuración — control por gestos. Muévelo al
          lugar definitivo del flujo cuando el sistema de tu compañero esté
          integrado; por ahora sirve para probar el bridge sin su hardware. */}
      <button
        type="button"
        onClick={toggleGestureControl}
        className="fixed bottom-4 right-4 z-[999] font-display text-sm tracking-wide px-4 pt-2 pb-1 rounded-pill border-3 border-ink shadow-pop-black"
        style={{ background: gestureControlEnabled ? '#E02828' : '#FDF6E3', color: gestureControlEnabled ? '#fff' : '#121212' }}
      >
        {gestureControlEnabled ? 'GESTOS: ON' : 'GESTOS: OFF'}
      </button>
    </div>
  );
}
