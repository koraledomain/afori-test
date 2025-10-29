// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands to register custom Cypress commands
import './commands';

// Import functional helpers
import { clearCachedToken } from './helpers/token';

// Initialize token cache before all tests
before(() => {
  clearCachedToken();
});

// Set viewport to MacBook 13" size for all tests
beforeEach(() => {
  cy.viewport(1280, 800); // MacBook 13" viewport size
});
