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
import { Roles } from '../common/decorators';

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
    return this.foodService.create(createFoodDto, req.user.id);
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
    return this.foodService.update(id, updateFoodDto, req.user.id);
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
    return this.foodService.toggleAvailability(id, req.user.id);
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
    return this.foodService.remove(id, req.user.id);
  }
}
