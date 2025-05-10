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
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const entities_1 = require("../common/database/entities");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let CustomerService = class CustomerService {
    customerRepository;
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }
    async create(createCustomerDto) {
        const customer = await this.customerRepository.findOne({
            where: { email: createCustomerDto.email },
        });
        if (customer) {
            throw new common_1.BadRequestException('Customer already exists');
        }
        const newCustomer = this.customerRepository.create(createCustomerDto);
        return await this.customerRepository.save(newCustomer);
    }
    async findAll() {
        return await this.customerRepository.find();
    }
    async findOne(id) {
        const customer = await this.customerRepository.findOne({ where: { id } });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        return customer;
    }
    async update(id, updateCustomerDto) {
        const customer = await this.findOne(id);
        Object.assign(customer, updateCustomerDto);
        return this.customerRepository.save(customer);
    }
    async remove(id) {
        const customer = await this.customerRepository.findOne({
            where: { id },
            relations: ['orders', 'addresses'],
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        if (customer.orders.length > 0) {
            throw new common_1.BadRequestException('Customer has orders, please delete orders first');
        }
        if (customer.addresses.length > 0) {
            throw new common_1.BadRequestException('Customer has addresses, please delete addresses first');
        }
        await this.customerRepository.delete({ id });
    }
    async getCustomerOrders(id) {
        const customer = await this.customerRepository.findOne({
            where: { id },
            relations: ['orders'],
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        return customer.orders;
    }
    async getCustomerAddresses(id) {
        const customer = await this.customerRepository.findOne({
            where: { id },
            relations: ['addresses'],
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        return customer.addresses;
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomerService);
//# sourceMappingURL=customer.service.js.map