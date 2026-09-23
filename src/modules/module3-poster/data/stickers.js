/**
 * Estampitas del generador de pósters (Módulo 3) — arte real con variantes de color.
 * Fuente: public/assets/iconos (19 HQ normalizados desde src/assets/ICONOS TRADICON BAJERA 2026).
 * Cada motivo trae su imagen PNG monocroma sobre alfa. Variantes permiten cambiar el color.
 */
export const STICKERS = [
  {
    id: 'st-alegria',
    label: 'Alegría',
    bg: '#F2B807',
    pattern: null,
    image: '/assets/iconos/01-alegria.png',
    variants: [
      { name: 'Amarillo', image: '/assets/iconos/01-alegria.png' },
      { name: 'Verde', image: '/assets/iconos/01-alegria-2.png' },
      { name: 'Azul', image: '/assets/iconos/01-alegria-3.png' },
    ],
  },
  {
    id: 'st-flores',
    label: 'Trinitarias',
    bg: '#F2B807',
    pattern: null,
    image: '/assets/iconos/02-flores.png',
    variants: [
      { name: 'Original', image: '/assets/iconos/02-flores.png' },
      { name: 'Rojo', image: '/assets/iconos/02-flores-2.png' },
      { name: 'Fucsia', image: '/assets/iconos/02-flores-3.png' },
    ],
  },
  {
    id: 'st-turbo',
    label: 'Turbo',
    bg: '#121212',
    pattern: null,
    image: '/assets/iconos/03-turbo.png',
    variants: [
      { name: 'Azul', image: '/assets/iconos/03-turbo.png' },
      { name: 'Violeta', image: '/assets/iconos/03-turbo-2.png' },
      { name: 'Negro', image: '/assets/iconos/03-turbo-3.png' },
    ],
  },
  {
    id: 'st-ponchera',
    label: 'Ponchera',
    bg: '#A81212',
    pattern: null,
    image: '/assets/iconos/04-ponchera.png',
    variants: [
      { name: 'Naranja', image: '/assets/iconos/04-ponchera.png' },
      { name: 'Rojo', image: '/assets/iconos/04-ponchera-2.png' },
      { name: 'Carmesi', image: '/assets/iconos/04-ponchera-3.png' },
    ],
  },
  {
    id: 'st-raspao',
    label: 'Raspao',
    bg: '#1DB3E7',
    pattern: null,
    image: '/assets/iconos/05-raspao.png',
    variants: [
      { name: 'Celeste', image: '/assets/iconos/05-raspao.png' },
      { name: 'Amarillo', image: '/assets/iconos/05-raspao-2.png' },
      { name: 'Dorado', image: '/assets/iconos/05-raspao-3.png' },
    ],
  },
  {
    id: 'st-calados',
    label: 'Calados',
    bg: '#FDF6E3',
    pattern: 'calado',
    image: '/assets/iconos/06-calados.png',
    variants: [
      { name: 'Crema', image: '/assets/iconos/06-calados.png' },
      { name: 'Gris claro', image: '/assets/iconos/06-calados-2.png' },
      { name: 'Gris oscuro', image: '/assets/iconos/06-calados-3.png' },
    ],
  },
  {
    id: 'st-mariposas',
    label: 'Mariposas',
    bg: '#FFDC43',
    pattern: null,
    image: '/assets/iconos/07-mariposas.png',
    variants: [],
  },
];