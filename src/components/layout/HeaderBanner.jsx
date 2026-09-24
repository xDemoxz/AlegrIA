/** HeaderBanner — cabecera fija de toda la experiencia (idéntica en los 4 módulos). */
export default function HeaderBanner({ badge = 'AlegrIA 2050' }) {
  return (
    <header className="relative z-[2] bg-yellow border-b-4 border-ink px-8 py-4.5 flex flex-wrap gap-4 justify-between items-center">
      <div className="flex items-center gap-3.5 flex-wrap">
        <div className="bg-red text-white font-display text-3xl leading-none tracking-wide px-4 pt-2.5 pb-1.5 rounded-2xl border-3 border-white shadow-pop-black">
          BARRIO ABAJO
        </div>
        <span className="font-display text-2xl tracking-[0.18em] text-ink">DEL RÍO — TOUR</span>
      </div>
      <div className="bg-blue text-white font-display text-2xl tracking-wide px-5.5 pt-2 pb-1 rounded-pill border-3 border-white shadow-pop-black">
        {badge}
      </div>
    </header>
  );
}
