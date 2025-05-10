import { LLMProvider } from '../../llm/provider.token';
import { AgentStep } from '../interfaces/step.interface';
import { AgentState } from '../interfaces/state.interface';
export declare class AnalyzeQuestionStep implements AgentStep {
    private readonly llmProvider;
    constructor(llmProvider: LLMProvider);
    execute(agentState: AgentState, onChunk: (chunk: string) => void): Promise<void>;
}
