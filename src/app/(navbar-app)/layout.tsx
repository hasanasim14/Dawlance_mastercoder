// import { SidebarProvider } from "@/components/ui/sidebar";
// import { AppSidebar } from "@/components/AppSidebar";
import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <SidebarProvider>
    //   <div className="flex h-full">
    //     <AppSidebar />
    //     <div className="flex-1 flex flex-col h-full">
    // <div className="w-full mb-2 flex-shrink-0 flex justify-between items-center">
    //   <Image
    //     src="/logo.png"
    //     alt="Master Coding Header"
    //     width={1200}
    //     height={120}
    //     className="w-50 object-cover opacity-90"
    //     priority
    //   />
    //   <Image
    //     src="/aiSystemslogo.svg"
    //     alt="AI Systems Logo"
    //     width={1200}
    //     height={120}
    //     className="w-50 object-cover opacity-90"
    //     priority
    //   />
    // </div>
    //       <main className="flex-1 w-full h-full overflow-auto">{children}</main>
    //     </div>
    //   </div>
    // </SidebarProvider>

    // <div className="w-full">
    // <SidebarProvider>

    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        {/* <SidebarProvider> */}
        <div className="w-full mb-2 flex-shrink-0 flex justify-between items-center">
          <Image
            src="/logo.png"
            alt="Master Coding Header"
            width={1200}
            height={120}
            className="w-50 object-cover opacity-90"
            priority
          />
          <Image
            src="/aiSystemslogo.svg"
            alt="AI Systems Logo"
            width={1200}
            height={120}
            className="w-50 object-cover opacity-90"
            priority
          />
        </div>
        <main className="flex-1 w-full h-full overflow-auto">{children}</main>

        {/* </SidebarProvider> */}
      </body>
    </html>
    // </SidebarProvider>
    // </div>
  );
}
