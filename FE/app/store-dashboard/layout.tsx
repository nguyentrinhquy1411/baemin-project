import HeaderNav from "@/components/headerNav";

export default function StoreDashboardLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <>
        <HeaderNav />
        <div className="min-h-screen">
          <main className="w-full mx-auto">
            {children}
          </main>
        </div>
      </>
    );
  }
