import { useEffect, useRef, useState } from 'react';
import { IoVolumeHigh, IoVolumeMute } from 'react-icons/io5';
import { timelineHitos } from '../../data/timelineHitos';
import { initTimelineExperience } from './engine';
import { createTimelineAudio } from './timelineAudio';
import './Timeline.css';

export default function Module1Timeline() {
  const containerRef = useRef(null);
  const audioControllerRef = useRef(null);
  const [audioState, setAudioState] = useState({ isPlaying: false, isMuted: false, isActive: false });

  // Ciclo de vida del audio acotado al Módulo 1:
  // Al desmontar (p. ej. navegar a /poster o /ar), el audio se detiene y destruye de inmediato.
  useEffect(() => {
    const controller = createTimelineAudio();
    audioControllerRef.current = controller;
    const unsub = controller.subscribe(setAudioState);

    return () => {
      unsub();
      controller.dispose();
      audioControllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const engineOptions = {
      onActiveChange: (active) => {
        audioControllerRef.current?.setActive(active);
      },
    };

    // Boot (re-ejecutable): monta la experiencia sobre geometría fresca.
    let cleanup = initTimelineExperience(root, timelineHitos, engineOptions);

    // Curación de geometría: si el viewport o el layout cambiaron desde el
    // boot (nacimiento de pestaña, settle de ventana, resize sin evento
    // fiable), las calibraciones de triggers quedan rancias → remontar
    // desde cero restaurando la misma fracción de recorrido.
    const geomNow = () => ({ w: window.innerWidth, sw: root.querySelector('#timeline-track')?.scrollWidth ?? 0 });
    let geomBoot = cleanup?.getGeom?.() ?? geomNow();
    const healIfDrifted = () => {
      const live = geomNow();
      const drifted =
        Math.abs(live.w - geomBoot.w) > 2 ||
        Math.abs(live.sw - geomBoot.sw) > 2;
      if (!drifted) return false;
      const p = cleanup?.getST?.()?.progress ?? 0;
      cleanup?.();
      cleanup = initTimelineExperience(root, timelineHitos, engineOptions);
      geomBoot = cleanup?.getGeom?.() ?? geomNow();
      const nst = cleanup?.getST?.();
      if (nst) window.scrollTo(0, nst.start + (nst.end - nst.start) * p);
      return true;
    };

    // Recalibración garantizada post-settle: la creación inicial pudo medir
    // geometría transitoria y los triggers de container no se curan con
    // refresh. Remontar una vez con geometría final (misma fracción).
    let healed = false;
    const stableTimer = setTimeout(() => {
      if (healed) return;
      healed = true;
      const st = cleanup?.getST?.();
      const p = st ? st.progress : 0;
      cleanup?.();
      cleanup = initTimelineExperience(root, timelineHitos, engineOptions);
      const nst = cleanup?.getST?.();
      if (nst) window.scrollTo(0, nst.start + (nst.end - nst.start) * p);
    }, 2500);

    // Si el ancho del viewport cambia, todas las calibraciones vw del pin,
    // shift y triggers quedan rancias: desmontar y remontar desde cero
    // restaurando la misma fracción de recorrido (no el scroll absoluto).
    let lastW = window.innerWidth;
    let timer = null;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (Math.abs(window.innerWidth - lastW) < 2) return;
        lastW = window.innerWidth;
        healIfDrifted();
      }, 400);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timer);
      clearTimeout(stableTimer);
      cleanup?.();
    };
  }, []);

  return (
    <div ref={containerRef} className="timeline-module-root relative w-full">
      {/* 1. Canvas WebGL Túnel 3D & Efectos Cinematográficos */}
      <canvas id="tunnel-canvas" aria-hidden="true" />
      <div id="speed" aria-hidden="true" />
      <div id="grain" aria-hidden="true" />

      {/* 2. HUD Superior (contador + año en fullview y botón de música) */}
      <header id="hud">
        <div className="hud-right">
          <button
            type="button"
            className="hud-audio-btn pointer-events-auto"
            onClick={() => audioControllerRef.current?.toggleMute()}
            title={audioState.isMuted ? 'Activar música' : 'Silenciar música'}
            aria-label={audioState.isMuted ? 'Activar música de fondo' : 'Silenciar música de fondo'}
          >
            {audioState.isMuted ? (
              <IoVolumeMute className="hud-audio-icon text-white/70" />
            ) : (
              <IoVolumeHigh className="hud-audio-icon text-yellow" />
            )}
            <span className="hud-audio-label">
              {audioState.isMuted ? 'Mudo' : 'Música'}
            </span>
          </button>
          <span id="hud-year" aria-hidden="true">Línea</span>
        </div>
      </header>

      {/* Card de fullview: overlay fijo al viewport con la misma piel
          .info-card. La card dentro del stage-frame viaja con el track y
          quedaba truncada en hitos pares. Contenido por era vía engine;
          visible solo en fullview. */}
      <aside id="fullview-card" className="info-card" aria-hidden="true" />

      {/* 3. Contenedor pineado: el scroll vertical desplaza el track en horizontal */}
      <section className="timeline-wrapper">
        <div className="timeline-track" id="timeline-track">
          {/* Rail físico dentro del track: viaja sincronizado */}
          <div className="rail-line" aria-hidden="true">
            <div className="rail-progress" id="rail-progress" />
          </div>

          {/* Panel 0: overview inicial con todas las polaroids en el eje */}
          <section className="overview" id="overview" aria-label="Línea de tiempo general" />

          {/* Transición de riel entre el overview y el primer hito */}
          <div className="gap-stage" aria-hidden="true">
            <span>↓ la corriente sigue</span>
          </div>

          {/* Hitos generados dinámicamente con sus polaroids, shaders e info-cards */}
          <div id="track-nodes" />

          {/* Tramo final vacío: da aire para que 2026 comprima el túnel y
              vuelva a polaroid antes de ceder al footer */}
          <div className="end-cap" aria-hidden="true" />
        </div>
      </section>

      {/* 4. Progreso inferior + dots por época */}
      <nav id="progress" aria-label="Progreso de la línea de tiempo">
        <div id="progress-bar">
          <div id="progress-fill" />
        </div>
        <div id="dots" />
      </nav>
    </div>
  );
}
