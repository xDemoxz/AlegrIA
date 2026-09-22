/** HeaderBanner — cabecera sticky con patrón sutil inspirado en el diseño IA,
 * pero adaptado a tokens v2 (sin bordes duros, sombra difuminada). */
export default function HeaderBanner({ badge = 'AlegrIA 2050', badgeImage }) {
  return (
    <header className="sticky top-0 z-50 bg-festival border-b border-white/10 shadow-soft overflow-hidden">
      <div className="absolute inset-0 bg-baldosa opacity-[0.08] pointer-events-none" />
      <div className="relative flex flex-wrap gap-4 justify-between items-center px-6 md:px-8 py-4">
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="bg-cream text-red-dark font-display text-2xl md:text-3xl leading-none tracking-wide px-5 pt-2.5 pb-1.5 rounded-[14px] shadow-soft">
            BARRIO ABAJO
          </div>
          <span className="font-display text-lg md:text-2xl tracking-[0.18em] text-white">DEL RÍO — TOUR</span>
          <img
            src="/assets/logos/logo-barrio-abajo.png"
            alt="Barrio Abajo"
            className="hidden xl:block h-9 w-auto object-contain ml-1 opacity-90"
            loading="eager"
          />
        </div>
        <div className="flex items-center gap-3">
          {badgeImage ? (
            <img src={badgeImage} alt={badge} className="h-9 w-auto object-contain rounded-pill shadow-soft bg-white/10 px-3 py-1" />
          ) : null}
          <div className="flex items-center gap-2 bg-verde text-white font-display text-lg md:text-2xl tracking-wide px-5 pt-2 pb-1.5 rounded-pill shadow-soft">
            <span>{badge}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow border border-white/40 animate-pulse hidden sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
}
