# Auditoría técnica — AlegrIA / Barrio Abajo del Río

**Fecha:** 2026-11-18
**Rama auditada:** `feature/module3-poster-mobile`
**HEAD:** `d155759` — *feat(module3): poster usable en mobile (tocar/arrastrar, layout sticky) y guardado en el dispositivo + tests*
**Alcance:** revisión de solo lectura de código, configuración, documentación, pruebas y git. No se modificó código, configuración ni dependencias. Este archivo es la única escritura realizada.

---

## 0. Estado de ejecución del plan (actualizado 2026-11-18)

El diagnóstico de las secciones siguientes es el **original** sobre `d155759`. El plan P0–P2 ya se ejecutó en `develop`; este bloque resume el estado verificable al cierre:

- **P0 — despliegue y AR:** `base` configurable (`VITE_BASE`), `404.html`, `vercel.json` y `_redirects`; `/ra` valida `VITE_AR_URL` (solo HTTPS; localhost en dev), usa `sandbox` acotado, timeout de 15 s y aviso de “no disponible” sin instrucciones técnicas.
- **P1 — calidad:** ESLint + CI (`lint`, `test`, `build`); ciclo de vida completo de M1 (geometría, material y texturas liberados); póster operable con teclado y diálogo con foco atrapado; carrusel con pausa y `prefers-reduced-motion`; contraste del footer corregido; skip link, scroll restoration y semántica del timeline.
- **P1.8 — rendimiento:** M1 con `React.lazy` + `IntersectionObserver`, chunks separados de three/gsap y texturas por era; carrusel, timeline, logos e iconos en WebP; fuentes (Bebas Neue, Work Sans y Caveat) auto-hospedadas. Chunk inicial ~227 kB; `dist` ~10 MB (5,7 MB del MP3).
- **P1.10 — pruebas:** 61 tests de Vitest (rutas, header, scroll, export PNG/colores, URL AR) y 14 escenarios de Playwright en Pixel 7 e iPhone emulado.
- **P2 — limpieza y documentación:** eliminados componentes/store/dependencias sin uso, originales movidos a `design/source`, README/CLAUDE/INFORME actualizados.

Comandos de verificación al cierre: `npm run lint` (0 warnings), `npm test` (61/61), `npm run build` y `npm run test:e2e` (14/14).

---

## 1. Resumen ejecutivo

El proyecto está **funcionalmente mucho más avanzado que lo que describen sus documentos**: el scrollytelling de la línea de tiempo, el póster móvil con exportación PNG y el teaser/iframe de AR ya existen y compilan. La suite Vitest pasa completa (**35/35**) y `vite build` termina sin errores, aunque con advertencia de chunk >500 kB.

Los problemas principales ya no son de “módulos sin integrar” (las ramas históricas están fusionadas en este HEAD), sino de **calidad de entrega**:

1. **Documentación obsoleta y contradictoria** (README, `INFORME_INCONSISTENCIAS.md`, `CLAUDE.md`, `scripts/design.md`) que describe un estado de ramas y de arquitectura que ya no existe.
2. **Accesibilidad incompleta** en póster (galerías solo con `pointerdown`), carrusel (animación sin pausa/reduced-motion), timeline (contenido visible en un `aria-hidden`, controles invisibles focusables) y contraste del footer.
3. **Rendimiento**: bundle principal de **837 kB** minificado (~1,1 MB de JS total), **26 MB** de `dist`, texturas de timeline cargadas todas de golpe y carrusel con ~3,4 MB de PNG eager.
4. **Fragilidad operativa**: sin configuración ESLint (`npm run lint` falla), sin CI, sin pruebas para Módulo 1/2/4 ni rutas, sin `ErrorBoundary` para WebGL y sin estrategia de despliegue/fallback SPA verificable.
5. **AR no es funcional por defecto**: depende de `VITE_AR_URL`, que no está definida; `/ra` muestra instrucciones para desarrollador.

**Veredicto:** apto para demo controlada en localhost; **no listo para publicación sin resolver P0/P1**.

---

## 2. Estado por módulo

