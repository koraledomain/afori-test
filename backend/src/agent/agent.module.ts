import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LlmModule } from '../llm/llm.module';
import { AgentService } from './agent.service';
import { AnalyzeQuestionStep } from './steps/analyse-question.step';
import { GenerateSqlStep } from './steps/generate-sql.step';
import { RunQueryStep } from './steps/run-query.step';
import { FormatAnswerStep } from './steps/format-answer.step';

@Module({
  imports: [
    TypeOrmModule.forFeature([]), // No entities needed directly
    LlmModule,
  ],
  providers: [
    AgentService,
    AnalyzeQuestionStep,
    GenerateSqlStep,
    RunQueryStep,
    FormatAnswerStep,
  ],
  exports: [AgentService],
})
export class AgentModule {}
