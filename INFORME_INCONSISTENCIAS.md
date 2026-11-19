# Informe de inconsistencias — AlegrIA (Barrio Abajo del Río)

> **Documento histórico.** El diagnóstico original es del **2026-09-22** sobre `feature/module3-poster-backgrounds` (`7a9c2c7`). Todos sus hallazgos quedaron resueltos al integrar las ramas en `develop`. Se conserva como registro; el estado vigente está en `AUDITORIA.md` y `README.md`.

## Hallazgos originales y resolución

| # | Hallazgo (2026-09-22) | Estado actual |
|---|---|---|
| 1 | `ModuleNav` existía pero no se montaba en `App.jsx`; la navegación entre módulos había desaparecido. | Resuelto. La navegación vive en `HeaderBanner` (botones → rutas `/`, `/poster`, `/ar`); `ModuleNav` se eliminó por código muerto. |
| 2 | Clases “fantasma” del diseño v2 (`shadow-soft`, `bg-verde`, `bg-festival`) usadas sobre una base Tailwind v3. | Resuelto. El proyecto usa Tailwind v4 CSS-first (`src/styles/theme.v4.css`) y todas las utilidades existen. |
| 3 | Ramas divergentes (`fix/footer-position`, `feature/tailwind-v4`, `feature/module2-3d-integration`, `feature/module3-poster-backgrounds`) sin integrar. | Resuelto. Todo está fusionado en `develop`; el historial de ramas históricas no se usa. |
| 4 | Módulo 1 parcial (grid estático sin scrollytelling), Módulo 2 placeholder, Módulo 4 sin implementar. | Resuelto. M1 es el túnel WebGL con GSAP; M2 es un teaser de la build externa; M3 exporta PNG; M4 tiene teaser y `/ra` embebe la experiencia publicada. |
| 5 | `CLAUDE.md` pertenecía a otro proyecto (`gestion-de-productos`). | Resuelto. `CLAUDE.md` describe AlegrIA. |
| 6 | `gestureBridge`/`GestureCursor` funcionales con clases fantasma. | Resuelto. `GestureCursor` se monta en `/poster` y usa tokens v2. |

## Qué cambió desde entonces

- **Navegación:** cada módulo tiene su ruta; el header navega y el 404 cubre URLs desconocidas.
- **Diseño:** sistema v2 consolidado (sin contornos negros duros, sombras difuminadas, verde teal).
- **Módulos:** M1 con motor WebGL, M2 con teaser externo, M3 con fondos/estampitas y export, M4 con teaser + iframe AR.
- **Calidad:** ESLint, Vitest, Playwright y CI; auditoría técnica ejecutada por fases (ver `AUDITORIA.md`).
- **Fuentes:** Bebas Neue, Work Sans y Caveat se sirven desde `src/assets/fonts` (subset latin); no quedan peticiones a Google Fonts.
- **Limpieza:** se eliminaron el store zustand, `ModuleNav`, `AudioToggle`, `SearchInput`, `MapPin`, `QuoteCard`, `StickerCard`, `TimelineRail`, `EmptyState`, `LoadingTejas`, `PopAlert`, `SectionRule`, `barrioAbajoData.json`, `tokens.json`, `tsconfig.json` y la dependencia `lenis`.

---

*El informe original solo diagnosticaba; no aplicó cambios de código.*
