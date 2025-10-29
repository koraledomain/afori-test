/// <reference types="cypress" />
import { cacheToken, getCachedToken } from '../helpers/token';

/**
 * Application Actions - Functions that encapsulate user interactions with the Agent page
 * These represent user workflows and use Cypress commands to interact with the UI
 */

/**
 * Visits the agent page
 */
export function visitAgentPage(): void {
  cy.visit('/agent');
}

/**
 * Verifies the page title
 */
export function verifyPageTitle(): void {
  cy.title().should('include', 'Agent Streaming Demo');
  cy.contains('h1', 'Agent Streaming Demo').should('be.visible');
}

/**
 * Verifies all required UI elements are present on the page
 */
export function verifyPageElements(): void {
  // JWT Token input
  cy.get('#jwtToken').should('be.visible');
  cy.get('#jwtToken').should('have.attr', 'placeholder', 'JWT Token');

  // Connect button
  cy.get('#connectBtn').should('be.visible');
  cy.get('#connectBtn').should('contain.text', 'Connect');

  // Connection status
  cy.get('#connectionStatus', { timeout: 60000 }).should('be.visible');
  cy.get('#connectionStatus', { timeout: 60000 }).should('contain.text', 'Disconnected');

  // Question input
  cy.get('#questionInput').should('be.visible');
  cy.get('#questionInput').should('have.attr', 'placeholder', 'Ask a question...');

  // Ask button
  cy.get('#askBtn').should('be.visible');
  cy.get('#askBtn').should('contain.text', 'Ask');

  // Steps container
  cy.get('#stepsContainer').should('exist');
}

/**
 * Verifies that question input and ask button are disabled initially
 */
export function verifyInitialDisabledState(): void {
  cy.get('#questionInput').should('be.disabled');
  cy.get('#askBtn').should('be.disabled');
}

/**
 * Verifies the default question value in the input
 */
export function verifyDefaultQuestion(): void {
  cy.get('#questionInput').should('have.value', 'How many customers live in Wonderland?');
}

/**
 * Fetches a JWT token from the API (uses cache if available)
 * @returns Chainable that resolves to the JWT token string
 */
export function fetchToken(): Cypress.Chainable<string> {
  const cachedToken = getCachedToken();

  if (cachedToken) {
    return cy.wrap<string>(cachedToken, { log: false });
  }

  return cy.request<string>('POST', '/auth/generate-token').then((response) => {
    const token = response.body;
    cacheToken(token);
    return cy.wrap<string>(token, { log: false });
  });
}

/**
 * Fills the JWT token input field with the provided token
 * @param token - The JWT token to enter
 */
export function fillTokenInput(token: string): void {
  cy.get('#jwtToken').clear().type(token);
  cy.get('#jwtToken').should('have.value', token);
}

/**
 * Clicks the connect button
 */
export function clickConnectButton(): void {
  cy.get('#connectBtn').click();
}

/**
 * Verifies the connection status is "Connected"
 * @param timeout - Optional timeout in milliseconds (default: 60000 - 1 minute)
 */
export function verifyConnected(timeout = 60000): void {
  cy.get('#connectionStatus', { timeout }).should('contain.text', 'Connected');
}

/**
 * Verifies that inputs and buttons are enabled after connection
 */
export function verifyEnabledAfterConnection(): void {
  cy.get('#questionInput').should('not.be.disabled');
  cy.get('#askBtn').should('not.be.disabled');
}

/**
 * Verifies the connect button text changes to "Reconnect"
 */
export function verifyReconnectButton(): void {
  cy.get('#connectBtn').should('contain.text', 'Reconnect');
}

/**
 * Application Action: Complete workflow to connect with token
 * Fetches token, fills input, connects, and verifies connection
 */
export function connectWithToken(): void {
  fetchToken().then((token) => {
    fillTokenInput(token);
    clickConnectButton();
    verifyConnected();
    verifyEnabledAfterConnection();
    verifyReconnectButton();
  });
}

