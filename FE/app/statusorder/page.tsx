'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { orderService, Order } from "@/services/order_new";
import { CheckCircleOutlined, ClockCircleOutlined, CarOutlined } from "@ant-design/icons";
import Image from "next/image";

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
  credit_card: 'Thẻ tín dụng/Thẻ ghi nợ',
  cash_on_delivery: 'Thanh toán khi nhận hàng',
};

export default function StatusOrder() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderId = sessionStorage.getItem('currentOrderId');
        if (!orderId) {
          message.error('Không tìm thấy thông tin đơn hàng');
          router.push('/cart');
          return;
        }

        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
      } catch (error: any) {
        console.error('Error loading order:', error);
        message.error(error.message || 'Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Đang tải thông tin đơn hàng...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Không tìm thấy đơn hàng</div>
      </div>
    );
  }

  const statusInfo = statusMap[order.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-beamin mb-2">Chi tiết đơn hàng</h1>
              <p className="text-gray-600">Mã đơn hàng: {order.id}</p>
            </div>
            <div className={`flex items-center gap-2 ${statusInfo.color}`}>
              <StatusIcon className="text-xl" />
              <span className="text-lg font-semibold">{statusInfo.label}</span>
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
        </div>

        {/* Delivery Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin giao hàng</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Người nhận:</span> {order.delivery_name}</p>
            <p><span className="font-medium">Số điện thoại:</span> {order.delivery_phone}</p>
            <p><span className="font-medium">Địa chỉ:</span> {order.delivery_address}</p>
            {order.notes && <p><span className="font-medium">Ghi chú:</span> {order.notes}</p>}
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
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/cart')}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Tiếp tục mua hàng
          </button>
          <button 
            onClick={() => router.push('/profile')}
            className="flex-1 bg-beamin text-white py-3 rounded-lg font-medium hover:brightness-105 transition-all"
          >
            Xem tất cả đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}