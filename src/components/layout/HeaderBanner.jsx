/** HeaderBanner — cabecera fija de toda la experiencia (idéntica en los 4 módulos).
 * v2: degradado festival (rojo→naranja) en vez de amarillo plano, sombra
 * difuminada en vez de contorno blanco/negro, teal como acento de marca. */
export default function HeaderBanner({ badge = 'AlegrIA 2050' }) {
  return (
    <header className="relative z-[2] bg-festival px-8 py-5 flex flex-wrap gap-4 justify-between items-center shadow-soft">
      <div className="flex items-center gap-3.5 flex-wrap">
        <div className="bg-cream text-red-dark font-display text-3xl leading-none tracking-wide px-5 pt-2.5 pb-1.5 rounded-[14px] shadow-soft">
          BARRIO ABAJO
        </div>
        <span className="font-display text-2xl tracking-[0.18em] text-white">DEL RÍO — TOUR</span>
      </div>
      <div className="bg-verde text-white font-display text-2xl tracking-wide px-6 pt-2 pb-1.5 rounded-pill shadow-soft">
        {badge}
      </div>
    </header>
  );
}
