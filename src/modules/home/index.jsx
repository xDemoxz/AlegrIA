import Module1Timeline from '../module1-timeline';
import Module2FuturoTeaser from '../module2-future';

/**
 * Home — sección por defecto de la SPA (SECTION.MOD1_TIMELINE). Apila la
 * línea de tiempo (Módulo 1) y, justo debajo, el teaser del Módulo 2
 * "Futuro" (info + botón "Iniciar experiencia 3D"). La experiencia 3D en sí
 * NO vive aquí ni en este proyecto — el botón del teaser abre en pestaña
 * nueva la build deployada en https://zerik-official.github.io/AlegrIA-3D/.
 *
  * El <div> con pb separa las dos secciones a propósito: las tarjetas
  * del timeline usan `transform: rotate(...)` (efecto sticker inclinado),
  * que no cuenta para el alto de su caja de layout — sin este colchón, el
  * borde rotado queda visualmente superpuesto sobre el fondo oscuro del
  * teaser, que antes empezaba a 0px de distancia. El fondo negro une
  * la cola del timeline (#0d0d0d) con el gradiente oscuro del teaser.
 */
export default function Home() {
  return (
    <>
      <div className="pb-8 md:pb-10 bg-[#0d0d0d]">
        <Module1Timeline />
      </div>
      <Module2FuturoTeaser />
    </>
  );
}
