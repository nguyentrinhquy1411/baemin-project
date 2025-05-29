import axiosInstance from "@/lib/axios";

// Interface cho Category Stall
export interface CategoryStall {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  stalls?: {
    id: string;
    name: string;
    image_url?: string;
  }[];
  _count?: {
    stalls: number;
  };
}

// Interface cho response pagination
export interface CategoryStallResponse {
  data: CategoryStall[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

// Interface cho single response
export interface CategoryStallSingleResponse {
  data: CategoryStall;
  message: string;
}

// Interface cho query parameters
export interface CategoryStallQuery {
  page?: number;
  limit?: number;
  name?: string;
}

// Interface cho create/update category stall
export interface CreateCategoryStallDto {
  name: string;
  description?: string;
  image_url?: string;
}

export interface UpdateCategoryStallDto {
  name?: string;
  description?: string;
  image_url?: string;
}

// Service class
const CategoryStallService = {
  // Lấy tất cả category stalls với pagination và filter
  async getAll(params?: CategoryStallQuery): Promise<CategoryStallResponse> {
    const response = await axiosInstance.get("/category-stall", { params });
    return response.data;
  },

  // Lấy category stall theo ID
  async getById(id: string): Promise<CategoryStallSingleResponse> {
    const response = await axiosInstance.get(`/category-stall/${id}`);
    return response.data;
  },

  // Tìm kiếm category stalls theo tên
  async search(
    name: string,
    params?: { page?: number; limit?: number }
  ): Promise<CategoryStallResponse> {
    const searchParams = { ...params, name };
    return this.getAll(searchParams);
  },

  // Lấy các stalls thuộc category (từ response của getById)
  getStallsByCategory(categoryData: CategoryStall) {
    return categoryData.stalls || [];
  },

  // Lấy số lượng stalls trong category
  getStallCount(categoryData: CategoryStall): number {
    return categoryData._count?.stalls || 0;
  },
};

export default CategoryStallService;
