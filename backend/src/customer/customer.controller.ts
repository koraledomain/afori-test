import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { Customer } from '@/common/database/entities';
import { Order } from '@/common/database/entities';
import { Address } from '@/common/database/entities';

@ApiTags('Customers')
@ApiSecurity('apiKey')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'The customer has been successfully created.',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({
    status: 200,
    description: 'Return all customers.',
    type: [CustomerResponseDto],
  })
  findAll(): Promise<Customer[]> {
    return this.customerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by id' })
  @ApiParam({
    name: 'id',
    description: 'Customer ID - must be a positive number',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Return the customer.',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format or value. ID must be a positive number.',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Customer> {
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiParam({
    name: 'id',
    description: 'Customer ID - must be a positive number',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'The customer has been successfully updated.',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format or value. ID must be a positive number.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiParam({
    name: 'id',
    description: 'Customer ID - must be a positive number',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'The customer has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format or value. ID must be a positive number.',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.customerService.remove(id);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'Get all orders for a customer' })
  @ApiParam({
    name: 'id',
    description: 'Customer ID - must be a positive number',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Return all orders for the customer.',
    type: [Order],
  })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format or value. ID must be a positive number.',
  })
  getCustomerOrders(@Param('id', ParseIntPipe) id: number): Promise<Order[]> {
    return this.customerService.getCustomerOrders(id);
  }

  @Get(':id/addresses')
  @ApiOperation({ summary: 'Get all addresses for a customer' })
  @ApiParam({
    name: 'id',
    description: 'Customer ID - must be a positive number',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Return all addresses for the customer.',
    type: [Address],
  })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format or value. ID must be a positive number.',
  })
  getCustomerAddresses(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Address[]> {
    return this.customerService.getCustomerAddresses(id);
  }
}
