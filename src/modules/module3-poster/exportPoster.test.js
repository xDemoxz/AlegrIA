import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const html2canvasMock = vi.fn();
vi.mock('html2canvas', () => ({ default: (...args) => html2canvasMock(...args) }));

import {
  sanitizeFilename,
  getExportScale,
  renderPosterToBlob,
  savePosterBlob,
  oklchToRgb,
  replaceUnsupportedColors,
  EXPORT_WIDTH,
} from './exportPoster';

const pngBlob = () => new Blob(['png'], { type: 'image/png' });
// 216×384 en pantalla → 1080×1920 exacto, sin redibujar.
const fakeCanvas = (blob = pngBlob()) => ({ width: 1080, height: 1920, toBlob: (cb) => cb(blob) });

describe('sanitizeFilename', () => {
  it('quita tildes, espacios y símbolos', () => {
    expect(sanitizeFilename('¡Año de Alegría!')).toBe('ano-de-alegria-alegria.png');
  });
  it('usa "cartel" si no hay título', () => {
    expect(sanitizeFilename('')).toBe('cartel-alegria.png');
    expect(sanitizeFilename('   ///  ')).toBe('cartel-alegria.png');
    expect(sanitizeFilename(undefined)).toBe('cartel-alegria.png');
  });
  it('no permite rutas ni nombres gigantes', () => {
    const name = sanitizeFilename('../../etc/' + 'x'.repeat(200));
    expect(name).not.toContain('/');
    expect(name.length).toBeLessThanOrEqual(40 + '-alegria.png'.length);
  });
});

describe('getExportScale', () => {
  it('lleva cualquier ancho en pantalla a 1080px', () => {
    expect(getExportScale(216) * 216).toBe(EXPORT_WIDTH);
    expect(getExportScale(420) * 420).toBeCloseTo(EXPORT_WIDTH);
  });
  it('cae a 2 si el nodo no tiene ancho', () => {
    expect(getExportScale(0)).toBe(2);
  });
});

describe('colores oklch del PNG', () => {
  it('convierte blanco, negro y un rojo de la paleta a rgba', () => {
    expect(oklchToRgb('oklch(1 0 0)')).toBe('rgba(255, 255, 255, 1)');
    expect(oklchToRgb('oklch(0 0 0)')).toBe('rgba(0, 0, 0, 1)');
    expect(oklchToRgb('oklch(0.577 0.245 27.325)')).toBe('rgba(231, 0, 11, 1)');
  });

  it('respeta el alfa y los porcentajes', () => {
    expect(oklchToRgb('oklch(0.7 0.1 200 / 50%)')).toBe('rgba(64, 177, 183, 0.5)');
    expect(oklchToRgb('oklch(100% 0% 0deg)')).toBe('rgba(255, 255, 255, 1)');
  });

  it('acepta oklab y valores sin unidad', () => {
    expect(oklchToRgb('oklab(1 0 0)')).toBe('rgba(255, 255, 255, 1)');
    expect(oklchToRgb('oklab(0 0 0 / 0.5)')).toBe('rgba(0, 0, 0, 0.5)');
  });

  it('devuelve null si el color no es oklch/oklab o está incompleto', () => {
    expect(oklchToRgb('#fff')).toBeNull();
    expect(oklchToRgb('rgb(1, 2, 3)')).toBeNull();
    expect(oklchToRgb('oklch(1 0)')).toBeNull();
    expect(oklchToRgb('oklch(1 0 0 / nope)')).toBeNull();
    expect(oklchToRgb(undefined)).toBeNull();
  });

  it('reemplaza los colores dentro de un valor compuesto (box-shadow)', () => {
    const shadow = '0 0 0 1px oklch(0.7 0.1 200), 0 2px 4px oklch(0 0 0 / 20%)';
    expect(replaceUnsupportedColors(shadow)).toBe(
      '0 0 0 1px rgba(64, 177, 183, 1), 0 2px 4px rgba(0, 0, 0, 0.2)'
    );
  });

  it('deja intacto lo que ya entiende html2canvas y usa el fallback si no puede convertir', () => {
    expect(replaceUnsupportedColors('rgba(0, 0, 0, 0.5)')).toBe('rgba(0, 0, 0, 0.5)');
    expect(replaceUnsupportedColors('1px solid oklch(nope)', '#000000')).toBe('1px solid #000000');
  });
});

