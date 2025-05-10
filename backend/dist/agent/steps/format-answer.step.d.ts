import { LLMProvider } from '../../llm/provider.token';
import { AgentState } from '../interfaces/state.interface';
import { AgentStep } from '../interfaces/step.interface';
export declare class FormatAnswerStep implements AgentStep {
    private readonly llmProvider;
    constructor(llmProvider: LLMProvider);
    execute(agentState: AgentState, onChunk: (chunk: string) => void): Promise<void>;
}
