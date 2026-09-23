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
  { title, text, activeStickerId, activeBackgroundId, onSave, saving },
  canvasRef
) {
  const activeBg = activeBackgroundId ? BACKGROUNDS.find((b) => b.id === activeBackgroundId) : null;
  const activeSticker = !activeBg && activeStickerId ? STICKERS.find((s) => s.id === activeStickerId) : null;
  const bgHex = activeBg?.bg ?? activeSticker?.bg ?? '#1DB3E7';
  const bgPatternKey = activeBg?.pattern ?? activeSticker?.pattern ?? null;
  const ActivePattern = bgPatternKey && bgPatternKey !== 'festival' ? PATTERNS[bgPatternKey] : null;
  const isFestival = bgPatternKey === 'festival';
  const bgKey = activeBg ? activeBg.id : activeSticker ? activeSticker.id : 'default';
  const hasImage = !!activeSticker?.image;
  const hasBg = !!activeBg;

  return (
    <div className="h-full flex items-center justify-center bg-red-dark p-8">
      <div
        ref={canvasRef}
        className="relative w-full max-w-[420px] aspect-[9/16] rounded-sticker shadow-soft-lg overflow-hidden select-none"
        style={{ background: 'linear-gradient(180deg, #121212 0%, #1a1a1a 55%, #121212 100%)' }}
      >
        {hasBg ? (
          <>
            {isFestival ? (
              <div key={`bg-${bgKey}`} className="absolute inset-0 bg-festival pointer-events-none" style={{ animation: 'bg-fade-in 0.5s ease-out' }} />
            ) : (
              <div key={`bg-${bgKey}`} className="absolute inset-0 pointer-events-none" style={{ background: bgHex, animation: 'bg-fade-in 0.5s ease-out' }} />
            )}
            {ActivePattern ? (
              <ActivePattern key={`pattern-${bgKey}`} className="absolute inset-0 pointer-events-none" opacity={isFestival ? 0 : 0.22} />
            ) : !isFestival ? (
              <div
                key={`pattern-${bgKey}`}
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#F2B807 1.5px, transparent 1.5px)',
                  backgroundSize: '16px 24px',
                  animation: 'bg-fade-in 0.5s ease-out',
                }}
              />
            ) : null}
          </>
        ) : hasImage ? (
          <>
            <div
              key={`image-${bgKey}`}
              className="absolute inset-0 pointer-events-none bg-ink"
              style={{
                backgroundImage: `url(${activeSticker.image})`,
                backgroundSize: activeSticker.id === 'st-mariposas' ? 'cover' : 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                animation: 'bg-fade-in 0.5s ease-out',
              }}
            />
            <div className="absolute inset-0 bg-ink/55 pointer-events-none" />
          </>
        ) : (
          <>
            <div
              key={`tint-${bgKey}`}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 78%, ${bgHex}59, transparent 45%)`,
                animation: 'bg-fade-in 0.5s ease-out',
              }}
            />
            {ActivePattern ? (
              <ActivePattern key={`pattern-${bgKey}`} className="absolute inset-0 pointer-events-none" opacity={0.22} />
            ) : (
              <div
                key={`pattern-${bgKey}`}
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#F2B807 1px, transparent 1px)',
                  backgroundSize: '14px 22px',
                  maskImage: 'linear-gradient(90deg, black 0 18%, transparent 18% 100%)',
                  WebkitMaskImage: 'linear-gradient(90deg, black 0 18%, transparent 18% 100%)',
                  animation: 'bg-fade-in 0.5s ease-out',
                }}
              />
            )}
          </>
        )}

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

        {/* Foco / plaza inferior — tinte de la estampita activa */}
        <div
          key={`plaza-${bgKey}`}
          className="absolute left-1/2 bottom-24 -translate-x-1/2 w-[85%] h-20 rounded-[50%] pointer-events-none"
          style={{ background: `${bgHex}47`, animation: 'bg-fade-in 0.5s ease-out' }}
        />

        {!activeSticker && !activeBg && (
          <p className="absolute inset-x-6 bottom-28 text-center text-[13px] font-semibold text-cream/70">
            Arrastra una estampita o un fondo aquí
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
