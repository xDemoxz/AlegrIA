/**
 * gestureBridge — puente genérico entre CUALQUIER sistema de reconocimiento
 * de gestos (MediaPipe Hands, u otro) y la interfaz de AlegrIA.
 *
 * ¿Por qué así? Aún no está definida la librería/API final de tu compañero,
 * así que en vez de acoplarnos a una implementación concreta, exponemos un
 * contrato de eventos mínimo y estable. Cuando su sistema esté listo, SOLO
 * necesita emitir estos 3 tipos de evento — no le compartimos ninguna
 * lógica interna del póster ni de React.
 *
 * ── CONTRATO (lo que el sistema de gestos debe disparar) ──────────────────
 *
 *   window.dispatchEvent(new CustomEvent('alegria:gesture', {
 *     detail: { type: 'move',    x: <px>, y: <px> }         // cursor virtual se mueve
 *   }));
 *   window.dispatchEvent(new CustomEvent('alegria:gesture', {
 *     detail: { type: 'pinch-start', x: <px>, y: <px> }     // "click down" (ej. pellizco)
 *   }));
 *   window.dispatchEvent(new CustomEvent('alegria:gesture', {
 *     detail: { type: 'pinch-end', x: <px>, y: <px> }       // "click up" / soltar
 *   }));
 *
 *   x, y son coordenadas en PÍXELES DE PANTALLA (mismo sistema que
 *   MouseEvent.clientX/clientY) — si su sistema entrega coordenadas
 *   normalizadas (0–1), conviértelas antes: x = norm_x * window.innerWidth.
 *
 * ── QUÉ HACE ESTE MÓDULO CON ESO ───────────────────────────────────────────
 *  - Dibuja un cursor virtual (ver <GestureCursor />) que sigue 'move'.
 *  - Traduce pinch-start/move/pinch-end en PointerEvents reales
 *    (pointerdown/pointermove/pointerup) despachados sobre el elemento que
 *    esté bajo esas coordenadas — así cualquier componente que ya escuche
 *    eventos de puntero (como el drag & drop de estampitas) funciona igual
 *    con mouse, touch o gestos, sin código especial por caso.
 *
 * Mientras el sistema real no exista, se puede probar todo el flujo desde
 * la consola del navegador simulando el mismo contrato, p. ej.:
 *   window.dispatchEvent(new CustomEvent('alegria:gesture', { detail:{type:'move', x:400, y:300} }))
 */

const EVENT_NAME = 'alegria:gesture';
const POINTER_ID = 9001; // id reservado para gestos, no colisiona con mouse/touch reales

function dispatchSyntheticPointer(type, x, y, extra = {}) {
  const el = document.elementFromPoint(x, y);
  if (!el) return;
  const event = new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    pointerId: POINTER_ID,
    pointerType: 'pen', // distinguible de 'mouse'/'touch' si algún componente necesita filtrar
    isPrimary: true,
    ...extra,
  });
  el.dispatchEvent(event);
}

/**
 * Activa el puente: empieza a escuchar 'alegria:gesture' y a traducir a
 * PointerEvents + notificar la posición del cursor virtual.
 * @param {(pos: {x:number, y:number, active:boolean}) => void} onCursorMove
 * @returns {() => void} función de limpieza (quitar listeners)
 */
export function enableGestureBridge(onCursorMove) {
  let dragging = false;

  function handleGesture(e) {
    const { type, x, y } = e.detail || {};
    if (typeof x !== 'number' || typeof y !== 'number') return;

    switch (type) {
      case 'move':
        if (dragging) dispatchSyntheticPointer('pointermove', x, y);
        onCursorMove?.({ x, y, active: dragging });
        break;
      case 'pinch-start':
        dragging = true;
        dispatchSyntheticPointer('pointerdown', x, y);
        onCursorMove?.({ x, y, active: true });
        break;
      case 'pinch-end':
        dispatchSyntheticPointer('pointerup', x, y);
        dragging = false;
        onCursorMove?.({ x, y, active: false });
        break;
      default:
        break;
    }
  }

  window.addEventListener(EVENT_NAME, handleGesture);
  return () => window.removeEventListener(EVENT_NAME, handleGesture);
}

/** Utilidad de prueba: simula el contrato sin depender del sistema real. */
export function simulateGesture(type, x, y) {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { type, x, y } }));
}
