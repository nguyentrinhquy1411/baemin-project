'use client';

import ProtectedRoute from "@/components/protected-route";

export default function CartLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <ProtectedRoute>
        <section className="relative top-24 w-full gap-3 pb-3" >{children}</section>
      </ProtectedRoute>
    );
  }