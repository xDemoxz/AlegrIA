import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import RAExperiencePage from './RAExperiencePage';

// La página se prueba con una URL válida para inspeccionar el iframe; el
// caso "sin URL" ya lo cubre App.routes.test.jsx.
vi.mock('../modules/module4-ar/arPieces', () => ({
  AR_URL: 'https://ar.example.com/recorrido',
}));

describe('RAExperiencePage', () => {
  it('embebe la experiencia con cámara delegada y sandbox acotado', () => {
    render(
      <MemoryRouter>
        <RAExperiencePage />
      </MemoryRouter>
    );

    const frame = screen.getByTitle(/realidad aumentada/i);
    expect(frame).toHaveAttribute('src', 'https://ar.example.com/recorrido');
    expect(frame.getAttribute('allow')).toContain('camera');
    expect(frame.getAttribute('allow')).toContain('xr-spatial-tracking');

    const sandbox = frame.getAttribute('sandbox') ?? '';
    expect(sandbox).toContain('allow-scripts');
    expect(sandbox).toContain('allow-same-origin');
    // La experiencia no debe poder navegar la pestaña ni abrir ventanas sin
    // control: solo se delega lo que el runtime de Zappar necesita.
    expect(sandbox).not.toContain('allow-top-navigation');
    expect(sandbox).not.toContain('allow-modals');
  });
});
