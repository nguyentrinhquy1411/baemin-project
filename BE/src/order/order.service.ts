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

  async getOrdersByStallOwner(
    ownerId: string,
    page = 1,
    limit = 10,
    status?: string,
  ) {
    const skip = (page - 1) * limit;

    try {
      // First, verify that the user is a store owner
      const user = await this.prisma.users.findUnique({
        where: { id: ownerId },
        select: { id: true, role: true },
      });

      if (!user || user.role !== 'store') {
        throw new Error('User is not a store owner');
      }

      // Get all stalls owned by this user
      const stalls = await this.prisma.stall.findMany({
        where: { owner_id: ownerId },
        select: { id: true },
      });

      const stallIds = stalls.map((stall) => stall.id);

      if (stallIds.length === 0) {
        return {
          success: true,
          data: [],
          meta: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
          message: 'No stalls found for this owner',
        };
      }

      // Build where clause
      const where: any = {
        order_items: {
          some: {
            stall_id: {
              in: stallIds,
            },
          },
        },
      };

      if (status) {
        where.status = status as any;
      }

      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            order_items: {
              where: {
                stall_id: {
                  in: stallIds,
                },
              },
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
                user_profiles: {
                  select: {
                    first_name: true,
                    last_name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.order.count({ where }),
      ]);

      // Group orders by status for statistics
      const statusCounts = await this.prisma.order.groupBy({
        by: ['status'],
        where: {
          order_items: {
            some: {
              stall_id: {
                in: stallIds,
              },
            },
          },
        },
        _count: {
          status: true,
        },
      });

      const statusStats = statusCounts.reduce(
        (acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        success: true,
        data: orders,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          statusStats,
          stallCount: stallIds.length,
        },
        message: 'Orders retrieved successfully',
      };
    } catch (error) {
      throw new Error(`Failed to get orders for stall owner: ${error.message}`);
    }
  }

  async getOrderStatsByStallOwner(ownerId: string) {
    try {
      // First, verify that the user is a store owner
      const user = await this.prisma.users.findUnique({
        where: { id: ownerId },
        select: { id: true, role: true },
      });

      if (!user || user.role !== 'store') {
        throw new Error('User is not a store owner');
      }

      // Get all stalls owned by this user
      const stalls = await this.prisma.stall.findMany({
        where: { owner_id: ownerId },
        select: { id: true, name: true },
      });

      const stallIds = stalls.map((stall) => stall.id);

      if (stallIds.length === 0) {
        return {
          success: true,
          data: {
            totalOrders: 0,
            statusCounts: {},
            revenueStats: {},
            stallStats: [],
          },
          message: 'No stalls found for this owner',
        };
      }

      // Get order status counts
      const statusCounts = await this.prisma.order.groupBy({
        by: ['status'],
        where: {
          order_items: {
            some: {
              stall_id: {
                in: stallIds,
              },
            },
          },
        },
        _count: {
          status: true,
        },
      });

      // Get revenue stats
      const revenueStats = await this.prisma.order.aggregate({
        where: {
          status: {
            in: ['delivered', 'confirmed', 'preparing', 'ready', 'delivering'],
          },
          order_items: {
            some: {
              stall_id: {
                in: stallIds,
              },
            },
          },
        },
        _sum: {
          final_amount: true,
          total_amount: true,
        },
        _count: {
          id: true,
        },
      });

      // Get stats per stall
      const stallStats = await Promise.all(
        stalls.map(async (stall) => {
          const orderCount = await this.prisma.order.count({
            where: {
              order_items: {
                some: {
                  stall_id: stall.id,
                },
              },
            },
          });

          const revenue = await this.prisma.order_item.aggregate({
            where: {
              stall_id: stall.id,
              order: {
                status: {
                  in: [
                    'delivered',
                    'confirmed',
                    'preparing',
                    'ready',
                    'delivering',
                  ],
                },
              },
            },
            _sum: {
              total_price: true,
            },
          });
          return {
            stallId: stall.id,
            stallName: stall.name,
            orderCount,
            revenue: Number(revenue._sum.total_price) || 0,
          };
        }),
      );

      const statusStats = statusCounts.reduce(
        (acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        success: true,
        data: {
          totalOrders: revenueStats._count.id || 0,
          statusCounts: statusStats,
          revenueStats: {
            totalRevenue: Number(revenueStats._sum.final_amount) || 0,
            totalOrderAmount: Number(revenueStats._sum.total_amount) || 0,
            averageOrderValue: revenueStats._count.id
              ? Number(revenueStats._sum.final_amount || 0) /
                revenueStats._count.id
              : 0,
          },
          stallStats,
        },
        message: 'Order statistics retrieved successfully',
      };
    } catch (error) {
      throw new Error(`Failed to get order statistics: ${error.message}`);
    }
  }
}
