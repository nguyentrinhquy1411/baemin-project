import { PartialType } from '@nestjs/swagger';
import { CreateBadgesStallDto } from './create-badges-stall.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateBadgesStallDto extends PartialType(CreateBadgesStallDto) {
  @IsOptional()
  @IsUUID('all', { message: 'Stall ID must be a valid UUID' })
  stall_id?: string;
}
