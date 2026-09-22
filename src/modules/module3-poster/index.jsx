import { useCallback, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { usePosterState } from './usePosterState';
import PosterForm from './PosterForm';
import PosterPreview from './PosterPreview';
import Toast from '../../components/feedback/Toast';
import { exportPosterToPng } from './exportPoster';
import { STICKERS } from './data/stickers';

/**
 * MÓDULO 3 — Generador de Pósters (José Romero)
 * ------------------------------------------------------------------
 * Estampitas: src/modules/module3-poster/data/stickers.js (placeholders de
 * color — reemplazar `bg`/`pattern` por `image` cuando lleguen los assets).
 *
 * Arrastre: NO usa HTML5 drag nativo — usa Pointer Events a propósito, para
 * que el mismo código funcione con mouse, touch Y con los gestos de tu
 * compañero (ver src/lib/gestureBridge.js). No hace falta tocar este
 * archivo para conectar su sistema: el bridge ya traduce sus eventos a
 * pointerdown/pointermove/pointerup reales sobre estos mismos elementos.
 *
 * Flujo: al guardar el cartel se exporta a PNG (html2canvas) y se avanza al
 * Módulo 4 automáticamente. `npm install html2canvas` si no está instalado.
 */
export default function Module3Poster() {
  const prev = useAppStore((s) => s.prev);
  const next = useAppStore((s) => s.next);

  const { title, setTitle, text, setText, canvasStickers, addSticker, removeSticker } =
    usePosterState();

  const canvasRef = useRef(null);
  const [dragState, setDragState] = useState(null); // { stickerId, x, y } | null
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const handleDragStart = useCallback((stickerId, x, y) => {
    setDragState({ stickerId, x, y });
  }, []);

  // Un solo listener global de pointer mientras hay un drag activo — se
  // registra/limpia con dragState para no dejar listeners huérfanos.
  const attachDragListeners = useCallback(
    (initialState) => {
      function handleMove(e) {
        setDragState((s) => (s ? { ...s, x: e.clientX, y: e.clientY } : s));
      }

      function handleUp(e) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const withinX = e.clientX >= rect.left && e.clientX <= rect.right;
          const withinY = e.clientY >= rect.top && e.clientY <= rect.bottom;
          if (withinX && withinY) {
            const xPct = ((e.clientX - rect.left) / rect.width) * 100;
            const yPct = ((e.clientY - rect.top) / rect.height) * 100;
            addSticker(initialState.stickerId, xPct, yPct);
          }
        }
        setDragState(null);
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      }

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [addSticker]
  );

  // Dispara los listeners justo cuando arranca un drag nuevo.
  const onStickerDragStart = useCallback(
    (stickerId, x, y) => {
      const initial = { stickerId, x, y };
      handleDragStart(stickerId, x, y);
      attachDragListeners(initial);
    },
    [handleDragStart, attachDragListeners]
  );

  const handleSave = useCallback(async () => {
    if (!canvasRef.current) return;
    setSaving(true);
    try {
      await exportPosterToPng(canvasRef.current, `${title || 'cartel'}-alegria.png`);
      setToast('Cartel guardado ✓');
      setTimeout(() => next(), 900);
    } catch (err) {
      console.error('[Módulo 3] No se pudo exportar el cartel:', err);
      setToast('No se pudo guardar — revisa la consola');
    } finally {
      setSaving(false);
    }
  }, [title, next]);

  return (
    <section className="grid" style={{ gridTemplateColumns: 'minmax(320px, 460px) 1fr', minHeight: '80vh' }}>
      <PosterForm
        title={title}
        onTitleChange={setTitle}
        text={text}
        onTextChange={setText}
        onStickerDragStart={onStickerDragStart}
        onBack={prev}
      />
      <PosterPreview
        ref={canvasRef}
        title={title}
        text={text}
        canvasStickers={canvasStickers}
        onRemoveSticker={removeSticker}
        onSave={handleSave}
        saving={saving}
      />

      {/* Ghost de la estampita siguiendo el cursor (mouse/touch/gesto) mientras se arrastra */}
      {dragState && (
        <div
          className="fixed z-[998] w-16 h-20 rounded-badge border-3 border-white shadow-pop-black pointer-events-none opacity-90"
          style={{
            left: dragState.x,
            top: dragState.y,
            transform: 'translate(-50%, -50%)',
            background:
              STICKERS.find((s) => s.id === dragState.stickerId)?.bg ?? '#1DB3E7',
          }}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </section>
  );
}
