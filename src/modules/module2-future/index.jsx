import LoadingTejas from '../../components/feedback/LoadingTejas';

/**
 * MÓDULO 2 — Vistazo al Futuro (Gustavo)
 * ------------------------------------------------------------------
 * Responsable: Gustavo — escena Three.js / React Three Fiber.
 *   Paso A: La Biblioteca 3D (libro interactivo central)
 *   Paso B: La Sala del Futuro (galería 3D con marcos, narrativa de audio)
 *
 * Dependencias ya instaladas en package.json: three, @react-three/fiber,
 * @react-three/drei.
 *
 * Sugerencia de estructura dentro de esta carpeta a medida que crezca:
 *   module2-future/
 *   ├── index.jsx        (este archivo — orquesta Paso A/B)
 *   ├── Biblioteca3D.jsx
 *   └── SalaDelFuturo.jsx
 *
 * AudioToggle (components/controls) ya está listo para la narrativa de audio.
 */
export default function Module2Future() {
  return (
    <section className="max-w-[1240px] mx-auto px-6 pt-14">
      <div className="border-3 border-ink rounded-sticker bg-cream p-10 text-center">
        <LoadingTejas label="Escena 3D pendiente — Gustavo" />
        <p className="text-base font-medium mt-2">
          Aquí va el canvas de React Three Fiber: Biblioteca 3D → Sala del Futuro.
        </p>
      </div>
    </section>
  );
}
