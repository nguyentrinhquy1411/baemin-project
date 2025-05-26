import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStallDto {
  @ApiProperty({
    description: 'The name of the stall (store/restaurant)',
    example: 'Delicious Burgers',
  })
  @IsNotEmpty({ message: 'Stall name cannot be empty' })
  @IsString({ message: 'Stall name must be a string' })
  @MaxLength(150, { message: 'Stall name must not exceed 150 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the stall',
    example: 'We serve the best burgers in town with fresh ingredients',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Address of the stall',
    example: '123 Food Street, Foodville, 12345',
  })
  @IsNotEmpty({ message: 'Address cannot be empty' })
  @IsString({ message: 'Address must be a string' })
  address: string;

  @ApiProperty({
    description: 'Phone number of the stall',
    example: '+84901234567',
  })
  @IsNotEmpty({ message: 'Phone number cannot be empty' })
  @IsString({ message: 'Phone number must be a string' })
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  @Matches(/^\+?[0-9\s-]+$/, { message: 'Invalid phone number format' })
  phone: string;

  @ApiPropertyOptional({
    description: 'Opening hours of the stall',
    example: 'Mon-Fri: 9AM-10PM, Sat-Sun: 10AM-11PM',
  })
  @IsOptional()
  @IsString({ message: 'Opening hours must be a string' })
  @MaxLength(50, { message: 'Opening hours must not exceed 50 characters' })
  open_time?: string;

  @ApiPropertyOptional({
    description: 'URL to the stall image',
    example: 'https://example.com/images/stall.jpg',
  })
  @IsOptional()
  @IsString({ message: 'Image URL must be a string' })
  image_url?: string;

  @ApiPropertyOptional({
    description: 'URL to the stall banner',
    example: 'https://example.com/images/banner.jpg',
  })
  @IsOptional()
  @IsString({ message: 'Banner URL must be a string' })
  banner_url?: string;

  @ApiProperty({
    description: 'ID of the category this stall belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Category ID cannot be empty' })
  @IsUUID('all', { message: 'Category ID must be a valid UUID' })
  category_id: string;
}
