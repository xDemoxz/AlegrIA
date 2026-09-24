import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SECTION } from '../store/useAppStore';
import HeaderBanner from '../components/layout/HeaderBanner';
import FooterBajero from '../components/layout/FooterBajero';
import StoryCarousel from '../components/media/StoryCarousel';
import HomeMuralBanner from '../components/media/HomeMuralBanner';

import Home from '../modules/home';

// Nav del header (secciones del store) -> rutas. El home es composición
// estática: cada página vive en su ruta y el header solo navega.
const SECTION_ROUTES = {
  [SECTION.MOD1_TIMELINE]: '/',
  [SECTION.MOD3_POSTER]: '/poster',
  [SECTION.MOD4_AR]: '/ar',
};
const ROUTE_SECTIONS = {
  '/': SECTION.MOD1_TIMELINE,
  '/poster': SECTION.MOD3_POSTER,
  '/ar': SECTION.MOD4_AR,
};

/**
 * HomeApp — home estático de AlegrIA (ruta "/"): header + carrusel +
 * mural + línea de tiempo con teaser + footer. Sin switcher por store
 * (póster y AR viven en /poster y /ar). Se conserva el header
 * hide-on-scroll. Layout flex-col + main flex-1 para sticky footer.
 */
export default function HomeApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = ROUTE_SECTIONS[location.pathname] ?? SECTION.MOD1_TIMELINE;

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

  const handleNavSelect = (section) => {
    navigate(SECTION_ROUTES[section] ?? '/');
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-yellow overflow-x-hidden">
      {/* Patrón de cuadros global (tipo header) */}
      <div className="absolute inset-0 bg-baldosa opacity-[0.08] pointer-events-none z-0 mix-blend-multiply" />

      <HeaderBanner hidden={headerHidden} active={active} onSelect={handleNavSelect} />
      {/* Spacer para header fixed: altura constante para evitar saltos y scroll thrashing */}
      <div
        aria-hidden="true"
        className="shrink-0 h-[56px] md:h-[64px] bg-ink"
      />

      <StoryCarousel />
      <HomeMuralBanner />
      <main id="main-content" className="relative z-[2] flex-1 flex flex-col">
        <Home />
      </main>

      <FooterBajero />
    </div>
  );
}
