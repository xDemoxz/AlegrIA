import { Suspense, lazy, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BaldosaPattern from '../components/motifs/BaldosaPattern';

// Lazy para no meter el peso de AR en el bundle del home.
const Module4AR = lazy(() => import('../modules/module4-ar'));

/**
 * ARPage — ruta /ar. El módulo 4 como página propia, sin switcher por
 * store (el home es composición estática). Nicolás puede vestirla o
 * moverla sin tocar el home. Sin header ni nav, así que el "Volver" del
 * teaser es la única salida: regresa al home.
 */
export default function ARPage() {
  const navigate = useNavigate();
  const handleBack = useCallback(() => navigate('/'), [navigate]);

  return (
    <div className="relative flex flex-col min-h-screen bg-yellow overflow-x-hidden">
      <BaldosaPattern className="absolute inset-0 pointer-events-none" opacity={0.13} />
      <main className="relative z-[2] flex-1 flex flex-col">
        <Suspense fallback={null}>
          <Module4AR onBack={handleBack} />
        </Suspense>
      </main>
    </div>
  );
}
