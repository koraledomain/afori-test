import { defineConfig } from 'cypress';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';

export default defineConfig({
  video: false,
  screenshotsFolder: 'cypress/screenshots',
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: true,
    html: true,
    json: true,
    charts: true,
    embeddedScreenshots: true,
  },
  viewportWidth: 1280,
  viewportHeight: 800,
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    experimentalPromptCommand: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents(on) {
      on('file:preprocessor', createBundler({ sourcemap: 'inline' }));
    },
  },
});
