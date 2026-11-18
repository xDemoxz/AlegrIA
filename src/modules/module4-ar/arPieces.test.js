import { describe, expect, it } from 'vitest';
import { normalizeArUrl } from './arPieces';

describe('normalizeArUrl', () => {
  it('antepone https cuando la URL viene sin protocolo', () => {
    expect(normalizeArUrl('ar.ejemplo.com/recorrido')).toBe('https://ar.ejemplo.com/recorrido');
  });

  it('acepta https y conserva ruta y query', () => {
    expect(normalizeArUrl('https://ar.ejemplo.com/x?y=1')).toBe('https://ar.ejemplo.com/x?y=1');
  });

  it('rechaza http remoto, esquemas peligrosos y valores vacíos', () => {
    expect(normalizeArUrl('http://ar.ejemplo.com')).toBe('');
    expect(normalizeArUrl('javascript:alert(1)')).toBe('');
    expect(normalizeArUrl('data:text/html,hola')).toBe('');
    expect(normalizeArUrl('https://')).toBe('');
    expect(normalizeArUrl('   ')).toBe('');
    expect(normalizeArUrl(undefined)).toBe('');
  });

  it('permite http://localhost solo en desarrollo', () => {
    expect(normalizeArUrl('http://localhost:3000/x')).toBe('http://localhost:3000/x');
    expect(normalizeArUrl('http://localhost:3000/x', { allowLocalhost: false })).toBe('');
    expect(normalizeArUrl('http://127.0.0.1:5173/x', { allowLocalhost: false })).toBe('');
  });
});
