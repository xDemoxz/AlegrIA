import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Chip from '../../components/controls/Chip';
import PopButton from '../../components/controls/PopButton';
import { AR_PIECES } from './arPieces';

/**
 * MÓDULO 4 — Realidad Aumentada (Nicolás) — teaser
 * ------------------------------------------------------------------
 * La experiencia AR se construye en Mattercraft (Zappar, image tracking
 * con 9 targets) y se publica en ZapWorks. Aquí solo vive la invitación;
 * el botón navega a la ruta standalone /ra (src/pages/RAExperiencePage.jsx),
 * que embebe la experiencia publicada en un iframe a pantalla completa,
 * igual que el Módulo 2 enlaza a su build deployada en GitHub Pages.
 *
 * Así el runtime de Zappar (cámara + WebAssembly) no se carga en el home.
 */
export default function Module4AR({ onBack } = {}) {
  const navigate = useNavigate();
  const handleLaunch = useCallback(() => navigate('/ra'), [navigate]);

  return (
    <section className="max-w-[1240px] mx-auto px-6 pt-12 pb-16">
      {onBack && (
        <PopButton variant="primary" className="!text-lg mb-5" onClick={onBack}>
          ‹ VOLVER
        </PopButton>
      )}
      <div className="relative overflow-hidden rounded-sticker bg-ink text-cream shadow-soft-lg">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-3 bg-baldosa" />

        <div className="grid gap-10 px-6 py-12 md:grid-cols-[1.1fr_1fr] md:px-12 md:py-16">
          <div className="flex flex-col gap-5">
            <Chip tone="red" className="self-start">
              Módulo 4 · Realidad aumentada
            </Chip>

            <h2 className="font-display text-display-lg leading-none tracking-wide">
              El barrio <span className="text-yellow">cobra vida</span> en tu celular
            </h2>

            <p className="text-body-lg text-cream/80 max-w-[52ch]">
              Apunta la cámara a los murales y afiches del recorrido por Barrio Abajo.
              Cada imagen despierta una pieza de su memoria en 3D, con su historia.
            </p>

            <ol className="flex flex-col gap-2 text-[15px] text-cream/75">
              <li><span className="font-display text-xl text-yellow mr-2">1</span>Toca «Iniciar recorrido AR» y acepta el permiso de cámara.</li>
              <li><span className="font-display text-xl text-yellow mr-2">2</span>Encuadra un mural o afiche del recorrido.</li>
              <li><span className="font-display text-xl text-yellow mr-2">3</span>Toca la pieza para leer su historia.</li>
            </ol>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <PopButton onClick={handleLaunch}>Iniciar recorrido AR</PopButton>
              <span className="text-label-sm uppercase text-cream/50">
                Mejor desde el celular · Requiere cámara
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-label-sm uppercase text-yellow">Piezas del recorrido</p>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {AR_PIECES.map((piece, i) => (
                <li
                  key={piece.id}
                  className="flex items-center gap-3 rounded-badge bg-cream/[0.06] px-4 py-3"
                >
                  <span className="font-display text-2xl leading-none text-yellow tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[15px] font-semibold">{piece.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
