"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SocketService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const common_1 = require("@nestjs/common");
const agent_service_1 = require("../agent/agent.service");
const socket_adapter_1 = require("./socket.adapter");
let SocketService = SocketService_1 = class SocketService {
    agentService;
    socketAdapter;
    logger = new common_1.Logger(SocketService_1.name);
    connectedClients = new Map();
    constructor(agentService, socketAdapter) {
        this.agentService = agentService;
        this.socketAdapter = socketAdapter;
    }
    handleConnection(socket) {
        const clientId = socket.id;
        this.connectedClients.set(clientId, socket);
        socket.on('disconnect', () => {
            this.logger.log(`Client disconnected: ${clientId}`);
            this.connectedClients.delete(clientId);
        });
    }
    async handleAgentQuery(socket, question) {
        try {
            this.logger.log(`Processing agent query for client ${socket.id}: "${question}"`);
            socket.emit('agentProcessing', {
                status: 'started',
                message: 'Processing your question...',
                question,
            });
            this.socketAdapter.setSocket(socket);
            await this.agentService.processQuestion(question, this.socketAdapter);
            socket.emit('agentComplete', {
                message: 'Processing complete',
                question,
            });
        }
        catch (error) {
            this.logger.error(`Error processing agent query: ${error.message}`);
            socket.emit('error', {
                message: `Error processing your question: ${error.message}`,
                question,
            });
        }
    }
};
exports.SocketService = SocketService;
exports.SocketService = SocketService = SocketService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agent_service_1.AgentService,
        socket_adapter_1.SocketAdapter])
], SocketService);
//# sourceMappingURL=socket.service.js.map