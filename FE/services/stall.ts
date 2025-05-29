import axiosInstance from "@/lib/axios";

// Interface cho Stall
export interface Stall {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  address?: string;
  phone_number?: string;
  owner_id: string;
  category_id: string;
  is_active: boolean;
  open_time?: string;
  close_time?: string;
  created_at: string;
  updated_at: string;
  avg_rating?: number;
  category?: {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
  };
  owner?: {
    id: string;
    username: string;
    email: string;
  };
  badges?: Array<{
    id: string;
    name: string;
    description?: string;
    image_url?: string;
  }>;
  _count?: {
    foods: number;
    ratings: number;
    badges: number;
  };
}

// Interface cho response pagination
export interface StallResponse {
  data: Stall[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

// Interface cho single response
export interface StallSingleResponse {
  data: Stall;
  message: string;
}

// Interface cho random response
export interface StallRandomResponse {
  data: Stall[];
  message: string;
}

// Interface cho query parameters
export interface StallQuery {
  page?: number;
  limit?: number;
  name?: string;
  categoryId?: string;
  isActive?: boolean;
}

// Interface cho create/update stall
export interface CreateStallDto {
  name: string;
  description?: string;
  image_url?: string;
  address?: string;
  phone_number?: string;
  category_id: string;
  open_time?: string;
  close_time?: string;
  is_active?: boolean;
}

export interface UpdateStallDto {
  name?: string;
  description?: string;
  image_url?: string;
  address?: string;
  phone_number?: string;
  category_id?: string;
  open_time?: string;
  close_time?: string;
  is_active?: boolean;
}

// Service class
const StallService = {
  // Lấy tất cả stalls với pagination và filter
  async getAll(params?: StallQuery): Promise<StallResponse> {
    const response = await axiosInstance.get("/stall", { params });
    return response.data;
  },

  // Lấy stall theo ID
  async getById(id: string): Promise<StallSingleResponse> {
    const response = await axiosInstance.get(`/stall/${id}`);
    return response.data;
  },
  
  // Lấy stall random
  async getRandom(
    limit: number = 5,
    categoryId?: string
  ): Promise<{ data: Stall[]; message: string }> {
    const params: { limit: number; categoryId?: string } = { limit };
    if (categoryId) {
      params["categoryId"] = categoryId;
    }
    const response = await axiosInstance.get(`/stall/random`, { params });
    return response.data;
  },

  // Lấy stall được đánh giá cao nhất
  async getTopRated(
    limit: number = 8,
    minRating: number = 3.5
  ): Promise<{ data: Stall[]; message: string }> {
    const params = { limit, minRating };
    const response = await axiosInstance.get(`/stall/top-rated`, { params });
    return response.data;
  },

  // Tìm kiếm stalls theo tên
  async search(name: string, params?: StallQuery): Promise<StallResponse> {
    const searchParams = { ...params, name };
    return this.getAll(searchParams);
  },

  // Lấy stalls của người dùng hiện tại
  async getMyStalls(params?: { page?: number; limit?: number }): Promise<StallResponse> {
    const response = await axiosInstance.get("/stall/my-stalls", { params });
    return response.data;
  },

  // Tạo stall mới
  async create(data: CreateStallDto): Promise<StallSingleResponse> {
    const response = await axiosInstance.post("/stall", data);
    return response.data;
  },

  // Cập nhật stall
  async update(id: string, data: UpdateStallDto): Promise<StallSingleResponse> {
    const response = await axiosInstance.patch(`/stall/${id}`, data);
    return response.data;
  },

  // Xóa stall
  async delete(id: string): Promise<any> {
    const response = await axiosInstance.delete(`/stall/${id}`);
    return response.data;
  },

  // Chuyển đổi trạng thái active
  async toggleActive(id: string): Promise<StallSingleResponse> {
    const response = await axiosInstance.patch(`/stall/${id}/toggle-active`);
    return response.data;
  },
};

export default StallService;
