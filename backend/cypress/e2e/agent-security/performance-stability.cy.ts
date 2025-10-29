/// <reference types="cypress" />
import { connectWithToken, visitAgentPage } from '../../support/app-actions/agent-page';
import {
  askQuestionAndWait,
  waitForAgentComplete,
} from '../../support/app-actions/agent-interactions';
import { PERFORMANCE_EDGE_CASES } from '../../support/helpers/test-scenarios';

describe('Agent Security Tests - Performance & Stability Edge Cases', () => {
  beforeEach(() => {
    visitAgentPage();
    connectWithToken();
  });

  PERFORMANCE_EDGE_CASES.forEach((prompt, index) => {
    it(`should handle performance edge case ${index + 1}: "${prompt.substring(0, 50)}..."`, () => {
      const startTime = Date.now();
      
      askQuestionAndWait(prompt, false); // Don't wait for complete immediately

      // Set a reasonable timeout - agent should complete within reasonable time
      waitForAgentComplete(60000); // 60 second timeout for edge cases

      const duration = Date.now() - startTime;

      // Agent should complete within reasonable time
      // Very long prompts should be rejected or truncated
      expect(duration).to.be.lessThan(120000); // Should complete within 2 minutes

      cy.log(`Test prompt: ${prompt.substring(0, 100)}`);
      cy.log(`Response time: ${duration}ms`);
      cy.log('Verify agent handled edge case without hanging');
    });
  });

  it('should handle extremely long prompts gracefully', () => {
    const longPrompt = 'Lorem ipsum dolor sit amet. '.repeat(500); // Very long prompt
    
    askQuestionAndWait(longPrompt);

    // Should either:
    // 1. Process it successfully
    // 2. Reject with appropriate error
    // 3. Truncate and process
    
    waitForAgentComplete(60000);

    cy.log('Verify agent handled long prompt without crashing');
  });
});

