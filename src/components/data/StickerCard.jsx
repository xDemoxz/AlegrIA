import TejaPattern from '../motifs/TejaPattern';
import Chip from '../controls/Chip';

/**
 * StickerCard — tarjeta de hito histórico (Módulo 1: línea del tiempo).
 * Espera un item de src/data/barrioAbajoData.json con { year, category, title, text }.
 *
 * v2: sin el doble contorno blanco+negro — la tarjeta se separa del fondo
 * por sombra difuminada. Ligero levantamiento en hover, dentro de la
 * rotación ya asignada (eso sí es sticker art).
 */
export default function StickerCard({ year, category, title, text, tilt = '-1.5deg' }) {
  return (
    <div
      className="relative bg-cream rounded-sticker p-5 shadow-soft transition-all duration-200 ease-pop hover:shadow-soft-lg hover:-translate-y-1"
      style={{ transform: `rotate(${tilt})` }}
    >
      <div className="flex justify-between items-center mb-3.5 gap-2.5">
        <span className="bg-red text-white font-display text-xl tracking-wide px-3 pt-1.5 pb-0.5 rounded-badge">
          {year}
        </span>
        <Chip tone="cream">{category}</Chip>
      </div>
      <div className="relative mb-4 rounded-[10px] overflow-hidden h-[150px] shadow-[inset_0_0_0_1px_rgba(18,18,18,0.06)]">
        <TejaPattern className="absolute inset-0" />
      </div>
      <h3 className="font-display text-3xl leading-none mb-2 uppercase">{title}</h3>
      <p className="text-base font-medium leading-[1.55] m-0">{text}</p>
    </div>
  );
}
