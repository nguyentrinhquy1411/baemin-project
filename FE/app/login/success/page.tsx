'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import SuspenseWrapper from '@/components/suspense-wrapper';

const LoginSuccessPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(3);
  const { login } = useAuth();
    useEffect(() => {
    if (!searchParams) return;
    
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');

    console.log('Login Success Page - Tokens received:', { 
      accessToken: accessToken ? `${accessToken.substring(0, 10)}...` : null,
      refreshToken: refreshToken ? `${refreshToken.substring(0, 10)}...` : null
    });

    if (accessToken && refreshToken) {
      // Use auth context's login method instead of directly storing tokens
      login(accessToken, refreshToken)
        .then(() => {
          console.log('Login Success Page - Login successful via AuthContext');
        })
        .catch(error => {
          console.error('Login Success Page - Error during login:', error);
        });

      // Start countdown for redirection
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Redirect to dashboard after countdown
            router.push('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      // Redirect to login page if no tokens
      router.push('/login');
    }
  }, [router, searchParams]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <div className="text-green-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">Đăng nhập thành công!</h1>
        <p className="mb-6">Bạn đã đăng nhập thành công qua Google</p>
        <div className="bg-gray-100 rounded-full h-2 mb-4">
          <div 
            className="bg-beamin h-full rounded-full transition-all duration-300" 
            style={{ width: `${((3 - countdown) / 3) * 100}%` }}
          ></div>
        </div>
        <p className="text-gray-600">
          Tự động chuyển hướng sau <span className="font-bold">{countdown}</span> giây...
        </p>
        <div className="mt-6">
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-beamin text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Đi đến Trang chủ
          </button>
        </div>      </div>
    </div>
  );
}

export default function LoginSuccessPage() {
  return (
    <SuspenseWrapper>
      <LoginSuccessPageContent />
    </SuspenseWrapper>
  );
}
