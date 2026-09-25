import { useState } from 'react';
import { STICKERS } from './data/stickers';
import { BACKGROUNDS } from './data/backgrounds';
import PosterSticker from './PosterSticker';
import PosterBackground from './PosterBackground';
import PopButton from '../../components/controls/PopButton';

/** Badge circular "?" — misma idea del mockup. En táctil no hay tooltip
 * nativo, así que tocarlo despliega la ayuda debajo del paso.
 * v2: sin contorno negro, sombra difuminada + pequeño rebote en hover. */
function HelpBadge({ hint, open, onToggle }) {
  return (
    <button
      type="button"
      title={hint}
      aria-label="Ayuda"
      aria-expanded={open}
      onClick={onToggle}
      className="shrink-0 w-7 h-7 md:w-6 md:h-6 rounded-pill bg-orange text-white shadow-soft flex items-center justify-center text-xs font-bold cursor-help transition-transform duration-150 ease-pop hover:scale-110"
    >
      ?
    </button>
  );
}

function Step({ label, htmlFor, hint, children }) {
  const [open, setOpen] = useState(false);
  const Label = htmlFor ? 'label' : 'span';
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <Label className="font-display text-lg tracking-wide" htmlFor={htmlFor}>
          {label}
        </Label>
        <HelpBadge hint={hint} open={open} onToggle={() => setOpen((o) => !o)} />
      </div>
      {open && <p className="m-0 -mt-1 text-sm text-ink/75">{hint}</p>}
      {children}
    </div>
  );
}

/** Tira con scroll horizontal en móvil; grilla en escritorio. */
const STRIP =
  'flex gap-2.5 overflow-x-auto overscroll-x-contain -mx-5 px-5 pt-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0 md:overflow-visible md:grid';

const inputClass =
  'flex-1 min-w-0 font-body text-base px-4 py-2.5 bg-white rounded-xl outline-none text-ink shadow-[inset_0_2px_4px_rgba(18,18,18,0.12)] focus:shadow-[inset_0_2px_4px_rgba(18,18,18,0.12),0_0_0_3px_#3CBAB3] transition-shadow duration-150';

/**
 * PosterForm — nombre, galería de fondos y estampitas (tocar o arrastrar) y
 * texto del cartel. La lógica de arrastre vive en el módulo padre
 * (index.jsx) vía onStickerDragStart/onBgDragStart, para poder soltar sobre
 * el canvas.
 *
 * v2: inputs sin borde de color — se delimitan con sombra interior (como
 * SearchInput) y anillo teal al enfocar. (text-base = 16px: por debajo de
 * eso iOS hace zoom al enfocar.)
 */
export default function PosterForm({
  title,
  onTitleChange,
  text,
  onTextChange,
  onStickerDragStart,
  onBgDragStart,
  onSelectVariant,
  onBack,
  onReset,
  activeBackgroundId,
  stickerVariants,
}) {
  return (
    <div className="bg-cream p-5 pb-8 md:h-full md:overflow-y-auto md:p-8 flex flex-col gap-6 md:gap-7">
      <h1 className="font-display text-3xl tracking-wide text-red m-0">CREA TU CARTEL</h1>

      <Step label="1. Nombre de tu cartel" htmlFor="poster-title" hint="Aparecerá como título grande en tu cartel.">
        <input
          id="poster-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Tu nombre o el de alguien especial"
          maxLength={40}
          enterKeyHint="done"
          className={inputClass}
        />
      </Step>

      <Step
        label="2. Elige un fondo"
        hint="Tócalo o arrástralo al cartel. Puedes cambiarlo las veces que quieras: las estampitas que ya pusiste se quedan donde están."
      >
        <div className={`${STRIP} md:grid-cols-5`} data-testid="bg-gallery">
          {BACKGROUNDS.map((bg) => (
            <div key={bg.id} className="w-18 shrink-0 md:w-auto">
              <PosterBackground bg={bg} active={activeBackgroundId === bg.id} onDragStart={onBgDragStart} />
            </div>
          ))}
        </div>
      </Step>

      <Step
        label="3. Pon estampitas encima"
        hint="Tócalas o arrástralas al cartel (puedes repetirlas). Luego muévelas con el dedo, y toca una para agrandarla, achicarla o quitarla. Los puntos de color cambian su color."
      >
        <div className={`${STRIP} md:grid-cols-4 md:gap-3`} data-testid="sticker-gallery">
          {STICKERS.map((s) => (
            <div key={s.id} className="w-21 shrink-0 md:w-auto">
              <PosterSticker
                sticker={s}
                onDragStart={onStickerDragStart}
                onSelectVariant={onSelectVariant}
                selectedVariant={stickerVariants[s.id]}
              />
            </div>
          ))}
        </div>
      </Step>

      <Step
        label="4. Escribe el texto de tu cartel"
        htmlFor="poster-text"
        hint="Máximo 80 caracteres. Se mostrará debajo del título."
      >
        <textarea
          id="poster-text"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Una frase corta para tu cartel"
          maxLength={80}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </Step>

      <div className="flex flex-wrap items-center gap-3 mt-1">
        <PopButton variant="primary" className="!text-lg" onClick={onBack}>
          ‹ ATRÁS
        </PopButton>
        <PopButton variant="ghost" className="!text-base" onClick={onReset}>
          ↺ Empezar de nuevo
        </PopButton>
      </div>
    </div>
  );
}
