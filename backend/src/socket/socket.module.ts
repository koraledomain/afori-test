import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { SocketAdapter } from './socket.adapter';
import { AgentModule } from '../agent/agent.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AgentModule, AuthModule],
  providers: [SocketGateway, SocketService, SocketAdapter],
})
export class SocketModule {}
