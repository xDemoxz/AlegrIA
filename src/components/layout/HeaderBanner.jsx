/** HeaderBanner — cabecera fixed con hide-on-scroll (translateY).
 * Altura fija h-[56px] md:h-[64px] para sync con ModuleNav; sin flex-wrap inestable. */
export default function HeaderBanner({ badge = '', badgeImage, hidden = false }) {
  const showBadge = Boolean(badge || badgeImage);
  return (
    <header
      className="fixed top-0 inset-x-0 z-50 bg-festival border-b border-white/10 shadow-soft overflow-hidden h-[56px] md:h-[64px] flex items-center transition-transform duration-300 ease-out will-change-transform"
      style={{ transform: hidden ? 'translateY(-100%)' : 'translateY(0)' }}
    >
      <div className="absolute inset-0 bg-baldosa opacity-[0.08] pointer-events-none" />
      <div className="relative flex gap-3 md:gap-4 justify-between items-center w-full max-w-[1240px] mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2 md:gap-3.5 min-w-0">
          <div className="bg-cream text-red-dark font-display text-xl md:text-3xl leading-none tracking-wide px-4 md:px-5 pt-2 pb-1 md:pt-2.5 md:pb-1.5 rounded-[12px] md:rounded-[14px] shadow-soft shrink-0">
            BARRIO ABAJO
          </div>
          <span className="font-display text-sm md:text-2xl tracking-[0.18em] text-white whitespace-nowrap">DEL RÍO — TOUR</span>
          <img
            src="/assets/logos/logo-barrio-abajo.png"
            alt="Barrio Abajo"
            className="hidden xl:block h-8 w-auto object-contain ml-1 opacity-90 shrink-0"
            loading="eager"
          />
        </div>
        {showBadge ? (
          <div className="flex items-center gap-3 shrink-0">
            {badgeImage ? (
              <img src={badgeImage} alt={badge} className="h-8 w-auto object-contain rounded-pill shadow-soft bg-white/10 px-3 py-1" />
            ) : null}
            <div className="flex items-center gap-2 bg-verde text-white font-display text-base md:text-xl tracking-wide px-4 md:px-5 pt-1.5 pb-1 md:pt-2 md:pb-1.5 rounded-pill shadow-soft">
              {badge ? <span>{badge}</span> : null}
              <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-yellow border border-white/40 animate-pulse hidden sm:block" />
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
