/**
 * TimelineBadge — navegación de cronología (Módulo 1). Sebastián: este es el
 * botón individual de año; TimelineRail (en components/data) lo usa en un
 * <sc-for> equivalente a un .map().
 */
export default function TimelineBadge({ year, active = false, accent = '#E02828', onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer font-display text-2xl tracking-wide rounded-pill border-4 border-white outline outline-3 outline-ink text-white transition-all duration-150 ease-pop px-6 pt-3 pb-2"
      style={{
        background: active ? accent : '#1DB3E7',
        boxShadow: active ? `0 0 0 4px #FFFFFF, 6px 6px 0 0 ${accent}` : '5px 5px 0 0 #121212',
        transform: active ? 'translateY(-4px) scale(1.05)' : 'none',
      }}
    >
      {year}
    </button>
  );
}
