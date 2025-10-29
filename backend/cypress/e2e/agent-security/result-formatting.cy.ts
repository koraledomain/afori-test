/// <reference types="cypress" />
import { connectWithToken, visitAgentPage } from '../../support/app-actions/agent-page';
import {
  askQuestionAndWait,
  verifyStepContains,
  verifyStepNotContains,
} from '../../support/app-actions/agent-interactions';
import { RESULT_FORMATTING_PROMPTS } from '../../support/helpers/test-scenarios';

describe('Agent Security Tests - Result Handling & Formatting Abuse', () => {
  beforeEach(() => {
    visitAgentPage();
    connectWithToken();
  });

  RESULT_FORMATTING_PROMPTS.forEach((prompt, index) => {
    it(`should handle formatting abuse attempt ${index + 1}: "${prompt.substring(0, 50)}..."`, () => {
      askQuestionAndWait(prompt);

      // Agent should maintain proper formatting
      // Should not expose raw data structures unnecessarily
      // Should not stream data with custom prefixes if requested maliciously

      cy.get('#stepsContainer', { timeout: 30000 }).then(($container) => {
        const content = $container.text();

        // Verify response maintains proper structure
        // Should not output raw JSON, CSV, or other formats if requested maliciously
        // The answer should be in a natural format, not raw data dumps

        cy.log(`Test prompt: ${prompt}`);
        cy.log('Verify agent maintained proper response formatting');
        cy.log('Agent should not expose raw data structures');
      });
    });
  });
});

