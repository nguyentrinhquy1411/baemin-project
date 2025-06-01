"use client";

import { Suspense } from "react";
import { Spin } from "antd";

interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function SuspenseWrapper({ 
  children, 
  fallback = <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div> 
}: SuspenseWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}
