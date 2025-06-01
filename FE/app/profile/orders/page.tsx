'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { useAuth } from "@/contexts/auth-context";
import { orderService, Order } from "@/services/order_new";
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CarOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  CreditCardOutlined,
  FilterOutlined,
  ReloadOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import Image from "next/image";
import SuspenseWrapper from "@/components/suspense-wrapper";

const statusMap = {
  pending: { 
    label: 'Chờ xác nhận', 
    color: 'text-amber-700 bg-amber-50 border-amber-200', 
    icon: ClockCircleOutlined,
    description: 'Đơn hàng đang chờ quán xác nhận'
  },
  confirmed: { 
    label: 'Đã xác nhận', 
    color: 'text-blue-700 bg-blue-50 border-blue-200', 
    icon: CheckCircleOutlined,
    description: 'Quán đã xác nhận và đang chuẩn bị'
  },
  preparing: { 
    label: 'Đang chuẩn bị', 
    color: 'text-orange-700 bg-orange-50 border-orange-200', 
    icon: ClockCircleOutlined,
    description: 'Quán đang chuẩn bị món ăn'
  },
  ready: { 
    label: 'Sẵn sàng', 
    color: 'text-green-700 bg-green-50 border-green-200', 
    icon: CheckCircleOutlined,
    description: 'Món ăn đã sẵn sàng để giao'
  },
  delivering: { 
    label: 'Đang giao hàng', 
    color: 'text-purple-700 bg-purple-50 border-purple-200', 
    icon: CarOutlined,
    description: 'Shipper đang giao hàng đến bạn'
  },
  delivered: { 
    label: 'Đã giao', 
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200', 
    icon: CheckCircleOutlined,
    description: 'Đơn hàng đã được giao thành công'
  },
  cancelled: { 
    label: 'Đã hủy', 
    color: 'text-red-700 bg-red-50 border-red-200', 
    icon: ClockCircleOutlined,
    description: 'Đơn hàng đã bị hủy'
  },
};

const paymentMethodMap = {
  momo: { name: 'MoMo', icon: '💳', color: 'text-pink-600' },
  zalopay: { name: 'ZaloPay', icon: '💰', color: 'text-blue-600' },
  credit_card: { name: 'Thẻ tín dụng', icon: '💳', color: 'text-purple-600' },
  cash_on_delivery: { name: 'Tiền mặt', icon: '💵', color: 'text-green-600' },
};

export default function OrdersHistory() {
  return (
    <SuspenseWrapper>
      <OrdersHistoryContent />
    </SuspenseWrapper>
  );
}

