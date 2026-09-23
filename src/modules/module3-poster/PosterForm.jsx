import { STICKERS } from './data/stickers';
import { BACKGROUNDS } from './data/backgrounds';
import PosterSticker from './PosterSticker';
import PosterBackground from './PosterBackground';
import PopButton from '../../components/controls/PopButton';

/** Badge circular "?" con tooltip nativo — misma idea del mockup.
 * v2: sin contorno negro, sombra difuminada + pequeño rebote en hover. */
function HelpBadge({ hint }) {
  return (
    <span
      title={hint}
      className="shrink-0 w-6 h-6 rounded-pill bg-orange text-white shadow-soft flex items-center justify-center text-xs font-bold cursor-help transition-transform duration-150 ease-pop hover:scale-110"
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
 *
 * v2: inputs sin borde de color — se delimitan con sombra interior (como
 * SearchInput) y anillo teal al enfocar.
 */
export default function PosterForm({
  title,
  onTitleChange,
  text,
  onTextChange,
  onStickerDragStart,
  onBgDragStart,
  onBack,
  onReset,
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
            className="flex-1 font-body text-base px-4 py-2.5 bg-white rounded-xl outline-none text-ink shadow-[inset_0_2px_4px_rgba(18,18,18,0.12)] focus:shadow-[inset_0_2px_4px_rgba(18,18,18,0.12),0_0_0_3px_#3CBAB3] transition-shadow duration-150"
          />
          <HelpBadge hint="Aparecerá como título grande en tu cartel." />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-lg tracking-wide">2. Arrastra una estampita para definir el fondo</span>
          <HelpBadge hint="Suéltala sobre el cartel a la derecha y se convierte en su fondo — puedes cambiarla las veces que quieras, la última que sueltes manda. Con gestos: pellizca para tomar, mueve la mano y suelta." />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {STICKERS.map((s) => (
            <PosterSticker key={s.id} sticker={s} onDragStart={onStickerDragStart} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-lg tracking-wide">3. Elige un fondo (SVG)</span>
          <HelpBadge hint="Fondos 100% SVG/CSS, sin imágenes externas. Arrastra uno al cartel igual que las estampitas — reemplaza el fondo actual." />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {BACKGROUNDS.map((bg) => (
            <PosterBackground key={bg.id} bg={bg} onDragStart={onBgDragStart} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <label className="font-display text-lg tracking-wide" htmlFor="poster-text">
            4. Escribe el texto que llevará tu cartel
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
            className="flex-1 font-body text-base px-4 py-2.5 bg-white rounded-xl outline-none resize-none text-ink shadow-[inset_0_2px_4px_rgba(18,18,18,0.12)] focus:shadow-[inset_0_2px_4px_rgba(18,18,18,0.12),0_0_0_3px_#3CBAB3] transition-shadow duration-150"
          />
          <HelpBadge hint="Máximo 80 caracteres. Se mostrará debajo del título." />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-1">
        <PopButton variant="primary" className="!text-lg self-start" onClick={onBack}>
          ‹ ATRÁS
        </PopButton>
        <PopButton variant="ghost" className="!text-base self-start" onClick={onReset}>
          ↺ Empezar de nuevo
        </PopButton>
      </div>
    </div>
  );
}
