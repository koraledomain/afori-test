import { AgentState } from '../interfaces/state.interface';
import { AgentStep } from '../interfaces/step.interface';
export declare class RunQueryStep implements AgentStep {
    private readonly logger;
    constructor();
    execute(agentState: AgentState): Promise<void>;
}
