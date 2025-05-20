'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute component to guard routes requiring authentication
 * 
 * @param {ReactNode} children - The children components to render when authenticated
 * @param {string} redirectTo - The route to redirect to if not authenticated (default: '/login')
 */
const ProtectedRoute = ({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    // If not loading and not authenticated, redirect
    if (!loading && !isAuthenticated) {
      console.log('ProtectedRoute - User not authenticated, redirecting to:', redirectTo);
      router.replace(redirectTo);
    }
  }, [isAuthenticated, loading, redirectTo, router]);

  // Show nothing while loading
  if (loading) {
    console.log('ProtectedRoute - Still loading authentication state');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-beamin"></div>
      </div>
    );
  }

  // If not authenticated, show nothing (will be redirected)
  // If authenticated, show the children
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, rendering nothing');
    return null;
  }
  
  console.log('ProtectedRoute - User authenticated, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
