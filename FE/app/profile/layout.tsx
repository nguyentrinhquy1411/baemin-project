'use client';

import FooterNav from "@/components/footerNav";
import ProtectedRoute from "@/components/protected-route";

export default function ProfileLayout({
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
