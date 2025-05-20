'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button, Card, Divider, Spin, Typography, Avatar, Modal } from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  HomeOutlined,
  LogoutOutlined,
  SyncOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import React, { useState } from 'react';

const { Title, Text } = Typography;

export default function Page() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 pt-36 pb-16">
      {/* User Profile Card */}
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden mt-4">
        {/* Avatar and Background */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-cyan-400 to-[#3AC5C9]"></div>
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-32">
            <div className="relative">
              <Avatar 
                size={120}
                icon={<UserOutlined />}
                src={user?.avatar || undefined}
                style={{ backgroundColor: '#3AC5C9', border: '4px solid white' }}
                className="shadow-md"
              />
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                <Button 
                  type="link" 
                  size="small" 
                  shape="circle"
                  className="flex items-center justify-center text-beamin" 
                  icon={<EditOutlined />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="pt-16 pb-6 px-6 text-center">
          <div className="mb-2">
            <Text className="text-gray-500 font-medium">Thành viên</Text>
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
            <Button 
              type="primary" 
              block
              icon={<EditOutlined />}
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
      
      {/* Logout Confirmation Modal */}
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
    </div>
  );
}
