import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStallFoodCategoryDto } from './dto/create-stall-food-category.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class StallFoodCategoryService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {
    this.logger.setContext('StallFoodCategoryService');
  }

  async create(
    createStallFoodCategoryDto: CreateStallFoodCategoryDto,
    userId: string,
  ) {
    try {
      // Check if stall exists and user is the owner
      const stall = await this.prisma.stall.findUnique({
        where: { id: createStallFoodCategoryDto.stall_id },
        select: {
          id: true,
          owner_id: true,
        },
      });

      if (!stall) {
        this.logger.warn(
          `Stall with ID: ${createStallFoodCategoryDto.stall_id} not found`,
        );
        throw new NotFoundException(
          `Stall with ID: ${createStallFoodCategoryDto.stall_id} not found`,
        );
      } // Check if user is authorized (owner or admin)
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { role: true, id: true },
      });

      if (!user || (user.role !== 'super_user' && stall.owner_id !== userId)) {
        this.logger.warn(
          `User ${userId} not authorized to add food categories to stall ${stall.id}`,
        );
        throw new ForbiddenException(
          'You do not have permission to add food categories to this stall',
        );
      }

      // Check if food exists and belongs to this stall
      const food = await this.prisma.food.findUnique({
        where: { id: createStallFoodCategoryDto.food_id },
        select: {
          id: true,
          stall_id: true,
        },
      });

      if (!food) {
        this.logger.warn(
          `Food with ID: ${createStallFoodCategoryDto.food_id} not found`,
        );
        throw new NotFoundException(
          `Food with ID: ${createStallFoodCategoryDto.food_id} not found`,
        );
      }

      if (food.stall_id !== createStallFoodCategoryDto.stall_id) {
        this.logger.warn(
          `Food ${food.id} does not belong to stall ${stall.id}`,
        );
        throw new ConflictException(`Food does not belong to specified stall`);
      }

      // Check if category exists
      const category = await this.prisma.category_food.findUnique({
        where: { id: createStallFoodCategoryDto.category_id },
      });

      if (!category) {
        this.logger.warn(
          `Category with ID: ${createStallFoodCategoryDto.category_id} not found`,
        );
        throw new NotFoundException(
          `Category with ID: ${createStallFoodCategoryDto.category_id} not found`,
        );
      }

      // Check if this combination already exists
      const existingRelation = await this.prisma.stall_food_category.findFirst({
        where: {
          stall_id: createStallFoodCategoryDto.stall_id,
          food_id: createStallFoodCategoryDto.food_id,
          category_id: createStallFoodCategoryDto.category_id,
        },
      });

      if (existingRelation) {
        this.logger.warn(`Relation already exists`);
        throw new ConflictException(
          'This food is already in this category for this stall',
        );
      }

      // Create the relation
      const stallFoodCategory = await this.prisma.stall_food_category.create({
        data: createStallFoodCategoryDto,
        include: {
          stall: {
            select: {
              id: true,
              name: true,
            },
          },
          food: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(
        `StallFoodCategory created with ID: ${stallFoodCategory.id}`,
      );
      return {
        data: stallFoodCategory,
        message: 'Food category assignment created successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error creating stall food category: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    stallId?: string,
    foodId?: string,
    categoryId?: string,
  ) {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      let where: any = {};
      if (stallId) where.stall_id = stallId;
      if (foodId) where.food_id = foodId;
      if (categoryId) where.category_id = categoryId;

      const [stallFoodCategories, total] = await Promise.all([
        this.prisma.stall_food_category.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            stall: {
              select: {
                id: true,
                name: true,
              },
            },
            food: {
              select: {
                id: true,
                name: true,
                image_url: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        this.prisma.stall_food_category.count({ where }),
      ]);

      this.logger.log(
        `Found ${stallFoodCategories.length} stall food categories`,
      );
      return {
        data: stallFoodCategories,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'Stall food categories retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding all stall food categories: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const stallFoodCategory =
        await this.prisma.stall_food_category.findUnique({
          where: { id },
          include: {
            stall: {
              select: {
                id: true,
                name: true,
              },
            },
            food: {
              select: {
                id: true,
                name: true,
                image_url: true,
                description: true,
                price: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        });

      if (!stallFoodCategory) {
        this.logger.warn(`StallFoodCategory with ID: ${id} not found`);
        throw new NotFoundException(
          `StallFoodCategory with ID: ${id} not found`,
        );
      }

      this.logger.log(`Found stallFoodCategory with ID: ${id}`);
      return {
        data: stallFoodCategory,
        message: 'Stall food category retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding stall food category: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    try {
      // Check if relation exists
      const existingRelation = await this.prisma.stall_food_category.findUnique(
        {
          where: { id },
          include: {
            stall: {
              select: {
                owner_id: true,
              },
            },
          },
        },
      );

      if (!existingRelation) {
        this.logger.warn(`StallFoodCategory with ID: ${id} not found`);
        throw new NotFoundException(
          `StallFoodCategory with ID: ${id} not found`,
        );
      } // Check owner permission
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { role: true, id: true },
      });

      if (
        !user ||
        (user.role !== 'super_user' &&
          existingRelation.stall.owner_id !== userId)
      ) {
        this.logger.warn(
          `User ${userId} not authorized to delete stall food category ${id}`,
        );
        throw new ForbiddenException(
          'You do not have permission to delete this category assignment',
        );
      }

      await this.prisma.stall_food_category.delete({
        where: { id },
      });

      this.logger.log(`Deleted stall food category with ID: ${id}`);
      return {
        message: 'Stall food category deleted successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error deleting stall food category: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
