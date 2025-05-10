import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { LLMProvider, LLM_PROVIDER } from '../../llm/provider.token';
import { AgentStep } from '../interfaces/step.interface';
import { AgentState } from '../interfaces/state.interface';

/**
 * Generate a SQL query based on the question and analysis
 */
@Injectable()
export class GenerateSqlStep implements AgentStep {
  private readonly logger = new Logger(GenerateSqlStep.name);

  constructor(
    @Inject(LLM_PROVIDER)
    private readonly llmProvider: LLMProvider,
  ) {}

  async execute(agentState: AgentState, onChunk: (chunk: string) => void) {
    const prompt = ChatPromptTemplate.fromTemplate(`
      You are a SQL expert. Your task is to convert a natural language question into a SQL query
      based on the provided analysis and database schema.
      
      Database Schema:
      {schema}
      
      User question: {question}
      
      Analysis of required tables and columns:
      {analysis}
      
      CRITICAL INSTRUCTIONS:
      1. The SQL query must be valid PostgreSQL syntax
      2. Use the EXACT table and column names shown in the schema
      3. Include appropriate JOINs when needed
      4. Return only raw SQL without any additional formatting, explanation, or markdown
      5. Make sure the query answers the user's question completely
      
      SQL Query:
    `);

    const sql = await this.llmProvider.streamText(
      prompt,
      {
        schema: agentState.dbSchema,
        question: agentState.question,
        analysis: agentState.analysis,
      },
      onChunk,
    );

    const cleanSql = this.cleanSqlQuery(sql);

    this.logger.debug('Generated SQL query:', cleanSql);

    agentState.sqlQuery = cleanSql;
  }

  /**
   * Clean SQL query by removing markdown formatting
   */
  private cleanSqlQuery(sql: string): string {
    // Remove markdown SQL formatting (```sql and ```)
    let cleanSql = sql.replace(/```sql\n?/g, '').replace(/```/g, '');

    // Remove any leading/trailing whitespace
    cleanSql = cleanSql.trim();

    return cleanSql;
  }
}
