import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateFoodDto } from './create-food.dto';
import { IsOptional } from 'class-validator';

export class UpdateFoodDto extends PartialType(
  OmitType(CreateFoodDto, ['stall_id'] as const),
) {}
