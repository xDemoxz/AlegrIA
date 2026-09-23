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
 * Capas: fondo SVG/CSS (BACKGROUNDS, semi-transparente, no protagonista) +
 * estampita PNG protagonista centrada encima. Ambas se eligen por drag &
 * drop con Pointer Events (no HTML5 drag) para compat con mouse/touch/
 * gestureBridge. Cada capa reemplaza solo a su tipo: fondo no borra
 * estampita y viceversa. Orden recomendado en UI: fondo primero (2), luego
 * estampita (3).
 */
export default function Module3Poster() {
  const prev = useAppStore((s) => s.prev);
  const next = useAppStore((s) => s.next);

  const {
    title,
    setTitle,
    text,
    setText,
    activeStickerId,
    activeBackgroundId,
    stickerVariants,
    setBackground,
    setBackgroundFromBg,
    setStickerVariant,
    reset,
  } = usePosterState();

  const canvasRef = useRef(null);
  const [dragState, setDragState] = useState(null); // { type:'sticker'|'bg', id, x, y, variantIndex? } | null
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const handleDragStart = useCallback((type, id, x, y, variantIndex) => {
    setDragState({ type, id, x, y, variantIndex });
  }, []);

  // Un solo listener global de pointer mientras hay un drag activo
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
            if (initialState.type === 'bg') setBackgroundFromBg(initialState.id);
            else setBackground(initialState.id);
          }
        }
        setDragState(null);
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      }

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [setBackground, setBackgroundFromBg]
  );

  const onStickerDragStart = useCallback(
    (stickerId, x, y, variantIndex) => {
      if (variantIndex !== undefined) setStickerVariant(stickerId, variantIndex);
      const initial = { type: 'sticker', id: stickerId, x, y, variantIndex };
      handleDragStart('sticker', stickerId, x, y, variantIndex);
      attachDragListeners(initial);
    },
    [handleDragStart, attachDragListeners, setStickerVariant]
  );

  const onBgDragStart = useCallback(
    (bgId, x, y) => {
      const initial = { type: 'bg', id: bgId, x, y };
      handleDragStart('bg', bgId, x, y);
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

  const handleReset = useCallback(() => {
    reset();
    setToast('Cartel reiniciado');
  }, [reset]);

  return (
    <section className="grid" style={{ gridTemplateColumns: 'minmax(320px, 460px) 1fr', minHeight: '80vh' }}>
      <PosterForm
        title={title}
        onTitleChange={setTitle}
        text={text}
        onTextChange={setText}
        onStickerDragStart={onStickerDragStart}
        onBgDragStart={onBgDragStart}
        onBack={prev}
        onReset={handleReset}
      />
      <PosterPreview
        ref={canvasRef}
        title={title}
        text={text}
        activeStickerId={activeStickerId}
        activeBackgroundId={activeBackgroundId}
        onSave={handleSave}
        saving={saving}
      />

      {/* Ghost del elemento arrastrado (estampita o fondo SVG) */}
      {dragState &&
        (() => {
          if (dragState.type === 'bg') {
            const bg = BACKGROUNDS.find((x) => x.id === dragState.id);
            if (!bg) return null;
            const isFestival = bg.pattern === 'festival';
            return (
              <div
                className={`fixed z-[998] w-20 h-20 rounded-sticker pointer-events-none shadow-soft-lg overflow-hidden flex items-center justify-center border-2 border-white/40 ${isFestival ? 'bg-festival' : ''}`}
                style={{
                  left: dragState.x,
                  top: dragState.y,
                  transform: 'translate(-50%, -50%) rotate(-2deg)',
                  background: isFestival ? undefined : bg.bg,
                  boxShadow: '0 0 0 3px rgba(255,255,255,0.6), 0 14px 32px -8px rgb(18 18 18 / 0.35)',
                }}
              >
                <span className="text-[11px] font-bold text-white px-1 text-center drop-shadow">{bg.label}</span>
              </div>
            );
          }
          const s = STICKERS.find((x) => x.id === dragState.id);
            const variantImg = s?.variants?.[dragState.variantIndex ?? 0]?.image ?? s?.image;
            return (
              <div
                className="fixed z-[998] w-20 h-20 rounded-sticker pointer-events-none bg-white shadow-soft-lg overflow-hidden flex items-center justify-center"
                style={{
                  left: dragState.x,
                  top: dragState.y,
                  transform: 'translate(-50%, -50%) rotate(-2deg)',
                  boxShadow: '0 0 0 3px rgba(255,255,255,0.6), 0 14px 32px -8px rgb(18 18 18 / 0.35)',
                }}
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
