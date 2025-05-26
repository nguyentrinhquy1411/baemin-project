import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryFoodDto } from './dto/create-category-food.dto';
import { UpdateCategoryFoodDto } from './dto/update-category-food.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class CategoryFoodService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {
    this.logger.setContext('CategoryFoodService');
  }

  async create(createCategoryFoodDto: CreateCategoryFoodDto) {
    try {
      const categoryFood = await this.prisma.category_food.create({
        data: createCategoryFoodDto,
      });
      this.logger.log(`Food category created with ID: ${categoryFood.id}`);
      return {
        data: categoryFood,
        message: 'Food category created successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error creating food category: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(page = 1, limit = 10, name?: string) {
    try {
      const skip = (page - 1) * limit;
      const where = name
        ? { name: { contains: name, mode: 'insensitive' as any } }
        : {};

      const [categories, total] = await Promise.all([
        this.prisma.category_food.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            _count: {
              select: { stall_food_category: true },
            },
          },
        }),
        this.prisma.category_food.count({ where }),
      ]);

      this.logger.log(`Found ${categories.length} food categories`);
      return {
        data: categories,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'Food categories retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding all food categories: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const categoryFood = await this.prisma.category_food.findUnique({
        where: { id },
        include: {
          stall_food_category: {
            take: 5,
            select: {
              id: true,
              food: {
                select: {
                  id: true,
                  name: true,
                  image_url: true,
                },
              },
            },
          },
          _count: {
            select: { stall_food_category: true },
          },
        },
      });

      if (!categoryFood) {
        this.logger.warn(`Food category with ID: ${id} not found`);
        throw new NotFoundException(`Food category with ID: ${id} not found`);
      }

      this.logger.log(`Found food category with ID: ${id}`);
      return {
        data: categoryFood,
        message: 'Food category retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding food category: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(id: string, updateCategoryFoodDto: UpdateCategoryFoodDto) {
    try {
      // Check if exists
      await this.findOne(id);

      const updatedCategoryFood = await this.prisma.category_food.update({
        where: { id },
        data: {
          ...updateCategoryFoodDto,
          updated_at: new Date(),
        },
      });

      this.logger.log(`Updated food category with ID: ${id}`);
      return {
        data: updatedCategoryFood,
        message: 'Food category updated successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error updating food category: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Check if exists
      await this.findOne(id);

      await this.prisma.category_food.delete({
        where: { id },
      });

      this.logger.log(`Deleted food category with ID: ${id}`);
      return {
        message: 'Food category deleted successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error deleting food category: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
