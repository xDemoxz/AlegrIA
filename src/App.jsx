import { useAppStore, SECTION } from './store/useAppStore';
import HeaderBanner from './components/layout/HeaderBanner';
import MarqueeStrip from './components/layout/MarqueeStrip';
import ModuleNav from './components/layout/ModuleNav';
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
 * App — chasis global de AlegrIA. Renderiza header/marquee/nav una sola
 * vez y conmuta el módulo activo según useAppStore. Cada compañero
 * trabaja dentro de su carpeta en src/modules/** sin tocar este archivo.
 *
 * SIN animaciones de scroll — navbar completo (Header + Marquee +
 * ModuleNav) siempre visible y estático, como al principio. Se probó una
 * versión flotante (TopNav.jsx + hooks de scroll + ScrollHint.jsx) y se
 * descartó por decisión de diseño; esos archivos quedaron sin usar.
 *
 * Layout: wrapper en flex-col + min-h-screen y <main> con flex-1 para que
 * el footer quede pegado al fondo real de la ventana cuando el contenido
 * del módulo activo es corto (sticky footer clásico). Se quitó el pb-20
 * del wrapper: generaba un hueco extra entre el footer y el borde inferior
 * real de la página.
 */
export default function App() {
  const section = useAppStore((s) => s.section);
  const goTo = useAppStore((s) => s.goTo);
  const gestureControlEnabled = useAppStore((s) => s.gestureControlEnabled);
  const toggleGestureControl = useAppStore((s) => s.toggleGestureControl);
  const ActiveModule = MODULES[section];

  return (
    <div className="relative flex flex-col min-h-screen bg-yellow overflow-x-hidden">
      <BaldosaPattern className="absolute inset-0 pointer-events-none" opacity={0.13} />

      <HeaderBanner />
      <MarqueeStrip />
      <ModuleNav active={section} onSelect={goTo} />

      <main className="relative z-[2] flex-1">
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
        className="fixed bottom-4 right-4 z-[999] font-display text-sm tracking-wide leading-none px-5 pt-2.5 pb-2 rounded-pill border-3 border-ink shadow-pop-black"
        style={{ background: gestureControlEnabled ? '#E02828' : '#FDF6E3', color: gestureControlEnabled ? '#fff' : '#121212' }}
      >
        {gestureControlEnabled ? 'GESTOS: ON' : 'GESTOS: OFF'}
      </button>
    </div>
  );
}
