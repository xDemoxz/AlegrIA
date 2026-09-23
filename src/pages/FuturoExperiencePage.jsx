import { lazy, Suspense, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Lazy-load para no meter Three.js en el bundle del home.
const Experience3D = lazy(() => import('../modules/module2-future/Experience3D'));

/**
 * FuturoExperiencePage — ruta /futuro. Aquí SOLO vive la experiencia 3D del
 * Módulo 2 (biblioteca → vórtice → museo): sin HeaderBanner/MarqueeStrip/
 * ModuleNav/FooterBajero del chasis principal, para que nada del sistema de
 * diseño compita visualmente con el WebGL a pantalla completa.
 *
 * El teaser con la info + botón "Iniciar experiencia 3D" vive en el home
 * (src/modules/home), debajo de la línea de tiempo; ese botón navega aquí.
 * Experience3D ya se auto-monta a pantalla completa vía createPortal, así
 * que este componente solo necesita darle un onExit que regrese al home.
 */
export default function FuturoExperiencePage() {
  const navigate = useNavigate();
  const handleExit = useCallback(() => navigate('/'), [navigate]);

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-[#06040a]">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#c9a86a]/30 border-t-[#ffcc33]" />
            <p className="mt-4 text-sm tracking-[0.2em] uppercase text-[#f5e6c8]/60" style={{ fontFamily: "'Cinzel', serif" }}>
              Cargando experiencia…
            </p>
          </div>
        </div>
      }
    >
      <Experience3D onExit={handleExit} />
    </Suspense>
  );
}
