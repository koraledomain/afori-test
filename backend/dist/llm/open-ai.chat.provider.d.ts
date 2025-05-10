import { ConfigService } from '@nestjs/config';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { LLMProvider } from './provider.token';
export declare class OpenAIChatProvider implements LLMProvider {
    private configService;
    private readonly logger;
    private modelConfig;
    private model;
    constructor(configService: ConfigService);
    streamText(prompt: ChatPromptTemplate, inputs: Record<string, string>, onChunk: (chunk: string) => void): Promise<string>;
    generateText(prompt: ChatPromptTemplate, inputs: Record<string, string>): Promise<string>;
}
