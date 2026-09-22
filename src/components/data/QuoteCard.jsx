import Chip from '../controls/Chip';
import AudioToggle from '../controls/AudioToggle';

/**
 * QuoteCard — testimonio/memoria oral con avatar de iniciales y toggle de
 * audio. Espera item.quote de barrioAbajoData.json: { text, author, role }.
 */
export default function QuoteCard({ year, category = 'Memoria Oral', quote, tilt = '1.2deg', playing, onToggleAudio }) {
  const initials = quote.author
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  return (
    <div
      className="relative bg-cream border-4 border-white outline outline-3 outline-ink rounded-sticker p-5 shadow-pop-red"
      style={{ transform: `rotate(${tilt})` }}
    >
      <div className="flex justify-between items-center mb-3.5 gap-2.5">
        <span className="bg-orange text-white font-display text-xl tracking-wide px-3 pt-1.5 pb-0.5 rounded-badge border-2 border-ink">
          {year}
        </span>
        <Chip tone="cream">{category}</Chip>
      </div>
      <blockquote className="m-0 text-lg font-medium italic leading-[1.5]">“{quote.text}”</blockquote>
      <div className="flex items-center gap-3 mt-4.5">
        <div className="w-[46px] h-[46px] rounded-pill border-3 border-ink bg-blue flex items-center justify-center font-display text-white text-xl">
          {initials}
        </div>
        <div>
          <div className="font-extrabold text-[15px]">{quote.author}</div>
          <div className="text-[13px] font-medium">{quote.role}</div>
        </div>
        <AudioToggle playing={playing} onToggle={onToggleAudio} />
      </div>
    </div>
  );
}
