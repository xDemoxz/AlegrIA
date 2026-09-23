import CaladoPattern from '../../components/motifs/CaladoPattern';
import TejaPattern from '../../components/motifs/TejaPattern';
import BaldosaPattern from '../../components/motifs/BaldosaPattern';

const PATTERNS = { calado: CaladoPattern, teja: TejaPattern, baldosa: BaldosaPattern };

/**
 * PosterBackground — thumbnail de la galería de FONDOS (SVG/CSS, sin assets).
 * Mismo modelo de arrastre que PosterSticker: Pointer Events, ghost sigue
 * cursor, soltar dentro del canvas reemplaza el fondo (ver index.jsx).
 * v2: radio + sombra difuminada, hover levanta.
 */
export default function PosterBackground({ bg, onDragStart }) {
  const Pattern = bg.pattern === 'festival' ? null : bg.pattern ? PATTERNS[bg.pattern] : null;
  const isFestival = bg.pattern === 'festival';

  return (
    <button
      type="button"
      onPointerDown={(e) => onDragStart(bg.id, e.clientX, e.clientY)}
      className="relative w-full aspect-[4/3] rounded-sticker shadow-soft overflow-hidden cursor-grab active:cursor-grabbing touch-none transition-all duration-200 ease-pop hover:-translate-y-1 hover:shadow-soft-lg active:translate-y-0 active:shadow-pressed border-2 border-white/20"
      title={bg.label}
      aria-label={`Fondo ${bg.label}`}
    >
      {/* Base */}
      <div className={`absolute inset-0 ${isFestival ? 'bg-festival' : ''}`} style={!isFestival ? { background: bg.bg } : undefined} />
      {/* Patrón vernáculo */}
      {isFestival ? null : Pattern ? <Pattern className="absolute inset-0" opacity={0.22} /> : null}
      {/* Overlay sutil para que el texto sea legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
      <span
        className="absolute bottom-0 left-0 right-0 text-[10px] md:text-[11px] font-bold leading-tight px-1 py-1 text-center"
        style={{ background: 'rgba(18,18,18,0.78)', color: '#FFF' }}
      >
        {bg.label}
      </span>
    </button>
  );
}
