import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HeaderBanner from './HeaderBanner';
import { SECTION } from '../../lib/sections';

describe('HeaderBanner', () => {
  it('marca la sección activa con aria-current', () => {
    render(<HeaderBanner active={SECTION.MOD3_POSTER} onSelect={() => {}} />);

    expect(screen.getByRole('button', { name: '2 · PÓSTER' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '1 · INICIO' })).not.toHaveAttribute('aria-current');
  });

  it('avisa la sección elegida al navegar', () => {
    const onSelect = vi.fn();
    render(<HeaderBanner active={SECTION.MOD1_TIMELINE} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: '3 · AR' }));
    expect(onSelect).toHaveBeenCalledWith(SECTION.MOD4_AR);
  });

  it('se oculta con translate al hacer scroll', () => {
    const { container } = render(<HeaderBanner active={SECTION.MOD1_TIMELINE} hidden onSelect={() => {}} />);
    expect(container.querySelector('header')).toHaveStyle({ transform: 'translateY(-100%)' });
  });
});
