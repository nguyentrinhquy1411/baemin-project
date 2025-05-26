import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRatingDto } from './create-rating.dto';
import { IsOptional } from 'class-validator';

export class UpdateRatingDto extends PartialType(
  OmitType(CreateRatingDto, ['food_id', 'stall_id'] as const),
) {}
