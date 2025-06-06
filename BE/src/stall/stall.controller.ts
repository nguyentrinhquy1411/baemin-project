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
  Request,
} from '@nestjs/common';
import { StallService } from './stall.service';
import { CreateStallDto } from './dto/create-stall.dto';
import { UpdateStallDto } from './dto/update-stall.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, Role } from '../common/decorators';

@ApiTags('stall')
@Controller('stall')
export class StallController {
  constructor(private readonly stallService: StallService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_USER, Role.STORE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new stall (store/restaurant)' })
  @ApiResponse({
    status: 201,
    description: 'The stall has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  create(@Body() createStallDto: CreateStallDto, @Request() req) {
    return this.stallService.create(createStallDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stalls (stores/restaurants)' })
  @ApiResponse({ status: 200, description: 'Return all stalls.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('name') name?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.stallService.findAll(page, limit, name, categoryId, isActive);
  }
  @Get('random')
  @ApiOperation({ summary: 'Get random stall items' })
  @ApiResponse({ status: 200, description: 'Return random stall items.' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of random stall items to return (default: 5)',
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
    return this.stallService.findRandom(limit, categoryId);
  }

  @Get('top-rated')
  @ApiOperation({ summary: 'Get top rated stall items' })
  @ApiResponse({ status: 200, description: 'Return top rated stall items.' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of top rated stall items to return (default: 8)',
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
    return this.stallService.findTopRated(limit, minRating);
  }

  @Get('my-stalls')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get all stalls owned by the current user' })
  @ApiResponse({
    status: 200,
    description: 'Return all stalls owned by the user.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findMyStalls(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.stallService.findByOwnerId(req.user.userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a stall by id' })
  @ApiResponse({ status: 200, description: 'Return the stall.' })
  @ApiResponse({ status: 404, description: 'Stall not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.stallService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update a stall' })
  @ApiResponse({
    status: 200,
    description: 'The stall has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the owner.' })
  @ApiResponse({ status: 404, description: 'Stall not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStallDto: UpdateStallDto,
    @Request() req,
  ) {
    return this.stallService.update(id, updateStallDto, req.user.userId);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Toggle stall active status' })
  @ApiResponse({
    status: 200,
    description: 'The stall status has been successfully toggled.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the owner.' })
  @ApiResponse({ status: 404, description: 'Stall not found.' })
  toggleActive(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.stallService.toggleActive(id, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete a stall' })
  @ApiResponse({
    status: 200,
    description: 'The stall has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the owner or admin.',
  })
  @ApiResponse({ status: 404, description: 'Stall not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.stallService.remove(id, req.user.userId);
  }
}
