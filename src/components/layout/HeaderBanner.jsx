import { SECTION } from '../../store/useAppStore';

const ITEMS = [
  { section: SECTION.MOD1_TIMELINE, label: '1 · INICIO' },
  { section: SECTION.MOD3_POSTER, label: '2 · PÓSTER' },
  { section: SECTION.MOD4_AR, label: '3 · AR' },
];

/** HeaderBanner — cabecera fixed con hide-on-scroll (translateY).
 * Altura fija h-[56px] md:h-[64px] para sync con ModuleNav; sin flex-wrap inestable. */
export default function HeaderBanner({ active, onSelect, badge = '', badgeImage, hidden = false }) {
  const showBadge = Boolean(badge || badgeImage);
  return (
    <header
      className="fixed top-0 inset-x-0 z-50 bg-ink border-b border-white/10 shadow-soft overflow-hidden h-[56px] md:h-[64px] flex items-center transition-transform duration-300 ease-out will-change-transform"
      style={{ transform: hidden ? 'translateY(-100%)' : 'translateY(0)' }}
    >
      <div className="relative flex gap-3 md:gap-4 justify-between items-center w-full max-w-[1240px] mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2 md:gap-3.5 min-w-0">
          <div className="bg-cream text-red-dark font-display text-xl md:text-3xl leading-none tracking-wide px-4 md:px-5 pt-2 pb-1 md:pt-2.5 md:pb-1.5 rounded-[12px] md:rounded-[14px] shadow-soft shrink-0">
            BARRIO ABAJO
          </div>
          <span className="hidden lg:inline font-display text-sm md:text-2xl tracking-[0.18em] text-white whitespace-nowrap">DEL RÍO — TOUR</span>
          <img
            src="/assets/logos/logo-barrio-abajo.png"
            alt="Barrio Abajo"
            className="hidden xl:block h-8 w-auto object-contain ml-1 opacity-90 shrink-0"
            loading="eager"
          />
        </div>
        
        <nav className="flex items-center gap-2 md:gap-3 shrink-0">
          {ITEMS.map((item) => {
            const isActive = item.section === active;
            return (
              <button
                key={item.section}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onSelect(item.section)}
                className={`font-display text-xs md:text-base tracking-wide px-3 md:px-5 pt-1.5 pb-1 md:pt-2 md:pb-1.5 rounded-[10px] md:rounded-[12px] border-2 transition-all duration-200 ease-pop ${
                  isActive ? 'shadow-soft -translate-y-0.5' : 'hover:-translate-y-0.5 hover:shadow-soft'
                }`}
                style={{
                  background: isActive ? '#FDF6E3' : 'transparent', // bg-cream
                  color: isActive ? '#A81212' : '#FDF6E3', // text-red-dark
                  borderColor: isActive ? '#FDF6E3' : 'rgba(253,246,227,0.35)',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
