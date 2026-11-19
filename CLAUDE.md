# CLAUDE.md — AlegrIA / Barrio Abajo del Río

Contexto del proyecto para asistentes e IDEs. Describe el estado real del repo, no el plan de una fase anterior.

## Qué es

SPA de Vite + React 18 + Tailwind CSS v4 (CSS-first) sobre el patrimonio de **Barrio Abajo** (Barranquilla). Cuatro experiencias:

1. **Timeline** (`src/modules/module1-timeline`) — scrollytelling con Three.js + GSAP, texturas WebP cargadas por era y audio de fondo opcional.
2. **Futuro** (`src/modules/module2-future`) — teaser que abre en otra pestaña la build externa `https://zerik-official.github.io/AlegrIA-3D/`. El motor 3D no vive en este repo.
3. **Póster** (`src/modules/module3-poster`) — cartel con fondos y estampitas, export a PNG 1080×1920 con html2canvas.
4. **AR** (`src/modules/module4-ar` + `/ra`) — teaser y experiencia de Mattercraft/ZapWorks embebida por iframe.

## Arquitectura

- Rutas en `src/App.jsx`; composición por página en `src/pages/`.
- No hay store global. El enum `SECTION` (`src/lib/sections.js`) solo marca la sección activa del header.
- El timeline se monta con `React.lazy` + `IntersectionObserver` (`src/modules/home/index.jsx`): no lo importes de forma estática en el home o vuelve el chunk inicial de ~840 kB.
- El póster recibe `onBack` por prop; no conoce el router.
- `SkipLink` y `ScrollToTop` son globales (`src/components/layout`). Cada página debe tener `<main id="main-content" tabIndex={-1}>`.

## Comandos

```bash
npm run dev            # desarrollo
npm run build          # dist + 404.html
npm run preview        # sirve dist
npm run lint           # 0 warnings
npm test               # Vitest
npm run test:e2e       # Playwright (Pixel 7 + iPhone en Chromium)
npm run optimize:images
npm run fonts
```

## Assets

- **Originales:** `design/source/{carrusel,timeline,logos,iconos}`. No están en `public`, así que no entran al build.
- **Servidos:** `public/assets/...` en WebP, generados con `npm run optimize:images`. No editar los WebP a mano.
- **Fuentes:** `src/assets/fonts/*.woff2` (subset latin, Bebas Neue, Work Sans y Caveat). `npm run fonts` las regenera desde Google Fonts.
- **Audios:** `public/audios/` (MP3 del timeline, ~5,7 MB).
- El helper `asset()` (`src/lib/asset.js`) resuelve rutas con la base de Vite; usarlo para todo asset de `public`.

## Convenciones y trampas

- Las animaciones deben respetar `prefers-reduced-motion` (carrusel y saltos del timeline ya lo hacen).
- Controles internos del cartel que no deben salir en el PNG llevan `data-html2canvas-ignore`.
- `exportPoster.js` convierte `oklch/oklab` a `rgba` en el clon de html2canvas; si se agrega un color nuevo, mantener esa conversión.
- El iframe de `/ra` usa `sandbox` acotado y `VITE_AR_URL` se valida con `normalizeArUrl` (solo HTTPS; `http://localhost` en dev). No quitar el sandbox para “hacer que funcione”: el runtime necesita `allow-scripts allow-same-origin`, no navegación top.
- `dist` es desechable; no commitear `dist/`.
- Rama de integración: `develop`. `main` se actualiza por release. El CI corre lint + tests + build en pushes y PRs.
- Commits en español, con Conventional Commits (`perf(home): ...`, `fix(a11y): ...`, `test(rutas): ...`).

## Tests que cubren lo delicado

- `src/App.routes.test.jsx` — humo de todas las rutas y skip link.
- `src/modules/module3-poster/exportPoster.test.js` — colores `oklch`, PNG, share/download.
- `src/modules/module4-ar/arPieces.test.js` — validación de la URL AR.
- `e2e/poster-mobile.spec.js` — gestos táctiles y export real en móvil.

## Documentos

- `README.md` — uso, estructura, despliegue.
- `AUDITORIA.md` — diagnóstico y estado del plan.
- `INFORME_INCONSISTENCIAS.md` — hallazgos históricos ya resueltos.
- `DESIGN-MIGRATION-V4.md` — migración al sistema v2 (histórico).
