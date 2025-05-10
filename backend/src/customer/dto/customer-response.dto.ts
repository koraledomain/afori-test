import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the customer',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the customer',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'The email of the customer',
    example: 'john.doe@example.com',
    format: 'email',
  })
  email: string;
}
