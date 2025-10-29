# Agent Testing Documentation

## Table of Contents
1. [Overview](#overview)
2. [Testing Philosophy](#testing-philosophy)
3. [Test Types](#test-types)
4. [Setup Instructions](#setup-instructions)
5. [Usage Examples](#usage-examples)
6. [Maintenance Guidelines](#maintenance-guidelines)
7. [Troubleshooting](#troubleshooting)

## Overview

This document provides comprehensive documentation for the agent testing infrastructure. The agent system is composed of four sequential steps that transform a natural language question into a SQL query and produce a formatted answer.

### Agent Architecture

The agent follows a step-based architecture:

```
User Question → AnalyzeQuestionStep → GenerateSqlStep → RunQueryStep → FormatAnswerStep → Answer
```

Each step is responsible for a specific transformation:
- **AnalyzeQuestionStep**: Analyzes the user's question against the database schema
- **GenerateSqlStep**: Generates a SQL query based on the analysis
- **RunQueryStep**: Executes the SQL query against the database
- **FormatAnswerStep**: Formats the query results into a natural language answer

## Testing Philosophy

### Core Principles

1. **Isolation**: Each component is tested independently
2. **Determinism**: Tests must produce predictable, repeatable results
3. **Speed**: Tests should run quickly without network or database dependencies
4. **Maintainability**: Tests should be easy to understand and modify

### Why This Approach?

Traditional integration tests that call real LLMs and databases are:
- **Slow**: Network calls take time
- **Expensive**: LLM API calls cost money
- **Flaky**: External dependencies can fail unpredictably
- **Hard to debug**: Non-deterministic outputs make failures difficult to reproduce

Our approach uses:
- **Mocked LLMs**: Predictable responses without API calls
- **Mocked Databases**: No need for real database connections
- **Deterministic outputs**: Same inputs always produce same outputs

## Test Types

### Unit Tests

**Purpose**: Test individual components in isolation with mocked dependencies.

**Location**: `src/agent/steps/test/*.step.spec.ts`

**Characteristics**:
- Fast execution (< 1 second)
- No external dependencies
- Deterministic behavior
- Tests specific functionality
- Uses Jest spies and mocks

**Example Files**:
- `generate-sql.step.spec.ts` (2 tests)
- `run-query.step.spec.ts` (3 tests)
- `analyse-question.step.spec.ts` (1 test)
- `format-answer.step.spec.ts` (3 tests)

### Integration Tests

**Purpose**: Test component behavior with trajectory-based evaluation using agentevals library.

**Location**: `src/agent/steps/test/*.integration.spec.ts`

**Characteristics**:
- Tests execution trajectories
- Uses agentevals for trajectory matching
- Validates step sequencing and behavior
- Can use real LLM patterns (but mocked for determinism)

**Example Files**:
- `generate-sql.integration.spec.ts` (2 tests)

**Integration Test Modes**:
1. **Strict Trajectory Match**: Requires exact sequence of operations
2. **Unordered Trajectory Match**: Same operations, any order

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm 8+
- Jest testing framework (included in dependencies)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Verify installation:
```bash
npm test
```

Expected output:
```
Test Suites: 5 passed, 5 total
Tests:       11 passed, 11 total
```

### Development Dependencies

Key testing dependencies:
- `@nestjs/testing`: NestJS testing utilities
- `jest`: JavaScript testing framework
- `ts-jest`: TypeScript support for Jest
- `agentevals`: Trajectory-based evaluation library
- `@langchain/core`: LangChain core library for message types

## Usage Examples

### Running Tests

#### Run All Tests
```bash
npm test
```

Expected output:
```
PASS src/agent/steps/test/run-query.step.spec.ts
PASS src/agent/steps/test/generate-sql.step.spec.ts
PASS src/agent/steps/test/analyse-question.step.spec.ts
PASS src/agent/steps/test/format-answer.step.spec.ts
PASS src/agent/steps/test/generate-sql.integration.spec.ts

Test Suites: 5 passed, 5 total
Tests:       11 passed, 11 total
```

#### Run Specific Test File
```bash
npm test generate-sql.step.spec
```

#### Run Integration Tests Only
```bash
npm test integration
```

#### Run with Watch Mode
```bash
npm run test:watch
```

#### Run with Coverage
```bash
npm run test:cov
```

### Understanding Test Output

Test output includes console logs prefixed with emojis:
- 📝 General logging
- Test execution flow
- Input/output values
- Assertion results

Example output:
```
📝 [BeforeEach] Setting up unit test
📝 [FakeLLM] Initialized with response: SELECT COUNT(*) FROM customers;
📝 [UNIT TEST START] Test: should generate SQL query from analysis
📝 [UNIT TEST] Agent state created with question: How many customers?
📝 [UNIT TEST PASS] Test passed!
```

### Writing New Unit Tests

#### 1. Create the Test File
Create a file named `your-component.spec.ts` next to the component.

#### 2. Set Up Test Module
```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { YourComponent } from "./your-component";
import { LLM_PROVIDER } from "../../../llm/provider.token";
import { createMockAgentState } from "../../../../test/utils/test-helpers";

class FakeLLM {
  private _response: string;
  constructor(response: string) {
    this._response = response;
  }
  async streamText(_prompt: any, _inputs: any, onChunk: (chunk: string) => void): Promise<string> {
    onChunk(this._response);
    return this._response;
  }
}

describe("YourComponent", () => {
  let component: YourComponent;
  let fakeLLM: FakeLLM;

  beforeEach(async () => {
    fakeLLM = new FakeLLM("expected response");

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourComponent,
        { provide: LLM_PROVIDER, useValue: fakeLLM },
      ],
    }).compile();

    component = module.get<YourComponent>(YourComponent);
  });
  
  // ... tests here
});
```

#### 3. Write Test Cases
```typescript
it("should do something", async () => {
  const agentState = createMockAgentState({
    question: "Test question",
  });

  await component.execute(agentState, () => {});

  expect(agentState.result).toBeTruthy();
});
```

### Writing Integration Tests

```typescript
import { createTrajectoryMatchEvaluator } from "agentevals";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

it("should match reference trajectory", async () => {
  // Execute your step
  await step.execute(agentState, () => {});

  // Create trajectory from actual execution
  const actualTrajectory = [
    new HumanMessage("Input 1"),
    new AIMessage("Output 1"),
  ];

  // Create reference trajectory
  const referenceTrajectory = [
    new HumanMessage("Input 1"),
    new AIMessage("Expected Output 1"),
  ];

  // Evaluate with agentevals
  const evaluator = createTrajectoryMatchEvaluator({
    trajectoryMatchMode: "strict",
  });

  const evaluation = await evaluator({
    outputs: actualTrajectory,
    referenceOutputs: referenceTrajectory,
  });

  expect(evaluation.score).toBe(true);
});
```

## Maintenance Guidelines

### When to Add Tests

Add unit tests when:
- Adding new functionality to a step
- Fixing a bug (add test to prevent regression)
- Refactoring code (ensure behavior doesn't change)
- Discovering edge cases during development

Add integration tests when:
- Testing step sequences
- Validating trajectory patterns
- Ensuring correct execution order

### Test Maintenance Best Practices

1. **Keep Tests Focused**
   - One test = one behavior
   - Clear test names that describe what is being tested
   - Avoid testing multiple scenarios in one test

2. **Use Descriptive Names**
   ```typescript
   // Good
   it("should generate SQL query from analysis")
   
   // Bad
   it("should work")
   ```

3. **Clean Up After Tests**
   ```typescript
   afterEach(() => {
     jest.restoreAllMocks();
   });
   ```

4. **Keep Mocks Simple**
   - Don't over-complicate mock setups
   - Use the minimal configuration needed
   - Document why complex mocks are necessary

5. **Review Test Coverage**
   - Aim for high coverage on critical paths
   - Don't obsess over 100% coverage
   - Focus on testing important behaviors

### Common Patterns

#### Testing with Jest Spies
```typescript
const spy = jest.spyOn(fakeLLM, 'streamText');
await step.execute(agentState, () => {});
expect(spy).toHaveBeenCalledTimes(1);
spy.mockRestore();
```

#### Testing Error Cases
```typescript
it("should handle error gracefully", async () => {
  mockFunction.mockRejectedValue(new Error("Test error"));
  
  await expect(step.execute(agentState)).rejects.toThrow("Test error");
});
```

#### Testing Edge Cases
```typescript
it("should handle empty input", async () => {
  const agentState = createMockAgentState({ question: "" });
  await step.execute(agentState, () => {});
  // Assert expected behavior
});
```

### Debugging Failed Tests

1. **Check Console Logs**: Look for 📝 emoji logs
2. **Verify Mock Setup**: Ensure mocks return expected values
3. **Check State Changes**: Verify agentState is modified correctly
4. **Run Tests in Isolation**: Use focused test execution
5. **Review Error Messages**: Jest provides helpful error details

## Troubleshooting

### Common Issues

#### Issue: "Cannot find module"
**Solution**: Run `npm install` to ensure all dependencies are installed.

#### Issue: Tests timeout
**Solution**: Check for infinite loops or unhandled promises in test code.

#### Issue: Mock not working
**Solution**: Ensure mock is set up before calling the function being tested.

#### Issue: Type errors
**Solution**: Check that types match between mocks and real implementations.

#### Issue: Tests pass individually but fail together
**Solution**: Check for shared state between tests. Use `beforeEach` to reset state.

### Getting Help

1. Check console logs (📝 prefix) for detailed execution information
2. Review this documentation
3. Look at existing test files for examples
4. Check Jest documentation: https://jestjs.io/docs/getting-started

## Summary

The agent testing infrastructure provides:
- **Fast**, deterministic unit tests
- **Flexible** integration tests using agentevals
- **Clear** logging and documentation
- **Maintainable** code patterns

Follow these guidelines to ensure the test suite remains reliable and easy to work with as the codebase grows.

