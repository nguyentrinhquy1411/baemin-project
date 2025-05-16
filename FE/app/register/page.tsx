'use client'
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Input } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Page: React.FC = () => {
    const router = useRouter();
    const handleNavigate = () => {
       
          router.push('/login');
        
      };
    return(
        <>
         <div className="mt-28 w-1/3  bg-white border rounded-2xl flex flex-col p-5 gap-5 pb-8">
                <div className="flex justify-center items-center w-full text-beamin font-semibold text-[26px]">
                    Đăng Kí
                </div>
                <div className="flex flex-row w-full gap-2">
                    <Input placeholder="Họ " className="h-[40px]" />
                    <Input placeholder="Tên" className="h-[40px]" />
                </div>
                <div className="flex flex-col w-full gap-3">
                    <Input placeholder="Tên đăng nhập" className="h-[40px]" />
                </div>
                <div className="flex flex-col w-full gap-3">
                    <Input placeholder="Số điện thoại" className="h-[40px]" />
                </div>
                <div className="flex flex-col w-full gap-3">
                    <Input placeholder="Email" className="h-[40px]" />
                </div>
                <div className="flex flex-col w-full ">
                    <Input.Password
                        placeholder="Mật khẩu"
                        className="h-[40px]"
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    />
                </div>
                <div className="flex flex-col w-full ">
                    <Input.Password
                        placeholder="Nhập lại mật khẩu"
                        className="h-[40px]"
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    />
                </div>
                <div className="flex flex-col w-full">
                    <button className="w-full h-[40px] uppercase text-white bg-beamin rounded-lg">Đăng Nhập</button>
                </div>
                <div className="flex items-center justify-center gap-1">
                        <span className="text-gray-600">Bạn đã có tài khoản? 
                        </span>
                        <Link className="text-beamin cursor-pointer" href={"/login"}> Đăng nhập</Link>
                    </div>  
            </div>
        </>


    );

}
export default Page;