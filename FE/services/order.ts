import axios from "@/lib/axios";

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
  shipping_fee: number;
  discount_amount: number;
}

export interface Order {
  id: string;
  user_id: string;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivering"
    | "delivered"
    | "cancelled";
  total_amount: number;
  delivery_address: string;
  delivery_phone: string;
  delivery_name: string;
  payment_method: "momo" | "zalopay" | "credit_card" | "cash_on_delivery";
  notes?: string;
  shipping_fee: number;
  discount_amount: number;
  created_at: string;
  updated_at: string;
  order_items: {
    id: string;
    food_id: string;
    stall_id: string;
    quantity: number;
    unit_price: number;
    food_name: string;
    stall_name: string;
  }[];
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
    totalPages: number;
  };
}

export const orderService = {
  // Create a new order
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      const response = await axios.post<OrderResponse>("/orders", orderData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Không thể tạo đơn hàng"
      );
    }
  },

  // Get user's orders with pagination
  async getUserOrders(
    page: number = 1,
    limit: number = 10
  ): Promise<OrdersResponse["data"]> {
    try {
      const response = await axios.get<OrdersResponse>(
        `/orders?page=${page}&limit=${limit}`
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Không thể tải danh sách đơn hàng"
      );
    }
  },

  // Get a specific order by ID
  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await axios.get<OrderResponse>(`/orders/${orderId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Không thể tải thông tin đơn hàng"
      );
    }
  },

  // Update order status (usually for store owners or admin)
  async updateOrderStatus(
    orderId: string,
    status: Order["status"]
  ): Promise<Order> {
    try {
      const response = await axios.patch<OrderResponse>(
        `/orders/${orderId}/status`,
        { status }
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Không thể cập nhật trạng thái đơn hàng"
      );
    }
  },
};
