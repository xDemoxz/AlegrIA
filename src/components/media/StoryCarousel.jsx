import { useState } from 'react';

/**
 * StoryCarousel — banda editorial debajo del hero global.
 * Usa la MISMA animación que MarqueeStrip (bajero-marquee en src/index.css:25)
 * : cinta continua infinita sin botones ni pausa por slide, solo marquee lineal.
 * Duplica el track [...SLIDES, ...SLIDES] para loop perfecto translateX(-50%).
 */
const SLIDES = [
  { src: '/assets/carrusel/c1.png', alt: 'C1 — ¿Alguna vez te has preguntado por el Barrio Abajo?' },
  { src: '/assets/carrusel/c2.png', alt: 'C2 — Historia del barrio' },
  { src: '/assets/carrusel/c3.png', alt: 'C3 — Tradición bajera' },
  { src: '/assets/carrusel/c4.png', alt: 'C4 — La alegría es nuestra' },
  { src: '/assets/carrusel/c5.png', alt: 'C5 — Expo BAQ 2050' },
];

export default function StoryCarousel() {
  const [paused, setPaused] = useState(false);
  const track = [...SLIDES, ...SLIDES];

  return (
    <section
      className="relative z-[2] bg-cream border-y-4 border-ink overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="max-w-[1240px] mx-auto px-6 pt-8 pb-3">
        <h2 className="font-display text-3xl md:text-5xl tracking-wide text-red-dark leading-none">HISTORIAS DEL BARRIO</h2>
      </div>

      {/* Pista marquee — idéntica a MarqueeStrip.jsx:8 pero con cards de imagen */}
      <div className="overflow-hidden pb-6">
        <div
          className="flex w-max gap-4 will-change-transform"
          style={{
            animation: 'bajero-marquee 45s linear infinite',
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {track.map((s, i) => (
            <div
              key={`${s.src}-${i}`}
              className="shrink-0 w-[78vw] sm:w-[380px] md:w-[400px] aspect-[4/5] rounded-sticker overflow-hidden shadow-soft bg-white hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
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
