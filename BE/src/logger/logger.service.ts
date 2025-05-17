import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  log(message: any, context?: string) {
    this.logger.info(this.formatMessage(message), { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(this.formatMessage(message), { trace, context });
  }

  warn(message: any, context?: string) {
    this.logger.warn(this.formatMessage(message), { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(this.formatMessage(message), { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(this.formatMessage(message), { context });
  }

  private formatMessage(message: any): string {
    if (typeof message === 'object') {
      return JSON.stringify(message);
    }
    return message;
  }
}
