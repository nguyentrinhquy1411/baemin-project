"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col, Typography, Empty, Tag, Rate, message } from "antd";
import { HeartFilled, ShopOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FavoritesService, { FavoriteItem } from "@/services/favorites";
import SuspenseWrapper from "@/components/suspense-wrapper";

const { Title, Text } = Typography;

const FavoritesPageContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "food" | "stall">("all");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadFavorites();
  }, [isAuthenticated, router]);

  const loadFavorites = () => {
    const favoriteItems = FavoritesService.getFavorites();
    setFavorites(favoriteItems);
  };

  const handleRemoveFavorite = (id: string, type: "food" | "stall") => {
    const success = FavoritesService.removeFromFavorites(id, type);
    if (success) {
      message.success("Đã xóa khỏi danh sách yêu thích");
      loadFavorites();
    } else {
      message.error("Không thể xóa khỏi danh sách yêu thích");
    }
  };

  const handleItemClick = (item: FavoriteItem) => {
    if (item.type === "food") {
      router.push(`/detailfood/${item.id}`);
    } else {
      router.push(`/stall/${item.id}`);
    }
  };

  const filteredFavorites = favorites.filter((item) => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
  });

  if (!isAuthenticated) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-400 to-red-500 rounded-2xl shadow-lg">
              <HeartFilled className="text-white text-2xl" />
            </div>
            <div>
              <Title level={2} className="mb-0 text-gray-800">
                Danh sách yêu thích
              </Title>
              <p className="text-gray-500 mt-1">Những món ăn và quán ăn bạn đã lưu lại</p>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "all"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className="flex items-center gap-2">
                Tất cả
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === "all" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {favorites.length}
                </span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab("food")}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "food"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className="flex items-center gap-2">
                🍜 Món ăn
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === "food" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {favorites.filter((f) => f.type === "food").length}
                </span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab("stall")}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "stall"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className="flex items-center gap-2">
                🏪 Quán ăn
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === "stall" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {favorites.filter((f) => f.type === "stall").length}
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          {/* Favorites List */}
          {filteredFavorites.length === 0 ? (
            <Empty description="Chưa có món ăn hoặc quán ăn yêu thích nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFavorites.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden"
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden" onClick={() => handleItemClick(item)}>
                    <Image
                      alt={item.name}
                      src={item.image_url || "/food/ga1.jpg"}
                      width={300}
                      height={192}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full text-white shadow-md ${
                          item.type === "food"
                            ? "bg-gradient-to-r from-orange-400 to-orange-500"
                            : "bg-gradient-to-r from-blue-400 to-blue-500"
                        }`}
                      >
                        {item.type === "food" ? "Món ăn" : "Quán ăn"}
                      </span>
                    </div>

                    {/* Heart Button */}
                    <button
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:shadow-lg transition-all duration-200 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(item.id, item.type);
                      }}
                    >
                      <HeartFilled className="w-5 h-5 text-red-500" />
                    </button>

                    {/* Rating Badge (if exists) */}
                    {item.rating && (
                      <div className="absolute bottom-3 left-3 bg-white rounded-full px-2 py-1 shadow-md">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400 text-sm">⭐</span>
                          <span className="text-sm font-medium text-gray-700">{item.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4 space-y-3">
                    {/* Title */}
                    <h3
                      className="font-bold text-lg text-gray-800 group-hover:text-orange-600 transition-colors duration-200 line-clamp-2 cursor-pointer"
                      onClick={() => handleItemClick(item)}
                    >
                      {item.name}
                    </h3>

                    {/* Price */}
                    {item.price && (
                      <div className="text-xl font-bold text-orange-500">{item.price.toLocaleString()}đ</div>
                    )}

                    {/* Address */}
                    {item.address && <p className="text-gray-500 text-sm line-clamp-2">📍 {item.address}</p>}

                    {/* Added Date */}
                    <p className="text-xs text-gray-400 border-t border-gray-100 pt-2">
                      Đã thêm: {new Date(item.addedAt).toLocaleDateString("vi-VN")}
                    </p>

                    {/* Action Button */}
                    <button
                      onClick={() => handleItemClick(item)}
                      className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                        item.type === "food"
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      } shadow-sm hover:shadow-md`}
                    >
                      {item.type === "food" ? (
                        <>
                          <CheckCircleOutlined className="w-4 h-4" />
                          Xem món ăn
                        </>
                      ) : (
                        <>
                          <ShopOutlined className="w-4 h-4" />
                          Xem quán
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FavoritesPage: React.FC = () => {
  return (
    <SuspenseWrapper>
      <FavoritesPageContent />
    </SuspenseWrapper>
  );
};

export default FavoritesPage;
