import { useState, useCallback } from 'react';

const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/**
 * Estado local del generador de carteles (Módulo 3). Vive fuera del store
 * global (useAppStore) a propósito: es efímero al módulo, nadie más lo
 * necesita.
 *
 * activeBackgroundId: fondo (imagen) elegido; cada nuevo fondo reemplaza al
 *   anterior, sin tocar las estampitas.
 * placedStickers: estampitas colocadas encima del fondo, en orden de apilado
 *   (la última queda arriba). Cada una: { uid, stickerId, variantIndex,
 *   xPct, yPct, scale } — xPct/yPct son el CENTRO en % del cartel, así el
 *   resultado no depende del tamaño de pantalla.
 * stickerVariants: { [stickerId]: indexVariant } — color elegido en la galería.
 */
export function usePosterState() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [activeBackgroundId, setActiveBackgroundId] = useState(null);
  const [placedStickers, setPlacedStickers] = useState([]);
  const [selectedUid, setSelectedUid] = useState(null);
  const [stickerVariants, setStickerVariants] = useState({});

  const setBackgroundFromBg = useCallback((bgId) => {
    setActiveBackgroundId(bgId);
  }, []);

  const setStickerVariant = useCallback((stickerId, variantIndex) => {
    setStickerVariants((prev) => ({ ...prev, [stickerId]: variantIndex }));
  }, []);

  const addSticker = useCallback((stickerId, variantIndex, xPct, yPct) => {
    const uid = `${stickerId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setPlacedStickers((prev) => [
      ...prev,
      {
        uid,
        stickerId,
        variantIndex: variantIndex ?? 0,
        xPct: clamp(xPct, 4, 96),
        yPct: clamp(yPct, 4, 96),
        scale: 1,
      },
    ]);
    setSelectedUid(uid);
  }, []);

  const moveSticker = useCallback((uid, xPct, yPct) => {
    setPlacedStickers((prev) =>
      prev.map((s) => (s.uid === uid ? { ...s, xPct: clamp(xPct, 4, 96), yPct: clamp(yPct, 4, 96) } : s))
    );
  }, []);

  const bringToFront = useCallback((uid) => {
    setPlacedStickers((prev) => {
      const target = prev.find((s) => s.uid === uid);
      if (!target || prev[prev.length - 1] === target) return prev;
      return [...prev.filter((s) => s.uid !== uid), target];
    });
    setSelectedUid(uid);
  }, []);

  const resizeSticker = useCallback((uid, delta) => {
    setPlacedStickers((prev) =>
      prev.map((s) => (s.uid === uid ? { ...s, scale: clamp(+(s.scale + delta).toFixed(2), MIN_SCALE, MAX_SCALE) } : s))
    );
  }, []);

  const removeSticker = useCallback((uid) => {
    setPlacedStickers((prev) => prev.filter((s) => s.uid !== uid));
    setSelectedUid((cur) => (cur === uid ? null : cur));
  }, []);

  const reset = useCallback(() => {
    setTitle('');
    setText('');
    setActiveBackgroundId(null);
    setPlacedStickers([]);
    setSelectedUid(null);
    setStickerVariants({});
  }, []);

  return {
    title,
    setTitle,
    text,
    setText,
    activeBackgroundId,
    placedStickers,
    selectedUid,
    setSelectedUid,
    stickerVariants,
    setBackgroundFromBg,
    setStickerVariant,
    addSticker,
    moveSticker,
    bringToFront,
    resizeSticker,
    removeSticker,
    reset,
  };
}
