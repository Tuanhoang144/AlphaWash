"use client";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import HeaderOrderTable from "./components/header";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import MyTable from "./components/table";

export default function OrderTable() {
  return (
    <SidebarInset>
      <header className="sticky z-10 top-0 flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbPage className="flex items-center gap-2">
                  Theo dõi xe ra vào xưởng
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <MyTable />
    </SidebarInset>
  );
}
