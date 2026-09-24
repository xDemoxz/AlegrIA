/**
 * Baldosa hidráulica — textura vernácula. Úsala SOLO como fondo decorativo
 * detrás de contenido, nunca a más del 20% de opacidad si hay texto encima
 * (regla del sistema de diseño, sección "SÍ / NO").
 */
export default function BaldosaPattern({ className = '', opacity = 1 }) {
  return <div className={`bg-baldosa bg-baldosa ${className}`} style={{ opacity }} aria-hidden="true" />;
}
