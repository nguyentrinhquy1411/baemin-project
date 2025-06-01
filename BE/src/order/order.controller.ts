import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from 'src/common/guards';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    try {
      const userId = req.user.userId;
      return await this.orderService.createOrder(userId, createOrderDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create order',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get orders for current user' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserOrders(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const userId = req.user.userId;
      return await this.orderService.getOrdersByUserId(userId, page, limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async getOrder(@Request() req, @Param('id') id: string) {
    try {
      const userId = req.user.userId;
      return await this.orderService.getOrderById(id, userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get order',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    try {
      return await this.orderService.updateOrderStatus(id, updateStatusDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update order status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Store owner endpoints
  @Get('store-owner/:ownerId')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get orders for store owner stalls' })
  @ApiResponse({
    status: 200,
    description: 'Store owner orders retrieved successfully.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getOrdersByStallOwner(
    @Param('ownerId') ownerId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    try {
      return await this.orderService.getOrdersByStallOwner(
        ownerId,
        page,
        limit,
        status,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get store owner orders',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('store-owner/:ownerId/stats')
  @ApiOperation({ summary: 'Get order statistics for store owner' })
  @ApiResponse({
    status: 200,
    description: 'Store owner order statistics retrieved successfully.',
  })
  async getOrderStatsByStallOwner(@Param('ownerId') ownerId: string) {
    try {
      return await this.orderService.getOrderStatsByStallOwner(ownerId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get store owner order statistics',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Admin endpoints
  @Get('admin/all')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'All orders retrieved successfully.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getAllOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    try {
      return await this.orderService.getAllOrders(page, limit, status);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
