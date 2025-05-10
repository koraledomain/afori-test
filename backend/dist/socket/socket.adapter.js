"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SocketAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketAdapter = void 0;
const common_1 = require("@nestjs/common");
let SocketAdapter = SocketAdapter_1 = class SocketAdapter {
    logger = new common_1.Logger(SocketAdapter_1.name);
    socket;
    setSocket(socket) {
        this.socket = socket;
    }
    checkSocket() {
        if (!this.socket) {
            this.logger.warn('Cannot emit chunk: No socket connected');
            return;
        }
    }
    onChunk(step, chunk) {
        this.checkSocket();
        this.socket.emit('agentStepChunk', {
            step,
            chunk,
        });
    }
    onStepStart(step) {
        this.checkSocket();
        this.socket.emit('agentStepStart', { step });
    }
    onStepComplete(step, data) {
        this.checkSocket();
        this.socket.emit('agentStepComplete', {
            step,
            data,
        });
    }
    onError(message) {
        this.checkSocket();
        this.socket.emit('error', { message });
    }
    onComplete(message) {
        this.checkSocket();
        this.socket.emit('agentComplete', { message });
    }
};
exports.SocketAdapter = SocketAdapter;
exports.SocketAdapter = SocketAdapter = SocketAdapter_1 = __decorate([
    (0, common_1.Injectable)()
], SocketAdapter);
//# sourceMappingURL=socket.adapter.js.map