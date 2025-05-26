import { PartialType } from '@nestjs/swagger';
import { CreateStallDto } from './create-stall.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStallDto extends PartialType(CreateStallDto) {
  @ApiPropertyOptional({
    description: 'Whether the stall is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Active status must be a boolean' })
  is_active?: boolean;
}
