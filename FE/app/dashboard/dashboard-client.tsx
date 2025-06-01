"use client";

import ScrollBar from "@/components/scrollBar";
import ScrollFood from "@/components/scrollFood";
import { CategoryFood } from "@/services/category-food";
import { CategoryStall } from "@/services/category-stall";
import { Food, FoodsByCategory } from "@/services/food";
import { Stall } from "@/services/stall";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface DashboardClientProps {
  categoryStalls: CategoryStall[];
  categoryFoods: CategoryFood[];
  randomFoods: Food[];
  randomStalls: Stall[];
  topRatedFoods: Food[];
  specialCategoryFoods: FoodsByCategory | null;
  stallsWithPromotions: Stall[];
}

export default function DashboardClient({
  categoryStalls,
  categoryFoods,
  randomFoods,
  randomStalls,
  topRatedFoods,
  specialCategoryFoods,
  stallsWithPromotions,
}: DashboardClientProps) {
  const router = useRouter();

  // Simple navigation function - loading handled by LoadingProvider
  const navigateWithLoading = (path: string) => {
    router.push(path);
  };

  const banneritems = [
    {
      id: "1",
      name: "anh 1",
      url: "/images/map1.png",
    },
    {
      id: "2",
      name: "anh 2",
      url: "/images/map2.png",
    },
    {
      id: "3",
      name: "anh 32",
      url: "/images/map3.png",
    },
    {
      id: "4",
      name: "anh 32",
      url: "/images/map4.png",
    },
  ];

  const mappingCategoryFood = (categoryFoods: CategoryFood[]) => {
    return {
      title: "Danh mục món ăn",
      items: categoryFoods.map((item) => ({
        id: item.id,
        name: item.name,
        adrress: item.description || "",
        img: item.image_url || "/images/Ga.png",
        kind: item.name,
        onClick: () => router.push(`/category/foods/${item.id}`),
      })),
    };
  };

  const mapRandomFoodsToScrollFood = (foods: Food[]) => {
    return {
      title: "Hôm nay ăn gì?",
      items: foods.map((food) => ({
        id: food.id,
        name: food.name,
        adrress: food?.stall?.address || food.description || "",
        img: food.image_url || "/food/ga1.jpg",
        kind: food?.stall?.name || "Quán ăn",
        rating: food.avg_rating,
        onClick: () => router.push(`/detailfood/${food.id}`),
      })),
    };
  };
  const mapRandomStallsToScrollFood = (stalls: Stall[]) => {
    return {
      title: "Quán ăn nổi bật",
      items: stalls.map((stall) => ({
        id: stall.id,
        name: stall.name,
        adrress: stall.address || stall.description || "",
        img: stall.image_url || "/images/stall-default.jpg",
        kind: stall.category?.name || "Quán ăn",
        rating: stall.avg_rating,
        badge: {
          text: `${stall.avg_rating ? stall.avg_rating.toFixed(1) : "0.0"} ★`,
          color:
            !stall.avg_rating || stall.avg_rating === 0
              ? "bg-gray-400"
              : stall.avg_rating >= 4.5
              ? "bg-red-500"
              : stall.avg_rating >= 4.0
              ? "bg-orange-500"
              : "bg-yellow-500",
        },
        onClick: () => navigateWithLoading(`/stall/${stall.id}`),
      })),
    };
  };
  // Map top rated foods with rating badge
  const mapTopRatedFoodsToScrollFood = (foods: Food[]) => {
    return {
      title: "Món ngon được yêu thích",
      items: foods.map((food) => ({
        id: food.id,
        name: food.name,
        adrress: food?.stall?.address || food.description || "",
        img: food.image_url || "/food/ga1.jpg",
        kind: food?.stall?.name || "Quán ăn",
        rating: food.avg_rating,
        badge: {
          text: `${food.avg_rating ? food.avg_rating.toFixed(1) : "0.0"} ★`,
          color:
            !food.avg_rating || food.avg_rating === 0
              ? "bg-gray-400"
              : food.avg_rating >= 4.5
              ? "bg-red-500"
              : food.avg_rating >= 4.0
              ? "bg-orange-500"
              : "bg-yellow-500",
        },
        onClick: () => navigateWithLoading(`/detailfood/${food.id}`),
      })),
    };
  };

  // Map foods theo category
  const mapCategoryFoodsToScrollFood = (category: FoodsByCategory | null) => {
    if (!category) return { title: "", items: [] };

    return {
      title: `Món ăn ${category.category.name}`,
      items: category.foods.map((food) => ({
        id: food.id,
        name: food.name,
        adrress: food?.stall?.address || food.description || "",
        img: food.image_url || "/food/ga1.jpg",
        kind: food?.stall?.name || "Quán ăn",
        rating: food.avg_rating,
        badge: {
          text: category.category.name,
          color: "bg-green-500",
        },
        onClick: () => navigateWithLoading(`/detailfood/${food.id}`),
      })),
    };
  };

  // Map stalls with promotion badge
  const mapPromotionStallsToScrollFood = (stalls: Stall[]) => {
    return {
      title: "Quán ăn có khuyến mãi",
      items: stalls.map((stall) => ({
        id: stall.id,
        name: stall.name,
        adrress: stall.address || stall.description || "",
        img: stall.image_url || "/images/stall-default.jpg",
        kind: stall.category?.name || "Quán ăn",
        rating: stall.avg_rating,
        badge: {
          text: "Khuyến mãi",
          color: "bg-red-500",
        },
        onClick: () => navigateWithLoading(`/stall/${stall.id}`),
      })),
    };
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-3 pt-3 relative z-40">
          <div className="lg:sticky lg:top-20 bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="mb-3">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Thực đơn</h2>
              <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
            </div>
            {categoryStalls.map((item, index) => (
              <div
                key={index}
                onClick={() => router.push(`/category/stalls/${item.id}`)}
                className="group relative p-3 cursor-pointer rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:shadow-md border border-transparent hover:border-orange-200"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-100 group-hover:ring-orange-200 transition-all duration-300">
                      <Image
                        src={item.image_url || "/images/Ga.png"}
                        width={48}
                        height={48}
                        alt={item.description || item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                      {item.name}
                    </h3>{" "}
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600">{item.description}</p>
                    )}
                    {item._count?.stalls !== undefined && (
                      <span
                        className={`inline-block mt-1 px-2 py-1 text-xs rounded-full transition-all duration-300 ${
                          item._count.stalls === 0
                            ? "bg-red-100 group-hover:bg-red-200 text-red-600 group-hover:text-red-700"
                            : "bg-gray-100 group-hover:bg-orange-100 text-gray-600 group-hover:text-orange-700"
                        }`}
                      >
                        {item._count.stalls === 0 ? "Chưa có cửa hàng" : `${item._count.stalls} cửa hàng`}
                      </span>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-9 pt-3 flex flex-col space-y-6">
          <div style={{ minHeight: "200px" }}>
            <ScrollBar items={banneritems} />
          </div>
          <div className="space-y-8" style={{ minHeight: "200px" }}>
            <ScrollFood items={mapRandomFoodsToScrollFood(randomFoods)} />

            <ScrollFood items={mapRandomStallsToScrollFood(randomStalls)} />
            <ScrollFood items={mapTopRatedFoodsToScrollFood(topRatedFoods)} />

            <ScrollFood items={mapPromotionStallsToScrollFood(stallsWithPromotions)} />

            <ScrollFood items={mapCategoryFoodsToScrollFood(specialCategoryFoods)} />

            <ScrollFood items={mappingCategoryFood(categoryFoods)} />
          </div>
        </div>
      </div>
    </div>
  );
}
