# Quick Start Testing Guide

## What are we testing?

Our agent has 4 steps that work together:
- **AnalyzeQuestionStep**: Understanding the user's question
- **GenerateSqlStep**: Creating the SQL query
- **RunQueryStep**: Running the query on the database
- **FormatAnswerStep**: Turning results into readable text

## Two Types of Tests

### Unit Tests (Simple, Fast, Mocked)
**What they do**: Test one small piece in isolation with fake data
- ✅ Fast (< 1 second)
- ✅ Uses fake data (no real LLM or database)
- ✅ Always gives the same result
- ✅ No external dependencies

**Example**: "Does GenerateSqlStep create a valid SQL query?"

**Run**: `npm test -- step.spec`

### Integration Tests (Real LLM + Real Database)
**What they do**: Test with REAL external services
- ⚠️ **Slow** (real API calls take time)
- ⚠️ **Requires setup** (API keys, database)
- ✅ Uses **real LLM** (OpenAI API)
- ✅ Uses **real database** (PostgreSQL)
- ✅ Tests actual integration between components
- ✅ Uses agentevals to evaluate response quality

**Example**: "Does the real LLM generate good SQL that works on the real database?"

**Run**: `npm test -- integration`

## Running Tests

### All Unit Tests (Default)
```bash
cd backend
npm test
```

### Just Unit Tests
```bash
npm test -- step.spec
```

### Real Integration Tests (Requires Setup)
```bash
npm test -- integration
```

**Note**: Integration tests are **skipped by default**. See setup below.

### Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:cov
```

## Setting Up Integration Tests

Integration tests use **REAL services**, so you need to configure them:

### 1. Set Environment Variables

Create or edit `.env` file in the `backend/` folder:

```env
# LLM Configuration
LLM_API_KEY=your_openai_api_key_here
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-3.5-turbo

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/your_database

# Enable Integration Tests
RUN_INTEGRATION_TESTS=true
```

### 2. Ensure Database is Running

Recommended: run tests and Postgres via Docker Compose:

```bash
cd backend
docker compose --env-file .env up --build --abort-on-container-exit --exit-code-from tests
```

### 3. Run Integration Tests

```bash
cd backend
npm test -- integration
```

## Understanding Test Output

All test files support optional logging. By default `console.log/info/debug` are suppressed in Jest to keep output clean. Set `TEST_LOG=1` to re-enable.

Look for these emojis in test-driven logs:

- 📝 = General logging/info
- [BeforeEach] = Test setup
- [UNIT TEST] = Unit test execution
- [REAL TEST] = Real integration test execution
- [INTEGRATION SETUP] = Database/LLM setup
- [TEST PASS] = Test successful

### Example Unit Test Output:
```
📝 [BeforeEach] Setting up unit test
📝 [FakeLLM] Initialized with response: SELECT COUNT(*) FROM customers;
📝 [UNIT TEST START] Test: should generate SQL query from analysis
📝 [UNIT TEST PASS] Test passed!
```

### Example Integration Test Output:
```
📝 [INTEGRATION SETUP] Setting up real database and LLM
📝 [INTEGRATION SETUP] Database connected
📝 [REAL TEST] Calling real LLM to generate SQL
📝 [REAL TEST] Generated SQL: SELECT COUNT(*) FROM customers;
📝 [REAL TEST] Query executed successfully
📝 [REAL TEST] Evaluation result: { score: true }
```

## Reading Test Results

### Passing Tests
```
PASS src/agent/steps/test/generate-sql.step.spec.ts
✓ should generate SQL query from analysis
✓ should clean markdown formatting from SQL
```

### Failing Tests
```
FAIL src/agent/steps/test/generate-sql.step.spec.ts
✗ should generate SQL query from analysis
  Expected: "SELECT COUNT(*) FROM customers;"
  Received: undefined
