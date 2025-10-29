import { Test, TestingModule } from "@nestjs/testing";
import { AnalyzeQuestionStep } from "../analyse-question.step";
import { LLM_PROVIDER } from "../../../llm/provider.token";
import { createMockAgentState } from "../../../../test/utils/test-helpers";

// Simple fake LLM for testing
class FakeLLM {
  constructor(private response: string) {}
  async streamText(prompt: any, inputs: any, onChunk: (chunk: string) => void): Promise<string> {
    onChunk(this.response);
    return this.response;
  }
}

describe("AnalyzeQuestionStep", () => {
  let step: AnalyzeQuestionStep;

  beforeEach(async () => {
    const fakeLLM = new FakeLLM(
      "Based on the question and schema, I need to analyze the customers table to count the total number of customers."
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyzeQuestionStep,
        {
          provide: LLM_PROVIDER,
          useValue: fakeLLM,
        },
      ],
    }).compile();

    step = module.get<AnalyzeQuestionStep>(AnalyzeQuestionStep);
  });

  describe("execute", () => {

    it("should handle complex questions requiring multiple tables", async () => {
      const fakeLLM = new FakeLLM("To answer this question, I need to join customers and orders tables to find customers with orders.");
      const module = await Test.createTestingModule({
        providers: [
          AnalyzeQuestionStep,
          { provide: LLM_PROVIDER, useValue: fakeLLM },
        ],
      }).compile();
      const testStep = module.get<AnalyzeQuestionStep>(AnalyzeQuestionStep);

      const agentState = createMockAgentState({
        question: "Show me customers who have placed orders",
        dbSchema:
          "CREATE TABLE customers (id SERIAL); CREATE TABLE orders (customer_id INTEGER);",
      });

      const streamTextSpy = jest.spyOn(fakeLLM, 'streamText');

      await testStep.execute(agentState, () => {});


      expect(streamTextSpy).toHaveBeenCalledTimes(1);
      const [promptTemplate, inputs] = streamTextSpy.mock.calls[0];
      console.log('📝 promptTemplate:', promptTemplate);
      console.log('📝 inputs:', inputs);

     expect(inputs.question).toBe("Show me customers who have placed orders");
    expect(inputs.schema).toBe("CREATE TABLE customers (id SERIAL); CREATE TABLE orders (customer_id INTEGER);");


      expect(agentState.analysis).toContain("customers");
      expect(agentState.analysis).toContain("orders");
    });  
  });
});
