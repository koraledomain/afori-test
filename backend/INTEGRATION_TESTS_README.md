# Real Integration Tests Guide

## What Are Real Integration Tests?

Unlike unit tests that use fake data, **real integration tests** use:
- ✅ **Real LLM** (OpenAI API)
- ✅ **Real Database** (PostgreSQL)
- ✅ **Real SQL execution**
- ✅ **Agentevals library** for trajectory evaluation

This tests if your agent works in production with actual external services.

## Why Use Real Integration Tests?

### Unit Tests ❌ Don't Test
- Real LLM behavior
- Actual API responses
- Database connectivity
- Real SQL execution
- End-to-end integration

### Integration Tests ✅ Do Test
- Does the real LLM generate good SQL?
- Does the SQL work on the real database?
- Is the trajectory/pattern correct?
- Do all components work together?
- Is the quality acceptable for production?

## Setup Instructions

### 1. Set Environment Variables

Create/edit `.env` file:

```env
# LLM Configuration (REQUIRED)
LLM_API_KEY=sk-your-actual-openai-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-3.5-turbo

# Database Configuration (REQUIRED)
DATABASE_URL=postgresql://user:password@localhost:5432/your_database

# Enable Integration Tests (REQUIRED)
RUN_INTEGRATION_TESTS=true
```

### 2. Start Database

```bash
# Using Docker Compose
docker-compose up -d postgres

# Or start your PostgreSQL server
pg_ctl -D /usr/local/var/postgres start
```

### 3. Verify Database Schema

Your database should have the expected tables. For example:

```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255)
);
```

## Running Integration Tests

### Run Integration Tests Only
```bash
cd backend
npm test -- integration
```

### Expected Output
```
📝 [INTEGRATION SETUP] Setting up real database and LLM
📝 [INTEGRATION SETUP] Database connected
📝 [INTEGRATION SETUP] LangChain SqlDatabase created
📝 [REAL TEST] Calling real LLM to generate SQL
📝 [REAL TEST] Generated SQL: SELECT COUNT(*) FROM customers;
📝 [REAL TEST] Query executed successfully
```

## What Gets Tested

### Test 1: Simple Query Generation
```typescript
// Uses REAL LLM to generate SQL
agentState.question = "How many customers are there?";

// Real LLM generates actual SQL
await step.execute(agentState, () => {});

// Validates SQL quality and format
expect(agentState.sqlQuery).toContain("SELECT");
expect(agentState.sqlQuery).not.toContain("```");

// Executes on REAL database
const results = await sqlDb.run(agentState.sqlQuery);

// Evaluates trajectory with agentevals
const evaluator = createTrajectoryMatchEvaluator({
  trajectoryMatchMode: "strict"
});
```

### Test 2: Complex Query Handling
```typescript
// Tests complex query generation
agentState.question = "Show me all customers with their order totals";

// Real LLM must handle JOIN, GROUP BY, etc.
await step.execute(agentState, () => {});

// Checks for query complexity
expect(agentState.sqlQuery.length).toBeGreaterThan(20);
```

## Cost Considerations

⚠️ **Integration tests cost money!**

- Each test calls the real OpenAI API
- Costs depend on model and prompt size
- Estimated cost: $0.001 - $0.01 per test run

**Recommendation**:
- Run unit tests on every commit (free)
- Run integration tests before deployment
- Monitor API usage

## Troubleshooting

### Integration Tests Skipped
```
⚠️  Integration tests skipped. To run them, set environment variables:
  - LLM_API_KEY
  - DATABASE_URL
  - RUN_INTEGRATION_TESTS=true
```

**Solution**: Set all required environment variables.

### Test Timeout
```
Timeout - Async callback was not invoked...
```

**Solution**: API might be slow. Increase timeout or check connectivity.

### Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: 
- Ensure PostgreSQL is running
- Check `DATABASE_URL` is correct
- Verify network connectivity

### API Authentication Failed
```
Error: 401 Unauthorized
```

**Solution**: Check `LLM_API_KEY` is valid and has credits.

## Comparison

| Feature | Unit Tests | Integration Tests |
|---------|-----------|-------------------|
| **LLM** | Fake/mock | Real OpenAI |
| **Database** | Mock | Real PostgreSQL |
| **Speed** | < 1 second | 30+ seconds |
| **Cost** | Free | Costs money |
| **Setup** | None needed | API keys + DB |
| **Reliability** | 100% | Depends on services |
| **When** | Every commit | Before deploy |

## Benefits of This Approach

1. **Catch Real Issues**: LLM might generate unexpected SQL in production
2. **Validate Prompts**: Ensure your prompts work with real LLM
3. **Database Compatibility**: Verify SQL works on real PostgreSQL
4. **Quality Assurance**: Evaluate response quality with agentevals
5. **End-to-End**: Test full component integration

## Example Run

```bash
$ npm test -- integration

> integration tests

📝 [INTEGRATION SETUP] Setting up real database and LLM
📝 [INTEGRATION SETUP] Database connected
📝 [INTEGRATION SETUP] LangChain SqlDatabase created
📝 [INTEGRATION SETUP] Database schema loaded
📝 [INTEGRATION SETUP] Real LLM provider initialized
📝 [INTEGRATION SETUP] Setup complete

📝 [REAL INTEGRATION TEST] Starting real LLM + DB test
📝 [REAL TEST] Calling real LLM to generate SQL
📝 [REAL TEST] Generated SQL: SELECT COUNT(*) FROM customers;
📝 [REAL TEST] Chunks received: 1
📝 [REAL TEST] Executing SQL on real database
📝 [REAL TEST] Query executed successfully: [ { count: 42 } ]
📝 [REAL TEST] Evaluating trajectory with agentevals
📝 [REAL TEST] Evaluation result: { score: true, comment: null }
📝 [REAL TEST] Test completed successfully

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

## Summary

✅ Integration tests now use **REAL services**  
✅ Tests actual LLM responses and database execution  
✅ Uses agentevals for trajectory evaluation  
✅ Cost-effective: Only run when needed license  
✅ Comprehensive validation of production readiness

Happy testing! 🚀