```

Check the 📝 logs to see where it failed!

## Basic Test Structure

### Unit Test Example
```typescript
describe('GenerateSqlStep', () => {
  let step: GenerateSqlStep;
  let fakeLLM: FakeLLM;

  beforeEach(async () => {
    // Setup: Create fake LLM (no real API calls)
    fakeLLM = new FakeLLM("SELECT * FROM customers;");
    const module = await Test.createTestingModule({
      providers: [GenerateSqlStep, { provide: LLM_PROVIDER, useValue: fakeLLM }],
    }).compile();
    step = module.get(GenerateSqlStep);
  });

  it('should generate SQL query', async () => {
    const agentState = createMockAgentState({
      question: "How many customers?",
    });

    await step.execute(agentState, () => {});

    expect(agentState.sqlQuery).toContain("SELECT");
  });
});
```

## What's Different: Unit vs Integration

| Aspect | Unit Tests | Integration Tests |
|--------|-----------|-------------------|
| **Speed** | Very fast (< 1s) | Slow (30s+ per test) |
| **Setup** | No setup needed | Requires API keys + DB |
| **LLM** | Fake/mocked | Real OpenAI API |
| **Database** | Mocked | Real PostgreSQL |
| **Cost** | Free | Costs API money 💰 |
| **Purpose** | Test logic | Test real integration |
| **Library** | Jest only | Jest + agentevals |
| **When to run** | Every commit | Before deployment |

## Common Tasks

### Add a New Unit Test
1. Find the `.spec.ts` file for your component
2. Add a new `it("should...", async () => {})` block
3. Use console.log with 📝 to see what's happening
4. Run: `npm test`

### Debug a Failing Test
1. Read the 📝 logs
2. Check what inputs were provided
3. Check what outputs were produced
4. Compare with expected values

### Test Specific Functionality
```bash
# Run just one test file
npm test generate-sql

# Run in watch mode
npm run test:watch

# Run with coverage report
npm run test:cov
```

### Enable Integration Tests Temporarily
```bash
# Run without modifying .env
LLM_API_KEY=sk-xxx DATABASE_URL=postgresql://... RUN_INTEGRATION_TESTS=true npm test -- integration
```

## Troubleshooting

### Integration Tests Skipped
```
⚠️  Integration tests skipped. To run them, set environment variables:
  - LLM_API_KEY
  - DATABASE_URL
  - RUN_INTEGRATION_TESTS=true
```

**Solution**: Set the required environment variables (see setup section above).

### Integration Tests Timeout
**Solution**: Increase timeout in test file, or check API/database connectivity.

### Integration Tests Fail
**Solution**: 
- Check API key is valid
- Check database is running and accessible
- Check database has the expected schema

### Unit Tests Work, Integration Tests Don't
**Solution**: This is normal - unit tests are isolated, integration tests need real services.

## Cost Considerations

⚠️ **Integration tests cost money** because they call the real LLM API!

- Unit tests: **Free** (use mocks)
- Integration tests: **Cost per API call** (use real LLM)

**Recommendation**: 
- Run unit tests on every commit
- Run integration tests only before deployment or when changing prompts

## Summary

- **Unit tests** = Fast, free, always run
- **Integration tests** = Real LLM + DB, costs money, run selectively
- **📝 logs** = See what's happening inside tests
- **npm test** = Run unit tests (default)
- **npm test -- integration** = Run real integration tests (requires setup)

See `AGENT_TESTING.md` for comprehensive documentation.

Happy testing! 🚀

## Alternative: Using Docker Registry

Instead of exporting/importing Docker images as tar files, you can publish the image to a regular Docker registry (e.g., Docker Hub, Artifactory, GitHub Container Registry). This approach is particularly useful for:

- **CI/CD integration**: Your testing framework can automatically pull the latest image
- **Team collaboration**: Multiple developers/CI pipelines can use the same image
- **Version management**: Tag images with versions for better tracking

### Workflow with Registry

1. **Build and publish the image** when you want to test:
   ```bash
   docker build -t my-registry.com/project/afori-test-api:latest -f Dockerfile.prod .
   docker push my-registry.com/project/afori-test-api:latest
   ```

2. **Testing framework pulls and runs the image**:
   ```bash
   docker pull my-registry.com/project/afori-test-api:latest
   docker run -p 3000:3000 my-registry.com/project/afori-test-api:latest
   ```

This approach is especially valuable in CI/CD pipelines where tests need to run against a consistent, versioned application image.