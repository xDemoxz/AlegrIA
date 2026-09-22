import { forwardRef } from 'react';
import { STICKERS } from './data/stickers';
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
 * v2 + modelo "fondo, no pegatina": la estampita que sueltas NO queda
 * pegada como ícono — reemplaza el fondo completo del cartel (tinte de
 * color + su patrón vernáculo si trae uno). Sin ninguna estampita soltada
 * se ve el tinte azul original. El cambio hace fade-in (bg-fade-in en
 * index.css) para que se note en vez de saltar en seco. Marco sin
 * contorno negro — se delimita con sombra difuminada.
 */
const PosterPreview = forwardRef(function PosterPreview(
  { title, text, activeStickerId, onSave, saving },
  canvasRef
) {
  const activeSticker = activeStickerId ? STICKERS.find((s) => s.id === activeStickerId) : null;
  const bgHex = activeSticker?.bg ?? '#1DB3E7';
  const ActivePattern = activeSticker?.pattern ? PATTERNS[activeSticker.pattern] : null;
  // Fuerza el remount (y por tanto el fade-in) cada vez que cambia la
  // estampita que manda sobre el fondo.
  const bgKey = activeSticker ? activeSticker.id : 'default';

  return (
    <div className="h-full flex items-center justify-center bg-red-dark p-8">
      <div
        ref={canvasRef}
        className="relative w-full max-w-[420px] aspect-[9/16] rounded-sticker shadow-soft-lg overflow-hidden select-none"
        style={{ background: 'linear-gradient(180deg, #121212 0%, #1a1a1a 55%, #121212 100%)' }}
      >
        {/* Tinte de color de la estampita activa */}
        <div
          key={`tint-${bgKey}`}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 78%, ${bgHex}59, transparent 45%)`,
            animation: 'bg-fade-in 0.5s ease-out',
          }}
        />

        {/* Textura: el patrón vernáculo de la estampita activa si trae uno,
            o la "ciudad" de puntos genérica por defecto */}
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

        {!activeSticker && (
          <p className="absolute inset-x-6 bottom-28 text-center text-[13px] font-semibold text-cream/70">
            Arrastra una estampita aquí para definir el fondo
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
