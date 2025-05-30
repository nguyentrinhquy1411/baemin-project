import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SearchFilters {
  keyword?: string;
  type?: 'all' | 'food' | 'stall';
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchSuggestion {
  id: string;
  name: string;
  type: 'food' | 'stall';
  image_url?: string;
  category?: string;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private prisma: PrismaService) {}

  async search(filters: SearchFilters) {
    try {
      const {
        keyword,
        type = 'all',
        page = 1,
        limit = 20,
        categoryId,
        minPrice,
        maxPrice,
        isAvailable,
        isActive,
        sortBy = 'name',
        sortOrder = 'asc',
      } = filters;

      const skip = (page - 1) * limit;
      let foods: any[] = [];
      let stalls: any[] = [];
      let foodTotal = 0;
      let stallTotal = 0;

      // Search Foods
      if (type === 'all' || type === 'food') {
        const foodWhere: any = {};

        if (keyword) {
          foodWhere.name = { contains: keyword, mode: 'insensitive' };
        }
        if (categoryId) {
          foodWhere.stall_food_category = {
            some: { category_id: categoryId },
          };
        }
        if (minPrice !== undefined && maxPrice !== undefined) {
          foodWhere.price = { gte: minPrice, lte: maxPrice };
        } else if (minPrice !== undefined) {
          foodWhere.price = { gte: minPrice };
        } else if (maxPrice !== undefined) {
          foodWhere.price = { lte: maxPrice };
        }
        if (isAvailable !== undefined) {
          foodWhere.is_available = isAvailable;
        }

        const orderBy: any = {};
        if (sortBy === 'name') orderBy.name = sortOrder;
        else if (sortBy === 'price') orderBy.price = sortOrder;
        else if (sortBy === 'created_at') orderBy.created_at = sortOrder;

        const [foodResults, foodCount] = await Promise.all([
          this.prisma.food.findMany({
            where: foodWhere,
            skip: type === 'food' ? skip : 0,
            take: type === 'food' ? limit : Math.ceil(limit / 2),
            orderBy,
            include: {
              stall: {
                select: {
                  id: true,
                  name: true,
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
          }),
          this.prisma.food.count({ where: foodWhere }),
        ]);

        // Calculate average ratings
        foods = await Promise.all(
          foodResults.map(async (food) => {
            const avgRating = await this.prisma.rating.aggregate({
              where: { food_id: food.id },
              _avg: { score: true },
            });
            return {
              ...food,
              avg_rating: avgRating._avg.score || 0,
            };
          }),
        );

        foodTotal = foodCount;
      }

      // Search Stalls
      if (type === 'all' || type === 'stall') {
        const stallWhere: any = {};

        if (keyword) {
          stallWhere.name = { contains: keyword, mode: 'insensitive' };
        }
        if (categoryId) {
          stallWhere.category_id = categoryId;
        }
        if (isActive !== undefined) {
          stallWhere.is_active = isActive;
        }

        const orderBy: any = {};
        if (sortBy === 'name') orderBy.name = sortOrder;
        else if (sortBy === 'created_at') orderBy.created_at = sortOrder;

        const [stallResults, stallCount] = await Promise.all([
          this.prisma.stall.findMany({
            where: stallWhere,
            skip: type === 'stall' ? skip : 0,
            take: type === 'stall' ? limit : Math.ceil(limit / 2),
            orderBy,
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
          this.prisma.stall.count({ where: stallWhere }),
        ]);

        // Calculate average ratings
        stalls = await Promise.all(
          stallResults.map(async (stall) => {
            // Get all ratings for all foods of this stall
            const stallFoods = await this.prisma.food.findMany({
              where: { stall_id: stall.id },
              include: { ratings: true },
            });

            const allRatings = stallFoods.flatMap((food) => food.ratings);
            const avgRating =
              allRatings.length > 0
                ? allRatings.reduce((sum, rating) => sum + rating.score, 0) /
                  allRatings.length
                : 0;

            return {
              ...stall,
              avg_rating: avgRating,
            };
          }),
        );

        stallTotal = stallCount;
      }

      const total = foodTotal + stallTotal;

      this.logger.log(
        `Search completed: keyword="${keyword}", type="${type}", results=${total}`,
      );

      return {
        foods: {
          data: foods,
          meta: {
            total: foodTotal,
            page: type === 'food' ? page : 1,
            limit: type === 'food' ? limit : Math.ceil(limit / 2),
            totalPages:
              type === 'food'
                ? Math.ceil(foodTotal / limit)
                : Math.ceil(foodTotal / Math.ceil(limit / 2)),
          },
        },
        stalls: {
          data: stalls,
          meta: {
            total: stallTotal,
            page: type === 'stall' ? page : 1,
            limit: type === 'stall' ? limit : Math.ceil(limit / 2),
            totalPages:
              type === 'stall'
                ? Math.ceil(stallTotal / limit)
                : Math.ceil(stallTotal / Math.ceil(limit / 2)),
          },
        },
        total,
        keyword: keyword || '',
        message: 'Search completed successfully',
      };
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSuggestions(
    keyword: string,
    limit: number = 10,
  ): Promise<SearchSuggestion[]> {
    try {
      if (!keyword || keyword.length < 2) {
        return [];
      }

      const suggestions: SearchSuggestion[] = [];

      // Get food suggestions
      const foods = await this.prisma.food.findMany({
        where: {
          name: { contains: keyword, mode: 'insensitive' },
          is_available: true,
        },
        take: Math.ceil(limit / 2),
        select: {
          id: true,
          name: true,
          image_url: true,
          stall_food_category: {
            take: 1,
            include: {
              category: {
                select: { name: true },
              },
            },
          },
        },
      });

      foods.forEach((food) => {
        suggestions.push({
          id: food.id,
          name: food.name,
          type: 'food',
          image_url: food.image_url || undefined,
          category: food.stall_food_category[0]?.category?.name,
        });
      });

      // Get stall suggestions
      const stalls = await this.prisma.stall.findMany({
        where: {
          name: { contains: keyword, mode: 'insensitive' },
          is_active: true,
        },
        take: Math.ceil(limit / 2),
        select: {
          id: true,
          name: true,
          image_url: true,
          category: {
            select: { name: true },
          },
        },
      });

      stalls.forEach((stall) => {
        suggestions.push({
          id: stall.id,
          name: stall.name,
          type: 'stall',
          image_url: stall.image_url || undefined,
          category: stall.category?.name,
        });
      });

      this.logger.log(
        `Generated ${suggestions.length} suggestions for keyword: ${keyword}`,
      );
      return suggestions.slice(0, limit);
    } catch (error) {
      this.logger.error(
        `Failed to get suggestions: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  async getPopularKeywords(limit: number = 10): Promise<string[]> {
    try {
      // Get popular food names
      const popularFoods = await this.prisma.food.findMany({
        where: { is_available: true },
        take: limit,
        orderBy: { created_at: 'desc' },
        select: { name: true },
      });

      // Get popular stall names
      const popularStalls = await this.prisma.stall.findMany({
        where: { is_active: true },
        take: limit,
        orderBy: { created_at: 'desc' },
        select: { name: true },
      });

      const keywords = [
        ...popularFoods.map((f) => f.name),
        ...popularStalls.map((s) => s.name),
        // Add some common search terms
        'Cơm',
        'Phở',
        'Bún',
        'Bánh mì',
        'Gà rán',
        'Pizza',
        'Burger',
        'Sushi',
      ];

      const uniqueKeywords = [...new Set(keywords)].slice(0, limit);

      this.logger.log(`Generated ${uniqueKeywords.length} popular keywords`);
      return uniqueKeywords;
    } catch (error) {
      this.logger.error(
        `Failed to get popular keywords: ${error.message}`,
        error.stack,
      );
      return ['Cơm', 'Phở', 'Bún', 'Bánh mì', 'Gà rán'];
    }
  }
}
