/** Teja colonial — textura vernácula (ver regla de opacidad en BaldosaPattern). */
export default function TejaPattern({ className = '', opacity = 1 }) {
  return (
    <div
      className={`bg-yellow bg-teja bg-teja ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
