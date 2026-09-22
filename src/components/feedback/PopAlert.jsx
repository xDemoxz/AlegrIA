const TONES = {
  warning: { bg: 'bg-orange', icon: '!' },
  info: { bg: 'bg-blue', icon: 'i' },
  success: { bg: 'bg-ink', iconColor: 'text-yellow', icon: '✓' },
};

/** PopAlert — aviso en línea (warning / info / success), ver sección "Avisos". */
export default function PopAlert({ tone = 'info', children }) {
  const t = TONES[tone];
  return (
    <div className={`flex gap-3 items-start ${t.bg} text-white border-3 border-ink rounded-xl px-4 py-3.5`}>
      <span className={`font-display text-2xl leading-none ${t.iconColor ?? ''}`}>{t.icon}</span>
      <div className="text-[15px] font-semibold leading-[1.45]">{children}</div>
    </div>
  );
}
