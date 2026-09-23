import { useState, useEffect, useRef } from 'react';
import { useAppStore, SECTION } from '../store/useAppStore';
import HeaderBanner from '../components/layout/HeaderBanner';
import ModuleNav from '../components/layout/ModuleNav';
import FooterBajero from '../components/layout/FooterBajero';
import GestureCursor from '../components/controls/GestureCursor';
import StoryCarousel from '../components/media/StoryCarousel';
import HomeMuralBanner from '../components/media/HomeMuralBanner';

import Home from '../modules/home';
import Module3Poster from '../modules/module3-poster';
import Module4AR from '../modules/module4-ar';

const MODULES = {
  [SECTION.MOD1_TIMELINE]: Home,
  [SECTION.MOD3_POSTER]: Module3Poster,
  [SECTION.MOD4_AR]: Module4AR,
};

/**
 * HomeApp — chasis global de AlegrIA (todo lo que vive bajo la ruta "/").
 * Renderiza header/nav/footer del sistema de diseño una sola vez y
 * conmuta el módulo activo según useAppStore. Cada compañero trabaja dentro
 * de su carpeta en src/modules/** sin tocar este archivo.
 *
 * El Módulo 2 (Futuro) ya no es una sección propia del switcher: su teaser
 * vive apilado debajo de la línea de tiempo dentro de src/modules/home, y
 * el botón "Iniciar experiencia 3D" navega a la ruta /futuro (ver
 * src/pages/FuturoExperiencePage.jsx), que corre SIN este chasis (sin
 * header/nav/footer) para no competir con el WebGL de Three.js.
 *
 * Header hide-on-scroll: el header se oculta al scrollear hacia abajo y
 * reaparece al scrollear hacia arriba (requestAnimationFrame + threshold).
 * ModuleNav sincroniza su top para no dejar hueco cuando el header está oculto.
 *
 * Layout: wrapper en flex-col + min-h-screen y <main> con flex-1 para que
 * el footer quede pegado al fondo real de la ventana cuando el contenido
 * del módulo activo es corto (sticky footer clásico).
 *
 * GestureCursor se monta aquí UNA sola vez: cuando el sistema de gestos de
 * tu compañero esté conectado (ver src/lib/gestureBridge.js), cualquier
 * módulo que use Pointer Events (como el drag de estampitas del Módulo 3)
 * ya responde a gestos sin cambios adicionales.
 */
export default function HomeApp() {
  const section = useAppStore((s) => s.section);
  const goTo = useAppStore((s) => s.goTo);
  const gestureControlEnabled = useAppStore((s) => s.gestureControlEnabled);
  const toggleGestureControl = useAppStore((s) => s.toggleGestureControl);
  const ActiveModule = MODULES[section];

  // Header hide-on-scroll: oculto al bajar, visible al subir
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const dy = y - lastY.current;
        // Siempre visible cerca del top
        if (y < 10) {
          setHeaderHidden(false);
        } else if (Math.abs(dy) > 6) {
          if (dy > 0 && y > 80) setHeaderHidden(true);
          else if (dy < 0) setHeaderHidden(false);
        }
        lastY.current = y;
        ticking.current = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavSelect = (next) => {
    goTo(next);
    // scroll lógico: lleva el viewport al inicio de <main> descontando nav
    requestAnimationFrame(() => {
      const el = document.getElementById('main-content');
      if (el) {
        const navH = 56;
        const top = el.getBoundingClientRect().top + window.scrollY - navH - 8;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    });
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-yellow overflow-x-hidden">
      {/* Patrón de cuadros global (tipo header) */}
      <div className="absolute inset-0 bg-baldosa opacity-[0.08] pointer-events-none z-0 mix-blend-multiply" />
      
      <HeaderBanner hidden={headerHidden} />
      <ModuleNav active={section} onSelect={handleNavSelect} headerHidden={headerHidden} />
      {/* Spacer para header+nav fixed: altura constante para evitar saltos y scroll thrashing */}
      <div
        aria-hidden="true"
        className="shrink-0 h-[104px] md:h-[112px]"
      />

      {section === SECTION.MOD1_TIMELINE && (
        <>
          <StoryCarousel />
          <HomeMuralBanner />
        </>
      )}
      <main id="main-content" className="relative z-[2] flex-1 flex flex-col scroll-mt-[56px]">
        <ActiveModule />
      </main>

      <FooterBajero />

      <GestureCursor enabled={gestureControlEnabled} />

      <button
        type="button"
        onClick={toggleGestureControl}
        aria-pressed={gestureControlEnabled}
        className="fixed bottom-4 right-4 z-40 font-display text-sm tracking-wide leading-none px-5 pt-2.5 pb-2 rounded-pill shadow-soft transition-all duration-200 ease-pop hover:-translate-y-0.5 hover:shadow-soft-lg active:translate-y-0 active:shadow-pressed"
        style={{ background: gestureControlEnabled ? '#E02828' : '#FDF6E3', color: gestureControlEnabled ? '#fff' : '#0F5F5A' }}
      >
        {gestureControlEnabled ? 'GESTOS: ON' : 'GESTOS: OFF'}
      </button>
    </div>
  );
}
