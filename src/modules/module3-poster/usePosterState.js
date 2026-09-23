import { useState, useCallback } from 'react';

/**
 * Estado local del generador de carteles/murales (Módulo 3). Vive fuera del
 * store global (useAppStore) a propósito: es efímero al módulo, nadie más
 * lo necesita.
 *
 * activeBackgroundId: fondo SVG/CSS elegido (capa base, semi-transparente).
 * activeStickerId: estampita PNG elegida (capa superior, protagonista).
 * stickerVariants: { [stickerId]: indexVariant } — variante de color elegida.
 */
export function usePosterState() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [activeBackgroundId, setActiveBackgroundId] = useState(null);
  const [activeStickerId, setActiveStickerId] = useState(null);
  const [stickerVariants, setStickerVariants] = useState({});

  const setBackground = useCallback((stickerId) => {
    setActiveStickerId(stickerId);
  }, []);

  const setBackgroundFromBg = useCallback((bgId) => {
    setActiveBackgroundId(bgId);
  }, []);

  const setStickerVariant = useCallback((stickerId, variantIndex) => {
    setStickerVariants((prev) => ({ ...prev, [stickerId]: variantIndex }));
  }, []);

  const getStickerVariant = useCallback((stickerId) => {
    return stickerVariants[stickerId];
  }, [stickerVariants]);

  const clearBackground = useCallback(() => {
    setActiveStickerId(null);
    setActiveBackgroundId(null);
    setStickerVariants({});
  }, []);

  const reset = useCallback(() => {
    setTitle('');
    setText('');
    setActiveStickerId(null);
    setActiveBackgroundId(null);
    setStickerVariants({});
  }, []);

  return {
    title,
    setTitle,
    text,
    setText,
    activeBackgroundId,
    activeStickerId,
    stickerVariants,
    setBackground,
    setBackgroundFromBg,
    setStickerVariant,
    getStickerVariant,
    clearBackground,
    reset,
  };
}