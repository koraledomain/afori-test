import { ChatPromptTemplate } from '@langchain/core/prompts';

/**
 * Interface for language model providers
 */
export interface LLMProvider {
  /**
   * Stream text generation from the language model
   * @param prompt The prompt template
   * @param inputs Input variables for the prompt
   * @param onChunk Callback for each chunk of generated text
   * @returns The complete generated text
   */
  streamText(
    prompt: ChatPromptTemplate,
    inputs: Record<string, string>,
    onChunk: (chunk: string) => void,
  ): Promise<string>;

  /**
   * Generate text from the language model (non-streaming)
   * @param prompt The prompt template
   * @param inputs Input variables for the prompt
   * @returns The generated text
   */
  generateText(
    prompt: ChatPromptTemplate,
    inputs: Record<string, string>,
  ): Promise<string>;
}

export const LLM_PROVIDER = 'LLM_PROVIDER';
