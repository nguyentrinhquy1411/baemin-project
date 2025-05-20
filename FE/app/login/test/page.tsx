'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthService, UserResponse } from '@/services/auth';

export default function TestOAuth() {
  const searchParams = useSearchParams();
  const [tokens, setTokens] = useState<{
    accessToken: string | null;
    refreshToken: string | null;
  }>({
    accessToken: null,
    refreshToken: null,
  });
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchParams) return;
    
    // Get tokens from URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');

    if (accessToken && refreshToken) {
      setTokens({
        accessToken,
        refreshToken,
      });

      // Store tokens using auth service
      AuthService.saveTokens(accessToken, refreshToken);
      
      // Fetch user data from API
      fetchUserData(accessToken);
    } else {
      // Check if tokens exist in localStorage
      const storedTokens = AuthService.getTokens();
      if (storedTokens.accessToken) {
        setTokens({
          accessToken: storedTokens.accessToken,
          refreshToken: storedTokens.refreshToken,
        });
        fetchUserData(storedTokens.accessToken);
      } else {
        setLoading(false);
      }
    }
  }, [searchParams]);

  const fetchUserData = async (token: string) => {
    try {
      if (!token) return;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };
  const logout = () => {
    AuthService.clearTokens();
    setTokens({ accessToken: null, refreshToken: null });
    setUserData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10">
      <h1 className="text-3xl font-bold mb-6">Kiểm tra OAuth</h1>
      
      {tokens.accessToken ? (
        <div className="bg-white border rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Thông tin đăng nhập</h2>
            <div className="mb-2">
              <p className="font-medium">Access Token:</p>
              <p className="bg-gray-100 p-2 rounded text-sm overflow-x-auto whitespace-nowrap">
                {tokens.accessToken}
              </p>
            </div>
            <div className="mb-2">
              <p className="font-medium">Refresh Token:</p>
              <p className="bg-gray-100 p-2 rounded text-sm overflow-x-auto whitespace-nowrap">
                {tokens.refreshToken}
              </p>
            </div>
          </div>

          {userData && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Thông tin người dùng</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Đăng xuất
            </button>
            <a
              href="/"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Quay lại trang chủ
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-lg shadow-md p-6 text-center">
          <p className="mb-4 text-lg">Bạn chưa đăng nhập</p>
          <div className="flex justify-center gap-4">
            <a
              href="http://localhost:8080/auth/google"
              className="bg-beamin hover:bg-opacity-90 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
              </svg>
              Đăng nhập với Google
            </a>
            <a href="/login" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Quay lại đăng nhập
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
