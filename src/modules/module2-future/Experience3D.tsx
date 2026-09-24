/**
 * Experience3D — Main 3D orchestrator for Module 2 "Futuro".
 * Adapted from AlegrIA-3D App.tsx to work as a component within the AlegrIA platform.
 */

import { useState, useRef, useCallback, useEffect, memo } from 'react'
import { createPortal } from 'react-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { LibraryScene } from './features/library/components/LibraryScene'
import { MuseumScene } from './features/museum/components/MuseumScene'
import { PlayerControls } from './features/player/components/PlayerControls'
import { HUD, StartOverlay, PastOverlay } from './features/ui/components/HUD'
import { appConfig } from './shared/config/appConfig'
import { easeCubicInOut } from './shared/utils/perf'
import type { GamePhase } from './shared/types'
import * as THREE from 'three'

interface WormholeCameraProps {
  active: boolean
  progress: number
}

const WormholeCamera = memo(function WormholeCamera({ active, progress }: WormholeCameraProps) {
  useFrame(({ camera }) => {
    if (!active) return
    const fovTarget = appConfig.wormhole.fov.from + progress * (appConfig.wormhole.fov.to - appConfig.wormhole.fov.from)
    const cam = camera as THREE.PerspectiveCamera
    if (cam.fov !== undefined) {
      cam.fov = THREE.MathUtils.lerp(cam.fov, fovTarget, appConfig.wormhole.fov.lerp)
      cam.updateProjectionMatrix()
    }
    camera.position.z -= 0.02 + progress * 0.09
    camera.position.x += (Math.random() - 0.5) * progress * appConfig.wormhole.shake.x
    camera.position.y += (Math.random() - 0.5) * progress * appConfig.wormhole.shake.y
  })
  return null
})

interface KeyListenerProps {
  nearBook: boolean
  phase: GamePhase
  onInteract: () => void
}

const KeyListener = memo(function KeyListener({ nearBook, phase, onInteract }: KeyListenerProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.key.toLowerCase() === 'e' || e.key === 'Enter') && nearBook && phase === 'exploring') {
        onInteract()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [nearBook, phase, onInteract])
  return null
})

interface Experience3DProps {
  /** Called when the user wants to return to the main platform (exit 3D). */
  onExit?: () => void
}

export default function Experience3D({ onExit }: Experience3DProps) {
  const [phase, setPhase] = useState<GamePhase>('idle')
  const [distance, setDistance] = useState(9)
  const [wormholeProgress, setWormholeProgress] = useState(0)
  const [showMuseumOverlay, setShowMuseumOverlay] = useState(true)
  const playerPos = useRef(new THREE.Vector3(0, appConfig.player.eyeHeight, 9))
  const wormholeRaf = useRef<number | null>(null)

  const nearBook = distance < appConfig.player.interactDistance

  const handlePosition = useCallback((pos: THREE.Vector3) => {
    playerPos.current.copy(pos)
    const d = Math.hypot(pos.x, pos.z)
    setDistance(d)
  }, [])

  const startWormhole = useCallback(() => {
    if (phase === 'wormhole' || phase === 'museum') return
    setPhase('wormhole')
    const duration = appConfig.wormhole.durationMs
    const start = performance.now()

    const tick = (now: number): void => {
      const p = Math.min((now - start) / duration, 1)
      const eased = easeCubicInOut(p)
      setWormholeProgress(eased)
      if (p < 1) {
        wormholeRaf.current = requestAnimationFrame(tick)
      } else {
        setPhase('museum')
        setWormholeProgress(0)
        setShowMuseumOverlay(true)
      }
    }
    wormholeRaf.current = requestAnimationFrame(tick)
  }, [phase])

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (wormholeRaf.current) cancelAnimationFrame(wormholeRaf.current)
    }
  }, [])

  const handleStart = useCallback(() => setPhase('exploring'), [])

  const handleReturnToLibrary = useCallback(() => {
    // Reset state instead of reloading the page (we're inside a module now)
    setPhase('idle')
    setDistance(9)
    setWormholeProgress(0)
    setShowMuseumOverlay(true)
  }, [])

  const handleDismissMuseumIntro = useCallback(() => setShowMuseumOverlay(false), [])

  const isMuseum = phase === 'museum'

  return createPortal(
    <div className="fixed inset-0 w-full h-full" style={{ background: '#06040a', zIndex: 2147483647 }}>
      <KeyListener nearBook={nearBook} phase={phase} onInteract={startWormhole} />

      <Canvas
        shadows
        dpr={appConfig.render.dpr}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
        camera={{ fov: 72, near: 0.1, far: 80, position: [0, appConfig.player.eyeHeight, 9] }}
        style={{ width: '100%', height: '100%' }}
      >
        {!isMuseum ? <fog attach="fog" args={['#0a0806', 9, 26]} /> : <fog attach="fog" args={['#eef1f6', 14, 36]} />}
        {!isMuseum ? <color attach="background" args={['#08060a']} /> : <color attach="background" args={['#eef1f6']} />}

        {!isMuseum ? (
          <LibraryScene wormholeActive={phase === 'wormhole'} wormholeProgress={wormholeProgress} />
        ) : (
          <MuseumScene />
        )}

        {phase === 'exploring' && (
          <PlayerControls enabled onPositionChange={handlePosition} bounds={appConfig.player.libraryBounds} />
        )}
        {isMuseum && (
          <PlayerControls
            enabled={!showMuseumOverlay}
            onPositionChange={handlePosition}
            bounds={appConfig.player.museumBounds}
          />
        )}

        <WormholeCamera active={phase === 'wormhole'} progress={wormholeProgress} />
      </Canvas>

      {/* Overlays */}
      {phase === 'idle' && <StartOverlay onStart={handleStart} />}
      {phase === 'exploring' && <HUD distance={distance} nearBook={nearBook} wormholeActive={false} onInteract={startWormhole} />}
      {phase === 'wormhole' && <HUD distance={distance} nearBook={nearBook} wormholeActive onInteract={startWormhole} />}
      {isMuseum && !showMuseumOverlay && (
        <>
          <HUD distance={distance} nearBook={false} wormholeActive={false} onInteract={() => {}} />
          <div className="pointer-events-none fixed top-6 left-1/2 z-10 -translate-x-1/2 rounded-full border border-[#1e2430]/10 bg-white/80 px-5 py-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-[#1e2430]/70 shadow backdrop-blur" style={{ fontFamily: "'Cinzel', serif" }}>
            Museo del Tiempo — Explora las vitrinas
          </div>
        </>
      )}
      {isMuseum && showMuseumOverlay && <PastOverlay onReturn={handleDismissMuseumIntro} />}
      {isMuseum && !showMuseumOverlay && (
        <button
          onClick={handleReturnToLibrary}
          className="fixed bottom-6 right-6 z-10 rounded-full border border-[#1e2430]/10 bg-white/90 px-4 py-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-[#1e2430] shadow backdrop-blur hover:bg-white"
        >
          Volver a la biblioteca
        </button>
      )}

      {/* Exit button — return to main platform */}
      {onExit && phase !== 'wormhole' && (
        <button
          onClick={onExit}
          className="fixed top-4 right-4 z-30 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-white/70 backdrop-blur-md transition hover:bg-black/70 hover:text-white"
        >
          ✕ Salir
        </button>
      )}

      {/* Click-to-interact overlay when near book */}
      {phase === 'exploring' && nearBook && (
        <div
          onClick={startWormhole}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9,
            cursor: 'pointer',
            pointerEvents: 'auto',
          }}
          title="Click para atravesar el vórtice"
        />
      )}
    </div>,
    document.body
  )
}
