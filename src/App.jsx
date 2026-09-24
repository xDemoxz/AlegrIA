import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomeApp from './pages/HomeApp';
import FuturoExperiencePage from './pages/FuturoExperiencePage';
import PosterPage from './pages/PosterPage';
import ARPage from './pages/ARPage';

// Lazy: la página AR solo se descarga cuando el usuario entra a /ra.
const RAExperiencePage = lazy(() => import('./pages/RAExperiencePage'));

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
 * "/ar" — página standalone del Módulo 4 (ver src/pages/ARPage.jsx): el teaser.
 *
 * "/ra" — la experiencia AR de Mattercraft embebida en un iframe a pantalla
 * completa (ver src/pages/RAExperiencePage.jsx). El botón del teaser navega aquí.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeApp />} />
      <Route path="/futuro" element={<FuturoExperiencePage />} />
      <Route path="/poster" element={<PosterPage />} />
      <Route path="/ar" element={<ARPage />} />
      <Route
        path="/ra"
        element={
          <Suspense fallback={<div className="fixed inset-0 bg-ink" />}>
            <RAExperiencePage />
          </Suspense>
        }
      />
    </Routes>
  );
}
