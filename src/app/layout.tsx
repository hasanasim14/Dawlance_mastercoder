import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Image from "next/image";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next.js App with Shadcn Sidebar",
  description: "A simple application with a shadcn sidebar",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-col h-full">
              <div className="w-full mb-2 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Master Coding Header"
                  width={1200}
                  height={120}
                  className="w-50 object-cover opacity-90"
                  priority
                />
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
