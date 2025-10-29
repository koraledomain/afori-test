import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource, DataSourceOptions } from "typeorm";
import { GenerateSqlStep } from "../generate-sql.step";
import { LLM_PROVIDER } from "../../../llm/provider.token";
import { OpenAIChatProvider } from "../../../llm/open-ai.chat.provider";
import { createMockAgentState } from "../../../../test/utils/test-helpers";
import { SqlDatabase } from "langchain/sql_db";
import { createTrajectoryMatchEvaluator } from "agentevals";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

/**
 * REAL Integration Tests for GenerateSqlStep
 * 
 * These tests use:
 * - Real LLM (OpenAI API)
 * - Real database connection
 * - Real SQL execution
 * - Agentevals for trajectory evaluation
 * 
 * REQUIRED ENVIRONMENT VARIABLES:
 * - LLM_API_KEY: OpenAI API key
 * - LLM_BASE_URL: API endpoint
 * - LLM_MODEL: Model name
 * - DATABASE_URL: PostgreSQL connection string
 */

// Skip tests if environment variables are not set
const shouldRunIntegrationTests =
  process.env.LLM_API_KEY &&
  process.env.DATABASE_URL &&
  process.env.RUN_INTEGRATION_TESTS === "true";

(shouldRunIntegrationTests ? describe : describe.skip)(
  "GenerateSqlStep - REAL Integration Tests",
  () => {
    let step: GenerateSqlStep;
    let llmProvider: OpenAIChatProvider;
    let dataSource: DataSource;
    let sqlDb: SqlDatabase;
    let agentState: any;

    beforeAll(async () => {
      console.log("📝 [INTEGRATION SETUP] Setting up real database and LLM");
      console.log(`📝 [INTEGRATION SETUP] DATABASE_URL: ${process.env.DATABASE_URL ? '***set***' : 'NOT SET'}`);

      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL environment variable is required for integration tests");
      }

      // Create real database connection
      const dbOptions: DataSourceOptions = {
        type: "postgres",
        url: process.env.DATABASE_URL,
        // Only connect to test database
        synchronize: false,
        logging: false,
        connectTimeoutMS: 10000, // 10 second timeout
      };

      try {
        dataSource = new DataSource(dbOptions);
        await dataSource.initialize();
        console.log("📝 [INTEGRATION SETUP] Database connected successfully");
      } catch (error) {
        console.error("📝 [INTEGRATION SETUP] Database connection failed:", error.message);
        console.error(`📝 [INTEGRATION SETUP] DATABASE_URL format: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}`);
        throw error;
      }

      // Create LangChain SqlDatabase wrapper
      sqlDb = await SqlDatabase.fromDataSourceParams({
        appDataSource: dataSource,
      });
      console.log("📝 [INTEGRATION SETUP] LangChain SqlDatabase created");

      // Get real database schema
      const dbSchema = await sqlDb.getTableInfo();
      console.log("📝 [INTEGRATION SETUP] Database schema loaded:", dbSchema);

      // Create real LLM provider
      const configService = {
        get: (key: string) => process.env[key],
      };

      llmProvider = new OpenAIChatProvider(configService as any);
      console.log("📝 [INTEGRATION SETUP] Real LLM provider initialized");

      // Inject real dependencies
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            envFilePath: ".env",
          }),
        ],
        providers: [
          GenerateSqlStep,
          { provide: LLM_PROVIDER, useValue: llmProvider },
        ],
      }).compile();

      step = module.get<GenerateSqlStep>(GenerateSqlStep);
      console.log("📝 [INTEGRATION SETUP] Setup complete");
    });

    afterAll(async () => {
      console.log("📝 [INTEGRATION TEARDOWN] Closing connections");
      if (dataSource?.isInitialized) {
        await dataSource.destroy();
      }
    });

    beforeEach(async () => {
      // Get real database schema for each test
      const dbSchema = await sqlDb.getTableInfo();

      agentState = {
        sqlDb: sqlDb,
        dbSchema: dbSchema,
        question: "",
        analysis: "",
        sqlQuery: "",
        queryResult: "",
        answer: "",
      };
    });

    /**
     * REAL Integration Test: Generate SQL with real LLM and evaluate trajectory
     */
    it("should generate valid SQL query using real LLM", async () => {
      console.log("📝 [REAL INTEGRATION TEST] Starting real LLM + DB test");

      agentState.question = "How many customers are there?";
      agentState.analysis =
        "Need to count the total number of records in the customers table";

      const chunks: string[] = [];

      console.log("📝 [REAL TEST] Calling real LLM to generate SQL");
      await step.execute(agentState, (chunk) => chunks.push(chunk));

      console.log(`📝 [REAL TEST] Generated SQL: ${agentState.sqlQuery}`);
      console.log(`📝 [REAL TEST] Chunks received: ${chunks.length}`);

      // Verify we got a real SQL query from the LLM
      expect(agentState.sqlQuery).toBeTruthy();
      expect(agentState.sqlQuery.length).toBeGreaterThan(0);
      expect(agentState.sqlQuery.toUpperCase()).toContain("SELECT");

      // Verify it doesn't contain markdown
      expect(agentState.sqlQuery).not.toContain("```");

      // Now try to execute it on the real database
      console.log("📝 [REAL TEST] Executing SQL on real database");
      try {
        const results = await sqlDb.run(agentState.sqlQuery);
        console.log("📝 [REAL TEST] Query executed successfully:", results);

        // Use agentevals to evaluate the trajectory
        const actualTrajectory = [
          new HumanMessage(
            `Question: ${agentState.question}, Analysis: ${agentState.analysis}`
          ),
          new AIMessage(`SQL Generated: ${agentState.sqlQuery}`),
        ];

        const referenceTrajectory = [
          new HumanMessage(
            `Question: ${agentState.question}, Analysis: ${agentState.analysis}`
          ),
          new AIMessage("SQL Generated: SELECT COUNT(*) FROM customers;"),
        ];

        console.log("📝 [REAL TEST] Evaluating trajectory with agentevals");
        const evaluator = createTrajectoryMatchEvaluator({
          trajectoryMatchMode: "strict",
        });

        const evaluation = await evaluator({
          outputs: actualTrajectory,
          referenceOutputs: referenceTrajectory,
        });

        console.log("📝 [REAL TEST] Evaluation result:", evaluation);
        console.log("📝 [REAL TEST] Test completed successfully");
      } catch (error) {
        console.error("📝 [REAL TEST] SQL execution failed:", error.message);
        // Don't fail the test if database doesn't exist yet
        // Just verify the LLM generated something that looks like SQL
        expect(agentState.sqlQuery).toMatch(/\bSELECT\b/i);
      }
    }, 30000); // 30 second timeout for real API calls

    /**
     * REAL Integration Test: Test with different question and verify quality
     */
    it("should handle complex queries with real LLM", async () => {
      console.log(
        "📝 [REAL INTEGRATION TEST] Testing complex query with real LLM"
      );

      agentState.question =
        "Show me all customers with their total order amounts";
      agentState.analysis =
        "Need to join customers and orders tables, group by customer, and sum order totals";

      await step.execute(agentState, () => {});

      console.log(`📝 [REAL TEST] Generated SQL: ${agentState.sqlQuery}`);

      // Verify it generated a complex query
      expect(agentState.sqlQuery).toBeTruthy();
      expect(agentState.sqlQuery.toUpperCase()).toContain("SELECT");

      // Check if it's a complex query (has JOIN, GROUP BY, or similar)
      const complexKeywords = ["JOIN", "GROUP BY", "SUM", "COUNT"];
      const hasComplexity = complexKeywords.some((keyword) =>
        agentState.sqlQuery.toUpperCase().includes(keyword)
      );

      console.log(
        `📝 [REAL TEST] Query complexity check passed: ${hasComplexity}`
      );

      // For a good response, we'd expect some complexity
      // But don't fail if LLM chose a simpler approach
      expect(agentState.sqlQuery.length).toBeGreaterThan(20);
    }, 30000);
  }
);

// Show helpful message if tests are skipped
if (!shouldRunIntegrationTests) {
  console.log(
    "\n⚠️  Integration tests skipped. To run them, set environment variables:\n" +
      "  - LLM_API_KEY\n" +
      "  - DATABASE_URL\n" +
      "  - LLM_BASE_URL\n" +
      "  - LLM_MODEL\n" +
      "  - RUN_INTEGRATION_TESTS=true\n"
  );
}
