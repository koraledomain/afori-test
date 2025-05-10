import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { LLMProvider, LLM_PROVIDER } from '../../llm/provider.token';
import { AgentStep } from '../interfaces/step.interface';
import { AgentState } from '../interfaces/state.interface';

/**
 * Analyze the question to determine which tables and fields might be needed
 */
@Injectable()
export class AnalyzeQuestionStep implements AgentStep {
  constructor(
    @Inject(LLM_PROVIDER)
    private readonly llmProvider: LLMProvider,
  ) {}

  async execute(agentState: AgentState, onChunk: (chunk: string) => void) {
    const prompt = ChatPromptTemplate.fromTemplate(`
      You are a database expert. Your task is to analyze a user's question about data
      and determine which tables and fields would be needed to answer it.
      
      Database Schema:
      {schema}
      
      User question: {question}
      
      Think step by step about which tables and columns would be needed to answer this question.
      Consider the relationships between tables and how to join them if necessary.
      
      Your analysis should be detailed and explain your reasoning clearly.
    `);

    const result = await this.llmProvider.streamText(
      prompt,
      {
        schema: agentState.dbSchema,
        question: agentState.question,
      },
      onChunk,
    );

    agentState.analysis = result;
  }
}
