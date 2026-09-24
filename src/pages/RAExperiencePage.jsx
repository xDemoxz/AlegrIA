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

export default function RAExperiencePage() {
  const navigate = useNavigate();
  // Vuelve al teaser (/ar), de donde se entra; desde ahí ya se llega al home.
  const handleExit = useCallback(() => navigate('/ar'), [navigate]);
  const [loaded, setLoaded] = useState(false);

  // Bloquear el scroll del documento mientras la experiencia está abierta.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 bg-ink" style={{ zIndex: 2147483647 }}>
      {AR_URL ? (
        <iframe
          title="Recorrido en realidad aumentada — Barrio Abajo"
          src={AR_URL}
          allow={IFRAME_ALLOW}
          allowFullScreen
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <MissingUrlNotice />
      )}

      {AR_URL && !loaded && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 text-cream">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cream/20 border-t-yellow" />
          <p className="text-label-sm uppercase tracking-[0.2em] text-cream/70">Cargando recorrido AR…</p>
        </div>
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
      {AR_URL && (
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

function MissingUrlNotice() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-md rounded-sticker bg-cream p-8 text-ink shadow-soft-lg">
        <p className="font-display text-heading-md leading-tight">Falta la URL del recorrido AR</p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
          Publica el proyecto desde Mattercraft y pega el link en un archivo <code>.env</code> en
          la raíz del repo:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-badge bg-ink px-4 py-3 text-[13px] text-yellow">
          VITE_AR_URL=https://…
        </pre>
        <p className="mt-3 text-[13px] text-ink/60">Luego reinicia <code>npm run dev</code>.</p>
      </div>
    </div>
  );
}
