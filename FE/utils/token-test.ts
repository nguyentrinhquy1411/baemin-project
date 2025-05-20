// utils/token-test.ts
import axiosInstance from "@/lib/axios";
import { AuthService } from "@/services/auth";

/**
 * Hàm này được sử dụng để kiểm tra cơ chế làm mới token tự động
 * - Gọi liên tục một API được bảo vệ để xem token có được làm mới không
 * - In ra các thông tin về access token hiện tại
 */
export async function testTokenRefresh() {
  // Chỉ chạy ở client side
  if (typeof window === "undefined") return;

  console.log("=== TOKEN REFRESH TEST STARTED ===");

  // Lấy thời gian hiện tại
  const startTime = new Date();
  console.log(`Test started at: ${startTime.toISOString()}`);

  // Giải mã token hiện tại
  const initialToken = localStorage.getItem("access_token");
  if (!initialToken) {
    console.log("No access token found. Please log in first.");
    return;
  }

  try {
    // Giải mã và hiển thị thông tin token ban đầu
    const payload = AuthService.decodeToken(initialToken);
    const expTime = new Date(payload.exp * 1000);
    console.log(`Initial token expires at: ${expTime.toISOString()}`);
    console.log(
      `Time until expiry: ${AuthService.getTokenTimeRemaining(initialToken)} ms`
    );
    console.log(`Token subject (user ID): ${payload.sub}`);

    // Thiết lập một interval để gọi API định kỳ
    let callCount = 0;
    let refreshCount = 0;
    let failCount = 0;
    const testInterval = setInterval(async () => {
      callCount++;
      console.log(
        `\n--- API call #${callCount} at ${new Date().toTimeString()} ---`
      );

      try {
        // Kiểm tra thời gian còn lại trước khi gọi API
        const tokenBeforeCall = localStorage.getItem("access_token");
        const remainingTimeBeforeCall =
          AuthService.getTokenTimeRemaining(tokenBeforeCall);
        console.log(
          `Token time remaining before API call: ${(
            remainingTimeBeforeCall / 1000
          ).toFixed(1)}s`
        );

        // Gọi một API protected để kiểm tra token
        const response = await axiosInstance.get("/auth/profile");
        console.log(`✅ API call successful: User ID = ${response.data.id}`);

        // Kiểm tra xem token có được làm mới không
        const currentToken = localStorage.getItem("access_token");
        if (currentToken !== initialToken && currentToken !== tokenBeforeCall) {
          refreshCount++;
          console.log(
            `🔄 Token has been refreshed! (Refresh #${refreshCount})`
          );

          // Giải mã token mới
          const newPayload = AuthService.decodeToken(currentToken);
          const newExpTime = new Date(newPayload.exp * 1000);
          console.log(`New token expires at: ${newExpTime.toISOString()}`);
          console.log(
            `Time until expiry: ${(
              AuthService.getTokenTimeRemaining(currentToken) / 1000
            ).toFixed(1)}s`
          );
        } else {
          // Kiểm tra thời gian còn lại sau khi gọi API
          const remainingTimeAfterCall =
            AuthService.getTokenTimeRemaining(currentToken);
          console.log(
            `Token time remaining after API call: ${(
              remainingTimeAfterCall / 1000
            ).toFixed(1)}s`
          );

          if (remainingTimeAfterCall > remainingTimeBeforeCall) {
            refreshCount++;
            console.log(
              `🔄 Token has been refreshed during API call! (Refresh #${refreshCount})`
            );
          }
        }
      } catch (error: any) {
        failCount++;
        console.error(`❌ API call failed: ${error.message}`);

        // Kiểm tra xem token có được làm mới sau lỗi không
        setTimeout(() => {
          const tokenAfterError = localStorage.getItem("access_token");
          if (tokenAfterError !== initialToken) {
            console.log(`🔄 Token was refreshed after error!`);
            const newPayload = AuthService.decodeToken(tokenAfterError);
            const newExpTime = new Date(newPayload.exp * 1000);
            console.log(`New token expires at: ${newExpTime.toISOString()}`);
          }
        }, 1000);
      }

      // Dừng test sau 10 lần gọi hoặc khi có 3 lần refresh thành công
      if (callCount >= 10 || refreshCount >= 3) {
        clearInterval(testInterval);
        console.log("\n=== TOKEN REFRESH TEST COMPLETED ===");
        console.log(`Total API calls: ${callCount}`);
        console.log(`Successful refreshes: ${refreshCount}`);
        console.log(`Failed calls: ${failCount}`);
        console.log(
          `Test duration: ${(
            (new Date().getTime() - startTime.getTime()) /
            1000
          ).toFixed(1)}s`
        );
      }
    }, 3000); // Gọi API mỗi 3 giây

    return () => clearInterval(testInterval);
  } catch (error) {
    console.error("Error in token test:", error);
  }
}

export default testTokenRefresh;
