import { PartialType } from '@nestjs/swagger';
import { CreateCategoryFoodDto } from './create-category-food.dto';

export class UpdateCategoryFoodDto extends PartialType(CreateCategoryFoodDto) {}
