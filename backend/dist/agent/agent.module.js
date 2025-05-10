"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const llm_module_1 = require("../llm/llm.module");
const agent_service_1 = require("./agent.service");
const analyse_question_step_1 = require("./steps/analyse-question.step");
const generate_sql_step_1 = require("./steps/generate-sql.step");
const run_query_step_1 = require("./steps/run-query.step");
const format_answer_step_1 = require("./steps/format-answer.step");
let AgentModule = class AgentModule {
};
exports.AgentModule = AgentModule;
exports.AgentModule = AgentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([]),
            llm_module_1.LlmModule,
        ],
        providers: [
            agent_service_1.AgentService,
            analyse_question_step_1.AnalyzeQuestionStep,
            generate_sql_step_1.GenerateSqlStep,
            run_query_step_1.RunQueryStep,
            format_answer_step_1.FormatAnswerStep,
        ],
        exports: [agent_service_1.AgentService],
    })
], AgentModule);
//# sourceMappingURL=agent.module.js.map