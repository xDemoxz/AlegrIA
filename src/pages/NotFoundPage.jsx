import { Link } from 'react-router-dom';

/** Ruta comodín: sin esto una URL desconocida renderiza una pantalla vacía. */
export default function NotFoundPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-screen flex-col items-center justify-center gap-5 bg-cream px-6 text-center outline-none"
    >
      <p className="font-display text-7xl leading-none tracking-wide text-red">404</p>
      <h1 className="max-w-[22ch] font-display text-3xl leading-tight tracking-wide text-ink">
        Ese rincón del barrio no existe
      </h1>
      <p className="max-w-[42ch] text-[15px] leading-relaxed text-ink/70">
        La página que buscas no está disponible. Puedes volver al inicio y seguir el recorrido.
      </p>
      <Link
        to="/"
        className="rounded-pill bg-verde px-6 py-3 font-display text-lg tracking-wide text-cream shadow-soft transition-all duration-200 ease-pop hover:-translate-y-0.5 hover:shadow-soft-lg active:translate-y-0 active:shadow-pressed"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
