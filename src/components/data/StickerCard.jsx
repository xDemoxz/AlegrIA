import TejaPattern from '../motifs/TejaPattern';
import Chip from '../controls/Chip';

/**
 * StickerCard — tarjeta de hito histórico (Módulo 1: línea del tiempo).
 * Espera un item de src/data/barrioAbajoData.json con { year, category, title, text }.
 */
export default function StickerCard({ year, category, title, text, tilt = '-1.5deg' }) {
  return (
    <div
      className="relative bg-cream border-4 border-white outline outline-3 outline-ink rounded-sticker p-5 shadow-pop-black"
      style={{ transform: `rotate(${tilt})` }}
    >
      <div className="flex justify-between items-center mb-3.5 gap-2.5">
        <span className="bg-red text-white font-display text-xl tracking-wide px-3 pt-1.5 pb-0.5 rounded-badge border-2 border-ink">
          {year}
        </span>
        <Chip tone="cream">{category}</Chip>
      </div>
      <div className="relative mb-4 border-3 border-ink rounded-[10px] overflow-hidden h-[150px]">
        <TejaPattern className="absolute inset-0" />
      </div>
      <h3 className="font-display text-3xl leading-none mb-2 uppercase">{title}</h3>
      <p className="text-base font-medium leading-[1.55] m-0">{text}</p>
    </div>
  );
}
