/**
 * Central application configuration for the 3D experience.
 */

import type { Bounds } from '../types'

export const playerConfig = {
  walkSpeed: 2.8,
  sprintSpeed: 4.5,
  eyeHeight: 1.7,
  startPosition: { x: 0, y: 1.7, z: 9 } as const,
  startLookAt: { x: 0, y: 1.2, z: 0 } as const,
  interactDistance: 2.4,
  pedestalRadius: 1.05,
  libraryBounds: { minX: -9.2, maxX: 9.2, minZ: -9.2, maxZ: 9.2 } as Bounds,
  museumBounds: { minX: -11.5, maxX: 11.5, minZ: -11.5, maxZ: 11.5 } as Bounds,
} as const

export const wormholeConfig = {
  durationMs: 4200,
  fov: { from: 74, to: 112, lerp: 0.08 },
  ringCount: 46,
  starCount: 520,
  shake: { x: 0.08, y: 0.06 },
} as const

export const renderConfig = {
  dpr: [1, 1.8] as [number, number],
  shadows: { pedestal: 1024, museum: 2048 },
  gl: { antialias: true },
} as const

export const appConfig = {
  player: playerConfig,
  wormhole: wormholeConfig,
  render: renderConfig,
} as const

export type AppConfig = typeof appConfig
