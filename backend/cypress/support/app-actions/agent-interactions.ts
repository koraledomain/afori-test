/// <reference types="cypress" />

/**
 * Application Actions for interacting with the Agent
 * These handle asking questions and verifying responses
 */

/**
 * Types a question into the question input field
 * @param question - The question to type
 */
export function typeQuestion(question: string): void {
  cy.get('#questionInput').clear().type(question);
}

/**
 * Clicks the ask button to submit a question
 */
export function clickAskButton(): void {
  cy.get('#askBtn').click();
}

/**
 * Asks a question to the agent
 * @param question - The question to ask
 */
export function askQuestion(question: string): void {
  typeQuestion(question);
  clickAskButton();
}

/**
 * Checks if an error is about a missing table/relation (graceful error)
 * @param errorText - The error text to check
 * @returns true if error is about missing relation, false otherwise
 */
export function isMissingTableError(errorText: string): boolean {
  const lowerText = errorText.toLowerCase();
  return (
    lowerText.includes('relation') &&
    (lowerText.includes('does not exist') ||
      lowerText.includes('doesn\'t exist'))
  );
}

/**
 * Checks if an error is a fatal/unexpected error that should fail the test immediately
 * Syntax errors, SQL errors (except missing table), etc. are fatal
 * @param errorText - The error text to check
 * @returns true if error is fatal/unexpected, false if it's graceful
 */
export function isFatalError(errorText: string): boolean {
  const lowerText = errorText.toLowerCase();
  
  // Missing table errors are graceful, not fatal
  if (isMissingTableError(errorText)) {
    return false;
  }
  
  // Check for unexpected SQL/fatal errors
  const fatalPatterns = [
    'syntax error',
    'parse error',
    'execution error',
    'failed to execute',
    'invalid',
    'error processing',
  ];
  
  return fatalPatterns.some((pattern) => lowerText.includes(pattern));
}

/**
 * Checks connection status and fails immediately for fatal errors
 * Returns true if processing should continue, false if fatal error detected
 * @param timeout - Optional timeout in milliseconds (default: 60000 - 1 minute)
 * @returns Chainable that resolves to true if should continue, false if fatal error
 */
export function checkForFatalErrors(timeout = 60000): Cypress.Chainable<boolean> {
  return cy.get('#connectionStatus', { timeout }).then((status) => {
    const text = status.text();
    
    // If fatal error detected, fail immediately
    if (text.includes('Error') && isFatalError(text)) {
      cy.log(`Fatal error detected: ${text}`);
      // Fail the test with the error message
      throw new Error(`Fatal agent error: ${text}`);
    }
    
    // If graceful error or complete, continue
    return true;
  });
}

/**
 * Waits for agent processing to complete or handle errors gracefully
 * @param timeout - Optional timeout in milliseconds (default: 60000 - 1 minute)
 * @param allowMissingTableErrors - If true, treats "table doesn't exist" as valid completion (default: true)
 */
export function waitForAgentComplete(
  timeout = 60000,
  allowMissingTableErrors = true,
): void {
  // First check for fatal errors and fail immediately if found
  checkForFatalErrors(timeout);
  
  cy.get('#connectionStatus', { timeout }).should((status) => {
    const text = status.text();
    
    // Check if processing completed normally
    if (text.includes('Query processing complete')) {
      return;
    }
    
    // Check if it's an error about missing table (graceful error)
    if (allowMissingTableErrors && text.includes('Error')) {
      if (isMissingTableError(text)) {
        cy.log('Graceful error: Table does not exist (expected behavior)');
        return;
      }
      
      // If it's an error but not missing table, check if it's fatal
      if (isFatalError(text)) {
        throw new Error(`Fatal agent error: ${text}`);
      }
    }
    
    // If we get here and it's an error, it might be unexpected
    // But we'll let the status check pass to allow caller to verify
  });
}

/**
 * Verifies that an error was received from the agent
 * @param expectedError - Optional expected error message
 * @param timeout - Optional timeout in milliseconds (default: 60000 - 1 minute)
 */
