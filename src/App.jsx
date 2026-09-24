import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomeApp from './pages/HomeApp';
import FuturoExperiencePage from './pages/FuturoExperiencePage';

// Lazy: la página AR solo se descarga cuando el usuario entra a /ra.
const RAExperiencePage = lazy(() => import('./pages/RAExperiencePage'));

/**
 * App — punto de entrada de rutas de AlegrIA.
 *
 * "/" — la SPA completa (header/marquee/nav/footer + los módulos que se
 * conmutan por estado, ver src/pages/HomeApp.jsx).
 *
 * "/futuro" — página standalone SOLO con la experiencia 3D del Módulo 2
 * (ver src/pages/FuturoExperiencePage.jsx), sin el chasis del sistema de
 * diseño, para que no compita con el WebGL a pantalla completa.
 *
 * "/ra" — página standalone del Módulo 4: la experiencia AR de Mattercraft
 * embebida en un iframe a pantalla completa (ver src/pages/RAExperiencePage.jsx).
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeApp />} />
      <Route path="/futuro" element={<FuturoExperiencePage />} />
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
