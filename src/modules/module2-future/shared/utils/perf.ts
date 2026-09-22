/**
 * Lightweight performance utilities for three.js scenes.
 */

import * as THREE from 'three'

export const scratch = {
  v3a: new THREE.Vector3(),
  v3b: new THREE.Vector3(),
  v3c: new THREE.Vector3(),
  euler: new THREE.Euler(0, 0, 0, 'YXZ'),
  quatA: new THREE.Quaternion(),
  quatB: new THREE.Quaternion(),
}

export function easeCubicInOut(p: number): number {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
}

export function clampToBounds(
  v: THREE.Vector3,
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
): THREE.Vector3 {
  v.x = THREE.MathUtils.clamp(v.x, bounds.minX, bounds.maxX)
  v.z = THREE.MathUtils.clamp(v.z, bounds.minZ, bounds.maxZ)
  return v
}
