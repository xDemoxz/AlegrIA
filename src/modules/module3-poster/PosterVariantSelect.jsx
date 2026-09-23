import { useState, useRef, useEffect } from 'react';
import { usePosterState } from './usePosterState';
import { STICKERS } from './data/stickers';

export default function PosterVariantSelect({ sticker, onSelect, variant, onClose }) {
  if (!sticker.variants?.length) return null;

  return (
    <div
      className="absolute top-2 right-2 z-[10] bg-ink/90 backdrop-blur-sm rounded-pill px-2 py-1 shadow-soft"
      aria-label={`Variantes de ${sticker.label}`}
    >
      <select
        value={variant ?? ''}
        onChange={(e) => {
          const idx = sticker.variants.findIndex((_, i) => i === e.target.value);
          onSelect(idx);
          onClose?.();
        }}
        className="text-[11px] font-display appearance-none bg-transparent text-cream border-none rounded-pill focus:outline-none cursor-pointer"
      >
        <option value="" disabled>Color</option>
        {sticker.variants.map((v, i) => (
          <option key={i} value={i} style={{ background: v.name === 'Amarillo' ? '#F2B807' : undefined }}>
            {v.name}
          </option>
        ))}
      </select>
    </div>
  );
}