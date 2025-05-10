import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIChatProvider } from './open-ai.chat.provider';
import { LLM_PROVIDER } from './provider.token';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: LLM_PROVIDER,
      useClass: OpenAIChatProvider,
    },
  ],
  exports: [LLM_PROVIDER],
})
export class LlmModule {}
