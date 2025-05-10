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
exports.FormatAnswerStep = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const prompts_1 = require("@langchain/core/prompts");
const provider_token_1 = require("../../llm/provider.token");
let FormatAnswerStep = class FormatAnswerStep {
    llmProvider;
    constructor(llmProvider) {
        this.llmProvider = llmProvider;
    }
    async execute(agentState, onChunk) {
        const prompt = prompts_1.ChatPromptTemplate.fromTemplate(`
      You are a helpful assistant explaining database query results to a user.
      
      User question: {question}
      
      SQL query used: {sql}
      
      Query result: {result}
      
      Please provide a clear, concise, and helpful answer to the user's question based on these query results.
      Focus on directly answering what they asked, adding context only when necessary.
      If the result is empty or null, explain what that means in relation to their question.
      
      Answer:
    `);
        const answer = await this.llmProvider.streamText(prompt, {
            question: agentState.question,
            sql: agentState.sqlQuery,
            result: agentState.queryResult,
        }, onChunk);
        agentState.answer = answer;
    }
};
exports.FormatAnswerStep = FormatAnswerStep;
exports.FormatAnswerStep = FormatAnswerStep = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_2.Inject)(provider_token_1.LLM_PROVIDER)),
    __metadata("design:paramtypes", [Object])
], FormatAnswerStep);
//# sourceMappingURL=format-answer.step.js.map