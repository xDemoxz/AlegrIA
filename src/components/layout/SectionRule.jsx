/** SectionRule — encabezado numerado de sección ("01 PALETA", "02 TIPOGRAFÍA"...). */
export default function SectionRule({ number, title }) {
  return (
    <div className="flex items-baseline gap-3.5 border-b-4 border-ink pb-2.5 mb-7">
      <span className="font-display text-xl bg-ink text-yellow px-3 pt-1 pb-0 rounded-badge">{number}</span>
      <h2 className="font-display text-4xl tracking-wide m-0">{title}</h2>
    </div>
  );
}
