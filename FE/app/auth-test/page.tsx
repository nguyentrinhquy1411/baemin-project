'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button, Card, Descriptions, Divider, Spin, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import React from 'react';
import ProtectedRoute from '@/components/protected-route';
import { AuthService } from '@/services/auth';

const { Title, Text } = Typography;

export default function AuthTestPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [tokens, setTokens] = React.useState<{ accessToken: string | null; refreshToken: string | null } | null>(null);
  
  React.useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
      setTokens(AuthService.getTokens());
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Loading authentication status..." />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex justify-center items-start py-24 px-4 min-h-screen">
        <Card className="w-full max-w-4xl shadow-md">
          <Title level={2} className="text-center mb-6">
            Authentication Test Page
          </Title>
          
          <Divider>Authentication Status</Divider>
          
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-4 h-4 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <Text strong>Status:</Text>
              <Text>{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</Text>
            </div>
          </div>
          
          <Divider>User Information</Divider>
          
          {user ? (
            <Descriptions bordered column={1} className="mb-6">
              <Descriptions.Item label="User ID">{user.id}</Descriptions.Item>
              <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
              <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
              <Descriptions.Item label="Role">{user.role}</Descriptions.Item>
              <Descriptions.Item label="First Name">{user.first_name || 'Not set'}</Descriptions.Item>
              <Descriptions.Item label="Last Name">{user.last_name || 'Not set'}</Descriptions.Item>
              <Descriptions.Item label="Phone">{user.phone || 'Not set'}</Descriptions.Item>
              <Descriptions.Item label="Address">{user.address || 'Not set'}</Descriptions.Item>
            </Descriptions>
          ) : (
            <div className="text-center mb-6 p-4 bg-gray-100 rounded">
              <Text type="secondary">No user information available</Text>
            </div>
          )}
          
          <Divider>Token Information</Divider>
          
          {tokens ? (
            <div className="mb-6 overflow-hidden">
              <Title level={5}>Access Token</Title>
              <div className="bg-gray-100 p-3 rounded font-mono text-xs overflow-x-auto">
                {tokens.accessToken ? (
                  <div>
                    <span className="text-green-600 font-bold">Present: </span> 
                    {`${tokens.accessToken.substring(0, 20)}...`}
                  </div>
                ) : (
                  <span className="text-red-600">Not present</span>
                )}
              </div>
              
              <Title level={5} className="mt-4">Refresh Token</Title>
              <div className="bg-gray-100 p-3 rounded font-mono text-xs overflow-x-auto">
                {tokens.refreshToken ? (
                  <div>
                    <span className="text-green-600 font-bold">Present: </span> 
                    {`${tokens.refreshToken.substring(0, 20)}...`}
                  </div>
                ) : (
                  <span className="text-red-600">Not present</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center mb-6 p-4 bg-gray-100 rounded">
              <Text type="secondary">No token information available</Text>
            </div>
          )}
          
          <div className="flex justify-center mt-6">
            <Button 
              danger
              icon={<LogoutOutlined />}
              size="large"
              onClick={logout}
            >
              Log Out
            </Button>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
