/**
 * Fondos del generador de pósters (Módulo 3) — imágenes de public/assets/fondos.
 * El participante los arrastra al cartel y puede cambiarlos las veces que
 * quiera; las estampitas se colocan encima.
 *
 * tone: color del título/subtítulo para que se lea sobre el fondo
 *   ('light' = texto claro, 'dark' = texto oscuro).
 * position: object-position al recortar la imagen (el cartel es 9:16 y los
 *   fondos son ~3:4, así que se recortan los lados). En la máscara de plumas
 *   se ancla a la derecha para no cortar la máscara.
 */
export const BACKGROUNDS = [
  {
    id: 'bg-confeti',
    label: 'Confeti',
    image: '/assets/fondos/confeti-nocturno.webp',
    tone: 'light',
    position: 'center',
  },
  {
    id: 'bg-carnaval',
    label: 'Carnaval',
    image: '/assets/fondos/carnaval-amarillo.webp',
    tone: 'dark',
    position: 'center',
  },
  {
    id: 'bg-selva',
    label: 'Selva',
    image: '/assets/fondos/selva-tropical.webp',
    tone: 'light',
    position: 'center',
  },
  {
    id: 'bg-neon',
    label: 'Neón',
    image: '/assets/fondos/neon-festival.webp',
    tone: 'light',
    position: 'center',
  },
  {
    id: 'bg-mascara',
    label: 'Máscara',
    image: '/assets/fondos/mascara-plumas.webp',
    tone: 'light',
    position: 'right center',
  },
];
