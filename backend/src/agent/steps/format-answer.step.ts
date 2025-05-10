import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { LLMProvider, LLM_PROVIDER } from '../../llm/provider.token';
import { AgentState } from '../interfaces/state.interface';
import { AgentStep } from '../interfaces/step.interface';

/**
 * Generate a natural language answer based on the query results
 */
@Injectable()
export class FormatAnswerStep implements AgentStep {
  constructor(
    @Inject(LLM_PROVIDER)
    private readonly llmProvider: LLMProvider,
  ) {}

  async execute(agentState: AgentState, onChunk: (chunk: string) => void) {
    const prompt = ChatPromptTemplate.fromTemplate(`
      You are a helpful assistant explaining database query results to a user.
      
      User question: {question}
      
      SQL query used: {sql}
      
      Query result: {result}
      
      Please provide a clear, concise, and helpful answer to the user's question based on these query results.
      Focus on directly answering what they asked, adding context only when necessary.
      If the result is empty or null, explain what that means in relation to their question.
      
      Answer:
    `);

    const answer = await this.llmProvider.streamText(
      prompt,
      {
        question: agentState.question,
        sql: agentState.sqlQuery,
        result: agentState.queryResult,
      },
      onChunk,
    );

    agentState.answer = answer;
  }
}
