"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  Atom,
  Factory,
  Repeat,
  TrendingUp,
  Upload,
  LayoutDashboard,
  LogOut,
  Workflow,
  UserCog,
  Users,
} from "lucide-react";
import { mockUser } from "@/lib/mockUser";
import { rolePages } from "@/lib/rolePages";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Role = keyof typeof rolePages;

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const role = mockUser.role;

  const allowedPages: string[] =
    role in rolePages ? rolePages[role as Role] : [];

  const allItems = [
    {
      title: "Main Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Dashboard",
      url: "/dashboard-branch",
      icon: LayoutDashboard,
    },
    {
      title: "Dashboard",
      url: "/dashboard-marketing",
      icon: LayoutDashboard,
    },
    {
      title: "Master Coding",
      url: "/master-coding",
      icon: Atom,
    },
    {
      title: "Phase In/Out",
      url: "/phaseIO",
      icon: Repeat,
    },
    {
      title: "Production",
      url: "/production",
      icon: Factory,
    },
    {
      title: "Results",
      url: "/results",
      icon: TrendingUp,
    },
    {
      title: "Upload Files",
      url: "/upload",
      icon: Upload,
    },
    {
      title: "Branch Master",
      url: "/branch-master",
      icon: Workflow,
    },
    {
      title: "Roles",
      url: "/roles",
      icon: UserCog,
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,
    },
  ];

  const filteredItems = allItems.filter((item) =>
    allowedPages.includes(item.url)
  );

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-2">
        <SidebarTrigger className="h-8 w-8" />
      </SidebarHeader>

      <SidebarContent className={cn("p-2 flex flex-col h-full")}>
        <SidebarMenu>
          {filteredItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Logout" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
