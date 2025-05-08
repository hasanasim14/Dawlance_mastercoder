"use client";

import type React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Atom, TrendingUp, Upload } from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const items = [
    {
      title: "Master Coding",
      url: "/master-coding",
      icon: Atom,
    },
    {
      title: "Upload",
      url: "/upload",
      icon: Upload,
    },
    {
      title: "Results",
      url: "/results",
      icon: TrendingUp,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-2">
        <SidebarTrigger className="h-8 w-8" />
      </SidebarHeader>
      <SidebarContent className={cn("p-2")}>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex-1 p-2">{children}</div>
      </div>
    </SidebarProvider>
  );
}
