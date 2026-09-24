/**
 * Model registry for Blender-authored assets.
 * Paths resolve relative to Vite's public/ folder.
 */

import type { ModelRegistry } from '../types'

export const modelRegistry: ModelRegistry = {
  'library/bookshelf': { path: '/models/library/bookshelf.glb', fallback: 'procedural-bookshelf' },
  'library/scattered-book': { path: '/models/library/scattered-book.glb', fallback: 'procedural-scattered-book' },
  'pedestal/base': { path: '/models/pedestal/pedestal.glb', fallback: 'procedural-pedestal' },
  'pedestal/book': { path: '/models/pedestal/book.glb', fallback: 'procedural-book' },
  'museum/pedestal': { path: '/models/museum/pedestal-display.glb', fallback: 'procedural-museum-pedestal' },
  'museum/column': { path: '/models/museum/column.glb', fallback: 'procedural-column' },
  'museum/painting-frame': { path: '/models/museum/painting-frame.glb', fallback: 'procedural-painting' },
}
