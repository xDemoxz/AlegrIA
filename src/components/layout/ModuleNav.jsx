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
 *
 * v2: se retira el contorno negro grueso del contenedor (línea sutil al
 * 10% en su lugar) y el estado activo pasa a teal — rojo queda reservado
 * para lo festivo / de máxima jerarquía, teal para lo interactivo.
 */
export default function ModuleNav({ active, onSelect }) {
  return (
    <nav className="relative z-[2] flex flex-wrap gap-3 justify-center bg-ink px-5 py-3.5 border-b border-white/10">
      {ITEMS.map((item) => {
        const isActive = item.section === active;
        return (
          <button
            key={item.section}
            type="button"
            onClick={() => onSelect(item.section)}
            className="font-display text-base tracking-wide px-5 pt-2 pb-1.5 rounded-pill border-2 transition-colors"
            style={{
              background: isActive ? '#1E8C86' : 'transparent',
              color: isActive ? '#fff' : '#FDF6E3',
              borderColor: isActive ? '#3CBAB3' : 'rgba(253,246,227,0.35)',
            }}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
