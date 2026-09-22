import { Routes, Route } from 'react-router-dom';
import HomeApp from './pages/HomeApp';
import FuturoExperiencePage from './pages/FuturoExperiencePage';

/**
 * App — punto de entrada de rutas de AlegrIA.
 *
 * "/" — la SPA completa (header/marquee/nav/footer + los módulos que se
 * conmutan por estado, ver src/pages/HomeApp.jsx).
 *
 * "/futuro" — página standalone SOLO con la experiencia 3D del Módulo 2
 * (ver src/pages/FuturoExperiencePage.jsx), sin el chasis del sistema de
 * diseño, para que no compita con el WebGL a pantalla completa.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeApp />} />
      <Route path="/futuro" element={<FuturoExperiencePage />} />
    </Routes>
  );
}
