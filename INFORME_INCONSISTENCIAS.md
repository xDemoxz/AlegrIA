# Informe de inconsistencias — AlegrIA (Barrio Abajo del Río)

Fecha: 2026-09-22
Rama actual: `feature/module3-poster-backgrounds` (HEAD `7a9c2c7`)

## Resumen ejecutivo

El proyecto tiene **4 ramas de trabajo divergentes que nunca se integraron entre sí**, y la rama actual mezcla manualmente estilos de una migración de diseño (v2 / Tailwind v4) que **no está presente en su historial**. Esto explica dos síntomas que reportaste:

1. **Los botones de navegación entre módulos desaparecieron**: el componente existe y funciona, pero **no está montado en `App.jsx`**.
2. **La apariencia del header/footer/chips se ve rota o "sin sombra"**: el working tree tiene cambios sin commitear que usan clases Tailwind (`bg-verde`, `bg-festival`, `shadow-soft`, `text-verde-dark`, etc.) que **solo existen en la rama `feature/tailwind-v4`**, no en la config activa de esta rama.

## Hallazgo 1 (crítico) — Navegación entre módulos ausente en `App.jsx`

- `src/components/layout/ModuleNav.jsx` existe, está completo y funcional (recibe `active`/`onSelect`, pinta los 4 módulos).
- **Nunca se importa ni se renderiza en [App.jsx](src/App.jsx)** — es el único archivo que compone el layout global, y no lo referencia.
- `grep` de `ModuleNav` en `src/` solo devuelve su propio archivo de definición.
- El store (`useAppStore.js`) sí expone todo lo necesario para conectarlo (`section`, `goTo`).

**Causa probable**: al hacer scaffolding se creó el componente de navegación pero se olvidó cablearlo en `App.jsx`, o se quitó en un commit posterior sin querer.

**Fix esperado** (no aplicado, pendiente de tu validación): en `App.jsx` importar `ModuleNav`, leer `section`/`goTo` del store, y renderizarlo entre `HeaderBanner`/`MarqueeStrip` y `<main>`.

## Hallazgo 2 (crítico) — Cambios de "diseño v2" sin commitear, incompatibles con la config activa

El working tree tiene 4 archivos modificados sin commit: `Chip.jsx`, `FooterBajero.jsx`, `HeaderBanner.jsx`, `ModuleNav.jsx`. Todos aplican una repintada "v2" (gradiente festival, acento teal `verde`, sombras difuminadas `shadow-soft`) **copiada del sistema de diseño de la rama `feature/tailwind-v4`**, pero:

- La rama actual sigue usando **Tailwind v3** clásico: `tailwind.config.js` + `postcss.config.js` + `@tailwind base/components/utilities` en `src/index.css`. Este es el que de verdad procesa Vite (`package.json` declara `"tailwindcss": "^3.4.13"`, sin `@tailwindcss/vite` ni v4).
- `tailwind.config.js` (activo) solo define los colores `yellow`, `red`, `blue`, `orange`, `ink`, `cream` y las sombras `pop-black/red/blue/xl`, `sticker`, `pressed`.
- Las clases nuevas **no existen en ningún lado accesible por esta rama**:
  - `bg-verde`, `bg-verde-dark`, `text-verde-dark` → el color `verde` solo se definió en `feature/tailwind-v4` (`--color-verde: #1E8C86`).
  - `bg-festival` → solo existe como `@utility` en `feature/tailwind-v4`'s `theme.v4.css`.
  - `shadow-soft` / `shadow-soft-lg` → ídem, solo en `feature/tailwind-v4`.
  - `src/styles/theme.v4.css` (presente en esta rama) es una **versión vieja de referencia** que tampoco define `verde`/`festival`/`soft` — solo espeja los tokens v1.
- Resultado real en el navegador: esas clases se ignoran silenciosamente (Tailwind no las genera), así que el header, footer, chips y nav se ven **sin color de acento, sin degradado y sin sombra** — planos.
- El mismo patrón de clases "fantasma" (`shadow-soft`, `shadow-soft-lg`, `bg-verde*`) ya estaba filtrado (probablemente por copy-paste o merge parcial anterior) dentro de componentes que **sí están commiteados**, no solo en el diff pendiente:
  - `GestureCursor.jsx`, `MapPin.jsx`, `QuoteCard.jsx`, `StickerCard.jsx`, `TimelineRail.jsx` (Módulo 1)
  - `PosterForm.jsx`, `PosterPreview.jsx`, `PosterSticker.jsx` (Módulo 3)

**Causa raíz**: `feature/module3-poster-backgrounds` se ramificó desde el commit de scaffolding (`6a26840`), **antes** de la migración a Tailwind v4 (commit `16c5f9b` en `feature/tailwind-v4`). Alguien escribió/portó JSX que asume el sistema de diseño v2 sin traer la migración de tokens que lo sustenta.

