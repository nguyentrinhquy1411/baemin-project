import { Module } from '@nestjs/common';
import { StallFoodCategoryController } from './stall-food-category.controller';
import { StallFoodCategoryService } from './stall-food-category.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [StallFoodCategoryController],
  providers: [StallFoodCategoryService],
  exports: [StallFoodCategoryService],
})
export class StallFoodCategoryModule {}
