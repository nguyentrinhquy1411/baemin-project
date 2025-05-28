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
  ParseIntPipe,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards';

@ApiTags('rating')
@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new rating' })
  @ApiResponse({
    status: 201,
    description: 'The rating has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Food or stall not found.' })
  @ApiResponse({
    status: 409,
    description: 'User has already rated this food.',
  })
  create(@Body() createRatingDto: CreateRatingDto, @Request() req) {
    return this.ratingService.create(createRatingDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ratings' })
  @ApiResponse({ status: 200, description: 'Return all ratings.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'foodId', required: false, type: String })
  @ApiQuery({ name: 'stallId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'minScore', required: false, type: Number })
  @ApiQuery({ name: 'maxScore', required: false, type: Number })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('foodId') foodId?: string,
    @Query('stallId') stallId?: string,
    @Query('userId') userId?: string,
    @Query('minScore') minScore?: number,
    @Query('maxScore') maxScore?: number,
  ) {
    return this.ratingService.findAll(
      page,
      limit,
      foodId,
      stallId,
      userId,
      minScore,
      maxScore,
    );
  }

  @Get('my-ratings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get all ratings from the current user' })
  @ApiResponse({ status: 200, description: 'Return all user ratings.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findMyRatings(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ratingService.findByUserId(req.user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a rating by id' })
  @ApiResponse({ status: 200, description: 'Return the rating.' })
  @ApiResponse({ status: 404, description: 'Rating not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ratingService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update a rating' })
  @ApiResponse({
    status: 200,
    description: 'The rating has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the rating author.',
  })
  @ApiResponse({ status: 404, description: 'Rating not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRatingDto: UpdateRatingDto,
    @Request() req,
  ) {
    return this.ratingService.update(id, updateRatingDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete a rating' })
  @ApiResponse({
    status: 200,
    description: 'The rating has been successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the rating author or admin.',
  })
  @ApiResponse({ status: 404, description: 'Rating not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.ratingService.remove(id, req.user.id);
  }
}
