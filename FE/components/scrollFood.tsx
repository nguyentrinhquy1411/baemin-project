"use client";
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
  };
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
      if (items.items.length - 1 > currentIndex) setCurrentIndex(currentIndex + 1);
      containerRef.current.scrollBy({ left: 180, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (containerRef.current) {
      if (0 < currentIndex) setCurrentIndex(currentIndex - 1);
      containerRef.current.scrollBy({ left: -180, behavior: "smooth" });
    }
  };
  return (
    <>
      {" "}
      <div className="bg-white rounded-2xl w-full flex-shrink-0" style={{ height: "340px" }}>
        <div className="w-full h-full flex flex-col px-4 pt-4 pb-3">
          <div className="ml-3 text-xl font-bold mb-3">{items.title}</div>
          <div className="w-full relative" style={{ height: "280px" }}>
            {currentIndex > 0 && (
              <button
                onClick={handlePrev}
                className="absolute hover:text-beamin hover:bg-slate-50 bg-white top-1/2 -translate-y-1/2 left-0 w-9 h-9 rounded-full z-20 flex items-center justify-center shadow-lg border border-gray-200"
              >
                <LeftOutlined />
              </button>
            )}

            <div
              ref={containerRef}
              className="scroll-container w-full h-full flex flex-row gap-3 overflow-x-hidden px-2"
            >
              {items.items.map((item: ScrollFoodItem, index: number) => (
                <div
                  key={item.id}
                  onClick={() => handleNavigate(item)}
                  className="group w-48 cursor-pointer flex-shrink-0 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                  style={{ height: "260px" }}
                >
                  <div className="w-full relative rounded-t-lg overflow-hidden" style={{ height: "160px" }}>
                    <div className="group-hover:brightness-75 w-full h-full relative transition-all duration-200">
                      <Image fill className="object-cover" src={item.img} alt={item.name || "Food image"} />

                      {/* Badge component */}
                      {item.badge && (
                        <div
                          className={`absolute top-2 right-2 py-1 px-3 rounded-full text-white text-xs font-medium ${item.badge.color}`}
                        >
                          {item.badge.text}
                        </div>
                      )}
                    </div>
                  </div>{" "}
                  <div
                    className="group-hover:bg-slate-50 w-full flex flex-col px-3 py-2 transition-colors duration-200"
                    style={{ height: "100px" }}
                  >
                    <div className="w-full truncate text-base font-medium">
                      <span>{item.name}</span>
                    </div>
                    <div className="w-full truncate text-xs text-gray-500 mt-1">
                      <span>{item.adrress}</span>
                    </div>{" "}
                    <div className="w-full flex items-center justify-between text-sm border-t border-gray-100 pt-2 mt-auto">
                      <span className="truncate max-w-[70%]">{item.kind}</span>
                      {item.rating !== undefined && !item.badge && (
                        <span
                          className={`font-medium whitespace-nowrap flex items-center ${
                            item.rating > 0 ? "text-amber-500" : "text-gray-400"
                          }`}
                        >
                          {item.rating ? item.rating.toFixed(1) : "0.0"} <span className="ml-0.5">★</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {currentIndex < items.items.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute hover:text-beamin hover:bg-slate-50 bg-white top-1/2 -translate-y-1/2 right-0 w-9 h-9 rounded-full z-20 flex items-center justify-center shadow-lg border border-gray-200"
              >
                <RightOutlined />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
