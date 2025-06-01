"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import FoodService, { Food } from "@/services/food";
import StallService, { Stall } from "@/services/stall";
import { CategoryFoodService, CategoryFood } from "@/services/category-food";
import FoodModal from "@/components/store/FoodModal";
import FoodCard from "@/components/store/FoodCard";
import { message, Select, Button, Input, Pagination, Spin, Empty } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";

const { Option } = Select;

export default function FoodManagementPage() {
  const { user } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [categories, setCategories] = useState<CategoryFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStall, setSelectedStall] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedAvailability, setSelectedAvailability] = useState<boolean | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch data
  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id, currentPage, selectedStall, selectedCategory, selectedAvailability, searchTerm]);

  useEffect(() => {
    if (user?.id) {
      fetchStalls();
      fetchCategories();
    }
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await FoodService.getByStoreOwner(
        user.id,
        currentPage,
        pageSize,
        selectedCategory || undefined,
        selectedAvailability
      );
      
      let filteredFoods = response.data;
      
      // Filter by stall if selected
      if (selectedStall) {
        filteredFoods = filteredFoods.filter(food => food.stall_id === selectedStall);
      }
      
      // Filter by search term if provided
      if (searchTerm) {
        filteredFoods = filteredFoods.filter(food =>
          food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          food.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFoods(filteredFoods);
      setTotalItems(response.meta.total);
    } catch (error) {
      console.error("Error fetching foods:", error);
      message.error("Không thể tải danh sách món ăn");
    } finally {
      setLoading(false);
    }
  };
  const fetchStalls = async () => {
    if (!user?.id) return;
    
    try {
      const response = await StallService.getMyStalls();
      setStalls(response.data);
    } catch (error) {
      console.error("Error fetching stalls:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await CategoryFoodService.getAll({ limit: 100 });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAddFood = () => {
    setEditingFood(null);
    setModalVisible(true);
  };

  const handleEditFood = (food: Food) => {
    setEditingFood(food);
    setModalVisible(true);
  };

  const handleDeleteFood = async (foodId: string) => {
    try {
      await FoodService.delete(foodId);
      message.success("Xóa món ăn thành công");
      fetchData();
    } catch (error) {
      console.error("Error deleting food:", error);
      message.error("Không thể xóa món ăn");
    }
  };

  const handleToggleAvailability = async (foodId: string) => {
    try {
      await FoodService.toggleAvailability(foodId);
      message.success("Cập nhật trạng thái thành công");
      fetchData();
    } catch (error) {
      console.error("Error toggling availability:", error);
      message.error("Không thể cập nhật trạng thái");
    }
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    fetchData();
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStallFilter = (value: string) => {
    setSelectedStall(value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleAvailabilityFilter = (value: boolean | undefined) => {
    setSelectedAvailability(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý món ăn</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddFood}
            size="large"
            className="bg-orange-500 hover:bg-orange-600 border-orange-500"
          >
            Thêm món ăn
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <Input
                placeholder="Tìm kiếm món ăn..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cửa hàng
              </label>
              <Select
                placeholder="Chọn cửa hàng"
                value={selectedStall || undefined}
                onChange={handleStallFilter}
                allowClear
                className="w-full"
              >
                {stalls.map((stall) => (
                  <Option key={stall.id} value={stall.id}>
                    {stall.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <Select
                placeholder="Chọn danh mục"
                value={selectedCategory || undefined}
                onChange={handleCategoryFilter}
                allowClear
                className="w-full"
              >
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <Select
                placeholder="Chọn trạng thái"
                value={selectedAvailability}
                onChange={handleAvailabilityFilter}
                allowClear
                className="w-full"
              >
                <Option value={true}>Còn hàng</Option>
                <Option value={false}>Hết hàng</Option>
              </Select>
            </div>
          </div>
        </div>

        {/* Food List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : foods.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12">
            <Empty
              description="Không có món ăn nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {foods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onEdit={handleEditFood}
                  onDelete={handleDeleteFood}
                  onToggleAvailability={handleToggleAvailability}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalItems}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} của ${total} món ăn`
                }
              />
            </div>
          </>
        )}

        {/* Food Modal */}
        <FoodModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onSuccess={handleModalSuccess}
          editingFood={editingFood}
          stalls={stalls}
          categories={categories}
        />
      </div>
    </div>
  );
}
