import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  mockPointer(false);
});

// jsdom no trae PointerEvent: sin esto fireEvent.pointerX crea un Event
// genérico sin clientX/clientY.
if (!window.PointerEvent) {
  class PointerEvent extends MouseEvent {
    constructor(type, init = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? 'touch';
      this.isPrimary = init.isPrimary ?? true;
    }
  }
  window.PointerEvent = PointerEvent;
  globalThis.PointerEvent = PointerEvent;
}

/** Simula el tipo de puntero del dispositivo: coarse = teléfono. */
export function mockPointer(coarse) {
  window.matchMedia = vi.fn((query) => ({
    matches: query.includes('pointer: coarse') ? coarse : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }));
}
mockPointer(false);

if (!URL.createObjectURL) URL.createObjectURL = () => 'blob:mock';
if (!URL.revokeObjectURL) URL.revokeObjectURL = () => {};
