"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import FoodService, { Food } from "@/services/food";
import CategoryFoodService, { CategoryFood } from "@/services/category-food";
import { ChevronLeftIcon, StarIcon, MapPinIcon } from "@heroicons/react/24/outline";

interface FoodsPageProps {}

export default function FoodsPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params?.categoryId as string;

  const [category, setCategory] = useState<CategoryFood | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 12;

  const fetchCategoryAndFoods = useCallback(async () => {
    if (!categoryId) return;
    try {
      setLoading(true);
      setError(null);
      // Fetch category info and foods in parallel
      const [categoryResponse, foodsResponse] = await Promise.all([
        CategoryFoodService.getById(categoryId),
        FoodService.getAll({
          categoryId,
          page: 1,
          limit,
          isAvailable: true,
        }),
      ]);

      setCategory(categoryResponse);
      setFoods(foodsResponse.data);
      setPage(1);
      setHasMore(foodsResponse.meta.page < foodsResponse.meta.totalPages);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [categoryId, limit]);

  // Fetch category info and initial foods
  useEffect(() => {
    fetchCategoryAndFoods();
  }, [fetchCategoryAndFoods]);

  // Return early if no categoryId
  if (!categoryId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Lỗi tham số</h2>
          <p className="text-gray-600">Không tìm thấy danh mục cần tìm.</p>
        </div>
      </div>
    );
  }

  const loadMoreFoods = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;

      const response = await FoodService.getAll({
        categoryId,
        page: nextPage,
        limit,
        isAvailable: true,
      });

      setFoods((prevFoods) => [...prevFoods, ...response.data]);
      setPage(nextPage);
      setHasMore(nextPage < response.meta.totalPages);
    } catch (err) {
      console.error("Error loading more foods:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFoodClick = (foodId: string) => {
    router.push(`/detailfood/${foodId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Đã có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCategoryAndFoods}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-4">
            {category?.image_url && (
              <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-orange-100">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{category?.name || "Danh mục món ăn"}</h1>
              {category?.description && <p className="text-gray-600 mt-1">{category.description}</p>}
              <p className="text-sm text-gray-500 mt-1">{foods.length} món ăn</p>
            </div>
          </div>
        </div>

        {/* Foods Grid */}
        {foods.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 opacity-50">
              <Image
                src="/images/empty-state.png"
                alt="Không có dữ liệu"
                width={96}
                height={96}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có món ăn nào</h3>
            <p className="text-gray-600">Hiện tại chưa có món ăn nào trong danh mục này.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {foods.map((food) => (
                <div
                  key={food.id}
                  onClick={() => handleFoodClick(food.id)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative">
                    {" "}
                    <div className="h-48 rounded-t-lg overflow-hidden">
                      <Image
                        src={food.image_url || "/food/ga1.jpg"}
                        alt={food.name}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 shadow-md">
                      <div className="flex items-center gap-1">
                        <StarIcon
                          className={`w-4 h-4 ${
                            food.avg_rating && food.avg_rating > 0 ? "text-yellow-400" : "text-gray-300"
                          } fill-current`}
                        />
                        <span className="text-sm font-medium">
                          {food.avg_rating ? food.avg_rating.toFixed(1) : "0.0"}
                        </span>
                      </div>
                    </div>
                    {!food.is_available && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
                        <span className="text-white font-semibold">Hết hàng</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {food.name}
                    </h3>

                    {food.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{food.description}</p>}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-orange-600">{formatPrice(food.price)}</span>
                      {food._count?.ratings !== undefined && (
                        <span className={`text-sm ${food._count.ratings === 0 ? "text-gray-400" : "text-gray-500"}`}>
                          {food._count.ratings === 0 ? "Chưa có đánh giá" : `${food._count.ratings} đánh giá`}
                        </span>
                      )}
                    </div>

                    {food.stall && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{food.stall.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMoreFoods}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingMore ? "Đang tải..." : "Xem thêm"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
