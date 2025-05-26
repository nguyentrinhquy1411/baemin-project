import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: "User's first name",
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({
    description: "User's last name",
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({
    description: "User's phone number",
    example: '1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]+$/, { message: 'Phone number must contain only digits' })
  phone?: string;

  @ApiProperty({
    description: "User's address",
    example: '123 Street, City, Country',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;
}
