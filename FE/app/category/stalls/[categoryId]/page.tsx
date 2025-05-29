"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import StallService, { Stall } from "@/services/stall";
import CategoryStallService, { CategoryStall } from "@/services/category-stall";
import { ChevronLeftIcon, MapPinIcon, StarIcon, ClockIcon } from "@heroicons/react/24/outline";

interface StallsPageProps {}

export default function StallsPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params?.categoryId as string;
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
    
    const [category, setCategory] = useState<CategoryStall | null>(null);
    const [stalls, setStalls] = useState<Stall[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const limit = 12;

    // Fetch category info and initial stalls
    useEffect(() => {
        if (categoryId) {
            fetchCategoryAndStalls();
        }
    }, [categoryId]);

    const fetchCategoryAndStalls = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch category info and stalls in parallel
            const [categoryResponse, stallsResponse] = await Promise.all([
                CategoryStallService.getById(categoryId),
                StallService.getAll({ 
                    categoryId, 
                    page: 1, 
                    limit,
                    isActive: true 
                })
            ]);

            setCategory(categoryResponse.data);
            setStalls(stallsResponse.data);
            setPage(1);
            setHasMore(stallsResponse.meta.page < stallsResponse.meta.totalPages);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const loadMoreStalls = async () => {
        if (loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);
            const nextPage = page + 1;
            
            const response = await StallService.getAll({
                categoryId,
                page: nextPage,
                limit,
                isActive: true
            });

            setStalls(prevStalls => [...prevStalls, ...response.data]);
            setPage(nextPage);
            setHasMore(nextPage < response.meta.totalPages);
        } catch (err) {
            console.error("Error loading more stalls:", err);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleStallClick = (stallId: string) => {
        router.push(`/stall/${stallId}`);
    };    if (loading) {
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
    }    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Đã có lỗi xảy ra</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchCategoryAndStalls}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8"><button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
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
                            <h1 className="text-3xl font-bold text-gray-800">
                                {category?.name || "Danh mục cửa hàng"}
                            </h1>
                            {category?.description && (
                                <p className="text-gray-600 mt-1">{category.description}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                                {stalls.length} cửa hàng
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stalls Grid */}
                {stalls.length === 0 ? (
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
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Chưa có cửa hàng nào
                        </h3>
                        <p className="text-gray-600">
                            Hiện tại chưa có cửa hàng nào trong danh mục này.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {stalls.map((stall) => (
                                <div
                                    key={stall.id}
                                    onClick={() => handleStallClick(stall.id)}
                                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
                                >
                                    <div className="relative">
                                        <div className="h-48 rounded-t-lg overflow-hidden">
                                            <Image
                                                src={stall.image_url || "/images/stall-default.jpg"}
                                                alt={stall.name}
                                                width={300}
                                                height={200}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        {stall.avg_rating && (
                                            <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 shadow-md">
                                                <div className="flex items-center gap-1">
                                                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                                                    <span className="text-sm font-medium">
                                                        {stall.avg_rating.toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                                            {stall.name}
                                        </h3>
                                        
                                        {stall.address && (
                                            <div className="flex items-start gap-2 mb-2">
                                                <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {stall.address}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {(stall.open_time && stall.close_time) && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                                <p className="text-sm text-gray-600">
                                                    {stall.open_time} - {stall.close_time}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {stall._count && (
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span>{stall._count.foods} món ăn</span>
                                                {stall._count.ratings > 0 && (
                                                    <span>{stall._count.ratings} đánh giá</span>
                                                )}
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
                                    onClick={loadMoreStalls}
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
