import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, Link } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ScrollToTop from './ScrollToTop';

function renderNav(initialPath) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ScrollToTop />
      <Link to="/poster">Ir al póster</Link>
      <Link to="/#main-content">Salto interno</Link>
      <Routes>
        <Route path="/" element={<p>home</p>} />
        <Route path="/poster" element={<p>póster</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ScrollToTop', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  it('sube al inicio al cambiar de ruta', () => {
    renderNav('/');
    window.scrollTo.mockClear();

    fireEvent.click(screen.getByRole('link', { name: 'Ir al póster' }));

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('no interviene cuando solo cambia el hash', () => {
    renderNav('/');
    window.scrollTo.mockClear();

    fireEvent.click(screen.getByRole('link', { name: 'Salto interno' }));

    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
