/// <reference types="cypress" />

/**
 * Functional Helpers - Pure utility functions for token management
 * These functions don't interact with the DOM directly
 */

/**
 * Gets a cached token from Cypress environment
 * @returns The cached token string or null
 */
export function getCachedToken(): string | null {
  return Cypress.env('__tokenCache') || null;
}

/**
 * Caches a token in Cypress environment
 * @param token - The JWT token to cache
 */
export function cacheToken(token: string): void {
  Cypress.env('__tokenCache', token);
}

/**
 * Clears the cached token
 */
export function clearCachedToken(): void {
  Cypress.env('__tokenCache', null);
}

