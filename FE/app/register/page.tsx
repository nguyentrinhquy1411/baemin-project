'use client'
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Input, Form, Alert, message } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axiosInstance from "../../lib/axios";

const Page: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [apiError, setApiError] = useState<string | null>(null);
    
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Xóa lỗi khi người dùng bắt đầu sửa trường đó
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[name];
                return newErrors;
            });
        }
        
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const [loading, setLoading] = useState(false);
    
    // Hàm kiểm tra form
    const validateForm = (): boolean => {
        const newErrors: {[key: string]: string} = {};
        
        // Kiểm tra các trường bắt buộc
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Vui lòng nhập tên';
        }
        
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Vui lòng nhập họ';
        }
        
        if (!formData.username.trim()) {
            newErrors.username = 'Vui lòng nhập tên đăng nhập';
        } else if (formData.username.length < 4) {
            newErrors.username = 'Tên đăng nhập phải có ít nhất 4 ký tự';
        }
        
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
        } else if (!/^[0-9]+$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Số điện thoại chỉ được chứa số';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không đúng định dạng';
        }
        
        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu nhập lại không khớp';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        // Reset api error
        setApiError(null);
        
        // Kiểm tra dữ liệu nhập vào
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await axiosInstance.post('/users/sign-up', {
                first_name: formData.firstName,
                last_name: formData.lastName,
                username: formData.username,
                phone: formData.phoneNumber,
                email: formData.email,
                password: formData.password
            });
            
            const data = response.data;
            
            if (response.status !== 201 && response.status !== 200) {
                throw new Error(data.error?.message || 'Đăng ký thất bại');
            }
            
            message.success('Đăng ký thành công!');
            router.push('/login');
        } catch (error: any) {
            console.error('Error:', error);
            
            // Xử lý lỗi từ Axios một cách chi tiết hơn
            if (error.response) {
                // Server trả về lỗi với status code
                const errorMessage = error.response.data.error?.message || 
                                     error.response.data.message || 
                                     'Đăng ký thất bại';
                setApiError(errorMessage);
                
                // Xử lý lỗi validation từ server nếu có
                if (error.response.data.errors) {
                    const serverErrors = error.response.data.errors;
                    const fieldErrors: {[key: string]: string} = {};
                    
                    // Map các lỗi từ server về format phù hợp với client
                    Object.keys(serverErrors).forEach(field => {
                        // Chuyển đổi tên trường từ snake_case sang camelCase nếu cần
                        let clientField = field;
                        if (field === 'first_name') clientField = 'firstName';
                        if (field === 'last_name') clientField = 'lastName';
                        if (field === 'phone') clientField = 'phoneNumber';
                        
                        fieldErrors[clientField] = serverErrors[field];
                    });
                    
                    setErrors(prev => ({...prev, ...fieldErrors}));
                }
            } else if (error.request) {
                // Request đã được tạo nhưng không nhận được response
                setApiError('Không thể kết nối đến máy chủ, vui lòng thử lại sau');
            } else {
                // Có lỗi khi tạo request
                setApiError('Đăng ký thất bại, vui lòng thử lại');
            }
        } finally {
            setLoading(false);
        }
    }



    return(
        <>
         <div className="mt-28 w-1/3  bg-white border rounded-2xl flex flex-col p-5 gap-5 pb-8">
                <div className="flex justify-center items-center w-full text-beamin font-semibold text-[26px]">
                    Đăng Kí
                </div>
                
                {apiError && (
                    <Alert 
                        message="Lỗi" 
                        description={apiError} 
                        type="error" 
                        showIcon 
                        closable 
                        onClose={() => setApiError(null)}
                    />
                )}
                <div className="flex flex-row w-full gap-2">
                    <div className="w-full">
                        <Input 
                            placeholder="Họ" 
                            className={`h-[40px] ${errors.lastName ? 'border-red-500' : ''}`}
                            name="lastName" 
                            value={formData.lastName} 
                            onChange={handleChange} 
                            status={errors.lastName ? "error" : ""}
                        />
                        {errors.lastName && (
                            <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>
                        )}
                    </div>
                    <div className="w-full">
                        <Input 
                            placeholder="Tên" 
                            className={`h-[40px] ${errors.firstName ? 'border-red-500' : ''}`}
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            status={errors.firstName ? "error" : ""}
                        />
                        {errors.firstName && (
                            <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col w-full">
                    <Input 
                        placeholder="Tên đăng nhập" 
                        className="h-[40px]" 
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        status={errors.username ? "error" : ""}
                    />
                    {errors.username && (
                        <div className="text-red-500 text-xs mt-1">{errors.username}</div>
                    )}
                </div>
                <div className="flex flex-col w-full">
                    <Input 
                        placeholder="Số điện thoại" 
                        className="h-[40px]" 
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        status={errors.phoneNumber ? "error" : ""}
                    />
                    {errors.phoneNumber && (
                        <div className="text-red-500 text-xs mt-1">{errors.phoneNumber}</div>
                    )}
                </div>
                <div className="flex flex-col w-full">
                    <Input 
                        placeholder="Email" 
                        className="h-[40px]" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        status={errors.email ? "error" : ""}
                    />
                    {errors.email && (
                        <div className="text-red-500 text-xs mt-1">{errors.email}</div>
                    )}
                </div>
                <div className="flex flex-col w-full">
                    <Input.Password
                        placeholder="Mật khẩu"
                        className="h-[40px]"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        status={errors.password ? "error" : ""}
                    />
                    {errors.password && (
                        <div className="text-red-500 text-xs mt-1">{errors.password}</div>
                    )}
                </div>
                <div className="flex flex-col w-full">
                    <Input.Password
                        placeholder="Nhập lại mật khẩu"
                        className="h-[40px]"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        status={errors.confirmPassword ? "error" : ""}
                    />
                    {errors.confirmPassword && (
                        <div className="text-red-500 text-xs mt-1">{errors.confirmPassword}</div>
                    )}
                </div>
                <div className="flex flex-col w-full">
                    <button 
                        className="w-full h-[40px] uppercase text-white bg-beamin rounded-lg" 
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng Ký'}
                    </button>
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