import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HttpLoggerInterceptor } from './logger/http-logger.interceptor';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  // Đảm bảo thư mục logs tồn tại
  const logDirs = ['logs', 'logs/info', 'logs/error', 'logs/http'];
  logDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  const app = await NestFactory.create(AppModule);
  
  // Sử dụng Winston logger như logger global cho NestJS
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  
  // Áp dụng HTTP logger interceptor
  app.useGlobalInterceptors(new HttpLoggerInterceptor());
  
  // CORS
  app.enableCors();
  
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
