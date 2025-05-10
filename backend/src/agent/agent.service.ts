import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SqlDatabase } from 'langchain/sql_db';
import { StreamHandler } from '../streaming/stream.interface';
import {
  AnalyzeQuestionStep,
  FormatAnswerStep,
  GenerateSqlStep,
  RunQueryStep,
} from './steps';
import { AgentState } from './interfaces/state.interface';

/**
 * Implements an agentic approach for SQL question answering using LangChain's
 * expression language and runnable sequences.
 */
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private sqlDb: SqlDatabase;
  private dbSchema: string = '';

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly analyzeQuestionStep: AnalyzeQuestionStep,
    private readonly generateSqlStep: GenerateSqlStep,
    private readonly runQueryStep: RunQueryStep,
    private readonly formatAnswerStep: FormatAnswerStep,
  ) {
    void this.initSqlDatabase();
  }

  private async initSqlDatabase() {
    try {
      this.sqlDb = await SqlDatabase.fromDataSourceParams({
        appDataSource: this.dataSource,
      });

      // Cache the database schema for prompts
      this.dbSchema = await this.sqlDb.getTableInfo();
      this.logger.debug('Database schema:', this.dbSchema);
      this.logger.log('SQL Database initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize SQL database: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process a user question and return detailed results with streaming updates
   */
  async processQuestion(
    question: string,
    streamHandler: StreamHandler,
  ): Promise<{
    question: string;
    analysis: string;
    sqlQuery: string;
    queryResult: string;
    answer: string;
  }> {
    this.logger.log(`Processing question: "${question}"`);

    try {
      const agentState: AgentState = {
        sqlDb: this.sqlDb,
        dbSchema: this.dbSchema,
        question,
        analysis: '',
        sqlQuery: '',
        queryResult: '',
        answer: '',
      };

      // Step 1: Analyze the question
      streamHandler.onStepStart('analysis');
      await this.analyzeQuestionStep.execute(agentState, (chunk) =>
        streamHandler.onChunk('analysis', chunk),
      );
      streamHandler.onStepComplete('analysis', agentState.analysis);

      // Step 2: Generate SQL query
      streamHandler.onStepStart('sqlQuery');
      await this.generateSqlStep.execute(agentState, (chunk) =>
        streamHandler.onChunk('sqlQuery', chunk),
      );
      streamHandler.onStepComplete('sqlQuery', agentState.sqlQuery);

      // Step 3: Execute the query
      streamHandler.onStepStart('queryResult');
      await this.runQueryStep.execute(agentState);
      streamHandler.onStepComplete('queryResult', agentState.queryResult);

      // Step 4: Generate final answer
      streamHandler.onStepStart('answer');
      await this.formatAnswerStep.execute(agentState, (chunk) =>
        streamHandler.onChunk('answer', chunk),
      );
      streamHandler.onStepComplete('answer', agentState.answer);

      // Signal process completion
      streamHandler.onComplete('Processing complete');

      return {
        question,
        analysis: agentState.analysis,
        sqlQuery: agentState.sqlQuery,
        queryResult: agentState.queryResult,
        answer: agentState.answer,
      };
    } catch (error) {
      this.logger.error(`Error processing question: ${error.message}`);
      streamHandler.onError(`Error processing question: ${error.message}`);
      throw error;
    }
  }
}
