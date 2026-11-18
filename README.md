# AlegrIA — Barrio Abajo del Río

Experiencia web sobre la historia y la memoria de **Barrio Abajo del Río** (Barranquilla): línea de tiempo interactiva, generador de carteles, teaser del recorrido 3D y realidad aumentada.

**Stack:** Vite 5 · React 18 · React Router 7 · Tailwind CSS v4 (CSS-first) · Three.js + GSAP (solo en el timeline) · html2canvas (solo al exportar) · Vitest + Playwright.

## Empezar

```bash
npm install
npm run dev        # http://localhost:5173
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Build de producción + `dist/404.html` (fallback SPA). |
| `npm run preview` | Sirve `dist/` en `http://localhost:4173`. |
| `npm run lint` | ESLint (0 warnings permitidos). |
| `npm test` | Vitest (unitarios + integración en jsdom). |
| `npm run test:e2e` | Playwright sobre Pixel 7 e iPhone emulado (Chromium). |
| `npm run optimize:images` | Regenera los WebP desde `design/source`. |
| `npm run fonts` | Vuelve a descargar las fuentes latinas auto-hospedadas. |

## Rutas

| Ruta | Contenido |
|---|---|
| `/` | Home: header, carrusel, mural, **Módulo 1** (línea de tiempo) y teaser del **Módulo 2** (3D), footer. |
| `/poster` | **Módulo 3**: generador de carteles con estampitas y export PNG 1080×1920. |
| `/ar` | **Módulo 4**: teaser del recorrido AR. |
| `/ra` | Experiencia AR de Mattercraft/ZapWorks embebida en un iframe seguro. |
| `*` | Página 404 con salida al inicio. |

La experiencia 3D del Módulo 2 vive fuera de este repo (`https://zerik-official.github.io/AlegrIA-3D/`); aquí solo está el teaser. La AR del Módulo 4 se publica en Mattercraft y se configura con `VITE_AR_URL`.

## Estructura

```
src/
├── components/
│   ├── controls/         PopButton · Chip · GestureCursor · TimelineBadge
│   ├── feedback/         ModuleErrorBoundary · Toast
│   ├── layout/           HeaderBanner · FooterBajero · SkipLink · ScrollToTop
│   ├── media/            StoryCarousel · HomeMuralBanner
│   └── motifs/           BaldosaPattern · TejaPattern · CaladoPattern
├── modules/
│   ├── module1-timeline/ Sebastián — scrollytelling WebGL (three + GSAP)
│   ├── module2-future/   Gustavo — teaser de la experiencia 3D externa
│   ├── module3-poster/   José — cartel, estampitas y export PNG
│   └── module4-ar/       Nicolás — teaser + piezas del recorrido AR
├── pages/                Composición por ruta (HomeApp, PosterPage, ARPage, RAExperiencePage, 404)
├── data/                 Hitos del timeline
├── lib/                  asset() · gestureBridge · sections
├── styles/               theme.v4.css (tokens y utilidades de marca)
└── assets/fonts/         Bebas Neue y Work Sans en woff2 (subset latin)
design/source/            Originales de imagen (fuera del build)
public/                   Solo lo que se sirve: WebP optimizados, audios y favicon
```

No hay store global: cada módulo vive en su ruta y recibe lo que necesita por props. El header solo conoce el enum `SECTION` (`src/lib/sections.js`).

## Rendimiento

- El timeline (three + GSAP, ~578 kB) se carga con `React.lazy` cuando la sección se acerca al viewport; el chunk inicial queda en ~230 kB.
- Las texturas del túnel se piden por era (no las 11 al montar).
- Carrusel, timeline, logos e iconos del póster se sirven en WebP generado desde `design/source`; los originales no entran a `dist`.
- Fuentes auto-hospedadas (sin peticiones a Google Fonts).
- `dist` actual: ~10 MB, de los cuales ~5,7 MB son el MP3 del timeline.

### Imágenes

Los originales viven en `design/source/{carrusel,timeline,logos,iconos}`. Para publicar un cambio:

```bash
npm run optimize:images
```

El script recorta/redimensiona y escribe en `public/assets/...`. No editar los WebP a mano.

## Accesibilidad

- Skip link al `main` en todas las rutas y `main` enfocable (`tabIndex={-1}`).
- `prefers-reduced-motion`: carrusel detenido y saltos del timeline sin animación de ~2,5 s.
- Carrusel con botón visible de pausa/reanudar.
- Póster operable con teclado; diálogo de resultado con foco atrapado, Escape y scroll bloqueado.
- Footer con contraste AA.

## Tests

- **Vitest**: rutas públicas (`/`, `/poster`, `/ar`, `/ra`, 404), header, scroll restoration, export del póster (colores `oklch`, PNG, share/download) y normalización de la URL AR.
- **Playwright**: layout móvil, gestos táctiles reales (CDP) y PNG exportado en Pixel 7 e iPhone emulado.

El CI (`.github/workflows/ci.yml`) corre `lint`, `test` y `build` en cada push a `main`/`develop` y en PRs.

## Despliegue

```bash
npm run build
```

- **GitHub Pages:** `dist/404.html` hace que refrescar `/poster`, `/ar` o `/ra` cargue la app. Para subdirectorio: `VITE_BASE=/AlegrIA/ npm run build`.
- **Vercel:** `vercel.json` reescribe todo a `index.html`.
- **Netlify:** `public/_redirects` aplica el mismo fallback.
- **AR:** definir `VITE_AR_URL` (HTTPS) en el build. Sin ella, `/ra` muestra un aviso de “no disponible” con salida al teaser.

Ver también `VARIABLES_ENTORNO.md`.

## Documentación

- `AUDITORIA.md` — diagnóstico original + estado de ejecución del plan.
- `INFORME_INCONSISTENCIAS.md` — hallazgos históricos y cómo se resolvieron.
- `DESIGN-MIGRATION-V4.md` — migración al sistema de diseño v2 (histórico, completada).
- `CLAUDE.md` — contexto y convenciones para asistentes/IDE.
