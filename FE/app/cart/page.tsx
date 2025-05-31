'use client';

import HeaderNav from "@/components/headerNav";
import ScrollBar from "@/components/scrollBar";
import ScrollFood from "@/components/scrollFood";
import { ShoppingCartOutlined } from "@ant-design/icons";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import DetailsCart from "./detailsCart";
import { Button } from "antd";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const { cart, getCartTotal, getCartItemCount } = useCart();
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    
    // Selection state management
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [selectedStalls, setSelectedStalls] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        router.push('/login');
        return null;
    }    // Convert cart data to the format expected by DetailsCart component
    const formatCartData = () => {
        if (!cart || cart.stalls.length === 0) return [];
        
        return cart.stalls.map(stall => ({
            id: stall.stall_id,
            name: stall.stall_name,
            quandoitac: true, // You can determine this based on stall data
            items: stall.items.map(item => ({
                namefood: item.name,
                img: item.image_url,
                description: item.description,
                price: item.price,
                quantity: item.quantity,
                totalprice: item.price * item.quantity,
                id: item.food_id, // Use food_id as the unique identifier
                cart_item_id: item.id // Keep the cart item ID for operations
            }))
        }));
    };

    const cartData = formatCartData();
    const totalItems = getCartItemCount();
    const totalAmount = getCartTotal();

    // Calculate selected items totals
    const getSelectedTotals = () => {
        let selectedItemCount = 0;
        let selectedTotalAmount = 0;

        cartData.forEach(stall => {
            stall.items.forEach((item: any) => {
                if (selectedItems.has(item.id)) {
                    selectedItemCount += item.quantity;
                    selectedTotalAmount += item.totalprice;
                }
            });
        });

        return { selectedItemCount, selectedTotalAmount };
    };

    const { selectedItemCount, selectedTotalAmount } = getSelectedTotals();

    // Selection handlers
    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            const allItemIds = new Set<string>();
            const allStallIds = new Set<string>();
            
            cartData.forEach(stall => {
                allStallIds.add(stall.id);
                stall.items.forEach((item: any) => {
                    allItemIds.add(item.id);
                });
            });
            
            setSelectedItems(allItemIds);
            setSelectedStalls(allStallIds);
        } else {
            setSelectedItems(new Set());
            setSelectedStalls(new Set());
        }
    };

    const handleStallSelect = (stallId: string, checked: boolean) => {
        const newSelectedStalls = new Set(selectedStalls);
        const newSelectedItems = new Set(selectedItems);

        if (checked) {
            newSelectedStalls.add(stallId);
            // Add all items from this stall
            const stall = cartData.find(s => s.id === stallId);
            if (stall) {
                stall.items.forEach((item: any) => {
                    newSelectedItems.add(item.id);
                });
            }
        } else {
            newSelectedStalls.delete(stallId);
            // Remove all items from this stall
            const stall = cartData.find(s => s.id === stallId);
            if (stall) {
                stall.items.forEach((item: any) => {
                    newSelectedItems.delete(item.id);
                });
            }
        }

        setSelectedStalls(newSelectedStalls);
        setSelectedItems(newSelectedItems);
        
        // Update select all state
        const allItemIds = cartData.flatMap(stall => stall.items.map((item: any) => item.id));
        setSelectAll(allItemIds.every(id => newSelectedItems.has(id)));
    };

    const handleItemSelect = (itemId: string, checked: boolean) => {
        const newSelectedItems = new Set(selectedItems);

        if (checked) {
            newSelectedItems.add(itemId);
        } else {
            newSelectedItems.delete(itemId);
        }

        setSelectedItems(newSelectedItems);

        // Update stall selection state
        const newSelectedStalls = new Set<string>();
        cartData.forEach(stall => {
            const allStallItemsSelected = stall.items.every((item: any) => 
                newSelectedItems.has(item.id)
            );
            if (allStallItemsSelected && stall.items.length > 0) {
                newSelectedStalls.add(stall.id);
            }
        });
        setSelectedStalls(newSelectedStalls);

        // Update select all state
        const allItemIds = cartData.flatMap(stall => stall.items.map((item: any) => item.id));
        setSelectAll(allItemIds.every(id => newSelectedItems.has(id)));
    };

    // Update selection state when cart changes
    useEffect(() => {
        if (cartData.length === 0) {
            setSelectedItems(new Set());
            setSelectedStalls(new Set());
            setSelectAll(false);
        } else {
            // Remove selected items that no longer exist in cart
            const existingItemIds = cartData.flatMap(stall => 
                stall.items.map((item: any) => item.id)
            );
            
            const newSelectedItems = new Set(
                Array.from(selectedItems).filter(id => existingItemIds.includes(id))
            );
            setSelectedItems(newSelectedItems);

            const existingStallIds = cartData.map(stall => stall.id);
            const newSelectedStalls = new Set(
                Array.from(selectedStalls).filter(id => existingStallIds.includes(id))
            );
            setSelectedStalls(newSelectedStalls);
        }
    }, [cart]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };    const handleCheckout = () => {
        if (selectedItemCount > 0) {
            // Prepare selected items data for checkout
            const selectedCartItems = cartData.flatMap(stall => 
                stall.items.filter((item: any) => selectedItems.has(item.id))
                .map((item: any) => ({
                    id: item.id, // This is food_id
                    name: item.namefood,
                    description: item.description,
                    price: item.price,
                    quantity: item.quantity,
                    img: item.img,
                    stall_id: stall.id,
                    stall_name: stall.name,
                }))
            );
            
            // Store selected items in sessionStorage for checkout
            sessionStorage.setItem('selectedCartItems', JSON.stringify(selectedCartItems));
            router.push('/checkout');
        }
    };

    const handleClearSelected = () => {
        setSelectedItems(new Set());
        setSelectedStalls(new Set());
        setSelectAll(false);
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
                        Giỏ hàng
                    </div>
                </div>
                <div className="w-1/2 h-full flex   items-center gap-3">
                </div>
            </div>
            
            <div className="mt-4 px-16 flex flex-col gap-4 pb-16 rounded-md">
                {cartData.length === 0 ? (
                    <div className="w-full h-96 bg-white rounded-md flex flex-col items-center justify-center gap-4">
                        <ShoppingCartOutlined style={{ fontSize: '64px', color: '#gray' }} />
                        <div className="text-xl text-gray-500">Giỏ hàng của bạn đang trống</div>
                        <div className="text-gray-400">Hãy thêm một số món ăn yêu thích vào giỏ hàng</div>
                        <Button 
                            onClick={() => router.push('/dashboard')}
                            style={{ background: '#3AC5C9', color: 'white' }}
                            className="mt-4"
                        >
                            Tiếp tục mua sắm
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="w-full h-16 bg-white grid grid-cols-12">
                            <div className="pl-8 col-span-4 flex items-center flex-row gap-5">
                                <input 
                                    id="select-all-checkbox" 
                                    type="checkbox" 
                                    checked={selectAll}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:ring-offset-gray-800" 
                                />
                                <span className="text-base font-normal"> Chọn tất cả ({totalItems} sản phẩm)</span>
                            </div>
                            <div className="col-span-2 flex items-center justify-center flex-row gap-3">
                                <span className="text-base font-normal text-gray-600">Đơn giá</span>
                            </div>
                            <div className="col-span-2 flex items-center justify-center flex-row gap-3">
                                <span className="text-base font-normal text-gray-600">Số lượng</span>
                            </div>
                            <div className="col-span-2 flex items-center justify-center flex-row gap-3">
                                <span className="text-base font-normal text-gray-600">Số tiền</span>
                            </div>
                            <div className="col-span-2 flex items-center justify-center flex-row gap-3">
                                <span className="text-base font-normal text-gray-600">Thao tác</span>
                            </div>
                        </div>
                        
                        <DetailsCart 
                            Details={cartData}
                            selectedItems={selectedItems}
                            selectedStalls={selectedStalls}
                            onItemSelect={handleItemSelect}
                            onStallSelect={handleStallSelect}
                        />
                        
                        <div className="flex flex-row fixed bottom-0 w-[90.6%] mr-16 h-16 bg-white items-center border-t">
                            <div className="flex flex-row gap-2 w-1/2 h-full items-center ml-10">
                                <div className="cursor-pointer hover:text-red-600" onClick={handleClearSelected}>
                                    Bỏ chọn
                                </div>
                                <div>Đã chọn:</div>
                                <div>{selectedItemCount} sản phẩm từ {selectedStalls.size} quán</div>
                            </div>
                            <div className="flex flex-row gap-2 w-1/2 h-full items-center justify-end pr-2"> 
                                <div>Tổng thanh toán ({selectedItemCount} Sản phẩm):</div>
                                <div className="text-red-600">{formatPrice(selectedTotalAmount)}</div>
                                <div>
                                    <Button 
                                        onClick={handleCheckout}
                                        disabled={selectedItemCount === 0}
                                        style={{
                                            background: selectedItemCount > 0 ? '#3AC5C9' : '#gray', 
                                            color: 'white'
                                        }}  
                                        className="bg-beamin text-white w-40 h-10 rounded-md hover:brightness-105 disabled:opacity-50" 
                                    >
                                        Thanh toán ({selectedItemCount})
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}