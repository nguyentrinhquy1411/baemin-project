import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as path from 'path';
import { LoggerService } from './logger.service';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Đường dẫn thư mục logs
        const logDir = path.join(process.cwd(), 'logs');
        
        // Format log chung
        const logFormat = winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          winston.format.json(),
        );

        return {
          transports: [
            // Console transport - hiển thị log trong terminal
            new winston.transports.Console({
              level: 'debug',
              format: winston.format.combine(
                winston.format.timestamp(),
                nestWinstonModuleUtilities.format.nestLike(),
              ),
            }),
            
            // Info logs - lưu các log thông thường
            new winston.transports.File({
              level: 'info',
              dirname: path.join(logDir, 'info'),
              filename: 'info.log',
              format: logFormat,
              maxsize: 10 * 1024 * 1024, // 10MB
            }),
            
            // Error logs - lưu các log lỗi
            new winston.transports.File({
              level: 'error',
              dirname: path.join(logDir, 'error'),
              filename: 'error.log',
              format: logFormat,
              maxsize: 10 * 1024 * 1024, // 10MB
            }),
            
            // HTTP logs - lưu các request/response HTTP
            new winston.transports.File({
              level: 'http',
              dirname: path.join(logDir, 'http'),
              filename: 'http.log',
              format: logFormat,
              maxsize: 10 * 1024 * 1024, // 10MB
            }),
          ],
        };
      },
    }),
  ],
  providers: [LoggerService],
  exports: [WinstonModule, LoggerService],
})
export class LoggerModule {}
