import { SECTION } from '../../store/useAppStore';

const ITEMS = [
  { section: SECTION.MOD1_TIMELINE, label: '1 · INICIO' },
  { section: SECTION.MOD3_POSTER, label: '2 · PÓSTER' },
  { section: SECTION.MOD4_AR, label: '3 · AR' },
];

/**
 * ModuleNav — navegación directa entre las 3 secciones del switcher
 * (Inicio, Póster, AR), para desarrollo y pruebas (mientras el flujo real
 * de scroll/CTA no está terminado). El Módulo 2 "Futuro" ya no tiene botón
 * propio aquí: su teaser vive apilado dentro de "1 · INICIO" (ver
 * src/modules/home) y su experiencia completa corre en la ruta standalone
 * /futuro, fuera de este switcher.
 *
 * v2: sin contorno duro, sticky bajo el header, azul caribe para el estado
 * activo (con leve elevación en hover/activo).
 */
export default function ModuleNav({ active, onSelect }) {
  return (
    <nav className="relative z-[2] flex flex-wrap gap-3 justify-center bg-ink px-5 py-3.5 border-b border-white/10 sticky top-[72px] backdrop-blur-sm">
      {ITEMS.map((item) => {
        const isActive = item.section === active;
        return (
          <button
            key={item.section}
            type="button"
            onClick={() => onSelect(item.section)}
            className={`font-display text-base tracking-wide px-5 pt-2 pb-1.5 rounded-pill border-2 transition-all duration-200 ease-pop ${
              isActive ? 'shadow-soft -translate-y-0.5' : 'hover:-translate-y-0.5 hover:shadow-soft'
            }`}
            style={{
              background: isActive ? '#1DB3E7' : 'transparent',
              color: isActive ? '#121212' : '#FDF6E3',
              borderColor: isActive ? '#FDF6E3' : 'rgba(253,246,227,0.35)',
            }}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
