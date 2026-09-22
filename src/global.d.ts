/**
 * Global type augmentations for React Three Fiber.
 * Necesario para que los elementos JSX de R3F (mesh, group, etc.)
 * no generen errores de tipo en archivos .tsx.
 */
import '@react-three/fiber'

declare global {
  namespace JSX {
    interface IntrinsicElements {}
  }
}
