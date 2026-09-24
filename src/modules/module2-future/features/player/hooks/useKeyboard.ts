import { useEffect, useRef } from 'react'
import type { KeysState } from '../../../shared/types'

export function useKeyboard() {
  const keys = useRef<KeysState>({ w: false, a: false, s: false, d: false, shift: false })

  useEffect(() => {
    const onDown = (e: KeyboardEvent): void => {
      const k = e.key.toLowerCase()
      if (k === 'w') keys.current.w = true
      if (k === 'a') keys.current.a = true
      if (k === 's') keys.current.s = true
      if (k === 'd') keys.current.d = true
      if (k === 'shift') keys.current.shift = true
    }

    const onUp = (e: KeyboardEvent): void => {
      const k = e.key.toLowerCase()
      if (k === 'w') keys.current.w = false
      if (k === 'a') keys.current.a = false
      if (k === 's') keys.current.s = false
      if (k === 'd') keys.current.d = false
      if (k === 'shift') keys.current.shift = false
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  return keys
}
