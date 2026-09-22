/**
 * MapPin — marcador puntual (mapa del recorrido / puntos de interés AR).
 * Placeholder visual: la lógica de mapa/geolocalización la define quien
 * implemente esa vista.
 *
 * v2: sin contorno negro — sombra difuminada pequeña para que el punto
 * se lea sobre cualquier fondo del mapa.
 */
export default function MapPin({ label, active = false }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className="w-4 h-4 rounded-pill shadow-soft"
        style={{ background: active ? '#E02828' : '#1DB3E7' }}
      />
      {label && <span className="text-sm font-bold uppercase tracking-wide">{label}</span>}
    </div>
  );
}
