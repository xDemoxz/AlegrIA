import PopButton from './PopButton';

/** SearchInput — input + botón "IR".
 * v2: sin contorno negro — sombra interior en reposo, anillo teal al
 * enfocar (mismo patrón que los inputs del formulario del Módulo 3). */
export default function SearchInput({ placeholder = 'Buscar un recuerdo…', onSubmit, value, onChange }) {
  return (
    <form
      className="flex gap-2.5 flex-wrap"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="flex-1 min-w-[180px] font-body text-base font-medium px-4 py-3.5 bg-white rounded-xl outline-none text-ink shadow-[inset_0_2px_4px_rgba(18,18,18,0.12)] focus:shadow-[inset_0_2px_4px_rgba(18,18,18,0.12),0_0_0_3px_#3CBAB3] transition-shadow duration-150"
      />
      <PopButton variant="secondary" className="!text-xl !px-5 !py-3">
        IR
      </PopButton>
    </form>
  );
}
