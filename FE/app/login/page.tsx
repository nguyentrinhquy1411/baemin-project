'use client'
import { EyeInvisibleOutlined, EyeTwoTone, FacebookOutlined, GoogleOutlined } from "@ant-design/icons";
import { Input, message } from "antd";
import Link from "next/link";
import React, { useState } from "react";
import { AuthService } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import PublicRoute from "@/components/public-route";

const Page: React.FC = () => {
    const router = useRouter();
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        account: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        account: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear error when typing
        if (errors[name as keyof typeof errors]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { account: '', password: '' };

        if (!formData.account) {
            newErrors.account = 'Vui lòng nhập tài khoản';
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const { login: authLogin } = useAuth();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await AuthService.login(formData);
            
            // Use auth context to login
            await authLogin(response.access_token, response.refresh_token);
            
            messageApi.success('Đăng nhập thành công!');
            
            // Redirect handled by PublicRoute component
        } catch (error: any) {
            console.error('Login error:', error);
            messageApi.error(error?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra tài khoản và mật khẩu.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <PublicRoute>
            {contextHolder}
            <div className="mt-14 w-1/3  bg-white border rounded-2xl flex flex-col p-5 gap-5 pb-8">
                <div className="flex justify-center items-center w-full text-beamin font-semibold text-[26px]">
                    Đăng Nhập
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col w-full gap-3">
                        <Input 
                            placeholder="Email/Số điện thoại/Tên đăng nhập" 
                            className="h-[40px]"
                            name="account"
                            value={formData.account}
                            onChange={handleChange}
                            status={errors.account ? "error" : ""}
                        />
                        {errors.account && (
                            <div className="text-red-500 text-xs mt-1">{errors.account}</div>
                        )}
                    </div>
                    <div className="flex flex-col w-full mt-3">
                        <Input.Password
                            placeholder="Mật khẩu"
                            className="h-[40px]"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            status={errors.password ? "error" : ""}
                        />
                        {errors.password && (
                            <div className="text-red-500 text-xs mt-1">{errors.password}</div>
                        )}
                    </div>
                    <div className="flex flex-col w-full mt-3">
                        <button 
                            type="submit" 
                            className="w-full h-[40px] uppercase text-white bg-beamin rounded-lg hover:bg-opacity-90 transition-colors"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                        </button>
                        <div className="flex flex-row justify-between items-center w-full text-sm text-beamin">
                            <span className="cursor-pointer">Quên mật khẩu</span>
                        </div>
                    </div>
                </form>
                <div className="flex items-center justify-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 text-sm text-gray-600">HOẶC</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
                <div className="flex flex-row items-center justify-center gap-5 h-[40px] ">
                    <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`} className="flex items-center justify-center gap-3 border w-full h-full p-1 text-beamin text-base">
                        <GoogleOutlined />
                        <span>Google</span>
                    </a>
                </div>
                <div className="flex items-center justify-center gap-1">
                    <span className="text-gray-600">Bạn mới biết đến Baemin?</span>
                    <Link className="text-beamin cursor-pointer" href={"/register"}>Đăng kí</Link>
                </div>
            </div>
        </PublicRoute>
    );
}
export default Page;