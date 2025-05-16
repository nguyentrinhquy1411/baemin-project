import HeaderNav from "@/components/headerNav";
import ScrollBar from "@/components/scrollBar";
import ScrollFood from "@/components/scrollFood";
import Image from "next/image";
import React from "react";

export default function Home() {
    const items = [
        { name: "Gà Rán", imageSrc: "/images/Ga.png", description: "Thức ăn nhanh" },
        { name: "Burger", imageSrc: "/images/burger.jpg", description: "Thức ăn nhanh" },
        { name: "Bún", imageSrc: "/images/noddle.png", description: "Thức ăn nhanh" },
        { name: "Mì", imageSrc: "/images/noddle.png", description: "Thức ăn nhanh" },
        { name: "Burger", imageSrc: "/images/noddle.png", description: "Thức ăn nhanh" },
    ];

    const banneritems = [
        {
            id: '1',
            name: 'anh 1',
            url: '/images/map1.png',
        },
        {
            id: '2',
            name: 'anh 2',
            url: '/images/map2.png',
        },
        {
            id: '3',
            name: 'anh 32',
            url: '/images/map3.png',
        },
        {
            id: '3',
            name: 'anh 32',
            url: '/images/map4.png',
        }
    ]
    const TodayFood = {
        title: 'Hôm Nay ăn gì',
        items: [
            {
                id: '1',
                name: ' Gà Ủ Muối Hoa Tiêu - Food',
                adrress: '4A Đường Số 71, P. Tân Quy, Quận 7, TP. HCM',
                img: '/food/ga1.jpg',
                kind: 'Quan An'
            },
            {
                id: '1',
                name: ' Gà Ủ Muối Hoa Tiêu - Food',
                adrress: '4A Đường Số 71, P. Tân Quy, Quận 7, TP. HCM',
                img: '/food/ga1.jpg',
                kind: 'Quan An'
            },
            {
                id: '1',
                name: ' Gà Ủ Muối Hoa Tiêu - Food',
                adrress: '4A Đường Số 71, P. Tân Quy, Quận 7, TP. HCM',
                img: '/food/ga1.jpg',
                kind: 'Quan An'
            },
            {
                id: '1',
                name: ' Gà Ủ Muối Hoa Tiêu - Food',
                adrress: '4A Đường Số 71, P. Tân Quy, Quận 7, TP. HCM',
                img: '/food/ga1.jpg',
                kind: 'Quan An'
            },
            {
                id: '1',
                name: ' Gà Ủ Muối Hoa Tiêu - Food',
                adrress: '4A Đường Số 71, P. Tân Quy, Quận 7, TP. HCM',
                img: '/food/ga1.jpg',
                kind: 'Quan An'
            },
            {
                id: '1',
                name: ' Gà Ủ Muối Hoa Tiêu - Food',
                adrress: '4A Đường Số 71, P. Tân Quy, Quận 7, TP. HCM',
                img: '/food/ga1.jpg',
                kind: 'Quan An'
            },

        ]
    }
    return (
        <>
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 pt-3 pl-8 pr-8  z-40">
                    <div className="flex flex-col fixed  bg-white w-64 rounded-2xl  pl-3 pt-2  pb-5 gap-3  ">
                        <span>Thực đơn </span>
                        {items.map((item, index) => (
                            <div key={index} className="flex flex-col gap-3 cursor-pointer hover:bg-slate-100">
                                <div className="flex flex-row items-center gap-1">
                                    <Image src={item.imageSrc} width={30} height={30} alt={item.description} />
                                    <span>{item.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-span-9 w-full  pt-3 pr-8 gap-3 flex flex-col">
                    <ScrollBar items={banneritems} ></ScrollBar>
                    <ScrollFood items={TodayFood}></ScrollFood>
                    <ScrollFood items={TodayFood}></ScrollFood>
                </div>

            </div>

        </>
    )
}