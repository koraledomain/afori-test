import { Socket } from 'socket.io';
import { StreamHandler } from '../streaming/stream.interface';
export declare class SocketAdapter implements StreamHandler {
    private readonly logger;
    private socket;
    setSocket(socket: Socket): void;
    checkSocket(): void;
    onChunk(step: string, chunk: string): void;
    onStepStart(step: string): void;
    onStepComplete(step: string, data: string): void;
    onError(message: string): void;
    onComplete(message: string): void;
}