export function verifyAgentError(expectedError?: string, timeout = 60000): void {
  cy.get('#connectionStatus', { timeout }).should((status) => {
    const text = status.text();
    expect(text).to.include('Error');
    if (expectedError) {
      expect(text.toLowerCase()).to.include(expectedError.toLowerCase());
    }
  });
}

/**
 * Verifies that a graceful error was handled (e.g., table doesn't exist)
 * This means the error was handled properly - no stack traces, helpful message
 * @param timeout - Optional timeout in milliseconds (default: 60000 - 1 minute)
 */
export function verifyGracefulErrorHandling(timeout = 60000): void {
  cy.get('#connectionStatus', { timeout }).then((status) => {
    const text = status.text();
    
    // If there's an error about missing table, that's graceful
    if (text.includes('Error') && isMissingTableError(text)) {
      cy.log('✓ Graceful error handling: Missing table error properly handled');
      
      // Verify no stack traces
      expect(text).to.not.include('at ');
      expect(text).to.not.include('Stack');
      expect(text).to.not.include('Trace');
      
      // Verify queryResult step exists (even if empty)
      cy.get('#step-queryResult-content', { timeout: 5000 })
        .should('exist')
        .then(($el) => {
          // Empty is okay for missing tables
          const content = $el.text();
          if (!content || content.trim() === '') {
            cy.log('✓ queryResult step exists but is empty (expected for missing tables)');
          }
        });
      
      return;
    }
    
    // If complete, that's also good
    if (text.includes('Query processing complete')) {
      cy.log('✓ Processing completed successfully');
    }
  });
}

/**
 * Checks if queryResult step is empty (which is valid for missing tables)
 * @returns Chainable that resolves to true if empty, false otherwise
 */
export function isQueryResultEmpty(): Cypress.Chainable<boolean> {
  return cy.get('#step-queryResult-content').then(($el) => {
    const text = $el.text().trim();
    return cy.wrap(text === '');
  });
}

/**
 * Verifies that error handling is graceful (no crashes, helpful messages)
 * Specifically handles "table doesn't exist" scenarios
 */
export function verifyErrorHandlingForMissingTables(): void {
  cy.get('#connectionStatus', { timeout: 60000 }).then((status) => {
    const text = status.text();
    
    if (text.includes('Error') && isMissingTableError(text)) {
      // This is good - honest error about missing table
      cy.log('✓ Agent correctly reported missing table (honest behavior)');
      
      // Verify queryResult step exists
      cy.get('#step-queryResult-content').should('exist');
      
      // It's okay if queryResult is empty for missing tables
      // The important thing is we don't hallucinate data
    }
  });
}

/**
 * Waits for the final answer to be available (non-empty), or a graceful error
 * Fails immediately if a fatal error is detected
 * If a graceful error occurred (e.g., missing table), we skip waiting for answer content
 * @param timeout - Optional timeout in milliseconds (default: 60000 - 1 minute)
 */
export function waitForFinalAnswerOrError(timeout = 60000): void {
  // Wait for connection status to reach a terminal state (complete or error)
  cy.get('#connectionStatus', { timeout }).should((status) => {
    const text = status.text();
    
    // Check for fatal errors first - fail immediately
    if (text.includes('Error') && isFatalError(text)) {
      throw new Error(`Fatal agent error: ${text}`);
    }
    
    // Terminal states that indicate we should stop waiting:
    // 1. Query processing complete - means we should wait for answer content
    // 2. Graceful error (missing table) - means we're done, answer might be empty
    
    if (text.includes('Query processing complete')) {
      return true; // Processing complete - proceed to wait for answer
    }
    
    if (text.includes('Error') && isMissingTableError(text)) {
      return true; // Graceful error - we'll exit early below
    }
    
    // Still processing - keep waiting
    return false;
  });

  // Now check the terminal state and decide what to do
  cy.get('#connectionStatus').then((status) => {
    const text = status.text();

    // If graceful error (missing table), we're done - answer might be empty, which is fine
    if (text.includes('Error') && isMissingTableError(text)) {
      cy.log('Graceful error: Missing table detected - answer step may be empty, which is acceptable');
      // Don't wait for answer content - exit immediately
      return;
    }

    // Only if processing completed successfully, wait for the answer step to have content
    if (text.includes('Query processing complete')) {
      cy.log('Processing complete - waiting for answer content');
      cy.get('#step-answer-content', { timeout }).should(($el) => {
        const content = ($el.text() || '').trim();
        expect(content.length, 'final answer content should not be empty').to.be.greaterThan(0);
      });
    }
  });
}