describe('renderPosterToBlob', () => {
  let node;
  beforeEach(() => {
    html2canvasMock.mockReset();
    node = document.createElement('div');
    node.setAttribute('data-poster-canvas', '');
    node.getBoundingClientRect = () => ({ width: 216, height: 384 });
    document.body.appendChild(node);
  });
  afterEach(() => node.remove());

  it('renderiza a 1080px de ancho y devuelve un PNG', async () => {
    const blob = pngBlob();
    html2canvasMock.mockResolvedValue(fakeCanvas(blob));
    await expect(renderPosterToBlob(node)).resolves.toBe(blob);
    const opts = html2canvasMock.mock.calls[0][1];
    expect(opts.scale * 216).toBe(1080);
    expect(opts.foreignObjectRendering).toBe(false);
  });

  it('el clon sale sin esquinas redondeadas ni animaciones', async () => {
    html2canvasMock.mockImplementation(async (_n, opts) => {
      // Como html2canvas: el clon vive en un iframe (tiene defaultView).
      const frame = document.createElement('iframe');
      document.body.appendChild(frame);
      const clone = frame.contentDocument;
      clone.body.innerHTML = '<div data-poster-canvas style="border-radius:24px"><img style="animation: x 1s"></div>';
      opts.onclone(clone);
      const root = clone.querySelector('[data-poster-canvas]');
      expect(root.style.borderRadius).toBe('0');
      expect(root.style.boxShadow).toBe('none');
      expect(clone.querySelector('img').style.animation).toContain('none');
      frame.remove();
      return fakeCanvas();
    });
    await renderPosterToBlob(node);
    expect(html2canvasMock).toHaveBeenCalledTimes(1);
  });

  it('convierte los colores oklch del clon a rgba (el texto no desaparece)', async () => {
    html2canvasMock.mockImplementation(async (_n, opts) => {
      const frame = document.createElement('iframe');
      document.body.appendChild(frame);
      const clone = frame.contentDocument;
      clone.body.innerHTML = `
        <div data-poster-canvas>
          <h2 style="color: oklch(0.577 0.245 27.325)">Barrio Abajo</h2>
          <span style="background-color: oklch(0.7 0.1 200 / 50%); box-shadow: 0 0 0 1px oklch(0 0 0)">chip</span>
        </div>`;
      opts.onclone(clone);
      const title = clone.querySelector('h2');
      const chip = clone.querySelector('span');
      // jsdom normaliza rgba(..., 1) a rgb(...) para `color`.
      expect(title.style.color).toBe('rgb(231, 0, 11)');
      expect(title.style.color).not.toContain('transparent');
      expect(chip.style.backgroundColor).toBe('rgba(64, 177, 183, 0.5)');
      expect(chip.style.boxShadow).toContain('rgba(0, 0, 0, 1)');
      frame.remove();
      return fakeCanvas();
    });
    await renderPosterToBlob(node);
  });

  it('reintenta con foreignObject si el render normal falla', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    html2canvasMock.mockRejectedValueOnce(new Error('oklch')).mockResolvedValueOnce(fakeCanvas());
    await renderPosterToBlob(node);
    expect(html2canvasMock.mock.calls[1][1].foreignObjectRendering).toBe(true);
  });

  it('falla claro si el canvas no produce blob', async () => {
    html2canvasMock.mockResolvedValue({ width: 1080, height: 1920, toBlob: (cb) => cb(null) });
    await expect(renderPosterToBlob(node)).rejects.toThrow(/blob/);
  });

  it('exige un nodo', async () => {
    await expect(renderPosterToBlob(null)).rejects.toThrow();
  });
});

describe('savePosterBlob', () => {
  let clicked;
  beforeEach(() => {
    clicked = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      clicked.push({ href: this.href, download: this.download });
    });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:poster');
  });
  afterEach(() => {
    delete navigator.share;
    delete navigator.canShare;
  });

  it('sin Web Share descarga el archivo con <a download>', async () => {
    await expect(savePosterBlob(pngBlob(), 'x-alegria.png', { preferShare: true })).resolves.toBe('downloaded');
    expect(clicked).toEqual([{ href: 'blob:poster', download: 'x-alegria.png' }]);
  });

  it('con Web Share comparte el PNG como archivo', async () => {
    navigator.canShare = vi.fn(() => true);
    navigator.share = vi.fn(async () => {});
    await expect(savePosterBlob(pngBlob(), 'x-alegria.png', { preferShare: true })).resolves.toBe('shared');
    const { files } = navigator.share.mock.calls[0][0];
    expect(files[0]).toBeInstanceOf(File);
    expect(files[0].name).toBe('x-alegria.png');
    expect(files[0].type).toBe('image/png');
    expect(clicked).toHaveLength(0);
  });

  it('si el usuario cierra la hoja de compartir no descarga', async () => {
    navigator.canShare = () => true;
    navigator.share = vi.fn(async () => {
      throw new DOMException('cancel', 'AbortError');
    });
    await expect(savePosterBlob(pngBlob(), 'x.png', { preferShare: true })).resolves.toBe('cancelled');
    expect(clicked).toHaveLength(0);
  });

  it('si compartir falla por otra razón, descarga', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    navigator.canShare = () => true;
    navigator.share = vi.fn(async () => {
      throw new DOMException('no gesture', 'NotAllowedError');
    });
    await expect(savePosterBlob(pngBlob(), 'x.png', { preferShare: true })).resolves.toBe('downloaded');
    expect(clicked).toHaveLength(1);
  });

  it('sin preferShare descarga aunque exista Web Share', async () => {
    navigator.canShare = () => true;
    navigator.share = vi.fn();
    await expect(savePosterBlob(pngBlob(), 'x.png')).resolves.toBe('downloaded');
    expect(navigator.share).not.toHaveBeenCalled();
  });
});
