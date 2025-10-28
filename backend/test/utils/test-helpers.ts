import { AgentState } from "../../src/agent/interfaces/state.interface";
import { SqlDatabase } from "langchain/sql_db";

/**
 * Create a mock SqlDatabase for agent state
 */

export function createMockSqlDatabase(): Partial<SqlDatabase> {
  return {
    run: jest.fn().mockResolvedValue([{ count: 5 }]),
    getTableInfo: jest.fn().mockResolvedValue(`
      CREATE TABLE customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255)
      );
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        total DECIMAL(10, 2)
      );
    `),
  } as any;
}

/**
 * Create a mock AgentState for testing
 */
export function createMockAgentState(
  overrides: Partial<AgentState> = {},
): AgentState {
  const mockSqlDb = createMockSqlDatabase() as SqlDatabase;
  const dbSchema = "CREATE TABLE customers (id SERIAL, name VARCHAR);";

  return {
    sqlDb: mockSqlDb,
    dbSchema,
    question: "How many customers?",
    analysis: "",
    sqlQuery: "",
    queryResult: "",
    answer: "",
    ...overrides,
  };
}
