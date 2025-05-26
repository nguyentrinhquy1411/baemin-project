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
import { CategoryStallService } from './category-stall.service';
import { CreateCategoryStallDto } from './dto/create-category-stall.dto';
import { UpdateCategoryStallDto } from './dto/update-category-stall.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, Role } from '../common/decorators';

@ApiTags('category-stall')
@Controller('category-stall')
export class CategoryStallController {
  constructor(private readonly categoryStallService: CategoryStallService) {}
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new store category' })
  @ApiResponse({
    status: 201,
    description: 'The store category has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createCategoryStallDto: CreateCategoryStallDto) {
    return this.categoryStallService.create(createCategoryStallDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all store categories' })
  @ApiResponse({ status: 200, description: 'Return all store categories.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('name') name?: string,
  ) {
    return this.categoryStallService.findAll(page, limit, name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a store category by id' })
  @ApiResponse({ status: 200, description: 'Return the store category.' })
  @ApiResponse({ status: 404, description: 'Store category not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryStallService.findOne(id);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a store category' })
  @ApiResponse({
    status: 200,
    description: 'The store category has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Store category not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryStallDto: UpdateCategoryStallDto,
  ) {
    return this.categoryStallService.update(id, updateCategoryStallDto);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a store category' })
  @ApiResponse({
    status: 200,
    description: 'The store category has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Store category not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryStallService.remove(id);
  }
}
