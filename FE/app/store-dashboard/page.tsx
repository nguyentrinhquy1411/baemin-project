'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Spin, 
  message, 
  Typography, 
  Divider,
  Progress,
  Table,
  Tag,
  Space,
  Button,
  Select,
  DatePicker
} from 'antd';
import {
  ShopOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  EyeOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { orderService, OrderStatistics } from '@/services/order_new';
import FoodService, { Food } from '@/services/food';
import OrderManagement from '@/components/store/order-management';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const StoreDashboard = () => {
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [foodsLoading, setFoodsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'foods'>('overview');  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    console.log('Store Dashboard - Auth loading:', authLoading);
    console.log('Store Dashboard - User data:', user);
    console.log('Store Dashboard - User role:', user?.role);
    
    // Đợi auth context load xong
    if (authLoading) {
      console.log('Store Dashboard - Still loading auth, waiting...');
      return;
    }

    if (!user) {
      console.log('Store Dashboard - No user, redirecting to login');
      router.push('/login');
      return;
    }

    if (user.role !== 'store') {
      console.log('Store Dashboard - User role is not store:', user.role);
      message.error('Bạn không có quyền truy cập trang này');
      router.push('/dashboard');
      return;
    }

    console.log('Store Dashboard - User is store, fetching data');
    fetchDashboardData();
  }, [user, authLoading, router]);
  const fetchDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Add delay to ensure token is properly set in axios interceptor
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Store Dashboard - Fetching data for user ID:', user.id);
      
      const [statsResponse, foodsResponse] = await Promise.all([
        orderService.getStoreOwnerOrderStats(user.id),
        FoodService.getByStoreOwner(user.id, 1, 20)
      ]);

      console.log('Store Dashboard - Stats response:', statsResponse);
      console.log('Store Dashboard - Foods response:', foodsResponse);

      setStatistics(statsResponse);
      setFoods(foodsResponse.data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        router.push('/login');
      } else {
        message.error('Không thể tải dữ liệu dashboard');
      }
    } finally {
      setLoading(false);
      setFoodsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'pending': 'orange',
      'confirmed': 'blue', 
      'preparing': 'purple',
      'ready': 'cyan',
      'delivering': 'geekblue',
      'delivered': 'green',
      'cancelled': 'red'
    };
    return statusColors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'preparing': 'Đang chuẩn bị',
      'ready': 'Sẵn sàng',
      'delivering': 'Đang giao',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy'
    };
    return statusTexts[status] || status;
  };

  const foodColumns = [
    {
      title: 'Tên món ăn',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Cửa hàng',
      dataIndex: ['stall', 'name'],
      key: 'stall_name'
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toLocaleString()} đ`
    },
    {      title: 'Đánh giá',
      key: 'rating',
      render: (record: Food) => (
        <Space>
          <Text>{record.avg_rating ? record.avg_rating.toFixed(1) : '0.0'} ⭐</Text>
          <Text type="secondary">({record._count?.ratings || 0})</Text>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_available',
      key: 'is_available',
      render: (isAvailable: boolean) => (
        <Tag color={isAvailable ? 'green' : 'red'}>
          {isAvailable ? 'Có sẵn' : 'Hết hàng'}
        </Tag>
      )
    },    {
      title: 'Thao tác',
      key: 'actions',
      render: (record: Food) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => router.push(`/detailfood/${record.id}`)}
        >
          Xem chi tiết
        </Button>
      )
    }
  ];
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <Title level={2} className="mb-2">Dashboard Cửa hàng</Title>
              <Text type="secondary">Xin chào, {user?.first_name || user?.username}!</Text>
            </div>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={fetchDashboardData}
            >
              Làm mới
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-md transition-all ${
                activeTab === 'overview' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-md transition-all ${
                activeTab === 'orders' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Quản lý đơn hàng
            </button>
            <button
              onClick={() => setActiveTab('foods')}
              className={`px-6 py-2 rounded-md transition-all ${
                activeTab === 'foods' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Quản lý món ăn
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && statistics && (
          <>
            {/* Summary Statistics */}
            <Row gutter={[16, 16]} className="mb-8">
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Tổng đơn hàng"
                    value={statistics.totalOrders}
                    prefix={<ShoppingCartOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Tổng doanh thu"
                    value={statistics.revenueStats.totalRevenue}
                    prefix={<DollarOutlined />}
                    suffix="đ"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Giá trị đơn hàng TB"
                    value={statistics.revenueStats.averageOrderValue}
                    prefix={<RiseOutlined />}
                    suffix="đ"
                    precision={0}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Số cửa hàng"
                    value={statistics.stallStats.length}
                    prefix={<ShopOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm">
            <OrderManagement />
          </div>
        )}

        {/* Foods Tab */}
        {activeTab === 'foods' && (
          <Card title="Quản lý món ăn">
            <Table
              columns={foodColumns}
              dataSource={foods}
              rowKey="id"
              loading={foodsLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} món ăn`
              }}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default StoreDashboard;
