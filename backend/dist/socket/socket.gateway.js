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
var SocketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const socket_service_1 = require("./socket.service");
const common_1 = require("@nestjs/common");
const api_key_ws_guard_1 = require("../auth/api-key-ws.guard");
let SocketGateway = SocketGateway_1 = class SocketGateway {
    socketService;
    apiKeyWsGuard;
    logger = new common_1.Logger(SocketGateway_1.name);
    server;
    constructor(socketService, apiKeyWsGuard) {
        this.socketService = socketService;
        this.apiKeyWsGuard = apiKeyWsGuard;
    }
    async handleConnection(socket) {
        try {
            await this.apiKeyWsGuard.checkApiKey(socket);
            this.socketService.handleConnection(socket);
        }
        catch (error) {
            this.logger.error(`Error handling socket connection: ${error.message}`);
            socket.disconnect(true);
        }
    }
    async handleQuestion(socket, payload) {
        try {
            const question = typeof payload === 'string'
                ? JSON.parse(payload).question
                : payload && payload.question;
            if (!question) {
                throw new websockets_1.WsException('Question is required');
            }
            return this.socketService.handleAgentQuery(socket, question);
        }
        catch (error) {
            this.logger.error(`Error handling question: ${error.message}`);
            socket.emit('error', { message: error.message });
        }
    }
};
exports.SocketGateway = SocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('question'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleQuestion", null);
exports.SocketGateway = SocketGateway = SocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    (0, common_1.UseGuards)(api_key_ws_guard_1.ApiKeyWsGuard),
    __metadata("design:paramtypes", [socket_service_1.SocketService,
        api_key_ws_guard_1.ApiKeyWsGuard])
], SocketGateway);
//# sourceMappingURL=socket.gateway.js.map