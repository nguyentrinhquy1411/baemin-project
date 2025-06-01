'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Typography, 
  Descriptions, 
  message,
  Select,
  Row,
  Col,
  Input,
  Divider
} from 'antd';
import { 
  EyeOutlined, 
  CheckOutlined, 
  CloseOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { orderService, Order, UpdateOrderStatusRequest } from '@/services/order_new';
import stallService from '@/services/stall';
import { useAuth } from '@/contexts/auth-context';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [userStallIds, setUserStallIds] = useState<string[]>([]);
  const [lastOrderCount, setLastOrderCount] = useState<number>(0);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchUserStalls();
  }, []);

  useEffect(() => {
    if (userStallIds.length > 0) {
      fetchOrders();
    }
  }, [userStallIds, statusFilter, searchText]);

  // Auto refresh every 30 seconds for new orders
  useEffect(() => {
    if (userStallIds.length === 0) return;
    
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [userStallIds, statusFilter, searchText]);

  const fetchUserStalls = async () => {
    try {
      const response = await stallService.getMyStalls();
      const stallIds = response.data.map((stall: any) => stall.id);
      setUserStallIds(stallIds);
    } catch (error: any) {
      message.error('Không thể tải danh sách cửa hàng');
      console.error('Error fetching user stalls:', error);
    }
  };const fetchOrders = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;
      
      const response = await orderService.getStoreOwnerOrders(
        user.id, 
        1, 
        100, 
        statusFilter === 'all' ? undefined : statusFilter
      );
      
      // response is StoreOwnerOrdersResponse with data property
      let filteredOrders = response.data || [];

      // Apply search filter
      if (searchText.trim()) {
        filteredOrders = filteredOrders.filter((order: Order) => 
          order.id.toLowerCase().includes(searchText.toLowerCase()) ||
          order.delivery_name.toLowerCase().includes(searchText.toLowerCase()) ||
          order.delivery_phone.includes(searchText)
        );
      }

      setOrders(filteredOrders);
      
      // Check for new orders and show notification
      const pendingOrders = filteredOrders.filter(order => order.status === 'pending');
      if (lastOrderCount > 0 && pendingOrders.length > lastOrderCount) {
        message.success(`🔔 Có ${pendingOrders.length - lastOrderCount} đơn hàng mới cần xác nhận!`);
        // Play notification sound if browser supports it
        if ('Audio' in window) {
          try {
            const audio = new Audio('/notification.mp3'); // You'll need to add this file
            audio.volume = 0.3;
            audio.play().catch(() => {}); // Ignore if fails
          } catch (e) {}
        }
      }
      setLastOrderCount(pendingOrders.length);
      setLastRefresh(new Date());
    } catch (error: any) {
      message.error('Không thể tải danh sách đơn hàng');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus as any);
      message.success('Cập nhật trạng thái đơn hàng thành công');
      fetchOrders();
    } catch (error: any) {
      message.error('Không thể cập nhật trạng thái đơn hàng');
      console.error('Error updating order status:', error);
    }
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'gold',
      confirmed: 'blue',
      preparing: 'orange',
      ready: 'cyan',
      delivering: 'purple',
      delivered: 'green',
      cancelled: 'red'
    };
    return statusColors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      preparing: 'Đang chuẩn bị',
      ready: 'Sẵn sàng',
      delivering: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    };
    return statusTexts[status] || status;
  };

  const getNextStatusOptions = (currentStatus: string) => {
    const statusFlow: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['delivering'],
      delivering: ['delivered'],
      delivered: [],
      cancelled: []
    };
    return statusFlow[currentStatus] || [];
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <Text code>{id.slice(0, 8)}</Text>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (record: Order) => (
        <div>
          <div className="font-medium">{record.delivery_name}</div>
          <div className="text-sm text-gray-500">{record.delivery_phone}</div>
        </div>
      ),
    },
    {
      title: 'Món ăn',
      key: 'items',
      render: (record: Order) => {
        const userItems = record.order_items.filter(item => 
          userStallIds.includes(item.stall_id)
        );
        return (
          <div>
            {userItems.slice(0, 2).map((item, index) => (
              <div key={index} className="text-sm">
                {item.food_name} x{item.quantity}
              </div>
            ))}
            {userItems.length > 2 && (
              <div className="text-sm text-gray-500">
                +{userItems.length - 2} món khác
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'final_amount',
      key: 'final_amount',
      render: (amount: number) => (
        <Text strong>{amount.toLocaleString()}đ</Text>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <div>
          <div>{new Date(date).toLocaleDateString('vi-VN')}</div>
          <div className="text-sm text-gray-500">
            {new Date(date).toLocaleTimeString('vi-VN')}
          </div>
        </div>
      ),
    },    {
      title: 'Thao tác',
      key: 'actions',
      width: 250,
      render: (record: Order) => {
        const nextStatuses = getNextStatusOptions(record.status);
        return (
          <Space direction="vertical" size="small">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              size="small"
            >
              Xem chi tiết
            </Button>
            
            {/* Quick action buttons for pending orders */}
            {record.status === 'pending' && (
              <Space size="small">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleStatusChange(record.id, 'confirmed')}
                >
                  Xác nhận
                </Button>
                <Button
                  type="default"
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => handleStatusChange(record.id, 'cancelled')}
                >
                  Hủy
                </Button>
              </Space>
            )}
            
            {/* Status dropdown for other statuses */}
            {nextStatuses.length > 0 && record.status !== 'pending' && (
              <Select
                size="small"
                placeholder="Cập nhật trạng thái"
                style={{ width: 150 }}
                onChange={(value) => handleStatusChange(record.id, value)}
              >
                {nextStatuses.map(status => (
                  <Option key={status} value={status}>
                    {getStatusText(status)}
                  </Option>
                ))}
              </Select>
            )}
          </Space>
        );
      },
    },
  ];

  const renderOrderDetail = () => {
    if (!selectedOrder) return null;

    const userItems = selectedOrder.order_items.filter(item => 
      userStallIds.includes(item.stall_id)
    );

    return (
      <div>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Mã đơn hàng" span={2}>
            <Text code>{selectedOrder.id}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng">
            {selectedOrder.delivery_name}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {selectedOrder.delivery_phone}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
            {selectedOrder.delivery_address}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={getStatusColor(selectedOrder.status)}>
              {getStatusText(selectedOrder.status)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Phương thức thanh toán">
            {selectedOrder.payment_method}
          </Descriptions.Item>
          <Descriptions.Item label="Phí giao hàng">
            {selectedOrder.shipping_fee.toLocaleString()}đ
          </Descriptions.Item>
          <Descriptions.Item label="Giảm giá">
            {selectedOrder.discount_amount.toLocaleString()}đ
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền" span={2}>
            <Text strong style={{ fontSize: 16 }}>
              {selectedOrder.final_amount.toLocaleString()}đ
            </Text>
          </Descriptions.Item>
          {selectedOrder.notes && (
            <Descriptions.Item label="Ghi chú" span={2}>
              {selectedOrder.notes}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider />

        <Title level={5}>Chi tiết món ăn của cửa hàng</Title>
        <Table
          dataSource={userItems}
          rowKey="id"
          size="small"
          pagination={false}
          columns={[
            {
              title: 'Món ăn',
              dataIndex: 'food_name',
              key: 'food_name',
            },
            {
              title: 'Cửa hàng',
              dataIndex: 'stall_name',
              key: 'stall_name',
            },
            {
              title: 'Số lượng',
              dataIndex: 'quantity',
              key: 'quantity',
              align: 'center',
            },
            {
              title: 'Đơn giá',
              dataIndex: 'unit_price',
              key: 'unit_price',
              render: (price: number) => `${price.toLocaleString()}đ`,
            },
            {
              title: 'Thành tiền',
              dataIndex: 'total_price',
              key: 'total_price',
              render: (price: number) => (
                <Text strong>{price.toLocaleString()}đ</Text>
              ),
            },
          ]}
        />
      </div>
    );
  };

  // Calculate quick statistics
  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      delivering: orders.filter(o => o.status === 'delivering').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
    return stats;
  };

  const stats = getOrderStats();

  return (
    <div className="p-6">
      {/* Header with refresh controls */}
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="mb-0">Quản lý đơn hàng</Title>
        <Space>
          {lastRefresh && (
            <Text type="secondary" className="text-sm">
              Cập nhật: {lastRefresh.toLocaleTimeString('vi-VN')}
            </Text>
          )}
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={fetchOrders}
            loading={loading}
          >
            Làm mới
          </Button>
        </Space>
      </div>
      
      {/* Quick Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Tổng đơn</div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Chờ xác nhận</div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
            <div className="text-sm text-gray-600">Đã xác nhận</div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.preparing}</div>
            <div className="text-sm text-gray-600">Đang chuẩn bị</div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-cyan-600">{stats.ready}</div>
            <div className="text-sm text-gray-600">Sẵn sàng</div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.delivering}</div>
            <div className="text-sm text-gray-600">Đang giao</div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <div className="text-sm text-gray-600">Đã giao</div>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card size="small" className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Đã hủy</div>
          </Card>
        </Col>
      </Row>

      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <Row gutter={16} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Tìm theo mã đơn hàng, tên khách hàng, SĐT"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={fetchOrders}
              enterButton
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="pending">Chờ xác nhận</Option>
              <Option value="confirmed">Đã xác nhận</Option>
              <Option value="preparing">Đang chuẩn bị</Option>
              <Option value="ready">Sẵn sàng</Option>
              <Option value="delivering">Đang giao</Option>
              <Option value="delivered">Đã giao</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} đơn hàng`,
          }}
        />
      </Card>

      <Modal
        title="Chi tiết đơn hàng"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {renderOrderDetail()}
      </Modal>
    </div>
  );
};

export default OrderManagement;
