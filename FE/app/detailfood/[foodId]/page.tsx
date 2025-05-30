"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import FoodService, { Food } from "@/services/food";
import RatingService, { Rating } from "@/services/rating";
import FavoritesService from "@/services/favorites";
import { useAuth } from "@/contexts/auth-context";
import { message } from "antd";
import { 
    ChevronLeftIcon, 
    StarIcon, 
    MapPinIcon, 
    ClockIcon,
    PlusIcon,
    MinusIcon,
    ShoppingCartIcon,
    HeartIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

export default function FoodDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();
    const foodId = params?.foodId as string;
    
    // Return early if no foodId
    if (!foodId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Lỗi tham số</h2>
                    <p className="text-gray-600">Không tìm thấy món ăn cần xem.</p>
                </div>
            </div>
        );
    }
    
    const [food, setFood] = useState<Food | null>(null);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);    useEffect(() => {
        if (foodId) {
            fetchFoodDetails();
            checkFavoriteStatus();
        }
    }, [foodId]);

    const checkFavoriteStatus = () => {
        if (isAuthenticated && foodId) {
            setIsFavorite(FavoritesService.isFavorite(foodId, 'food'));
        }
    };

    const fetchFoodDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [foodResponse, ratingsResponse] = await Promise.all([
                FoodService.getById(foodId),
                RatingService.getByFoodId(foodId, { page: 1, limit: 10 })
            ]);

            setFood(foodResponse.data);
            setRatings(ratingsResponse.data || []);
        } catch (err) {
            console.error("Error fetching food details:", err);
            setError("Không thể tải thông tin món ăn. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (change: number) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        // TODO: Implement add to cart functionality
        console.log(`Adding ${quantity} of ${food?.name} to cart`);
    };    const handleToggleFavorite = () => {
        if (!isAuthenticated) {
            messageApi.warning('Vui lòng đăng nhập để sử dụng tính năng yêu thích');
            return;
        }

        if (!food) return;        try {
            if (isFavorite) {
                FavoritesService.removeFromFavorites(foodId, 'food');
                setIsFavorite(false);
                messageApi.success('Đã xóa khỏi danh sách yêu thích');
            } else {
                FavoritesService.addFoodToFavorites({
                    id: food.id,
                    name: food.name,
                    image_url: food.image_url,
                    price: food.price,
                    stall_id: food.stall_id,
                    description: food.description,
                    is_available: food.is_available,
                    created_at: food.created_at,
                    updated_at: food.updated_at
                });
                setIsFavorite(true);
                messageApi.success('Đã thêm vào danh sách yêu thích');
            }
        } catch (error) {
            messageApi.error('Có lỗi xảy ra. Vui lòng thử lại');
        }
    };

    const handleStallClick = () => {
        if (food?.stall?.id) {
            router.push(`/stall/${food.stall.id}`);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
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
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="h-96 bg-gray-200 rounded-lg"></div>
                            <div className="space-y-4">
                                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-20 bg-gray-200 rounded"></div>
                            </div>
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
                        onClick={fetchFoodDetails}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (!food) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy món ăn</h2>
                    <p className="text-gray-600">Món ăn bạn đang tìm không tồn tại.</p>
                </div>
            </div>
        );
    }    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {contextHolder}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <div className="text-sm text-gray-500">
                        <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => router.push('/dashboard')}>
                            Trang chủ
                        </span>
                        <span className="mx-2">›</span>
                        <span className="text-blue-600 hover:underline cursor-pointer" onClick={handleStallClick}>
                            {food.stall?.name}
                        </span>
                        <span className="mx-2">›</span>
                        <span>{food.name}</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Image Section */}
                    <div className="space-y-4">
                        <div className="relative h-96 rounded-lg overflow-hidden bg-white shadow-md">
                            <Image
                                src={food.image_url || "/food/ga1.jpg"}
                                alt={food.name}
                                fill
                                className="object-cover"
                            />
                            {!food.is_available && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">Hết hàng</span>
                                </div>
                            )}
                            <button
                                onClick={handleToggleFavorite}
                                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                            >
                                {isFavorite ? (
                                    <HeartIconSolid className="w-6 h-6 text-red-500" />
                                ) : (
                                    <HeartIcon className="w-6 h-6 text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{food.name}</h1>
                            
                            {/* Rating */}
                            {food.avg_rating && (
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center gap-1">
                                        {renderStars(Math.round(food.avg_rating))}
                                    </div>
                                    <span className="text-lg font-semibold text-gray-700">
                                        {food.avg_rating.toFixed(1)}
                                    </span>
                                    {food._count?.ratings && (
                                        <span className="text-gray-500">
                                            ({food._count.ratings} đánh giá)
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Price */}
                            <div className="text-3xl font-bold text-orange-600 mb-4">
                                {formatPrice(food.price)}
                            </div>

                            {/* Description */}
                            {food.description && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Mô tả món ăn</h3>
                                    <p className="text-gray-600 leading-relaxed">{food.description}</p>
                                </div>
                            )}

                            {/* Categories */}
                            {food.stall_food_category && food.stall_food_category.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Danh mục</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {food.stall_food_category.map((cat) => (
                                            <span
                                                key={cat.id}
                                                className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                                            >
                                                {cat.category.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quantity and Add to Cart */}
                        {food.is_available && (
                            <div className="bg-white rounded-lg p-6 shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-semibold text-gray-800">Số lượng:</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                            className="p-2 border rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <MinusIcon className="w-4 h-4" />
                                        </button>
                                        <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            className="p-2 border rounded-full hover:bg-gray-50"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-semibold text-gray-800">Tổng cộng:</span>
                                    <span className="text-xl font-bold text-orange-600">
                                        {formatPrice(food.price * quantity)}
                                    </span>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ShoppingCartIcon className="w-5 h-5" />
                                    Thêm vào giỏ hàng
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stall Info */}
                {food.stall && (
                    <div className="bg-white rounded-lg p-6 shadow-md mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin quán</h2>
                        <div 
                            onClick={handleStallClick}
                            className="flex items-start gap-4 cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors"
                        >
                            {food.stall.image_url && (
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        src={food.stall.image_url}
                                        alt={food.stall.name}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-800 mb-1">{food.stall.name}</h3>
                                {food.stall.address && (
                                    <div className="flex items-start gap-2 mb-2">
                                        <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-gray-600">{food.stall.address}</p>
                                    </div>
                                )}
                                <div className="text-sm text-blue-600 hover:underline">
                                    Xem thêm món ăn từ quán này →
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reviews */}
                {ratings.length > 0 && (
                    <div className="bg-white rounded-lg p-6 shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Đánh giá ({ratings.length})
                        </h2>
                        <div className="space-y-4">
                            {ratings.slice(0, 5).map((rating) => (
                                <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                            <span className="text-orange-600 font-semibold">
                                                {rating.user?.username?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-800">
                                                    {rating.user?.username || 'Người dùng ẩn danh'}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {renderStars(rating.score)}
                                                </div>
                                            </div>
                                            {rating.comment && (
                                                <p className="text-gray-600">{rating.comment}</p>
                                            )}
                                            <span className="text-sm text-gray-400">
                                                {new Date(rating.created_at).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {ratings.length > 5 && (
                            <button className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                                Xem thêm đánh giá
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
