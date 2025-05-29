import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStallDto } from './dto/create-stall.dto';
import { UpdateStallDto } from './dto/update-stall.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class StallService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {
    this.logger.setContext('StallService');
  }

  async create(createStallDto: CreateStallDto, userId: string) {
    try {
      // Check if category exists
      const categoryExists = await this.prisma.category_stall.findUnique({
        where: { id: createStallDto.category_id },
      });

      if (!categoryExists) {
        this.logger.warn(
          `Category with ID: ${createStallDto.category_id} not found`,
        );
        throw new NotFoundException(
          `Category with ID: ${createStallDto.category_id} not found`,
        );
      }

      // Create the stall
      const stall = await this.prisma.stall.create({
        data: {
          ...createStallDto,
          owner_id: userId,
        },
        include: {
          category: true,
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(`Stall created with ID: ${stall.id} by user: ${userId}`);
      return {
        data: stall,
        message: 'Stall created successfully',
      };
    } catch (error) {
      this.logger.error(`Error creating stall: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    name?: string,
    categoryId?: string,
    isActive?: boolean,
  ) {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      if (name) where.name = { contains: name, mode: 'insensitive' as any };
      if (categoryId) where.category_id = categoryId;
      if (isActive !== undefined) where.is_active = isActive;

      const [stalls, total] = await Promise.all([
        this.prisma.stall.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            owner: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            _count: {
              select: {
                foods: true,
                ratings: true,
              },
            },
          },
        }),
        this.prisma.stall.count({ where }),
      ]);

      this.logger.log(`Found ${stalls.length} stalls`);
      return {
        data: stalls,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'Stalls retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding all stalls: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  async findRandom(limit: number = 5, categoryId?: string) {
    try {
      // Build where clause based on parameters
      const whereClause: any = {
        is_active: true, // Only include active stalls
      };

      // Add category filter if provided
      if (categoryId) {
        whereClause.category_id = categoryId;
      }

      // Get total count for statistics
      const total = await this.prisma.stall.count({
        where: whereClause,
      });

      // Fetch random stalls
      const randomStalls = await this.prisma.stall.findMany({
        where: whereClause,
        take: Math.min(total, limit * 2), // Get more than needed to shuffle
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              foods: true,
              ratings: true,
              badges: true,
            },
          },
        },
      });

      // Shuffle the results for randomness
      const shuffledStalls = this.shuffleArray([...randomStalls]).slice(
        0,
        limit,
      );

      // Get average ratings for each stall
      const stallsWithRatings = await Promise.all(
        shuffledStalls.map(async (stall) => {
          const avgRating = await this.prisma.rating.aggregate({
            where: { stall_id: stall.id },
            _avg: {
              score: true,
            },
          });

          return {
            ...stall,
            avg_rating: avgRating._avg.score || 0,
          };
        }),
      );

      this.logger.log(`Found ${stallsWithRatings.length} random stall items`);
      return {
        data: stallsWithRatings,
        message: 'Random stalls retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding random stalls: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findTopRated(limit: number = 8, minRating: number = 3.5) {
    try {
      this.logger.log(
        `Finding top ${limit} rated stalls with rating >= ${minRating}`,
      );

      // Get all stalls
      const stalls = await this.prisma.stall.findMany({
        where: {
          // Add any necessary filters here
          is_active: true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              image_url: true,
            },
          },
          foods: {
            select: {
              ratings: true,
            },
            where: {
              is_available: true,
            },
          },
          _count: {
            select: {
              foods: true,
            },
          },
        },
      });

      // Calculate average ratings across all foods for each stall
      const stallsWithRatings = stalls.map((stall) => {
        // Get all ratings for all foods of this stall
        const allRatings = stall.foods.flatMap((food) => food.ratings || []);

        // Calculate average
        const totalRating = allRatings.reduce(
          (sum, rating) => sum + rating.score,
          0,
        );
        const avgRating =
          allRatings.length > 0 ? totalRating / allRatings.length : 0;

        // Remove the foods array to make response smaller
        const { foods, ...stallWithoutFoods } = stall;

        return {
          ...stallWithoutFoods,
          avg_rating: avgRating,
          total_ratings: allRatings.length,
        };
      });

      // Filter by minimum rating
      const filteredStalls = stallsWithRatings.filter(
        (stall) => stall.avg_rating >= minRating,
      );

      // Sort by rating (highest first) and limit
      const topRatedStalls = filteredStalls
        .sort((a, b) => b.avg_rating - a.avg_rating)
        .slice(0, limit);

      this.logger.log(`Found ${topRatedStalls.length} top rated stall items`);
      return {
        data: topRatedStalls,
        message: 'Top rated stall items retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding top rated stall items: ${error.message}`,
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
      const stall = await this.prisma.stall.findUnique({
        where: { id },
        include: {
          category: true,
          owner: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          foods: {
            take: 10,
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
          },
          badges: true,
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
              foods: true,
              ratings: true,
              badges: true,
            },
          },
        },
      });

      if (!stall) {
        this.logger.warn(`Stall with ID: ${id} not found`);
        throw new NotFoundException(`Stall with ID: ${id} not found`);
      }

      // Calculate average rating
      const avgRating = await this.prisma.rating.aggregate({
        where: { stall_id: id },
        _avg: {
          score: true,
        },
      });

      const stallWithRating = {
        ...stall,
        avg_rating: avgRating._avg.score || 0,
      };

      this.logger.log(`Found stall with ID: ${id}`);
      return {
        data: stallWithRating,
        message: 'Stall retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Error finding stall: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByOwnerId(ownerId: string, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [stalls, total] = await Promise.all([
        this.prisma.stall.findMany({
          where: { owner_id: ownerId },
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                foods: true,
                ratings: true,
              },
            },
          },
        }),
        this.prisma.stall.count({ where: { owner_id: ownerId } }),
      ]);

      this.logger.log(`Found ${stalls.length} stalls for owner: ${ownerId}`);
      return {
        data: stalls,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'Owner stalls retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding stalls by owner: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(id: string, updateStallDto: UpdateStallDto, userId: string) {
    try {
      // Check if stall exists
      const existingStall = await this.prisma.stall.findUnique({
        where: { id },
        select: {
          owner_id: true,
        },
      });

      if (!existingStall) {
        this.logger.warn(`Stall with ID: ${id} not found`);
        throw new NotFoundException(`Stall with ID: ${id} not found`);
      }

      // Check owner permission
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { role: true, id: true },
      });

      if (
        !user ||
        (user.role !== 'super_user' && existingStall.owner_id !== userId)
      ) {
        this.logger.warn(`User ${userId} not authorized to update stall ${id}`);
        throw new ForbiddenException(
          'You do not have permission to update this stall',
        );
      }

      // If category is being updated, check if it exists
      if (updateStallDto.category_id) {
        const categoryExists = await this.prisma.category_stall.findUnique({
          where: { id: updateStallDto.category_id },
        });

        if (!categoryExists) {
          this.logger.warn(
            `Category with ID: ${updateStallDto.category_id} not found`,
          );
          throw new NotFoundException(
            `Category with ID: ${updateStallDto.category_id} not found`,
          );
        }
      }

      // Update the stall
      const updatedStall = await this.prisma.stall.update({
        where: { id },
        data: {
          ...updateStallDto,
          updated_at: new Date(),
        },
        include: {
          category: true,
        },
      });

      this.logger.log(`Updated stall with ID: ${id} by user: ${userId}`);
      return {
        data: updatedStall,
        message: 'Stall updated successfully',
      };
    } catch (error) {
      this.logger.error(`Error updating stall: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    try {
      // Check if stall exists
      const existingStall = await this.prisma.stall.findUnique({
        where: { id },
        select: {
          owner_id: true,
        },
      });

      if (!existingStall) {
        this.logger.warn(`Stall with ID: ${id} not found`);
        throw new NotFoundException(`Stall with ID: ${id} not found`);
      }

      // Check owner permission
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { role: true, id: true },
      });

      if (
        !user ||
        (user.role !== 'super_user' && existingStall.owner_id !== userId)
      ) {
        this.logger.warn(`User ${userId} not authorized to delete stall ${id}`);
        throw new ForbiddenException(
          'You do not have permission to delete this stall',
        );
      }

      await this.prisma.stall.delete({
        where: { id },
      });

      this.logger.log(`Deleted stall with ID: ${id} by user: ${userId}`);
      return {
        message: 'Stall deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting stall: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Toggle active status
  async toggleActive(id: string, userId: string) {
    try {
      // Check if stall exists and get current status
      const existingStall = await this.prisma.stall.findUnique({
        where: { id },
        select: {
          owner_id: true,
          is_active: true,
        },
      });

      if (!existingStall) {
        this.logger.warn(`Stall with ID: ${id} not found`);
        throw new NotFoundException(`Stall with ID: ${id} not found`);
      }

      // Check owner permission
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { role: true, id: true },
      });

      if (
        !user ||
        (user.role !== 'super_user' && existingStall.owner_id !== userId)
      ) {
        this.logger.warn(`User ${userId} not authorized to update stall ${id}`);
        throw new ForbiddenException(
          'You do not have permission to update this stall',
        );
      }

      // Toggle is_active status
      const updatedStall = await this.prisma.stall.update({
        where: { id },
        data: {
          is_active: !existingStall.is_active,
          updated_at: new Date(),
        },
      });

      this.logger.log(
        `Toggled stall active status with ID: ${id} to: ${updatedStall.is_active}`,
      );
      return {
        data: updatedStall,
        message: `Stall ${updatedStall.is_active ? 'activated' : 'deactivated'} successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Error toggling stall active status: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
