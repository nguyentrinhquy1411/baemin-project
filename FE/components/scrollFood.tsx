'use client'
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

// Define a Badge type
interface Badge {
    text: string;
    color: string;
}

// Define item type with optional badge
interface ScrollFoodItem {
    id: string;
    name: string;
    adrress: string;
    img: string;
    kind: string;
    rating?: number;
    badge?: Badge;
    onClick?: () => void;
}

interface ScrollFoodProps {
    items: {
        title: string;
        items: ScrollFoodItem[];
    }
}

export default function ScrollFood({ items }: ScrollFoodProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const handleNavigate = (item: ScrollFoodItem) => {
        if (item.onClick) {
            item.onClick();
        } else {
            // Default behavior - navigate to food detail
            router.push(`/detailfood/${item.id}`);
        }
    };
    const containerRef = React.useRef<HTMLDivElement>(null);
    const handleNext = () => {
        if (containerRef.current) {
            if(items.items.length-1>currentIndex) setCurrentIndex(currentIndex+1)
            containerRef.current.scrollBy({ left: 180, behavior: 'smooth' });
        }
    };

    const handlePrev = () => {
        if (containerRef.current) {
            if(0<currentIndex) setCurrentIndex(currentIndex-1)
            containerRef.current.scrollBy({ left: -180, behavior: 'smooth' });
        }
    };

    return (
        <>
            <div className=" bg-white rounded-2xl w-full flex-shrink-0" style={{ height: '300px' }}>
                <div className="w-full h-full flex flex-col px-4 pt-4 pb-2" style={{ height: '300px' }}>
                    <div className="relative ml-3 text-xl font-bold mb-2">  {items.title} </div>
                    <div className="w-full relative h-full">
                    {currentIndex>0 &&
                        <button onClick={handlePrev} className="absolute hover:text-beamin hover:bg-slate-50 bg-white top-20  w-8 h-8 rounded-full z-20" ><LeftOutlined /></button>
                    }
                        <div ref={containerRef} className=" scroll-container  w-full h-full flex flex-row gap-3">

                            {items.items.map((item: ScrollFoodItem, index: number) => (
                                <div key={item.id} onClick={() => handleNavigate(item)} className=" group w-48 h-full cursor-pointer " >
                                    <div className="w-full h-2/3 relative" >
                                        <div className="group-hover:brightness-75" style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <Image layout="fill" objectFit="cover" src={item.img} alt={item.name || "Food image"}></Image>
                                            
                                            {/* Badge component */}
                                            {item.badge && (
                                                <div className={`absolute top-2 right-2 py-1 px-3 rounded-full text-white text-xs font-medium ${item.badge.color}`}>
                                                    {item.badge.text}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="group-hover:bg-slate-50 w-full h-1/3  flex flex-col pl-2 pr-2 border-solid border-2  border-beamin-50">
                                        <div className="w-full truncate text-base ">
                                            <span  > {item.name} </span>
                                        </div>
                                        <div className="w-full truncate text-sm " style={{ color: '#959595' }}>
                                            <span> {item.adrress}</span>
                                        </div>
                                        <div className="w-full text-sm border-t  border-beamin-50 mt-2 ">
                                            <span className="mt-2">
                                                {item.kind}
                                                {item.rating && !item.badge && (
                                                    <span className="ml-1 text-amber-500">
                                                        {item.rating.toFixed(1)} ★
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {currentIndex<items.items.length-1 &&
                        <button onClick={handleNext} className="absolute hover:text-beamin hover:bg-slate-50 bg-white top-20 right-1  w-8 h-8 rounded-full z-20" ><RightOutlined /></button>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}