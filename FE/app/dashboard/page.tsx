"use client";

import ScrollBar from "@/components/scrollBar";
import ScrollFood from "@/components/scrollFood";
import CategoryFoodService, { CategoryFood } from "@/services/category-food";
import CategoryStallService, { CategoryStall } from "@/services/category-stall";
import FoodService, { Food, FoodsByCategory } from "@/services/food";
import StallService, { Stall } from "@/services/stall";
import BadgesStallService, { BadgesStall } from "@/services/badges-stall";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function Home() {
    const [categoryStalls, setCategoryStalls] = useState<CategoryStall[]>([]);
    const [categoryFoods, setCategoryFoods] = useState<CategoryFood[]>([]);
    const [randomFoods, setRandomFoods] = useState<Food[]>([]);
    const [randomStalls, setRandomStalls] = useState<Stall[]>([]);
    const [topRatedFoods, setTopRatedFoods] = useState<Food[]>([]);
    const [specialCategoryFoods, setSpecialCategoryFoods] = useState<FoodsByCategory | null>(null);
    const [stallsWithPromotions, setStallsWithPromotions] = useState<Stall[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch dữ liệu từ API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
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
                
                setCategoryStalls(stallCategoryResponse.data);
                setCategoryFoods(foodCategoryResponse.data);
                setRandomFoods(randomFoodResponse.data);
                setRandomStalls(topRatedStallsResponse.data);
                setTopRatedFoods(topRatedFoodResponse.data);
                
                // Chọn một category từ danh sách trả về để hiển thị
                if (categoryFoodResponse.data && categoryFoodResponse.data.length > 0) {
                    // Lấy một category ngẫu nhiên hoặc theo một tiêu chí nào đó
                    const randomCategoryIndex = Math.floor(Math.random() * categoryFoodResponse.data.length);
                    setSpecialCategoryFoods(categoryFoodResponse.data[randomCategoryIndex]);
                }
                
                // Thiết lập stalls với badge khuyến mãi
                setStallsWithPromotions(stallsWithPromotionResponse.data);
                
                console.log("Top rated foods:", topRatedFoodResponse.data);
                console.log("Top rated stalls:", topRatedStallsResponse.data);
                console.log("Foods by category:", categoryFoodResponse.data);
                console.log("Stalls with promotions:", stallsWithPromotionResponse.data);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const banneritems = [
        {
            id: '1',
            name: 'anh 1',
            url: '/images/map1.png',
        },
        {
            id: '2',
            name: 'anh 2',
            url: '/images/map2.png',
        },
        {
            id: '3',
            name: 'anh 32',
            url: '/images/map3.png',
        },
        {
            id: '3',
            name: 'anh 32',
            url: '/images/map4.png',
        }
    ]
          const mappingCategoryFood = (categoryFoods: CategoryFood[]) => {
        return {
            title: 'Danh mục món ăn',
            items: categoryFoods.map((item) => ({
                id: item.id,
                name: item.name,
                adrress: item.description || '',
                img: item.image_url || '/images/Ga.png',
                kind: item.name
            }))
        }
    }
      const mapRandomFoodsToScrollFood = (foods: Food[]) => {
        return {
            title: 'Hôm nay ăn gì?',
            items: foods.map(food => ({
                id: food.id,
                name: food.name,
                adrress: food?.stall?.address || food.description || '',
                img: food.image_url || '/food/ga1.jpg',
                kind: food?.stall?.name || 'Quán ăn',
                rating: food.avg_rating
            }))
        };
    }
    
    const mapRandomStallsToScrollFood = (stalls: Stall[]) => {
        return {
            title: 'Quán ăn nổi bật',
            items: stalls.map(stall => ({
                id: stall.id,
                name: stall.name,
                adrress: stall.address || stall.description || '',
                img: stall.image_url || '/images/stall-default.jpg',
                kind: stall.category?.name || 'Quán ăn',
                rating: stall.avg_rating,
                badge: {
                    text: `${stall.avg_rating ? stall.avg_rating.toFixed(1) : '0.0'} ★`,
                    color: stall.avg_rating && stall.avg_rating >= 4.5 ? 'bg-red-500' : 
                           stall.avg_rating && stall.avg_rating >= 4.0 ? 'bg-orange-500' : 
                           'bg-yellow-500'
                }
            }))
        };
    }
    
    // Map top rated foods with rating badge
    const mapTopRatedFoodsToScrollFood = (foods: Food[]) => {
        return {
            title: 'Món ngon được yêu thích',
            items: foods.map(food => ({
                id: food.id,
                name: food.name,
                adrress: food?.stall?.address || food.description || '',
                img: food.image_url || '/food/ga1.jpg',
                kind: food?.stall?.name || 'Quán ăn',
                rating: food.avg_rating,
                badge: {
                    text: `${food.avg_rating ? food.avg_rating.toFixed(1) : '0.0'} ★`,
                    color: food.avg_rating && food.avg_rating >= 4.5 ? 'bg-red-500' : 
                           food.avg_rating && food.avg_rating >= 4.0 ? 'bg-orange-500' : 
                           'bg-yellow-500'
                }
            }))
        };
    }
    
    // Map foods theo category
    const mapCategoryFoodsToScrollFood = (category: FoodsByCategory | null) => {
        if (!category) return { title: '', items: [] };
        
        return {
            title: `Món ăn ${category.category.name}`,
            items: category.foods.map(food => ({
                id: food.id,
                name: food.name,
                adrress: food?.stall?.address || food.description || '',
                img: food.image_url || '/food/ga1.jpg',
                kind: food?.stall?.name || 'Quán ăn',
                rating: food.avg_rating,
                badge: {
                    text: category.category.name,
                    color: 'bg-green-500'
                }
            }))
        };
    }
    
    // Map stalls with promotion badge
    const mapPromotionStallsToScrollFood = (stalls: Stall[]) => {
        return {
            title: 'Quán ăn có khuyến mãi',
            items: stalls.map(stall => ({
                id: stall.id,
                name: stall.name,
                adrress: stall.address || stall.description || '',
                img: stall.image_url || '/images/stall-default.jpg',
                kind: stall.category?.name || 'Quán ăn',
                rating: stall.avg_rating,
                badge: {
                    text: 'Khuyến mãi',
                    color: 'bg-red-500'
                }
            }))
        };
    }
    
    return (
        <>
            <div className="max-w-[1440px] mx-auto px-4 md:px-6">
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 lg:col-span-3 pt-3 relative z-40">
                        <div className="lg:sticky lg:top-20 bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                            <div className="mb-3">
                                <h2 className="text-xl font-bold text-gray-800 mb-1">Thực đơn</h2>
                                <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
                            </div>{categoryStalls.map((item, index) => (
                            <div 
                                key={index} 
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
                                        </h3>
                                        {item.description && (
                                            <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600">
                                                {item.description}
                                            </p>
                                        )}
                                        {item._count?.stalls && (
                                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 group-hover:bg-orange-100 text-gray-600 group-hover:text-orange-700 rounded-full transition-all duration-300">
                                                {item._count.stalls} cửa hàng
                                            </span>
                                        )}
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>                        ))}
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-9 pt-3 flex flex-col space-y-6">
                        <div className="mb-4">
                            <ScrollBar items={banneritems} />
                        </div>                        
                        <div className="space-y-8">
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
        </>
    )
}