import { useCallback, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { usePosterState } from './usePosterState';
import PosterForm from './PosterForm';
import PosterPreview from './PosterPreview';
import Toast from '../../components/feedback/Toast';
import { exportPosterToPng } from './exportPoster';
import { STICKERS } from './data/stickers';
import { BACKGROUNDS } from './data/backgrounds';

/**
 * MÓDULO 3 — Generador de Pósters / Murales (José Romero)
 * ------------------------------------------------------------------
 * Capas: fondo (imagen de BACKGROUNDS, intercambiable) + estampitas PNG
 * colocadas encima, en la posición donde se sueltan. Todo se arrastra con
 * Pointer Events (no HTML5 drag) para compat con mouse/touch/gestureBridge:
 *  - Galería → cartel: un fondo reemplaza al anterior (sin tocar las
 *    estampitas); una estampita se AGREGA en el punto soltado (puedes poner
 *    varias, repetidas).
 *  - Estampita ya colocada: se arrastra para moverla, y al tocarla salen
 *    los controles −/+/✕ (ver PosterPreview).
 * El orden recomendado en la UI es fondo primero (2), luego estampitas (3),
 * pero se puede cambiar el fondo en cualquier momento.
 */
export default function Module3Poster() {
  const prev = useAppStore((s) => s.prev);

  const {
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
  } = usePosterState();

  const canvasRef = useRef(null);
  const [dragState, setDragState] = useState(null); // { type:'sticker'|'bg', id, x, y, variantIndex? } | null
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Los listeners globales viven fuera del render: leen estado vía refs.
  const placedRef = useRef(placedStickers);
  placedRef.current = placedStickers;
  const variantsRef = useRef(stickerVariants);
  variantsRef.current = stickerVariants;

  const toCanvasPct = useCallback((clientX, clientY) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      inside: clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom,
      xPct: ((clientX - rect.left) / rect.width) * 100,
      yPct: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  // Drag desde la galería (estampita o fondo) hacia el cartel.
  const attachGalleryDrag = useCallback(
    (initial) => {
      function handleMove(e) {
        setDragState((s) => (s ? { ...s, x: e.clientX, y: e.clientY } : s));
      }

      function handleUp(e) {
        const pos = toCanvasPct(e.clientX, e.clientY);
        if (pos?.inside) {
          if (initial.type === 'bg') {
            setBackgroundFromBg(initial.id);
          } else {
            const variantIndex = initial.variantIndex ?? variantsRef.current[initial.id] ?? 0;
            addSticker(initial.id, variantIndex, pos.xPct, pos.yPct);
          }
        }
        setDragState(null);
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      }

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [toCanvasPct, setBackgroundFromBg, addSticker]
  );

  const onStickerDragStart = useCallback(
    (stickerId, x, y, variantIndex) => {
      if (variantIndex !== undefined) setStickerVariant(stickerId, variantIndex);
      setDragState({ type: 'sticker', id: stickerId, x, y, variantIndex });
      attachGalleryDrag({ type: 'sticker', id: stickerId, variantIndex });
    },
    [attachGalleryDrag, setStickerVariant]
  );

  const onBgDragStart = useCallback(
    (bgId, x, y) => {
      setDragState({ type: 'bg', id: bgId, x, y });
      attachGalleryDrag({ type: 'bg', id: bgId });
    },
    [attachGalleryDrag]
  );

  // Drag de una estampita ya colocada: se mueve en vivo dentro del cartel,
  // conservando el punto exacto por donde la agarraste.
  const onPlacedDragStart = useCallback(
    (uid, clientX, clientY) => {
      const item = placedRef.current.find((s) => s.uid === uid);
      const start = toCanvasPct(clientX, clientY);
      if (!item || !start) return;
      const offsetX = item.xPct - start.xPct;
      const offsetY = item.yPct - start.yPct;
      bringToFront(uid);

      function handleMove(e) {
        const pos = toCanvasPct(e.clientX, e.clientY);
        if (pos) moveSticker(uid, pos.xPct + offsetX, pos.yPct + offsetY);
      }
      function handleUp() {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      }
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [toCanvasPct, bringToFront, moveSticker]
  );

  const handleSave = useCallback(async () => {
    if (!canvasRef.current) {
      setToast('Error: no se encuentra el área del cartel');
      return;
    }
    setSelectedUid(null);
    setSaving(true);
    try {
      await exportPosterToPng(canvasRef.current, `${title || 'cartel'}-alegria.png`);
      setToast('Cartel guardado ✓');
    } catch (err) {
      console.error('[Módulo 3] No se pudo exportar el cartel:', err);
      const msg = err?.message ?? String(err);
      if (msg.includes('blob') || msg.includes('toBlob')) {
        setToast('Error generando la imagen — intenta de nuevo');
      } else if (msg.includes('html2canvas') || msg.includes('canvas')) {
        setToast('Error renderizando — revisa la consola (F12)');
      } else {
        setToast('No se pudo guardar — revisa la consola (F12)');
      }
    } finally {
      setSaving(false);
    }
  }, [title, setSelectedUid]);

  const handleReset = useCallback(() => {
    reset();
    setToast('Cartel reiniciado');
  }, [reset]);

  return (
    <section className="grid flex-1" style={{ gridTemplateColumns: 'minmax(320px, 460px) 1fr', minHeight: '80vh' }}>
      <PosterForm
        title={title}
        onTitleChange={setTitle}
        text={text}
        onTextChange={setText}
        onStickerDragStart={onStickerDragStart}
        onBgDragStart={onBgDragStart}
        onBack={prev}
        onReset={handleReset}
        activeBackgroundId={activeBackgroundId}
        stickerVariants={stickerVariants}
      />
      <PosterPreview
        ref={canvasRef}
        title={title}
        text={text}
        activeBackgroundId={activeBackgroundId}
        placedStickers={placedStickers}
        selectedUid={selectedUid}
        onSelectSticker={setSelectedUid}
        onPlacedDragStart={onPlacedDragStart}
        onResizeSticker={resizeSticker}
        onRemoveSticker={removeSticker}
        onSave={handleSave}
        saving={saving}
      />

      {/* Ghost del elemento arrastrado desde la galería (estampita o fondo) */}
      {dragState &&
        (() => {
          const ghostStyle = {
            left: dragState.x,
            top: dragState.y,
            transform: 'translate(-50%, -50%) rotate(-2deg)',
            boxShadow: '0 0 0 3px rgba(255,255,255,0.6), 0 14px 32px -8px rgb(18 18 18 / 0.35)',
          };
          if (dragState.type === 'bg') {
            const bg = BACKGROUNDS.find((x) => x.id === dragState.id);
            if (!bg) return null;
            return (
              <div
                className="fixed z-[998] h-24 w-[72px] rounded-sticker pointer-events-none shadow-soft-lg overflow-hidden"
                style={ghostStyle}
              >
                <img
                  src={bg.image}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ objectPosition: bg.position }}
                />
              </div>
            );
          }
          const s = STICKERS.find((x) => x.id === dragState.id);
          const variantImg = s?.variants?.[dragState.variantIndex ?? variantsRef.current[dragState.id] ?? 0]?.image ?? s?.image;
          return (
            <div
              className="fixed z-[998] w-20 h-20 rounded-sticker pointer-events-none bg-white shadow-soft-lg overflow-hidden flex items-center justify-center"
              style={ghostStyle}
            >
              {variantImg ? (
                <img src={variantImg} alt={s.label} className="w-full h-full object-contain p-1.5" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: s?.bg ?? '#1DB3E7' }}>
                  <span className="text-[10px] font-bold text-white px-1 text-center">{s?.label}</span>
                </div>
              )}
            </div>
          );
        })()}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </section>
  );
}
