# Migración a Tailwind v4 + Revisión Visual del Sistema de Diseño
### AlegrIA / Barrio Abajo del Río — Tour

## 1. Objetivo

Dos cosas en paralelo, porque están relacionadas:

1. **Migrar** el proyecto de Tailwind v3 (`postcss` + `tailwind.config.js`) a Tailwind v4 (`@tailwindcss/vite`, config CSS-first con `@theme`). Ya existe `src/styles/theme.v4.css` como borrador — este documento lo actualiza y lo convierte en el archivo real de tokens.
2. **Revisar la piel visual**: quitar el contorno negro grueso (`border-3/4 border-ink`, `shadow-pop-black`) que hoy envuelve casi todo, porque se ve más caricaturesco/cómic que patrimonial — y acercar la paleta y las formas a lo que Barrio Abajo Tour ya usa en sus propias piezas (ver referencia del post de septiembre).

No se toca la estructura de componentes ni la lógica — solo clases Tailwind y tokens.

## 2. Referencia visual (post oficial "Prográmate en Septiembre")

Lo que ese post hace que nuestro sistema actual no hace:

- **Sin contorno negro en ningún elemento.** Las tarjetas/badges se separan por color y por sombra suave (drop-shadow difuminado o ninguna sombra), no por un trazo de 3-4px en `#121212`.
- **Fondos fotográficos con overlay de color**, no bloques planos sólidos — el rojo/naranja del post es un degradado sobre la fotografía de las fachadas, no un `bg-red` plano.
- **Un verde-teal como color de marca** que hoy no existe en nuestra paleta — lo usan tanto en los badges de "TOUR" como en el isotipo de la marca. Es un teal profundo, no un verde flora/lima.
- **Tipografía bold redondeada** para los titulares ("PROGRÁMATE EN SEPTIEMBRE"), con trazo/stroke blanco fino alrededor del texto en vez de sombra dura desplazada.
- **Formas: rectángulos redondeados suaves** (radios generosos, ~16-20px), sin esquinas duras ni badges con pico.

Esto no significa abandonar la identidad "pop/sticker" — el amarillo, rojo, azul y naranja siguen siendo los mismos, igual que la tipografía display condensada. Lo que cambia es *cómo se delimitan* las formas: color y sombra suave en vez de contorno negro.

## 3. Paleta — token nuevo y ajustes

Muestreé el color del post (badges "TOUR" + isotipo de la marca): promedia en **`#2B938C` – `#339EA2`**. Lo propongo como nuevo token `verde` (o `teal`, como prefieras nombrarlo):

```
--color-verde: #1E8C86;        /* base */
--color-verde-light: #3CBAB3;  /* hover / variante clara */
--color-verde-dark: #0F5F5A;   /* texto sobre fondo claro, estados active */
```

> Ajusta el hex si el equipo tiene el archivo de marca original (logo vectorial) — esto es una muestra visual del post, no el valor oficial de marca.

El resto de la paleta (`yellow`, `red`, `blue`, `orange`, `ink`, `cream`) se queda igual — solo cambia cómo se usan `ink` y las sombras `pop-*` (ver sección 4).

## 4. Qué se retira / redefine

| Antes | Ahora |
|---|---|
| `border-3 border-ink`, `border-4 border-ink`, `outline outline-3 outline-ink` en casi toda tarjeta/botón/badge | Se elimina el borde negro. La forma se define por `bg-{color}` + `rounded-*` + una sombra suave |
| `shadow-pop-black` (`5px 5px 0 0 #121212`, offset duro) | Nueva sombra `shadow-soft` — `0 8px 20px -6px rgb(0 0 0 / 0.25)`, difuminada, sin contorno |
| `shadow-pop-red` / `shadow-pop-blue` (mismo offset duro, distinto color) | Se retiran o quedan solo como variante opcional para 1-2 acentos puntuales (p. ej. el botón de gestos), no como default |
| `border-b-4 border-ink` en header/marquee/nav (líneas separadoras negras) | `border-b border-{color}/20` (línea fina y sutil) o simplemente el cambio de color de fondo entre secciones, sin línea |
| Fondos planos sólidos (`bg-red`, `bg-yellow`) en headers grandes | Se mantienen como base, pero se puede superponer un degradado sutil (`bg-gradient-to-br from-red to-orange`) inspirado en el post, sobre todo en Header y Footer |

Lo que **se mantiene**: la tipografía display (Bebas Neue) en mayúsculas para titulares, los radios `sticker`/`badge`/`pill`, la rotación ligera de las estampitas del póster (eso sí es "sticker art" y no depende del contorno negro), y toda la paleta base.

## 5. `theme.v4.css` actualizado (borrador completo)

