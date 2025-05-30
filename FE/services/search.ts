import axiosInstance from "@/lib/axios";
import { Food, FoodResponse } from "./food";
import { Stall, StallResponse } from "./stall";

// Interface cho tìm kiếm
export interface SearchFilters {
  keyword?: string;
  type?: "all" | "food" | "stall";
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "name" | "price" | "rating" | "created_at";
  sortOrder?: "asc" | "desc";
}

// Interface cho kết quả tìm kiếm
export interface SearchResult {
  foods: {
    data: Food[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  stalls: {
    data: Stall[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  total: number;
  keyword: string;
}

// Interface cho gợi ý tìm kiếm
export interface SearchSuggestion {
  id: string;
  name: string;
  type: "food" | "stall";
  image_url?: string;
  category?: string;
}

// Service tìm kiếm
const SearchService = {
  // Tìm kiếm tổng hợp (cả food và stall)
  async search(filters: SearchFilters): Promise<SearchResult> {
    try {
      const response = await axiosInstance.get("/search", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  },

  // Lấy gợi ý tìm kiếm (autocomplete)
  async getSuggestions(
    keyword: string,
    limit: number = 5
  ): Promise<SearchSuggestion[]> {
    if (!keyword || keyword.trim().length < 2) {
      return [];
    }

    try {
      const response = await axiosInstance.get("/search/suggestions", {
        params: { keyword, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Get suggestions error:", error);
      return [];
    }
  },

  // Lấy từ khóa phổ biến
  async getPopularKeywords(): Promise<string[]> {
    try {
      const response = await axiosInstance.get("/search/popular-keywords");
      return response.data;
    } catch (error) {
      console.error("Get popular keywords error:", error);
      // Fallback to default keywords
      return [
        "Cơm tấm",
        "Phở",
        "Bánh mì",
        "Bún bò Huế",
        "Trà sữa",
        "Pizza",
        "Sushi",
        "Lẩu",
        "Nướng",
        "Chay",
      ];
    }
  },

  // Lưu lịch sử tìm kiếm (local storage)
  saveSearchHistory(keyword: string) {
    if (!keyword || keyword.trim().length < 2) return;

    try {
      const history = this.getSearchHistory();
      const newHistory = [
        keyword,
        ...history.filter((k) => k !== keyword),
      ].slice(0, 10);
      localStorage.setItem("search_history", JSON.stringify(newHistory));
    } catch (error) {
      console.error("Save search history error:", error);
    }
  },

  // Lấy lịch sử tìm kiếm
  getSearchHistory(): string[] {
    try {
      const history = localStorage.getItem("search_history");
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error("Get search history error:", error);
      return [];
    }
  },

  // Xóa lịch sử tìm kiếm
  clearSearchHistory() {
    try {
      localStorage.removeItem("search_history");
    } catch (error) {
      console.error("Clear search history error:", error);
    }
  },
};

export default SearchService;
