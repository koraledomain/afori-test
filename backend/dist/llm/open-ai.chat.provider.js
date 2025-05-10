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
var OpenAIChatProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIChatProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = require("@langchain/openai");
const output_parsers_1 = require("@langchain/core/output_parsers");
let OpenAIChatProvider = OpenAIChatProvider_1 = class OpenAIChatProvider {
    configService;
    logger = new common_1.Logger(OpenAIChatProvider_1.name);
    modelConfig;
    model;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('LLM_API_KEY');
        const baseURL = this.configService.get('LLM_BASE_URL');
        const modelName = this.configService.get('LLM_MODEL');
        this.modelConfig = {
            modelName,
            temperature: 0,
            apiKey,
            configuration: {
                baseURL,
                timeout: 30000,
            },
            maxRetries: 3,
        };
        this.model = new openai_1.ChatOpenAI(this.modelConfig);
        this.logger.log('OpenAIChatProvider initialized');
        this.logger.log(`Using API URL: ${baseURL}`);
        this.logger.log(`Using model: ${modelName}`);
    }
    async streamText(prompt, inputs, onChunk) {
        try {
            let fullResponse = '';
            const streamingModel = new openai_1.ChatOpenAI({
                ...this.modelConfig,
                streaming: true,
                callbacks: [
                    {
                        handleLLMNewToken(token) {
                            fullResponse += token;
                            onChunk(token);
                        },
                    },
                ],
            });
            await prompt
                .pipe(streamingModel)
                .pipe(new output_parsers_1.StringOutputParser())
                .invoke(inputs);
            return fullResponse;
        }
        catch {
            return '';
        }
    }
    async generateText(prompt, inputs) {
        try {
            const result = await prompt
                .pipe(this.model)
                .pipe(new output_parsers_1.StringOutputParser())
                .invoke(inputs);
            return result;
        }
        catch {
            return '';
        }
    }
};
exports.OpenAIChatProvider = OpenAIChatProvider;
exports.OpenAIChatProvider = OpenAIChatProvider = OpenAIChatProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OpenAIChatProvider);
//# sourceMappingURL=open-ai.chat.provider.js.map