"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  FileSpreadsheet,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Users,
  ShoppingBag,
  ChartArea
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"

const data = {
  navMain: [
    {
      title: "Thống kê",
      url: "/statistics",
      icon: ChartArea,
      isActive: true,
    },
    {
      title: "Quản Lý Đơn Hàng",
      url: "/order/table",
      icon: FileSpreadsheet ,
      // items: [
      //   {
      //     title: "Genesis",
      //     url: "#",
      //   },
      //   {
      //     title: "Explorer",
      //     url: "#",
      //   },
      //   {
      //     title: "Quantum",
      //     url: "#",
      //   },
      // ],
    },
    {
      title: "Quản lý Nhân Viên",
      url: "/employee",
      icon: Users,
      isActive: true,
    },
    {
      title: "Quản lý Dịch vụ",
      url: "/services",
      icon: ShoppingBag,
      isActive: true,
    },
    {
      title: "Quản lý Khách Hàng",
      url: "/users",
      icon: Users,
      isActive: true,
    },
    {
      title: "Quản lý Size Xe",
      url: "/sizeCar",
      icon: ShoppingBag,
      isActive: true,
    },
  ],
  navSecondary: [
    {
      title: "Hỗ trợ",
      url: "https://www.facebook.com/profile.php?id=61570636340340",
      icon: LifeBuoy,
    },
    {
      title: "Phản hồi",
      url: "mailto:alphawashhcm@gmail.com",
      icon: Send,
    },
  ],
  projects: [
    // {
    //   name: "Design Engineering",
    //   url: "#",
    //   icon: Frame,
    // },
    // {
    //   name: "Sales & Marketing",
    //   url: "#",
    //   icon: PieChart,
    // },
    // {
    //   name: "Travel",
    //   url: "#",
    //   icon: Map,
    // },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/icon.png"
                    alt="Shine Autowerkz Logo"
                    width={30}
                    height={30}
                    className="object-contain pb-0.5"
                    priority
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Shine Autowerkz</span>
                  <span className="truncate text-xs">Build Your Shine</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
