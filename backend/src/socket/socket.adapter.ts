import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { StreamHandler } from '../streaming/stream.interface';

/**
 * Socket adapter that implements the StreamHandler interface
 * Translates between our transport-agnostic streaming interface and Socket.IO
 */
@Injectable()
export class SocketAdapter implements StreamHandler {
  private readonly logger = new Logger(SocketAdapter.name);
  private socket: Socket;

  /**
   * Set the socket instance this adapter should use
   */
  setSocket(socket: Socket): void {
    this.socket = socket;
  }

  /**
   * Check if the socket is connected
   */
  checkSocket() {
    if (!this.socket) {
      this.logger.warn('Cannot emit chunk: No socket connected');
      return;
    }
  }

  /**
   * Emit a chunk of data for a particular step
   */
  onChunk(step: string, chunk: string): void {
    this.checkSocket();

    this.socket.emit('agentStepChunk', {
      step,
      chunk,
    });
  }

  /**
   * Signal that a step is starting
   */
  onStepStart(step: string): void {
    this.checkSocket();

    this.socket.emit('agentStepStart', { step });
  }

  /**
   * Signal that a step is complete
   */
  onStepComplete(step: string, data: string): void {
    this.checkSocket();

    this.socket.emit('agentStepComplete', {
      step,
      data,
    });
  }

  /**
   * Emit an error
   */
  onError(message: string): void {
    this.checkSocket();

    this.socket.emit('error', { message });
  }

  /**
   * Signal that the entire process is complete
   */
  onComplete(message: string): void {
    this.checkSocket();

    this.socket.emit('agentComplete', { message });
  }
}
