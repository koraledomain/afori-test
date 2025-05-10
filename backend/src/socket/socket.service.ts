import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AgentService } from '@/agent/agent.service';
import { SocketAdapter } from './socket.adapter';

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);
  private readonly connectedClients: Map<string, Socket> = new Map();

  constructor(
    private readonly agentService: AgentService,
    private readonly socketAdapter: SocketAdapter,
  ) {}

  handleConnection(socket: Socket): void {
    const clientId = socket.id;
    this.connectedClients.set(clientId, socket);

    socket.on('disconnect', () => {
      this.logger.log(`Client disconnected: ${clientId}`);
      this.connectedClients.delete(clientId);
    });
  }

  async handleAgentQuery(socket: Socket, question: string): Promise<void> {
    try {
      this.logger.log(
        `Processing agent query for client ${socket.id}: "${question}"`,
      );

      // Emit an event to indicate processing has started
      socket.emit('agentProcessing', {
        status: 'started',
        message: 'Processing your question...',
        question,
      });

      // Configure the socket adapter with the current socket
      this.socketAdapter.setSocket(socket);

      // Process the query using our service with the socket adapter for streaming
      await this.agentService.processQuestion(question, this.socketAdapter);

      // Final complete event (although the socket adapter will also emit this)
      socket.emit('agentComplete', {
        message: 'Processing complete',
        question,
      });
    } catch (error) {
      this.logger.error(`Error processing agent query: ${error.message}`);
      socket.emit('error', {
        message: `Error processing your question: ${error.message}`,
        question,
      });
    }
  }
}
