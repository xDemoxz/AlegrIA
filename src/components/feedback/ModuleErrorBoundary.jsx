import { Component } from 'react';

/**
 * Aísla el fallo de un módulo (WebGL, texturas, runtime externo) para que el
 * resto de la página siga viva. `fallback` es lo que se pinta si algo falla.
 */
export default class ModuleErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Módulo no disponible:', error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
