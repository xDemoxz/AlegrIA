/**
 * Generic glTF model loader with procedural fallback.
 */

import { Suspense, useEffect, useState, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export interface ModelLoaderProps {
  src: string
  fallback: React.ReactNode
  scale?: number | [number, number, number]
  position?: [number, number, number]
  rotation?: [number, number, number]
}

function GltfScene({ src, scale, position, rotation }: Omit<ModelLoaderProps, 'fallback'>) {
  const { scene } = useGLTF(src) as unknown as { scene: THREE.Group }

  const cloned = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
    return c
  }, [scene])

  return <primitive object={cloned} scale={scale ?? 1} position={position} rotation={rotation} />
}

export function ModelLoader({ src, fallback, scale, position, rotation }: ModelLoaderProps) {
  const [available, setAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(src, { method: 'HEAD' })
      .then((r) => {
        if (!cancelled) setAvailable(r.ok)
      })
      .catch(() => {
        if (!cancelled) setAvailable(false)
      })
    return () => {
      cancelled = true
    }
  }, [src])

  if (available === false) return <>{fallback}</>
  if (available === null) return <>{fallback}</>

  return (
    <Suspense fallback={fallback}>
      <GltfScene src={src} scale={scale} position={position} rotation={rotation} />
    </Suspense>
  )
}
