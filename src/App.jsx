import { Routes, Route } from 'react-router-dom';
import HomeApp from './pages/HomeApp';
import FuturoExperiencePage from './pages/FuturoExperiencePage';
import PosterPage from './pages/PosterPage';
import ARPage from './pages/ARPage';

/**
 * App — punto de entrada de rutas de AlegrIA.
 *
 * "/" — home estático (header + línea de tiempo + teaser + footer).
 *
 * "/futuro" — página standalone SOLO con la experiencia 3D del Módulo 2
 * (ver src/pages/FuturoExperiencePage.jsx), sin el chasis del sistema de
 * diseño, para que no compita con el WebGL a pantalla completa.
 *
 * "/poster" — página standalone del generador de carteles del Módulo 3
 * (ver src/pages/PosterPage.jsx), sin switcher por store.
 *
 * "/ar" — página standalone del Módulo 4 (ver src/pages/ARPage.jsx).
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeApp />} />
      <Route path="/futuro" element={<FuturoExperiencePage />} />
      <Route path="/poster" element={<PosterPage />} />
      <Route path="/ar" element={<ARPage />} />
    </Routes>
  );
}