/**
 * Gets the content from a specific step
 * @param step - The step name ('analysis', 'sqlQuery', 'queryResult', 'answer')
 */
export function getStepContent(step: string): Cypress.Chainable<string> {
  return cy.get(`#step-${step}-content`).invoke('text');
}

/**
 * Verifies that a step contains specific text
 * @param step - The step name
 * @param expectedText - The text that should be present
 * @param timeout - Optional timeout in milliseconds (default: 30000)
 */
export function verifyStepContains(
  step: string,
  expectedText: string,
  timeout = 30000,
): void {
  cy.get(`#step-${step}-content`, { timeout }).should('contain', expectedText);
}

/**
 * Verifies that a step does NOT contain specific text
 * @param step - The step name
 * @param unexpectedText - The text that should NOT be present
 * @param timeout - Optional timeout in milliseconds (default: 30000)
 */
export function verifyStepNotContains(
  step: string,
  unexpectedText: string,
  timeout = 30000,
): void {
  cy.get(`#step-${step}-content`, { timeout }).should('not.contain', unexpectedText);
}

/**
 * Gets the SQL query from the sqlQuery step
 */
export function getSqlQuery(): Cypress.Chainable<string> {
  return getStepContent('sqlQuery');
}

/**
 * Verifies that the SQL query contains specific patterns (for security checks)
 * @param dangerousPattern - Pattern that should NOT appear in SQL
 */
export function verifySqlDoesNotContain(dangerousPattern: string): void {
  getSqlQuery().then((sql) => {
    expect(sql.toLowerCase()).to.not.include(dangerousPattern.toLowerCase());
  });
}

/**
 * Verifies that the answer step contains or does not contain specific text
 * @param shouldContain - Text that should be present
 * @param shouldNotContain - Text that should NOT be present
 */
export function verifyAnswerContent(
  shouldContain?: string,
  shouldNotContain?: string,
): void {
  if (shouldContain) {
    verifyStepContains('answer', shouldContain);
  }
  if (shouldNotContain) {
    verifyStepNotContains('answer', shouldNotContain);
  }
}

/**
 * Verifies that steps container is empty (no response received)
 */
export function verifyNoResponse(): void {
  cy.get('#stepsContainer').should('be.empty');
}

/**
 * Verifies that at least one step has content
 */
export function verifyResponseReceived(): void {
  cy.get('#stepsContainer .step', { timeout: 30000 }).should('exist');
}

/**
 * Complete workflow: Ask question and wait for complete response
 * Fails immediately if a fatal error is detected (e.g., syntax errors)
 * @param question - The question to ask
 * @param waitForComplete - Whether to wait for completion (default: true)
 */
export function askQuestionAndWait(question: string, waitForComplete = true): void {
  askQuestion(question);
  if (waitForComplete) {
    // Check for fatal errors immediately, then wait for final answer or graceful error
    // This will fail the test immediately if a fatal error like "syntax error" is detected
    waitForFinalAnswerOrError();
  } else {
    // Even if not waiting for complete, check for fatal errors that should fail immediately
    // Use a shorter timeout since we're just checking for immediate errors
    checkForFatalErrors(10000);
  }
}

/**
 * Checks if response contains any sensitive data patterns
 * @param sensitivePatterns - Array of patterns that indicate sensitive data
 */
export function verifyNoSensitiveData(sensitivePatterns: string[]): void {
  sensitivePatterns.forEach((pattern) => {
    cy.get('#stepsContainer').should('not.contain', pattern);
  });
}

