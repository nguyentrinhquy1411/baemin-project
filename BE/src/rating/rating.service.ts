import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class RatingService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {
    this.logger.setContext('RatingService');
  }

  async create(createRatingDto: CreateRatingDto, userId: string) {
    try {
      // Check if food exists
      const food = await this.prisma.food.findUnique({
        where: { id: createRatingDto.food_id },
        select: {
          id: true,
          stall_id: true,
        },
      });

      if (!food) {
        this.logger.warn(`Food with ID: ${createRatingDto.food_id} not found`);
        throw new NotFoundException(
          `Food with ID: ${createRatingDto.food_id} not found`,
        );
      }

      // Check if stall ID matches
      if (food.stall_id !== createRatingDto.stall_id) {
        this.logger.warn(
          `Food ${createRatingDto.food_id} does not belong to stall ${createRatingDto.stall_id}`,
        );
        throw new ConflictException(`Food does not belong to specified stall`);
      }

      // Check if user has already rated this food
      const existingRating = await this.prisma.rating.findFirst({
        where: {
          user_id: userId,
          food_id: createRatingDto.food_id,
        },
      });

      if (existingRating) {
        this.logger.warn(
          `User ${userId} has already rated food ${createRatingDto.food_id}`,
        );
        throw new ConflictException('You have already rated this food item');
      }

      // Create the rating
      const rating = await this.prisma.rating.create({
        data: {
          ...createRatingDto,
          user_id: userId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          food: {
            select: {
              id: true,
              name: true,
            },
          },
          stall: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(
        `Rating created with ID: ${rating.id} by user: ${userId}`,
      );
      return {
        data: rating,
        message: 'Rating created successfully',
      };
    } catch (error) {
      this.logger.error(`Error creating rating: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    foodId?: string,
    stallId?: string,
    userId?: string,
    minScore?: number,
    maxScore?: number,
  ) {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      let where: any = {};
      if (foodId) where.food_id = foodId;
      if (stallId) where.stall_id = stallId;
      if (userId) where.user_id = userId;

      // Score range filter
      if (minScore !== undefined && maxScore !== undefined) {
        where.score = { gte: minScore, lte: maxScore };
      } else if (minScore !== undefined) {
        where.score = { gte: minScore };
      } else if (maxScore !== undefined) {
        where.score = { lte: maxScore };
      }

      const [ratings, total] = await Promise.all([
        this.prisma.rating.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
            food: {
              select: {
                id: true,
                name: true,
                image_url: true,
              },
            },
            stall: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        this.prisma.rating.count({ where }),
      ]);

      this.logger.log(`Found ${ratings.length} ratings`);
      return {
        data: ratings,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'Ratings retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding all ratings: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const rating = await this.prisma.rating.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          food: {
            select: {
              id: true,
              name: true,
              image_url: true,
            },
          },
          stall: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!rating) {
        this.logger.warn(`Rating with ID: ${id} not found`);
        throw new NotFoundException(`Rating with ID: ${id} not found`);
      }

      this.logger.log(`Found rating with ID: ${id}`);
      return {
        data: rating,
        message: 'Rating retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Error finding rating: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByUserId(userId: string, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [ratings, total] = await Promise.all([
        this.prisma.rating.findMany({
          where: { user_id: userId },
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            food: {
              select: {
                id: true,
                name: true,
                image_url: true,
              },
            },
            stall: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        this.prisma.rating.count({ where: { user_id: userId } }),
      ]);

      this.logger.log(`Found ${ratings.length} ratings for user: ${userId}`);
      return {
        data: ratings,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'User ratings retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding ratings by user: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(id: string, updateRatingDto: UpdateRatingDto, userId: string) {
    try {
      // Check if rating exists
      const existingRating = await this.prisma.rating.findUnique({
        where: { id },
        select: {
          id: true,
          user_id: true,
        },
      });

      if (!existingRating) {
        this.logger.warn(`Rating with ID: ${id} not found`);
        throw new NotFoundException(`Rating with ID: ${id} not found`);
      }

      // Check owner permission
      if (existingRating.user_id !== userId) {
        this.logger.warn(
          `User ${userId} not authorized to update rating ${id}`,
        );
        throw new ForbiddenException(
          'You do not have permission to update this rating',
        );
      }

      // Update the rating
      const updatedRating = await this.prisma.rating.update({
        where: { id },
        data: {
          ...updateRatingDto,
          updated_at: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          food: {
            select: {
              id: true,
              name: true,
            },
          },
          stall: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(`Updated rating with ID: ${id}`);
      return {
        data: updatedRating,
        message: 'Rating updated successfully',
      };
    } catch (error) {
      this.logger.error(`Error updating rating: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    try {
      // Check if rating exists
      const existingRating = await this.prisma.rating.findUnique({
        where: { id },
        select: {
          id: true,
          user_id: true,
        },
      });

      if (!existingRating) {
        this.logger.warn(`Rating with ID: ${id} not found`);
        throw new NotFoundException(`Rating with ID: ${id} not found`);
      }

      // Check owner permission
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { role: true, id: true },
      });

      if (
        !user ||
        (user.role !== 'super_user' && existingRating.user_id !== userId)
      ) {
        this.logger.warn(
          `User ${userId} not authorized to delete rating ${id}`,
        );
        throw new ForbiddenException(
          'You do not have permission to delete this rating',
        );
      }

      await this.prisma.rating.delete({
        where: { id },
      });

      this.logger.log(`Deleted rating with ID: ${id}`);
      return {
        message: 'Rating deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting rating: ${error.message}`, error.stack);
      throw error;
    }
  }
}
