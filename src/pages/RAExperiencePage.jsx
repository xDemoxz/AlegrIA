import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AR_URL } from '../modules/module4-ar/arPieces';

/**
 * RAExperiencePage — ruta /ra. Embebe la experiencia AR publicada desde
 * Mattercraft (ZapWorks) en un iframe a pantalla completa, sin el chasis
 * del sistema de diseño (mismo criterio que /futuro para el Módulo 2).
 *
 * Por qué iframe: Mattercraft compila su propia app (runtime de Zappar,
 * WebAssembly, cámara). Embeberla evita mezclar ese runtime con React y
 * permite seguir editando la experiencia en Mattercraft sin tocar este repo.
 *
 * Permisos: el atributo `allow` delega la cámara (y los sensores / WebXR que
 * usa Zappar) al iframe. Sin `camera` el navegador bloquea getUserMedia
 * dentro del iframe aunque el usuario acepte. Todo debe servirse por HTTPS.
 *
 * Si la URL no está configurada o la experiencia no carga, la página degrada
 * con un mensaje para el visitante y una salida clara; nunca muestra
 * instrucciones de desarrollo ni un spinner infinito.
 *
 * Se monta con createPortal en document.body con el z-index máximo, igual
 * que Experience3D, para que ningún elemento del layout (ej. el botón de
 * gestos) quede por encima.
 */
const IFRAME_ALLOW = [
  'camera',
  'microphone',
  'gyroscope',
  'accelerometer',
  'magnetometer',
  'xr-spatial-tracking',
  'fullscreen',
  'autoplay',
].join('; ');

// El runtime de Zappar necesita scripts + su propio origen (WASM, cámara,
// workers). `allow-same-origin` aquí no da acceso al DOM del padre porque la
// experiencia vive en otro origen; el sandbox solo bloquea navegación top,
// descargas y plugins que la experiencia no usa.
const IFRAME_SANDBOX = [
  'allow-scripts',
  'allow-same-origin',
  'allow-popups',
  'allow-presentation',
  'allow-forms',
].join(' ');

const LOAD_TIMEOUT_MS = 15_000;

export default function RAExperiencePage() {
  const navigate = useNavigate();
  // Vuelve al teaser (/ar), de donde se entra; desde ahí ya se llega al home.
  const handleExit = useCallback(() => navigate('/ar'), [navigate]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Bloquear el scroll del documento mientras la experiencia está abierta.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Sin onLoad no hay forma de saber si el iframe quedó en blanco (CSP,
  // proveedor caído, bloqueo de terceros): un timeout evita el spinner eterno.
  useEffect(() => {
    if (!AR_URL || loaded || failed) return;
    const timer = setTimeout(() => setFailed(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [loaded, failed, attempt]);

  const retry = useCallback(() => {
    setLoaded(false);
    setFailed(false);
    setAttempt((n) => n + 1);
  }, []);

  return createPortal(
    <div
      id="main-content"
      tabIndex={-1}
      className="fixed inset-0 bg-ink outline-none"
      style={{ zIndex: 2147483647 }}
    >
      {AR_URL ? (
        <iframe
          key={attempt}
          title="Recorrido en realidad aumentada — Barrio Abajo"
          src={AR_URL}
          allow={IFRAME_ALLOW}
          sandbox={IFRAME_SANDBOX}
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => {
            setLoaded(true);
            setFailed(false);
          }}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <UnavailableNotice onExit={handleExit} onHome={() => navigate('/')} />
      )}

      {AR_URL && !loaded && !failed && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 text-cream">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cream/20 border-t-yellow" />
          <p className="text-label-sm uppercase tracking-[0.2em] text-cream/70">Cargando recorrido AR…</p>
        </div>
      )}

      {AR_URL && failed && (
        <LoadError
          onRetry={retry}
          onExit={handleExit}
          onOpenExternal={() => window.open(AR_URL, '_blank', 'noopener,noreferrer')}
        />
      )}

      {/* Controles propios de la web, siempre visibles sobre el iframe.
          Botones redondos en las esquinas superiores: abajo chocarían con
          el chip del modelo de la experiencia (ancho completo) y al centro
          con su título. */}
      <button
        type="button"
        onClick={handleExit}
        aria-label="Salir del recorrido AR"
        className="absolute left-3 flex h-11 items-center justify-center gap-1.5 rounded-pill bg-cream px-4 font-display text-lg leading-none tracking-wide text-verde-dark shadow-soft transition-all duration-200 ease-pop hover:-translate-y-0.5 hover:shadow-soft-lg active:translate-y-0 active:shadow-pressed"
        style={{ top: 'max(12px, env(safe-area-inset-top))' }}
      >
        <span aria-hidden="true" className="text-xl">‹</span>
        VOLVER
      </button>
      {AR_URL && !failed && (
        <a
          href={AR_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir el recorrido AR en una pestaña aparte"
          title="Si la cámara no arranca dentro de la página, ábrelo aparte"
          className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-pill bg-ink/70 text-xl text-cream shadow-soft backdrop-blur-sm transition-all duration-200 ease-pop hover:-translate-y-0.5"
          style={{ top: 'max(12px, env(safe-area-inset-top))' }}
        >
          ↗
        </a>
      )}
    </div>,
    document.body
  );
}

function UnavailableNotice({ onExit, onHome }) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-md rounded-sticker bg-cream p-8 text-ink shadow-soft-lg">
        <p className="font-display text-heading-md leading-tight">El recorrido AR no está disponible</p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
          Estamos terminando de publicar esta experiencia. Mientras tanto, puedes seguir
          recorriendo la línea de tiempo del barrio.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onHome}
            className="rounded-pill bg-verde px-5 py-3 font-display text-lg tracking-wide text-cream shadow-soft transition-all duration-200 ease-pop hover:-translate-y-0.5"
          >
            Volver al inicio
          </button>
          <button
            type="button"
            onClick={onExit}
            className="rounded-pill border-4 border-ink px-5 py-2.5 font-display text-lg tracking-wide text-ink"
          >
            Ver el teaser
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadError({ onRetry, onExit, onOpenExternal }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-ink/85 p-6 backdrop-blur-sm">
      <div className="max-w-md rounded-sticker bg-cream p-8 text-ink shadow-soft-lg">
        <p className="font-display text-heading-md leading-tight">No pudimos cargar el recorrido</p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
          Revisa tu conexión e inténtalo de nuevo. Si el problema sigue, abre la experiencia
          en una pestaña aparte.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-pill bg-verde px-5 py-3 font-display text-lg tracking-wide text-cream shadow-soft transition-all duration-200 ease-pop hover:-translate-y-0.5"
          >
            Reintentar
          </button>
          <button
            type="button"
            onClick={onOpenExternal}
            className="rounded-pill border-4 border-ink px-5 py-2.5 font-display text-lg tracking-wide text-ink"
          >
            Abrir en pestaña aparte
          </button>
          <button type="button" onClick={onExit} className="mt-1 text-[13px] font-semibold text-ink/60 underline">
            Volver al teaser
          </button>
        </div>
      </div>
    </div>
  );
}
