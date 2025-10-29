# Running Cypress Tests Manually

This guide shows you how to run Cypress tests locally and view the reports.

## Prerequisites

1. Make sure Docker is running
2. Ensure Node.js 22+ is installed
3. Install dependencies: `npm ci` (in the backend directory)

## Step-by-Step Instructions

### 1. Start the Application Services

First, start the backend application and database using Docker Compose:

```bash
cd backend
docker compose up -d
```

Wait for services to be ready (PostgreSQL and the NestJS app on port 3000).

### 2. Verify Services are Running

```bash
# Check Docker containers
docker compose ps

# Check if app is accessible
curl http://localhost:3000

# Check PostgreSQL (optional)
docker exec customer-db pg_isready -U test_user
```

### 3. Run Cypress Tests

You have several options:

#### Option A: Run All Tests (Headless Mode)
```bash
cd backend
npm run test:cypress
```

#### Option B: Run All Tests with Specific Spec Pattern
```bash
cd backend
npm run test:cypress -- --spec "cypress/e2e/**/*.cy.ts"
```

#### Option C: Run Specific Test Suite
```bash
cd backend
npm run test:cypress -- --spec "cypress/e2e/agent.cy.ts"
```

#### Option D: Run Security Tests Only
```bash
cd backend
npm run test:cypress -- --spec "cypress/e2e/agent-security/**/*.cy.ts"
```

#### Option E: Run Tests in Interactive Mode (with UI)
```bash
cd backend
npm run cypress:open
```

This opens the Cypress Test Runner UI where you can:
- Select tests to run
- See tests executing in real-time
- Debug failures interactively
- View screenshots and videos

### 4. Generate and View Reports

After tests complete, generate the HTML report:

```bash
cd backend
npm run report:cypress
```

This will:
1. Merge all JSON reports into one
2. Generate the HTML report

### 5. View the Report

Open the generated HTML report:

```bash
# On macOS
open cypress/reports/mochawesome.html

# On Linux
xdg-open cypress/reports/mochawesome.html

# On Windows
start cypress/reports/mochawesome.html

# Or manually open the file in your browser
# Path: backend/cypress/reports/mochawesome.html
```

## Report Location

- **JSON Reports**: `backend/cypress/reports/*.json`
- **Merged JSON**: `backend/cypress/reports/mochawesome.json`
- **HTML Report**: `backend/cypress/reports/mochawesome.html`

## Running Specific Test Scenarios

### Run Only Agent Page Tests
```bash
npm run test:cypress -- --spec "cypress/e2e/agent.cy.ts"
```

### Run Only Authentication Tests
```bash
npm run test:cypress -- --spec "cypress/e2e/auth.cy.ts"
```

### Run Only Prompt Injection Tests
```bash
npm run test:cypress -- --spec "cypress/e2e/agent-security/prompt-injections.cy.ts"
```

### Run Tests with Filter (by title)
```bash
npm run test:cypress -- --spec "cypress/e2e/**/*.cy.ts" --grep "should fetch token"
```

## Debugging Tests

### 1. Run Tests with Verbose Output
```bash
DEBUG=cypress:* npm run test:cypress
```

### 2. Keep Browser Open After Failure
Add to `cypress.config.ts`:
```typescript
e2e: {
  // ... other config
  video: true, // Record videos for debugging
}
```

### 3. Use Interactive Mode
```bash
npm run cypress:open
```

This is best for debugging - you can:
- See each step execute
- Pause and inspect elements
- View console logs
- See network requests

## Common Commands

```bash
# Clean previous reports
rm -rf cypress/reports/*

# Run tests and generate report in one go
npm run test:cypress && npm run report:cypress

# Run specific test and open report
npm run test:cypress -- --spec "cypress/e2e/agent.cy.ts" && npm run report:cypress && open cypress/reports/mochawesome.html
```

## Troubleshooting

### Issue: Tests can't connect to http://localhost:3000

**Solution**: Make sure the app is running:
```bash
docker compose ps  # Check if containers are running
docker compose logs app  # Check app logs
```

### Issue: Report not generated

**Solution**: Check if JSON reports exist:
```bash
ls -la cypress/reports/*.json
```

If no JSON files, the tests might have failed before generating reports.

### Issue: "relation does not exist" errors

**Solution**: This is expected for schema hallucination tests. The tests are designed to handle these gracefully.

### Issue: Timeout errors

**Solution**: Check if the app is responding slowly:
```bash
curl http://localhost:3000/auth/generate-token -X POST
```

## CI Simulation

To simulate what CI does:

```bash
cd backend

# 1. Start services
docker compose up -d

# 2. Wait for PostgreSQL
docker exec customer-db pg_isready -U test_user

# 3. Run tests
npm run test:cypress -- --spec "cypress/e2e/**/*.cy.ts"

# 4. Generate report
npm run report:cypress

# 5. View report
open cypress/reports/mochawesome.html

# 6. Cleanup (when done)
docker compose down -v
```

## Report Features

The Mochawesome report includes:
- ✅ Test summary (passed/failed/pending)
- 📊 Duration and timing information
- 📸 Screenshots (if enabled)
- 🔍 Detailed test results
- 📝 Error messages and stack traces
- 🎯 Test suites and individual test cases
- 📈 Charts and statistics

## Next Steps

After viewing the report:
1. Check failing tests
2. Review error messages
3. Look at screenshots (if enabled)
4. Fix issues
5. Re-run tests
6. Verify fixes in the report

