# Variables de entorno — AlegrIA

**Fecha:** 2026-11-18
**Proyecto:** Vite + React (SPA). No tiene backend propio.

## Cómo se cargan

- Vite lee `.env`, `.env.local` y `.env.[modo]` desde la raíz del proyecto.
- **Solo las variables con prefijo `VITE_` llegan al navegador.** Se insertan en tiempo de **build**: si cambias una, hay que reconstruir (`npm run build`) o reiniciar `npm run dev`.
- `.env` y `.env.local` están en `.gitignore`; el repo versiona `.env.example`.
- Existe `AlegrIA/.env.example`, pero `VITE_AR_URL` viene vacía.

## Variables de la aplicación

| Variable | ¿Obligatoria? | Dónde se usa | Ejemplo | Descripción |
|---|---|---|---|---|
| `VITE_AR_URL` | **Condicional** (obligatoria para AR real) | Build / navegador — `src/modules/module4-ar/arPieces.js:27`, `src/pages/RAExperiencePage.jsx` | `https://tu-experiencia.zappar.io/...` | URL pública de la experiencia publicada en Mattercraft/ZapWorks que se embebe en `/ra`. Si falta o está vacía, `/ra` muestra un aviso técnico para desarrollador. |

No hay ninguna otra variable `VITE_*` en el código.

## Variables automáticas de Vite (no se definen en `.env`)

| Variable | Uso | Nota |
|---|---|---|
| `BASE_URL` | `src/modules/module1-timeline/timelineAudio.js:10` para resolver el MP3 | La provee Vite; cambia si despliegas en un subdirectorio (`base` en `vite.config.js`). |
| `MODE`, `DEV`, `PROD` | No usadas actualmente | Disponibles por Vite. |

## Variables de herramientas (CI / local)

| Variable | ¿Obligatoria? | Uso |
|---|---|---|
| `PLAYWRIGHT` | No | `vite.config.js`: evita abrir el navegador cuando los E2E levantan el servidor. Playwright la define solo. |
| `CI` | No | `playwright.config.js:29`: si está definida, no reutiliza un servidor ya levantado. La define el CI. |
| `VITE_BASE` | No | `vite.config.js`: base pública del sitio. Por defecto `/`; en GitHub Pages bajo subdirectorio, `VITE_BASE=/AlegrIA/ npm run build`. |

## `.env` mínimo para local

```bash
# Copiar .env.example -> .env
VITE_AR_URL=
# Solo si se publica en un subdirectorio (GitHub Pages):
# VITE_BASE=/AlegrIA/
```

Para probar AR:

```bash
VITE_AR_URL=https://tu-experiencia-publicada.example.com/
```

## Notas importantes

- `VITE_AR_URL` debe ser **HTTPS**: el iframe pide cámara/sensores y el navegador lo bloquea en HTTP.
- Todo lo que empiece por `VITE_` es **público** (visible en el bundle). No pongas ahí claves, tokens ni secretos.
- Si despliegas en GitHub Pages u otro subdirectorio, además de `base` revisa que la URL del MP3 (`${BASE_URL}audios/...`) resuelva.
- No hay `.env` en el repo; si clonas, crea uno a partir de `.env.example`.
