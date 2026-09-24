# CLAUDE.md — AlegrIA / Barrio Abajo Tour

Contexto de proyecto para Claude Code. Léelo completo antes de tocar ramas, merges o el sistema de diseño.

## Qué es este proyecto

Plataforma web (Vite + React 18 + Tailwind CSS v4) con 4 módulos interactivos sobre el patrimonio de **Barrio Abajo** (Barranquilla), del colectivo Barrio Abajo Tour. Referente visual/narrativo: [Centro Gabo — "Cuando..."](https://centrogabo.org/especiales/gabriel-garcia-marquez/cuando).

**Los 4 módulos:**
1. **Línea de tiempo** (`src/modules/module1-timeline`) — hitos históricos, cronología con `TimelineRail`/`TimelineBadge`.
2. **Futuro** (`src/modules/module2-future`) — teaser (info + botón "Iniciar experiencia 3D") que enlaza en pestaña nueva a la build deployada en `https://zerik-official.github.io/AlegrIA-3D/`. La experiencia 3D en sí (biblioteca → wormhole → museo, Three.js + @react-three/fiber + @react-three/drei, adaptada del repo `AlegrIA-3D` de un compañero) **ya no vive en este proyecto**: se removió `Experience3D.tsx`, la ruta `/futuro`, `src/pages/FuturoExperiencePage.jsx` y las dependencias three.js/@react-three, porque solo se usaba el teaser y el motor local pesaba sin aportar nada (mismo criterio que el Módulo 4 con `/ra`). `tsconfig.json` relajado (`allowJs: true, checkJs: false, strict: false`) queda como remanente de esa integración TS — ya no hay archivos `.ts`/`.tsx` en el repo, así que es candidato a limpieza si nada nuevo lo necesita.
3. **Póster** (`src/modules/module3-poster`) — generador de carteles. Las "estampitas" se arrastran (Pointer Events, no drag nativo) y **reemplazan todo el fondo del cartel** al soltarse — no quedan como ícono fijo. Solo importa la última estampita soltada (`activeStickerId` en `usePosterState.js`). Fase futura pendiente: "murales" — cada estampita representará un lugar real del barrio.
4. **AR** (`src/modules/module4-ar`) — no implementado todavía.

**Sistema de diseño v2** (Tailwind v4, CSS-first, tokens en `src/styles/theme.v4.css`):
- Paleta: amarillo solar, azul caribe, rojo picó/carnaval, verde flora (`#1E8C86` — acento interactivo), tonos tierra/ladrillo.
- Principio clave: **sin contornos negros/blancos duros** — todo se delimita con `shadow-soft` / `shadow-soft-lg` difuminadas.
- Componentes ya migrados a v2: `Chip`, `GestureCursor`, `SearchInput`, `TimelineBadge`, `MapPin`, `QuoteCard`, `StickerCard`, `TimelineRail`, `ModuleNav`, `HeaderBanner`, `FooterBajero`, `PosterForm`, `PosterSticker`.
- **Pendientes de migrar a v2** (no se ha tocado su estilo todavía): `PopAlert`, `Toast`, `EmptyState`, `LoadingTejas`, `MarqueeStrip`, `SectionRule`, todo `module4-ar`.

## ⚠️ Problema activo de ramas (leer antes de mergear nada)

El árbol de ramas real (`git log --oneline --graph --all`) es:

```
main / develop (6a26840) ── "scaffolding base + sistema de diseño + módulo póster"
  │
  ├── fix/footer-position (dd255f8)              ← rama huérfana, nunca mergeada a develop
  │
  └── feature/tailwind-v4 (16c5f9b)              ← migración Tailwind v4 + sistema v2 completo
      │                                             NUNCA MERGEADA A DEVELOP — esta es la causa raíz
      │
      └── feature/module2-3d-integration (2bf2879)  ← construida SOBRE tailwind-v4 (por eso sí tiene v2)

feature/module3-poster-backgrounds (7a9c2c7)     ← construida DIRECTO desde develop
                                                     (sin v2, porque develop no lo tiene todavía)
```

**Causa raíz:** `feature/tailwind-v4` (todo el sistema de diseño v2) nunca se mergeó a `develop`. Cualquier rama nueva creada desde `develop` (siguiendo la política normal de "ramas de feature desde develop") **no hereda el v2** — solo lo tienen las ramas que, como `module2-3d-integration`, por casualidad partieron de `tailwind-v4` en vez de `develop`.

**Síntoma que esto causó:** al hacer `git stash pop` de cambios basados en una rama con v2, sobre una rama sin v2, aparecieron conflictos reales de merge en `Chip.jsx`, `QuoteCard.jsx`, `TimelineRail.jsx` (versiones incompatibles del mismo archivo). Se resolvieron, pero `ModuleNav.jsx`, `HeaderBanner.jsx` y `FooterBajero.jsx` se quedaron en su versión vieja (pre-v2) porque el stash no traía cambios sobre esos 3 archivos específicos — su versión v2 solo existía en la rama `tailwind-v4`, nunca llegó a `feature/module3-poster-backgrounds`.

### Plan de remediación (en este orden)
1. **Mergear `feature/tailwind-v4` → `develop` primero.** Es la base que todo lo demás necesita. Revisar PR si existe, o hacer merge directo si ya está aprobado.
2. **Mergear/rebasear `fix/footer-position`** sobre el `develop` ya actualizado (puede tener conflictos con tailwind-v4 si tocó el mismo footer — comparar con `FooterBajero.jsx` v2).
3. **Actualizar `feature/module3-poster-backgrounds`** con el `develop` resultante (`git merge develop` o `git rebase develop` desde esa rama) para heredar el v2.
4. Comitear los archivos que ya están corregidos manualmente en esa rama (`ModuleNav.jsx`, `HeaderBanner.jsx`, `FooterBajero.jsx` — ya reemplazados con la versión v2 correcta, más `Chip.jsx` que solo tiene un diff cosmético de comillas por autoformato, revertible con `git checkout -- src/components/controls/Chip.jsx`).
5. Abrir PRs de `feature/module2-3d-integration` y `feature/module3-poster-backgrounds` hacia `develop`, en ese orden.

### Reglas de ramas del proyecto
- Fixes → `fix/*`. Features → `feature/*`. **Nunca commitear directo a `develop`.**
- Antes de crear una rama nueva, verificar que `develop` esté realmente actualizado con todo lo que debería estar mergeado (este incidente pasó porque no lo estaba).

## Integración del Módulo 2 (3D) — histórico (removida)

El motor 3D local (`Experience3D.tsx`, `features/{library,museum,pedestal,player,ui,wormhole}`, `models/`, `shared/`, la ruta `/futuro` y `src/pages/FuturoExperiencePage.jsx`) se eliminó del proyecto: la app ya no lo usaba porque el botón del teaser fue cambiado para enlazar directo a la build deployada del compañero (`https://zerik-official.github.io/AlegrIA-3D/`), así que el código local solo pesaba (three.js + @react-three/fiber + @react-three/drei en `package.json`, `src/global.d.ts` de augmentación de tipos R3F) sin ejecutarse nunca. Lo único que queda de ese módulo es el teaser (`src/modules/module2-future/index.jsx`).

Si en el futuro se vuelve a traer el motor 3D adentro del proyecto (en vez de enlazar afuera), revisar el repo original `AlegrIA-3D` del compañero para el fix de z-index/stacking context que tenía (`createPortal(..., document.body)` + `zIndex: 2147483647` en el componente y en el fallback de `Suspense`, necesario porque el layout general se sobreponía visualmente) y los estilos hardcodeados de HUD (`fontFamily: "'Cinzel', serif"`, hex directos) que dependían de tokens custom (`font-cinzel`, `text-gold`) inexistentes en este theme.

## Comandos útiles

```bash
# Ver todas las ramas y su último commit
git for-each-ref --sort=-committerdate refs/heads/ --format="%(refname:short) | %(committerdate:relative) | %(subject)"

# Comparar una feature branch contra develop
git diff develop..<branch> --stat

# Ver el árbol completo de ramas
git log --oneline --graph --all -20
```

## Restricción de flujo de trabajo con el usuario

El usuario (Neko) corre todos los comandos de `git` él mismo — **no hacer commits ni push directamente**; dar los comandos y que él los ejecute, para que el historial de git no muestre autoría de Claude.
