import { SqlDatabase } from 'langchain/sql_db';

/**
 * Represents the state of the agent at during the process
 */
export interface AgentState {
  sqlDb: SqlDatabase;
  dbSchema: string;
  question: string;
  analysis: string;
  sqlQuery: string;
  queryResult: string;
  answer: string;
}
