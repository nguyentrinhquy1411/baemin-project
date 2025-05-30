import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './logger/logger.module';
import { CategoryStallModule } from './category-stall/category-stall.module';
import { CategoryFoodModule } from './category-food/category-food.module';
import { StallModule } from './stall/stall.module';
import { FoodModule } from './food/food.module';
import { RatingModule } from './rating/rating.module';
import { BadgesStallModule } from './badges-stall/badges-stall.module';
import { StallFoodCategoryModule } from './stall-food-category/stall-food-category.module';
import { UploadModule } from './upload/upload.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    AuthModule,
    UsersModule,
    PrismaModule,
    CategoryStallModule,
    CategoryFoodModule,
    StallModule,
    FoodModule,
    RatingModule,
    BadgesStallModule,
    StallFoodCategoryModule,
    UploadModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
