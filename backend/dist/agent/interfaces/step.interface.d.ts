import { AgentState } from './state.interface';
export interface AgentStep {
    execute(agentState: AgentState, onChunk?: (chunk: string) => void): Promise<void>;
}
