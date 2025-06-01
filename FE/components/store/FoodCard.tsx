"use client";

import { useState } from "react";
import { Card, Badge, Button, Dropdown, Modal, message } from "antd";
import { 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Food } from "@/services/food";

interface FoodCardProps {
  food: Food;
  onEdit: (food: Food) => void;
  onDelete: (foodId: string) => void;
  onToggleAvailability: (foodId: string) => void;
}

const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onEdit,
  onDelete,
  onToggleAvailability,
}) => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleEdit = () => {
    onEdit(food);
  };

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    onDelete(food.id);
    setDeleteModalVisible(false);
  };

  const handleToggleAvailability = () => {
    onToggleAvailability(food.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: <EditOutlined />,
      onClick: handleEdit,
    },
    {
      key: 'toggle',
      label: food.is_available ? 'Đánh dấu hết hàng' : 'Đánh dấu còn hàng',
      icon: food.is_available ? <EyeInvisibleOutlined /> : <EyeOutlined />,
      onClick: handleToggleAvailability,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: handleDelete,
    },
  ];

  return (
    <>
      <Card
        hoverable
        className={`relative transition-all duration-300 ${
          !food.is_available ? 'opacity-60' : ''
        }`}
        cover={
          <div className="relative">
            <img
              alt={food.name}
              src={food.image_url || '/food/default-food.jpg'}
              className="h-48 w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/food/default-food.jpg';
              }}
            />
            <div className="absolute top-2 right-2">
              <Badge
                status={food.is_available ? 'success' : 'error'}
                text={food.is_available ? 'Còn hàng' : 'Hết hàng'}
                className="bg-white px-2 py-1 rounded-full text-xs font-medium shadow-md"
              />
            </div>
            <div className="absolute top-2 left-2">
              <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<MoreOutlined />}
                  size="small"
                  className="bg-black bg-opacity-50 border-none hover:bg-opacity-70"
                />
              </Dropdown>
            </div>
          </div>
        }
        bodyStyle={{ padding: '16px' }}
      >
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
              {food.name}
            </h3>
          </div>
          
          <p className="text-xl font-bold text-orange-500">
            {formatPrice(food.price)}
          </p>
          
          {food.description && (
            <p className="text-gray-600 text-sm line-clamp-2">
              {food.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-1 mt-2">
            {food.stall_food_category?.slice(0, 2).map((sfc) => (
              <span
                key={sfc.id}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {sfc.category.name}
              </span>
            ))}
            {food.stall_food_category && food.stall_food_category.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{food.stall_food_category.length - 2}
              </span>
            )}
          </div>
          
          {food.stall && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Cửa hàng: <span className="font-medium">{food.stall.name}</span>
              </p>
            </div>
          )}
          
          {food.avg_rating && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-sm text-gray-600">
                {food.avg_rating.toFixed(1)}
                {food._count?.ratings && (
                  <span className="ml-1">({food._count.ratings} đánh giá)</span>
                )}
              </span>
            </div>
          )}
        </div>
      </Card>

      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc chắn muốn xóa món ăn <strong>{food.name}</strong>?
        </p>
        <p className="text-red-500 text-sm mt-2">
          Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </>
  );
};

export default FoodCard;
