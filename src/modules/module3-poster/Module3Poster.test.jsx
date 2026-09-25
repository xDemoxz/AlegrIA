import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react';
import { mockPointer } from '../../test/setup';

vi.mock('./exportPoster', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    renderPosterToBlob: vi.fn(async () => new Blob(['png'], { type: 'image/png' })),
    downloadBlob: vi.fn(),
    savePosterBlob: vi.fn(async () => 'downloaded'),
  };
});

import Module3Poster from './index';
import { renderPosterToBlob, downloadBlob, savePosterBlob } from './exportPoster';

// Cartel de 200×400 en (0,0); la galería queda "debajo" (y = 600).
const CANVAS = { left: 0, top: 0, right: 200, bottom: 400, width: 200, height: 400, x: 0, y: 0 };
const GALLERY_Y = 600;

function setup() {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    if (this.hasAttribute('data-poster-canvas')) return CANVAS;
    return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 };
  });
  return render(<Module3Poster onBack={vi.fn()} />);
}

const canvas = () => screen.getByTestId('poster-canvas');
const placed = () => screen.queryAllByTestId('placed-sticker');

function tap(el, x = 10, y = GALLERY_Y) {
  fireEvent.pointerDown(el, { clientX: x, clientY: y });
  fireEvent.pointerUp(window, { clientX: x, clientY: y });
}

function drag(el, from, to) {
  fireEvent.pointerDown(el, { clientX: from[0], clientY: from[1] });
  fireEvent.pointerMove(window, { clientX: (from[0] + to[0]) / 2, clientY: (from[1] + to[1]) / 2 });
  fireEvent.pointerMove(window, { clientX: to[0], clientY: to[1] });
  fireEvent.pointerUp(window, { clientX: to[0], clientY: to[1] });
}

beforeEach(() => {
  vi.mocked(renderPosterToBlob).mockClear();
  vi.mocked(downloadBlob).mockClear();
  vi.mocked(savePosterBlob).mockClear();
});

describe('Módulo 3 — tocar para agregar (móvil)', () => {
  it('tocar un fondo lo aplica al cartel', () => {
    setup();
    expect(screen.queryByTestId('poster-bg')).toBeNull();
    tap(screen.getByLabelText('Fondo Selva'));
    expect(screen.getByTestId('poster-bg')).toHaveAttribute('src', '/assets/fondos/selva-tropical.webp');
    tap(screen.getByLabelText('Fondo Neón'));
    expect(screen.getByTestId('poster-bg')).toHaveAttribute('src', '/assets/fondos/neon-festival.webp');
  });

  it('tocar una estampita la agrega; tocarla otra vez agrega otra corrida', () => {
    setup();
    tap(screen.getByLabelText('Estampita Turbo'));
    tap(screen.getByLabelText('Estampita Turbo'));
    const [a, b] = placed();
    expect(placed()).toHaveLength(2);
    expect(a.dataset.stickerId).toBe('st-turbo');
    expect(a.style.left).not.toBe(b.style.left);
  });

  it('el punto de color elige la variante sin agregar estampita', () => {
    setup();
    const alegria = screen.getByLabelText('Estampita Alegría').parentElement;
    fireEvent.click(within(alegria).getByLabelText('Color Azul'));
    expect(within(alegria).getByLabelText('Color Azul')).toHaveAttribute('aria-pressed', 'true');
    expect(placed()).toHaveLength(0);
    tap(screen.getByLabelText('Estampita Alegría'));
    expect(within(placed()[0]).getByRole('img')).toHaveAttribute('src', '/assets/iconos/01-alegria-3.png');
  });

  it('un gesto cancelado (scroll de la tira) no agrega nada ni deja fantasma', () => {
    setup();
    const tile = screen.getByLabelText('Estampita Turbo');
    fireEvent.pointerDown(tile, { clientX: 10, clientY: GALLERY_Y });
    fireEvent.pointerMove(window, { clientX: 60, clientY: GALLERY_Y });
    expect(screen.getByTestId('drag-ghost')).toBeInTheDocument();
    fireEvent.pointerCancel(window);
    expect(screen.queryByTestId('drag-ghost')).toBeNull();
    fireEvent.pointerUp(window, { clientX: 100, clientY: 200 });
    expect(placed()).toHaveLength(0);
  });

  it('un toque no muestra el fantasma de arrastre', () => {
    setup();
    const tile = screen.getByLabelText('Estampita Turbo');
    fireEvent.pointerDown(tile, { clientX: 10, clientY: GALLERY_Y });
    fireEvent.pointerMove(window, { clientX: 13, clientY: GALLERY_Y + 2 });
    expect(screen.queryByTestId('drag-ghost')).toBeNull();
  });
});

