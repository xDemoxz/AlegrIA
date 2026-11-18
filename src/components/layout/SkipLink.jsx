/**
 * SkipLink — primer elemento enfocable del documento.
 *
 * Permanece fuera de pantalla hasta que recibe foco por teclado (Tab); ahí
 * aparece arriba a la izquierda y lleva al `main` de la página. Evita tener
 * que atravesar el header y el carrusel en cada visita.
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-pill focus:bg-ink focus:px-5 focus:py-3 focus:font-display focus:text-lg focus:tracking-wide focus:text-cream focus:shadow-soft-lg"
    >
      Saltar al contenido
    </a>
  );
}
