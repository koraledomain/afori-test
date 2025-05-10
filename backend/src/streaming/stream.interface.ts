/**
 * Generic stream handler interface
 * This abstraction allows different transport mechanisms to handle streaming data
 */
export interface StreamHandler {
  onChunk(step: string, chunk: string): void;
  onStepStart(step: string): void;
  onStepComplete(step: string, data: string): void;
  onError(message: string): void;
  onComplete(message: string): void;
}
