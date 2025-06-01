'use client'

import { AccountBookOutlined, CompassOutlined, ShoppingCartOutlined, PlusOutlined, HomeOutlined, UserOutlined, PhoneOutlined } from "@ant-design/icons";
import Image from "next/image";
import DetailsCheckout from "./detailsCheckout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { orderService, CreateOrderRequest } from "@/services/order_new";
import { message, Modal, Input, Button, Radio, Space, Divider } from "antd";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";

const { TextArea } = Input;

interface CartItem {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    img: string;
    stall_id: string;
    stall_name: string;
}

interface DeliveryInfo {
    id?: string;
    name: string;
    phone: string;
    address: string;
    isDefault?: boolean;
}

interface SavedAddress {
    id: string;
    name: string;
    phone: string;
    address: string;
    isDefault: boolean;
}

interface Voucher {
    id: string;
    name: string;
    discount: number;
    type: 'percentage' | 'amount';
}

export default function Home() {
    const { clearCart } = useCart();
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'momo' | 'zalopay' | 'credit_card' | 'cash_on_delivery'>('cash_on_delivery');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
        name: "",
        phone: "",
        address: ""
    });
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [newAddress, setNewAddress] = useState<DeliveryInfo>({
        name: "",
        phone: "",
        address: ""
    });
    const router = useRouter();    useEffect(() => {
        // Load cart items from sessionStorage
        const selectedItems = sessionStorage.getItem('selectedCartItems');
        if (selectedItems) {
            try {
                const items = JSON.parse(selectedItems);
                setCartItems(items);
            } catch (error) {
                console.error('Error parsing cart items:', error);
                message.error('Lỗi khi tải giỏ hàng');
            }
        } else {
            // Redirect to cart if no items selected
            router.push('/cart');
        }
    }, [router]);

    // Load user profile and saved addresses
    useEffect(() => {
        if (user) {
            // Load saved addresses from localStorage
            const savedAddr = localStorage.getItem(`savedAddresses_${user.id}`);
            let addresses: SavedAddress[] = [];
            
            if (savedAddr) {
                try {
                    addresses = JSON.parse(savedAddr);
                } catch (error) {
                    console.error('Error parsing saved addresses:', error);
                }
            }

            // If no saved addresses, create one from user profile
            if (addresses.length === 0 && user) {
                const userAddress: SavedAddress = {
                    id: 'profile',
                    name: user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : user.username || 'Người dùng',
                    phone: user.phone || user.user_profiles?.phone || '',
                    address: user.address || user.user_profiles?.address || '',
                    isDefault: true
                };
                
                // Only add if user has address information
                if (userAddress.address) {
                    addresses = [userAddress];
                    localStorage.setItem(`savedAddresses_${user.id}`, JSON.stringify(addresses));
                }
            }

            setSavedAddresses(addresses);

            // Set default delivery info
            const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
            if (defaultAddress) {
                setDeliveryInfo({
                    name: defaultAddress.name,
                    phone: defaultAddress.phone,
                    address: defaultAddress.address
                });
                setSelectedAddressId(defaultAddress.id);
            } else if (user) {
                // Fallback to user profile if no saved addresses
                setDeliveryInfo({
                    name: user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : user.username || 'Người dùng',
                    phone: user.phone || user.user_profiles?.phone || '',
                    address: user.address || user.user_profiles?.address || ''
                });
            }
        }
    }, [user]);const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = 17000; // Fixed shipping fee
    
    // Calculate discount amount based on selected voucher
    const calculateDiscount = () => {
        if (!selectedVoucher) return 0;
        
        if (selectedVoucher.type === 'percentage') {
            const maxDiscount = 50000; // Maximum discount for percentage vouchers
            return Math.min((subtotal * selectedVoucher.discount) / 100, maxDiscount);
        } else {
            return selectedVoucher.discount;
        }
    };
    
    const discountAmount = calculateDiscount();
    const total = subtotal + shippingFee - discountAmount;

    // Sample vouchers for demo
    const availableVouchers: Voucher[] = [
        { id: '1', name: 'Giảm 10% tối đa 50k', discount: 10, type: 'percentage' },
        { id: '2', name: 'Giảm 20k cho đơn hàng từ 100k', discount: 20000, type: 'amount' },
        { id: '3', name: 'Giảm 15% cho khách hàng mới', discount: 15, type: 'percentage' },
        { id: '4', name: 'Miễn phí ship', discount: 17000, type: 'amount' },
    ];

    // Handle address selection
    const handleAddressSelect = (addressId: string) => {
        const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
        if (selectedAddress) {
            setDeliveryInfo({
                name: selectedAddress.name,
                phone: selectedAddress.phone,
                address: selectedAddress.address
            });
            setSelectedAddressId(addressId);
        }
    };

    // Handle adding new address
    const handleAddNewAddress = () => {
        if (!newAddress.name || !newAddress.phone || !newAddress.address) {
            message.error('Vui lòng điền đầy đủ thông tin địa chỉ!');
            return;
        }

        const newSavedAddress: SavedAddress = {
            id: Date.now().toString(),
            name: newAddress.name,
            phone: newAddress.phone,
            address: newAddress.address,
            isDefault: savedAddresses.length === 0 // First address is default
        };

        const updatedAddresses = [...savedAddresses, newSavedAddress];
        setSavedAddresses(updatedAddresses);
        
        if (user) {
            localStorage.setItem(`savedAddresses_${user.id}`, JSON.stringify(updatedAddresses));
        }

        // Select the new address
        setDeliveryInfo({
            name: newSavedAddress.name,
            phone: newSavedAddress.phone,
            address: newSavedAddress.address
        });
        setSelectedAddressId(newSavedAddress.id);

        // Reset new address form
        setNewAddress({ name: "", phone: "", address: "" });
        setIsAddingNewAddress(false);
        
        message.success('Thêm địa chỉ mới thành công!');
    };

    // Handle setting default address
    const handleSetDefaultAddress = (addressId: string) => {
        const updatedAddresses = savedAddresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId
        }));
        
        setSavedAddresses(updatedAddresses);
        
        if (user) {
            localStorage.setItem(`savedAddresses_${user.id}`, JSON.stringify(updatedAddresses));
        }
        
        message.success('Đã cập nhật địa chỉ mặc định!');
    };

    // Handle deleting address
    const handleDeleteAddress = (addressId: string) => {
        if (savedAddresses.length <= 1) {
            message.error('Không thể xóa địa chỉ cuối cùng!');
            return;
        }

        const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
        
        // If deleted address was default, set first remaining as default
        if (savedAddresses.find(addr => addr.id === addressId)?.isDefault) {
            updatedAddresses[0].isDefault = true;
            setDeliveryInfo({
                name: updatedAddresses[0].name,
                phone: updatedAddresses[0].phone,
                address: updatedAddresses[0].address
            });
            setSelectedAddressId(updatedAddresses[0].id);
        }
        
        setSavedAddresses(updatedAddresses);
        
        if (user) {
            localStorage.setItem(`savedAddresses_${user.id}`, JSON.stringify(updatedAddresses));
        }
        
        message.success('Đã xóa địa chỉ!');
    };    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            message.error('Giỏ hàng trống');
            return;
        }

        // Validate delivery information
        if (!deliveryInfo.address || deliveryInfo.address.trim() === '') {
            message.error('Vui lòng nhập địa chỉ giao hàng');
            return;
        }

        if (!deliveryInfo.phone || deliveryInfo.phone.trim() === '') {
            message.error('Vui lòng nhập số điện thoại');
            return;
        }

        if (!deliveryInfo.name || deliveryInfo.name.trim() === '') {
            message.error('Vui lòng nhập tên người nhận');
            return;
        }

        setLoading(true);
        try {            const orderData: CreateOrderRequest = {
                items: cartItems.map(item => ({
                    food_id: item.id,
                    stall_id: item.stall_id,
                    quantity: Number(item.quantity),
                    unit_price: Number(item.price),
                    food_name: item.name,
                    stall_name: item.stall_name,
                })),
                delivery_address: deliveryInfo.address,
                delivery_phone: deliveryInfo.phone,
                delivery_name: deliveryInfo.name,
                payment_method: paymentMethod,
                notes: notes || undefined,
                shipping_fee: Number(shippingFee),
                discount_amount: Number(discountAmount),
            };            const order = await orderService.createOrder(orderData);
            
            // Clear cart after successful order - both sessionStorage and cart context
            sessionStorage.removeItem('selectedCartItems');
            sessionStorage.removeItem('cartItems');
            clearCart(); // Clear cart context
            
            // Store order ID for status page
            sessionStorage.setItem('currentOrderId', order.id);
            
            message.success('Đặt hàng thành công!');
            router.push('/statusorder');
        } catch (error: any) {
            console.error('Order creation failed:', error);
            message.error(error.message || 'Đặt hàng thất bại');
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div className="flex flex-row w-full h-20 bg-white ">
                <div className="w-1/2 h-full flex flex-row  items-center gap-3">
                    <div className="ml-10 text-4xl  text-beamin font-bold" >
                        <ShoppingCartOutlined />
                    </div>
                    <div className="text-2xl  text-beamin ">
                        |
                    </div>
                    <div className="text-3xl  text-beamin font-bold">
                        Thanh Toán
                    </div>
                </div>
                <div className="w-1/2 h-full flex   items-center gap-3">


                </div>
            </div>
            <div className="px-16 flex flex-col gap-3 ">'
                <div className="w-full h-28 flex flex-col bg-white rounded-md pl-10 pt-5">
                    <div className="flex flex-row gap-1">
                        <div className="text-xl">
                            <svg version="1.1" viewBox="0 0 2048 2048" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#3AC5C9" transform="translate(1e3 353)" d="m0 0h48l30 3 28 5 32 8 29 10 27 12 23 12 24 15 18 13 14 11 11 10 8 7 21 21 7 8 13 16 13 18 14 22 12 22 11 23 11 29 8 28 6 28 4 29 2 33v12l-1 23-3 27-5 28-7 27-10 30-11 26-12 26-16 36-18 40-12 27-36 80-18 41-16 35-16 36-18 40-12 27-36 80-11 25-13 29-19 42-32 72-19 42-18 40-13 30-16 35-2 3-8-16-18-40-18-41-17-37-32-72-13-29-36-80-11-25-36-80-20-45-36-80-28-63-19-42-17-38-16-36-13-29-18-40-11-27-9-29-7-30-4-26-2-20v-55l3-28 5-28 7-28 11-32 11-25 13-25 13-21 12-17 10-13 12-14 12-13 16-16 8-7 14-12 18-13 15-10 15-9 18-10 28-13 28-10 25-7 28-6 31-4zm7 183-27 4-25 7-19 8-19 10-16 11-11 9-10 9-11 11-11 14-9 13-8 14-8 16-9 27-4 19-2 15v38l3 21 4 17 7 21 10 21 12 19 10 13 9 10 7 8 8 7 12 10 15 10 16 9 15 7 24 8 25 5 7 1 24 1 20-1 24-4 21-6 20-8 21-11 17-12 11-9 14-13 7-8 11-14 10-15 11-21 9-24 6-26 2-15v-39l-4-26-6-21-6-16-8-16-8-14-14-19-12-13-11-11-14-11-13-9-16-9-17-8-21-7-23-5-16-2z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-beamin">Địa chỉ giao hàng</span>
                    </div>                    <div className="pl-3 flex flex-row gap-5 items-center mb-3 mt-3">
                        <div className="flex items-center gap-2">
                            <UserOutlined className="text-beamin" />
                            <span className="font-bold">{deliveryInfo.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <PhoneOutlined className="text-beamin" />
                            <span className="font-medium">{deliveryInfo.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <HomeOutlined className="text-beamin" />
                            <span>Địa chỉ: {deliveryInfo.address || 'Chưa có địa chỉ'}</span>
                        </div>
                        {savedAddresses.find(addr => addr.id === selectedAddressId)?.isDefault && (
                            <div className="border border-solid border-beamin p-1 text-xs text-beamin">
                                Mặc định
                            </div>
                        )}
                        <span 
                            className="ml-3 text-blue-600 text-sm cursor-pointer hover:underline" 
                            onClick={() => setShowAddressModal(true)}
                        >
                            {savedAddresses.length > 0 ? 'Thay đổi' : 'Thêm địa chỉ'}
                        </span>
                    </div>
                </div>
                <div className="w-full bg-white rounded-md  flex flex-col pt-5 ">
                    <div className="ml-10">
                        The ChicKen Gang
                    </div>
                      <DetailsCheckout items={cartItems} />
                    <div className="border-t w-full  mt-4">                        <div className="ml-[40%]  flex flex-row justify-between items-center py-2 " >
                            <div className=" flex flex-row items-center gap-3">
                                <div className="text-beamin text-xl">
                                    <AccountBookOutlined />
                                </div>
                                <span className="text-base">Voucher của bạn</span>
                                {selectedVoucher && (
                                    <span className="text-sm text-green-600">
                                        ({selectedVoucher.name})
                                    </span>
                                )}
                            </div>
                            <div 
                                className="pr-10 text-blue-600 cursor-pointer hover:underline"
                                onClick={() => setShowVoucherModal(true)}
                            >
                                {selectedVoucher ? 'Thay đổi' : 'Chọn Voucher'}
                            </div>
                        </div>
                    </div>
                    <div className="border-t w-full grid grid-cols-12 h-28">
                        <div className="col-span-5 border-r pt-4 pl-9 pb-10 flex flex-row items-center gap-3">
                            <span className="text-nowrap">Lời Nhắn:</span>
                            <input 
                                type="text" 
                                placeholder="Lưu ý cho người bán" 
                                className="border-gray-300  focus-visible:border-beamin border border-solid  mr-3  w-full h-8 pl-1"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                        <div className="col-span-7">
                            <div className=" grid grid-cols-12 pt-4">
                                <div className="col-span-4 pt-3 text-sm ml-3">
                                    Phương thức vận chuyển:
                                </div>
                                <div className="col-span-4 flex flex-col gap-1">
                                    <span className="font-bold">Vận chuyển tiết kiệm</span>
                                    <span className="text-sm">Giao hàng từ 15-30 phút</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-blue-600 text-sm cursor-pointer"> Thay đổi</span>
                                </div>                                <div className="col-span-2">
                                    <span className=" text-sm"> ₫{shippingFee.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t w-full  h-16 flex justify-end pr-5 gap-2 items-center">
                        <span>Tổng số tiền ({cartItems.length} sản phẩm):
                        </span>
                        <span className="text-beamin font-bold">
                            ₫{subtotal.toLocaleString()}
                        </span>
                    </div>
                </div>
                <div className="w-full  flex flex-col bg-white rounded-md  pt-5 gap-3">
                    <div className="flex flex-row gap-3 pl-10 mb-4">
                        <div className="font-medium">
                            Phương Thức Thanh toán:
                        </div>
                        <div 
                            className={`border border-solid p-1 cursor-pointer ${paymentMethod === 'momo' ? 'border-beamin text-beamin' : 'border-gray-300 hover:border-beamin hover:text-beamin'}`}
                            onClick={() => setPaymentMethod('momo')}
                        >
                            MoMo
                        </div>
                        <div 
                            className={`border border-solid p-1 cursor-pointer ${paymentMethod === 'zalopay' ? 'border-beamin text-beamin' : 'border-gray-300 hover:border-beamin hover:text-beamin'}`}
                            onClick={() => setPaymentMethod('zalopay')}
                        >
                            ZaloPay
                        </div>
                        <div 
                            className={`border border-solid p-1 cursor-pointer ${paymentMethod === 'credit_card' ? 'border-beamin text-beamin' : 'border-gray-300 hover:border-beamin hover:text-beamin'}`}
                            onClick={() => setPaymentMethod('credit_card')}
                        >
                            Thẻ tín dụng/ Thẻ ghi nợ
                        </div>
                        <div 
                            className={`border border-solid p-1 cursor-pointer ${paymentMethod === 'cash_on_delivery' ? 'border-beamin text-beamin' : 'border-gray-300 hover:border-beamin hover:text-beamin'}`}
                            onClick={() => setPaymentMethod('cash_on_delivery')}
                        >
                            Thanh toán khi nhận hàng
                        </div>

                    </div>                    <div className="w-full   border-t flex flex-col justify-end items-end pt-4  gap-4">
                        <div className="flex justify-between w-[30%] ">
                            <div className="text-sm text-gray-900">
                                Tổng tiền hàng
                            </div>
                            <div className="text-sm mr-5">
                                ₫{subtotal.toLocaleString()}
                            </div>
                        </div>
                        <div className="flex justify-between w-[30%] ">
                            <div className="text-sm text-gray-900">
                                Phí vận chuyển
                            </div>
                            <div className="text-sm mr-5">
                                ₫{shippingFee.toLocaleString()}
                            </div>
                        </div>
                        <div className="flex justify-between w-[30%] ">
                            <div className="text-sm text-gray-900">
                                Tổng cộng Voucher giảm giá:
                            </div>
                            <div className="text-sm mr-5">
                                -₫{discountAmount.toLocaleString()}
                            </div>
                        </div>
                        <div className="flex justify-between w-[30%] ">
                            <div className="text-sm text-gray-900">
                                Tổng thanh toán
                            </div>
                            <div className="text-2xl mr-5 text-beamin">
                                ₫{total.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div className="w-full border-t  flex flex-row justify-between items-center  pt-4  gap-4 mb-4">
                        <div className="w-[70%] ml-8">
                            Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý tuân theo <span className="text-blue-600 text-sm cursor-pointer">Điều khoản Baemin</span>
                        </div>
                        <div className="w-[30%] pl-48 ">
                            <button 
                                onClick={handlePlaceOrder} 
                                disabled={loading || cartItems.length === 0}
                                className="p-1 bg-beamin text-white w-36 rounded-md h-10 hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                            </button>
                        </div>
                    </div>
                </div>            </div>            {/* Address Modal */}
            <Modal
                title="Chọn địa chỉ giao hàng"
                open={showAddressModal}
                onCancel={() => {
                    setShowAddressModal(false);
                    setIsAddingNewAddress(false);
                    setNewAddress({ name: "", phone: "", address: "" });
                }}
                footer={null}
                width={600}
            >
                <div className="space-y-4">
                    {/* Existing Addresses */}
                    {savedAddresses.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-3">Địa chỉ đã lưu</h4>
                            <Radio.Group 
                                value={selectedAddressId} 
                                onChange={(e) => handleAddressSelect(e.target.value)}
                                className="w-full"
                            >
                                <Space direction="vertical" className="w-full">
                                    {savedAddresses.map((address) => (
                                        <div key={address.id} className="border rounded-lg p-3 hover:bg-gray-50">
                                            <Radio value={address.id} className="w-full">
                                                <div className="flex justify-between items-start w-full">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <UserOutlined className="text-beamin" />
                                                            <span className="font-medium">{address.name}</span>
                                                            {address.isDefault && (
                                                                <span className="text-xs bg-beamin text-white px-2 py-1 rounded">
                                                                    Mặc định
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <PhoneOutlined className="text-gray-500" />
                                                            <span className="text-sm text-gray-600">{address.phone}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <HomeOutlined className="text-gray-500" />
                                                            <span className="text-sm text-gray-600">{address.address}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        {!address.isDefault && (
                                                            <Button 
                                                                size="small" 
                                                                type="link"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSetDefaultAddress(address.id);
                                                                }}
                                                            >
                                                                Đặt mặc định
                                                            </Button>
                                                        )}
                                                        {address.id !== 'profile' && (
                                                            <Button 
                                                                size="small" 
                                                                danger 
                                                                type="link"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteAddress(address.id);
                                                                }}
                                                            >
                                                                Xóa
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </Radio>
                                        </div>
                                    ))}
                                </Space>
                            </Radio.Group>
                        </div>
                    )}

                    <Divider />

                    {/* Add New Address */}
                    {!isAddingNewAddress ? (
                        <Button 
                            type="dashed" 
                            icon={<PlusOutlined />} 
                            onClick={() => setIsAddingNewAddress(true)}
                            block
                        >
                            Thêm địa chỉ mới
                        </Button>
                    ) : (
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <h4 className="text-sm font-medium mb-3">Thêm địa chỉ mới</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Họ tên</label>
                                    <Input
                                        value={newAddress.name}
                                        onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                                        placeholder="Nhập họ tên"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                                    <Input
                                        value={newAddress.phone}
                                        onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                                    <TextArea
                                        value={newAddress.address}
                                        onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                                        placeholder="Nhập địa chỉ giao hàng"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button 
                                        onClick={() => {
                                            setIsAddingNewAddress(false);
                                            setNewAddress({ name: "", phone: "", address: "" });
                                        }}
                                    >
                                        Hủy
                                    </Button>
                                    <Button 
                                        type="primary" 
                                        onClick={handleAddNewAddress}
                                        className="bg-beamin"
                                    >
                                        Thêm địa chỉ
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button onClick={() => setShowAddressModal(false)}>
                            Hủy
                        </Button>
                        <Button 
                            type="primary" 
                            onClick={() => setShowAddressModal(false)}
                            className="bg-beamin"
                            disabled={!deliveryInfo.address}
                        >
                            Xác nhận
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Voucher Modal */}
            <Modal
                title="Chọn voucher"
                open={showVoucherModal}
                onOk={() => setShowVoucherModal(false)}
                onCancel={() => setShowVoucherModal(false)}
                okText="Áp dụng"
                cancelText="Hủy"
                width={500}
            >
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    <div 
                        className={`border p-3 rounded cursor-pointer hover:bg-gray-50 ${!selectedVoucher ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                        onClick={() => setSelectedVoucher(null)}
                    >
                        <div className="font-medium">Không sử dụng voucher</div>
                    </div>
                    {availableVouchers.map((voucher) => (
                        <div
                            key={voucher.id}
                            className={`border p-3 rounded cursor-pointer hover:bg-gray-50 ${
                                selectedVoucher?.id === voucher.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                            }`}
                            onClick={() => setSelectedVoucher(voucher)}
                        >
                            <div className="font-medium">{voucher.name}</div>
                            <div className="text-sm text-gray-600">
                                Giảm {voucher.type === 'percentage' ? `${voucher.discount}%` : `₫${voucher.discount.toLocaleString()}`}
                            </div>
                            {voucher.type === 'percentage' && (
                                <div className="text-xs text-gray-500">
                                    Tối đa ₫{Math.min(50000, (subtotal * voucher.discount) / 100).toLocaleString()}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Modal>

        </>

    )


}