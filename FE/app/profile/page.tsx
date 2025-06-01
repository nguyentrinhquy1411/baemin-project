'use client';

import { useAuth } from '@/contexts/auth-context';
import { AuthService, UpdateProfileData } from '@/services/auth';
import { UserService } from '@/services/user';
import { Button, Card, Divider, Spin, Typography, Avatar, Modal, Form, Input, message, Upload, Alert } from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  HomeOutlined,
  LogoutOutlined,
  SyncOutlined,
  ShoppingCartOutlined,
  CameraOutlined,
  ShopOutlined,
  UploadOutlined,
  CrownOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import React, { useState } from 'react';
import { log } from 'node:console';
import SuspenseWrapper from '@/components/suspense-wrapper';

const { Title, Text } = Typography;

const ProfilePageContent: React.FC = () => {
  const { user, isAuthenticated, loading, logout, refreshUserProfile } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showStoreOwnerModal, setShowStoreOwnerModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [requestingStoreRole, setRequestingStoreRole] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  console.log('Profile Page - User:', user);
  
  // Xử lý đăng xuất với xác nhận
  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      setIsLoggingOut(true);
      
      // Đặt timeout để đảm bảo quá trình logout không kéo dài quá lâu
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 3000));
      
      // Race giữa API logout và timeout
      await Promise.race([
        logout(),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Profile - Lỗi khi đăng xuất:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };
    // Hiển thị modal xác nhận trước khi đăng xuất
  const showLogoutConfirm = () => {
    setShowLogoutModal(true);
  };

  // Hiển thị modal cập nhật thông tin
  const showUpdateProfile = () => {
    form.setFieldsValue({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setShowUpdateModal(true);
  };
  // Xử lý cập nhật thông tin
  const handleUpdateProfile = async (values: UpdateProfileData) => {
    if (!user?.id) {
      messageApi.error('Không tìm thấy thông tin người dùng!');
      return;
    }

    try {
      setIsUpdating(true);
      await AuthService.updateProfile(user.id, values);
      
      // Refresh user profile after update
      if (refreshUserProfile) {
        await refreshUserProfile();
      }
      
      messageApi.success('Cập nhật thông tin thành công!');
      setShowUpdateModal(false);
      form.resetFields();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      messageApi.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin!');
    } finally {
      setIsUpdating(false);
    }
  };
  const [avatarKey, setAvatarKey] = useState(Date.now()); // Force refresh avatar

  // Validate file before upload
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      messageApi.error('Chỉ được tải lên file ảnh!');
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      messageApi.error('Ảnh phải nhỏ hơn 2MB!');
      return false;
    }
    
    // Call upload function directly
    handleAvatarUpload(file);
    return false; // Prevent default upload behavior
  };  // Xử lý upload avatar
  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) {
      messageApi.error('Không tìm thấy thông tin người dùng!');
      return;
    }

    try {
      setUploadingAvatar(true);      console.log('Starting avatar upload for user:', user.id);
      console.log('Current user avatar before upload:', user.user_profiles?.image_url);
      
      const response = await UserService.uploadAvatar(user.id, file);
      console.log('Avatar upload response:', response);
      
      // Force refresh user profile multiple times to ensure update
      if (refreshUserProfile) {
        console.log('Refreshing user profile...');
        await refreshUserProfile();
        
        // Update avatar key to force image reload
        setAvatarKey(Date.now());
        
        // Double refresh with delay to ensure the backend has updated
        setTimeout(async () => {
          console.log('Second refresh with delay...');
          await refreshUserProfile();
          setAvatarKey(Date.now());
        }, 1000);
      }
      
      messageApi.success('Cập nhật ảnh đại diện thành công!');
      setShowAvatarModal(false);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      messageApi.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật ảnh đại diện!');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Xử lý yêu cầu trở thành chủ cửa hàng
  const handleBecomeStoreOwner = async () => {
    if (!user?.id) {
      messageApi.error('Không tìm thấy thông tin người dùng!');
      return;
    }

    try {
      setRequestingStoreRole(true);
      await UserService.updateUserRole(user.id, 'store');
      
      // Refresh user profile after role update
      if (refreshUserProfile) {
        await refreshUserProfile();
      }
      
      messageApi.success('Chúc mừng! Bạn đã trở thành chủ cửa hàng thành công!');
      setShowStoreOwnerModal(false);
    } catch (error: any) {
      console.error('Error updating role:', error);
      messageApi.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật vai trò!');
    } finally {
      setRequestingStoreRole(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 pt-36 pb-16">
      {contextHolder}
      {/* User Profile Card */}
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden mt-4">
        {/* Avatar and Background */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-cyan-400 to-[#3AC5C9]"></div>          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-32">
            <div className="relative">              <Avatar 
                size={120}
                icon={<UserOutlined />}
                src={user?.user_profiles?.image_url ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${user.user_profiles.image_url}?t=${avatarKey}` : undefined}
                style={{ backgroundColor: '#3AC5C9', border: '4px solid white' }}
                className="shadow-md"
              />
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                <Button 
                  type="link" 
                  size="small" 
                  shape="circle"
                  onClick={() => setShowAvatarModal(true)}
                  className="flex items-center justify-center text-beamin" 
                  icon={<CameraOutlined />}
                />
              </div>
            </div>
          </div>
        </div>        {/* User Info */}
        <div className="pt-16 pb-6 px-6 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Text className="text-gray-500 font-medium">
              {user?.role === 'store' ? 'Chủ cửa hàng' : 
               user?.role === 'super_user' ? 'Quản trị viên' : 'Thành viên'}
            </Text>
            {user?.role === 'store' && (
              <CrownOutlined className="text-yellow-500" />
            )}
          </div>
          <Title level={3} className="mb-2">
            {user?.first_name && user?.last_name 
              ? `${user.first_name} ${user.last_name}`
              : user?.username || 'Người dùng Baemin'}
          </Title>
          
          {/* User Contact Info */}
          <div className="mt-6 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <MailOutlined className="text-beamin text-lg" />
              <div>
                <div className="text-sm text-gray-500">Email:</div>
                <Text>{user?.email || 'Chưa cập nhật'}</Text>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <PhoneOutlined className="text-beamin text-lg" />
              <div>
                <div className="text-sm text-gray-500">Số điện thoại:</div>
                <Text>{user?.phone || 'Chưa cập nhật'}</Text>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <HomeOutlined className="text-beamin text-lg" />
              <div>
                <div className="text-sm text-gray-500">Địa chỉ:</div>
                <Text>{user?.address || 'Chưa cập nhật'}</Text>
              </div>
            </div>
          </div>
            <Divider className="my-6" />
            {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link href="/profile/orders">
              <Button 
                block
                icon={<ShoppingCartOutlined />}
                className="h-10 border-beamin text-beamin hover:bg-beamin hover:text-white"
              >
                Lịch sử đơn hàng
              </Button>
            </Link>

            {/* Store Dashboard Link for Store Owners */}
            {user?.role === 'store' && (
              <Link href="/store-dashboard">
                <Button 
                  block
                  icon={<ShopOutlined />}
                  className="h-10 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white"
                >
                  Quản lý cửa hàng
                </Button>
              </Link>
            )}

            {/* Become Store Owner Button */}
            {user?.role === 'user' && (
              <Button 
                type="default"
                block
                icon={<CrownOutlined />}
                onClick={() => setShowStoreOwnerModal(true)}
                className="h-10 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white"
              >
                Trở thành chủ cửa hàng
              </Button>
            )}
            
            <Button 
              type="primary" 
              block
              icon={<EditOutlined />}
              onClick={showUpdateProfile}
              className="bg-beamin hover:bg-[#2AB3B8] h-10"
            >
              Cập nhật thông tin
            </Button>
            
            <Button 
              danger
              block
              icon={<LogoutOutlined />}
              onClick={showLogoutConfirm}
              loading={isLoggingOut}
              className="h-10"
            >
              {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Update Profile Modal */}
      <Modal
        title={<div className="text-beamin font-medium">Cập nhật thông tin cá nhân</div>}
        open={showUpdateModal}
        onCancel={() => {
          setShowUpdateModal(false);
          form.resetFields();
        }}
        footer={null}
        centered
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          className="mt-4"
        >
          <Form.Item
            label="Họ"
            name="last_name"
            rules={[
              { required: true, message: 'Vui lòng nhập họ!' },
              { min: 1, message: 'Họ phải có ít nhất 1 ký tự!' }
            ]}
          >
            <Input placeholder="Nhập họ của bạn" />
          </Form.Item>

          <Form.Item
            label="Tên"
            name="first_name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên!' },
              { min: 1, message: 'Tên phải có ít nhất 1 ký tự!' }
            ]}
          >
            <Input placeholder="Nhập tên của bạn" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { pattern: /^[0-9]+$/, message: 'Số điện thoại chỉ được chứa số!' },
              { min: 10, message: 'Số điện thoại phải có ít nhất 10 số!' },
              { max: 15, message: 'Số điện thoại không được quá 15 số!' }
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[
              { min: 5, message: 'Địa chỉ phải có ít nhất 5 ký tự!' }
            ]}
          >
            <Input.TextArea 
              placeholder="Nhập địa chỉ của bạn" 
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end gap-2">
            <Button 
              onClick={() => {
                setShowUpdateModal(false);
                form.resetFields();
              }}
              className="mr-2"
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={isUpdating}
              className="bg-beamin hover:bg-[#2AB3B8]"
            >
              {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>      {/* Logout Confirmation Modal */}
      <Modal
        title={<div className="text-beamin font-medium">Xác nhận đăng xuất</div>}
        open={showLogoutModal}
        onOk={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        okText="Đồng ý"
        cancelText="Hủy"
        okButtonProps={{ 
          danger: true, 
          style: { background: '#ff4d4f', borderColor: '#ff4d4f' } 
        }}
        cancelButtonProps={{ 
          style: { borderColor: '#d9d9d9' }
        }}
        centered
      >
        <p>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?</p>
      </Modal>

      {/* Avatar Upload Modal */}
      <Modal
        title={<div className="text-beamin font-medium">Cập nhật ảnh đại diện</div>}
        open={showAvatarModal}
        onCancel={() => setShowAvatarModal(false)}
        footer={null}
        centered
        width={400}
      >
        <div className="text-center py-4">          <Avatar 
            size={120}
            icon={<UserOutlined />}
            src={user?.user_profiles?.image_url ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${user.user_profiles.image_url}?t=${avatarKey}` : undefined}
            style={{ backgroundColor: '#3AC5C9' }}
            className="mb-4"
          />
          <div className="mb-4">
            <Text className="text-gray-600">
              Chọn ảnh mới để cập nhật ảnh đại diện của bạn
            </Text>
          </div>          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={beforeUpload}
            disabled={uploadingAvatar}
          >
            <Button 
              icon={<UploadOutlined />}
              loading={uploadingAvatar}
              className="bg-beamin text-white hover:bg-[#2AB3B8]"
              size="large"
            >
              {uploadingAvatar ? 'Đang tải lên...' : 'Chọn ảnh'}
            </Button>
          </Upload>
          <div className="mt-3 text-xs text-gray-500">
            Chỉ hỗ trợ file ảnh (JPG, PNG, GIF, WebP) - Tối đa 2MB
          </div>
        </div>
      </Modal>

      {/* Store Owner Upgrade Modal */}
      <Modal
        title={<div className="text-beamin font-medium flex items-center gap-2">
          <CrownOutlined className="text-yellow-500" />
          Trở thành chủ cửa hàng
        </div>}
        open={showStoreOwnerModal}
        onOk={handleBecomeStoreOwner}
        onCancel={() => setShowStoreOwnerModal(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={requestingStoreRole}
        okButtonProps={{ 
          style: { background: '#3AC5C9', borderColor: '#3AC5C9' } 
        }}
        centered
        width={500}
      >
        <div className="py-4">
          <Alert
            message="Thông tin quan trọng"
            description="Khi trở thành chủ cửa hàng, bạn sẽ có thể tạo và quản lý cửa hàng, thêm món ăn, và xử lý đơn hàng."
            type="info"
            showIcon
            className="mb-4"
          />
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <ShopOutlined className="text-beamin text-lg" />
              <Text>Tạo và quản lý cửa hàng của bạn</Text>
            </div>
            <div className="flex items-center gap-3">
              <EditOutlined className="text-beamin text-lg" />
              <Text>Thêm và chỉnh sửa món ăn</Text>
            </div>
            <div className="flex items-center gap-3">
              <ShoppingCartOutlined className="text-beamin text-lg" />
              <Text>Xử lý và quản lý đơn hàng</Text>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
            <Text className="text-yellow-800 text-sm">
              <strong>Lưu ý:</strong> Việc nâng cấp tài khoản sẽ được thực hiện ngay lập tức và không thể hoàn tác.
            </Text>
          </div>
          <div className="mt-4 text-center">
            <Text className="text-gray-600">
              Bạn có chắc chắn muốn trở thành chủ cửa hàng không?
            </Text>
          </div>
        </div>      </Modal>
    </div>
  );
}

export default function Page() {
  return (
    <SuspenseWrapper>
      <ProfilePageContent />
    </SuspenseWrapper>
  );
}