const OrdersHistoryContent: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();  const [orders, setOrders] = useState<Order[]>([]);
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
      
      // Kiểm tra cấu trúc response để xử lý đúng
      let ordersData: Order[] = [];
      let totalData = 0;
      let pageData = page;
      
      if (Array.isArray(response)) {
        // Nếu response là array trực tiếp
        ordersData = response;
        totalData = response.length;
      } else if ('orders' in response) {
        // Nếu có thuộc tính orders
        ordersData = response.orders || [];
        totalData = response.total || 0;
        pageData = response.page || page;
      } else if ('data' in response) {
        // Nếu có thuộc tính data
        ordersData = (response as any).data || [];
        totalData = ordersData.length;
      } else {
        // Fallback
        ordersData = [];
        totalData = 0;      }
      
      setOrders(ordersData);
      setTotalOrders(totalData);
      setCurrentPage(pageData);    } catch (error: any) {
      message.error(error.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // Wait for auth to complete loading
    if (authLoading) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      message.warning('Vui lòng đăng nhập để xem lịch sử đơn hàng');
      router.push('/login');
      return;
    }

    loadOrders();
  }, [authLoading, isAuthenticated, user, router]);  const filteredOrders = selectedStatus === 'all' 
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
  const handleLoadMore = async () => {
    if (currentPage * limit < totalOrders && !loading) {
      try {
        setLoading(true);
        const response = await orderService.getUserOrders(currentPage + 1, limit);
        
        // Xử lý response tương tự như loadOrders
        let newOrdersData: Order[] = [];
        let newPageData = currentPage + 1;
        
        if (Array.isArray(response)) {
          newOrdersData = response;
        } else if ('orders' in response) {
          newOrdersData = response.orders || [];
          newPageData = response.page || currentPage + 1;
        } else if ('data' in response) {
          newOrdersData = (response as any).data || [];        }
        
        // Append new orders to existing ones
        setOrders(prevOrders => [...prevOrders, ...newOrdersData]);
        setCurrentPage(newPageData);      } catch (error: any) {
        message.error('Không thể tải thêm đơn hàng');
      } finally {
        setLoading(false);
      }
    }
  };

  // Show loading state if auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-beamin border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Đang kiểm tra xác thực</h2>
          <p className="text-gray-500">Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    );
  }  if (loading && (!orders || orders.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-beamin border-t-transparent rounded-full animate-spin mb-6 mx-auto"></div>
          <h2 className="text-2xl font-bold text-gray-700 mb-3">Đang tải lịch sử đơn hàng</h2>
          <p className="text-gray-500 text-lg">Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-beamin via-teal-500 to-cyan-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-beamin/20 to-transparent"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 pt-24">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => router.push('/profile')}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  <ArrowLeftOutlined className="text-xl" />
                </button>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Lịch sử đơn hàng</h1>
                  <p className="text-white/90 text-lg">Theo dõi và quản lý tất cả đơn hàng của bạn</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <ShoppingCartOutlined className="text-xl" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{orders?.length || 0}</p>
                      <p className="text-white/80 text-sm">Tổng đơn hàng</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500/30 rounded-full flex items-center justify-center">
                      <CheckCircleOutlined className="text-xl text-emerald-200" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {orders?.filter(order => order.status === 'delivered').length || 0}
                      </p>
                      <p className="text-white/80 text-sm">Đã hoàn thành</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-500/30 rounded-full flex items-center justify-center">
                      <ClockCircleOutlined className="text-xl text-amber-200" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {orders?.filter(order => ['pending', 'confirmed', 'preparing', 'ready', 'delivering'].includes(order.status)).length || 0}
                      </p>
                      <p className="text-white/80 text-sm">Đang xử lý</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <ShoppingCartOutlined className="text-6xl text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </div>      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-beamin/10 rounded-xl flex items-center justify-center">
              <FilterOutlined className="text-beamin text-lg" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Lọc đơn hàng</h3>
            <button
              onClick={() => loadOrders(1)}
              className="ml-auto flex items-center gap-2 text-beamin hover:text-teal-600 transition-colors"
            >
              <ReloadOutlined className="text-sm" />
              <span className="text-sm font-medium">Làm mới</span>
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                selectedStatus === 'all'
                  ? 'bg-beamin text-white border-beamin shadow-lg scale-105'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-beamin hover:text-beamin hover:bg-beamin/5'
              }`}
            >
              <div className="w-6 h-6 bg-current rounded-full flex items-center justify-center text-xs">
                {orders?.length || 0}
              </div>
              <span>Tất cả đơn hàng</span>
            </button>
            
            {Object.entries(statusMap).map(([status, info]) => {
              const count = orders?.filter(order => order.status === status).length || 0;
              if (count === 0) return null;
              
              const StatusIcon = info.icon;
              
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                    selectedStatus === status
                      ? 'bg-beamin text-white border-beamin shadow-lg scale-105'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-beamin hover:text-beamin hover:bg-beamin/5'
                  }`}
                  title={info.description}
                >
                  <StatusIcon className="text-base" />
                  <span>{info.label}</span>
                  <div className="w-6 h-6 bg-current rounded-full flex items-center justify-center text-xs">
                    {count}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-8">
                <ShoppingCartOutlined className="text-6xl text-gray-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-700 mb-4">
                {selectedStatus === 'all' ? 'Chưa có đơn hàng nào' : `Không có đơn hàng ${statusMap[selectedStatus as keyof typeof statusMap]?.label.toLowerCase()}`}
              </h2>
              <p className="text-gray-500 mb-8 max-w-md text-lg leading-relaxed">
                {selectedStatus === 'all' 
                  ? 'Hãy bắt đầu khám phá và đặt món ăn yêu thích từ các quán ăn gần bạn!' 
                  : 'Hiện tại không có đơn hàng nào với trạng thái này.'
                }
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-beamin to-teal-500 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold text-lg"
                >
                  Khám phá món ăn
                </button>
                {selectedStatus !== 'all' && (
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className="border-2 border-beamin text-beamin px-8 py-4 rounded-xl hover:bg-beamin hover:text-white transition-all font-semibold text-lg"
                  >
                    Xem tất cả
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusInfo = statusMap[order.status];
              const StatusIcon = statusInfo.icon;
              const paymentInfo = paymentMethodMap[order.payment_method as keyof typeof paymentMethodMap];
              
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-beamin to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <ShoppingCartOutlined className="text-white text-2xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-1">
                            Đơn hàng #{order.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <CalendarOutlined className="text-beamin" />
                              <span>{formatDate(order.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              <span>{order.order_items.length} món</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl border-2 ${statusInfo.color} font-semibold shadow-sm`}>
                          <StatusIcon className="text-lg" />
                          <span>{statusInfo.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 max-w-48">{statusInfo.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Items List */}
                      <div className="lg:col-span-2">
                        <h4 className="font-bold text-gray-800 mb-4 text-lg">Chi tiết món ăn</h4>
                        <div className="space-y-3">
                          {order.order_items.slice(0, 3).map((item, index) => (
                            <div key={item.id || index} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center border-2 border-orange-200">
                                  <span className="text-orange-600 font-bold text-sm">🍜</span>
                                </div>
                                <div>
                                  <h5 className="font-bold text-gray-800 text-lg">{item.food_name}</h5>
                                  <p className="text-gray-600 text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 bg-beamin rounded-full"></span>
                                    {item.stall_name}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-800 text-lg">×{item.quantity}</p>
                                <p className="text-beamin font-bold">₫{item.unit_price.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                          
                          {order.order_items.length > 3 && (
                            <div className="text-center py-3">
                              <span className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-sm font-medium">
                                + {order.order_items.length - 3} món khác
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-4 text-lg">Thông tin đơn hàng</h4>
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <CreditCardOutlined className="text-beamin text-lg" />
                            <div>
                              <p className="text-sm text-gray-600">Thanh toán</p>
                              <p className={`font-semibold ${paymentInfo?.color || 'text-gray-700'}`}>
                                {paymentInfo?.icon} {paymentInfo?.name || order.payment_method}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <EnvironmentOutlined className="text-beamin text-lg mt-1" />
                            <div>
                              <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                              <p className="font-semibold text-gray-800">{order.delivery_address}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <PhoneOutlined className="text-beamin text-lg" />
                            <div>
                              <p className="text-sm text-gray-600">Số điện thoại</p>
                              <p className="font-semibold text-gray-800">{order.delivery_phone}</p>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-4 mt-4">                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600">Tạm tính:</span>
                              <span className="font-semibold">₫{(order.total_amount - (order.shipping_fee || 0)).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600">Phí giao hàng:</span>
                              <span className="font-semibold">₫{(order.shipping_fee || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold text-beamin border-t border-gray-200 pt-3">
                              <span>Tổng cộng:</span>
                              <span>₫{order.total_amount.toLocaleString()}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => viewOrderDetails(order.id)}
                            className="w-full bg-gradient-to-r from-beamin to-teal-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2 group-hover:scale-105"
                          >
                            <EyeOutlined />
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Load More Button */}
            {currentPage * limit < totalOrders && (
              <div className="text-center py-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-gradient-to-r from-beamin to-teal-500 text-white px-12 py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 font-semibold text-lg flex items-center gap-3 mx-auto"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang tải...</span>
                    </>
                  ) : (
                    <>
                      <ReloadOutlined />
                      <span>Tải thêm đơn hàng</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Khám phá thêm</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center justify-center gap-3 text-beamin hover:text-teal-600 transition-colors font-semibold text-lg bg-beamin/5 hover:bg-beamin/10 px-8 py-4 rounded-xl"
            >
              <ArrowLeftOutlined />
              <span>Quay lại trang cá nhân</span>
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-beamin to-teal-500 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all font-semibold text-lg"
            >
              <ShoppingCartOutlined />
              <span>Tiếp tục mua sắm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
