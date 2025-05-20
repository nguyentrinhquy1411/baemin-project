import axios from "axios";
import { AuthService } from "@/services/auth";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];
let tokenRefreshInterval: NodeJS.Timeout | null = null;

// Kiểm tra token có hết hạn hay không
function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  try {
    // Giải mã JWT (phần payload)
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64));

    // Tính thời gian còn lại (ms)
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeRemaining = exp - now;

    // Nếu còn dưới 5 giây, coi như sắp hết hạn
    return timeRemaining < 5000;
  } catch (error) {
    console.error("Error parsing JWT token:", error);
    return true;
  }
}

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Hàm chủ động làm mới token trước khi hết hạn
async function refreshTokenProactively(): Promise<boolean> {
  // Skip nếu không ở client side hoặc đã có request refresh đang chạy
  if (typeof window === "undefined" || isRefreshing) {
    return false;
  }

  const { accessToken, refreshToken } = AuthService.getTokens();

  // Nếu không có token hoặc token chưa gần hết hạn
  if (!accessToken || !refreshToken) {
    return false;
  }

  console.log("🔄 Chủ động làm mới token trước khi hết hạn");
  isRefreshing = true;

  try {
    const response = await AuthService.refreshToken(refreshToken);
    const { access_token, refresh_token } = response;

    console.log("✅ Làm mới token thành công");
    // Lưu thời gian làm mới token gần nhất
    const lastRefreshed = new Date().toISOString();
    localStorage.setItem("token_last_refreshed", lastRefreshed);

    AuthService.saveTokens(access_token, refresh_token);
    axiosInstance.defaults.headers.Authorization = `Bearer ${access_token}`;
    return true;
  } catch (error) {
    console.error("❌ Làm mới token thất bại:", error);

    // Kiểm tra nếu lỗi 401 hoặc 403, có thể token hết hạn hoàn toàn
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      console.log("⚠️ Refresh token không hợp lệ, đăng xuất người dùng");
      AuthService.clearTokens();
      // Chuyển hướng về trang đăng nhập nếu ở client side
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return false;
  } finally {
    isRefreshing = false;
  }
}

axiosInstance.interceptors.request.use(
  async (config) => {
    // Bỏ qua các endpoint không cần xác thực
    const skipAuthEndpoints = [
      "/auth/login",
      "/auth/refresh",
      "/auth/register",
      "/auth/google",
    ];
    const isAuthEndpoint = skipAuthEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (typeof window !== "undefined" && !isAuthEndpoint) {
      // Lấy token hiện tại
      const { accessToken, refreshToken } = AuthService.getTokens();

      // Kiểm tra token
      if (accessToken) {
        // Kiểm tra nếu token sắp hết hạn, làm mới nó trước khi gửi request
        if (isTokenExpired(accessToken) && refreshToken) {
          console.log(
            "🔑 Token sắp hết hạn, đang làm mới trước khi gửi request"
          );
          const refreshed = await refreshTokenProactively();
          if (refreshed) {
            // Nếu làm mới thành công, cập nhật token cho request hiện tại
            const { accessToken: newToken } = AuthService.getTokens();
            config.headers.Authorization = `Bearer ${newToken}`;
            console.log("🔐 Đã cập nhật token mới cho request");
          } else {
            // Nếu không làm mới được, vẫn dùng token cũ
            config.headers.Authorization = `Bearer ${accessToken}`;
            console.log("⚠️ Không thể làm mới token, dùng token cũ");
          }
        } else {
          // Token còn hạn, sử dụng bình thường
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const { refreshToken } = AuthService.getTokens();
      if (!refreshToken) {
        processQueue(new Error("No refresh token available"));
        return Promise.reject(error);
      }
      try {
        const response = await AuthService.refreshToken(refreshToken);
        const { access_token, refresh_token } = response;
        AuthService.saveTokens(access_token, refresh_token);
        processQueue(null, access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Thiết lập timer để kiểm tra và làm mới token định kỳ
function setupTokenRefreshTimer() {
  // Hủy timer cũ nếu có
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
  }

  // Kiểm tra token mỗi 3 giây
  // (thời gian này nhỏ hơn 10s để đảm bảo kịp làm mới trước khi hết hạn)
  tokenRefreshInterval = setInterval(async () => {
    const { accessToken } = AuthService.getTokens();
    if (accessToken && isTokenExpired(accessToken)) {
      console.log("⏱️ Timer kiểm tra: Token sắp hết hạn, đang làm mới...");
      await refreshTokenProactively();
    }
  }, 3000);

  console.log("⏰ Timer kiểm tra token đã được thiết lập");
}

// Khởi động cơ chế kiểm tra token tự động nếu đang ở client-side
if (typeof window !== "undefined") {
  setTimeout(() => {
    setupTokenRefreshTimer();
  }, 1000); // Delay 1 giây để đảm bảo các module khác đã load xong
}

export default axiosInstance;
