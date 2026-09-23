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
      { name: 'Amarillo', color: '#F2B807', image: '/assets/iconos/01-alegria.png' },
      { name: 'Verde', color: '#1E8C86', image: '/assets/iconos/01-alegria-2.png' },
      { name: 'Azul', color: '#1DB3E7', image: '/assets/iconos/01-alegria-3.png' },
    ],
  },
  {
    id: 'st-flores',
    label: 'Trinitarias',
    bg: '#F2B807',
    pattern: null,
    image: '/assets/iconos/02-flores.png',
    variants: [
      { name: 'Original', color: '#F2B807', image: '/assets/iconos/02-flores.png' },
      { name: 'Rojo', color: '#E02828', image: '/assets/iconos/02-flores-2.png' },
      { name: 'Fucsia', color: '#D946EF', image: '/assets/iconos/02-flores-3.png' },
    ],
  },
  {
    id: 'st-turbo',
    label: 'Turbo',
    bg: '#121212',
    pattern: null,
    image: '/assets/iconos/03-turbo.png',
    variants: [
      { name: 'Azul', color: '#1DB3E7', image: '/assets/iconos/03-turbo.png' },
      { name: 'Violeta', color: '#8B5CF6', image: '/assets/iconos/03-turbo-2.png' },
      { name: 'Negro', color: '#121212', image: '/assets/iconos/03-turbo-3.png' },
    ],
  },
  {
    id: 'st-ponchera',
    label: 'Ponchera',
    bg: '#A81212',
    pattern: null,
    image: '/assets/iconos/04-ponchera.png',
    variants: [
      { name: 'Naranja', color: '#F97316', image: '/assets/iconos/04-ponchera.png' },
      { name: 'Rojo', color: '#E02828', image: '/assets/iconos/04-ponchera-2.png' },
      { name: 'Carmesi', color: '#991B1B', image: '/assets/iconos/04-ponchera-3.png' },
    ],
  },
  {
    id: 'st-raspao',
    label: 'Raspao',
    bg: '#1DB3E7',
    pattern: null,
    image: '/assets/iconos/05-raspao.png',
    variants: [
      { name: 'Celeste', color: '#38BDF8', image: '/assets/iconos/05-raspao.png' },
      { name: 'Amarillo', color: '#F2B807', image: '/assets/iconos/05-raspao-2.png' },
      { name: 'Dorado', color: '#FCD34D', image: '/assets/iconos/05-raspao-3.png' },
    ],
  },
  {
    id: 'st-calados',
    label: 'Calados',
    bg: '#FDF6E3',
    pattern: 'calado',
    image: '/assets/iconos/06-calados.png',
    variants: [
      { name: 'Crema', color: '#FDF6E3', image: '/assets/iconos/06-calados.png' },
      { name: 'Gris claro', color: '#E5E7EB', image: '/assets/iconos/06-calados-2.png' },
      { name: 'Gris oscuro', color: '#374151', image: '/assets/iconos/06-calados-3.png' },
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