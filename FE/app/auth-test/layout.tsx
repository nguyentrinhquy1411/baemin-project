'use client';

import ProtectedRoute from "@/components/protected-route";

export default function AuthTestLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    );
  }
