import { useState, useRef, useEffect } from 'react';
import CaladoPattern from '../../components/motifs/CaladoPattern';
import TejaPattern from '../../components/motifs/TejaPattern';
import BaldosaPattern from '../../components/motifs/BaldosaPattern';

const PATTERNS = { calado: CaladoPattern, teja: TejaPattern, baldosa: BaldosaPattern };

function ColorDot({ color, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${selected ? 'border-white' : 'border-white/40 hover:border-white'}`}
      style={{ backgroundColor: color }}
      aria-label={color}
    />
  );
}

/**
 * PosterSticker — thumbnail de la galería (izquierda). Usa Pointer Events.
 * Si tiene variants, muestra selector de colores debajo del sticker.
 */
export default function PosterSticker({ sticker, onDragStart, selectedVariant }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef(null);

  useEffect(() => {
    if (showColorPicker && colorPickerRef.current) {
      colorPickerRef.current.focus();
    }
  }, [showColorPicker]);

  const hasVariants = sticker.variants?.length > 0;
  const effectiveImage = hasVariants
    ? sticker.variants[selectedVariant ?? 0]?.image ?? sticker.image
    : sticker.image;

  const Pattern = sticker.pattern ? PATTERNS[sticker.pattern] : null;

  const handleClickOutside = (e) => {
    if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
      setShowColorPicker(false);
    }
  };

  useEffect(() => {
    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorPicker]);

  return (
    <div>
      <button
        type="button"
        onPointerDown={(e) => onDragStart(sticker.id, e.clientX, e.clientY)}
        className="relative w-full aspect-[3/4] rounded-sticker shadow-soft overflow-hidden cursor-grab active:cursor-grabbing touch-none transition-all duration-200 ease-pop hover:-translate-y-1 hover:rotate-1 hover:shadow-soft-lg active:translate-y-0 active:rotate-0 active:shadow-pressed bg-white"
        title={hasVariants ? `${sticker.label} (${sticker.variants.length} colores)` : sticker.label}
        aria-label={hasVariants ? `Stampella ${sticker.label}, colores disponibles` : `Stampella ${sticker.label}`}
        onClick={() => hasVariants && setShowColorPicker((s) => !s)}
      >
        {effectiveImage ? (
          <img
            src={effectiveImage}
            alt={sticker.label}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-contain p-2.5 pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: sticker.bg || '#1DB3E7' }}>
            <span className="text-[10px] font-bold text-white text-center px-1">{sticker.label}</span>
          </div>
        )}
        {sticker.pattern && !effectiveImage && <Pattern className="absolute inset-0" opacity={0.3} />}
        <span
          className="absolute bottom-0 left-0 right-0 text-[11px] font-bold leading-tight px-1.5 py-1 text-center backdrop-blur-sm"
          style={{
            background: 'rgba(18,18,18,0.78)',
            color: '#FFFFFF',
          }}
        >
          {sticker.label}
          {hasVariants && selectedVariant !== undefined && ` • ${sticker.variants[selectedVariant]?.name ?? ''}`}
        </span>
      </button>

      {hasVariants && (
        <div ref={colorPickerRef} className="mt-2 flex gap-1.5 justify-center">
          {sticker.variants.map((v, i) => (
            <ColorDot
              key={i}
              color={v.name === 'Amarillo' ? '#F2B807' : v.name === 'Verde' ? '#1E8C86' : v.name === 'Azul' ? '#1DB3E7' : v.name === 'Rojo' ? '#E02828' : v.name === 'Fucsia' ? '#D946EF' : v.name === 'Carmesi' ? '#991B1B' : v.name === 'Negro' ? '#121212' : v.name === 'Dorado' ? '#FCD34D' : v.name === 'Gris claro' ? '#E5E7EB' : v.name === 'Gris oscuro' ? '#374151' : '#F2B807'}
              selected={selectedVariant === i}
              onClick={(e) => {
                e.stopPropagation();
                onDragStart(sticker.id, e.clientX, e.clientY, i);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}