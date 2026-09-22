import CaladoPattern from '../../components/motifs/CaladoPattern';
import TejaPattern from '../../components/motifs/TejaPattern';
import BaldosaPattern from '../../components/motifs/BaldosaPattern';

const PATTERNS = { calado: CaladoPattern, teja: TejaPattern, baldosa: BaldosaPattern };

/**
 * PosterSticker — thumbnail de la galería (izquierda). Usa Pointer Events
 * (no HTML5 drag nativo): así el mismo código responde a mouse, touch y a
 * los PointerEvents sintéticos que despacha gestureBridge, sin ramas
 * especiales por dispositivo.
 *
 * v2: sin contorno negro — la tarjeta se separa por radio + sombra
 * difuminada. Hover levanta y gira ligeramente (sticker art real, no un
 * efecto de tarjeta genérica); al tomarla (active/grabbing) baja y la
 * sombra se hunde, como el resto de los controles del sistema.
 */
export default function PosterSticker({ sticker, onDragStart }) {
  const Pattern = sticker.pattern ? PATTERNS[sticker.pattern] : null;

  return (
    <button
      type="button"
      onPointerDown={(e) => onDragStart(sticker.id, e.clientX, e.clientY)}
      className="relative w-full aspect-[3/4] rounded-sticker shadow-soft overflow-hidden cursor-grab active:cursor-grabbing touch-none transition-all duration-200 ease-pop hover:-translate-y-1 hover:rotate-1 hover:shadow-soft-lg active:translate-y-0 active:rotate-0 active:shadow-pressed bg-white"
      title={sticker.label}
    >
      {sticker.image ? (
        <img
          src={sticker.image}
          alt={sticker.label}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain p-2.5 pointer-events-none"
        />
      ) : (
        <>
          <div className="absolute inset-0" style={{ background: sticker.bg }} />
          {Pattern && <Pattern className="absolute inset-0" opacity={0.3} />}
        </>
      )}
      <span
        className="absolute bottom-0 left-0 right-0 text-[11px] font-bold leading-tight px-1.5 py-1 text-center backdrop-blur-sm"
        style={{
          background: 'rgba(18,18,18,0.78)',
          color: '#FFFFFF',
        }}
      >
        {sticker.label}
      </span>
    </button>
  );
}
