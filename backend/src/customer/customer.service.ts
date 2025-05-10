import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer, Order, Address } from '@/common/database/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { email: createCustomerDto.email },
    });
    if (customer) {
      throw new BadRequestException('Customer already exists');
    }
    const newCustomer = this.customerRepository.create(createCustomerDto);
    return await this.customerRepository.save(newCustomer);
  }

  async findAll(): Promise<Customer[]> {
    return await this.customerRepository.find();
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.findOne(id);

    Object.assign(customer, updateCustomerDto);

    return this.customerRepository.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['orders', 'addresses'],
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    if (customer.orders.length > 0) {
      throw new BadRequestException(
        'Customer has orders, please delete orders first',
      );
    }

    if (customer.addresses.length > 0) {
      throw new BadRequestException(
        'Customer has addresses, please delete addresses first',
      );
    }

    await this.customerRepository.delete({ id });
  }

  async getCustomerOrders(id: number): Promise<Order[]> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['orders'],
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer.orders;
  }

  async getCustomerAddresses(id: number): Promise<Address[]> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['addresses'],
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer.addresses;
  }
}
