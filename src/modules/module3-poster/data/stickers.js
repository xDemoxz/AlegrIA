import { asset } from '../../../lib/asset';

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
    image: asset('assets/iconos/01-alegria.webp'),
    variants: [
      { name: 'Amarillo', color: '#F2B807', image: asset('assets/iconos/01-alegria.webp') },
      { name: 'Verde', color: '#1E8C86', image: asset('assets/iconos/01-alegria-2.webp') },
      { name: 'Azul', color: '#1DB3E7', image: asset('assets/iconos/01-alegria-3.webp') },
    ],
  },
  {
    id: 'st-flores',
    label: 'Trinitarias',
    bg: '#F2B807',
    pattern: null,
    image: asset('assets/iconos/02-flores.webp'),
    variants: [
      { name: 'Original', color: '#F2B807', image: asset('assets/iconos/02-flores.webp') },
      { name: 'Rojo', color: '#E02828', image: asset('assets/iconos/02-flores-2.webp') },
      { name: 'Fucsia', color: '#D946EF', image: asset('assets/iconos/02-flores-3.webp') },
    ],
  },
  {
    id: 'st-turbo',
    label: 'Turbo',
    bg: '#121212',
    pattern: null,
    image: asset('assets/iconos/03-turbo.webp'),
    variants: [
      { name: 'Azul', color: '#1DB3E7', image: asset('assets/iconos/03-turbo.webp') },
      { name: 'Violeta', color: '#8B5CF6', image: asset('assets/iconos/03-turbo-2.webp') },
      { name: 'Negro', color: '#121212', image: asset('assets/iconos/03-turbo-3.webp') },
    ],
  },
  {
    id: 'st-ponchera',
    label: 'Ponchera',
    bg: '#A81212',
    pattern: null,
    image: asset('assets/iconos/04-ponchera.webp'),
    variants: [
      { name: 'Naranja', color: '#F97316', image: asset('assets/iconos/04-ponchera.webp') },
      { name: 'Rojo', color: '#E02828', image: asset('assets/iconos/04-ponchera-2.webp') },
      { name: 'Carmesi', color: '#991B1B', image: asset('assets/iconos/04-ponchera-3.webp') },
    ],
  },
  {
    id: 'st-raspao',
    label: 'Raspao',
    bg: '#1DB3E7',
    pattern: null,
    image: asset('assets/iconos/05-raspao.webp'),
    variants: [
      { name: 'Celeste', color: '#38BDF8', image: asset('assets/iconos/05-raspao.webp') },
      { name: 'Amarillo', color: '#F2B807', image: asset('assets/iconos/05-raspao-2.webp') },
      { name: 'Dorado', color: '#FCD34D', image: asset('assets/iconos/05-raspao-3.webp') },
    ],
  },
  {
    id: 'st-calados',
    label: 'Calados',
    bg: '#FDF6E3',
    pattern: 'calado',
    image: asset('assets/iconos/06-calados.webp'),
    variants: [
      { name: 'Crema', color: '#FDF6E3', image: asset('assets/iconos/06-calados.webp') },
      { name: 'Gris claro', color: '#E5E7EB', image: asset('assets/iconos/06-calados-2.webp') },
      { name: 'Gris oscuro', color: '#374151', image: asset('assets/iconos/06-calados-3.webp') },
    ],
  },
  {
    id: 'st-mariposas',
    label: 'Mariposas',
    bg: '#FFDC43',
    pattern: null,
    image: asset('assets/iconos/07-mariposas.webp'),
    variants: [],
  },
];