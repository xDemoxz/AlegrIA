import BaldosaPattern from '../motifs/BaldosaPattern';

/** EmptyState — sin resultados (búsqueda vacía, módulo sin datos aún, etc). */
export default function EmptyState({ title = 'Nada por aquí todavía', hint }) {
  return (
    <div className="relative border-3 border-ink rounded-sticker overflow-hidden text-center py-12 px-6">
      <BaldosaPattern className="absolute inset-0" opacity={0.13} />
      <div className="relative">
        <h3 className="font-display text-3xl uppercase m-0">{title}</h3>
        {hint && <p className="text-base font-medium mt-2 max-w-md mx-auto">{hint}</p>}
      </div>
    </div>
  );
}
