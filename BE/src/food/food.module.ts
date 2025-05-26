import { Module } from '@nestjs/common';
import { FoodController } from './food.controller';
import { FoodService } from './food.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StallModule } from '../stall/stall.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [PrismaModule, StallModule, LoggerModule],
  controllers: [FoodController],
  providers: [FoodService],
  exports: [FoodService],
})
export class FoodModule {}
