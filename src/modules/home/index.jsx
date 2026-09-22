import Module1Timeline from '../module1-timeline';
import Module2FuturoTeaser from '../module2-future';

/**
 * Home — sección por defecto de la SPA (SECTION.MOD1_TIMELINE). Apila la
 * línea de tiempo (Módulo 1) y, justo debajo, el teaser del Módulo 2
 * "Futuro" (info + botón "Iniciar experiencia 3D"). La experiencia 3D en sí
 * NO vive aquí — el botón del teaser navega a la ruta /futuro
 * (src/pages/FuturoExperiencePage.jsx), una página standalone sin el
 * chasis del sistema de diseño.
 *
 * El <div> con pb-16 separa las dos secciones a propósito: las tarjetas
 * del timeline usan `transform: rotate(...)` (efecto sticker inclinado),
 * que no cuenta para el alto de su caja de layout — sin este colchón, el
 * borde rotado queda visualmente superpuesto sobre el fondo oscuro del
 * teaser, que antes empezaba a 0px de distancia.
 */
export default function Home() {
  return (
    <>
      <div className="pb-16 md:pb-20">
        <Module1Timeline />
      </div>
      <Module2FuturoTeaser />
    </>
  );
}
