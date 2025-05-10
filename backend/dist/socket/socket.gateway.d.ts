import { OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { ApiKeyWsGuard } from '../auth/api-key-ws.guard';
export declare class SocketGateway implements OnGatewayConnection {
    private readonly socketService;
    private readonly apiKeyWsGuard;
    private readonly logger;
    server: Server;
    constructor(socketService: SocketService, apiKeyWsGuard: ApiKeyWsGuard);
    handleConnection(socket: Socket): Promise<void>;
    handleQuestion(socket: Socket, payload: {
        question: string;
    }): Promise<void>;
}
