import axiosInstance from "@/lib/axios";

export interface BadgesStall {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  color?: string;
  stall_id: string;
  created_at: string;
  updated_at: string;
  stall?: {
    id: string;
    name: string;
    image_url?: string;
    address?: string;
  };
}

// Interface cho response pagination
export interface BadgesStallResponse {
  data: BadgesStall[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

// Interface cho single response
export interface BadgesStallSingleResponse {
  data: BadgesStall;
  message: string;
}

// Interface cho query parameters
export interface BadgesStallQuery {
  page?: number;
  limit?: number;
  name?: string;
  stallId?: string;
}

// Service class
const BadgesStallService = {
  // Lấy tất cả badges với pagination và filter
  async getAll(params?: BadgesStallQuery): Promise<BadgesStallResponse> {
    const response = await axiosInstance.get("/badges-stall", { params });
    return response.data;
  },

  // Lấy badge theo ID
  async getById(id: string): Promise<BadgesStallSingleResponse> {
    const response = await axiosInstance.get(`/badges-stall/${id}`);
    return response.data;
  },

  // Lấy badge theo stall ID
  async getByStallId(
    stallId: string,
    params?: { page?: number; limit?: number }
  ): Promise<BadgesStallResponse> {
    const response = await axiosInstance.get(`/badges-stall/stall/${stallId}`, {
      params,
    });
    return response.data;
  },

  // Lấy stalls theo badge name
  async getStallsByBadge(
    badgeName: string,
    limit: number = 8
  ): Promise<{ data: any[]; message: string }> {
    const params = { name: badgeName, limit };
    const response = await axiosInstance.get(`/badges-stall`, { params }); // Lấy stall data từ badges
    const stalls = response.data.data
      .map((badge: any) => badge.stall)
      .filter(Boolean);

    return {
      data: stalls,
      message: `Stalls with badge ${badgeName} retrieved successfully`,
    };
  },
};

export default BadgesStallService;
