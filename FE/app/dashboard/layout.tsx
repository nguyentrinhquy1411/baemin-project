import FooterNav from "@/components/footerNav";
import HeaderNav from "@/components/headerNav";

export default function DashboardLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <>
        <div className="pt-20 min-h-screen pb-16">
          <main className="w-full mx-auto">
            {children}
          </main>
        </div>
        <FooterNav />
      </>
    );
  }