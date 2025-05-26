import { PartialType } from '@nestjs/swagger';
import { CreateCategoryStallDto } from './create-category-stall.dto';

export class UpdateCategoryStallDto extends PartialType(
  CreateCategoryStallDto,
) {}
