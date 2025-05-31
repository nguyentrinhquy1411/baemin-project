'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { orderService, Order } from "@/services/order_new";
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CarOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import Image from "next/image";

const statusMap = {
  pending: { label: 'Chờ xác nhận', color: 'text-yellow-600 bg-yellow-100', icon: ClockCircleOutlined },
  confirmed: { label: 'Đã xác nhận', color: 'text-blue-600 bg-blue-100', icon: CheckCircleOutlined },
  preparing: { label: 'Đang chuẩn bị', color: 'text-orange-600 bg-orange-100', icon: ClockCircleOutlined },
  ready: { label: 'Sẵn sàng', color: 'text-green-600 bg-green-100', icon: CheckCircleOutlined },
  delivering: { label: 'Đang giao hàng', color: 'text-purple-600 bg-purple-100', icon: CarOutlined },
  delivered: { label: 'Đã giao', color: 'text-green-700 bg-green-200', icon: CheckCircleOutlined },
  cancelled: { label: 'Đã hủy', color: 'text-red-600 bg-red-100', icon: ClockCircleOutlined },
};

const paymentMethodMap = {
  momo: 'MoMo',
  zalopay: 'ZaloPay',
  credit_card: 'Thẻ tín dụng/Thẻ ghi nợ',
  cash_on_delivery: 'Thanh toán khi nhận hàng',
};

export default function OrdersHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const router = useRouter();
  const limit = 10;

  const loadOrders = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await orderService.getUserOrders(page, limit);
      setOrders(response.orders);
      setTotalOrders(response.total);
      setCurrentPage(response.page);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      message.error(error.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);
  const filteredOrders = selectedStatus === 'all' 
    ? orders || []
    : (orders || []).filter(order => order.status === selectedStatus);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewOrderDetails = (orderId: string) => {
    sessionStorage.setItem('currentOrderId', orderId);
    router.push('/statusorder');
  };

  const handleLoadMore = () => {
    if (currentPage * limit < totalOrders) {
      loadOrders(currentPage + 1);
    }
  };
  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-beamin border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Đang tải lịch sử đơn hàng</h2>
          <p className="text-gray-500">Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">        {/* Header */}
        <div className="bg-gradient-to-r from-beamin to-teal-500 rounded-lg shadow-sm p-8 mb-6 text-white mt-20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-3">Lịch sử đơn hàng</h1>
              <p className="text-white/90 text-lg">Quản lý và theo dõi các đơn hàng của bạn</p>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Tổng: {orders?.length || 0} đơn hàng</span>
                </div>
                {orders && orders.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                    <span className="text-sm">
                      Đã giao: {orders.filter(order => order.status === 'delivered').length} đơn
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <ShoppingCartOutlined className="text-4xl text-white" />
              </div>
            </div>
          </div>
        </div>        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Lọc theo trạng thái</h3>
          <div className="flex flex-wrap gap-3">            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all border-2 ${
                selectedStatus === 'all'
                  ? 'bg-beamin text-white border-beamin shadow-lg'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-beamin hover:text-beamin'
              }`}
            >
              <span className="flex items-center gap-2">
                Tất cả 
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {orders?.length || 0}
                </span>
              </span>
            </button>            {Object.entries(statusMap).map(([status, info]) => {
              const count = orders?.filter(order => order.status === status).length || 0;
              if (count === 0) return null;
              
              const StatusIcon = info.icon;
              
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all border-2 ${
                    selectedStatus === status
                      ? 'bg-beamin text-white border-beamin shadow-lg'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-beamin hover:text-beamin'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <StatusIcon className="text-sm" />
                    {info.label}
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-16 text-center">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingCartOutlined className="text-5xl text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-700 mb-3">
                {selectedStatus === 'all' ? 'Chưa có đơn hàng nào' : `Không có đơn hàng ${statusMap[selectedStatus as keyof typeof statusMap]?.label.toLowerCase()}`}
              </h2>
              <p className="text-gray-500 mb-8 max-w-md">
                {selectedStatus === 'all' 
                  ? 'Hãy bắt đầu khám phá và đặt món ăn yêu thích từ các quán ăn gần bạn!' 
                  : 'Hiện tại không có đơn hàng nào với trạng thái này.'
                }
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-beamin text-white px-8 py-3 rounded-lg hover:brightness-105 transition-all font-medium"
                >
                  Khám phá món ăn
                </button>
                {selectedStatus !== 'all' && (
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className="border border-beamin text-beamin px-8 py-3 rounded-lg hover:bg-beamin hover:text-white transition-all font-medium"
                  >
                    Xem tất cả
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = statusMap[order.status];
              const StatusIcon = statusInfo.icon;
                return (
                <div key={order.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-beamin to-teal-500 rounded-full flex items-center justify-center">
                        <ShoppingCartOutlined className="text-white text-lg" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-gray-800">Đơn hàng #{order.id.slice(0, 8)}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CalendarOutlined />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${statusInfo.color}`}>
                        <StatusIcon />
                        <span>{statusInfo.label}</span>
                      </div>
                    </div>
                  </div>                  {/* Order Items Preview */}
                  <div className="border border-gray-100 rounded-lg p-4 mb-4 bg-gray-50">
                    <h4 className="font-semibold text-gray-700 mb-3">Chi tiết món ăn</h4>
                    <div className="space-y-3">
                      {order.order_items.slice(0, 2).map((item, index) => (
                        <div key={item.id || index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-500 font-medium">IMG</span>
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-800">{item.food_name}</h5>
                              <p className="text-sm text-gray-600">{item.stall_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-800">x{item.quantity}</p>
                            <p className="text-sm text-beamin font-medium">₫{item.unit_price.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                      {order.order_items.length > 2 && (
                        <div className="text-center py-2">
                          <span className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full">
                            ... và {order.order_items.length - 2} món khác
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Phương thức thanh toán: {paymentMethodMap[order.payment_method as keyof typeof paymentMethodMap] || order.payment_method}
                      </p>
                      <p className="text-sm text-gray-600">
                        Giao đến: {order.delivery_address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-beamin">
                        ₫{order.total_amount.toLocaleString()}
                      </p>
                      <button
                        onClick={() => viewOrderDetails(order.id)}
                        className="mt-2 flex items-center gap-2 text-beamin hover:underline"
                      >
                        <EyeOutlined />
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}            {/* Load More Button */}
            {currentPage * limit < totalOrders && (
              <div className="text-center py-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-gradient-to-r from-beamin to-teal-500 text-white px-12 py-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-medium text-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang tải...
                    </span>
                  ) : (
                    'Tải thêm đơn hàng'
                  )}
                </button>
              </div>
            )}
          </div>
        )}        {/* Navigation */}
        <div className="mt-12 bg-white rounded-lg p-6 text-center shadow-sm">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 text-beamin hover:text-teal-600 transition-colors font-medium"
            >
              ← Quay lại trang cá nhân
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-beamin hover:text-teal-600 transition-colors font-medium"
            >
              Tiếp tục mua sắm →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