describe('Módulo 3 — arrastrar', () => {
  it('arrastrar una estampita al cartel la deja donde se suelta', () => {
    setup();
    drag(screen.getByLabelText('Estampita Raspao'), [10, GALLERY_Y], [100, 100]);
    const [s] = placed();
    expect(s.style.left).toBe('50%');
    expect(s.style.top).toBe('25%');
    expect(screen.queryByTestId('drag-ghost')).toBeNull();
  });

  it('soltar fuera del cartel no agrega nada', () => {
    setup();
    drag(screen.getByLabelText('Estampita Raspao'), [10, GALLERY_Y], [300, 500]);
    expect(placed()).toHaveLength(0);
  });

  it('arrastrar un fondo al cartel lo aplica', () => {
    setup();
    drag(screen.getByLabelText('Fondo Carnaval'), [10, GALLERY_Y], [50, 300]);
    expect(screen.getByTestId('poster-bg')).toHaveAttribute('src', '/assets/fondos/carnaval-amarillo.webp');
  });

  it('una estampita colocada se mueve con el dedo', () => {
    setup();
    drag(screen.getByLabelText('Estampita Raspao'), [10, GALLERY_Y], [100, 200]);
    const s = placed()[0];
    fireEvent.pointerDown(s, { clientX: 100, clientY: 200 });
    fireEvent.pointerMove(window, { clientX: 40, clientY: 300 });
    fireEvent.pointerUp(window, { clientX: 40, clientY: 300 });
    expect(placed()[0].style.left).toBe('20%');
    expect(placed()[0].style.top).toBe('75%');
  });

  it('controles −/+/✕ de la estampita seleccionada', () => {
    setup();
    tap(screen.getByLabelText('Estampita Turbo'));
    expect(placed()[0].style.width).toBe('30%');
    fireEvent.click(screen.getByLabelText('Agrandar estampita'));
    expect(parseFloat(placed()[0].style.width)).toBeCloseTo(34.5);
    fireEvent.click(screen.getByLabelText('Reducir estampita'));
    fireEvent.click(screen.getByLabelText('Reducir estampita'));
    expect(parseFloat(placed()[0].style.width)).toBeCloseTo(25.5);
    fireEvent.click(screen.getByLabelText('Quitar estampita'));
    expect(placed()).toHaveLength(0);
  });

  it('tocar el cartel fuera de una estampita la deselecciona', () => {
    setup();
    tap(screen.getByLabelText('Estampita Turbo'));
    expect(screen.getByLabelText('Quitar estampita')).toBeInTheDocument();
    fireEvent.pointerDown(canvas(), { clientX: 5, clientY: 5 });
    expect(screen.queryByLabelText('Quitar estampita')).toBeNull();
  });
});

describe('Módulo 3 — guardar la imagen', () => {
  it('en escritorio descarga directo con nombre del título', async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/Nombre de tu cartel/), { target: { value: 'Carnaval 2026' } });
    fireEvent.click(screen.getByRole('button', { name: /guarda tu cartel/i }));
    await waitFor(() => expect(downloadBlob).toHaveBeenCalled());
    expect(renderPosterToBlob).toHaveBeenCalledWith(canvas());
    expect(downloadBlob.mock.calls[0][1]).toBe('carnaval-2026-alegria.png');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(await screen.findByText('Cartel guardado ✓')).toBeInTheDocument();
  });

  it('en móvil muestra la hoja con la imagen y guarda con un segundo toque', async () => {
    mockPointer(true);
    setup();
    tap(screen.getByLabelText('Estampita Turbo'));
    fireEvent.click(screen.getByRole('button', { name: /guarda tu cartel/i }));

    const dialog = await screen.findByRole('dialog', { name: /tu cartel está listo/i });
    // Los controles de edición se ocultan antes de capturar.
    expect(screen.queryByLabelText('Quitar estampita')).toBeNull();
    expect(downloadBlob).not.toHaveBeenCalled();
    expect(within(dialog).getByAltText('Vista previa de tu cartel')).toHaveAttribute('src');

    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: /guardar en mi celular/i }));
    });
    expect(savePosterBlob).toHaveBeenCalledWith(expect.any(Blob), 'cartel-alegria.png', { preferShare: false });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText('Cartel guardado ✓')).toBeInTheDocument();
  });

  it('en móvil, si cancela la hoja de compartir, la hoja sigue abierta', async () => {
    mockPointer(true);
    vi.mocked(savePosterBlob).mockResolvedValueOnce('cancelled');
    setup();
    fireEvent.click(screen.getByRole('button', { name: /guarda tu cartel/i }));
    const dialog = await screen.findByRole('dialog');
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: /guardar en mi celular/i }));
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: /seguir editando/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('si el render falla avisa con un toast', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(renderPosterToBlob).mockRejectedValueOnce(new Error('boom'));
    setup();
    fireEvent.click(screen.getByRole('button', { name: /guarda tu cartel/i }));
    expect(await screen.findByText(/no se pudo guardar/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guarda tu cartel/i })).toBeEnabled();
  });
});
