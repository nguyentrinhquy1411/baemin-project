import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    const {
      items,
      delivery_address,
      delivery_phone,
      delivery_name,
      payment_method,
      notes,
      shipping_fee = 17000,
      discount_amount = 0,
    } = createOrderDto;

    // Calculate total amount
    const total_amount = items.reduce(
      (total, item) => total + item.unit_price * item.quantity,
      0,
    );
    const final_amount = total_amount + shipping_fee - discount_amount;

    try {
      const order = await this.prisma.order.create({
        data: {
          user_id: userId,
          total_amount,
          shipping_fee,
          discount_amount,
          final_amount,
          payment_method,
          delivery_address,
          delivery_phone,
          delivery_name,
          notes,
          order_items: {
            create: items.map((item) => ({
              food_id: item.food_id,
              stall_id: item.stall_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.unit_price * item.quantity,
              food_name: item.food_name,
              stall_name: item.stall_name,
            })),
          },
        },
        include: {
          order_items: {
            include: {
              food: true,
              stall: true,
            },
          },
        },
      });

      return {
        success: true,
        data: order,
        message: 'Order created successfully',
      };
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  async getOrdersByUserId(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    try {
      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where: { user_id: userId },
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            order_items: {
              include: {
                food: true,
                stall: true,
              },
            },
          },
        }),
        this.prisma.order.count({ where: { user_id: userId } }),
      ]);

      return {
        success: true,
        data: orders,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'Orders retrieved successfully',
      };
    } catch (error) {
      throw new Error(`Failed to get orders: ${error.message}`);
    }
  }

  async getOrderById(orderId: string, userId?: string) {
    try {
      const order = await this.prisma.order.findFirst({
        where: {
          id: orderId,
          ...(userId && { user_id: userId }),
        },
        include: {
          order_items: {
            include: {
              food: true,
              stall: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      return {
        success: true,
        data: order,
        message: 'Order retrieved successfully',
      };
    } catch (error) {
      throw new Error(`Failed to get order: ${error.message}`);
    }
  }

  async updateOrderStatus(
    orderId: string,
    updateStatusDto: UpdateOrderStatusDto,
  ) {
    try {
      const order = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: updateStatusDto.status,
          updated_at: new Date(),
        },
        include: {
          order_items: {
            include: {
              food: true,
              stall: true,
            },
          },
        },
      });

      return {
        success: true,
        data: order,
        message: 'Order status updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  async getAllOrders(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : {};

    try {
      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            order_items: {
              include: {
                food: true,
                stall: true,
              },
            },
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        }),
        this.prisma.order.count({ where }),
      ]);

      return {
        success: true,
        data: orders,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'Orders retrieved successfully',
      };
    } catch (error) {
      throw new Error(`Failed to get orders: ${error.message}`);
    }
  }
}