| Módulo | Implementado | Brechas / riesgos | Estado |
|---|---|---|---|
| Home (`/`) | Header hide-on-scroll, carrusel, mural, timeline + teaser, footer (`src/pages/HomeApp.jsx:30-88`) | Carrusel sin pausa permanente ni reduced-motion; contraste footer; peso de imágenes | 🟡 Parcial |
| M1 — Timeline | Scrollytelling GSAP + pin + snap, Three.js/shader, audio en bucle, teclado (`engine.js`, `timelineAudio.js`, `index.jsx`) | Sin tests; fuga de GPU al remontar; a11y del contenido; doble boot a los 2,5 s; sin manejo de fallo WebGL | 🟡 Parcial |
| M2 — Futuro | Teaser + enlace externo a GitHub Pages (`module2-future/index.jsx:51-62`) | Sin experiencia local (decisión documentada); URL fija; sin fallback si el sitio externo cae | 🟢 Según diseño |
| M3 — Póster | Fondos + estampitas múltiples, drag/tap, variantes, escala, borrado, export 1080×1920, guardado móvil (`module3-poster/*`) | Galerías no operables por teclado; diálogo sin foco atrapado/Escape; sin persistencia (no exigida) | 🟢 Casi completo |
| M4 — AR | Teaser con 9 piezas y ruta `/ra` con iframe (`module4-ar`, `RAExperiencePage.jsx`) | `VITE_AR_URL` vacía por defecto; iframe sin `sandbox`; spinner infinito si falla la carga | 🟡 Dependiente de config |
| Diseño v2 | Tailwind v4 CSS-first, tokens, `shadow-soft` (`theme.v4.css`) | `StoryCarousel` y `HomeMuralBanner` conservan `border-4 border-ink`; `tokens.json` sigue en v1 | 🟡 Inconsistente |
| Rutas | `/`, `/poster`, `/ar`, `/ra` (`App.jsx:31-43`) | Sin ruta `*` (404 en blanco); sin scroll restoration; fallback SPA no verificable | 🟡 Parcial |
| Store | `useAppStore` con secciones y flags (`useAppStore.js:13-47`) | `next/prev/goTo`, `audioEnabled`, `gestureControlEnabled` y toggles no se usan fuera del store | 🔴 Casi muerto |

---

## 3. Requisitos/documentos vs implementación

| Requisito o afirmación documental | Evidencia del desfase | Prioridad |
|---|---|---|
| README: arquitectura y flujo por store | `README.md:17` lista `MarqueeStrip` (no existe) y `README.md:29` cita `tailwind.config.js` (eliminado). `README.md:40-51` describe navegación por store; la app usa rutas (`App.jsx:31-43`). | P2 |
| README: hitos desde `barrioAbajoData.json` | El JSON no se importa en ningún sitio; la fuente real es `src/data/timelineHitos.js` (`module1-timeline/index.jsx:3`). | P2 |
| INFORME: “ramas divergentes nunca integradas” | Verificado el 2026-11-18: `feature/tailwind-v4`, `jose`, `module2-3d-integration` y `fix/footer-position` son ancestros de HEAD (`git merge-base --is-ancestor`). El informe (líneas 4, 44-57) describe otro estado. | P2 |
| INFORME: `ModuleNav` no montado | Sigue sin montarse, pero fue sustituido por `HeaderBanner` (`HomeApp.jsx:72`); el hallazgo ya no aplica como bug de navegación. | P2 |
| CLAUDE: póster “reemplaza todo el fondo” y usa `activeStickerId` | El código actual separa fondo y estampitas: `usePosterState.js:12-18,36-49`; no existe `activeStickerId`. | P2 |
| CLAUDE: AR “no implementado todavía” | Existe teaser + `/ra` (`module4-ar/index.jsx:18-80`, `RAExperiencePage.jsx:34-101`). | P2 |
| `scripts/design.md`: “accesibilidad básica” | No se cumple en póster, carrusel, timeline ni contraste (ver §4.4). | P1 |
| `scripts/design.md`: componentes v2 y `MarqueeStrip` | `MarqueeStrip` no existe; `SectionRule` y `HomeMuralBanner` siguen con bordes v1 (`SectionRule.jsx:4`, `HomeMuralBanner.jsx:8`). | P2 |
| AR con cámara funcionando | `.env.example:6` deja `VITE_AR_URL=` vacío; `arPieces.js:27-28` devuelve cadena vacía; `/ra` muestra el aviso técnico (`RAExperiencePage.jsx:51-62,103-118`). | P0/P1 |
| Cobertura de pruebas de todos los módulos | Solo hay tests de Módulo 3 (`src/**/*.test.*`); M1, M2, M4, home, header, footer y rutas no tienen pruebas. | P1 |
| Lint ejecutable | `package.json:10` define `lint`, pero no existe `.eslintrc*` ni `eslint.config.*`; `npm run lint` falla con “couldn't find a configuration file”. | P1 |
| Narración por hito | Existe guion (`narraciones-hito-2026.md`) pero `timelineAudio.js` solo reproduce música de fondo; no hay audio por hito. Requisito no confirmado. | P2 |

