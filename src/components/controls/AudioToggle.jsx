/**
 * AudioToggle — activa/pausa la narración de audio (usado en QuoteCard, Módulo 2
 * "Sala del Futuro"). Solo UI: cablear el <audio> real es tarea de cada módulo.
 */
export default function AudioToggle({ playing = false, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="cursor-pointer ml-auto bg-ink text-yellow font-display text-lg tracking-wide leading-none px-5 pt-2.5 pb-2 rounded-pill hover:bg-red hover:text-white transition-colors"
    >
      {playing ? '⏸ PAUSAR' : '▶ OÍR'}
    </button>
  );
}
