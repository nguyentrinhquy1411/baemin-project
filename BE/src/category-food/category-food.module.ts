import { Module } from '@nestjs/common';
import { CategoryFoodController } from './category-food.controller';
import { CategoryFoodService } from './category-food.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [CategoryFoodController],
  providers: [CategoryFoodService],
  exports: [CategoryFoodService],
})
export class CategoryFoodModule {}
