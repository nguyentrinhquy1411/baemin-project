import { Controller, Get, Query, Logger } from '@nestjs/common';
import { SearchService, SearchFilters } from './search.service';

@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query() query: any) {
    try {
      const filters: SearchFilters = {
        keyword: query.keyword,
        type: query.type || 'all',
        categoryId: query.categoryId,
        minPrice: query.minPrice ? Number(query.minPrice) : undefined,
        maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
        isAvailable:
          query.isAvailable !== undefined
            ? query.isAvailable === 'true'
            : undefined,
        isActive:
          query.isActive !== undefined ? query.isActive === 'true' : undefined,
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 20,
        sortBy: query.sortBy || 'name',
        sortOrder: query.sortOrder || 'asc',
      };

      this.logger.log(`Search request: ${JSON.stringify(filters)}`);

      const result = await this.searchService.search(filters);
      return result;
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('suggestions')
  async getSuggestions(
    @Query('keyword') keyword: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const suggestions = await this.searchService.getSuggestions(
        keyword,
        limit ? Number(limit) : 10,
      );
      return suggestions;
    } catch (error) {
      this.logger.error(
        `Get suggestions failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('popular-keywords')
  async getPopularKeywords(@Query('limit') limit?: string) {
    try {
      const keywords = await this.searchService.getPopularKeywords(
        limit ? Number(limit) : 10,
      );
      return keywords;
    } catch (error) {
      this.logger.error(
        `Get popular keywords failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
