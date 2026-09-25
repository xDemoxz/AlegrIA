import CaladoPattern from '../../components/motifs/CaladoPattern';
import TejaPattern from '../../components/motifs/TejaPattern';
import BaldosaPattern from '../../components/motifs/BaldosaPattern';

const PATTERNS = { calado: CaladoPattern, teja: TejaPattern, baldosa: BaldosaPattern };

/** Punto de color: área táctil de 24px con el punto visible de 16px. */
function ColorDot({ color, name, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center"
      aria-label={`Color ${name}`}
      aria-pressed={selected}
    >
      <span
        className={`block w-4 h-4 rounded-full border-2 transition-all duration-150 ${
          selected ? 'border-white scale-125 shadow-soft' : 'border-white/40 hover:border-white'
        }`}
        style={{ backgroundColor: color }}
      />
    </button>
  );
}

/**
 * PosterSticker — thumbnail de la galería. Usa Pointer Events: arrastrar lo
 * suelta en el cartel, tocarlo lo agrega cerca del centro (ver index.jsx).
 * Si tiene variants, los puntos de color debajo eligen con qué color se
 * agrega (la miniatura muestra el color elegido).
 */
export default function PosterSticker({ sticker, onDragStart, onSelectVariant, selectedVariant }) {
  const hasVariants = sticker.variants?.length > 0;
  const effectiveImage = hasVariants
    ? sticker.variants[selectedVariant ?? 0]?.image ?? sticker.image
    : sticker.image;

  const Pattern = sticker.pattern ? PATTERNS[sticker.pattern] : null;

  return (
    <div>
      <button
        type="button"
        onPointerDown={(e) => onDragStart(sticker.id, e.clientX, e.clientY, selectedVariant)}
        className="relative w-full aspect-[3/4] rounded-sticker shadow-soft overflow-hidden cursor-grab active:cursor-grabbing touch-pan-x select-none [-webkit-touch-callout:none] transition-all duration-200 ease-pop hover:-translate-y-1 hover:rotate-1 hover:shadow-soft-lg active:translate-y-0 active:rotate-0 active:shadow-pressed bg-white"
        title={hasVariants ? `${sticker.label} (${sticker.variants.length} colores)` : sticker.label}
        aria-label={`Estampita ${sticker.label}`}
      >
        {effectiveImage ? (
          <img
            src={effectiveImage}
            alt=""
            loading="lazy"
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain p-2.5 pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: sticker.bg || '#1DB3E7' }}>
            <span className="text-[10px] font-bold text-white text-center px-1">{sticker.label}</span>
          </div>
        )}
        {Pattern && !effectiveImage && <Pattern className="absolute inset-0" opacity={0.3} />}
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

      {hasVariants && (
        <div className="mt-1 flex justify-center">
          {sticker.variants.map((v, i) => (
            <ColorDot
              key={i}
              color={v.color || '#F2B807'}
              name={v.name}
              selected={(selectedVariant ?? 0) === i}
              onClick={() => onSelectVariant(sticker.id, i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
