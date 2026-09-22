const DEFAULT_WORDS = [
  { text: 'POP-FOLCLOR', color: '#F2B807' },
  { text: 'TRADICIÓN BAJERA', color: '#F26522' },
  { text: 'NEOBARRIAL 2050', color: '#E02828' },
  { text: 'GRAPHIC STICKER ART', color: '#1DB3E7' },
  { text: 'RÍO MAGDALENA', color: '#F2B807' },
  { text: 'HISTORIAS VIVAS', color: '#1DB3E7' },
];

/** MarqueeStrip — cinta animada bajo el header. Usa CSS puro (@keyframes bajero-marquee en index.css). */
export default function MarqueeStrip({ words = DEFAULT_WORDS }) {
  const track = [...words, ...words];

  return (
    <div className="relative z-[2] bg-ink text-cream border-b-4 border-ink overflow-hidden py-2.5">
      <div
        className="flex w-max font-display text-xl tracking-[0.22em]"
        style={{ animation: 'bajero-marquee 28s linear infinite' }}
      >
        {track.map((w, i) => (
          <span key={i} className="pr-10 flex items-center gap-10">
            {w.text}
            <span style={{ color: w.color }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
