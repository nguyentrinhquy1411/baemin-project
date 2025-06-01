'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { message, Spin, Alert } from "antd";
import { useAuth } from "@/contexts/auth-context";
import { orderService, Order } from "@/services/order_new";
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CarOutlined, 
  HomeOutlined,
  PhoneOutlined,
  UserOutlined,
  SyncOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import Image from "next/image";
import SuspenseWrapper from "@/components/suspense-wrapper";

const statusMap = {
  pending: { label: 'Chờ xác nhận', color: 'text-yellow-600', icon: ClockCircleOutlined },
  confirmed: { label: 'Đã xác nhận', color: 'text-blue-600', icon: CheckCircleOutlined },
  preparing: { label: 'Đang chuẩn bị', color: 'text-orange-600', icon: ClockCircleOutlined },
  ready: { label: 'Sẵn sàng', color: 'text-green-600', icon: CheckCircleOutlined },
  delivering: { label: 'Đang giao hàng', color: 'text-purple-600', icon: CarOutlined },
  delivered: { label: 'Đã giao', color: 'text-green-700', icon: CheckCircleOutlined },
  cancelled: { label: 'Đã hủy', color: 'text-red-600', icon: ClockCircleOutlined },
};

const paymentMethodMap = {
  momo: 'MoMo',
  zalopay: 'ZaloPay',
  credit_card: 'Thẻ tín dụng/Thẻ ghi nợ',  cash_on_delivery: 'Thanh toán khi nhận hàng',
};

const StatusOrderContent: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadOrder = async () => {
    try {
      const orderId = sessionStorage.getItem('currentOrderId');
      if (!orderId) {
        console.log('StatusOrder - No order ID found in session storage');
        message.error('Không tìm thấy thông tin đơn hàng');
        router.push('/profile/orders');
        return;
      }

      console.log('StatusOrder - Loading order details for ID:', orderId);
      setLoading(true);
      const orderData = await orderService.getOrderById(orderId);
      console.log('StatusOrder - Order data loaded:', orderData);
      setOrder(orderData);
    } catch (error: any) {
      console.error('StatusOrder - Error loading order:', error);
      message.error(error.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrder();
  };

  useEffect(() => {
    console.log('StatusOrder - useEffect triggered', { 
      authLoading, 
      isAuthenticated,
      userId: user?.id
    });
    
    // Wait for auth to complete loading
    if (authLoading) {
      console.log('StatusOrder - Still loading auth, waiting...');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      console.log('StatusOrder - User not authenticated, redirecting to login');
      message.warning('Vui lòng đăng nhập để xem chi tiết đơn hàng');
      router.push('/login');
      return;
    }    console.log('StatusOrder - User authenticated, loading order');
    loadOrder();
  }, [authLoading, isAuthenticated, user, router]);

  // Show auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-lg">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  // Show order loading state
  if (loading && !refreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-lg">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  // Show error state when order not found
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4">
            <ClockCircleOutlined />
          </div>
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-600 mb-6">
            Đơn hàng bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/profile/orders')}
              className="w-full bg-beamin text-white py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors"
            >
              <ArrowLeftOutlined className="mr-2" /> Quay lại danh sách đơn hàng
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full border border-gray-300 py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }
  const statusInfo = statusMap[order.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 pb-20">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button 
            onClick={() => router.push('/profile/orders')}
            className="flex items-center text-gray-600 hover:text-beamin"
          >
            <ArrowLeftOutlined className="mr-2" />
            <span>Lịch sử đơn hàng</span>
          </button>
          
          <button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="flex items-center text-beamin hover:text-teal-600 disabled:opacity-50"
          >
            <SyncOutlined spin={refreshing} className="mr-2" />
            <span>Làm mới</span>
          </button>
        </div>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-beamin to-teal-500 rounded-lg shadow-sm p-8 mb-6 text-white">
          <div className="flex items-center justify-between flex-wrap md:flex-nowrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-3">Chi tiết đơn hàng</h1>
              <p className="text-white/90 text-lg">Mã đơn hàng: #{order.id.slice(0, 8)}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">
                  Đặt lúc: {new Date(order.created_at).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            <div className={`flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full`}>
              <StatusIcon className="text-2xl text-white" />
              <span className="text-xl font-bold text-white">{statusInfo.label}</span>
            </div>
          </div>
        </div>

        {/* Order Status Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Trạng thái đơn hàng</h2>
          <div className="flex items-center justify-between">
            {Object.entries(statusMap).slice(0, 5).map(([status, info], index) => {
              const isActive = Object.keys(statusMap).indexOf(order.status) >= index;
              const Icon = info.icon;
              return (
                <div key={status} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-beamin text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Icon />
                  </div>
                  <span className={`text-sm mt-2 ${isActive ? 'text-beamin font-medium' : 'text-gray-400'}`}>
                    {info.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>        {/* Delivery Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin giao hàng</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <UserOutlined />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Người nhận</p>
                <p className="font-medium">{order.delivery_name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <PhoneOutlined />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Số điện thoại</p>
                <p className="font-medium">{order.delivery_phone}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                <HomeOutlined />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Địa chỉ giao hàng</p>
                <p className="font-medium">{order.delivery_address}</p>
              </div>
            </div>
            
            {order.notes && (
              <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-sm mb-1">Ghi chú</p>
                <p>{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Chi tiết món ăn</h2>
          <div className="space-y-4">
            {order.order_items.map((item, index) => (
              <div key={item.id || index} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-sm text-gray-500">Ảnh</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{item.food_name}</h3>
                    <p className="text-sm text-gray-600">Cửa hàng: {item.stall_name}</p>
                    <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₫{(item.unit_price * item.quantity).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">₫{item.unit_price.toLocaleString()} × {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin thanh toán</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Tổng tiền hàng:</span>
              <span>₫{(order.total_amount - order.shipping_fee + order.discount_amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span>₫{order.shipping_fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Giảm giá:</span>
              <span className="text-green-600">-₫{order.discount_amount.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold text-lg">
              <span>Tổng thanh toán:</span>
              <span className="text-beamin">₫{order.total_amount.toLocaleString()}</span>
            </div>            <div className="mt-4">
              <span className="font-medium">Phương thức thanh toán: </span>
              <span>{paymentMethodMap[order.payment_method as keyof typeof paymentMethodMap] || order.payment_method}</span>
            </div>
          </div>
        </div>        {/* Warning for cancelled orders */}
        {order.status === 'cancelled' && (
          <Alert
            message="Đơn hàng đã bị hủy"
            description="Đơn hàng này đã bị hủy và không thể tiếp tục xử lý."
            type="warning"
            showIcon
            className="mb-6"
          />
        )}
        
        {/* Success for delivered orders */}
        {order.status === 'delivered' && (
          <Alert
            message="Đơn hàng đã hoàn thành"
            description="Đơn hàng này đã được giao thành công. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!"
            type="success"
            showIcon
            className="mb-6"
          />
        )}

        {/* Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200">
          <div className="max-w-4xl mx-auto flex gap-4">
            <button 
              onClick={() => router.push('/profile/orders')}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              <ArrowLeftOutlined className="mr-2" /> Quay lại lịch sử
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-beamin text-white py-3 rounded-lg font-medium hover:brightness-105 transition-all"
            >
              Tiếp tục mua hàng
            </button>
          </div>        </div>
      </div>
    </div>
  );
}

export default function StatusOrder() {
  return (
    <SuspenseWrapper>
      <StatusOrderContent />
    </SuspenseWrapper>
  );
}