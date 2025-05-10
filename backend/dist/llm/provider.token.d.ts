import { ChatPromptTemplate } from '@langchain/core/prompts';
export interface LLMProvider {
    streamText(prompt: ChatPromptTemplate, inputs: Record<string, string>, onChunk: (chunk: string) => void): Promise<string>;
    generateText(prompt: ChatPromptTemplate, inputs: Record<string, string>): Promise<string>;
}
export declare const LLM_PROVIDER = "LLM_PROVIDER";
