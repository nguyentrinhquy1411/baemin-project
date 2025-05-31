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
      const response = await axiosInstance.get<OrdersResponse>(
        `/orders?page=${page}&limit=${limit}`
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get orders");
    }
  },

  // Get a specific order by ID
  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await axiosInstance.get<OrderResponse>(
        `/orders/${orderId}`
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get order");
    }
  },

  // Update order status
  async updateOrderStatus(
    orderId: string,
    status: UpdateOrderStatusRequest["status"]
  ): Promise<Order> {
    try {
      const response = await axiosInstance.patch<OrderResponse>(
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
};