```css
@import "tailwindcss";

@theme {
  --color-yellow: #F2B807;
  --color-yellow-light: #FFDC43;
  --color-red: #E02828;
  --color-red-dark: #A81212;
  --color-blue: #1DB3E7;
  --color-blue-dark: #0A749A;
  --color-orange: #F26522;
  --color-verde: #1E8C86;
  --color-verde-light: #3CBAB3;
  --color-verde-dark: #0F5F5A;
  --color-ink: #121212;
  --color-cream: #FDF6E3;

  --font-display: 'Bebas Neue', 'Druk Wide', Impact, sans-serif;
  --font-body: 'Work Sans', 'Inter', system-ui, sans-serif;

  --text-display-xl: 4.5rem;
  --text-display-xl--line-height: 1;
  --text-display-xl--font-weight: 900;
  --text-display-xl--letter-spacing: -0.02em;
  --text-display-lg: 3.25rem;
  --text-display-lg--line-height: 1.05;
  --text-display-lg--font-weight: 800;
  --text-heading-md: 2rem;
  --text-heading-md--line-height: 1.2;
  --text-heading-md--font-weight: 700;
  --text-body-lg: 1.25rem;
  --text-body-lg--line-height: 1.5;
  --text-body-lg--font-weight: 500;

  --radius-sticker: 18px;
  --radius-badge: 10px;
  --radius-pill: 9999px;

  --shadow-soft: 0 8px 20px -6px rgb(18 18 18 / 0.25);
  --shadow-soft-lg: 0 14px 32px -8px rgb(18 18 18 / 0.28);
  --shadow-pressed: inset 0 2px 4px rgb(18 18 18 / 0.15);

  --ease-pop: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

Nota: `shadow-pop-black/red/blue/xl` y `shadow-sticker` (con el aro blanco + contorno negro) se retiran de los tokens — si algún componente puntual todavía quiere un acento tipo "sticker con borde", puede quedar como excepción local, no como default del sistema.

## 6. Pasos técnicos de la migración (Vite + Tailwind v4)

1. `npm install tailwindcss@latest @tailwindcss/vite@latest` (reemplaza `tailwindcss@^3.4.13`; ya no se necesita `postcss` ni `autoprefixer` como dependencias directas de Tailwind — v4 los trae integrados).
2. Borrar `tailwind.config.js` y `postcss.config.js` (v4 no los usa por defecto).
3. `vite.config.js`: agregar el plugin `@tailwindcss/vite`.
   ```js
   import tailwindcss from '@tailwindcss/vite';
   // dentro de plugins: [react(), tailwindcss()]
   ```
4. `src/index.css`: reemplazar las directivas `@tailwind base/components/utilities` por un solo `@import "./styles/theme.v4.css";` (que a su vez hace `@import "tailwindcss";` + el bloque `@theme`).
5. Con eso, todas las utilidades de color/tipografía/sombra (`bg-verde`, `text-display-xl`, `shadow-soft`, `rounded-sticker`, etc.) siguen funcionando igual que con `tailwind.config.js` — Tailwind v4 las genera desde `@theme`.
6. Confirmar que `npm run build` compile antes de tocar componentes — hacer el cambio de config primero, como commit/rama aparte de los cambios visuales.

## 7. Checklist de componentes con contorno negro a revisar

Estos son los archivos que hoy usan `border-ink`, `border-3/4`, `outline-ink` o `shadow-pop-*` (detectado por búsqueda en el repo) — cada uno es un punto donde aplicar el cambio de la sección 4:

- `src/App.jsx` — botón flotante de gestos
- `src/components/controls/PopButton.jsx` — botón primario/secundario/ghost
- `src/components/controls/Chip.jsx`
- `src/components/controls/GestureCursor.jsx`
- `src/components/controls/SearchInput.jsx`
- `src/components/data/StickerCard.jsx`
- `src/components/data/QuoteCard.jsx`
- `src/components/data/TimelineRail.jsx`
- `src/components/data/MapPin.jsx`
- `src/components/feedback/EmptyState.jsx`
- `src/components/feedback/Toast.jsx`
- `src/components/feedback/PopAlert.jsx`
- `src/components/feedback/LoadingTejas.jsx`
- `src/components/layout/HeaderBanner.jsx`
- `src/components/layout/MarqueeStrip.jsx`
- `src/components/layout/ModuleNav.jsx`
- `src/components/layout/FooterBajero.jsx`
- `src/components/layout/SectionRule.jsx`
- `src/modules/module2-future/index.jsx` (placeholder)
- `src/modules/module4-ar/index.jsx` (placeholder)
- `src/modules/module3-poster/PosterForm.jsx`, `PosterPreview.jsx`, `PosterSticker.jsx`, `index.jsx` (ghost de arrastre)

Sugerencia de orden de trabajo: primero los tokens (sección 5) y la config (sección 6) en una rama tipo `feature/tailwind-v4`, verificar que compile sin tocar componentes; después, en la misma rama o en `fix/*` puntuales, ir soltando el contorno negro componente por componente empezando por los más visibles (`HeaderBanner`, `PopButton`, `ModuleNav`, `FooterBajero`), probando visualmente cada uno.

## 8. Ejemplo concreto: `PopButton` antes → después

```diff
- 'bg-red text-white hover:bg-red-dark shadow-pop-black hover:shadow-[7px_7px_0_0_#121212] hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-pressed'
+ 'bg-red text-white hover:bg-red-dark shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-pressed'
```

```diff
- className={`cursor-pointer font-display text-2xl tracking-wide rounded-pill border-3 border-ink px-8 pt-4 pb-3 ...`}
+ className={`cursor-pointer font-display text-2xl tracking-wide rounded-pill px-8 pt-4 pb-3 ...`}
```

El mismo patrón (quitar `border-* border-ink` / `outline-ink`, cambiar `shadow-pop-*` por `shadow-soft`) aplica a cada archivo del checklist.
