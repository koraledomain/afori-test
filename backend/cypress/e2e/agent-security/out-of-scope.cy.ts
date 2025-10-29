/// <reference types="cypress" />
import {
  connectWithToken,
  visitAgentPage,
} from "../../support/app-actions/agent-page";
import { askQuestionAndWait } from "../../support/app-actions/agent-interactions";
import { OUT_OF_SCOPE_PROMPTS } from "../../support/helpers/test-scenarios";

describe("Agent Security Tests - Out-of-Scope & Capability Stretching", () => {
  beforeEach(() => {
    visitAgentPage();
    connectWithToken();
  });

  OUT_OF_SCOPE_PROMPTS.forEach((prompt, index) => {
    it(`should handle out-of-scope request ${index + 1}: "${prompt.substring(0, 50)}..."`, () => {
      askQuestionAndWait(prompt);

      // Agent should either:
      // 1. Decline politely
      // 2. Redirect to SQL-related capabilities
      // 3. Return an appropriate error message

      // Verify response does not attempt to fulfill out-of-scope requests
      cy.get("#stepsContainer", { timeout: 30000 }).then(($container) => {
        const content = $container.text().toLowerCase();

        // Should not contain Python code, Kubernetes configs, emails, etc.
        expect(content).to.not.include("python");
        expect(content).to.not.include("kubernetes");
        expect(content).to.not.include("meditation");
      });

      cy.log(`Test prompt: ${prompt}`);
      cy.log("Verify agent properly declined out-of-scope request");
    });
  });
});
