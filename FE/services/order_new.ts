import axiosInstance from "@/lib/axios";

// Interfaces
export interface OrderItem {
  food_id: string;
  stall_id: string;
  quantity: number;
  unit_price: number;
  food_name: string;
  stall_name: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  delivery_address: string;
  delivery_phone: string;
  delivery_name: string;
  payment_method: "momo" | "zalopay" | "credit_card" | "cash_on_delivery";
  notes?: string;
  shipping_fee?: number;
  discount_amount?: number;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  shipping_fee: number;
  discount_amount: number;
  final_amount: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivering"
    | "delivered"
    | "cancelled";
  payment_method: string;
  delivery_address: string;
  delivery_phone: string;
  delivery_name: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItemDetail[];
}

export interface OrderItemDetail {
  id: string;
  order_id: string;
  food_id: string;
  stall_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  food_name: string;
  stall_name: string;
}

export interface OrderResponse {
  statusCode: number;
  message: string;
  data: Order;
}

export interface OrdersResponse {
  statusCode: number;
  message: string;
  data: {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface UpdateOrderStatusRequest {
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivering"
    | "delivered"
    | "cancelled";
}

// Store owner specific interfaces
export interface StoreOwnerOrdersResponse {
  success: boolean;
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    statusStats: Record<string, number>;
    stallCount: number;
  };
  message: string;
}

export interface OrderStatistics {
  totalOrders: number;
  statusCounts: Record<string, number>;
  revenueStats: {
    totalRevenue: number;
    totalOrderAmount: number;
    averageOrderValue: number;
  };
  stallStats: Array<{
    stallId: string;
    stallName: string;
    orderCount: number;
    revenue: number;
  }>;
}

export interface OrderStatsResponse {
  success: boolean;
  data: OrderStatistics;
  message: string;
}

// Order Service
export const orderService = {
  // Create a new order
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      const response = await axiosInstance.post<OrderResponse>(
        "/orders",
        orderData
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create order"
      );
    }
  },
  // Get user's orders with pagination
  async getUserOrders(
    page: number = 1,
    limit: number = 10
  ): Promise<{ orders: Order[]; total: number; page: number; limit: number }> {
    try {
      console.log("OrderService - Getting user orders:", { page, limit });

      // Check if we have a valid token before making the request
      const tokens =
        typeof window !== "undefined"
          ? {
              accessToken: localStorage.getItem("access_token"),
              refreshToken: localStorage.getItem("refresh_token"),
            }
          : { accessToken: null, refreshToken: null };

      console.log("OrderService - Token status for user orders:", {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        tokenPreview: tokens.accessToken
          ? tokens.accessToken.substring(0, 20) + "..."
          : "No token",
      });

      const response = await axiosInstance.get<OrdersResponse>(
        `/orders?page=${page}&limit=${limit}`
      );

      console.log("OrderService - User orders response:", response.data);
      return response.data.data;
    } catch (error: any) {
      console.error("OrderService - Error getting user orders:", error);
      console.error("OrderService - Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          headers: error.config?.headers,
        },
      });
      throw new Error(error.response?.data?.message || "Failed to get orders");
    }
  },
  // Get a specific order by ID
  async getOrderById(orderId: string): Promise<Order> {
    try {
      console.log("OrderService - Getting order details for ID:", orderId);

      // Check if we have a valid token before making the request
      const tokens =
        typeof window !== "undefined"
          ? {
              accessToken: localStorage.getItem("access_token"),
              refreshToken: localStorage.getItem("refresh_token"),
            }
          : { accessToken: null, refreshToken: null };

      console.log("OrderService - Token status for order details:", {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        tokenPreview: tokens.accessToken
          ? tokens.accessToken.substring(0, 20) + "..."
          : "No token",
      });

      const response = await axiosInstance.get<OrderResponse>(
        `/orders/${orderId}`
      );

      console.log("OrderService - Order details response:", response.data);
      return response.data.data;
    } catch (error: any) {
      console.error("OrderService - Error getting order details:", error);
      console.error("OrderService - Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          headers: error.config?.headers,
        },
      });
      throw new Error(error.response?.data?.message || "Failed to get order");
    }
  }, // Update order status
  async updateOrderStatus(
    orderId: string,
    status: UpdateOrderStatusRequest["status"]
  ): Promise<Order> {
    try {
      const response = await axiosInstance.put<OrderResponse>(
        `/orders/${orderId}/status`,
        { status }
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update order status"
      );
    }
  },
  // Store owner functions
  // Get orders for store owner's stalls
  async getStoreOwnerOrders(
    ownerId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<StoreOwnerOrdersResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) {
        params.append("status", status);
      }

      console.log("OrderService - Getting store owner orders for ID:", ownerId);
      console.log(
        "OrderService - Request URL:",
        `/orders/store-owner/${ownerId}?${params.toString()}`
      );

      // Check if we have a valid token before making the request
      const tokens =
        typeof window !== "undefined"
          ? {
              accessToken: localStorage.getItem("access_token"),
              refreshToken: localStorage.getItem("refresh_token"),
            }
          : { accessToken: null, refreshToken: null };

      console.log("OrderService - Token status:", {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        tokenPreview: tokens.accessToken
          ? tokens.accessToken.substring(0, 20) + "..."
          : "No token",
      });

      const response = await axiosInstance.get<StoreOwnerOrdersResponse>(
        `/orders/store-owner/${ownerId}?${params.toString()}`
      );

      console.log("OrderService - Store owner orders response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("OrderService - Error getting store owner orders:", error);
      console.error("OrderService - Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          headers: error.config?.headers,
        },
      });
      throw new Error(
        error.response?.data?.message || "Failed to get store owner orders"
      );
    }
  },

  // Get order statistics for store owner
  async getStoreOwnerOrderStats(ownerId: string): Promise<OrderStatistics> {
    try {
      console.log(
        "OrderService - Getting store owner order stats for ID:",
        ownerId
      );

      // Check if we have a valid token before making the request
      const tokens =
        typeof window !== "undefined"
          ? {
              accessToken: localStorage.getItem("access_token"),
              refreshToken: localStorage.getItem("refresh_token"),
            }
          : { accessToken: null, refreshToken: null };

      console.log("OrderService - Token status for stats:", {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
      });

      const response = await axiosInstance.get<OrderStatsResponse>(
        `/orders/store-owner/${ownerId}/stats`
      );

      console.log("OrderService - Store owner stats response:", response.data);
      return response.data.data;
    } catch (error: any) {
      console.error(
        "OrderService - Error getting store owner order stats:",
        error
      );
      console.error("OrderService - Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          headers: error.config?.headers,
        },
      });
      throw new Error(
        error.response?.data?.message ||
          "Failed to get store owner order statistics"
      );
    }
  },
};
