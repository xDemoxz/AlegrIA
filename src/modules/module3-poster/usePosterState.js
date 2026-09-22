import { useState, useCallback } from 'react';

/**
 * Estado local del generador de carteles/murales (Módulo 3). Vive fuera del
 * store global (useAppStore) a propósito: es efímero al módulo, nadie más
 * lo necesita.
 *
 * activeStickerId: id de la estampita que define el fondo del cartel en
 * este momento, o null si todavía no se soltó ninguna. A propósito NO se
 * guarda posición ni un historial de estampitas puestas — cada una que se
 * suelta reemplaza por completo el fondo anterior, nada queda superpuesto
 * en el cartel. Esto deja la puerta abierta a la fase futura de "murales":
 * cada estampita podrá representar un lugar real de Barrio Abajo y, al
 * soltarla, el cartel pasa a ambientarse en ese lugar.
 */
export function usePosterState() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [activeStickerId, setActiveStickerId] = useState(null);

  const setBackground = useCallback((stickerId) => {
    setActiveStickerId(stickerId);
  }, []);

  const clearBackground = useCallback(() => {
    setActiveStickerId(null);
  }, []);

  const reset = useCallback(() => {
    setTitle('');
    setText('');
    setActiveStickerId(null);
  }, []);

  return {
    title,
    setTitle,
    text,
    setText,
    activeStickerId,
    setBackground,
    clearBackground,
    reset,
  };
}
