import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Module3Poster from '../modules/module3-poster';
import GestureCursor from '../components/controls/GestureCursor';
import BaldosaPattern from '../components/motifs/BaldosaPattern';

/**
 * PosterPage — ruta /poster. El generador de carteles como página propia,
 * sin switcher por store (el home es composición estática). El botón
 * "volver" del póster regresa al home. GestureCursor se monta aquí porque
 * el drag por Pointer Events + gestureBridge lo necesita en esta página.
 */
export default function PosterPage() {
  const navigate = useNavigate();
  const handleBack = useCallback(() => navigate('/'), [navigate]);

  return (
    <div className="relative flex flex-col min-h-screen bg-yellow overflow-x-hidden">
      <BaldosaPattern className="absolute inset-0 pointer-events-none" opacity={0.13} />
      <main className="relative z-[2] flex-1 flex flex-col">
        <Module3Poster onBack={handleBack} />
      </main>
      <GestureCursor enabled />
    </div>
  );
}
