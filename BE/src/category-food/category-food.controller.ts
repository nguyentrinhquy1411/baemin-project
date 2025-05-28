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
  ParseUUIDPipe,
} from '@nestjs/common';
import { CategoryFoodService } from './category-food.service';
import { CreateCategoryFoodDto } from './dto/create-category-food.dto';
import { UpdateCategoryFoodDto } from './dto/update-category-food.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, Role } from '../common/decorators';

@ApiTags('category-food')
@Controller('category-food')
export class CategoryFoodController {
  constructor(private readonly categoryFoodService: CategoryFoodService) {}
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_USER, Role.STORE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new food category' })
  @ApiResponse({
    status: 201,
    description: 'The food category has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createCategoryFoodDto: CreateCategoryFoodDto) {
    return this.categoryFoodService.create(createCategoryFoodDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all food categories' })
  @ApiResponse({ status: 200, description: 'Return all food categories.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('name') name?: string,
  ) {
    return this.categoryFoodService.findAll(page, limit, name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a food category by id' })
  @ApiResponse({ status: 200, description: 'Return the food category.' })
  @ApiResponse({ status: 404, description: 'Food category not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryFoodService.findOne(id);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_USER, Role.STORE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update a food category' })
  @ApiResponse({
    status: 200,
    description: 'The food category has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Food category not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryFoodDto: UpdateCategoryFoodDto,
  ) {
    return this.categoryFoodService.update(id, updateCategoryFoodDto);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_USER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete a food category' })
  @ApiResponse({
    status: 200,
    description: 'The food category has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Food category not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryFoodService.remove(id);
  }
}
