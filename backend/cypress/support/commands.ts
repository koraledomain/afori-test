/// <reference types="cypress" />
import { cacheToken, getCachedToken } from './helpers/token';

/**
 * Cypress Custom Commands
 * These bridge functional helpers and application actions for use in tests
 */

/**
 * Custom command to get a cached JWT token.
 * Uses functional helpers internally.
 *
 * @example
 * cy.getCachedToken().then((token) => {
 *   cy.request({
 *     url: '/customers',
 *     headers: { 'x-api-key': token }
 *   });
 * });
 */
Cypress.Commands.add('getCachedToken', () => {
  const cachedToken = getCachedToken();
  
  if (cachedToken) {
    return cy.wrap<string>(cachedToken, { log: false });
  }

  return cy.request<string>('POST', '/auth/generate-token').then((response) => {
    const token = response.body;
    cacheToken(token);
    return cy.wrap<string>(token, { log: false });
  });
});

// Make this file a module for proper type augmentation
export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Gets a cached JWT token, or fetches and caches a new one if not available.
       * Uses functional helpers internally.
       * @returns The JWT token string
       */
      getCachedToken(): Cypress.Chainable<string>;
    }
  }
}
