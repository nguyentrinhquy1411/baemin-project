// Service quản lý danh sách yêu thích (Local Storage)
import { Food } from "./food";
import { Stall } from "./stall";

export interface FavoriteItem {
  id: string;
  type: "food" | "stall";
  name: string;
  image_url?: string;
  price?: number;
  address?: string;
  rating?: number;
  addedAt: string;
}

const FAVORITES_KEY = "baemin_favorites";

const FavoritesService = {
  // Lấy danh sách yêu thích
  getFavorites(): FavoriteItem[] {
    try {
      const favorites = localStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error("Error getting favorites:", error);
      return [];
    }
  },

  // Thêm món ăn vào danh sách yêu thích
  addFoodToFavorites(food: Food): boolean {
    try {
      const favorites = this.getFavorites();
      const existingIndex = favorites.findIndex(
        (item) => item.id === food.id && item.type === "food"
      );

      if (existingIndex === -1) {
        const favoriteItem: FavoriteItem = {
          id: food.id,
          type: "food",
          name: food.name,
          image_url: food.image_url,
          price: food.price,
          rating: food.avg_rating,
          addedAt: new Date().toISOString(),
        };
        favorites.push(favoriteItem);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding food to favorites:", error);
      return false;
    }
  },

  // Thêm quán ăn vào danh sách yêu thích
  addStallToFavorites(stall: Stall): boolean {
    try {
      const favorites = this.getFavorites();
      const existingIndex = favorites.findIndex(
        (item) => item.id === stall.id && item.type === "stall"
      );

      if (existingIndex === -1) {
        const favoriteItem: FavoriteItem = {
          id: stall.id,
          type: "stall",
          name: stall.name,
          image_url: stall.image_url,
          address: stall.address,
          rating: stall.avg_rating,
          addedAt: new Date().toISOString(),
        };
        favorites.push(favoriteItem);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding stall to favorites:", error);
      return false;
    }
  },

  // Xóa khỏi danh sách yêu thích
  removeFromFavorites(id: string, type: "food" | "stall"): boolean {
    try {
      const favorites = this.getFavorites();
      const filteredFavorites = favorites.filter(
        (item) => !(item.id === id && item.type === type)
      );
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(filteredFavorites));
      return true;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      return false;
    }
  },

  // Kiểm tra item có trong danh sách yêu thích không
  isFavorite(id: string, type: "food" | "stall"): boolean {
    try {
      const favorites = this.getFavorites();
      return favorites.some((item) => item.id === id && item.type === type);
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }
  },

  // Xóa tất cả yêu thích
  clearFavorites(): boolean {
    try {
      localStorage.removeItem(FAVORITES_KEY);
      return true;
    } catch (error) {
      console.error("Error clearing favorites:", error);
      return false;
    }
  },
};

export default FavoritesService;
