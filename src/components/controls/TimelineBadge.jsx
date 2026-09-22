/**
 * TimelineBadge — navegación de cronología (Módulo 1). Sebastián: este es el
 * botón individual de año; TimelineRail (en components/data) lo usa en un
 * <sc-for> equivalente a un .map().
 *
 * v2: sin contorno blanco/negro — el activo se distingue por color, escala
 * y una sombra más profunda (no por un anillo duro). Inactivo pasa de azul
 * a teal-dark (#0F5F5A), coherente con el resto del sistema.
 */
export default function TimelineBadge({ year, active = false, accent = '#E02828', onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer font-display text-2xl tracking-wide rounded-pill text-white transition-all duration-200 ease-pop px-7 pt-3 pb-2"
      style={{
        background: active ? accent : '#0F5F5A',
        boxShadow: active ? '0 14px 32px -8px rgb(18 18 18 / 0.34)' : '0 8px 20px -6px rgb(18 18 18 / 0.25)',
        transform: active ? 'translateY(-4px) scale(1.05)' : 'none',
      }}
    >
      {year}
    </button>
  );
}
