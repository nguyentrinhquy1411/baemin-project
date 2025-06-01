"use client";

import { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Upload, Switch, message } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import FoodService, { Food, CreateFoodDto, UpdateFoodDto } from "@/services/food";
import { AuthService } from "@/services/auth";
import { Stall } from "@/services/stall";
import { CategoryFood } from "@/services/category-food";

const { Option } = Select;
const { TextArea } = Input;

interface FoodModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editingFood: Food | null;
  stalls: Stall[];
  categories: CategoryFood[];
}

const FoodModal: React.FC<FoodModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  editingFood,
  stalls,
  categories,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    if (visible) {
      if (editingFood) {
        // Editing mode
        form.setFieldsValue({
          name: editingFood.name,
          description: editingFood.description,
          price: editingFood.price,
          stall_id: editingFood.stall_id,
          category_ids: editingFood.stall_food_category?.map(sfc => sfc.category_id) || [],
          is_available: editingFood.is_available,
        });
        setImageUrl(editingFood.image_url);
      } else {
        // Adding mode
        form.resetFields();
        setImageUrl(undefined);
        // Set default stall if only one stall
        if (stalls.length === 1) {
          form.setFieldsValue({ stall_id: stalls[0].id });
        }
      }
    }
  }, [visible, editingFood, form, stalls]);  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const foodData = {
        ...values,
        image_url: imageUrl,
        price: Number(values.price),
      };

      if (editingFood) {
        // Update existing food
        const updateData: UpdateFoodDto = { ...foodData };
        delete (updateData as any).stall_id; // Can't update stall_id
        await FoodService.update(editingFood.id, updateData);
        message.success("Cập nhật món ăn thành công");
      } else {
        // Create new food
        const createData: CreateFoodDto = {
          ...foodData,
          is_available: values.is_available ?? true,
        };
        await FoodService.create(createData);
        message.success("Thêm món ăn thành công");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving food:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";
      message.error(`Không thể lưu món ăn: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
    </div>
  );
  const handleUploadChange: UploadProps["onChange"] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === "uploading") {
      setImageLoading(true);
      return;
    }
    
    if (info.file.status === "done") {
      setImageLoading(false);
      const response = info.file.response;
      console.log('Upload response:', response);
      
      if (response?.url) {
        // Thêm base URL nếu đường dẫn là tương đối
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const fullUrl = response.url.startsWith('http') 
          ? response.url 
          : `${baseUrl}${response.url}`;
        
        setImageUrl(fullUrl);
        message.success("Tải ảnh lên thành công");
      } else {
        message.error("Không nhận được URL ảnh từ server");
      }
    }
    
    if (info.file.status === "error") {
      setImageLoading(false);
      message.error("Tải ảnh lên thất bại");
    }
  };

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Chỉ có thể tải lên file JPG/PNG!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
      return false;
    }
    return true;
  };

  const handleCancel = () => {
    form.resetFields();
    setImageUrl(undefined);
    onCancel();
  };

  return (
    <Modal
      title={editingFood ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          is_available: true,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Form.Item
              name="name"
              label="Tên món ăn"
              rules={[
                { required: true, message: "Vui lòng nhập tên món ăn" },
                { min: 2, message: "Tên món ăn phải có ít nhất 2 ký tự" },
                { max: 100, message: "Tên món ăn không được quá 100 ký tự" },
              ]}
            >
              <Input placeholder="Nhập tên món ăn" />
            </Form.Item>            <Form.Item
              name="price"
              label="Giá (VNĐ)"
              rules={[
                { required: true, message: "Vui lòng nhập giá món ăn" },
                { type: "number", min: 1000, message: "Giá phải lớn hơn 1,000 VNĐ" },
                { type: "number", max: 10000000, message: "Giá không được vượt quá 10,000,000 VNĐ" },
              ]}
            >
              <InputNumber
                placeholder="Nhập giá món ăn"
                style={{ width: "100%" }}
                min={1000}
                max={10000000}
                addonAfter="VNĐ"
                controls={true}
              />
            </Form.Item>

            <Form.Item
              name="stall_id"
              label="Cửa hàng"
              rules={[{ required: true, message: "Vui lòng chọn cửa hàng" }]}
            >
              <Select placeholder="Chọn cửa hàng" disabled={!!editingFood}>
                {stalls.map((stall) => (
                  <Option key={stall.id} value={stall.id}>
                    {stall.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="category_ids" label="Danh mục món ăn">
              <Select
                mode="multiple"
                placeholder="Chọn danh mục"
                allowClear
                optionFilterProp="children"
              >
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="is_available" label="Trạng thái" valuePropName="checked">
              <Switch checkedChildren="Còn hàng" unCheckedChildren="Hết hàng" />
            </Form.Item>
          </div>

          <div className="space-y-4">
            <Form.Item name="description" label="Mô tả">
              <TextArea
                rows={4}
                placeholder="Nhập mô tả món ăn"
                maxLength={500}
                showCount
              />
            </Form.Item>            <Form.Item label="Ảnh món ăn">
              <div className="flex justify-center">
                <Upload
                  name="file"
                  listType="picture-card"
                  className="food-uploader"
                  showUploadList={false}
                  action={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/upload/foods`}
                  beforeUpload={beforeUpload}
                  onChange={handleUploadChange}
                  headers={{
                    Authorization: `Bearer ${AuthService.getTokens().accessToken}`,
                  }}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="food" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              </div>
              {imageUrl && (
                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setImageUrl(undefined)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Xóa ảnh
                  </button>
                </div>
              )}
            </Form.Item>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Đang lưu..." : editingFood ? "Cập nhật" : "Thêm mới"}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default FoodModal;
