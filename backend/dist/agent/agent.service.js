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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sql_db_1 = require("langchain/sql_db");
const steps_1 = require("./steps");
let AgentService = AgentService_1 = class AgentService {
    dataSource;
    analyzeQuestionStep;
    generateSqlStep;
    runQueryStep;
    formatAnswerStep;
    logger = new common_1.Logger(AgentService_1.name);
    sqlDb;
    dbSchema = '';
    constructor(dataSource, analyzeQuestionStep, generateSqlStep, runQueryStep, formatAnswerStep) {
        this.dataSource = dataSource;
        this.analyzeQuestionStep = analyzeQuestionStep;
        this.generateSqlStep = generateSqlStep;
        this.runQueryStep = runQueryStep;
        this.formatAnswerStep = formatAnswerStep;
        void this.initSqlDatabase();
    }
    async initSqlDatabase() {
        try {
            this.sqlDb = await sql_db_1.SqlDatabase.fromDataSourceParams({
                appDataSource: this.dataSource,
            });
            this.dbSchema = await this.sqlDb.getTableInfo();
            this.logger.debug('Database schema:', this.dbSchema);
            this.logger.log('SQL Database initialized successfully');
        }
        catch (error) {
            this.logger.error(`Failed to initialize SQL database: ${error.message}`);
            throw error;
        }
    }
    async processQuestion(question, streamHandler) {
        this.logger.log(`Processing question: "${question}"`);
        try {
            const agentState = {
                sqlDb: this.sqlDb,
                dbSchema: this.dbSchema,
                question,
                analysis: '',
                sqlQuery: '',
                queryResult: '',
                answer: '',
            };
            streamHandler.onStepStart('analysis');
            await this.analyzeQuestionStep.execute(agentState, (chunk) => streamHandler.onChunk('analysis', chunk));
            streamHandler.onStepComplete('analysis', agentState.analysis);
            streamHandler.onStepStart('sqlQuery');
            await this.generateSqlStep.execute(agentState, (chunk) => streamHandler.onChunk('sqlQuery', chunk));
            streamHandler.onStepComplete('sqlQuery', agentState.sqlQuery);
            streamHandler.onStepStart('queryResult');
            await this.runQueryStep.execute(agentState);
            streamHandler.onStepComplete('queryResult', agentState.queryResult);
            streamHandler.onStepStart('answer');
            await this.formatAnswerStep.execute(agentState, (chunk) => streamHandler.onChunk('answer', chunk));
            streamHandler.onStepComplete('answer', agentState.answer);
            streamHandler.onComplete('Processing complete');
            return {
                question,
                analysis: agentState.analysis,
                sqlQuery: agentState.sqlQuery,
                queryResult: agentState.queryResult,
                answer: agentState.answer,
            };
        }
        catch (error) {
            this.logger.error(`Error processing question: ${error.message}`);
            streamHandler.onError(`Error processing question: ${error.message}`);
            throw error;
        }
    }
};
exports.AgentService = AgentService;
exports.AgentService = AgentService = AgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        steps_1.AnalyzeQuestionStep,
        steps_1.GenerateSqlStep,
        steps_1.RunQueryStep,
        steps_1.FormatAnswerStep])
], AgentService);
//# sourceMappingURL=agent.service.js.map