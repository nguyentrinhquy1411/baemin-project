import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class FoodService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {
    this.logger.setContext('FoodService');
  }

  async create(createFoodDto: CreateFoodDto, userId: string) {
    try {
      // Check if stall exists and user is the owner
      const stall = await this.prisma.stall.findUnique({
        where: { id: createFoodDto.stall_id },
        select: {
          id: true,
          owner_id: true,
        },
      });

      if (!stall) {
        this.logger.warn(`Stall with ID: ${createFoodDto.stall_id} not found`);
        throw new NotFoundException(
          `Stall with ID: ${createFoodDto.stall_id} not found`,
        );
      }

      // Check if user is the owner of the stall
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { role: true, id: true },
      });
      if (!user || (user.role !== 'super_user' && stall.owner_id !== userId)) {
        this.logger.warn(
          `User ${userId} not authorized to add food to stall ${stall.id}`,
        );
        throw new ForbiddenException(
          'You do not have permission to add food to this stall',
        );
      } // Process food categories if provided
      let foodCategoryData: any = undefined;

      if (createFoodDto.category_ids && createFoodDto.category_ids.length > 0) {
        // Check if all categories exist
        const categories = await this.prisma.category_food.findMany({
          where: {
            id: { in: createFoodDto.category_ids },
          },
          select: { id: true },
        });

        if (categories.length !== createFoodDto.category_ids.length) {
          this.logger.warn('Some food categories not found');
          throw new NotFoundException('One or more food categories not found');
        }

        // Prepare stall_food_category data
        foodCategoryData = {
          stall_food_category: {
            create: createFoodDto.category_ids.map((categoryId) => ({
              stall_id: createFoodDto.stall_id,
              category_id: categoryId,
            })),
          },
        };
      }

      // Extract category_ids from DTO as it's not part of the food model
      const { category_ids, ...foodData } = createFoodDto;

      // Create food item
      const food = await this.prisma.food.create({
        data: {
          ...foodData,
          ...(foodCategoryData || {}),
        },
        include: {
          stall: {
            select: {
              id: true,
              name: true,
            },
          },
          stall_food_category: {
            include: {
              category: true,
            },
          },
        },
      });

      this.logger.log(
        `Food created with ID: ${food.id} for stall: ${stall.id}`,
      );
      return {
        data: food,
        message: 'Food created successfully',
      };
    } catch (error) {
      this.logger.error(`Error creating food: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    name?: string,
    stallId?: string,
    minPrice?: number,
    maxPrice?: number,
    categoryId?: string,
    isAvailable?: boolean,
  ) {
    try {
      const skip = (page - 1) * limit;

      // Build base where clause
      let where: any = {};
      if (name) where.name = { contains: name, mode: 'insensitive' as any };
      if (stallId) where.stall_id = stallId;
      if (isAvailable !== undefined) where.is_available = isAvailable;

      // Price range filter
      if (minPrice !== undefined && maxPrice !== undefined) {
        where.price = { gte: minPrice, lte: maxPrice };
      } else if (minPrice !== undefined) {
        where.price = { gte: minPrice };
      } else if (maxPrice !== undefined) {
        where.price = { lte: maxPrice };
      }

      // Category filter
      if (categoryId) {
        where.stall_food_category = {
          some: { category_id: categoryId },
        };
      }

      const [foods, total] = await Promise.all([
        this.prisma.food.findMany({
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
            stall_food_category: {
              include: {
                category: true,
              },
            },
            _count: {
              select: {
                ratings: true,
              },
            },
          },
        }),
        this.prisma.food.count({ where }),
      ]);

      // Calculate average rating for each food
      const foodsWithRatings = await Promise.all(
        foods.map(async (food) => {
          const avgRating = await this.prisma.rating.aggregate({
            where: { food_id: food.id },
            _avg: {
              score: true,
            },
          });

          return {
            ...food,
            avg_rating: avgRating._avg.score || 0,
          };
        }),
      );

      this.logger.log(`Found ${foods.length} food items`);
      return {
        data: foodsWithRatings,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'Food items retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding all food items: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const food = await this.prisma.food.findUnique({
        where: { id },
        include: {
          stall: {
            select: {
              id: true,
              name: true,
              image_url: true,
              address: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          stall_food_category: {
            include: {
              category: true,
            },
          },
          ratings: {
            take: 5,
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
            orderBy: {
              created_at: 'desc',
            },
          },
          _count: {
            select: {
              ratings: true,
            },
          },
        },
      });

      if (!food) {
        this.logger.warn(`Food with ID: ${id} not found`);
        throw new NotFoundException(`Food with ID: ${id} not found`);
      }

      // Calculate average rating
      const avgRating = await this.prisma.rating.aggregate({
        where: { food_id: id },
        _avg: {
          score: true,
        },
      });

      const foodWithRating = {
        ...food,
        avg_rating: avgRating._avg.score || 0,
      };

      this.logger.log(`Found food with ID: ${id}`);
      return {
        data: foodWithRating,
        message: 'Food retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Error finding food: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByStallId(
    stallId: string,
    page = 1,
    limit = 10,
    categoryId?: string,
  ) {
    try {
      // Check if stall exists
      const stall = await this.prisma.stall.findUnique({
        where: { id: stallId },
        select: { id: true },
      });

      if (!stall) {
        this.logger.warn(`Stall with ID: ${stallId} not found`);
        throw new NotFoundException(`Stall with ID: ${stallId} not found`);
      }

      const skip = (page - 1) * limit;

      // Build where clause
      let where: any = { stall_id: stallId };

      // Category filter
      if (categoryId) {
        where.stall_food_category = {
          some: { category_id: categoryId },
        };
      }

      const [foods, total] = await Promise.all([
        this.prisma.food.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            stall_food_category: {
              include: {
                category: true,
              },
            },
            _count: {
              select: {
                ratings: true,
              },
            },
          },
        }),
        this.prisma.food.count({ where }),
      ]);

      // Calculate average rating for each food
      const foodsWithRatings = await Promise.all(
        foods.map(async (food) => {
          const avgRating = await this.prisma.rating.aggregate({
            where: { food_id: food.id },
            _avg: {
              score: true,
            },
          });

          return {
            ...food,
            avg_rating: avgRating._avg.score || 0,
          };
        }),
      );

      this.logger.log(`Found ${foods.length} food items for stall: ${stallId}`);
      return {
        data: foodsWithRatings,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'Stall food items retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding food by stall: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  async update(id: string, updateFoodDto: UpdateFoodDto, userId: string) {
    try {
      // Check if food exists
      const existingFood = await this.prisma.food.findUnique({
        where: { id },
        include: {
          stall: {
            select: {
              owner_id: true,
            },
          },
        },
      });

      if (!existingFood) {
        this.logger.warn(`Food with ID: ${id} not found`);
        throw new NotFoundException(`Food with ID: ${id} not found`);
      }

      // Check owner permission
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { role: true, id: true },
      });

      if (
        !user ||
        (user.role !== 'super_user' && existingFood.stall.owner_id !== userId)
      ) {
        this.logger.warn(`User ${userId} not authorized to update food ${id}`);
        throw new ForbiddenException(
          'You do not have permission to update this food item',
        );
      }

      // Process food categories if provided
      if (updateFoodDto.category_ids) {
        if (updateFoodDto.category_ids.length > 0) {
          // Check if all categories exist
          const categories = await this.prisma.category_food.findMany({
            where: {
              id: { in: updateFoodDto.category_ids },
            },
            select: { id: true },
          });

          if (categories.length !== updateFoodDto.category_ids.length) {
            this.logger.warn('Some food categories not found');
            throw new NotFoundException(
              'One or more food categories not found',
            );
          }

          // Delete existing categories
          await this.prisma.stall_food_category.deleteMany({
            where: { food_id: id },
          });

          // Create new categories
          await Promise.all(
            updateFoodDto.category_ids.map((categoryId) =>
              this.prisma.stall_food_category.create({
                data: {
                  stall_id: existingFood.stall_id,
                  food_id: id,
                  category_id: categoryId,
                },
              }),
            ),
          );
        }
      }

      // Extract category_ids from DTO as it's not part of the food model
      const { category_ids, ...foodData } = updateFoodDto;

      // Update the food item
      const updatedFood = await this.prisma.food.update({
        where: { id },
        data: {
          ...foodData,
          updated_at: new Date(),
        },
        include: {
          stall: {
            select: {
              id: true,
              name: true,
            },
          },
          stall_food_category: {
            include: {
              category: true,
            },
          },
        },
      });

      this.logger.log(`Updated food with ID: ${id}`);
      return {
        data: updatedFood,
        message: 'Food updated successfully',
      };
    } catch (error) {
      this.logger.error(`Error updating food: ${error.message}`, error.stack);
      throw error;
    }
  }
  async remove(id: string, userId: string) {
    try {
      // Check if food exists
      const existingFood = await this.prisma.food.findUnique({
        where: { id },
        include: {
          stall: {
            select: {
              owner_id: true,
            },
          },
        },
      });

      if (!existingFood) {
        this.logger.warn(`Food with ID: ${id} not found`);
        throw new NotFoundException(`Food with ID: ${id} not found`);
      }

      // Check owner permission
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { role: true, id: true },
      });

      if (
        !user ||
        (user.role !== 'super_user' && existingFood.stall.owner_id !== userId)
      ) {
        this.logger.warn(`User ${userId} not authorized to delete food ${id}`);
        throw new ForbiddenException(
          'You do not have permission to delete this food item',
        );
      }

      await this.prisma.food.delete({
        where: { id },
      });

      this.logger.log(`Deleted food with ID: ${id}`);
      return {
        message: 'Food deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting food: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Toggle availability status
  async toggleAvailability(id: string, userId: string) {
    try {
      // Check if food exists and get current status
      const existingFood = await this.prisma.food.findUnique({
        where: { id },
        include: {
          stall: {
            select: {
              owner_id: true,
            },
          },
        },
      });

      if (!existingFood) {
        this.logger.warn(`Food with ID: ${id} not found`);
        throw new NotFoundException(`Food with ID: ${id} not found`);
      }

      // Check owner permission
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { role: true, id: true },
      });

      if (
        !user ||
        (user.role !== 'super_user' && existingFood.stall.owner_id !== userId)
      ) {
        this.logger.warn(`User ${userId} not authorized to update food ${id}`);
        throw new ForbiddenException(
          'You do not have permission to update this food item',
        );
      }

      // Toggle is_available status
      const updatedFood = await this.prisma.food.update({
        where: { id },
        data: {
          is_available: !existingFood.is_available,
          updated_at: new Date(),
        },
      });

      this.logger.log(
        `Toggled food availability with ID: ${id} to: ${updatedFood.is_available}`,
      );
      return {
        data: updatedFood,
        message: `Food ${updatedFood.is_available ? 'available' : 'unavailable'} status updated successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Error toggling food availability: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
