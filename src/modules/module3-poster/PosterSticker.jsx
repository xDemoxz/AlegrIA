import CaladoPattern from '../../components/motifs/CaladoPattern';
import TejaPattern from '../../components/motifs/TejaPattern';
import BaldosaPattern from '../../components/motifs/BaldosaPattern';

const PATTERNS = { calado: CaladoPattern, teja: TejaPattern, baldosa: BaldosaPattern };

/**
 * PosterSticker — thumbnail de la galería (izquierda). Usa Pointer Events
 * (no HTML5 drag nativo): así el mismo código responde a mouse, touch y a
 * los PointerEvents sintéticos que despacha gestureBridge, sin ramas
 * especiales por dispositivo.
 */
export default function PosterSticker({ sticker, onDragStart }) {
  const Pattern = sticker.pattern ? PATTERNS[sticker.pattern] : null;

  return (
    <button
      type="button"
      onPointerDown={(e) => onDragStart(sticker.id, e.clientX, e.clientY)}
      className="relative w-full aspect-[3/4] rounded-badge border-3 border-ink shadow-pop-black overflow-hidden cursor-grab active:cursor-grabbing touch-none"
      style={{ background: sticker.bg }}
      title={sticker.label}
    >
      {Pattern && <Pattern className="absolute inset-0" opacity={0.3} />}
      <span
        className="absolute bottom-0 left-0 right-0 text-[11px] font-bold leading-tight px-1.5 py-1 text-center"
        style={{
          background: 'rgba(18,18,18,0.72)',
          color: sticker.bg === '#FDF6E3' ? '#FDF6E3' : '#FFFFFF',
        }}
      >
        {sticker.label}
      </span>
    </button>
  );
}
