'use client';

import { Button } from "antd";
import { Butterfly_Kids } from "next/font/google";
import Image from "next/image";
import React from "react";
import { useCart } from "@/contexts/cart-context";

export default function DetailsCart({ 
    Details, 
    selectedItems, 
    selectedStalls, 
    onItemSelect, 
    onStallSelect 
}: {
    Details: any[];
    selectedItems: Set<string>;
    selectedStalls: Set<string>;
    onItemSelect: (itemId: string, checked: boolean) => void;
    onStallSelect: (stallId: string, checked: boolean) => void;
}) {
    const { updateQuantity, removeFromCart } = useCart();

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity > 0) {
            updateQuantity(itemId, newQuantity);
        }
    };

    const handleRemoveItem = (itemId: string) => {
        removeFromCart(itemId);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    return (
        <>        {Details.map((items, index) => (
            <div key={index} className="w-full flex flex-col  bg-white rounded-md ">
                
                    <div className=" flex flex-row my-7 ml-8 items-center gap-3">
                        <input 
                            id={`stall-checkbox-${items.id}`} 
                            type="checkbox" 
                            checked={selectedStalls.has(items.id)}
                            onChange={(e) => onStallSelect(items.id, e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded   dark:ring-offset-gray-800 " 
                        />
                        <span className="text-base font-normal"> {items.name}</span>
                        <div className=" bg-beamin p-1 rounded-md">
                            {items.quandoitac && (
                                <span className="text-sm font-normal text-white">
                                    Quán đối tác
                                </span>
                            )}
                        </div>
                    </div>
                    <div className=" w-full border-t border-b border-solid border-gray-600 py-3">
                            {items.items.map((item: any, index: any) => (
                                <div key={index} className={index === items.items.length - 1 ? "w-full grid grid-cols-12" : "w-full grid grid-cols-12 border-b border-solid border-x-gray-300"}
                                >                                    <div className="pl-8  col-span-4 flex items-center flex-row gap-3">
                                        <input 
                                            id={`item-checkbox-${item.id}`} 
                                            type="checkbox" 
                                            checked={selectedItems.has(item.id)}
                                            onChange={(e) => onItemSelect(item.id, e.target.checked)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded   dark:ring-offset-gray-800 " 
                                        />                                        <div className="relative h-36 w-36">
                                            <Image 
                                                fill 
                                                className="object-cover" 
                                                src={item.img} 
                                                alt={item.namefood || "Food item"} 
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <span className="text-base ">{item.namefood}</span>
                                            <span className="text-sm text-gray-600">{item.description}</span>
                                        </div>
                                    </div><div className="col-span-2 flex items-center justify-center flex-row gap-3">
                                        {formatPrice(item.price)}
                                    </div>
                                    <div className="col-span-2 flex items-center justify-center flex-row gap-3">
                                        <input 
                                            type="number" 
                                            id="quantity" 
                                            className="w-16 text-center border border-gray-300 rounded" 
                                            value={item.quantity} 
                                            min="1" 
                                            max="100"
                                            onChange={(e) => {
                                                const newQuantity = parseInt(e.target.value);
                                                if (!isNaN(newQuantity) && item.id) {
                                                    handleQuantityChange(item.id, newQuantity);
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="col-span-2 flex items-center justify-center flex-row gap-3">
                                        {formatPrice(item.totalprice)}
                                    </div>
                                    <div className="col-span-2 flex items-center justify-center flex-row gap-3">
                                        <span 
                                            className=" hover:text-red-600 cursor-pointer"
                                            onClick={() => item.id && handleRemoveItem(item.id)}
                                        >
                                            Xóa
                                        </span>
                                    </div>

                                </div>
                            ))}
                        </div>
                       
                
            </div>
            ))}
            


        </>
    )

}