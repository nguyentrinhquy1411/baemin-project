import { IsNotEmpty, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum StallImageType {
  IMAGE = 'image',
  BANNER = 'banner',
}

export class UploadStallDto {
  @ApiProperty({
    description: 'ID of the stall to update image',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Stall ID cannot be empty' })
  @IsUUID('all', { message: 'Stall ID must be a valid UUID' })
  stall_id: string;

  @ApiPropertyOptional({
    description: 'Type of image being uploaded',
    enum: StallImageType,
    example: StallImageType.IMAGE,
    default: StallImageType.IMAGE,
  })
  @IsOptional()
  @IsEnum(StallImageType, {
    message: 'Image type must be either "image" or "banner"',
  })
  image_type?: StallImageType = StallImageType.IMAGE;
}
