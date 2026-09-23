/** Patrones sutiles para fondos (sin diamantes calado/teja/baldosa) */
const PATTERNS = {
  dots: ({ opacity = 0.12 }) => (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: opacity > 0.15
          ? 'radial-gradient(#CBD5E1 1px, transparent 1px)'
          : 'radial-gradient(#94A3B8 1px, transparent 1px)',
        backgroundSize: '12px 12px',
      }}
    />
  ),
  lines: ({ opacity = 0.1 }) => (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(45deg, rgba(255,255,255,${opacity}) 1px, transparent 1px),
          linear-gradient(-45deg, rgba(255,255,255,${opacity}) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    />
  ),
};

/**
 * PosterBackground — thumbnail de la galería de FONDOS SVG/CSS sin amarillo ni patrón calado.
 * Color base + patrón sutil (dots o lines) al 10-15% para textura sin competir con estampita.
 * Drag & drop con Pointer Events, igual que PosterSticker.
 */
export default function PosterBackground({ bg, onDragStart }) {
  const isFestival = bg.id === 'bg-festival';
  const Pattern = PATTERNS[bg.pattern];

  return (
    <button
      type="button"
      onPointerDown={(e) => onDragStart(bg.id, e.clientX, e.clientY)}
      className="relative w-full aspect-[4/3] rounded-sticker shadow-soft overflow-hidden cursor-grab active:cursor-grabbing touch-none transition-all duration-200 ease-pop hover:-translate-y-1 hover:shadow-soft-lg active:translate-y-0 active:shadow-pressed border-2 border-white/20"
      title={bg.label}
      aria-label={`Fondo ${bg.label}`}
    >
      {/* Fondo base */}
      {isFestival ? (
        <div className="absolute inset-0 bg-festival" />
      ) : (
        <div className="absolute inset-0" style={{ background: bg.bg }} />
      )}
      {/* Patrón sutil */}
      {Pattern && <Pattern opacity={bg.pattern === 'dots' ? 0.12 : 0.1} />}
      {/* Overlay oscuro para que el label sea legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      <span
        className="absolute bottom-0 left-0 right-0 text-[10px] md:text-[11px] font-bold leading-tight px-1.5 py-1 text-center"
        style={{ background: 'rgba(18,18,18,0.78)', color: '#FFF' }}
      >
        {bg.label}
      </span>
    </button>
  );
}