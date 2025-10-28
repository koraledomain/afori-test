import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  screenshotOnRunFailure: true,
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      return config;
    }
  }
});
