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
  async findRandom(limit: number = 5, categoryId?: string) {
    try {
      // Build where clause based on parameters
      const whereClause: any = {
        is_available: true, // Only include available food items
      };

      // Add category filter if provided
      if (categoryId) {
        whereClause.stall_food_category = {
          some: {
            category_id: categoryId,
          },
        };
      }

      // Get total count for statistics
      const total = await this.prisma.food.count({
        where: whereClause,
      });

      // Fetch random food items
      // Note: This is a simple approach that works for small to medium datasets
      // For production with large datasets, consider more efficient random selection strategies
      const randomFoods = await this.prisma.food.findMany({
        where: whereClause,
        take: limit,
        orderBy: {
          // Use database-specific random ordering
          // For PostgreSQL:
          id: 'asc', // We'll sort randomly in JS for database portability
        },
        include: {
          stall: {
            select: {
              id: true,
              name: true,
              image_url: true,
              address: true,
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
      });

      // Shuffle the results for randomness
      const shuffledFoods = this.shuffleArray([...randomFoods]).slice(0, limit);

      // Get average ratings for each food item
      const foodsWithRatings = await Promise.all(
        shuffledFoods.map(async (food) => {
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

      this.logger.log(`Found ${foodsWithRatings.length} random food items`);
      return {
        data: foodsWithRatings,
        message: 'Random food items retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding random food items: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findTopRated(limit: number = 8, minRating: number = 3.5) {
    try {
      this.logger.log(
        `Finding top ${limit} rated foods with rating >= ${minRating}`,
      );

      // First get all foods with their ratings
      const foods = await this.prisma.food.findMany({
        where: {
          is_available: true,
        },
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
          ratings: true,
          _count: {
            select: {
              ratings: true,
            },
          },
        },
      });

      // Calculate average ratings for each food
      const foodsWithAvgRating = foods.map((food) => {
        const ratings = food.ratings || [];
        const totalScore = ratings.reduce(
          (sum, rating) => sum + rating.score,
          0,
        );
        const avgRating = ratings.length ? totalScore / ratings.length : 0;

        // Remove the ratings array from the result to avoid large response
        const { ratings: _, ...foodWithoutRatings } = food;

        return {
          ...foodWithoutRatings,
          avg_rating: avgRating,
        };
      });

      // Filter by minimum rating
      const filteredFoods = foodsWithAvgRating.filter(
        (food) => food.avg_rating >= minRating,
      );

      // Sort by rating (highest first) and take limit
      const topRatedFoods = filteredFoods
        .sort((a, b) => b.avg_rating - a.avg_rating)
        .slice(0, limit);

      this.logger.log(`Found ${topRatedFoods.length} top rated food items`);
      return {
        data: topRatedFoods,
        message: 'Top rated food items retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding top rated food items: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByCategory(limit: number = 8) {
    try {
      this.logger.log(
        `Finding foods with category information, limit ${limit} per category`,
      );

      // Get all available food categories
      const categories = await this.prisma.category_food.findMany({
        where: {
          stall_food_category: {
            some: {}, // Only get categories that have at least one food
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      // For each category, get the foods (limited)
      const foodsByCategory = await Promise.all(
        categories.map(async (category) => {
          const foods = await this.prisma.food.findMany({
            where: {
              is_available: true,
              stall_food_category: {
                some: {
                  category_id: category.id,
                },
              },
            },
            take: limit,
            include: {
              stall: {
                select: {
                  id: true,
                  name: true,
                  image_url: true,
                  address: true,
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
          });

          // Get average ratings for each food
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

          return {
            category: {
              id: category.id,
              name: category.name,
            },
            foods: foodsWithRatings,
          };
        }),
      );

      // Filter out any categories with no foods
      const nonEmptyCategories = foodsByCategory.filter(
        (item) => item.foods.length > 0,
      );

      this.logger.log(`Found foods in ${nonEmptyCategories.length} categories`);
      return {
        data: nonEmptyCategories,
        message: 'Foods by category retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding foods by category: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Helper method to shuffle array (Fisher-Yates shuffle algorithm)
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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

  // Get all food items for stalls owned by a specific user (store owner)
  async findByStoreOwner(
    ownerId: string,
    page = 1,
    limit = 10,
    categoryId?: string,
    isAvailable?: boolean,
  ) {
    try {
      // Check if user exists and has store role
      const user = await this.prisma.users.findUnique({
        where: { id: ownerId },
        select: { id: true, role: true },
      });

      if (!user) {
        this.logger.warn(`User with ID: ${ownerId} not found`);
        throw new NotFoundException(`User with ID: ${ownerId} not found`);
      }

      if (user.role !== 'store') {
        this.logger.warn(`User ${ownerId} is not a store owner`);
        throw new ForbiddenException('User is not a store owner');
      }

      const skip = (page - 1) * limit;

      // Build where clause for foods in stalls owned by this user
      let where: any = {
        stall: {
          owner_id: ownerId,
        },
      };

      // Add availability filter if provided
      if (isAvailable !== undefined) {
        where.is_available = isAvailable;
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
                image_url: true,
                is_active: true,
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
          const ratings = await this.prisma.rating.findMany({
            where: { food_id: food.id },
            select: { score: true },
          });

          const averageRating =
            ratings.length > 0
              ? ratings.reduce((sum, rating) => sum + rating.score, 0) /
                ratings.length
              : 0;

          return {
            ...food,
            averageRating: Number(averageRating.toFixed(1)),
            totalRatings: ratings.length,
          };
        }),
      );

      const totalPages = Math.ceil(total / limit);

      this.logger.log(
        `Retrieved ${foods.length} foods for store owner: ${ownerId}`,
      );

      return {
        data: foodsWithRatings,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        message: 'Foods retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error retrieving foods for store owner ${ownerId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateAllFoodImages() {
    const newImageUrl = '/food/ga1.jpg';

    try {
      this.logger.log('Starting bulk update of all food images');

      // Update all food items to use the new image URL
      const updateResult = await this.prisma.food.updateMany({
        data: {
          image_url: newImageUrl,
          updated_at: new Date(),
        },
      });

      this.logger.log(`Successfully updated ${updateResult.count} food images`);

      return {
        message: `Successfully updated ${updateResult.count} food images to ${newImageUrl}`,
        updatedCount: updateResult.count,
        newImageUrl: newImageUrl,
      };
    } catch (error) {
      this.logger.error(
        `Error updating all food images: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
