import { Module } from '@nestjs/common';
import { BadgesStallController } from './badges-stall.controller';
import { BadgesStallService } from './badges-stall.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StallModule } from '../stall/stall.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [PrismaModule, StallModule, LoggerModule],
  controllers: [BadgesStallController],
  providers: [BadgesStallService],
  exports: [BadgesStallService],
})
export class BadgesStallModule {}
