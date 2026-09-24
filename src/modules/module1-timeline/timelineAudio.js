/**
 * Controlador de audio de fondo para el Módulo 1 (Línea de Tiempo).
 * Gestiona la reproducción en bucle de "Totó La Momposina - El Pescador.mp3",
 * con transiciones de volumen (fade in / fade out), manejo de restricciones de
 * autoplay del navegador, pausa al salir de la pestaña y aislamiento estricto
 * fuera del módulo.
 */

const AUDIO_PATH = encodeURI(
  `${import.meta.env.BASE_URL}audios/Totó La Momposina - El Pescador.mp3`
);

const TARGET_VOLUME = 0.38;
const FADE_INTERVAL_MS = 30;
const FADE_STEP = 0.04;

export function createTimelineAudio() {
  let audio = null;
  let isActive = false;
  let isMuted = false;
  let isPlaying = false;
  let fadeTimer = null;
  let waitingForInteraction = false;
  const listeners = new Set();

  function notify() {
    listeners.forEach((fn) => {
      try {
        fn({ isPlaying, isMuted, isActive });
      } catch (e) {
        console.error('[TimelineAudio] Error in listener callback:', e);
      }
    });
  }

  function initAudio() {
    if (audio) return audio;
    audio = new Audio(AUDIO_PATH);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;

    audio.addEventListener('play', () => {
      isPlaying = true;
      notify();
    });

    audio.addEventListener('pause', () => {
      isPlaying = false;
      notify();
    });

    audio.addEventListener('ended', () => {
      // Loop backup en caso de que el navegador no cicle el flag nativo
      if (isActive && !isMuted) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    });

    return audio;
  }

  function clearFade() {
    if (fadeTimer) {
      clearInterval(fadeTimer);
      fadeTimer = null;
    }
  }

  function fadeIn() {
    clearFade();
    if (!audio) return;
    const target = isMuted ? 0 : TARGET_VOLUME;
    fadeTimer = setInterval(() => {
      if (!audio) {
        clearFade();
        return;
      }
      if (audio.volume < target - FADE_STEP) {
        audio.volume = Math.min(target, audio.volume + FADE_STEP);
      } else {
        audio.volume = target;
        clearFade();
      }
    }, FADE_INTERVAL_MS);
  }

  function fadeOut(callback) {
    clearFade();
    if (!audio) {
      callback?.();
      return;
    }
    fadeTimer = setInterval(() => {
      if (!audio) {
        clearFade();
        callback?.();
        return;
      }
      if (audio.volume > FADE_STEP) {
        audio.volume = Math.max(0, audio.volume - FADE_STEP);
      } else {
        audio.volume = 0;
        clearFade();
        callback?.();
      }
    }, FADE_INTERVAL_MS);
  }

  function attemptPlay() {
    if (!audio) initAudio();
    if (!isActive || isMuted) return;

    audio
      .play()
      .then(() => {
        waitingForInteraction = false;
        fadeIn();
      })
      .catch((err) => {
        // Autoplay policy bloqueó la reproducción automática
        if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
          waitingForInteraction = true;
          attachInteractionUnlock();
        }
      });
  }

  function onUserInteraction() {
    detachInteractionUnlock();
    if (isActive && !isMuted) {
      attemptPlay();
    }
  }

  function attachInteractionUnlock() {
    const opts = { once: true, passive: true };
    window.addEventListener('pointerdown', onUserInteraction, opts);
    window.addEventListener('scroll', onUserInteraction, opts);
    window.addEventListener('touchstart', onUserInteraction, opts);
    window.addEventListener('keydown', onUserInteraction, opts);
  }

  function detachInteractionUnlock() {
    window.removeEventListener('pointerdown', onUserInteraction);
    window.removeEventListener('scroll', onUserInteraction);
    window.removeEventListener('touchstart', onUserInteraction);
    window.removeEventListener('keydown', onUserInteraction);
    waitingForInteraction = false;
  }

  function onVisibilityChange() {
    if (document.hidden) {
      if (audio && !audio.paused) {
        fadeOut(() => audio?.pause());
      }
    } else {
      if (isActive && !isMuted) {
        attemptPlay();
      }
    }
  }

  document.addEventListener('visibilitychange', onVisibilityChange);

  return {
    setActive(active) {
      if (isActive === active) return;
      isActive = active;
      notify();

      if (isActive) {
        attemptPlay();
      } else {
        fadeOut(() => {
          if (!isActive && audio) {
            audio.pause();
          }
        });
      }
    },

    toggleMute() {
      isMuted = !isMuted;
      notify();

      if (isMuted) {
        fadeOut(() => {
          if (audio) audio.volume = 0;
        });
      } else {
        if (isActive) {
          attemptPlay();
        }
      }
      return isMuted;
    },

    isMuted() {
      return isMuted;
    },

    isPlaying() {
      return isPlaying;
    },

    isActive() {
      return isActive;
    },

    subscribe(fn) {
      listeners.add(fn);
      fn({ isPlaying, isMuted, isActive });
      return () => listeners.delete(fn);
    },

    dispose() {
      clearFade();
      detachInteractionUnlock();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      listeners.clear();

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
        audio = null;
      }
      isActive = false;
      isPlaying = false;
    },
  };
}
