/**
 * PopButton — botón con 3 variantes + estado inactivo, según el sistema de
 * diseño v2 (patrimonial / Tailwind v4): la forma se define por color,
 * radio y sombra difuminada — no por contorno negro. Hover eleva -2px y
 * pasa a shadow-soft-lg; active vuelve a 0 con shadow-pressed (sombra
 * interior). Nunca usar el offset duro de v1.
 */
const VARIANTS = {
  primary:
    'bg-red text-white shadow-soft hover:bg-red-dark hover:shadow-soft-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-pressed',
  secondary:
    'bg-verde text-white shadow-soft hover:bg-verde-dark hover:shadow-soft-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-pressed',
  ghost: 'bg-verde-dark/[0.09] text-verde-dark shadow-none hover:bg-verde-dark hover:text-cream',
};

export default function PopButton({
  children,
  variant = 'primary',
  disabled = false,
  className = '',
  ...props
}) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className={`cursor-not-allowed bg-[#E4DCC6] text-[#807A6B] font-display text-2xl tracking-wide rounded-pill px-8 pt-3.5 pb-2.5 ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`cursor-pointer font-display text-2xl tracking-wide rounded-pill px-8 pt-3.5 pb-2.5 leading-none transition-all duration-200 ease-pop ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
