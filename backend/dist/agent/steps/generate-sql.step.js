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
var GenerateSqlStep_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateSqlStep = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const prompts_1 = require("@langchain/core/prompts");
const provider_token_1 = require("../../llm/provider.token");
let GenerateSqlStep = GenerateSqlStep_1 = class GenerateSqlStep {
    llmProvider;
    logger = new common_1.Logger(GenerateSqlStep_1.name);
    constructor(llmProvider) {
        this.llmProvider = llmProvider;
    }
    async execute(agentState, onChunk) {
        const prompt = prompts_1.ChatPromptTemplate.fromTemplate(`
      You are a SQL expert. Your task is to convert a natural language question into a SQL query
      based on the provided analysis and database schema.
      
      Database Schema:
      {schema}
      
      User question: {question}
      
      Analysis of required tables and columns:
      {analysis}
      
      CRITICAL INSTRUCTIONS:
      1. The SQL query must be valid PostgreSQL syntax
      2. Use the EXACT table and column names shown in the schema
      3. Include appropriate JOINs when needed
      4. Return only raw SQL without any additional formatting, explanation, or markdown
      5. Make sure the query answers the user's question completely
      
      SQL Query:
    `);
        const sql = await this.llmProvider.streamText(prompt, {
            schema: agentState.dbSchema,
            question: agentState.question,
            analysis: agentState.analysis,
        }, onChunk);
        const cleanSql = this.cleanSqlQuery(sql);
        this.logger.debug('Generated SQL query:', cleanSql);
        agentState.sqlQuery = cleanSql;
    }
    cleanSqlQuery(sql) {
        let cleanSql = sql.replace(/```sql\n?/g, '').replace(/```/g, '');
        cleanSql = cleanSql.trim();
        return cleanSql;
    }
};
exports.GenerateSqlStep = GenerateSqlStep;
exports.GenerateSqlStep = GenerateSqlStep = GenerateSqlStep_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_2.Inject)(provider_token_1.LLM_PROVIDER)),
    __metadata("design:paramtypes", [Object])
], GenerateSqlStep);
//# sourceMappingURL=generate-sql.step.js.map