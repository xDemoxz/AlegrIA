import { useEffect, useState } from 'react';
import { enableGestureBridge } from '../../lib/gestureBridge';

/**
 * GestureCursor — puntero virtual en pantalla, controlado por gestureBridge.
 * Móntalo UNA vez cerca de la raíz (ver App.jsx) cuando
 * useAppStore().gestureControlEnabled sea true. No hace falta montarlo
 * manualmente dentro de cada módulo.
 *
 * v2: sin contorno negro — sombra difuminada. Verde (teal) como color de
 * reposo, ya que es el acento interactivo por defecto del sistema.
 */
export default function GestureCursor({ enabled }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setPos(null);
      return undefined;
    }
    const cleanup = enableGestureBridge(setPos);
    return cleanup;
  }, [enabled]);

  if (!enabled || !pos) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed z-[999] pointer-events-none transition-transform duration-75"
      style={{
        left: pos.x,
        top: pos.y,
        transform: `translate(-50%, -50%) scale(${pos.active ? 0.8 : 1})`,
      }}
    >
      <div
        className="w-8 h-8 rounded-pill shadow-soft"
        style={{ background: pos.active ? '#E02828' : '#1E8C86' }}
      />
    </div>
  );
}
