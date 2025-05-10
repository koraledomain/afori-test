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
var RunQueryStep_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunQueryStep = void 0;
const common_1 = require("@nestjs/common");
let RunQueryStep = RunQueryStep_1 = class RunQueryStep {
    logger = new common_1.Logger(RunQueryStep_1.name);
    constructor() { }
    async execute(agentState) {
        try {
            const result = await agentState.sqlDb.run(agentState.sqlQuery);
            agentState.queryResult =
                typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        }
        catch (error) {
            this.logger.error(`Error executing query: ${error.message}`);
            throw new Error(`Failed to execute SQL query: ${error.message}`);
        }
    }
};
exports.RunQueryStep = RunQueryStep;
exports.RunQueryStep = RunQueryStep = RunQueryStep_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RunQueryStep);
//# sourceMappingURL=run-query.step.js.map