---

## 4. Errores, riesgos y deuda técnica

### 4.1 Rutas y despliegue
- **Sin ruta comodín**: `App.jsx:31-43` no define `path="*"`; una URL desconocida renderiza una pantalla vacía. Debe existir 404 o redirección.
- **Fallback SPA no verificable**: no hay `public/404.html`, `vercel.json`, `netlify.toml` ni workflow. Si se publica en hosting estático (p. ej. GitHub Pages), refrescar `/poster`, `/ar` o `/ra` puede devolver 404. No es determinable desde el repo si el hosting hace rewrites.
- **Assets absolutos**: `vite.config.js` no define `base`; rutas como `/assets/...` (`timelineHitos.js:7`) y `BrowserRouter` fallarían bajo subruta. Solo el audio usa `BASE_URL` (`timelineAudio.js:9-11`).
- **Sin restauración de scroll** al navegar entre rutas; volver al home puede aterrizar a mitad de página.

### 4.2 Módulo 1 (timeline)
- **Fuga de recursos GPU**: el cleanup solo llama `renderer.dispose()` (`engine.js:1015`); no libera `geometry` (`:81`), `material` (`:136`) ni las 11 texturas (`:124-134`). Cada remontaje (StrictMode, resize, “heal”) vuelve a crear escena y texturas.
- **Remontaje garantizado a los 2,5 s**: `module1-timeline/index.jsx:64-74` destruye y reinicializa siempre, incluso si la geometría no cambió; puede producir salto de scroll y trabajo WebGL duplicado.
- **Fallo WebGL no controlado**: `new THREE.WebGLRenderer` (`engine.js:67`) puede lanzar si no hay contexto; no hay try/catch ni `ErrorBoundary`, y el fallo tumbaría el home completo.
- **Contenido visible fuera del árbol accesible**: `#fullview-card` (la tarjeta que realmente se ve) está `aria-hidden="true"` (`index.jsx:133`), mientras las `.info-card` internas quedan en `opacity:0` (`Timeline.css:625-637`) y no son animadas por el engine. Resultado: el texto visible no se expone y el texto oculto sí (duplicado y desincronizado).
- **Controles invisibles focusables**: `#hud` y `#progress` arrancan con `opacity:0` (`Timeline.css:64-75,711-719`) pero sus botones siguen en el orden de tabulación; el botón de audio además fuerza `pointer-events-auto` (`index.jsx:111`).
- **Interacción wheel + snap + tween** (`engine.js:582-692` y `:877-920`): lógica compleja sin pruebas; riesgo de doble salto o desincronización en trackpads. No verificado en navegador durante esta auditoría.
- **Reduced motion parcial**: `reduceMotion` solo calma el shader (`engine.js:19,145,284`); las transiciones programadas siguen durando 2,4–2,8 s (`:459-470`). No hay recorrido alternativo sin pin.
- **Audio**: 5,9 MB con `preload='auto'` (`timelineAudio.js:40`); el estado `waitingForInteraction` se asigna pero nunca se lee (`:23,118,124,150`); no hay control de volumen ni preferencia persistida. El archivo no tiene licencia en el repo (ver §4.6).

