import { SECTION } from '../../store/useAppStore';

const ITEMS = [
  { section: SECTION.MOD1_TIMELINE, label: '1 · LÍNEA' },
  { section: SECTION.MOD2_FUTURE, label: '2 · FUTURO' },
  { section: SECTION.MOD3_POSTER, label: '3 · PÓSTER' },
  { section: SECTION.MOD4_AR, label: '4 · AR' },
];

/**
 * ModuleNav — navegación directa entre los 4 módulos, para desarrollo y
 * pruebas (mientras el flujo real de scroll/CTA entre módulos no está
 * terminado). Quitar o esconder detrás de un flag cuando el recorrido
 * completo esté implementado.
 */
export default function ModuleNav({ active, onSelect }) {
  return (
    <nav className="relative z-[2] flex flex-wrap gap-2 justify-center bg-ink px-4 py-2.5 border-b-4 border-ink">
      {ITEMS.map((item) => {
        const isActive = item.section === active;
        return (
          <button
            key={item.section}
            type="button"
            onClick={() => onSelect(item.section)}
            className="font-display text-sm tracking-wide px-3.5 pt-1.5 pb-1 rounded-pill border-2 transition-colors"
            style={{
              background: isActive ? '#E02828' : 'transparent',
              color: isActive ? '#fff' : '#FDF6E3',
              borderColor: isActive ? '#fff' : '#FDF6E3',
            }}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
