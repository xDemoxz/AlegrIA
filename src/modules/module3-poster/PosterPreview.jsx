import { forwardRef } from 'react';
import { STICKERS } from './data/stickers';
import PopButton from '../../components/controls/PopButton';

/**
 * PosterPreview — panel derecho: el cartel en vivo. `canvasRef` se usa para
 * 1) calcular dónde cae una estampita soltada (índice.jsx) y 2) exportar a
 * PNG con html2canvas.
 */
const PosterPreview = forwardRef(function PosterPreview(
  { title, text, canvasStickers, onRemoveSticker, onSave, saving },
  canvasRef
) {
  return (
    <div className="h-full flex items-center justify-center bg-red-dark p-8">
      <div
        ref={canvasRef}
        className="relative w-full max-w-[420px] aspect-[9/16] rounded-2xl border-4 border-ink shadow-pop-xl overflow-hidden select-none"
        style={{
          background:
            'radial-gradient(circle at 50% 78%, rgba(29,179,231,0.35), transparent 45%), linear-gradient(180deg, #121212 0%, #1a1a1a 55%, #121212 100%)',
        }}
      >
        {/* "ciudad" decorativa — filas de puntos, sin depender de un asset externo */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#F2B807 1px, transparent 1px)',
            backgroundSize: '14px 22px',
            maskImage: 'linear-gradient(90deg, black 0 18%, transparent 18% 100%)',
            WebkitMaskImage: 'linear-gradient(90deg, black 0 18%, transparent 18% 100%)',
          }}
        />

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

        {/* Foco / plaza inferior, referencia del mockup */}
        <div
          className="absolute left-1/2 bottom-24 -translate-x-1/2 w-[85%] h-20 rounded-[50%] pointer-events-none"
          style={{ background: 'rgba(29,179,231,0.28)' }}
        />

        {/* Estampitas colocadas */}
        {canvasStickers.map((cs) => {
          const sticker = STICKERS.find((s) => s.id === cs.stickerId);
          if (!sticker) return null;
          return (
            <button
              key={cs.uid}
              type="button"
              onClick={() => onRemoveSticker(cs.uid)}
              title="Quitar estampita"
              className="absolute w-16 h-20 rounded-badge border-3 border-white shadow-pop-black cursor-pointer transition-transform hover:scale-110"
              style={{
                left: `${cs.xPct}%`,
                top: `${cs.yPct}%`,
                background: sticker.bg,
                transform: `translate(-50%, -50%) rotate(${cs.rotation}deg)`,
              }}
            />
          );
        })}

        {canvasStickers.length === 0 && (
          <p className="absolute inset-x-6 bottom-28 text-center text-[13px] font-semibold text-cream/70">
            Arrastra estampitas aquí
          </p>
        )}

        <div className="absolute left-0 right-0 bottom-6 flex justify-center">
          <PopButton
            variant="secondary"
            className="!bg-[#FFDC43] !text-ink !border-ink hover:!bg-[#F2B807]"
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