### 4.3 Módulo 3 (póster)
- **Galerías no operables por teclado**: los botones de estampita y fondo solo escuchan `onPointerDown` (`PosterSticker.jsx:45`, `PosterBackground.jsx:12`); Enter/Espacio disparan `click`, que no tiene handler. Un usuario de teclado no puede añadir nada.
- **Diálogo de resultado sin gestión de foco**: `role="dialog" aria-modal="true"` (`PosterResultSheet.jsx:33-34`) pero sin foco inicial, sin trampa de foco, sin Escape y sin bloquear el scroll de fondo; el foco queda detrás del modal.
- **Selección solo por puntero**: los controles −/+/✕ solo aparecen tras `pointerdown` en la estampita (`PosterPreview.jsx:95-98`); no hay equivalente por teclado.
- **Posible fidelidad de export**: al detectar `oklab/oklch`, el clon reemplaza la declaración completa por `transparent` (`exportPoster.js:126-131`). Si el navegador reporta un color de texto en `oklch`, el texto podría desaparecer del PNG. El e2e verifica cantidad de colores, no legibilidad del título; **no confirmado**.
- **Ghost de arrastre**: listeners globales sin `pointer capture`; si se pierde el `pointerup` fuera de ventana, el ghost puede quedar hasta el siguiente `pointercancel` (bajo riesgo).
- Código muerto roto: `PosterVariantSelect.jsx:16-18` compara índice numérico con `e.target.value` string y llama `onSelect(-1)`; no está importado en ningún sitio.

### 4.4 Accesibilidad
- **Carrusel**: animación infinita de 38 s (`StoryCarousel.jsx:37`) sin botón de pausa permanente y sin `prefers-reduced-motion`; pausar solo funciona con hover/touch (`:24-27`). Incumple el criterio de contenido en movimiento de WCAG 2.2.2.
- **Contraste footer**: blanco sobre el tramo naranja `#F26522` da **3,15:1**; el texto es de 13 px y además `opacity-85` (`FooterBajero.jsx:15,31`), por debajo del 4,5:1 de AA. El tramo rojo sí cumple (~4,66:1).
- **Sin “saltar al contenido”**: existe `id="main-content"` (`HomeApp.jsx:81`) pero ningún enlace skip.
- **Ayudas repetidas**: los cuatro botones “?” tienen el mismo nombre accesible “Ayuda” (`PosterForm.jsx:15-22`); conviene `aria-controls`/nombre específico.
- **Timeline**: además de §4.2, `aria-hidden` en canvas/grano/rail es correcto, pero el contenido narrativo no lo es.
- No hay `eslint-plugin-jsx-a11y` ni pruebas automatizadas de accesibilidad (axe).

### 4.5 Rendimiento
- Build real: `dist` **26 MB**; JS total **~1,1 MB**; chunk principal **837 kB** minificado; Vite advierte >500 kB. `three` + `gsap` entran en el bundle inicial porque el home importa M1 de forma eager (`modules/home/index.jsx:1`, `App.jsx:3`).
- Timeline: `TextureLoader` descarga las **11** imágenes completas al iniciar (`engine.js:124-134`) aunque el DOM use `loading="lazy"` (`:317,357`); además duplica nodos `<img>` (overview + hitos) → ~22 imágenes en DOM.
- Carrusel: primeras 5 imágenes `eager` (`StoryCarousel.jsx:50`), ~3,4 MB de PNG; `c5.png` solo pesa 997 kB.
- Assets públicos: `public/assets` 19 MB + `public/audios` 5,7 MB. Varios logos (`logo-2..5-expo`, `logo-festival-2..4`, `logo-riwi.png`) no se usan en código.
- Fuentes: tres `@import` externos (`index.html:7-10`, `theme.v4.css:6`, `Timeline.css:1`) con Bebas/Work Sans, Cinzel/Inter y Caveat; bloquean render y añaden dependencia de Google Fonts.
- `lenis` está instalado (`package.json:18`) pero no se importa en ningún archivo.

