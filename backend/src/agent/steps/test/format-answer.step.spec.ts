import { Test, TestingModule } from '@nestjs/testing';
import { FormatAnswerStep } from '../format-answer.step';
import { LLM_PROVIDER } from '../../../llm/provider.token';
import { createMockAgentState } from '../../../../test/utils/test-helpers';

// Simple fake LLM for testing
class FakeLLM {
  private _response: string;
  constructor(response: string) {
    this._response = response;
  }
  setResponse(response: string) {
    this._response = response;
  }
  get response() {
    return this._response;
  }
  async streamText(
    _prompt: any,
    _inputs: any,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    onChunk(this._response);
    return this._response;
  }
}

describe('FormatAnswerStep', () => {
  let step: FormatAnswerStep;
  let fakeLLM: FakeLLM;

  beforeEach(async () => {
    fakeLLM = new FakeLLM('Based on the query results, there are 10 customers in the database.');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormatAnswerStep,
        {
          provide: LLM_PROVIDER,
          useValue: fakeLLM,
        },
      ],
    }).compile();

    step = module.get<FormatAnswerStep>(FormatAnswerStep);
  });

  describe('execute', () => {
    it('should format answer from query results', async () => {
      const agentState = createMockAgentState({
        question: 'How many customers are there?',
        sqlQuery: 'SELECT COUNT(*) as count FROM customers;',
        queryResult: '[{"count": 10}]',
      });

      const streamTextSpy = jest.spyOn(fakeLLM, 'streamText');
      
      await step.execute(agentState, (chunk) => {
        console.log('📝 Received chunk:', chunk);
      });

  
      expect(agentState.answer).toBeTruthy();
      expect(agentState.answer.length).toBeGreaterThan(0);
      expect(agentState.answer).toBe('Based on the query results, there are 10 customers in the database.');
      
      expect(streamTextSpy).toHaveBeenCalledTimes(1);
      const [promptTemplate, inputs] = streamTextSpy.mock.calls[0];
      
      expect(inputs.question).toBe('How many customers are there?');
      expect(inputs.sql).toBe('SELECT COUNT(*) as count FROM customers;');
      expect(inputs.result).toBe('[{"count": 10}]');
    
      expect(promptTemplate).toBeDefined();
      
      streamTextSpy.mockRestore();
    });


    it('should handle empty query results', async () => {
      fakeLLM.setResponse('The query returned no results, which means there are no customers matching your criteria.');

      const agentState = createMockAgentState({
        question: 'Show me customers from Antarctica',
        sqlQuery: 'SELECT * FROM customers WHERE country = \'Antarctica\';',
        queryResult: '[]',
      });

      await step.execute(agentState, () => {
      });
    
      expect(agentState.answer).toContain('no results');
    });


    it('should format complex query results into natural language', async () => {
      fakeLLM.setResponse('The analysis shows that John has placed 5 orders totaling $1500.50, while Jane has 3 orders totaling $750.25.');

      const agentState = createMockAgentState({
        question: 'Show customer statistics',
        sqlQuery: 'SELECT c.name, COUNT(o.id) as orders, SUM(o.total) FROM customers c JOIN orders o...',
        queryResult: JSON.stringify([
          { name: 'John', orders: 5, total: 1500.50 },
          { name: 'Jane', orders: 3, total: 750.25 },
        ]),
      });

      await step.execute(agentState, () => {});

      expect(agentState.queryResult).toContain('John');
      expect(agentState.queryResult).toContain('Jane');
    });

  });
});

