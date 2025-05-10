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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzeQuestionStep = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const prompts_1 = require("@langchain/core/prompts");
const provider_token_1 = require("../../llm/provider.token");
let AnalyzeQuestionStep = class AnalyzeQuestionStep {
    llmProvider;
    constructor(llmProvider) {
        this.llmProvider = llmProvider;
    }
    async execute(agentState, onChunk) {
        const prompt = prompts_1.ChatPromptTemplate.fromTemplate(`
      You are a database expert. Your task is to analyze a user's question about data
      and determine which tables and fields would be needed to answer it.
      
      Database Schema:
      {schema}
      
      User question: {question}
      
      Think step by step about which tables and columns would be needed to answer this question.
      Consider the relationships between tables and how to join them if necessary.
      
      Your analysis should be detailed and explain your reasoning clearly.
    `);
        const result = await this.llmProvider.streamText(prompt, {
            schema: agentState.dbSchema,
            question: agentState.question,
        }, onChunk);
        agentState.analysis = result;
    }
};
exports.AnalyzeQuestionStep = AnalyzeQuestionStep;
exports.AnalyzeQuestionStep = AnalyzeQuestionStep = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_2.Inject)(provider_token_1.LLM_PROVIDER)),
    __metadata("design:paramtypes", [Object])
], AnalyzeQuestionStep);
//# sourceMappingURL=analyse-question.step.js.map