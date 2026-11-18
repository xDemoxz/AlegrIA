import { copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// GitHub Pages (y la mayoría de hosts estáticos) devuelve 404.html para
// rutas desconocidas. Copiar el index ya construido hace que refrescar
// /poster, /ar o /ra cargue la SPA en vez de un 404 del servidor.
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
await copyFile(`${dist}index.html`, `${dist}404.html`);
console.log('SPA fallback listo: dist/404.html');
