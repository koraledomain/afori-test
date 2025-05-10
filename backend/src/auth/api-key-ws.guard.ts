import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from './auth.service';

@Injectable()
export class ApiKeyWsGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyWsGuard.name);

  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    return this.checkApiKey(client);
  }

  async checkApiKey(client: Socket): Promise<boolean> {
    const token =
      (client.handshake.query.apiKey as string) ||
      (client.handshake.headers['x-api-key'] as string);

    if (!token) {
      this.logger.warn(
        `Socket connection rejected due to missing API key: ${client.id}`,
      );
      client.disconnect(true);
      return false;
    }

    try {
      const payload = await this.authService.validateToken(token);
      client.data.user = payload;
      return true;
    } catch {
      this.logger.warn(
        `Socket connection rejected due to invalid API key: ${client.id}`,
      );
      client.disconnect(true);
      return false;
    }
  }
}
