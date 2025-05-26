import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({
    description: 'Rating score (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty({ message: 'Score cannot be empty' })
  @IsInt({ message: 'Score must be an integer' })
  @Min(1, { message: 'Score must be at least 1' })
  @Max(5, { message: 'Score must be at most 5' })
  score: number;

  @ApiPropertyOptional({
    description: 'Comment about the food',
    example: 'The food was delicious and well presented.',
  })
  @IsOptional()
  @IsString({ message: 'Comment must be a string' })
  @Length(0, 1000, { message: 'Comment must not exceed 1000 characters' })
  comment?: string;

  @ApiProperty({
    description: 'ID of the food being rated',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Food ID cannot be empty' })
  @IsUUID('all', { message: 'Food ID must be a valid UUID' })
  food_id: string;

  @ApiProperty({
    description: 'ID of the stall where the food was ordered from',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsNotEmpty({ message: 'Stall ID cannot be empty' })
  @IsUUID('all', { message: 'Stall ID must be a valid UUID' })
  stall_id: string;
}
