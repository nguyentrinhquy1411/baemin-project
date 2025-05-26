import { Module } from '@nestjs/common';
import { CategoryStallController } from './category-stall.controller';
import { CategoryStallService } from './category-stall.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../logger/logger.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, LoggerModule, CommonModule],
  controllers: [CategoryStallController],
  providers: [CategoryStallService],
  exports: [CategoryStallService],
})
export class CategoryStallModule {}
