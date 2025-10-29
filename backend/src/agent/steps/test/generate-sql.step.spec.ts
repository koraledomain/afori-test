import { Test, TestingModule } from "@nestjs/testing";
import { GenerateSqlStep } from "../generate-sql.step";
import { LLM_PROVIDER } from "../../../llm/provider.token";
import { createMockAgentState } from "../../../../test/utils/test-helpers";

// Simple fake LLM for testing
class FakeLLM {
  private _response: string;
  constructor(response: string) {
    console.log(`📝 [FakeLLM] Initialized with response: ${response}`);
    this._response = response;
  }
  setResponse(response: string) {
    console.log(`📝 [FakeLLM] Setting new response: ${response}`);
    this._response = response;
  }
  async streamText(
    _prompt: any,
    _inputs: any,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    console.log(`📝 [FakeLLM] streamText called with inputs:`, _inputs);
    console.log(`📝 [FakeLLM] Calling onChunk with response`);
    onChunk(this._response);
    return this._response;
  }
}

describe("GenerateSqlStep", () => {
  let step: GenerateSqlStep;
  let fakeLLM: FakeLLM;

  beforeEach(async () => {
    console.log("📝 [BeforeEach] Setting up unit test");
    fakeLLM = new FakeLLM("SELECT COUNT(*) FROM customers;");

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateSqlStep,
        { provide: LLM_PROVIDER, useValue: fakeLLM },
      ],
    }).compile();

    step = module.get<GenerateSqlStep>(GenerateSqlStep);
    console.log("📝 [BeforeEach] Unit test setup complete");
  });

  describe("execute", () => {
    it("should generate SQL query from analysis", async () => {
      console.log("📝 [UNIT TEST START] Test: should generate SQL query from analysis");
      
      const agentState = createMockAgentState({
        question: "How many customers?",
        analysis: "Need to count records in customers table",
      });

      console.log(`📝 [UNIT TEST] Agent state created with question: ${agentState.question}`);
      console.log(`📝 [UNIT TEST] Agent state created with analysis: ${agentState.analysis}`);

      const streamTextSpy = jest.spyOn(fakeLLM, 'streamText');
      console.log("📝 [UNIT TEST] Created jest spy on streamText");
      
      await step.execute(agentState, () => {});

      console.log(`📝 [UNIT TEST] Step executed, SQL Query: ${agentState.sqlQuery}`);
      console.log(`📝 [UNIT TEST] streamTextSpy was called ${streamTextSpy.mock.calls.length} times`);

      expect(agentState.sqlQuery).toBeTruthy();
      expect(agentState.sqlQuery).toContain("SELECT");
      
      expect(streamTextSpy).toHaveBeenCalledTimes(1);
      const [promptTemplate, inputs] = streamTextSpy.mock.calls[0];
      console.log(`📝 [UNIT TEST] Spy captured prompt template:`, promptTemplate);
      console.log(`📝 [UNIT TEST] Spy captured inputs:`, inputs);
      
      expect(inputs.question).toBe("How many customers?");
      expect(inputs.analysis).toBe("Need to count records in customers table");
      
      streamTextSpy.mockRestore();
      console.log("📝 [UNIT TEST PASS] Test passed!");
    });

    it("should clean markdown formatting from SQL", async () => {
      console.log("📝 [UNIT TEST START] Test: should clean markdown formatting from SQL");
      
      fakeLLM.setResponse("```sql\nSELECT * FROM customers;\n```");

      const agentState = createMockAgentState({
        analysis: "Get all customers",
      });

      console.log("📝 [UNIT TEST] Executing step with markdown SQL");
      await step.execute(agentState, () => {});

      console.log(`📝 [UNIT TEST] Result SQL: ${agentState.sqlQuery}`);

      expect(agentState.sqlQuery).not.toContain("```");
      expect(agentState.sqlQuery).not.toContain("sql");
      expect(agentState.sqlQuery).toContain("SELECT * FROM customers");
      console.log("📝 [UNIT TEST PASS] Markdown cleaning test passed!");
    });
  });
});
