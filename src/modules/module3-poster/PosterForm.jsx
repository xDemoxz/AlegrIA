import { STICKERS } from './data/stickers';
import PosterSticker from './PosterSticker';
import PopButton from '../../components/controls/PopButton';

/** Badge circular "?" con tooltip nativo — misma idea del mockup. */
function HelpBadge({ hint }) {
  return (
    <span
      title={hint}
      className="shrink-0 w-6 h-6 rounded-pill bg-orange text-white border-2 border-ink flex items-center justify-center text-xs font-bold cursor-help"
    >
      ?
    </span>
  );
}

/**
 * PosterForm — panel izquierdo: nombre, galería de estampitas (arrastrables)
 * y texto del cartel. La lógica de arrastre vive en el módulo padre
 * (index.jsx) vía onStickerDragStart, para poder soltar sobre el canvas del
 * panel derecho.
 */
export default function PosterForm({
  title,
  onTitleChange,
  text,
  onTextChange,
  onStickerDragStart,
  onBack,
}) {
  return (
    <div className="bg-cream h-full overflow-y-auto p-8 flex flex-col gap-7">
      <h1 className="font-display text-3xl tracking-wide text-red m-0">CREA TU CARTEL</h1>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <label className="font-display text-lg tracking-wide" htmlFor="poster-title">
            1. Nombre de tu cartel
          </label>
        </div>
        <div className="flex items-center gap-2.5">
          <input
            id="poster-title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Tu nombre o el de alguien especial"
            maxLength={40}
            className="flex-1 font-body text-base px-4 py-2.5 bg-cream border-2 border-red rounded-md outline-none focus:shadow-[3px_3px_0_0_#1DB3E7] text-ink"
          />
          <HelpBadge hint="Aparecerá como título grande en tu cartel." />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-lg tracking-wide">2. Arrastra las estampitas que llevará tu cartel</span>
          <HelpBadge hint="Toma una estampita y suéltala sobre el cartel a la derecha. Con gestos: pellizca para tomar, mueve la mano y suelta para colocar." />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {STICKERS.map((s) => (
            <PosterSticker key={s.id} sticker={s} onDragStart={onStickerDragStart} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <label className="font-display text-lg tracking-wide" htmlFor="poster-text">
            3. Escribe el texto que llevará tu cartel
          </label>
        </div>
        <div className="flex items-center gap-2.5">
          <textarea
            id="poster-text"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Una frase corta para tu cartel"
            maxLength={80}
            rows={2}
            className="flex-1 font-body text-base px-4 py-2.5 bg-cream border-2 border-red rounded-md outline-none resize-none focus:shadow-[3px_3px_0_0_#1DB3E7] text-ink"
          />
          <HelpBadge hint="Máximo 80 caracteres. Se mostrará debajo del título." />
        </div>
      </div>

      <PopButton variant="primary" className="!text-lg self-start mt-1" onClick={onBack}>
        ‹ ATRÁS
      </PopButton>
    </div>
  );
}
