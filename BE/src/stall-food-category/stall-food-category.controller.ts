import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { StallFoodCategoryService } from './stall-food-category.service';
import { CreateStallFoodCategoryDto } from './dto/create-stall-food-category.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

@ApiTags('stall-food-category')
@Controller('stall-food-category')
export class StallFoodCategoryController {
  constructor(
    private readonly stallFoodCategoryService: StallFoodCategoryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Assign a food item to a category within a stall' })
  @ApiResponse({
    status: 201,
    description: 'The food category assignment has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the stall owner.' })
  @ApiResponse({
    status: 404,
    description: 'Stall, food, or category not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Assignment already exists or food does not belong to stall.',
  })
  create(
    @Body() createStallFoodCategoryDto: CreateStallFoodCategoryDto,
    @Request() req,
  ) {
    return this.stallFoodCategoryService.create(
      createStallFoodCategoryDto,
      req.user.userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all food category assignments' })
  @ApiResponse({
    status: 200,
    description: 'Return all food category assignments.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'stallId', required: false, type: String })
  @ApiQuery({ name: 'foodId', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('stallId') stallId?: string,
    @Query('foodId') foodId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.stallFoodCategoryService.findAll(
      page,
      limit,
      stallId,
      foodId,
      categoryId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a food category assignment by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the food category assignment.',
  })
  @ApiResponse({ status: 404, description: 'Assignment not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.stallFoodCategoryService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete a food category assignment' })
  @ApiResponse({
    status: 200,
    description: 'The food category assignment has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the stall owner or admin.',
  })
  @ApiResponse({ status: 404, description: 'Assignment not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.stallFoodCategoryService.remove(id, req.user.userId);
  }
}
