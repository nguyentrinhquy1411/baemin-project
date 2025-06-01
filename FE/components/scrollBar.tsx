"use client";

import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { BhuTuka_Expanded_One } from "next/font/google";
import Image from "next/image";
import React, { useRef } from "react";
import { useState } from "react";

export default function ScrollBar({ items }: { items: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const handleNext = () => {
    if (containerRef.current) {
      if (items.length - 1 > currentIndex) setCurrentIndex(currentIndex + 1);
      containerRef.current.scrollBy({ left: 489, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (containerRef.current) {
      if (0 < currentIndex) setCurrentIndex(currentIndex - 1);
      containerRef.current.scrollBy({ left: -489, behavior: "smooth" });
    }
  };
  return (
    <>
      <div
        className="w-full relative"
        style={{
          height: "300px",
          minHeight: "300px",
          maxHeight: "300px",
        }}
      >
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute hover:text-beamin hover:bg-slate-50 bg-white top-32 left-6 w-8 h-8 rounded-full z-20"
          >
            <LeftOutlined />
          </button>
        )}{" "}
        <div
          ref={containerRef}
          className="relative scroll-container flex bg-white rounded-2xl w-full p-4 gap-2"
          style={{
            height: "300px",
            minHeight: "300px",
            maxHeight: "300px",
            overflow: "hidden",
            overflowX: "auto",
          }}
        >
          {items.map((item: any, index: any) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-1/2 bg-blue-200 p-4 cursor-pointer"
              style={{
                height: "268px", // 300px - padding (16px x 2)
                minHeight: "268px",
              }}
            >
              <Image layout="fill" objectFit="cover" src={item.url} alt=""></Image>
            </div>
          ))}
        </div>
        {currentIndex < items.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute hover:text-beamin hover:bg-slate-50 bg-white top-32 right-3 w-8 h-8 rounded-full z-20"
          >
            <RightOutlined />
          </button>
        )}
      </div>
    </>
  );
}
