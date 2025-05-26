import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBadgesStallDto {
  @ApiProperty({ description: 'The name of the badge', example: 'Top Rated' })
  @IsNotEmpty({ message: 'Badge name cannot be empty' })
  @IsString({ message: 'Badge name must be a string' })
  @MaxLength(100, { message: 'Badge name must not exceed 100 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the badge',
    example: 'This badge is awarded to top rated restaurants',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'URL to the badge image',
    example: 'https://example.com/images/top-rated-badge.png',
  })
  @IsOptional()
  @IsString({ message: 'Image URL must be a string' })
  image_url?: string;

  @ApiProperty({
    description: 'ID of the stall this badge belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Stall ID cannot be empty' })
  @IsUUID('all', { message: 'Stall ID must be a valid UUID' })
  stall_id: string;
}
