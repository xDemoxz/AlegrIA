import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePosterState } from './usePosterState';

function setup() {
  return renderHook(() => usePosterState());
}

describe('usePosterState', () => {
  it('agrega una estampita, la selecciona y limita su posición a 4–96%', () => {
    const { result } = setup();
    act(() => result.current.addSticker('st-alegria', 2, -20, 150));
    const [s] = result.current.placedStickers;
    expect(s).toMatchObject({ stickerId: 'st-alegria', variantIndex: 2, xPct: 4, yPct: 96, scale: 1 });
    expect(result.current.selectedUid).toBe(s.uid);
  });

  it('mueve una estampita dentro de los límites', () => {
    const { result } = setup();
    act(() => result.current.addSticker('st-turbo', 0, 50, 50));
    const uid = result.current.placedStickers[0].uid;
    act(() => result.current.moveSticker(uid, 30, 200));
    expect(result.current.placedStickers[0]).toMatchObject({ xPct: 30, yPct: 96 });
  });

  it('cambia el tamaño entre 0.5 y 2', () => {
    const { result } = setup();
    act(() => result.current.addSticker('st-turbo', 0, 50, 50));
    const uid = result.current.placedStickers[0].uid;
    act(() => {
      for (let i = 0; i < 20; i++) result.current.resizeSticker(uid, 0.15);
    });
    expect(result.current.placedStickers[0].scale).toBe(2);
    act(() => {
      for (let i = 0; i < 20; i++) result.current.resizeSticker(uid, -0.15);
    });
    expect(result.current.placedStickers[0].scale).toBe(0.5);
  });

  it('trae al frente y quita estampitas', () => {
    const { result } = setup();
    act(() => {
      result.current.addSticker('a', 0, 10, 10);
      result.current.addSticker('b', 0, 20, 20);
    });
    const [a, b] = result.current.placedStickers;
    act(() => result.current.bringToFront(a.uid));
    expect(result.current.placedStickers.map((s) => s.uid)).toEqual([b.uid, a.uid]);
    act(() => result.current.removeSticker(a.uid));
    expect(result.current.placedStickers.map((s) => s.uid)).toEqual([b.uid]);
    expect(result.current.selectedUid).toBeNull();
  });

  it('reset limpia todo', () => {
    const { result } = setup();
    act(() => {
      result.current.setTitle('Neko');
      result.current.setText('Hola');
      result.current.setBackgroundFromBg('bg-selva');
      result.current.setStickerVariant('st-alegria', 1);
      result.current.addSticker('st-alegria', 1, 50, 50);
    });
    act(() => result.current.reset());
    expect(result.current).toMatchObject({
      title: '',
      text: '',
      activeBackgroundId: null,
      placedStickers: [],
      selectedUid: null,
      stickerVariants: {},
    });
  });
});
