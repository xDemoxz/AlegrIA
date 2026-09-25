/**
 * PosterBackground — miniatura de la galería de FONDOS (imágenes). Se
 * arrastra al cartel con Pointer Events, igual que PosterSticker, así que
 * responde a mouse, touch y gestos sin ramas especiales. Tocarlo sin
 * arrastrar también lo aplica (ver index.jsx). touch-pan-x: en móvil la
 * tira se desplaza de lado y el gesto vertical queda para arrastrar.
 */
export default function PosterBackground({ bg, active = false, onDragStart }) {
  return (
    <button
      type="button"
      onPointerDown={(e) => onDragStart(bg.id, e.clientX, e.clientY)}
      className={`relative w-full aspect-[3/4] rounded-sticker shadow-soft overflow-hidden cursor-grab active:cursor-grabbing touch-pan-x select-none [-webkit-touch-callout:none] transition-all duration-200 ease-pop hover:-translate-y-1 hover:shadow-soft-lg active:translate-y-0 active:shadow-pressed ${
        active ? 'ring-4 ring-verde' : ''
      }`}
      title={bg.label}
      aria-label={`Fondo ${bg.label}`}
      aria-pressed={active}
    >
      <img
        src={bg.image}
        alt=""
        loading="lazy"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ objectPosition: bg.position }}
      />
      <span
        className="absolute bottom-0 left-0 right-0 text-[10px] md:text-[11px] font-bold leading-tight px-1 py-1 text-center backdrop-blur-sm"
        style={{ background: 'rgba(18,18,18,0.78)', color: '#FFF' }}
      >
        {bg.label}
      </span>
    </button>
  );
}
