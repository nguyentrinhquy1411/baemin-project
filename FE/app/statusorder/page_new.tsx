'use client'
import { ShoppingCartOutlined } from '@ant-design/icons';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Status from './status';
import DetailsCheckout from '../checkout/detailsCheckout';
import { orderService, Order } from '@/services/order_new';
import { message } from 'antd';
import { useRouter } from 'next/navigation';

const Page: React.FC = () => {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const getStatusSteps = (orderStatus: string) => {
        const statusMap: { [key: string]: number } = {
            'pending': 0,
            'confirmed': 1,
            'preparing': 2,
            'ready': 3,
            'delivering': 4,
            'delivered': 5,
            'cancelled': -1
        };

        const currentStep = statusMap[orderStatus] || 0;
        
        return [
            {
                id: '1',
                number: 1,
                name: 'Nhà hàng đã nhận đơn',
                st: currentStep >= 1          
            },
            {
                id: '2',
                number: 2,
                name: 'Shipper đã nhận đơn',
                st: currentStep >= 2
            },
            {
                id: '3',
                number: 3,
                name: 'Shipper đang đến nhà hàng',
                st: currentStep >= 3
            },
            {
                id: '4',
                number: 4,
                name: 'Shipper đã đến nhà hàng',
                st: currentStep >= 4
            },
            {
                id: '5',
                number: 5,
                name: 'Shipper đang giao hàng',
                st: currentStep >= 5
            },
            {
                id: '6',
                number: 6,
                name: 'Đơn hàng hoàn tất',
                st: currentStep >= 6
            },
        ];
    };

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
                message.error('Lỗi khi tải thông tin đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg">Đang tải thông tin đơn hàng...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg">Không tìm thấy thông tin đơn hàng</div>
            </div>
        );
    }

    const statusSteps = getStatusSteps(order.status);
    const cartItems = order.order_items.map(item => ({
        id: item.food_id,
        name: item.food_name,
        description: '', // Add description if available
        price: item.unit_price,
        quantity: item.quantity,
        img: '/food/ga1.jpg', // Default image, replace with actual if available
        stall_id: item.stall_id,
        stall_name: item.stall_name,
    }));

    return (
        <>
            <div className="flex flex-row w-full h-20 bg-white">
                <div className="w-1/2 h-full flex flex-row items-center gap-3">
                    <div className="ml-10 text-4xl text-beamin font-bold">
                        <ShoppingCartOutlined />
                    </div>
                    <div className="text-2xl text-beamin">
                        |
                    </div>
                    <div className="text-3xl text-beamin font-bold">
                        Trình trạng đơn hàng
                    </div>
                </div>
                <div className="w-1/2 h-full flex items-center gap-3">
                    <div className="ml-auto mr-10">
                        <span className="text-sm text-gray-600">Mã đơn hàng: </span>
                        <span className="font-medium">{order.id.slice(-8)}</span>
                    </div>
                </div>
            </div>
            
            <div className='grid grid-cols-12'>
                <div className='col-span-3 pt-3 pb-3 pl-16'>
                    <div className='w-full h-full bg-white rounded-md flex flex-col pl-4 pt-2 pb-4'>
                        <div className='font-semibold'>Trình Trạng</div>
                        <Status items={statusSteps} />
                    </div>
                </div>
                
                <div className='col-span-9 pt-3 pb-3 pr-16'>
                    <div className='w-full bg-white rounded-md flex flex-col pt-2 pb-4'>
                        <div className='ml-10 font-semibold text-lg mb-4'>
                            Chi tiết đơn hàng
                        </div>
                        
                        <DetailsCheckout items={cartItems} />
                        
                        <div className='mx-10 mt-4 border-t pt-4'>
                            <div className='mb-4'>
                                <div className='font-medium mb-2'>Thông tin giao hàng:</div>
                                <div className='text-sm text-gray-600'>
                                    <div>Người nhận: {order.delivery_name}</div>
                                    <div>Số điện thoại: {order.delivery_phone}</div>
                                    <div>Địa chỉ: {order.delivery_address}</div>
                                    {order.notes && <div>Ghi chú: {order.notes}</div>}
                                </div>
                            </div>
                            
                            <div className='flex flex-col gap-2'>
                                <div className='text-sm flex flex-row justify-between'>
                                    <span>Tổng ({order.order_items.length} món):</span>
                                    <span className='text-beamin'>₫{order.total_amount.toLocaleString()}</span>
                                </div>
                                <div className='text-sm flex flex-row justify-between border-t pt-2'>
                                    <span>Phí giao hàng:</span>
                                    <span className='text-beamin'>₫{order.shipping_fee.toLocaleString()}</span>
                                </div>
                                {order.discount_amount > 0 && (
                                    <div className='text-sm flex flex-row justify-between'>
                                        <span>Giảm giá:</span>
                                        <span className='text-beamin'>-₫{order.discount_amount.toLocaleString()}</span>
                                    </div>
                                )}                                <div className='text-sm flex flex-row justify-between border-t pt-2 font-medium'>
                                    <span>Tổng thanh toán:</span>
                                    <span className='text-beamin text-lg'>₫{order.total_amount.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div className='mt-4 pt-4 border-t'>
                                <div className='text-sm text-gray-600'>
                                    <div>Phương thức thanh toán: <span className='font-medium'>{order.payment_method}</span></div>
                                    <div>Thời gian đặt hàng: {new Date(order.created_at).toLocaleString('vi-VN')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Page;
