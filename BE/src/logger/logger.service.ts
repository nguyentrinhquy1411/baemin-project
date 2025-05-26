import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  private context: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  setContext(context: string) {
    this.context = context;
  }
  log(message: any, context?: string) {
    this.logger.info(this.formatMessage(message), {
      context: context || this.context,
    });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(this.formatMessage(message), {
      trace,
      context: context || this.context,
    });
  }

  warn(message: any, context?: string) {
    this.logger.warn(this.formatMessage(message), {
      context: context || this.context,
    });
  }

  debug(message: any, context?: string) {
    this.logger.debug(this.formatMessage(message), {
      context: context || this.context,
    });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(this.formatMessage(message), {
      context: context || this.context,
    });
  }

  private formatMessage(message: any): string {
    if (typeof message === 'object') {
      return JSON.stringify(message);
    }
    return message;
  }
}
