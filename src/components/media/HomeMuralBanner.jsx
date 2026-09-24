/**
 * HomeMuralBanner — banner editorial post-carrusel inspirado en el diseño IA
 * "CALLES DE SOL, CUMBIA Y MEMORIA", adaptado a tokens v2 y contenido real.
 * No usa imagen externa: usa patrones vernáculos y paleta festival.
 */
export default function HomeMuralBanner() {
  return (
    <section className="relative z-[2] bg-festival border-y-4 border-ink overflow-hidden">
      <div className="absolute inset-0 bg-baldosa opacity-[0.07] pointer-events-none" />
      <div className="relative max-w-[1240px] mx-auto px-6 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 space-y-3">
          <h2 className="font-display text-3xl md:text-5xl leading-none tracking-wide text-white">
            CALLES DE SOL, CUMBIA Y MEMORIA
          </h2>
          <p className="font-body text-sm md:text-base text-white/90 leading-relaxed">
            Del bahareque original al circuito de arte digital. Barrio Abajo protege sus fachadas coral, calados republicanos y la alegría de la esquina.
          </p>
        </div>
        <div className="lg:col-span-7">
          <div className="rounded-sticker overflow-hidden shadow-soft-lg bg-cream p-3">
            <div className="rounded-[14px] overflow-hidden bg-ink aspect-[16/9] relative flex items-center justify-center">
              <div className="absolute inset-0 bg-calado opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-br from-yellow/20 via-transparent to-red/20" />
              <div className="relative text-center px-6 py-8">
                <div className="font-display text-2xl md:text-3xl text-yellow-light tracking-wide">BARRIO ABAJO · 1857—2050</div>
                <div className="font-mono text-xs tracking-[0.18em] text-white/70 mt-2">10.9947° N, 74.7816° W · RÍO MAGDALENA</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
