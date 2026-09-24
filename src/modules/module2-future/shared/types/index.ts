/**
 * Core domain types for the AlegrIA 3D experience.
 */

export type GamePhase = 'idle' | 'exploring' | 'wormhole' | 'museum'

export interface PlayerPosition {
  x: number
  z: number
}

export interface Bounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export interface KeysState {
  w: boolean
  a: boolean
  s: boolean
  d: boolean
  shift: boolean
}

export interface ModelEntry {
  path: string
  fallback: string
}

export type ModelRegistry = Record<string, ModelEntry>
