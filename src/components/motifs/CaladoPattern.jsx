/** Calado de reja/ventana — textura vernácula (ver regla de opacidad en BaldosaPattern). */
export default function CaladoPattern({ className = '', opacity = 1 }) {
  return (
    <div
      className={`bg-blue bg-calado bg-calado ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