## Hallazgo 3 — Ramas divergentes sin integrar

```
main                              → 195f75d (solo commit inicial, muy atrás)
develop                           → 6a26840 (scaffolding + diseño v1 + módulo 3 base)
fix/footer-position               → dd255f8 (fix footer sticky, sobre develop)
feature/tailwind-v4               → 16c5f9b (migración v3→v4 + diseño v2, sobre develop)
feature/module2-3d-integration    → 2bf2879 (Módulo 2 3D real, sobre feature/tailwind-v4)
feature/module3-poster-backgrounds→ 7a9c2c7 (HEAD actual, fondos de estampitas, sobre develop — NO incluye tailwind-v4)
```

Consecuencias directas:
- El **Módulo 2 real (integración 3D biblioteca→museo)** vive únicamente en `feature/module2-3d-integration` y **no está en la rama actual**: aquí `module2-future/index.jsx` es solo un placeholder ("Escena 3D pendiente").
- El **fix de footer sticky** (`fix/footer-position`) tampoco está en la rama actual.
- La migración a Tailwind v4 + diseño v2 tampoco está integrada, pero sus clases sí se están usando "a mano" (Hallazgo 2).
- Nadie ha fusionado nada de vuelta a `develop` o `main` desde el commit de scaffolding.

## Hallazgo 4 — Estado real de los 4 módulos

| Módulo | Estado | Notas |
|---|---|---|
| 1 — Línea de tiempo | Parcial | Renderiza datos reales (`barrioAbajoData.json`) en un grid estático; falta el scrollytelling GSAP/Lenis (hay un TODO explícito en el código). Usa clases `shadow-soft-lg` fantasma. |
| 2 — Futuro (3D) | **Placeholder puro** en esta rama | Solo `LoadingTejas` + texto "Escena 3D pendiente". La versión funcional existe en `feature/module2-3d-integration` y no se ha traído aquí. |
| 3 — Póster | El más completo | Estado real (`usePosterState.js`), drag por Pointer Events, export a PNG con `html2canvas` (coincide con dependencia instalada), estampitas placeholder en `data/stickers.js`. Usa clases fantasma `shadow-soft`/`shadow-soft-lg`. |
| 4 — AR | **Placeholder puro** | Solo `PopAlert` con "setup pendiente". Correcto que no haya SDK (ej. Zappar) en `package.json` todavía — es esperado en esta etapa. |

No se encontraron imports rotos contra `useAppStore` (SECTION, goTo, next, prev, gestureControlEnabled, toggleGestureControl, audioEnabled, toggleAudio) en ningún módulo.

`gestureBridge.js` / `GestureCursor.jsx`: el bridge de gestos **sí está implementado** (no es stub) — traduce eventos `alegria:gesture` a PointerEvents sintéticos vía `elementFromPoint`. Funcional, solo arrastra la clase fantasma `shadow-soft`.

## Hallazgo 5 — Archivo fuera de lugar

- `CLAUDE.md` (sin trackear, en la raíz del repo) pertenece a **otro proyecto distinto**: un simulacro de prueba de desempeño para una app `gestion-de-productos` (React+TS+NestJS), sin relación con AlegrIA. Aparenta haberse copiado por error a este directorio. No afecta la ejecución pero contamina el contexto de cualquier asistente/IDE que lo lea como configuración del proyecto.

## Prioridad sugerida para restaurar el estado óptimo

1. **Decidir la fuente de verdad del sistema de diseño**: ¿nos quedamos en Tailwind v3 (config actual) o completamos la migración a v4/diseño v2 trayendo `feature/tailwind-v4`? Mientras no se decida, cualquier nuevo estilo debe usar solo tokens que existan en `tailwind.config.js` activo.
2. Revertir o completar los 4 cambios sin commitear (`Chip.jsx`, `FooterBajero.jsx`, `HeaderBanner.jsx`, `ModuleNav.jsx`) según lo que se decida en el punto 1.
3. Reconectar `ModuleNav` en `App.jsx` (bug independiente de la decisión de diseño).
4. Planear el merge/rebase de `fix/footer-position` y `feature/module2-3d-integration` hacia la rama de trabajo actual (o hacia `develop`) para no perder ese trabajo ya hecho.
5. Eliminar o mover `CLAUDE.md` fuera de este repo.
6. Una vez resuelto el sistema de diseño, purgar las clases fantasma (`shadow-soft`, `shadow-soft-lg`, `bg-verde*`, `bg-festival`) que ya están commiteadas en Módulo 1 y Módulo 3.

---
*Este informe es solo diagnóstico — no se aplicó ningún cambio de código.*
