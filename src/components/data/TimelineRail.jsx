import TimelineBadge from '../controls/TimelineBadge';

/**
 * TimelineRail — fila de TimelineBadge + texto del hito activo (Módulo 1).
 * Sebastián: este componente es el "aside" descrito en el brief; puedes
 * envolverlo o extenderlo, pero la lógica de scroll/GSAP va en tu módulo,
 * no aquí.
 */
export default function TimelineRail({ hitos, activeYear, onSelect, accent = '#E02828' }) {
  const active = hitos.find((h) => h.year === activeYear) ?? hitos[0];

  return (
    <div className="bg-cream border-3 border-ink rounded-sticker shadow-pop-black p-6.5">
      <div className="flex flex-wrap gap-4.5">
        {hitos.map((h) => (
          <TimelineBadge
            key={h.id}
            year={h.year}
            active={h.year === activeYear}
            accent={accent}
            onClick={() => onSelect?.(h.year)}
          />
        ))}
      </div>
      {active && (
        <div className="mt-5.5 bg-ink text-cream rounded-xl px-4.5 py-4 text-[17px] font-medium leading-[1.5]">
          <span className="font-display text-2xl text-yellow tracking-wide">{active.year} · </span>
          {active.text}
        </div>
      )}
    </div>
  );
}
