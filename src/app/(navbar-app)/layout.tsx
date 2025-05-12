import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Image from "next/image";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex justify-between items-center p-4 sticky top-0 z-10 bg-background border-b">
            {/* Top left image */}
            <div className="relative h-10 w-32">
              <Image
                src="/logo.png"
                alt="Dawlance logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>

            {/* Top right image */}
            <div className="relative h-10 w-32">
              {" "}
              <Image
                src="aiSystemslogo.svg"
                alt="Right header logo"
                fill
                className="object-contain object-right"
                priority
              />
            </div>
          </div>

          <div className="p-2">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
