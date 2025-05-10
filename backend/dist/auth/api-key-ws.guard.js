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
var ApiKeyWsGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyWsGuard = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
let ApiKeyWsGuard = ApiKeyWsGuard_1 = class ApiKeyWsGuard {
    authService;
    logger = new common_1.Logger(ApiKeyWsGuard_1.name);
    constructor(authService) {
        this.authService = authService;
    }
    async canActivate(context) {
        const client = context.switchToWs().getClient();
        return this.checkApiKey(client);
    }
    async checkApiKey(client) {
        const token = client.handshake.query.apiKey ||
            client.handshake.headers['x-api-key'];
        if (!token) {
            this.logger.warn(`Socket connection rejected due to missing API key: ${client.id}`);
            client.disconnect(true);
            return false;
        }
        try {
            const payload = await this.authService.validateToken(token);
            client.data.user = payload;
            return true;
        }
        catch {
            this.logger.warn(`Socket connection rejected due to invalid API key: ${client.id}`);
            client.disconnect(true);
            return false;
        }
    }
};
exports.ApiKeyWsGuard = ApiKeyWsGuard;
exports.ApiKeyWsGuard = ApiKeyWsGuard = ApiKeyWsGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], ApiKeyWsGuard);
//# sourceMappingURL=api-key-ws.guard.js.map