### 4.6 Seguridad y configuración
- **Sin secretos versionados**: no se encontraron API keys/tokens; `.env` no existe y está en `.gitignore:3-4`; `.env.example` solo declara `VITE_AR_URL` (pública por diseño).
- **Iframe AR sin `sandbox`** (`RAExperiencePage.jsx:52-59`) y con `microphone`, `camera`, `xr-spatial-tracking` delegados. Si `VITE_AR_URL` se configura mal o el origen se compromete, se concede más capacidad de la necesaria. Recomendado: validar origen, `sandbox` y `allow` mínimo.
- **Iframe sin timeout/error**: si la URL no carga, `onLoad` no llega y el spinner queda indefinidamente (`:64-69`).
- **`innerHTML` con datos**: `engine.js:303-328,351-380,558-565` interpola `timelineHitos`. Hoy son datos locales confiables; se vuelve XSS si la fuente pasa a CMS/API.
- **Licencia de audio**: se distribuye “Totó La Momposina - El Pescador.mp3” (5,9 MB) sin LICENSE/COPYING ni atribución en el repo. No es posible determinar los derechos desde el código; verificar antes de publicar.
- **Dependencias externas**: Módulo 2 apunta a `https://zerik-official.github.io/AlegrIA-3D/` hardcodeado (`module2-future/index.jsx:52`), sin configuración por entorno ni fallback.
- No hay headers de seguridad/CSP porque no hay configuración de hosting en el repo (no determinable).

---

## 5. Calidad y pruebas

**Ejecutado durante la auditoría (comandos rápidos):**

| Comando | Resultado |
|---|---|
| `npx vitest run` | ✅ 3 archivos, **35 tests pasan** (1,28 s) |
| `npx vite build --logLevel warn` | ✅ compila; ⚠️ chunk >500 kB |
| `npm run lint` | ❌ sin archivo de configuración ESLint |
| `git status` | ✅ limpio, sin cambios pendientes |

**Cobertura real:**
- Solo Módulo 3: `usePosterState.test.js` (5), `exportPoster.test.js` (15), `Module3Poster.test.jsx` (15).
- E2E: únicamente `e2e/poster-mobile.spec.js` (7 escenarios, Android + iPhone emulado sobre Chromium). **No se ejecutó** en esta auditoría porque requiere levantar Vite y navegadores.
- Sin pruebas de: engine/timeline, audio, shaders, Header/Footer, Home, rutas, store, teaser M2, AR, iframe, 404.
- Sin `coverage` configurado, sin CI (`.github/` no existe), sin `typecheck` (no hay archivos TS aunque `tsconfig.json` y `typescript` sigan presentes).

**Configuración:** Vite y Playwright están bien encaminados (jsdom + setup de PointerEvent, projects móviles). Falta ESLint, CI y una prueba de humo de navegación entre las cuatro rutas.

---

## 6. Git y trabajo reciente

- `git status`: limpio; rama sincronizada con `origin/feature/module3-poster-mobile`.
- HEAD `d155759` es **1 commit por delante de `origin/develop`** (`dc4fc00`); no hay `develop` local.
- `main` diverge: 4 commits exclusivos de `main` y 6 de esta rama (según `git rev-list --left-right --count main...HEAD`). Si se publica desde `main`, falta todo el trabajo reciente.
- Las ramas que los documentos dan por “no mergeadas” ya son ancestros de HEAD; el diagnóstico de `INFORME_INCONSISTENCIAS.md` y el plan de `CLAUDE.md` están resueltos y deben archivarse/actualizarse.
- Último commit: póster móvil + tests + Playwright; es el trabajo más reciente y el mejor cubierto.

---

## 7. Plan priorizado

### P0 — Bloqueantes de publicación
1. **Definir y verificar despliegue SPA.** Configurar `base` si aplica, rewrites/404 para `/poster`, `/ar`, `/ra`, y comprobar assets bajo la ruta pública.
   *Aceptación:* en un servidor estático limpio, abrir/refrescar cada ruta devuelve la app (no 404), sin recursos 404 en consola.
2. **AR configurada o degradada con elegancia.** Definir `VITE_AR_URL` en el entorno de despliegue y sustituir el aviso técnico de `MissingUrlNotice` por un mensaje de usuario con salida clara.
   *Aceptación:* `/ra` abre la experiencia en móvil con permiso de cámara; sin URL, muestra “experiencia no disponible” y botón de volver, sin instrucciones de desarrollo.

### P1 — Calidad y accesibilidad
3. **ESLint + CI mínimo.** Añadir `eslint.config.js` (flat, React/hooks/a11y) y workflow `lint + vitest + build`; opcional Playwright.
   *Aceptación:* `npm run lint` sale 0 y el workflow pasa en un PR limpio.
