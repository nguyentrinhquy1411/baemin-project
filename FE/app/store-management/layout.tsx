import { StoreProtectedRoute } from "@/components/store-protected-route";

export default function StoreManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProtectedRoute>
      {children}
    </StoreProtectedRoute>
  );
}
