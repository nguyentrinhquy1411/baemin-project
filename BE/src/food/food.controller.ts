import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  ParseFloatPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { FoodService } from './food.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards';
import { Roles, Role } from '../common/decorators';

@ApiTags('food')
@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new food item' })
  @ApiResponse({
    status: 201,
    description: 'The food item has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the stall owner.' })
  @ApiResponse({ status: 404, description: 'Stall or category not found.' })
  create(@Body() createFoodDto: CreateFoodDto, @Request() req) {
    return this.foodService.create(createFoodDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all food items' })
  @ApiResponse({ status: 200, description: 'Return all food items.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'stallId', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'isAvailable', required: false, type: Boolean })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('name') name?: string,
    @Query('stallId') stallId?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('categoryId') categoryId?: string,
    @Query('isAvailable') isAvailable?: boolean,
  ) {
    return this.foodService.findAll(
      page,
      limit,
      name,
      stallId,
      minPrice,
      maxPrice,
      categoryId,
      isAvailable,
    );
  }
  @Get('random')
  @ApiOperation({ summary: 'Get random food items' })
  @ApiResponse({ status: 200, description: 'Return random food items.' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of random food items to return (default: 5)',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Filter by category ID',
  })
  findRandom(
    @Query('limit') limit: number = 5,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.foodService.findRandom(limit, categoryId);
  }

  @Get('top-rated')
  @ApiOperation({ summary: 'Get top rated food items' })
  @ApiResponse({ status: 200, description: 'Return top rated food items.' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of top rated food items to return (default: 8)',
  })
  @ApiQuery({
    name: 'minRating',
    required: false,
    type: Number,
    description: 'Minimum rating threshold (default: 3.5)',
  })
  findTopRated(
    @Query('limit') limit: number = 8,
    @Query('minRating') minRating: number = 3.5,
  ) {
    return this.foodService.findTopRated(limit, minRating);
  }

  @Get('by-category')
  @ApiOperation({ summary: 'Get food items grouped by category' })
  @ApiResponse({
    status: 200,
    description: 'Return food items with their categories.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of food items to return (default: 8)',
  })
  findByCategory(@Query('limit') limit: number = 8) {
    return this.foodService.findByCategory(limit);
  }

  @Get('stall/:stallId')
  @ApiOperation({ summary: 'Get all food items for a specific stall' })
  @ApiResponse({
    status: 200,
    description: 'Return all food items for the stall.',
  })
  @ApiResponse({ status: 404, description: 'Stall not found.' })
  @ApiParam({ name: 'stallId', description: 'ID of the stall' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  findByStall(
    @Param('stallId', ParseUUIDPipe) stallId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.foodService.findByStallId(stallId, page, limit, categoryId);
  }

  @Get('store-owner/:ownerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get all food items for stalls owned by a store owner',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all food items for stalls owned by the user.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a store owner.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiParam({ name: 'ownerId', description: 'ID of the store owner' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'isAvailable', required: false, type: Boolean })
  findByStoreOwner(
    @Param('ownerId', ParseUUIDPipe) ownerId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('categoryId') categoryId?: string,
    @Query('isAvailable') isAvailable?: string,
  ) {
    // Convert string to boolean if provided
    let isAvailableBool: boolean | undefined = undefined;
    if (isAvailable !== undefined) {
      if (isAvailable === 'true') {
        isAvailableBool = true;
      } else if (isAvailable === 'false') {
        isAvailableBool = false;
      }
    }

    return this.foodService.findByStoreOwner(
      ownerId,
      page,
      limit,
      categoryId,
      isAvailableBool,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a food item by id' })
  @ApiResponse({ status: 200, description: 'Return the food item.' })
  @ApiResponse({ status: 404, description: 'Food item not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.foodService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update a food item' })
  @ApiResponse({
    status: 200,
    description: 'The food item has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the stall owner.' })
  @ApiResponse({ status: 404, description: 'Food item not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFoodDto: UpdateFoodDto,
    @Request() req,
  ) {
    return this.foodService.update(id, updateFoodDto, req.user.userId);
  }

  @Patch(':id/toggle-availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Toggle food item availability' })
  @ApiResponse({
    status: 200,
    description: 'The food item availability has been successfully toggled.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the stall owner.' })
  @ApiResponse({ status: 404, description: 'Food item not found.' })
  toggleAvailability(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.foodService.toggleAvailability(id, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete a food item' })
  @ApiResponse({
    status: 200,
    description: 'The food item has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the stall owner or admin.',
  })
  @ApiResponse({ status: 404, description: 'Food item not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.foodService.remove(id, req.user.userId);
  }

  @Post('update-all-images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_USER)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Update all food images to a single image (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'All food images have been successfully updated.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only.' })
  async updateAllFoodImages() {
    return this.foodService.updateAllFoodImages();
  }
}
