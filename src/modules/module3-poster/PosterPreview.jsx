import { forwardRef } from 'react';
import { STICKERS } from './data/stickers';
import { BACKGROUNDS } from './data/backgrounds';
import PopButton from '../../components/controls/PopButton';

/** Ancho base de una estampita colocada, en % del ancho del cartel (× scale). */
const STICKER_BASE_WIDTH_PCT = 30;

/**
 * PosterPreview — el cartel en vivo. `canvasRef` se usa para 1) que
 * index.jsx sepa dónde cae lo que sueltas y 2) exportar a PNG con
 * html2canvas.
 *
 * Capas (de abajo hacia arriba): fondo (imagen, intercambiable) → estampitas
 * colocadas (movibles, con tamaño y orden de apilado) → título/subtítulo.
 * Todo control de edición (anillo, −/+/✕, hints) lleva
 * data-html2canvas-ignore para que NO aparezca en el PNG exportado.
 *
 * Móvil: panel sticky arriba, el cartel limitado por ALTO (28svh de ancho ≈
 * 50svh de alto) para que quede espacio al formulario. Se suelta el sticky
 * mientras se escribe, para que el teclado no tape el input.
 * Los textos usan unidades cqw (relativas al ancho del cartel): el cartel se
 * ve igual en cualquier pantalla y el PNG exportado no depende del equipo.
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
    <div
      className="relative order-first z-20 flex flex-col items-center justify-center gap-3 bg-red-dark px-3 pt-3 pb-3 overflow-hidden shadow-soft max-md:sticky max-md:top-0 max-md:group-has-[input:focus]/poster:static max-md:group-has-[textarea:focus]/poster:static md:order-none md:h-full md:gap-5 md:p-8 md:shadow-none"
      data-testid="poster-panel"
    >
      <div className="absolute inset-0 bg-baldosa opacity-[0.2] pointer-events-none" />
      <div
        ref={canvasRef}
        data-poster-canvas
        data-testid="poster-canvas"
        className="@container relative w-[min(100%,28svh)] md:w-full md:max-w-[420px] aspect-[9/16] rounded-sticker shadow-soft-lg overflow-hidden select-none"
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
            data-testid="poster-bg"
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
          // Controles dentro del cartel (tiene overflow-hidden): abajo si la
          // estampita está muy arriba, y pegados al borde si está en un lado.
          const controlsY = p.yPct < 22 ? 'top-full mt-2' : 'bottom-full mb-2';
          const controlsX =
            p.xPct < 25 ? 'left-0' : p.xPct > 75 ? 'right-0' : 'left-1/2 -translate-x-1/2';
          return (
            <div
              key={p.uid}
              data-placed-sticker
              data-testid="placed-sticker"
              data-sticker-id={p.stickerId}
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
                    className={`absolute z-20 flex gap-1 ${controlsY} ${controlsX}`}
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

        {/* Título + subtítulo (tamaños en cqw ≈ text-4xl / text-base a 420px) */}
        <div className="pointer-events-none relative z-10 text-center px-[6cqw] pt-[9.5cqw]">
          <h2
            className={`font-display text-[9cqw] leading-none tracking-wide uppercase break-words m-0 ${
              isDarkText ? 'text-ink' : 'text-white'
            }`}
            style={{ textShadow: isDarkText ? '0 1px 0 rgba(255,255,255,0.5)' : '0 2px 10px rgba(0,0,0,0.55)' }}
          >
            {title || 'TU NOMBRE'}
          </h2>
          {text && (
            <p
              className={`font-body text-[3.9cqw] font-semibold mt-[3cqw] mb-0 italic break-words ${
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
            className="pointer-events-none absolute inset-x-[6cqw] bottom-[8cqw] m-0 text-center text-[max(11px,3.2cqw)] font-semibold text-cream/90 drop-shadow"
          >
            {!activeBg ? 'Toca o arrastra un fondo al cartel' : 'Fondo listo — ahora pon estampitas'}
          </p>
        )}
      </div>

      <PopButton
        variant="secondary"
        className="relative !bg-[#FFDC43] !text-ink hover:!bg-[#F2B807] max-md:!text-xl max-md:!px-6 max-md:!pt-3 max-md:!pb-2"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? 'GUARDANDO…' : 'Guarda tu cartel'}
      </PopButton>
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
      className={`flex h-9 w-9 md:h-7 md:w-7 items-center justify-center rounded-pill text-base md:text-sm font-bold shadow-soft transition-transform duration-150 ease-pop hover:scale-110 ${
        danger ? 'bg-red text-white' : 'bg-cream text-ink'
      }`}
    >
      {children}
    </button>
  );
}

export default PosterPreview;
