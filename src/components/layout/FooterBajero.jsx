/** FooterBajero — pie de página compartido por toda la experiencia.
 * v2: degradado festival de 3 paradas (rojo oscuro → rojo → naranja), sin
 * contorno negro superior. */
export default function FooterBajero() {
  return (
    <footer className="relative z-[2] mt-20 bg-[linear-gradient(135deg,#A81212_0%,#E02828_60%,#F26522_100%)] text-white px-6 py-10 text-center">
      <div className="font-display text-3xl tracking-[0.1em] text-yellow-light">BARRIO ABAJO DEL RÍO · ALEGRÍA</div>
      <div className="text-[15px] font-medium mt-2">
        Sistema de diseño v2.0 · Tailwind v4 CSS-first · POP-Folclor patrimonial
      </div>
    </footer>
  );
}
