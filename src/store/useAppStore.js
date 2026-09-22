import { create } from 'zustand';

/**
 * Máquina de estados global de AlegrIA.
 * Cada compañero conmuta a su módulo llamando a goTo(...) — nadie necesita
 * tocar este archivo para trabajar dentro de su módulo.
 */
/**
 * MOD2_FUTURE ya no es una sección propia del switcher: su teaser vive
 * apilado dentro de MOD1_TIMELINE (ver src/modules/home) y la experiencia
 * 3D completa corre en la ruta standalone /futuro (fuera de este store).
 */
export const SECTION = {
  MOD1_TIMELINE: 'MOD1_TIMELINE',
  MOD3_POSTER: 'MOD3_POSTER',
  MOD4_AR: 'MOD4_AR',
};

const ORDER = [SECTION.MOD1_TIMELINE, SECTION.MOD3_POSTER, SECTION.MOD4_AR];

export const useAppStore = create((set, get) => ({
  /** Módulo activo actualmente renderizado por <App /> */
  section: SECTION.MOD1_TIMELINE,

  /** Flags de progreso transversales (gestos activos, audio, etc.) */
  gestureControlEnabled: false,
  audioEnabled: false,

  /** Ir a un módulo específico */
  goTo: (section) => set({ section }),

  /** Avanzar al siguiente módulo en el flujo (1 → 2 → 3 → 4) */
  next: () => {
    const i = ORDER.indexOf(get().section);
    const nextSection = ORDER[Math.min(i + 1, ORDER.length - 1)];
    set({ section: nextSection });
  },

  /** Retroceder al módulo anterior */
  prev: () => {
    const i = ORDER.indexOf(get().section);
    const prevSection = ORDER[Math.max(i - 1, 0)];
    set({ section: prevSection });
  },

  toggleGestureControl: () => set((s) => ({ gestureControlEnabled: !s.gestureControlEnabled })),
  toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
}));
