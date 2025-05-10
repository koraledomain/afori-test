import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateCustomerDto {
  @ApiProperty({
    description: 'The name of the customer',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'The email of the customer',
    example: 'john.doe@example.com',
    required: false,
    format: 'email',
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}
