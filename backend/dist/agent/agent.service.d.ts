import { DataSource } from 'typeorm';
import { StreamHandler } from '../streaming/stream.interface';
import { AnalyzeQuestionStep, FormatAnswerStep, GenerateSqlStep, RunQueryStep } from './steps';
export declare class AgentService {
    private readonly dataSource;
    private readonly analyzeQuestionStep;
    private readonly generateSqlStep;
    private readonly runQueryStep;
    private readonly formatAnswerStep;
    private readonly logger;
    private sqlDb;
    private dbSchema;
    constructor(dataSource: DataSource, analyzeQuestionStep: AnalyzeQuestionStep, generateSqlStep: GenerateSqlStep, runQueryStep: RunQueryStep, formatAnswerStep: FormatAnswerStep);
    private initSqlDatabase;
    processQuestion(question: string, streamHandler: StreamHandler): Promise<{
        question: string;
        analysis: string;
        sqlQuery: string;
        queryResult: string;
        answer: string;
    }>;
}
