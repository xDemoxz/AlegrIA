/** LoadingTejas — loader de marca (útil mientras cargan escenas 3D/AR pesadas). */
export default function LoadingTejas({ label = 'Cargando…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10" role="status" aria-live="polite">
      <div className="w-14 h-14 border-4 border-ink border-t-red rounded-pill animate-spin" />
      <span className="font-display text-xl tracking-wide">{label}</span>
    </div>
  );
}
