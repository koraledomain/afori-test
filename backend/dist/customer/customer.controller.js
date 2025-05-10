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
exports.CustomerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const customer_service_1 = require("./customer.service");
const create_customer_dto_1 = require("./dto/create-customer.dto");
const update_customer_dto_1 = require("./dto/update-customer.dto");
const customer_response_dto_1 = require("./dto/customer-response.dto");
const entities_1 = require("../common/database/entities");
const entities_2 = require("../common/database/entities");
let CustomerController = class CustomerController {
    customerService;
    constructor(customerService) {
        this.customerService = customerService;
    }
    create(createCustomerDto) {
        return this.customerService.create(createCustomerDto);
    }
    findAll() {
        return this.customerService.findAll();
    }
    findOne(id) {
        return this.customerService.findOne(id);
    }
    update(id, updateCustomerDto) {
        return this.customerService.update(id, updateCustomerDto);
    }
    remove(id) {
        return this.customerService.remove(id);
    }
    getCustomerOrders(id) {
        return this.customerService.getCustomerOrders(id);
    }
    getCustomerAddresses(id) {
        return this.customerService.getCustomerAddresses(id);
    }
};
exports.CustomerController = CustomerController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new customer' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'The customer has been successfully created.',
        type: customer_response_dto_1.CustomerResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_dto_1.CreateCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all customers' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return all customers.',
        type: [customer_response_dto_1.CustomerResponseDto],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a customer by id' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Customer ID - must be a positive number',
        type: 'number',
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return the customer.',
        type: customer_response_dto_1.CustomerResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Customer not found.' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid ID format or value. ID must be a positive number.',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a customer' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Customer ID - must be a positive number',
        type: 'number',
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The customer has been successfully updated.',
        type: customer_response_dto_1.CustomerResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Customer not found.' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid ID format or value. ID must be a positive number.',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_customer_dto_1.UpdateCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a customer' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Customer ID - must be a positive number',
        type: 'number',
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The customer has been successfully deleted.',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Customer not found.' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid ID format or value. ID must be a positive number.',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders for a customer' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Customer ID - must be a positive number',
        type: 'number',
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return all orders for the customer.',
        type: [entities_1.Order],
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Customer not found.' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid ID format or value. ID must be a positive number.',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomerOrders", null);
__decorate([
    (0, common_1.Get)(':id/addresses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all addresses for a customer' }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Customer ID - must be a positive number',
        type: 'number',
        example: 1,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return all addresses for the customer.',
        type: [entities_2.Address],
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Customer not found.' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid ID format or value. ID must be a positive number.',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomerAddresses", null);
exports.CustomerController = CustomerController = __decorate([
    (0, swagger_1.ApiTags)('Customers'),
    (0, swagger_1.ApiSecurity)('apiKey'),
    (0, common_1.Controller)('customers'),
    __metadata("design:paramtypes", [customer_service_1.CustomerService])
], CustomerController);
//# sourceMappingURL=customer.controller.js.map