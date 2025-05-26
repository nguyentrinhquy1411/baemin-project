import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsUUID,
  IsNumber,
  IsPositive,
  IsArray,
  IsBoolean,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateFoodDto {
  @ApiProperty({
    description: 'The name of the food item',
    example: 'Spicy Chicken Burger',
  })
  @IsNotEmpty({ message: 'Food name cannot be empty' })
  @IsString({ message: 'Food name must be a string' })
  @MaxLength(150, { message: 'Food name must not exceed 150 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the food item',
    example: 'Juicy chicken patty with spicy sauce and fresh vegetables',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Price of the food item',
    example: 10.99,
  })
  @IsNotEmpty({ message: 'Price cannot be empty' })
  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be positive' })
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({
    description: 'URL to the food item image',
    example: 'https://example.com/images/spicy-chicken-burger.jpg',
  })
  @IsOptional()
  @IsString({ message: 'Image URL must be a string' })
  image_url?: string;

  @ApiProperty({
    description: 'ID of the stall this food belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Stall ID cannot be empty' })
  @IsUUID('all', { message: 'Stall ID must be a valid UUID' })
  stall_id: string;

  @ApiPropertyOptional({
    description: 'Whether the food item is available',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Availability status must be a boolean' })
  is_available?: boolean;

  @ApiPropertyOptional({
    description: 'IDs of the food categories this item belongs to',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Category IDs must be an array' })
  @ArrayMinSize(0, { message: 'Category IDs must have at least 0 elements' })
  @IsUUID('all', {
    each: true,
    message: 'Each category ID must be a valid UUID',
  })
  category_ids?: string[];
}
