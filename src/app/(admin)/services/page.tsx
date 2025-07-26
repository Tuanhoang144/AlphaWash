"use client";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import ServiceManagementHeader from "./components/header";
import { ServiceTable } from "./components/table";

export default function ManageService() {
  return (
    <div>
      <SidebarInset>
        <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="container mx-auto py-8 px-4">
            <ServiceManagementHeader
              onAddService={() => {}}
              onSearch={() => {}}
            />
            <ServiceTable service={[]} onEditService={() => {}} />
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}
