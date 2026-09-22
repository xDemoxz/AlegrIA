import { useCallback, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { usePosterState } from './usePosterState';
import PosterForm from './PosterForm';
import PosterPreview from './PosterPreview';
import Toast from '../../components/feedback/Toast';
import { exportPosterToPng } from './exportPoster';
import { STICKERS } from './data/stickers';

/**
 * MÓDULO 3 — Generador de Pósters / Murales (José Romero)
 * ------------------------------------------------------------------
 * Estampitas: src/modules/module3-poster/data/stickers.js (placeholders de
 * color — reemplazar `bg`/`pattern` por `image` cuando lleguen las
 * ilustraciones reales).
 *
 * Arrastre: NO usa HTML5 drag nativo — usa Pointer Events a propósito, para
 * que el mismo código funcione con mouse, touch Y con los gestos de tu
 * compañero (ver src/lib/gestureBridge.js). No hace falta tocar este
 * archivo para conectar su sistema: el bridge ya traduce sus eventos a
 * pointerdown/pointermove/pointerup reales sobre estos mismos elementos.
 *
 * Modelo de "fondo, no pegatina": al soltar una estampita sobre el cartel
 * NO queda un ícono fijo en esa posición — la estampita reemplaza por
 * completo el fondo del cartel (color + patrón, ver PosterPreview). Solo
 * importa cuál fue la última que soltaste; por eso solo se necesita
 * rastrear el punto donde sueltas (para saber si cayó dentro del canvas),
 * no una posición que guardar.
 *
 * Flujo: al guardar el cartel se exporta a PNG (html2canvas) y se avanza al
 * Módulo 4 automáticamente.
 *
 * Próxima fase (pendiente, no implementada aquí): concepto de "murales" —
 * cada estampita representaría un lugar real de Barrio Abajo en vez de un
 * tema genérico. Necesita el fondo/mapa del barrio y las fotos/ilustraciones
 * de cada lugar antes de poder implementarse; el modelo de estado ya quedó
 * preparado para ese cambio (una sola estampita "activa" define el fondo).
 */
export default function Module3Poster() {
  const prev = useAppStore((s) => s.prev);
  const next = useAppStore((s) => s.next);

  const { title, setTitle, text, setText, activeStickerId, setBackground, reset } =
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
            // Soltar dentro del canvas reemplaza el fondo — no se guarda
            // posición, la estampita no queda como ícono en el cartel.
            setBackground(initialState.stickerId);
          }
        }
        setDragState(null);
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      }

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [setBackground]
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

  const handleReset = useCallback(() => {
    reset();
    setToast('Cartel reiniciado');
  }, [reset]);

  return (
    <section className="grid pt-8" style={{ gridTemplateColumns: 'minmax(320px, 460px) 1fr', minHeight: '80vh' }}>
      <PosterForm
        title={title}
        onTitleChange={setTitle}
        text={text}
        onTextChange={setText}
        onStickerDragStart={onStickerDragStart}
        onBack={prev}
        onReset={handleReset}
      />
      <PosterPreview
        ref={canvasRef}
        title={title}
        text={text}
        activeStickerId={activeStickerId}
        onSave={handleSave}
        saving={saving}
      />

      {/* Ghost de la estampita siguiendo el cursor (mouse/touch/gesto) mientras se arrastra */}
      {dragState && (
        <div
          className="fixed z-[998] w-16 h-20 rounded-badge pointer-events-none opacity-90"
          style={{
            left: dragState.x,
            top: dragState.y,
            transform: 'translate(-50%, -50%) rotate(-2deg)',
            background:
              STICKERS.find((s) => s.id === dragState.stickerId)?.bg ?? '#1DB3E7',
            boxShadow: '0 0 0 3px rgba(255,255,255,0.6), 0 14px 32px -8px rgb(18 18 18 / 0.35)',
          }}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </section>
  );
}
