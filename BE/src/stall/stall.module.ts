import { Module } from '@nestjs/common';
import { StallController } from './stall.controller';
import { StallService } from './stall.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CategoryStallModule } from '../category-stall/category-stall.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [PrismaModule, CategoryStallModule, LoggerModule],
  controllers: [StallController],
  providers: [StallService],
  exports: [StallService],
})
export class StallModule {}
