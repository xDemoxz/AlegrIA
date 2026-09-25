import { defineConfig, devices } from '@playwright/test';

/**
 * E2E en Chromium real con emulación de teléfono (touch, viewport, UA).
 * Cubre lo que jsdom no puede: layout real, gestos táctiles y el PNG que
 * genera html2canvas. `npm run test:e2e` levanta Vite solo.
 */
const PORT = 5199;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'android', use: { ...devices['Pixel 7'] } },
    // WebKit no está instalado: iPhone emulado sobre Chromium (UA + touch +
    // viewport), suficiente para el flujo de guardar por Web Share.
    { name: 'iphone', use: { ...devices['iPhone 13'], browserName: 'chromium', defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/poster`,
    env: { PLAYWRIGHT: '1' },
    reuseExistingServer: !process.env.CI,
  },
});
