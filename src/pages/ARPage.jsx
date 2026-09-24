import { Suspense, lazy } from 'react';
import BaldosaPattern from '../components/motifs/BaldosaPattern';

// Lazy para no meter el peso de AR en el bundle del home.
const Module4AR = lazy(() => import('../modules/module4-ar'));

/**
 * ARPage — ruta /ar. El módulo 4 como página propia, sin switcher por
 * store (el home es composición estática). Nicolás puede vestirla o
 * moverla sin tocar el home.
 */
export default function ARPage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-yellow overflow-x-hidden">
      <BaldosaPattern className="absolute inset-0 pointer-events-none" opacity={0.13} />
      <main className="relative z-[2] flex-1 flex flex-col">
        <Suspense fallback={null}>
          <Module4AR />
        </Suspense>
      </main>
    </div>
  );
}
