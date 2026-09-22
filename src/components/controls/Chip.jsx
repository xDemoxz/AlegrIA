const TONES = {
  red: 'bg-red text-white',
  blue: 'bg-blue text-white',
  orange: 'bg-orange text-white',
  cream: 'bg-cream text-ink',
  ink: 'bg-ink text-yellow',
};

/** Chip — etiqueta de categoría/tag. Úsalo para filtros de hitos o pósters. */
export default function Chip({ children, tone = 'red', className = '' }) {
  return (
    <span
      className={`inline-block text-[13px] font-extrabold tracking-[0.1em] uppercase leading-none px-4 py-2 border-2 border-ink rounded-pill ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
