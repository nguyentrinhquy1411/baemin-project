import DashboardClient from "./dashboard-client";
import CategoryFoodService from "@/services/category-food";
import CategoryStallService from "@/services/category-stall";
import FoodService from "@/services/food";
import StallService from "@/services/stall";
import BadgesStallService from "@/services/badges-stall";

async function getDashboardData() {
    try {
        // Fetch all data in parallel for better performance
        const [
            stallCategoryResponse, 
            foodCategoryResponse, 
            randomFoodResponse, 
            topRatedStallsResponse,
            // Gọi API cho foods với rating cao
            topRatedFoodResponse,
            // Gọi API cho foods theo category
            categoryFoodResponse,
            // Gọi API cho stalls có badge "Khuyến mãi"
            stallsWithPromotionResponse
        ] = await Promise.all([
            CategoryStallService.getAll({ limit: 10 }),
            CategoryFoodService.getAll({ limit: 10 }),
            FoodService.getRandom(8),
            StallService.getTopRated(8), // Gọi API stall có rating cao
            FoodService.getTopRated(8), // Gọi API food có rating cao
            FoodService.getByCategory(8), // Gọi API food theo category
            BadgesStallService.getStallsByBadge("Giá Cả Phải Chăng", 8) // Gọi API stalls với badge "Khuyến mãi"
        ]);
        
        // Chọn một category từ danh sách trả về để hiển thị
        let specialCategoryFoods = null;
        if (categoryFoodResponse.data && categoryFoodResponse.data.length > 0) {
            // Lấy một category ngẫu nhiên hoặc theo một tiêu chí nào đó
            const randomCategoryIndex = Math.floor(Math.random() * categoryFoodResponse.data.length);
            specialCategoryFoods = categoryFoodResponse.data[randomCategoryIndex];
        }

        return {
            categoryStalls: stallCategoryResponse.data,
            categoryFoods: foodCategoryResponse.data,
            randomFoods: randomFoodResponse.data,
            randomStalls: topRatedStallsResponse.data,
            topRatedFoods: topRatedFoodResponse.data,
            specialCategoryFoods,
            stallsWithPromotions: stallsWithPromotionResponse.data
        };
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        throw new Error('Failed to fetch dashboard data');
    }
}

export default async function Home() {
    try {
        const data = await getDashboardData();
        
        return (
            <DashboardClient 
                categoryStalls={data.categoryStalls}
                categoryFoods={data.categoryFoods}
                randomFoods={data.randomFoods}
                randomStalls={data.randomStalls}
                topRatedFoods={data.topRatedFoods}
                specialCategoryFoods={data.specialCategoryFoods}
                stallsWithPromotions={data.stallsWithPromotions}
            />
        );
    } catch (error) {
        console.error('Dashboard page error:', error);
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Lỗi tải dữ liệu</h2>
                    <p className="text-gray-600">Không thể tải dữ liệu trang chủ. Vui lòng thử lại sau.</p>
                </div>
            </div>
        );
    }
}