4. **Robustez y ciclo de vida de M1.** Liberar geometría/material/texturas en cleanup, proteger la creación de WebGL con try/catch y `ErrorBoundary`, y eliminar el remontaje incondicional de 2,5 s (solo si hay drift real).
   *Aceptación:* navegar home → póster → home cinco veces no deja errores de consola ni crecimiento sostenido de memoria; sin WebGL, el home sigue renderizando.
5. **Accesibilidad del póster.** Añadir `onClick`/teclado a galerías, foco inicial + trampa + Escape + bloqueo de scroll en `PosterResultSheet`, y selección de estampita por teclado.
   *Aceptación:* flujo completo “elegir fondo, añadir/mover/quitar estampita, guardar y cerrar” solo con teclado; axe sin violaciones críticas.
6. **Carrusel accesible.** Botón visible de pausa/reanudar y respeto de `prefers-reduced-motion` (detener animación).
   *Aceptación:* la animación se puede pausar sin hover y no arranca con reduced-motion.
7. **Contraste del footer.** Oscurecer el extremo naranja o usar texto oscuro/ink; eliminar `opacity` del texto pequeño.
   *Aceptación:* contraste ≥4,5:1 en todos los tramos del degradado (medido).
8. **Peso inicial.** Cargar M1 con `lazy`/dynamic import, convertir timeline/carrusel a WebP/AVIF con `srcset`, y cargar texturas bajo demanda.
   *Aceptación:* chunk inicial <500 kB y payload de imágenes de la primera pantalla <1,5 MB; sin advertencia de Vite.
9. **Semántica de M1.** Sacar `aria-hidden` de la tarjeta visible o sincronizar una sola tarjeta accesible; ocultar del tab order `#hud`/`#progress` cuando no estén activos.
   *Aceptación:* un lector de pantalla recorre un solo hito activo y el tabulador no entra en controles invisibles.
10. **Pruebas de humo de navegación.** E2E para `/`, `/poster`, `/ar`, `/ra` y 404; unit test de store/Header.
    *Aceptación:* CI cubre las cuatro rutas y una navegación de ida y vuelta.

### P2 — Deuda y documentación
11. Actualizar README/INFORME/CLAUDE/scripts: arquitectura por rutas, M1/M2/M4 reales, póster con estampitas sobre fondo, estado de ramas y comandos de test/lint.
12. Eliminar o archivar código muerto: `ModuleNav`, `SearchInput`, `MapPin`, `QuoteCard`, `StickerCard`, `TimelineRail`, `EmptyState`, `LoadingTejas`, `PopAlert`, `SectionRule`, `AudioToggle`, `PosterVariantSelect` (roto), `barrioAbajoData.json`; y la dependencia `lenis`.
13. Limpiar estado global no usado (`next/prev/goTo`, `audioEnabled`, `gestureControlEnabled`, toggles) o integrarlo; hoy el gesto se monta siempre en `/poster` (`PosterPage.jsx:25`).
14. Alinear estilos v1 restantes (`StoryCarousel.jsx:23`, `HomeMuralBanner.jsx:8`, `SectionRule.jsx:4`) y actualizar/eliminar `tokens.json` (sombras `pop-*` obsoletas).
15. Añadir ruta 404, scroll restoration y manejo de error/timeout del iframe AR; `sandbox` y validación de origen.
16. Revisar `tsconfig.json` (sin TS real), `defaultBrowserType` en Playwright y auto-hospedar fuentes; comprimir/eliminar logos no usados; añadir favicon/meta description.
17. Validar fidelidad del PNG con títulos/colores `oklch` y añadir una aserción de legibilidad del texto exportado.

---

## 8. Limitaciones de esta auditoría

- No se ejecutaron los E2E de Playwright (requieren servidor y navegadores), ni pruebas manuales en dispositivos reales.
- El comportamiento de WebGL, los gestos táctiles y la memoria GPU se evaluaron por lectura de código, no por profiling.
- No se pudo determinar el hosting de producción ni si existen rewrites/headers fuera del repo.
- No se verificaron derechos de uso de imágenes, logos ni del MP3; no hay archivo de licencia.
