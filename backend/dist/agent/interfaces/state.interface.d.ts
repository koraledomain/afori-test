import { SqlDatabase } from 'langchain/sql_db';
export interface AgentState {
    sqlDb: SqlDatabase;
    dbSchema: string;
    question: string;
    analysis: string;
    sqlQuery: string;
    queryResult: string;
    answer: string;
}
