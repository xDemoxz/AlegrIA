import PopButton from './PopButton';

/** SearchInput — input + botón "IR", con focus ring azul del sistema de diseño. */
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
        className="flex-1 min-w-[180px] font-body text-base font-medium px-4 py-3.5 bg-white border-3 border-ink rounded-xl outline-none focus:shadow-[4px_4px_0_0_#1DB3E7] text-ink"
      />
      <PopButton variant="secondary" className="!text-xl !px-5 !py-3">
        IR
      </PopButton>
    </form>
  );
}
