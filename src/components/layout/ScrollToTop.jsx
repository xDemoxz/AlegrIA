import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop — al cambiar de ruta vuelve al inicio de la página.
 *
 * Sin esto, entrar a /poster o /ar desde el footer conservaba el scroll del
 * home y la nueva página aparecía a media altura. No actúa cuando la URL
 * solo cambia de hash (el enlace de salto al contenido).
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
