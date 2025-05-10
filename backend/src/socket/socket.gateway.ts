import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  SubscribeMessage,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { Logger, UseGuards } from '@nestjs/common';
import { ApiKeyWsGuard } from '../auth/api-key-ws.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(ApiKeyWsGuard)
export class SocketGateway implements OnGatewayConnection {
  private readonly logger = new Logger(SocketGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly socketService: SocketService,
    private readonly apiKeyWsGuard: ApiKeyWsGuard,
  ) {}

  async handleConnection(socket: Socket): Promise<void> {
    try {
      await this.apiKeyWsGuard.checkApiKey(socket);
      this.socketService.handleConnection(socket);
    } catch (error) {
      this.logger.error(`Error handling socket connection: ${error.message}`);
      socket.disconnect(true);
    }
  }

  @SubscribeMessage('question')
  async handleQuestion(
    socket: Socket,
    payload: { question: string },
  ): Promise<void> {
    try {
      const question =
        typeof payload === 'string'
          ? JSON.parse(payload).question
          : payload && payload.question;

      if (!question) {
        throw new WsException('Question is required');
      }

      return this.socketService.handleAgentQuery(socket, question);
    } catch (error) {
      this.logger.error(`Error handling question: ${error.message}`);
      socket.emit('error', { message: error.message });
    }
  }
}
