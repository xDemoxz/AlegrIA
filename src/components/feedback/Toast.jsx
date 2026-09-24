import { useEffect } from 'react';

/**
 * Toast — notificación flotante temporal (auto-dismiss). Para avisos
 * persistentes en el flujo usa PopAlert en su lugar.
 *
 * v2: sin contorno negro — sombra difuminada más profunda (soft-lg), ya
 * que flota sobre el resto del layout.
 */
export default function Toast({ message, tone = 'success', duration = 3200, onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const bg = tone === 'success' ? 'bg-ink text-yellow' : tone === 'danger' ? 'bg-red text-white' : 'bg-blue text-white';

  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 ${bg} rounded-pill px-5 py-2.5 font-display text-lg tracking-wide shadow-soft-lg z-50`}
    >
      {message}
    </div>
  );
}
