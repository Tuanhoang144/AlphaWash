'use client'

import { AppSidebar } from "./components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { cn, ToastProvider } from "@heroui/react";
import React from "react";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ToastProvider toastProps={{
				classNames: {
					base: cn("z-100"),

				}
			}} />
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}

export default Layout;