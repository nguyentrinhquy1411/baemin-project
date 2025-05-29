"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import StallService, { Stall } from "@/services/stall";
import FoodService, { Food } from "@/services/food";
import RatingService, { Rating } from "@/services/rating";
import { 
    ChevronLeftIcon, 
    StarIcon, 
    MapPinIcon, 
    ClockIcon,
    PhoneIcon,
    UserIcon,
    HeartIcon,
    TagIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

export default function StallDetailPage() {
    const params = useParams();
    const router = useRouter();
    const stallId = params?.stallId as string;
    
    // Return early if no stallId
    if (!stallId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Lỗi tham số</h2>
                    <p className="text-gray-600">Không tìm thấy cửa hàng cần xem.</p>
                </div>
            </div>
        );
    }
      const [stall, setStall] = useState<Stall | null>(null);
    const [foods, setFoods] = useState<Food[]>([]);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (stallId) {
            fetchStallDetails();
        }
    }, [stallId]);    const fetchStallDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch stall details
            const stallResponse = await StallService.getById(stallId);
            setStall(stallResponse.data);
            
            // Fetch foods for this stall
            const foodsResponse = await FoodService.getByStallId(stallId, { limit: 20 });
            setFoods(foodsResponse.data);
            
            // Fetch ratings for this stall
            try {
                const ratingsResponse = await RatingService.getByStallId(stallId);
                setRatings(ratingsResponse.data || []);
            } catch (ratingError) {
                console.log("Ratings not available for this stall");
                setRatings([]);
            }
            
        } catch (err: any) {
            console.error("Error fetching stall details:", err);
            setError(err.response?.data?.message || "Không thể tải thông tin cửa hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleFoodClick = (foodId: string) => {
        router.push(`/detailfood/${foodId}`);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const formatTime = (time: string) => {
        if (!time) return '';
        return time.substring(0, 5); // Format HH:MM
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <StarIconSolid
                key={i}
                className={`w-4 h-4 ${
                    i < rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
            />
        ));
    };    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải thông tin cửa hàng...</p>
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
                        onClick={fetchStallDetails}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (!stall) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy cửa hàng</h2>
                    <p className="text-gray-600">Cửa hàng này có thể đã được gỡ bỏ hoặc không tồn tại.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ChevronLeftIcon className="w-5 h-5 mr-2" />
                        Quay lại
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Stall Information Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Stall Image */}
                    <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
                        {stall.image_url ? (
                            <Image
                                src={stall.image_url}
                                alt={stall.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <div className="text-center">
                                    <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">Không có hình ảnh</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stall Details */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-start justify-between mb-2">
                                <h1 className="text-3xl font-bold text-gray-800">{stall.name}</h1>
                                <button
                                    onClick={() => setIsFavorite(!isFavorite)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    {isFavorite ? (
                                        <HeartIconSolid className="w-6 h-6 text-red-500" />
                                    ) : (
                                        <HeartIcon className="w-6 h-6 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            
                            {/* Category */}
                            {stall.category && (
                                <div className="flex items-center text-orange-600 mb-2">
                                    <TagIcon className="w-4 h-4 mr-1" />
                                    <span className="text-sm font-medium">{stall.category.name}</span>
                                </div>
                            )}

                            {/* Rating */}
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="flex items-center">
                                    {renderStars(Math.round(stall.avg_rating || 0))}
                                </div>
                                <span className="text-lg font-semibold text-gray-800">
                                    {stall.avg_rating?.toFixed(1) || '0.0'}
                                </span>
                                <span className="text-gray-500">
                                    ({stall._count?.ratings || 0} đánh giá)
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        {stall.description && (
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Mô tả</h3>
                                <p className="text-gray-600 leading-relaxed">{stall.description}</p>
                            </div>
                        )}

                        {/* Contact Information */}
                        <div className="space-y-3">
                            {stall.address && (
                                <div className="flex items-start">
                                    <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-600">{stall.address}</span>
                                </div>
                            )}
                            
                            {stall.phone_number && (
                                <div className="flex items-center">
                                    <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                                    <span className="text-gray-600">{stall.phone_number}</span>
                                </div>
                            )}

                            {(stall.open_time || stall.close_time) && (
                                <div className="flex items-center">
                                    <ClockIcon className="w-5 h-5 text-gray-400 mr-3" />
                                    <span className="text-gray-600">
                                        {formatTime(stall.open_time || '')} - {formatTime(stall.close_time || '')}
                                    </span>
                                </div>
                            )}

                            {stall.owner && (
                                <div className="flex items-center">
                                    <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                                    <span className="text-gray-600">Chủ cửa hàng: {stall.owner.username}</span>
                                </div>
                            )}
                        </div>

                        {/* Badges */}
                        {stall.badges && stall.badges.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Huy hiệu</h3>
                                <div className="flex flex-wrap gap-2">
                                    {stall.badges.map((badge) => (
                                        <div key={badge.id} className="flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                                            {badge.image_url && (
                                                <Image
                                                    src={badge.image_url}
                                                    alt={badge.name}
                                                    width={16}
                                                    height={16}
                                                    className="mr-1"
                                                />
                                            )}
                                            {badge.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-800">{stall._count?.foods || 0}</div>
                                <div className="text-sm text-gray-500">Món ăn</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-800">{stall._count?.ratings || 0}</div>
                                <div className="text-sm text-gray-500">Đánh giá</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-800">{stall._count?.badges || 0}</div>
                                <div className="text-sm text-gray-500">Huy hiệu</div>
                            </div>
                        </div>
                    </div>
                </div>                {/* Foods Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Món ăn tại cửa hàng</h2>
                    
                    {foods.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {foods.map((food) => (
                                <div
                                    key={food.id}
                                    onClick={() => handleFoodClick(food.id)}
                                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="relative h-48 bg-gray-200">
                                        {food.image_url ? (
                                            <Image
                                                src={food.image_url}
                                                alt={food.name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-gray-400">Không có hình ảnh</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{food.name}</h3>
                                        <p className="text-lg font-bold text-orange-600">{formatPrice(food.price)}</p>
                                        {food.avg_rating && (
                                            <div className="flex items-center mt-2">
                                                <div className="flex items-center mr-2">
                                                    {renderStars(Math.round(food.avg_rating))}
                                                </div>
                                                <span className="text-sm text-gray-600">{food.avg_rating.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Cửa hàng này chưa có món ăn nào</p>
                        </div>
                    )}
                </div>

                {/* Ratings Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Đánh giá từ khách hàng</h2>
                    
                    {ratings.length > 0 ? (
                        <div className="space-y-4">
                            {ratings.slice(0, 5).map((rating) => (
                                <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center">                                            <div className="flex items-center mr-3">
                                                {renderStars(rating.score)}
                                            </div>
                                            <span className="font-medium text-gray-800">
                                                {rating.user?.username || 'Ẩn danh'}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {new Date(rating.created_at).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    {rating.comment && (
                                        <p className="text-gray-600 mt-2">{rating.comment}</p>
                                    )}
                                </div>
                            ))}
                            
                            {ratings.length > 5 && (
                                <div className="text-center pt-4">
                                    <button className="text-orange-600 hover:text-orange-700 font-medium">
                                        Xem thêm đánh giá
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Chưa có đánh giá nào cho cửa hàng này</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
