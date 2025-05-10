import { AgentState } from './state.interface';

/**
 * Represents a step in the agent's process
 */
export interface AgentStep {
  execute(
    agentState: AgentState,
    onChunk?: (chunk: string) => void,
  ): Promise<void>;
}
