'use client'
import HeaderNav from "@/components/headerNav";
import ScrollBar from "@/components/scrollBar";
import ScrollFood from "@/components/scrollFood";
import { ClockCircleOutlined, ClockCircleTwoTone, DollarOutlined, DollarTwoTone, DoubleRightOutlined, LikeFilled, PlusOutlined, SearchOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import { Input } from "antd";
import Image from "next/image";
import React, { useState } from "react";

export default function Home() {

    const [isActive, setIsActive] = useState(false);

    const handleMouseDown = () => {
        setIsActive(true);
    };

    const handleMouseUp = () => {
        setIsActive(false);
    };


    return (<>
        <div className="flex flex-col w-full h-auto">
            <div className="bg-white w-full h-80 flex">
                <div className="w-[45%] h-full py-4 px-10">
                    <div className="w-full relative h-full" >
                        <Image layout="fill" objectFit="cover" src={"/food/ga1.jpg"} alt="Ga"></Image>
                    </div>
                </div>
                <div className=" w-[55%] h-full relative">
                    <div className="absolute top-0 left-0 px-8 py-4">
                        <span className="text-[13px] text-[#187CAA]"><a href="">Home</a> <DoubleRightOutlined className="text-[10px]" /> <a href="">TP.HCM</a> <DoubleRightOutlined className="text-[10px]" /> <a href="">Gà Rán Jollibee - Nguyễn Văn Cừ</a> </span>
                        <div className="flex flex-row text-[11px] justify-start items-center mt-3">
                            <div className="bg-beamin text-white p-1 mr-2 cursor-pointer tracking-wider flex gap-1">
                                <LikeFilled />
                                <span>Yêu thích</span>
                            </div>
                            <span className="text-[#959595]">QUÁN ĂN - <a href="" className="text-[#0288D1]">Chi nhánh</a></span>
                        </div>
                        <div className="text-[22px] font-bold mt-2">Gà Rán Jollibee - Nguyễn Văn Cừ</div>
                        <div className="text-[13px] mt-1">
                            356 Trần Hưng Đạo, Phường 2, Quận 5, TP.Hồ Chí Minh
                        </div>
                        <div className="flex flex-row text-[14px] gap-2 justify-start items-center">
                            <ol className="flex flex-row text-[#FFC107] gap-1">
                                <li><StarFilled /></li>
                                <li><StarFilled /></li>
                                <li><StarFilled /></li>
                                <li><StarFilled /></li>
                                <li><StarOutlined /></li>
                            </ol>
                            <p className="bg-[#FFC107] py-[2px] px-1 text-white rounded-md">999+</p>
                            <span>đánh giá trên Baemin</span>
                        </div>
                        <div className="flex flex-row gap-4 justify-start items-center my-1 text-[15px]">
                            <div className="flex flex-row gap-1 text-[#6CC942] justify-start items-center">
                                <div className="w-2 h-2 bg-[#6CC942] rounded-full"></div>
                                <span>Mở cửa</span>
                            </div>
                            <div className="flex flex-row gap-1 justify-start items-center">
                                <ClockCircleTwoTone twoToneColor={"#3AC5C9"} />
                                <span>06:00 - 22:59</span>
                            </div>
                        </div>
                        <div className="flex flex-row gap-1 justify-start items-center text-[#959595] text-[15px]">
                            <DollarTwoTone twoToneColor={"#c0c0c0"} className="text-[16px]" />
                            <span> 99.000 - 399.000</span>
                        </div>
                    </div>

                    <div className="w-full flex flex-col absolute bottom-0 left-0 px-8 mb-4 text-[#959595] text-[13px]">
                        <div className="border-t-[1px]"></div>
                        <div className="flex flex-row gap-4 justify-start items-center py-[10px]">
                            <div className="flex flex-col ">
                                <span>PHÍ DỊCH VỤ</span>
                                <span className="text-beamin font-bold text-[14px]">0.8% Phí dịch vụ</span>
                            </div>
                            <div className="border-l border-solid h-6"></div>
                            <div className="flex flex-col">
                                <span>DỊCH VỤ BỞI</span>
                                <span className="text-beamin font-bold text-[14px]">Baemin</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full">
                <div className="py-[13px] px-[26px] font-bold text-beamin text-[14px]">THỰC ĐƠN</div>
                <div className="w-full flex flex-row gap-3">
                    <div className="w-[20%] bg-white p-5">
                        <ul>
                            <li
                                className={`cursor-pointer w-fit px-1 ${isActive ? '' : 'bg-[#959595] text-white'}`}
                                onMouseDown={handleMouseDown}
                                onMouseUp={handleMouseUp}
                            >
                                SẢN PHẨM MỚI
                            </li>
                            <li className="mt-2 px-1 w-fit" >FAMILY COMBO</li>
                            <li className="mt-2 px-1 w-fit ">GÀ RÁN</li>
                            <li className="mt-2 px-1  w-fit">BURGER</li>
                        </ul>
                    </div>
                    <div className="w-[50%] h-auto bg-white py-3 flex flex-col px-4">
                        <div className="w-full mb-5">
                            <Input addonBefore={<SearchOutlined />} placeholder="" />
                        </div>
                        <div className="flex flex-col w-full pl-1 gap-3">
                            <div className="font-medium">
                                MÓN ĐANG GIẢM
                            </div>
                            <div className="flex flex-col w-full gap-43 border-b">
                                <div className="flex flex-row ">
                                    <div className="w-[15%] relative h-16">
                                        <Image layout="fill" objectFit="cover" src={'/images/Ga.png'} alt="s" ></Image>
                                    </div>
                                    <div className="w-[60%] flex flex-col gap-1 px-2">
                                       <span className="font-bold text-[#464646] ">Mua 2 Tặng 2 Gà Rán </span>
                                       <span className="text-wrap text-sm text-[#464646] " >Bao gồm: 4 Miếng Gà (Cay/Không Cay), 2 Nước Vừa. Đã bao gồm 2x Tương Cà, 1x Tương Ớt Ngọt, 1x Tương Ớt Tỏi</span> 
                                    </div>
                                    <div className="w-[15%] flex justify-center items-center">
                                        <span className="text-[#0288d1] font-bold text-base">118.000đ</span>
                                    </div>
                                    <div className="w-[10%] flex justify-center items-center">
                                        <div  className="h-6 w-6 rounded-md flex justify-center items-center bg-beamin text-white font-bold cursor-pointer hover:brightness-110 " ><PlusOutlined /></div>
                                    </div>
                                </div>
                                <div className="flex flex-row ">
                                    <div className="w-[15%] relative h-16">
                                        <Image layout="fill" objectFit="cover" src={'/images/Ga.png'} alt="s" ></Image>
                                    </div>
                                    <div className="w-[60%] flex flex-col gap-1 px-2">
                                       <span className="font-bold text-[#464646] ">Mua 2 Tặng 2 Gà Rán </span>
                                       <span className="text-wrap text-sm text-[#464646] " >Bao gồm: 4 Miếng Gà (Cay/Không Cay), 2 Nước Vừa. Đã bao gồm 2x Tương Cà, 1x Tương Ớt Ngọt, 1x Tương Ớt Tỏi</span> 
                                    </div>
                                    <div className="w-[15%] flex justify-center items-center">
                                        <span className="text-[#0288d1] font-bold text-base">118.000đ</span>
                                    </div>
                                    <div className="w-[10%] flex justify-center items-center">
                                        <div  className="h-6 w-6 rounded-md flex justify-center items-center bg-beamin text-white font-bold cursor-pointer hover:brightness-110 " ><PlusOutlined /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-[30%] bg-white"></div>
                </div>
            </div>

        </div>


    </>)
}