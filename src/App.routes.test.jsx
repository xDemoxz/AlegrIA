import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

// El Módulo 1 monta WebGL (no existe en jsdom). El resto de la app se renderiza
// de verdad: este test es el humo de navegación entre las rutas públicas.
vi.mock('./modules/module1-timeline', () => ({
  default: () => <section aria-label="timeline-mock" />,
}));

function renderRoute(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe('rutas públicas', () => {
  it('/ monta home, carrusel y footer', async () => {
    renderRoute('/');

    expect(await screen.findByLabelText('timeline-mock')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'HISTORIAS DEL BARRIO' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument();
    expect(screen.getByText(/POP-Folclor patrimonial/)).toBeInTheDocument();
  });

  it('/poster monta el generador de carteles', async () => {
    renderRoute('/poster');

    expect(await screen.findByTestId('poster-canvas')).toBeInTheDocument();
  });

  it('/ar monta el teaser del módulo AR', async () => {
    renderRoute('/ar');

    expect(await screen.findByText(/El barrio/i, { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar recorrido AR/i })).toBeInTheDocument();
  });

  it('/ra degrada con salida clara cuando no hay URL configurada', async () => {
    renderRoute('/ra');

    expect(await screen.findByText('El recorrido AR no está disponible')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver al inicio' })).toBeInTheDocument();
  });

  it('una ruta desconocida cae en el 404 con enlace de vuelta', () => {
    renderRoute('/no-existe');

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  });

  it.each(['/', '/poster', '/ar', '/no-existe'])(
    'la ruta %s ofrece saltar el encabezado y tiene un main enfocable',
    async (path) => {
      renderRoute(path);

      expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute(
        'href',
        '#main-content'
      );

      const main = await screen.findByRole('main');
      expect(main).toHaveAttribute('id', 'main-content');
      expect(main).toHaveAttribute('tabindex', '-1');
    }
  );
});
