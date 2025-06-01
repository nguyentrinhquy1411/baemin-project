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
} from '@nestjs/common';
import { BadgesStallService } from './badges-stall.service';
import { CreateBadgesStallDto } from './dto/create-badges-stall.dto';
import { UpdateBadgesStallDto } from './dto/update-badges-stall.dto';
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

@ApiTags('badges-stall')
@Controller('badges-stall')
export class BadgesStallController {
  constructor(private readonly badgesStallService: BadgesStallService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new badge for a stall' })
  @ApiResponse({
    status: 201,
    description: 'The badge has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the stall owner.' })
  @ApiResponse({ status: 404, description: 'Stall not found.' })
  create(@Body() createBadgesStallDto: CreateBadgesStallDto, @Request() req) {
    return this.badgesStallService.create(
      createBadgesStallDto,
      req.user.userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all badges' })
  @ApiResponse({ status: 200, description: 'Return all badges.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'stallId', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('name') name?: string,
    @Query('stallId') stallId?: string,
  ) {
    return this.badgesStallService.findAll(page, limit, name, stallId);
  }

  @Get('stall/:stallId')
  @ApiOperation({ summary: 'Get all badges for a specific stall' })
  @ApiResponse({ status: 200, description: 'Return all badges for the stall.' })
  @ApiResponse({ status: 404, description: 'Stall not found.' })
  @ApiParam({ name: 'stallId', description: 'ID of the stall' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByStall(
    @Param('stallId', ParseUUIDPipe) stallId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.badgesStallService.findByStallId(stallId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a badge by id' })
  @ApiResponse({ status: 200, description: 'Return the badge.' })
  @ApiResponse({ status: 404, description: 'Badge not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.badgesStallService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update a badge' })
  @ApiResponse({
    status: 200,
    description: 'The badge has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the stall owner.' })
  @ApiResponse({ status: 404, description: 'Badge not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBadgesStallDto: UpdateBadgesStallDto,
    @Request() req,
  ) {
    return this.badgesStallService.update(
      id,
      updateBadgesStallDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete a badge' })
  @ApiResponse({
    status: 200,
    description: 'The badge has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the stall owner or admin.',
  })
  @ApiResponse({ status: 404, description: 'Badge not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.badgesStallService.remove(id, req.user.userId);
  }
}
