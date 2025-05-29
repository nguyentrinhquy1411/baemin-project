import axiosInstance from "@/lib/axios";

// Interface cho Food
export interface Food {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stall_id: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  avg_rating?: number;
  stall?: {
    id: string;
    name: string;
    image_url?: string;
    address?: string;
    category?: {
      id: string;
      name: string;
    };
  };
  stall_food_category?: Array<{
    id: string;
    food_id: string;
    category_id: string;
    category: {
      id: string;
      name: string;
      description?: string;
      image_url?: string;
    };
  }>;
  _count?: {
    ratings: number;
  };
}

// Interface cho category với foods
export interface FoodsByCategory {
  category: {
    id: string;
    name: string;
  };
  foods: Food[];
}

// Interface cho response pagination
export interface FoodResponse {
  data: Food[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

// Interface cho single response
export interface FoodSingleResponse {
  data: Food;
  message: string;
}

// Interface cho query parameters
export interface FoodQuery {
  page?: number;
  limit?: number;
  name?: string;
  stallId?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  isAvailable?: boolean;
}

// Interface cho create/update food
export interface CreateFoodDto {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stall_id: string;
  category_ids?: string[]; // IDs of food categories
  is_available?: boolean;
}

export interface UpdateFoodDto {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  category_ids?: string[];
  is_available?: boolean;
}

// Service class
const FoodService = {
  // Lấy tất cả food items với pagination và filter
  async getAll(params?: FoodQuery): Promise<FoodResponse> {
    const response = await axiosInstance.get("/food", { params });
    return response.data;
  },

  // Lấy food theo ID
  async getById(id: string): Promise<FoodSingleResponse> {
    const response = await axiosInstance.get(`/food/${id}`);
    return response.data;
  },

  // Lấy food random
  async getRandom(
    limit: number = 5,
    categoryId?: string
  ): Promise<{ data: Food[]; message: string }> {
    const params: { limit: number; categoryId?: string } = { limit };
    if (categoryId) {
      params["categoryId"] = categoryId;
    }
    const response = await axiosInstance.get(`/food/random`, { params });
    return response.data;
  },

  // Lấy food đánh giá cao nhất
  async getTopRated(
    limit: number = 8,
    minRating: number = 3.5
  ): Promise<{ data: Food[]; message: string }> {
    const params = { limit, minRating };
    const response = await axiosInstance.get(`/food/top-rated`, { params });
    return response.data;
  },

  // Lấy food theo category
  async getByCategory(
    limit: number = 8
  ): Promise<{ data: FoodsByCategory[]; message: string }> {
    const params = { limit };
    const response = await axiosInstance.get(`/food/by-category`, { params });
    return response.data;
  },

  // Lấy food theo stall ID
  async getByStallId(
    stallId: string,
    params?: { page?: number; limit?: number; categoryId?: string }
  ): Promise<FoodResponse> {
    const response = await axiosInstance.get(`/food/stall/${stallId}`, {
      params,
    });
    return response.data;
  },

  // Tìm kiếm food theo tên
  async search(name: string, params?: FoodQuery): Promise<FoodResponse> {
    const searchParams = { ...params, name };
    return this.getAll(searchParams);
  },

  // Tạo food mới
  async create(data: CreateFoodDto): Promise<FoodSingleResponse> {
    const response = await axiosInstance.post("/food", data);
    return response.data;
  },

  // Cập nhật food
  async update(id: string, data: UpdateFoodDto): Promise<FoodSingleResponse> {
    const response = await axiosInstance.patch(`/food/${id}`, data);
    return response.data;
  },

  // Xóa food
  async delete(id: string): Promise<any> {
    const response = await axiosInstance.delete(`/food/${id}`);
    return response.data;
  },

  // Chuyển đổi trạng thái available
  async toggleAvailability(id: string): Promise<FoodSingleResponse> {
    const response = await axiosInstance.patch(
      `/food/${id}/toggle-availability`
    );
    return response.data;
  },
};

export default FoodService;
