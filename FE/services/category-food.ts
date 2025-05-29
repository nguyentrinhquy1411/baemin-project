import axiosInstance from "@/lib/axios";

// Interface cho Category Food
export interface CategoryFood {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

// Interface cho response pagination
export interface CategoryFoodResponse {
  data: CategoryFood[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface cho query parameters
export interface CategoryFoodQuery {
  page?: number;
  limit?: number;
  name?: string;
}

// Interface cho create/update category food
export interface CreateCategoryFoodDto {
  name: string;
  description?: string;
  image_url?: string;
}

export interface UpdateCategoryFoodDto {
  name?: string;
  description?: string;
  image_url?: string;
}

export class CategoryFoodService {
  private static baseUrl = "/category-food";

  /**
   * Lấy danh sách tất cả category food với phân trang và filter
   * @param query - Query parameters (page, limit, name)
   * @returns Promise<CategoryFoodResponse>
   */
  static async getAll(
    query?: CategoryFoodQuery
  ): Promise<CategoryFoodResponse> {
    try {
      const params = new URLSearchParams();

      if (query?.page) {
        params.append("page", query.page.toString());
      }

      if (query?.limit) {
        params.append("limit", query.limit.toString());
      }

      if (query?.name) {
        params.append("name", query.name);
      }

      const url = `${this.baseUrl}${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await axiosInstance.get<CategoryFoodResponse>(url);

      return response.data;
    } catch (error) {
      console.error("Error fetching category foods:", error);
      throw error;
    }
  }

  /**
   * Lấy thông tin chi tiết một category food theo ID
   * @param id - Category food ID
   * @returns Promise<CategoryFood>
   */
  static async getById(id: string): Promise<CategoryFood> {
    try {
      const response = await axiosInstance.get<CategoryFood>(
        `${this.baseUrl}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching category food with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Tạo mới category food (yêu cầu authentication)
   * @param data - Dữ liệu category food mới
   * @returns Promise<CategoryFood>
   */
  static async create(data: CreateCategoryFoodDto): Promise<CategoryFood> {
    try {
      const response = await axiosInstance.post<CategoryFood>(
        this.baseUrl,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating category food:", error);
      throw error;
    }
  }

  /**
   * Cập nhật category food (yêu cầu authentication)
   * @param id - Category food ID
   * @param data - Dữ liệu cập nhật
   * @returns Promise<CategoryFood>
   */
  static async update(
    id: string,
    data: UpdateCategoryFoodDto
  ): Promise<CategoryFood> {
    try {
      const response = await axiosInstance.patch<CategoryFood>(
        `${this.baseUrl}/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating category food with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Xóa category food (yêu cầu authentication)
   * @param id - Category food ID
   * @returns Promise<void>
   */
  static async delete(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting category food with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Lấy danh sách category food không phân trang (dành cho dropdown/select)
   * @returns Promise<CategoryFood[]>
   */
  static async getAllSimple(): Promise<CategoryFood[]> {
    try {
      const response = await this.getAll({ limit: 1000 }); // Lấy tối đa 1000 records
      return response.data;
    } catch (error) {
      console.error("Error fetching simple category foods:", error);
      throw error;
    }
  }

  /**
   * Tìm kiếm category food theo tên
   * @param name - Tên category cần tìm
   * @returns Promise<CategoryFood[]>
   */
  static async searchByName(name: string): Promise<CategoryFood[]> {
    try {
      const response = await this.getAll({ name, limit: 50 });
      return response.data;
    } catch (error) {
      console.error(
        `Error searching category foods with name "${name}":`,
        error
      );
      throw error;
    }
  }
}

// Export default service
export default CategoryFoodService;
