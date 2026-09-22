/**
 * PopButton — botón con 3 variantes + estado inactivo, según el sistema de
 * diseño: hover eleva -2px y engorda la sombra a 7px; active hunde 3px y la
 * reduce a 2px. Nunca usar blur.
 */
const VARIANTS = {
  primary:
    'bg-red text-white hover:bg-red-dark shadow-pop-black hover:shadow-[7px_7px_0_0_#121212] hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-pressed',
  secondary:
    'bg-blue text-white hover:bg-blue-dark shadow-pop-black hover:shadow-[7px_7px_0_0_#121212] hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-pressed',
  ghost: 'bg-transparent text-ink shadow-none hover:bg-ink hover:text-yellow',
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
        className={`cursor-not-allowed bg-[#D9D2C0] text-[#6B6659] border-3 border-[#6B6659] font-display text-2xl tracking-wide rounded-pill px-7 pt-3.5 pb-2.5 ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`cursor-pointer font-display text-2xl tracking-wide rounded-pill border-3 border-ink px-7 pt-3.5 pb-2.5 transition-all duration-100 ease-pop ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
