import PopButton from '../../components/controls/PopButton';
import Chip from '../../components/controls/Chip';

/**
 * MÓDULO 3 — Generador de Pósters (José Romero)
 * ------------------------------------------------------------------
 * Responsable: José Romero — UI de plantillas, personalización (nombre o
 * mensaje del usuario), exportación PNG/JPEG con html2canvas.
 * (José también integra MediaPipe Hands sobre el scroll del Módulo 1 —
 * eso vive en module1-timeline, no aquí.)
 *
 * Chip y PopButton ya están listos para las plantillas y el CTA de descarga.
 * Instala html2canvas cuando empieces: npm install html2canvas
 */
export default function Module3Poster() {
  return (
    <section className="max-w-[1240px] mx-auto px-6 pt-14 flex flex-col gap-6">
      <div className="flex gap-2.5 flex-wrap">
        <Chip tone="red">Festival</Chip>
        <Chip tone="blue">Río</Chip>
        <Chip tone="orange">Cocina</Chip>
        <Chip tone="cream">Arquitectura</Chip>
      </div>

      <div className="border-3 border-ink rounded-sticker bg-cream p-10 text-center">
        <p className="text-base font-medium">
          Aquí va el editor de póster (plantilla + input de nombre/mensaje) — José.
        </p>
        <PopButton className="mt-4">DESCARGAR PNG</PopButton>
      </div>
    </section>
  );
}
