import FooterNav from "@/components/footerNav";

export default function DashboardLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <><section className="absolute top-20 w-full ">{children}
        
     
        </section></>  

    );
  }