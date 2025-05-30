'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, UserResponse } from '@/services/auth';
import { message } from 'antd';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const login = async (token: string, refreshToken: string) => {
    try {
      // Lưu tokens
      AuthService.saveTokens(token, refreshToken);
      
      // Lấy thông tin user
      const userData = await AuthService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      AuthService.clearTokens();
      setUser(null);
    }
  };
  const logout = async () => {
    try {
      // Lấy refresh token từ localStorage
      const refreshToken = AuthService.getTokens().refreshToken;
      
      if (refreshToken) {
        console.log('Auth Context - Calling logout API with token:', refreshToken.substring(0, 10) + '...');
        // Đợi API logout hoàn thành
        await AuthService.logout(refreshToken);
        console.log('Auth Context - Logout API call successful');
      } else {
        console.log('Auth Context - No refresh token found for logout');
      }
    } catch (error) {
      console.error('Auth Context - Logout error:', error);
    } finally {
      // Luôn xóa tokens và user state kể cả khi API thất bại
      console.log('Auth Context - Clearing tokens and user state');
      AuthService.clearTokens();
      setUser(null);
      
      // Show logout notification
      messageApi.success('Đăng xuất thành công!');
      
      router.push('/login');
    }
  };

  const refreshAuth = async (): Promise<boolean> => {
    try {
      const tokens = AuthService.getTokens();
      if (!tokens.refreshToken) return false;
      
      const response = await AuthService.refreshToken(tokens.refreshToken);
      AuthService.saveTokens(response.access_token, response.refresh_token);
      setUser(response.user);
      return true;
    } catch (error) {
      console.error('Refresh token error:', error);
      AuthService.clearTokens();
      setUser(null);      return false;
    }
  };

  const refreshUserProfile = async (): Promise<void> => {
    try {
      const userData = await AuthService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };
  // Kiểm tra trạng thái xác thực khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        // Handle client-side only logic
        if (typeof window !== 'undefined') {
          const tokens = AuthService.getTokens();
          console.log('Auth Context - Checking tokens:', { 
            hasAccessToken: !!tokens.accessToken, 
            hasRefreshToken: !!tokens.refreshToken 
          });
          
          if (tokens.accessToken) {
            try {
              // Thử lấy thông tin user với token hiện tại
              const userData = await AuthService.getProfile();
              console.log('Auth Context - User profile retrieved successfully');
              setUser(userData);
            } catch (error) {
              console.error('Auth Context - Error getting profile, attempting refresh:', error);
              // Nếu token hết hạn, thử refresh
              const refreshed = await refreshAuth();
              if (!refreshed) {
                console.log('Auth Context - Token refresh failed, clearing user');
                setUser(null);
              }
            }
          } else {
            console.log('Auth Context - No access token available');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);
  return (    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        refreshAuth,
        refreshUserProfile,
      }}
    >
      {contextHolder}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
