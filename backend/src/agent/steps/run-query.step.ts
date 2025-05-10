import { Injectable, Logger } from '@nestjs/common';
import { AgentState } from '../interfaces/state.interface';
import { AgentStep } from '../interfaces/step.interface';

/**
 * Execute the generated SQL query
 */
@Injectable()
export class RunQueryStep implements AgentStep {
  private readonly logger = new Logger(RunQueryStep.name);

  constructor() {}

  async execute(agentState: AgentState) {
    try {
      const result = await agentState.sqlDb.run(agentState.sqlQuery);

      // Convert the result to a string
      agentState.queryResult =
        typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    } catch (error) {
      this.logger.error(`Error executing query: ${error.message}`);
      throw new Error(`Failed to execute SQL query: ${error.message}`);
    }
  }
}
