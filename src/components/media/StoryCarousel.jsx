import { useEffect, useState } from 'react';
import { asset } from '../../lib/asset';

/**
 * StoryCarousel — banda editorial debajo del hero global.
 * Cinta continua infinita (bajero-marquee en src/index.css) con
 * track duplicado [...SLIDES, ...SLIDES] para loop translateX(-50%).
 * Compacto: cards 300-340px para no robar >1 viewport al timeline.
 *
 * Accesibilidad: el movimiento se puede pausar con un botón visible (no
 * depende de hover) y se detiene por completo con prefers-reduced-motion.
 */
const SLIDES = [
  { src: asset('assets/carrusel/c1.webp'), alt: 'C1 — ¿Alguna vez te has preguntado por el Barrio Abajo?' },
  { src: asset('assets/carrusel/c2.webp'), alt: 'C2 — Historia del barrio' },
  { src: asset('assets/carrusel/c3.webp'), alt: 'C3 — Tradición bajera' },
  { src: asset('assets/carrusel/c4.webp'), alt: 'C4 — La alegría es nuestra' },
  { src: asset('assets/carrusel/c5.webp'), alt: 'C5 — Expo BAQ 2050' },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event) => setReduced(event.matches);
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, []);

  return reduced;
}

export default function StoryCarousel() {
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const track = [...SLIDES, ...SLIDES];
  const paused = userPaused || hovered || reducedMotion;

  return (
    <section
      className="relative z-[2] bg-cream border-y-4 border-ink overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
    >
      <div className="max-w-[1240px] mx-auto px-6 pt-6 md:pt-7 pb-2 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl md:text-4xl tracking-wide text-red-dark leading-none">HISTORIAS DEL BARRIO</h2>
        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setUserPaused((value) => !value)}
            aria-pressed={userPaused}
            className="shrink-0 rounded-pill border-2 border-ink px-3 py-1.5 text-[12px] font-bold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            {userPaused ? 'Reanudar' : 'Pausar'}
          </button>
        )}
      </div>

      <div className="overflow-hidden pb-4">
        <div
          className="flex w-max gap-3 will-change-transform"
          style={{
            animation: reducedMotion ? 'none' : 'bajero-marquee 38s linear infinite',
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {track.map((s, i) => (
            <div
              key={`${s.src}-${i}`}
              className="shrink-0 w-[68vw] sm:w-[300px] md:w-[340px] aspect-[4/5] rounded-sticker overflow-hidden shadow-soft bg-white hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
            >
              <img
                src={s.src}
                alt={i < SLIDES.length ? s.alt : ''}
                aria-hidden={i >= SLIDES.length}
                loading={i < 5 ? 'eager' : 'lazy'}
                decoding="async"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
