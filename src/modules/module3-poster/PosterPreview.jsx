import { forwardRef } from 'react';
import { STICKERS } from './data/stickers';
import { BACKGROUNDS } from './data/backgrounds';
import PopButton from '../../components/controls/PopButton';
import CaladoPattern from '../../components/motifs/CaladoPattern';
import TejaPattern from '../../components/motifs/TejaPattern';
import BaldosaPattern from '../../components/motifs/BaldosaPattern';

const PATTERNS = { calado: CaladoPattern, teja: TejaPattern, baldosa: BaldosaPattern };

/**
 * PosterPreview — panel derecho: el cartel/mural en vivo. `canvasRef` se
 * usa para 1) que index.jsx sepa si soltaste dentro del canvas y 2)
 * exportar a PNG con html2canvas.
 *
 * v2 + modelo "fondo, no pegatina": la estampita o fondo que sueltas NO
 * queda pegada como ícono — reemplaza el fondo completo del cartel (tinte
 * de color + patrón vernáculo o imagen PNG). Fondo SVG (BACKGROUNDS) tiene
 * prioridad si existe; si no, usa estampita. Sin ninguno se ve tinte azul.
 * Fade-in (bg-fade-in) para transición.
 */
const PosterPreview = forwardRef(function PosterPreview(
  { title, text, activeStickerId, activeBackgroundId, stickerVariants, onSave, saving },
  canvasRef
) {
  const activeBg = activeBackgroundId ? BACKGROUNDS.find((b) => b.id === activeBackgroundId) : null;
  const activeSticker = activeStickerId ? STICKERS.find((s) => s.id === activeStickerId) : null;

  const bgHex = activeBg?.bg ?? (activeSticker?.bg ?? '#1DB3E7');
  const bgPatternKey = activeBg?.pattern ?? null;
  const ActivePattern = bgPatternKey && bgPatternKey !== 'festival' ? PATTERNS[bgPatternKey] : null;
  const isFestival = bgPatternKey === 'festival';
  const bgKey = activeBg ? activeBg.id : 'default';

  // Imagen efectiva de la estampita (teniendo en cuenta variantes)
  const stickerVariantIdx = activeStickerId ? stickerVariants[activeStickerId] : 0;
  const effectiveStickerImg = activeSticker?.variants?.[stickerVariantIdx]?.image ?? activeSticker?.image;
  const hasImage = !!effectiveStickerImg;
  const hasBg = !!activeBg;
  const hasSticker = !!activeSticker;

  return (
    <div className="h-full flex items-center justify-center bg-red-dark p-8">
      <div
        ref={canvasRef}
        className="relative w-full max-w-[420px] aspect-[9/16] rounded-sticker shadow-soft-lg overflow-hidden select-none"
        style={{ background: 'linear-gradient(180deg, #121212 0%, #1a1a1a 55%, #121212 100%)' }}
      >
        {/* Capa 1 — Fondo SVG/CSS semi-transparente (no tapa estampita) */}
        {hasBg ? (
          <div key={`bg-${bgKey}`} className="absolute inset-0 pointer-events-none" style={{ animation: 'bg-fade-in 0.5s ease-out' }}>
            {isFestival ? (
              <div className="absolute inset-0 bg-festival opacity-[0.55]" />
            ) : (
              <div className="absolute inset-0 opacity-[0.48]" style={{ background: bgHex }} />
            )}
            {ActivePattern ? (
              <ActivePattern className="absolute inset-0 pointer-events-none" opacity={0.16} />
            ) : !isFestival ? (
              <div
                className="absolute inset-0 opacity-[0.18] pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#F2B807 1.5px, transparent 1.5px)',
                  backgroundSize: '16px 24px',
                }}
              />
            ) : null}
            {/* velo ink suave para que el fondo no compita */}
            <div className="absolute inset-0 bg-ink/18 pointer-events-none" />
          </div>
        ) : (
          <div
            key="tint-default"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 78%, #1DB3E759, transparent 45%)`,
              animation: 'bg-fade-in 0.5s ease-out',
            }}
          />
        )}

        {/* Capa 2 — Estampita protagonista centrada sobre el fondo */}
        {hasSticker && hasImage ? (
          <div
            key={`sticker-${activeSticker.id}-${stickerVariantIdx ?? 0}`}
            className="absolute inset-0 pointer-events-none flex items-center justify-center p-6"
            style={{ animation: 'bg-fade-in 0.5s ease-out' }}
          >
            <img
              src={effectiveStickerImg}
              alt={activeSticker.label}
              className="max-w-[78%] max-h-[52%] w-auto h-auto object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)]"
              draggable={false}
            />
          </div>
        ) : hasSticker && !hasImage ? (
          <div
            key={`sticker-color-${activeSticker.id}`}
            className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 w-[62%] aspect-square rounded-sticker pointer-events-none flex items-center justify-center shadow-soft-lg"
            style={{ background: activeSticker.bg, animation: 'bg-fade-in 0.5s ease-out' }}
          >
            {activeSticker.pattern && PATTERNS[activeSticker.pattern] ? (
              (() => {
                const P = PATTERNS[activeSticker.pattern];
                return <P className="absolute inset-0 rounded-sticker overflow-hidden" opacity={0.22} />;
              })()
            ) : null}
            <span className="relative font-display text-xl tracking-wide text-white drop-shadow px-3 text-center">{activeSticker.label}</span>
          </div>
        ) : null}

        {/* Halo de luna */}
        <div
          className="absolute top-8 right-10 w-16 h-16 rounded-pill pointer-events-none"
          style={{ background: '#FDF6E3', boxShadow: '0 0 30px 10px rgba(253,246,227,0.5)' }}
        />

        {/* Título + subtítulo */}
        <div className="relative z-10 text-center px-6 pt-10">
          <h2 className="font-display text-4xl leading-none tracking-wide text-white uppercase break-words">
            {title || 'TU NOMBRE'}
          </h2>
          {text && (
            <p className="font-body text-base font-medium text-cream mt-3 italic break-words">{text}</p>
          )}
        </div>

        {/* Foco / plaza inferior — tinte del fondo (si hay) */}
        <div
          key={`plaza-${bgKey}`}
          className="absolute left-1/2 bottom-24 -translate-x-1/2 w-[85%] h-20 rounded-[50%] pointer-events-none"
          style={{ background: `${bgHex}34`, animation: 'bg-fade-in 0.5s ease-out' }}
        />

        {!hasBg && !hasSticker && (
          <p className="absolute inset-x-6 bottom-28 text-center text-[13px] font-semibold text-cream/70">
            Arrastra un fondo y luego una estampita
          </p>
        )}
        {hasBg && !hasSticker && (
          <p className="absolute inset-x-6 bottom-28 text-center text-[13px] font-semibold text-cream/70">
            Fondo listo — ahora arrastra una estampita protagonista
          </p>
        )}

        <div className="absolute left-0 right-0 bottom-6 flex justify-center">
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

export default PosterPreview;
