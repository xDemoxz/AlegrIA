import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Module2FuturoTeaser from '../module2-future';
import ModuleErrorBoundary from '../../components/feedback/ModuleErrorBoundary';

/**
 * Home — sección por defecto de la SPA. Apila la línea de tiempo (Módulo 1)
 * y, justo debajo, el teaser del Módulo 2 "Futuro" (info + botón "Iniciar
 * experiencia 3D"). La experiencia 3D en sí NO vive aquí ni en este proyecto
 * — el botón del teaser abre en pestaña nueva la build deployada en
 * https://zerik-official.github.io/AlegrIA-3D/.
 *
 * El <div> con pb separa las dos secciones a propósito: las tarjetas del
 * timeline usan `transform: rotate(...)` (efecto sticker inclinado), que no
 * cuenta para el alto de su caja de layout — sin este colchón, el borde
 * rotado queda visualmente superpuesto sobre el fondo oscuro del teaser.
 */

// El timeline arrastra three + gsap (~700 kB). Se carga en su propio chunk
// solo cuando el visitante se acerca a la sección, no al abrir el home.
const Module1Timeline = lazy(() => import('../module1-timeline'));

function TimelineSkeleton() {
  return (
    <section
      className="flex min-h-[100svh] items-center justify-center bg-[#0d0d0d] px-6 text-center text-cream/50"
      aria-busy="true"
      aria-label="Cargando la línea de tiempo"
    >
      <p className="font-display text-xl tracking-[0.2em] uppercase">Cargando la línea del barrio…</p>
    </section>
  );
}

/**
 * DeferredTimeline — monta el Módulo 1 justo antes de que su sección entre
 * al viewport. Así el JS de WebGL no compite con la primera pintura y el pin
 * ya existe cuando el usuario llega a la línea de tiempo.
 */
function DeferredTimeline() {
  const anchorRef = useRef(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (near) return;
    const node = anchorRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '10% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [near]);

  return (
    <div ref={anchorRef}>
      {near ? (
        <Suspense fallback={<TimelineSkeleton />}>
          <Module1Timeline />
        </Suspense>
      ) : (
        <TimelineSkeleton />
      )}
    </div>
  );
}


function TimelineFallback() {
  return (
    <section className="flex min-h-[60svh] items-center justify-center bg-[#0d0d0d] px-6 py-16 text-center text-cream">
      <div className="max-w-md">
        <p className="font-display text-3xl leading-tight tracking-wide">
          La línea de tiempo no pudo cargarse
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-cream/70">
          Tu navegador no pudo iniciar WebGL. Puedes seguir con el resto del sitio o crear tu
          propio cartel del barrio.
        </p>
        <Link
          to="/poster"
          className="mt-6 inline-block rounded-pill bg-yellow px-5 py-3 font-display text-lg tracking-wide text-ink shadow-soft transition-all duration-200 ease-pop hover:-translate-y-0.5"
        >
          Abrir el generador de carteles
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <div className="pb-8 md:pb-10 bg-[#0d0d0d]">
        <ModuleErrorBoundary fallback={<TimelineFallback />}>
          <DeferredTimeline />
        </ModuleErrorBoundary>
      </div>
      <Module2FuturoTeaser />
    </>
  );
}
