/** FooterBajero — pie de página compartido por toda la experiencia.
 * v2: degradado festival de 3 paradas (rojo oscuro → rojo → naranja), sin
 * contorno negro superior. v3: integra logos reales (public/assets/logos) en
 * banda de aliados, sin borde duro. */
const LOGOS = [
  { src: '/assets/logos/logo-barrio-abajo.png', alt: 'Barrio Abajo del Río' },
  { src: '/assets/logos/logo-festival.png', alt: 'IV Festival Tradición Bajera' },
  { src: '/assets/logos/logo-alcaldia.png', alt: 'Alcaldía de Barranquilla' },
  { src: '/assets/logos/logo-expo-baq-2050.png', alt: 'Expo BAQ 2050' },
  { src: '/assets/logos/logo-riwi-grupo.png', alt: 'Riwi Grupo' },
];

export default function FooterBajero() {
  return (
    <footer className="relative z-[2] mt-8 bg-[linear-gradient(135deg,#A81212_0%,#E02828_60%,#F26522_100%)] text-white px-6 pt-8 pb-10">
      <div className="max-w-[1240px] mx-auto flex flex-col items-center gap-6">
        <div className="font-display text-3xl tracking-[0.1em] text-yellow-light text-center">
          BARRIO ABAJO DEL RÍO · ALEGRÍA
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 bg-white/8 backdrop-blur-sm rounded-[18px] px-6 py-4 shadow-soft">
          {LOGOS.map((l) => (
            <img
              key={l.src}
              src={l.src}
              alt={l.alt}
              loading="lazy"
              className="h-9 md:h-11 w-auto object-contain opacity-95 hover:opacity-100 transition-opacity"
            />
          ))}
        </div>
        <div className="text-[13px] font-medium opacity-85 text-center">
          POP-Folclor patrimonial · La alegría es nuestra · Barranquilla
        </div>
      </div>
    </footer>
  );
}
