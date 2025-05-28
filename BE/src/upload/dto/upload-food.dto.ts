import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadFoodDto {
  @ApiProperty({
    description: 'ID of the food item to update image',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Food ID cannot be empty' })
  @IsUUID('all', { message: 'Food ID must be a valid UUID' })
  food_id: string;
}
