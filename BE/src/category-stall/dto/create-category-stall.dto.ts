import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryStallDto {
  @ApiProperty({
    description: 'The name of the store category',
    example: 'Fast Food',
  })
  @IsNotEmpty({ message: 'Category name cannot be empty' })
  @IsString({ message: 'Category name must be a string' })
  @MaxLength(100, { message: 'Category name must not exceed 100 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the store category',
    example: 'Restaurants offering fast food options',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'URL to the category image',
    example: 'https://example.com/images/fast-food.jpg',
  })
  @IsOptional()
  @IsString({ message: 'Image URL must be a string' })
  image_url?: string;
}
