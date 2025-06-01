"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { message, Spin } from "antd";

interface StoreProtectedRouteProps {
  children: React.ReactNode;
}

export const StoreProtectedRoute: React.FC<StoreProtectedRouteProps> = ({
  children,
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        message.warning("Vui lòng đăng nhập để truy cập trang này");
        router.push("/login");
        return;
      }

      if (user?.role !== "store") {
        message.error("Bạn không có quyền truy cập trang này");
        router.push("/");
        return;
      }

      setIsChecking(false);
    }
  }, [isAuthenticated, user, loading, router]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "store") {
    return null;
  }

  return <>{children}</>;
};