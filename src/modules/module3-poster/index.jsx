import { useCallback, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { usePosterState } from './usePosterState';
import PosterForm from './PosterForm';
import PosterPreview from './PosterPreview';
import PosterResultSheet from './PosterResultSheet';
import Toast from '../../components/feedback/Toast';
import { renderPosterToBlob, savePosterBlob, downloadBlob, sanitizeFilename, isTouchDevice } from './exportPoster';
import { STICKERS } from './data/stickers';
import { BACKGROUNDS } from './data/backgrounds';

/** Px que hay que mover el dedo/mouse para que un toque cuente como arrastre. */
export const DRAG_THRESHOLD_PX = 8;

/**
 * MÓDULO 3 — Generador de Pósters / Murales (José Romero)
 * ------------------------------------------------------------------
 * Capas: fondo (imagen de BACKGROUNDS, intercambiable) + estampitas PNG
 * colocadas encima, en la posición donde se sueltan. Todo se arrastra con
 * Pointer Events (no HTML5 drag) para compat con mouse/touch/gestureBridge:
 *  - Galería → cartel: un fondo reemplaza al anterior (sin tocar las
 *    estampitas); una estampita se AGREGA en el punto soltado (puedes poner
 *    varias, repetidas).
 *  - TOCAR (sin arrastrar) un fondo lo aplica; tocar una estampita la agrega
 *    cerca del centro. Es el camino principal en móvil, donde galería y
 *    cartel no siempre caben juntos en pantalla.
 *  - Estampita ya colocada: se arrastra para moverla, y al tocarla salen
 *    los controles −/+/✕ (ver PosterPreview).
 *
 * Móvil (< md): cartel arriba (sticky) y formulario debajo; las galerías son
 * tiras con scroll horizontal (touch-action: pan-x), así un gesto lateral
 * desplaza la tira y uno hacia arriba arrastra al cartel.
 */
export default function Module3Poster({ onBack: onBackProp } = {}) {
  const prev = useAppStore((s) => s.prev);
  // En página standalone (/poster) el volver navega al home; dentro del
  // switcher legacy usa prev() del store. Prop opcional, compatible.
  const onBack = onBackProp ?? prev;

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
  const [result, setResult] = useState(null); // { blob, filename } — hoja de guardado en móvil
  const [toast, setToast] = useState(null);

  // Los listeners globales viven fuera del render: leen estado vía refs.
  const placedRef = useRef(placedStickers);
  placedRef.current = placedStickers;
  const variantsRef = useRef(stickerVariants);
  variantsRef.current = stickerVariants;

  const toCanvasPct = useCallback((clientX, clientY) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return null;
    return {
      inside: clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom,
      xPct: ((clientX - rect.left) / rect.width) * 100,
      yPct: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const applyGalleryItem = useCallback(
    (item, xPct, yPct) => {
      if (item.type === 'bg') {
        setBackgroundFromBg(item.id);
        return;
      }
      const variantIndex = item.variantIndex ?? variantsRef.current[item.id] ?? 0;
      if (xPct === undefined) {
        // Por toque: cerca del centro, corriendo un poco cada nueva para que
        // no queden todas apiladas en el mismo punto.
        const n = placedRef.current.length;
        xPct = 50 + ((n % 5) - 2) * 7;
        yPct = 58 + ((Math.floor(n / 5) % 3) - 1) * 10;
      }
      addSticker(item.id, variantIndex, xPct, yPct);
    },
    [setBackgroundFromBg, addSticker]
  );

  // Arrastre (o toque) desde la galería (estampita o fondo) hacia el cartel.
  const startGalleryGesture = useCallback(
    (item, startX, startY) => {
      let moved = false;

      function cleanup() {
        setDragState(null);
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
        window.removeEventListener('pointercancel', handleCancel);
      }

      function handleMove(e) {
        if (!moved && Math.hypot(e.clientX - startX, e.clientY - startY) < DRAG_THRESHOLD_PX) return;
        moved = true;
        setDragState({ ...item, x: e.clientX, y: e.clientY });
      }

      function handleUp(e) {
        cleanup();
        if (!moved) {
          applyGalleryItem(item);
          return;
        }
        const pos = toCanvasPct(e.clientX, e.clientY);
        if (pos?.inside) applyGalleryItem(item, pos.xPct, pos.yPct);
      }

      // El navegador tomó el gesto (scroll horizontal de la tira): no es
      // ni toque ni arrastre.
      function handleCancel() {
        cleanup();
      }

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
      window.addEventListener('pointercancel', handleCancel);
    },
    [toCanvasPct, applyGalleryItem]
  );

  const onStickerDragStart = useCallback(
    (stickerId, x, y, variantIndex) => {
      if (variantIndex !== undefined) setStickerVariant(stickerId, variantIndex);
      startGalleryGesture({ type: 'sticker', id: stickerId, variantIndex }, x, y);
    },
    [startGalleryGesture, setStickerVariant]
  );

  const onBgDragStart = useCallback(
    (bgId, x, y) => startGalleryGesture({ type: 'bg', id: bgId }, x, y),
    [startGalleryGesture]
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
        window.removeEventListener('pointercancel', handleUp);
      }
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
      window.addEventListener('pointercancel', handleUp);
    },
    [toCanvasPct, bringToFront, moveSticker]
  );

  const reportError = useCallback((err) => {
    console.error('[Módulo 3] No se pudo exportar el cartel:', err);
    setToast('No se pudo guardar el cartel — intenta de nuevo');
  }, []);

  const handleSave = useCallback(async () => {
    if (!canvasRef.current) {
      setToast('Error: no se encuentra el área del cartel');
      return;
    }
    setSelectedUid(null);
    setSaving(true);
    try {
      const blob = await renderPosterToBlob(canvasRef.current);
      const filename = sanitizeFilename(title);
      if (isTouchDevice()) {
        setResult({ blob, filename });
      } else {
        downloadBlob(blob, filename);
        setToast('Cartel guardado ✓');
      }
    } catch (err) {
      reportError(err);
    } finally {
      setSaving(false);
    }
  }, [title, setSelectedUid, reportError]);

  const handleSaveResult = useCallback(
    async ({ preferShare }) => {
      if (!result) return;
      setSaving(true);
      try {
        const outcome = await savePosterBlob(result.blob, result.filename, { preferShare });
        if (outcome !== 'cancelled') {
          setToast(outcome === 'shared' ? 'Cartel listo ✓' : 'Cartel guardado ✓');
          setResult(null);
        }
      } catch (err) {
        reportError(err);
      } finally {
        setSaving(false);
      }
    },
    [result, reportError]
  );

  const handleReset = useCallback(() => {
    reset();
    setToast('Cartel reiniciado');
  }, [reset]);

  return (
    <section className="group/poster flex flex-1 flex-col md:grid md:min-h-[80vh] md:grid-cols-[minmax(320px,460px)_1fr]">
      <PosterForm
        title={title}
        onTitleChange={setTitle}
        text={text}
        onTextChange={setText}
        onStickerDragStart={onStickerDragStart}
        onBgDragStart={onBgDragStart}
        onSelectVariant={setStickerVariant}
        onBack={onBack}
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
        saving={saving && !result}
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
                data-testid="drag-ghost"
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
              data-testid="drag-ghost"
              className="fixed z-[998] w-20 h-20 rounded-sticker pointer-events-none bg-white shadow-soft-lg overflow-hidden flex items-center justify-center"
              style={ghostStyle}
            >
              {variantImg ? (
                <img src={variantImg} alt="" className="w-full h-full object-contain p-1.5" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: s?.bg ?? '#1DB3E7' }}>
                  <span className="text-[10px] font-bold text-white px-1 text-center">{s?.label}</span>
                </div>
              )}
            </div>
          );
        })()}

      {result && (
        <PosterResultSheet
          blob={result.blob}
          filename={result.filename}
          saving={saving}
          onSave={handleSaveResult}
          onClose={() => setResult(null)}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </section>
  );
}
