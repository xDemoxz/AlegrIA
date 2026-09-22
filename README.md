# AlegrIA — Barrio Abajo del Río

Base de la experiencia (Fase 0/1). Sistema de diseño ya cargado en Tailwind + componentes reutilizables listos.

## Empezar

```bash
npm install
npm run dev
```

## Estructura

```
src/
├── components/          # Sistema de diseño convertido a React (no tocar salvo mejoras compartidas)
│   ├── layout/           HeaderBanner · MarqueeStrip · SectionRule · FooterBajero
│   ├── data/              StickerCard · QuoteCard · TimelineRail · MapPin
│   ├── controls/          PopButton · TimelineBadge · Chip · SearchInput · AudioToggle
│   ├── feedback/          PopAlert · Toast · EmptyState · LoadingTejas
│   └── motifs/            BaldosaPattern · TejaPattern · CaladoPattern
├── modules/              # Cada dev trabaja SOLO dentro de su carpeta — cero choques de merge
│   ├── module1-timeline/  Sebastián
│   ├── module2-future/    Gustavo
│   ├── module3-poster/    José Romero
│   └── module4-ar/        Nicolás
├── store/useAppStore.js  # Estado global (Zustand) — sección activa
├── data/barrioAbajoData.json  # Mock de hitos (temporal, hasta cerrar el .md de investigación)
└── styles/               # tokens.json, theme.v4.css (referencia), tailwind.config.js en la raíz
```

## Reglas del sistema de diseño (resumen)

- Un fondo dominante por pantalla + máximo dos acentos.
- Bordes/sombras siempre sólidos (sin blur, sin degradados suaves).
- Sombras en el mismo ángulo (abajo-derecha); rotaciones de sticker entre −2° y +2°.
- Bebas Neue solo en titulares/badges, nunca en párrafos ni bajo 18px.
- Motivos vernáculos (baldosa/teja/calado) como textura de fondo, máx. 20% de opacidad detrás de texto.

## Flujo entre módulos

Cada módulo cambia de sección llamando al store, por ejemplo:

```js
import { useAppStore } from '../../store/useAppStore';
const next = useAppStore((s) => s.next);
// ...al terminar el recorrido del módulo:
next();
```

No es necesario editar `App.jsx` ni `useAppStore.js` para trabajar dentro de un módulo.
