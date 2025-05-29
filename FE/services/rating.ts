import axiosInstance from "@/lib/axios";

// Interface cho Rating
export interface Rating {
  id: string;
  score: number;
  comment?: string;
  user_id: string;
  food_id: string;
  stall_id: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
  };
  food?: {
    id: string;
    name: string;
    image_url?: string;
  };
  stall?: {
    id: string;
    name: string;
    image_url?: string;
  };
}

// Interface cho response pagination
export interface RatingResponse {
  data: Rating[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

// Interface cho single response
export interface RatingSingleResponse {
  data: Rating;
  message: string;
}

// Interface cho query parameters
export interface RatingQuery {
  page?: number;
  limit?: number;
  userId?: string;
  foodId?: string;
  stallId?: string;
  score?: number;
}

// Interface cho create/update rating
export interface CreateRatingDto {
  score: number;
  comment?: string;
  food_id: string;
  stall_id: string;
}

export interface UpdateRatingDto {
  score?: number;
  comment?: string;
}

// Interface cho rating statistics
export interface RatingStats {
  averageScore: number;
  totalRatings: number;
  distribution: {
    score: number;
    count: number;
  }[];
}

// Service class
const RatingService = {
  // Lấy tất cả ratings với pagination và filter
  async getAll(params?: RatingQuery): Promise<RatingResponse> {
    const response = await axiosInstance.get("/rating", { params });
    return response.data;
  },

  // Lấy rating theo ID
  async getById(id: string): Promise<RatingSingleResponse> {
    const response = await axiosInstance.get(`/rating/${id}`);
    return response.data;
  },

  // Lấy ratings theo food ID
  async getByFoodId(
    foodId: string,
    params?: { page?: number; limit?: number }
  ): Promise<RatingResponse> {
    const queryParams = { ...params, foodId };
    return this.getAll(queryParams);
  },

  // Lấy ratings theo stall ID
  async getByStallId(
    stallId: string,
    params?: { page?: number; limit?: number }
  ): Promise<RatingResponse> {
    const queryParams = { ...params, stallId };
    return this.getAll(queryParams);
  },

  // Lấy ratings theo user ID
  async getByUserId(
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<RatingResponse> {
    const queryParams = { ...params, userId };
    return this.getAll(queryParams);
  },

  // Lấy ratings của user hiện tại
  async getMyRatings(params?: {
    page?: number;
    limit?: number;
  }): Promise<RatingResponse> {
    const response = await axiosInstance.get("/rating/my-ratings", { params });
    return response.data;
  },

  // Tạo rating mới
  async create(data: CreateRatingDto): Promise<RatingSingleResponse> {
    const response = await axiosInstance.post("/rating", data);
    return response.data;
  },

  // Cập nhật rating
  async update(
    id: string,
    data: UpdateRatingDto
  ): Promise<RatingSingleResponse> {
    const response = await axiosInstance.patch(`/rating/${id}`, data);
    return response.data;
  },

  // Xóa rating
  async delete(id: string): Promise<{ message: string }> {
    const response = await axiosInstance.delete(`/rating/${id}`);
    return response.data;
  },

  // Lấy thống kê rating cho food
  async getFoodStats(foodId: string): Promise<RatingStats> {
    const response = await axiosInstance.get(`/rating/food/${foodId}/stats`);
    return response.data;
  },

  // Lấy thống kê rating cho stall
  async getStallStats(stallId: string): Promise<RatingStats> {
    const response = await axiosInstance.get(`/rating/stall/${stallId}/stats`);
    return response.data;
  },

  // Kiểm tra user đã rating chưa
  async checkUserRating(
    foodId: string
  ): Promise<{ hasRated: boolean; rating?: Rating }> {
    const response = await axiosInstance.get(`/rating/check/${foodId}`);
    return response.data;
  },

  // Utility functions
  formatRating(rating: Rating): string {
    return `${rating.score}/5`;
  },

  getStarDisplay(score: number): string {
    return "★".repeat(score) + "☆".repeat(5 - score);
  },

  calculateAverageScore(ratings: Rating[]): number {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
    return Number((sum / ratings.length).toFixed(1));
  },
};

export default RatingService;
