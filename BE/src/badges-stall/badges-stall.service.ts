import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBadgesStallDto } from './dto/create-badges-stall.dto';
import { UpdateBadgesStallDto } from './dto/update-badges-stall.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class BadgesStallService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {
    this.logger.setContext('BadgesStallService');
  }

  async create(createBadgesStallDto: CreateBadgesStallDto, userId: string) {
    try {
      // Check if stall exists and user is the owner
      const stall = await this.prisma.stall.findUnique({
        where: { id: createBadgesStallDto.stall_id },
        select: {
          id: true,
          owner_id: true,
        },
      });

      if (!stall) {
        this.logger.warn(
          `Stall with ID: ${createBadgesStallDto.stall_id} not found`,
        );
        throw new NotFoundException(
          `Stall with ID: ${createBadgesStallDto.stall_id} not found`,
        );
      }

      // Check if user is authorized (owner or admin)
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { role: true, id: true },
      });

      if (user && user.role !== 'super_user' && stall.owner_id !== userId) {
        this.logger.warn(
          `User ${userId} not authorized to add badges to stall ${stall.id}`,
        );
        throw new ForbiddenException(
          'You do not have permission to add badges to this stall',
        );
      }

      // Create badge
      const badge = await this.prisma.badges_stall.create({
        data: createBadgesStallDto,
        include: {
          stall: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(
        `Badge created with ID: ${badge.id} for stall: ${stall.id}`,
      );
      return {
        data: badge,
        message: 'Badge created successfully',
      };
    } catch (error) {
      this.logger.error(`Error creating badge: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(page = 1, limit = 10, name?: string, stallId?: string) {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      let where: any = {};
      if (name) where.name = { contains: name, mode: 'insensitive' as any };
      if (stallId) where.stall_id = stallId;

      const [badges, total] = await Promise.all([
        this.prisma.badges_stall.findMany({
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
          },
        }),
        this.prisma.badges_stall.count({ where }),
      ]);

      this.logger.log(`Found ${badges.length} badges`);
      return {
        data: badges,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'Badges retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding all badges: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const badge = await this.prisma.badges_stall.findUnique({
        where: { id },
        include: {
          stall: {
            select: {
              id: true,
              name: true,
              image_url: true,
            },
          },
        },
      });

      if (!badge) {
        this.logger.warn(`Badge with ID: ${id} not found`);
        throw new NotFoundException(`Badge with ID: ${id} not found`);
      }

      this.logger.log(`Found badge with ID: ${id}`);
      return {
        data: badge,
        message: 'Badge retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Error finding badge: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByStallId(stallId: string, page = 1, limit = 10) {
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

      const [badges, total] = await Promise.all([
        this.prisma.badges_stall.findMany({
          where: { stall_id: stallId },
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        this.prisma.badges_stall.count({ where: { stall_id: stallId } }),
      ]);

      this.logger.log(`Found ${badges.length} badges for stall: ${stallId}`);
      return {
        data: badges,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'Stall badges retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding badges by stall: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(
    id: string,
    updateBadgesStallDto: UpdateBadgesStallDto,
    userId: string,
  ) {
    try {
      // Check if badge exists
      const existingBadge = await this.prisma.badges_stall.findUnique({
        where: { id },
        include: {
          stall: {
            select: {
              owner_id: true,
            },
          },
        },
      });

      if (!existingBadge) {
        this.logger.warn(`Badge with ID: ${id} not found`);
        throw new NotFoundException(`Badge with ID: ${id} not found`);
      } // Check owner permission
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { role: true, id: true },
      });

      if (
        !user ||
        (user.role !== 'super_user' && existingBadge.stall.owner_id !== userId)
      ) {
        this.logger.warn(`User ${userId} not authorized to update badge ${id}`);
        throw new ForbiddenException(
          'You do not have permission to update this badge',
        );
      }

      // Update the badge
      const updatedBadge = await this.prisma.badges_stall.update({
        where: { id },
        data: {
          ...updateBadgesStallDto,
          updated_at: new Date(),
        },
        include: {
          stall: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(`Updated badge with ID: ${id}`);
      return {
        data: updatedBadge,
        message: 'Badge updated successfully',
      };
    } catch (error) {
      this.logger.error(`Error updating badge: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    try {
      // Check if badge exists
      const existingBadge = await this.prisma.badges_stall.findUnique({
        where: { id },
        include: {
          stall: {
            select: {
              owner_id: true,
            },
          },
        },
      });

      if (!existingBadge) {
        this.logger.warn(`Badge with ID: ${id} not found`);
        throw new NotFoundException(`Badge with ID: ${id} not found`);
      }

      // Check owner permission
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { role: true, id: true },
      });

      if (
        !user ||
        (user.role !== 'super_user' && existingBadge.stall.owner_id !== userId)
      ) {
        this.logger.warn(`User ${userId} not authorized to delete badge ${id}`);
        throw new ForbiddenException(
          'You do not have permission to delete this badge',
        );
      }

      await this.prisma.badges_stall.delete({
        where: { id },
      });

      this.logger.log(`Deleted badge with ID: ${id}`);
      return {
        message: 'Badge deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting badge: ${error.message}`, error.stack);
      throw error;
    }
  }
}
