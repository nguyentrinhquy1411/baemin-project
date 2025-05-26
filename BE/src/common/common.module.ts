import { Module } from '@nestjs/common';
import { RolesGuard } from './guards';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [RolesGuard],
  exports: [RolesGuard],
})
export class CommonModule {}
