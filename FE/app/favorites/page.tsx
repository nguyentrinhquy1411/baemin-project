"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col, Typography, Empty, Tag, Rate, message } from "antd";
import { HeartFilled, ShopOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FavoritesService, { FavoriteItem } from "@/services/favorites";

const { Title, Text } = Typography;

const FavoritesPage: React.FC = () => {
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
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <Title level={2} className="flex items-center gap-2 mb-4">
            <HeartFilled className="text-red-500" />
            Danh sách yêu thích
          </Title>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <Button
              type={activeTab === "all" ? "primary" : "default"}
              onClick={() => setActiveTab("all")}
              className="rounded-full"
            >
              Tất cả ({favorites.length})
            </Button>
            <Button
              type={activeTab === "food" ? "primary" : "default"}
              onClick={() => setActiveTab("food")}
              className="rounded-full"
            >
              Món ăn ({favorites.filter((f) => f.type === "food").length})
            </Button>
            <Button
              type={activeTab === "stall" ? "primary" : "default"}
              onClick={() => setActiveTab("stall")}
              className="rounded-full"
            >
              Quán ăn ({favorites.filter((f) => f.type === "stall").length})
            </Button>
          </div>

          {/* Favorites List */}
          {filteredFavorites.length === 0 ? (
            <Empty description="Chưa có món ăn hoặc quán ăn yêu thích nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <Row gutter={[16, 16]}>
              {filteredFavorites.map((item) => (
                <Col xs={24} sm={12} md={8} lg={6} key={`${item.type}-${item.id}`}>
                  <Card
                    hoverable
                    cover={
                      <div className="relative">
                        <Image
                          alt={item.name}
                          src={item.image_url || "/food/ga1.jpg"}
                          width={300}
                          height={192}
                          className="h-48 w-full object-cover cursor-pointer"
                          onClick={() => handleItemClick(item)}
                        />
                        <Tag color={item.type === "food" ? "orange" : "blue"} className="absolute top-2 left-2">
                          {item.type === "food" ? "Món ăn" : "Quán ăn"}
                        </Tag>
                        <Button
                          type="text"
                          danger
                          icon={<HeartFilled />}
                          className="absolute top-2 right-2 bg-white shadow-md hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFavorite(item.id, item.type);
                          }}
                        />
                      </div>
                    }
                    actions={[
                      <Button
                        key="view"
                        type="primary"
                        icon={item.type === "food" ? <CheckCircleOutlined /> : <ShopOutlined />}
                        onClick={() => handleItemClick(item)}
                        className="w-full"
                      >
                        {item.type === "food" ? "Xem món" : "Xem quán"}
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div className="cursor-pointer hover:text-blue-600" onClick={() => handleItemClick(item)}>
                          {item.name}
                        </div>
                      }
                      description={
                        <div className="space-y-2">
                          {item.price && (
                            <Text strong className="text-orange-500">
                              {item.price.toLocaleString()}đ
                            </Text>
                          )}
                          {item.address && <div className="text-gray-500 text-sm">{item.address}</div>}
                          {item.rating && (
                            <div className="flex items-center gap-1">
                              <Rate disabled defaultValue={item.rating} className="text-sm" />
                              <Text className="text-sm text-gray-500">({item.rating})</Text>
                            </div>
                          )}
                          <Text className="text-xs text-gray-400">
                            Đã thêm: {new Date(item.addedAt).toLocaleDateString("vi-VN")}
                          </Text>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
