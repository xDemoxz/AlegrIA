/**
 * Module 2 — teaser de "Futuro".
 * Vive apilado debajo de la línea de tiempo dentro del home (ver
 * src/modules/home). Solo muestra la info + el botón "Iniciar experiencia
 * 3D" — la experiencia en sí corre en la ruta standalone /futuro (ver
 * src/pages/FuturoExperiencePage.jsx), para no cargar Three.js en el home
 * ni competir visualmente con el chasis del sistema de diseño.
 * Imports Cinzel + Inter fonts required by the 3D UI components.
 */

export default function Module2Future() {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#06040a] via-[#0a0a14] to-[#0e0a06] px-6 py-20 text-center">
      {/* Ambient particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[#c9a86a]/20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl">
        <p className="text-[11px] tracking-[0.42em] uppercase text-[#c9a86a]/60" style={{ fontFamily: "'Cinzel', serif" }}>
          Módulo 2 — Futuro
        </p>

        <h2
          className="mt-4 text-[clamp(28px,5vw,48px)] leading-[1.15] tracking-[0.1em] uppercase text-[#f5e6c8]"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          La Biblioteca del{' '}
          <span className="bg-gradient-to-r from-[#ffcc33] to-[#ff8a00] bg-clip-text text-transparent">
            Tiempo
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-lg text-[15px] leading-7 text-[#f5e6c8]/60">
          Adéntrate en una biblioteca ancestral donde un libro levita sobre un pedestal dorado.
          Acércate, atraviesa el vórtice y despierta dentro de un museo olvidado que guarda
          fragmentos del pasado de Barrio Abajo.
        </p>

        <a
          href="https://zerik-official.github.io/AlegrIA-3D/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-[#ffcc33] to-[#ffb400] px-8 py-4 text-[13px] font-bold tracking-[0.18em] uppercase text-[#1a1205] shadow-[0_8px_30px_rgba(255,180,40,0.3),inset_0_1px_0_rgba(255,255,255,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(255,180,40,0.5)]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Iniciar experiencia 3D
        </a>

        <p className="mt-5 text-[11px] tracking-wide text-[#f5e6c8]/30">
          Requiere teclado y mouse • WASD para moverse • Click para interactuar
        </p>
      </div>
    </section>
  )
}
