import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, path, ip, body } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          
          this.logger.log({
            message: `${method} ${path} ${ip} - ${responseTime}ms`,
            method,
            path,
            ip,
            userAgent,
            responseTime,
            body: this.sanitizeBody(body),
            response: this.sanitizeResponse(data),
          });
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          
          this.logger.error({
            message: `${method} ${path} ${ip} - ${responseTime}ms - Error: ${error.message}`,
            method,
            path,
            ip,
            userAgent,
            responseTime,
            body: this.sanitizeBody(body),
            error: {
              message: error.message,
              name: error.name,
              stack: error.stack,
            },
          });
        }
      })
    );
  }

  private sanitizeBody(body: any) {
    if (!body) return {};
    
    // Tạo bản sao để không ảnh hưởng đến dữ liệu gốc
    const sanitized = { ...body };
    
    // Loại bỏ các trường nhạy cảm
    if (sanitized.password) sanitized.password = '[REDACTED]';
    if (sanitized.refreshToken) sanitized.refreshToken = '[REDACTED]';
    if (sanitized.access_token) sanitized.access_token = '[REDACTED]';
    if (sanitized.refresh_token) sanitized.refresh_token = '[REDACTED]';
    
    return sanitized;
  }
  
  private sanitizeResponse(data: any) {
    if (!data) return {};
    if (typeof data !== 'object') return data;
    
    // Tạo bản sao
    const sanitized = { ...data };
    
    // Loại bỏ các trường nhạy cảm
    if (sanitized.access_token) sanitized.access_token = '[REDACTED]';
    if (sanitized.refresh_token) sanitized.refresh_token = '[REDACTED]';
    
    return sanitized;
  }
}
