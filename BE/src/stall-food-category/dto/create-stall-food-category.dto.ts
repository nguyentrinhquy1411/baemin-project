import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStallFoodCategoryDto {
  @ApiProperty({
    description: 'ID of the stall',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Stall ID cannot be empty' })
  @IsUUID('all', { message: 'Stall ID must be a valid UUID' })
  stall_id: string;

  @ApiProperty({
    description: 'ID of the food item',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsNotEmpty({ message: 'Food ID cannot be empty' })
  @IsUUID('all', { message: 'Food ID must be a valid UUID' })
  food_id: string;

  @ApiProperty({
    description: 'ID of the food category',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsNotEmpty({ message: 'Category ID cannot be empty' })
  @IsUUID('all', { message: 'Category ID must be a valid UUID' })
  category_id: string;
}
