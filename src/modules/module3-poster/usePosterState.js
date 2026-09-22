import { useState, useCallback } from 'react';

/**
 * Estado local del generador de pósters. Vive fuera del store global
 * (useAppStore) a propósito: es efímero al módulo, nadie más lo necesita.
 *
 * canvasStickers: [{ uid, stickerId, xPct, yPct, rotation }]
 *   xPct/yPct son porcentaje (0–100) relativo al canvas del póster, así el
 *   layout responde a cualquier tamaño de pantalla o proyección.
 */
export function usePosterState() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [canvasStickers, setCanvasStickers] = useState([]);

  const addSticker = useCallback((stickerId, xPct, yPct) => {
    setCanvasStickers((prev) => [
      ...prev,
      {
        uid: `${stickerId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        stickerId,
        xPct: Math.min(94, Math.max(6, xPct)),
        yPct: Math.min(94, Math.max(6, yPct)),
        rotation: Math.random() * 6 - 3, // -3° a 3°, dentro de la regla del sistema de diseño
      },
    ]);
  }, []);

  const removeSticker = useCallback((uid) => {
    setCanvasStickers((prev) => prev.filter((s) => s.uid !== uid));
  }, []);

  const moveSticker = useCallback((uid, xPct, yPct) => {
    setCanvasStickers((prev) =>
      prev.map((s) =>
        s.uid === uid
          ? { ...s, xPct: Math.min(94, Math.max(6, xPct)), yPct: Math.min(94, Math.max(6, yPct)) }
          : s
      )
    );
  }, []);

  const reset = useCallback(() => {
    setTitle('');
    setText('');
    setCanvasStickers([]);
  }, []);

  return {
    title,
    setTitle,
    text,
    setText,
    canvasStickers,
    addSticker,
    removeSticker,
    moveSticker,
    reset,
  };
}
