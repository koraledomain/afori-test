# Cypress Testing Approach

## Pattern: Functional Helpers + Application Actions

This project uses the **Functional Helpers + Application Actions** pattern to structure Cypress tests for better maintainability, reusability, and readability.

## Architecture Overview

```
cypress/
├── e2e/                          # Test specifications
│   └── agent.cy.ts              # Clean, readable tests using application actions
├── support/
│   ├── helpers/                  # Functional Helpers (pure utility functions)
│   │   └── token.ts             # Token caching utilities
│   ├── app-actions/              # Application Actions (user interaction workflows)
│   │   └── agent-page.ts         # Agent page interactions
│   ├── commands.ts               # Cypress custom commands (bridge helpers/actions)
│   └── e2e.ts                    # Support file configuration
└── config.ts                     # Cypress configuration
```

## Pattern Breakdown

### 1. Functional Helpers (`support/helpers/`)

**Purpose**: Pure utility functions that don't interact with the DOM or use Cypress commands directly.

**Characteristics**:
- No DOM manipulation
- No Cypress-specific code (except accessing `Cypress.env()` for data)
- Reusable across different contexts
- Easy to unit test

**Example**:
```typescript
// cypress/support/helpers/token.ts
export function getCachedToken(): string | null {
  return Cypress.env('__tokenCache') || null;
}

export function cacheToken(token: string): void {
  Cypress.env('__tokenCache', token);
}

export function clearCachedToken(): void {
  Cypress.env('__tokenCache', null);
}
```

### 2. Application Actions (`support/app-actions/`)

**Purpose**: Functions that encapsulate user interactions and represent complete workflows.

**Characteristics**:
- Use Cypress commands to interact with UI
- Represent user workflows/business logic
- Can compose multiple actions together
- Can use functional helpers internally
- May return Cypress Chainables for async operations

**Example**:
```typescript
// cypress/support/app-actions/agent-page.ts
import { cacheToken, getCachedToken } from '../helpers/token';

export function visitAgentPage(): void {
  cy.visit('/agent');
}

export function fillTokenInput(token: string): void {
  cy.get('#jwtToken').clear().type(token);
  cy.get('#jwtToken').should('have.value', token);
}

export function connectWithToken(): void {
  fetchToken().then((token) => {
    fillTokenInput(token);
    clickConnectButton();
    verifyConnected();
    verifyEnabledAfterConnection();
    verifyReconnectButton();
  });
}
```

### 3. Test Specifications (`e2e/`)

**Purpose**: Clean, readable tests that use application actions.

**Characteristics**:
- No direct DOM manipulation
- Read like user stories
- Focus on **what** is being tested, not **how**
- Use application actions for all interactions

**Example**:
```typescript
// cypress/e2e/agent.cy.ts
import {
  visitAgentPage,
  verifyPageTitle,
  verifyPageElements,
  connectWithToken,
} from '../support/app-actions/agent-page';

describe('Agent Streaming Demo Page', () => {
  beforeEach(() => {
    visitAgentPage();
  });

  it('should render the page with correct title', () => {
    verifyPageTitle();
  });

  it('should fetch token, fill JWT input, and connect', () => {
    connectWithToken();
  });
});
```

## Benefits

1. **Separation of Concerns**
   - Helpers handle data/logic
   - Actions handle UI interactions
   - Tests focus on behavior

2. **Reusability**
   - Helpers can be shared across actions
   - Actions can be composed together
   - Tests stay DRY

3. **Maintainability**
   - When UI changes, update only application actions
   - Tests remain unchanged
   - Single source of truth for selectors

4. **Readability**
   - Tests read like user stories
   - Clear intent without implementation details
   - Self-documenting code

5. **Testability**
   - Functional helpers can be unit tested
   - Actions can be tested in isolation
   - Reduced coupling

## Current Implementation

### Agent Page Tests

**Location**: `cypress/e2e/agent.cy.ts`

**Application Actions**: `cypress/support/app-actions/agent-page.ts`

**Available Actions**:
- `visitAgentPage()` - Navigate to agent page
- `verifyPageTitle()` - Verify page title
- `verifyPageElements()` - Verify all UI elements are present
- `verifyInitialDisabledState()` - Verify inputs are disabled initially
- `verifyDefaultQuestion()` - Verify default question text
- `connectWithToken()` - Complete workflow: fetch token, fill input, connect

### Token Management

**Functional Helpers**: `cypress/support/helpers/token.ts`

**Available Helpers**:
- `getCachedToken()` - Get cached token
- `cacheToken(token)` - Store token in cache
- `clearCachedToken()` - Clear token cache

**Custom Command**: `cy.getCachedToken()` - Available in all tests

## Best Practices

1. **Create small, focused actions**
   - Each action should do one thing well
   - Compose complex workflows from simple actions

2. **Use functional helpers for data operations**
   - Token caching
   - Data transformations
   - Calculations

3. **Keep tests simple**
   - If a test is complex, create a composite action
   - Tests should read like documentation

4. **Naming conventions**
   - Actions: Verb + Object (e.g., `fillTokenInput`, `clickConnectButton`)
   - Helpers: Verb + Object (e.g., `getCachedToken`, `clearCachedToken`)
   - Verifications: `verify*` prefix (e.g., `verifyPageTitle`)

5. **File organization**
   - One application action file per page/feature
   - Group related helpers in the same file
   - Use clear, descriptive file names

## Example: Adding a New Test

### Step 1: Identify the workflow
```
User wants to ask a question:
1. Connect with token (already exists)
2. Type question in input
3. Click ask button
4. Verify response appears
```

### Step 2: Create application actions

```typescript
// cypress/support/app-actions/agent-page.ts

export function typeQuestion(question: string): void {
  cy.get('#questionInput').clear().type(question);
}

export function clickAskButton(): void {
  cy.get('#askBtn').click();
}

export function verifyStepsContainerHasContent(): void {
  cy.get('#stepsContainer').should('not.be.empty');
}

// Composite action
export function askQuestion(question: string): void {
  typeQuestion(question);
  clickAskButton();
  verifyStepsContainerHasContent();
}
```

### Step 3: Use in test

```typescript
// cypress/e2e/agent.cy.ts
it('should ask a question and get a response', () => {
  connectWithToken();
  askQuestion('How many customers are there?');
});
```

## Source Maps Configuration

Source maps are enabled for better debugging experience:

- **TypeScript**: `"sourceMap": true` in `tsconfig.cypress.json`
- **esbuild**: `sourcemap: 'inline'` in `cypress.config.ts`

This ensures stack traces show original source code instead of transpiled code.

## Future Enhancements

1. **Page Object Model**: Consider adding page objects for complex pages
2. **API Helpers**: Create helpers for common API interactions
3. **Test Data Management**: Centralize test data in helpers
4. **Custom Assertions**: Add domain-specific assertions
5. **Type Safety**: Expand TypeScript types for better IDE support
