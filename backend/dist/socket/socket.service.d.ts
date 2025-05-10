import { Socket } from 'socket.io';
import { AgentService } from '@/agent/agent.service';
import { SocketAdapter } from './socket.adapter';
export declare class SocketService {
    private readonly agentService;
    private readonly socketAdapter;
    private readonly logger;
    private readonly connectedClients;
    constructor(agentService: AgentService, socketAdapter: SocketAdapter);
    handleConnection(socket: Socket): void;
    handleAgentQuery(socket: Socket, question: string): Promise<void>;
}
