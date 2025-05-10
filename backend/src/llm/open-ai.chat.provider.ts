import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI, ChatOpenAIFields } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { LLMProvider } from './provider.token';

@Injectable()
export class OpenAIChatProvider implements LLMProvider {
  private readonly logger = new Logger(OpenAIChatProvider.name);
  private modelConfig: ChatOpenAIFields;
  private model: ChatOpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('LLM_API_KEY');
    const baseURL = this.configService.get<string>('LLM_BASE_URL');
    const modelName = this.configService.get<string>('LLM_MODEL');

    this.modelConfig = {
      modelName,
      temperature: 0,
      apiKey,
      configuration: {
        baseURL,
        timeout: 30000, // 30 second timeout
      },
      maxRetries: 3,
    };

    this.model = new ChatOpenAI(this.modelConfig);

    this.logger.log('OpenAIChatProvider initialized');
    this.logger.log(`Using API URL: ${baseURL}`);
    this.logger.log(`Using model: ${modelName}`);
  }

  /**
   * Stream text generation from the language model
   */
  async streamText(
    prompt: ChatPromptTemplate,
    inputs: Record<string, string>,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    try {
      let fullResponse = '';

      // Create a streaming model instance with callbacks
      const streamingModel = new ChatOpenAI({
        ...this.modelConfig,
        streaming: true,
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              fullResponse += token;
              onChunk(token);
            },
          },
        ],
      });

      await prompt
        .pipe(streamingModel)
        .pipe(new StringOutputParser())
        .invoke(inputs);

      return fullResponse;
    } catch {
      // this.logger.error(`Error in streaming: ${error.message}`);
      return '';
    }
  }

  /**
   * Generate text from the language model (non-streaming)
   */
  async generateText(
    prompt: ChatPromptTemplate,
    inputs: Record<string, string>,
  ): Promise<string> {
    try {
      const result = await prompt
        .pipe(this.model)
        .pipe(new StringOutputParser())
        .invoke(inputs);

      return result;
    } catch {
      // this.logger.error(`Error generating text: ${error.message}`);
      return '';
    }
  }
}
