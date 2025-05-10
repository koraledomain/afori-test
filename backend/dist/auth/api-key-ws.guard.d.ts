import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from './auth.service';
export declare class ApiKeyWsGuard implements CanActivate {
    private authService;
    private readonly logger;
    constructor(authService: AuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    checkApiKey(client: Socket): Promise<boolean>;
}
