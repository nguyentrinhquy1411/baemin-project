import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HttpLoggerInterceptor } from './logger/http-logger.interceptor';
import * as fs from 'fs';
import * as path from 'path';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Đảm bảo thư mục logs tồn tại
  const logDirs = ['logs', 'logs/info', 'logs/error', 'logs/http'];
  logDirs.forEach((dir) => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  const app = await NestFactory.create(AppModule);

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Baemin API')
    .setDescription('API documentation for Baemin food delivery app')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'JWT',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('stall', 'Restaurants/stalls endpoints')
    .addTag('food', 'Food items endpoints')
    .addTag('category-stall', 'Store categories endpoints')
    .addTag('category-food', 'Food categories endpoints')
    .addTag('rating', 'Ratings and reviews endpoints')
    .addTag('badges-stall', 'Stall badges endpoints')
    .addTag('stall-food-category', 'Food-category relationship endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Sử dụng Winston logger như logger global cho NestJS
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Áp dụng HTTP logger interceptor
  app.useGlobalInterceptors(new HttpLoggerInterceptor());

  // CORS
  app.enableCors();

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ✨ Chỉ nhận các field có trong DTO
      forbidNonWhitelisted: true, // ❌ Ném lỗi nếu có field lạ
      transform: true, // ✅ Tự động convert type (ví dụ: "5" => number)
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 8080);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(
    `Swagger documentation available at: ${await app.getUrl()}/api/docs`,
  );
}
bootstrap();
