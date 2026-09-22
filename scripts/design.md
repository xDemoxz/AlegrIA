# Mejora de diseño — AlegrIA / Barrio Abajo — pulido profesional (ya implementado → llevar a pro)

> Prompt listo para pasar a una IA (o a tu compañero) para que tome el diseño actual y lo eleve a nivel editorial sin rehacerlo.

## Contexto técnico (no tocar sin motivo)
- **Stack:** Vite + React 18 + Tailwind CSS v4 CSS-first. Tokens reales en `src/styles/theme.v4.css` (`@theme` con `--color-yellow`, `--color-red`, `--color-verde`, `--radius-sticker`, `--shadow-soft` etc). No hay `tailwind.config.js`.
- **Sistema v2:** paleta amarillo solar / azul caribe / rojo picó / verde flora (`#1E8C86` acento), tipografía `Bebas Neue`/`Work Sans` + `Cinzel`/`Inter` (import en theme), **sin contornos negros/blancos duros**: todo se separa con `shadow-soft` / `shadow-soft-lg`.
- **Rama actual:** `jose` (sobre `develop` con v2 mergeado). Assets ya integrados: `public/assets/{logos,iconos,carrusel}/` (normalizados kebab desde `src/assets` raw), `public/assets/manifest.json`. No usar `src/assets/fondos historias`, `programación`, `IMAGEN TRADICION BAJERA 2026`.
- **Componentes v2 ya migrados:** `Chip`, `TimelineRail`, `PosterSticker`, `PosterPreview`, `HeaderBanner`, `FooterBajero`, `StoryCarousel`, `MarqueeStrip`. 3D en `src/modules/module2-future` con portal `zIndex:2147483647` (no bajar).
- **Ref visual:** https://centrogabo.org/especiales/gabriel-garcia-marquez/cuando — ritmo editorial, mucho aire, tipografía display grande.

## Objetivo
No rediseñar. Pulir lo existente para que se vea **mucho más profesional, editorial y coherente**: jerarquía clara, micro-detalles cuidados, responsive impecable, accesibilidad básica.

## Instrucciones para la IA que ejecutará la mejora

### 1) Auditoría rápida (antes de tocar código)
- Revisa `src/App.jsx`, `src/components/layout/*`, `src/components/media/StoryCarousel.jsx`, `src/modules/module3-poster/*`, `src/styles/theme.v4.css`, `src/index.css` (`bajero-marquee`, `bg-fade-in`).
- Anota: ritmo vertical, escala `display-xl/lg` vs `body`, contraste de texto sobre `bg-festival`/`bg-cream`/`bg-ink`, legibilidad de imágenes con texto quemado (`public/assets/carrusel`).

### 2) Pulido visual con tokens existentes
- **Color:** usa solo tokens (`yellow`, `red`, `orange`, `verde`, `cream`, `ink`, `blue`). Si falta un matiz, deriva con opacidad (`bg-verde/10`) no hex nuevo.
- **Forma/sombra:** `rounded-sticker` / `rounded-pill` / `rounded-badge` + `shadow-soft` → `shadow-soft-lg` en hover.
- **Tipografía:** `font-display` para títulos, `font-body` para lectura.

### 3) Layout responsive y assets
- Imágenes: `public/assets/carrusel` es `object-cover` en `aspect-[4/5]` marquee continuo; `public/assets/iconos` es `object-contain` con fondo `bg-white` + `shadow-soft`.
- Cintas marquee: `StoryCarousel` y `MarqueeStrip` duplican track `[..., ...]` y animan `translateX(-50%)`.

### 4) Límites
- **No tocar:** `src/modules/module2-future` portal/z-index, lógica Pointer Events del poster (`usePosterState` + `activeStickerId`), normalización de assets (`public/assets` vs `src/assets` raw).
- Cambios solo en componentes v2 y estilos; no crear nuevas dependencias.

## Entregable esperado
- Lista de archivos tocados con `file:line`.
- Diff mínimo, coherente con `DESIGN-MIGRATION-V4.md`.
- `npm run build` sin errores.

## Comando de verificación
```bash
npm run build
npm run dev # revisar hero → marquee → carrusel → módulos → footer
```
