import { useEffect, useState } from 'react';
import PopButton from '../../components/controls/PopButton';
import { canShareFile, isIOS } from './exportPoster';

/**
 * PosterResultSheet — hoja que aparece en móvil cuando el cartel ya está
 * renderizado. Existe porque guardar en el teléfono necesita un toque
 * "fresco" del usuario (Web Share lo exige), y porque en navegadores
 * embebidos (Instagram, WhatsApp) ni share ni download funcionan: ahí queda
 * el plan C de mantener presionada la imagen.
 *
 * Botón principal:
 *  - iOS → hoja nativa de compartir (trae "Guardar imagen" → Fotos; la
 *    descarga en iOS termina en Archivos, que nadie encuentra).
 *  - Android/otros → descarga directa (queda en la galería, carpeta Download).
 * Botón secundario "Compartir" cuando el navegador puede compartir archivos.
 */
export default function PosterResultSheet({ blob, filename, onSave, onClose, saving = false }) {
  // URL creada en el efecto (no en useMemo): en StrictMode el efecto corre
  // dos veces y la limpieza revocaría una URL memorizada que se sigue usando.
  const [url, setUrl] = useState(null);
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);

  const [shareable] = useState(() => canShareFile(new File([blob], filename, { type: 'image/png' })));
  const ios = isIOS();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tu cartel está listo"
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-ink/70 backdrop-blur-sm md:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[100svh] w-full max-w-md flex-col items-center gap-4 overflow-y-auto rounded-t-[28px] bg-cream p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-soft-lg md:rounded-[28px]">
        <h2 className="m-0 font-display text-2xl tracking-wide text-red">¡TU CARTEL ESTÁ LISTO!</h2>

        {url && (
          <img
            src={url}
            alt="Vista previa de tu cartel"
            className="max-h-[52svh] w-auto rounded-xl shadow-soft"
            style={{ WebkitTouchCallout: 'default' }}
          />
        )}

        <div className="flex w-full flex-col gap-2.5">
          <PopButton
            variant="secondary"
            className="!w-full !text-xl"
            disabled={saving}
            onClick={() => onSave({ preferShare: ios && shareable })}
          >
            {saving ? 'GUARDANDO…' : 'Guardar en mi celular'}
          </PopButton>
          {shareable && !ios && (
            <PopButton
              variant="ghost"
              className="!w-full !text-xl"
              disabled={saving}
              onClick={() => onSave({ preferShare: true })}
            >
              Compartir
            </PopButton>
          )}
          <PopButton variant="ghost" className="!w-full !text-lg" onClick={onClose}>
            Seguir editando
          </PopButton>
        </div>

        <p className="m-0 text-center text-xs text-ink/70">
          ¿No se guardó? Mantén presionada la imagen y elige «Guardar imagen».
        </p>
      </div>
    </div>
  );
}
