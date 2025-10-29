/// <reference types="cypress" />
import { visitAgentPage, verifyPageTitle, verifyPageElements, verifyInitialDisabledState, verifyDefaultQuestion, connectWithToken } from '../support/app-actions/agent-page';

describe('Agent Streaming Demo Page', () => {
  beforeEach(() => {
    visitAgentPage();
  });

  it('should render the page with correct title', () => {
    verifyPageTitle();
  });

  it('should have all required UI elements present', () => {
    verifyPageElements();
  });

  it('should have question input and ask button disabled initially', () => {
    verifyInitialDisabledState();
  });

  it('should have a default question value in the input', () => {
    verifyDefaultQuestion();
  });

  it('should fetch token, fill JWT input, and connect', () => {
    connectWithToken();
  });
});