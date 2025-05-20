'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface PublicRouteProps {
  children: ReactNode;
  redirectIfAuthenticated?: string;
}

/**
 * PublicRoute component to redirect authenticated users away from public pages like login/register
 * 
 * @param {ReactNode} children - The children components to render when not authenticated
 * @param {string} redirectIfAuthenticated - The route to redirect to if authenticated (default: '/dashboard')
 */
const PublicRoute = ({ 
  children, 
  redirectIfAuthenticated = '/dashboard' 
}: PublicRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and authenticated, redirect to protected area
    if (!loading && isAuthenticated) {
      router.replace(redirectIfAuthenticated);
    }
  }, [isAuthenticated, loading, redirectIfAuthenticated, router]);

  // Show loading indicator while checking auth state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-beamin"></div>
      </div>
    );
  }

  // If authenticated, show nothing (will be redirected)
  // If not authenticated, show the children
  return !isAuthenticated ? <>{children}</> : null;
};

export default PublicRoute;
