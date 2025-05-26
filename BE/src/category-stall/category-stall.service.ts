import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryStallDto } from './dto/create-category-stall.dto';
import { UpdateCategoryStallDto } from './dto/update-category-stall.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class CategoryStallService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {
    this.logger.setContext('CategoryStallService');
  }

  async create(createCategoryStallDto: CreateCategoryStallDto) {
    try {
      const categoryStall = await this.prisma.category_stall.create({
        data: createCategoryStallDto,
      });
      this.logger.log(`Category stall created with ID: ${categoryStall.id}`);
      return {
        data: categoryStall,
        message: 'Category stall created successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error creating category stall: ${error.message}`,
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
        this.prisma.category_stall.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            _count: {
              select: { stalls: true },
            },
          },
        }),
        this.prisma.category_stall.count({ where }),
      ]);

      this.logger.log(`Found ${categories.length} category stalls`);
      return {
        data: categories,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'Category stalls retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding all category stalls: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const categoryStall = await this.prisma.category_stall.findUnique({
        where: { id },
        include: {
          stalls: {
            take: 5,
            select: {
              id: true,
              name: true,
              image_url: true,
            },
          },
          _count: {
            select: { stalls: true },
          },
        },
      });

      if (!categoryStall) {
        this.logger.warn(`Category stall with ID: ${id} not found`);
        throw new NotFoundException(`Category stall with ID: ${id} not found`);
      }

      this.logger.log(`Found category stall with ID: ${id}`);
      return {
        data: categoryStall,
        message: 'Category stall retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error finding category stall: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(id: string, updateCategoryStallDto: UpdateCategoryStallDto) {
    try {
      // Check if exists
      await this.findOne(id);

      const updatedCategoryStall = await this.prisma.category_stall.update({
        where: { id },
        data: {
          ...updateCategoryStallDto,
          updated_at: new Date(),
        },
      });

      this.logger.log(`Updated category stall with ID: ${id}`);
      return {
        data: updatedCategoryStall,
        message: 'Category stall updated successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error updating category stall: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Check if exists
      await this.findOne(id);

      await this.prisma.category_stall.delete({
        where: { id },
      });

      this.logger.log(`Deleted category stall with ID: ${id}`);
      return {
        message: 'Category stall deleted successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error deleting category stall: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
