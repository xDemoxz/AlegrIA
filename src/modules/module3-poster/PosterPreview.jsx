import { forwardRef } from 'react';
import { STICKERS } from './data/stickers';
import { BACKGROUNDS } from './data/backgrounds';
import PopButton from '../../components/controls/PopButton';

/** Ancho base de una estampita colocada, en % del ancho del cartel (× scale). */
const STICKER_BASE_WIDTH_PCT = 30;

/**
 * PosterPreview — panel derecho: el cartel en vivo. `canvasRef` se usa para
 * 1) que index.jsx sepa dónde cae lo que sueltas y 2) exportar a PNG con
 * html2canvas.
 *
 * Capas (de abajo hacia arriba): fondo (imagen, intercambiable) → estampitas
 * colocadas (movibles, con tamaño y orden de apilado) → título/subtítulo.
 * Todo control de edición (anillo, −/+/✕, hints, botón guardar) lleva
 * data-html2canvas-ignore para que NO aparezca en el PNG exportado.
 */
const PosterPreview = forwardRef(function PosterPreview(
  {
    title,
    text,
    activeBackgroundId,
    placedStickers = [],
    selectedUid,
    onSelectSticker,
    onPlacedDragStart,
    onResizeSticker,
    onRemoveSticker,
    onSave,
    saving,
  },
  canvasRef
) {
  const activeBg = activeBackgroundId ? BACKGROUNDS.find((b) => b.id === activeBackgroundId) : null;
  const isDarkText = activeBg?.tone === 'dark';

  return (
    <div className="relative h-full flex items-center justify-center bg-red-dark p-8 overflow-hidden">
      <div className="absolute inset-0 bg-baldosa opacity-[0.2] pointer-events-none" />
      <div
        ref={canvasRef}
        className="relative w-full max-w-[420px] aspect-[9/16] rounded-sticker shadow-soft-lg overflow-hidden select-none"
        style={{ background: 'linear-gradient(180deg, #121212 0%, #1a1a1a 55%, #121212 100%)' }}
        onPointerDown={(e) => {
          if (!e.target.closest('[data-placed-sticker]')) onSelectSticker(null);
        }}
      >
        {/* Capa 1 — Fondo */}
        {activeBg ? (
          <img
            key={activeBg.id}
            src={activeBg.image}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            style={{ objectPosition: activeBg.position, animation: 'bg-fade-in 0.5s ease-out' }}
          />
        ) : (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 50% 78%, #1DB3E759, transparent 45%)' }}
          />
        )}

        {/* Capa 2 — Estampitas colocadas (la última queda arriba) */}
        {placedStickers.map((p) => {
          const sticker = STICKERS.find((s) => s.id === p.stickerId);
          if (!sticker) return null;
          const img = sticker.variants?.[p.variantIndex]?.image ?? sticker.image;
          const selected = p.uid === selectedUid;
          return (
            <div
              key={p.uid}
              data-placed-sticker
              onPointerDown={(e) => {
                e.preventDefault();
                onPlacedDragStart(p.uid, e.clientX, e.clientY);
              }}
              className="absolute cursor-grab active:cursor-grabbing touch-none"
              style={{
                left: `${p.xPct}%`,
                top: `${p.yPct}%`,
                width: `${STICKER_BASE_WIDTH_PCT * p.scale}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {img ? (
                <img
                  src={img}
                  alt={sticker.label}
                  draggable={false}
                  className="block w-full h-auto object-contain pointer-events-none drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]"
                />
              ) : (
                <div className="aspect-square w-full rounded-sticker" style={{ background: sticker.bg }} />
              )}

              {selected && (
                <>
                  <span
                    data-html2canvas-ignore
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-1 rounded-lg ring-2 ring-white/80"
                  />
                  <div
                    data-html2canvas-ignore
                    className="absolute -top-9 left-1/2 flex -translate-x-1/2 gap-1"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <ControlButton label="Reducir estampita" onClick={() => onResizeSticker(p.uid, -0.15)}>
                      −
                    </ControlButton>
                    <ControlButton label="Agrandar estampita" onClick={() => onResizeSticker(p.uid, 0.15)}>
                      +
                    </ControlButton>
                    <ControlButton label="Quitar estampita" danger onClick={() => onRemoveSticker(p.uid)}>
                      ✕
                    </ControlButton>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Título + subtítulo */}
        <div className="pointer-events-none relative z-10 text-center px-6 pt-10">
          <h2
            className={`font-display text-4xl leading-none tracking-wide uppercase break-words ${
              isDarkText ? 'text-ink' : 'text-white'
            }`}
            style={{ textShadow: isDarkText ? '0 1px 0 rgba(255,255,255,0.5)' : '0 2px 10px rgba(0,0,0,0.55)' }}
          >
            {title || 'TU NOMBRE'}
          </h2>
          {text && (
            <p
              className={`font-body text-base font-semibold mt-3 italic break-words ${
                isDarkText ? 'text-ink' : 'text-cream'
              }`}
              style={{ textShadow: isDarkText ? 'none' : '0 1px 8px rgba(0,0,0,0.6)' }}
            >
              {text}
            </p>
          )}
        </div>

        {(!activeBg || placedStickers.length === 0) && (
          <p
            data-html2canvas-ignore
            className="pointer-events-none absolute inset-x-6 bottom-28 text-center text-[13px] font-semibold text-cream/90 drop-shadow"
          >
            {!activeBg
              ? 'Arrastra un fondo al cartel'
              : 'Fondo listo — arrastra estampitas encima'}
          </p>
        )}

        <div data-html2canvas-ignore className="absolute left-0 right-0 bottom-6 flex justify-center">
          <PopButton
            variant="secondary"
            className="!bg-[#FFDC43] !text-ink hover:!bg-[#F2B807]"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? 'GUARDANDO…' : 'Guarda tu cartel'}
          </PopButton>
        </div>
      </div>
    </div>
  );
});

function ControlButton({ children, label, danger = false, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-pill text-sm font-bold shadow-soft transition-transform duration-150 ease-pop hover:scale-110 ${
        danger ? 'bg-red text-white' : 'bg-cream text-ink'
      }`}
    >
      {children}
    </button>
  );
}

export default PosterPreview;
