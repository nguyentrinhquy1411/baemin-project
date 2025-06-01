import axiosInstance from "@/lib/axios";

export interface LoginCredentials {
  account: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  user_profiles?: {
    user_id: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    address?: string;
    image_url?: string;
  };
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
}

export const AuthService = {
  // Normal login
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
  },

  // Refresh token
  async refreshToken(token: string): Promise<TokenResponse> {
    const response = await axiosInstance.post("/auth/refresh", {
      refresh_token: token,
    });
    return response.data;
  },
  // Logout
  async logout(token: string): Promise<any> {
    try {
      console.log(
        "AuthService - Calling logout API with token:",
        token.substring(0, 10) + "..."
      );
      const response = await axiosInstance.post("/auth/logout", {
        refresh_token: token,
      });
      console.log("AuthService - Logout API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("AuthService - Logout API error:", error);
      throw error;
    }
  },
  // Get user profile
  async getProfile(): Promise<UserResponse> {
    const response = await axiosInstance.get("/auth/profile");
    return response.data;
  },

  // Update user profile
  async updateProfile(
    userId: string,
    profileData: UpdateProfileData
  ): Promise<UserResponse> {
    const response = await axiosInstance.patch(
      `/users/profile/${userId}`,
      profileData
    );
    return response.data;
  },
  // Save tokens to localStorage (client-side only)
  saveTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
    }
  },

  // Get tokens from localStorage (client-side only)
  getTokens(): { accessToken: string | null; refreshToken: string | null } {
    if (typeof window === "undefined") {
      return { accessToken: null, refreshToken: null };
    }

    return {
      accessToken: localStorage.getItem("access_token"),
      refreshToken: localStorage.getItem("refresh_token"),
    };
  },

  // Clear tokens from localStorage (client-side only)
  clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  },
  // Check if user is authenticated (client-side only)
  isAuthenticated(): boolean {
    if (typeof window === "undefined") {
      return false;
    }
    const accessToken = localStorage.getItem("access_token");
    return !!accessToken;
  },

  // Kiểm tra token có hết hạn hay không
  isTokenExpired(token: string | null): boolean {
    if (!token) return true;

    try {
      // Giải mã JWT (phần payload)
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));

      // Tính thời gian còn lại (ms)
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();

      return now >= exp;
    } catch (error) {
      console.error("AuthService - Error parsing JWT token:", error);
      return true;
    }
  },

  // Giải mã JWT token để lấy thông tin
  decodeToken(token: string | null): any {
    if (!token) return null;

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));
      return payload;
    } catch (error) {
      console.error("AuthService - Error decoding token:", error);
      return null;
    }
  },

  // Lấy thời gian còn lại của token (ms)
  getTokenTimeRemaining(token: string | null): number {
    if (!token) return 0;

    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return 0;

      const expTime = payload.exp * 1000;
      const now = Date.now();

      return Math.max(0, expTime - now);
    } catch (error) {
      return 0;
    }
  },
};
