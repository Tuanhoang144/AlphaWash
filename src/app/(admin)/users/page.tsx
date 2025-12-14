"use client";

import { useState, useEffect, useMemo } from "react";
import { ServiceUsedDTO } from "@/types/CarUser";
import { useServiceUsedManager } from "@/services/userCarManager";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { ServiceUserdHeader } from "./components/ServiceUserdHeader";
import { CustomerVehicleTable } from "./components/ServiceUsedTable";

export default function ManageUsersPage() {
  const {
    getAllServicesUsed,
    addServiceUsed,
    updateServiceUsed,
    deleteServiceUsed,
    getServiceUsedDetail,
  } = useServiceUsedManager();

  const [users, setUsers] = useState<ServiceUsedDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllServicesUsed();
        setUsers(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách khách hàng:", error);
      }
    };
    fetchUsers();
  }, [getAllServicesUsed]);

  const filteredUsers = useMemo(() => {
    //Filter by license plate or name
    let list = users;
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      list = list.filter(
        (user) =>
          user.licensePlate.toLowerCase().includes(lowerSearchTerm) ||
          user.customerName.toLowerCase().includes(lowerSearchTerm)
      );
    }
    return list;
  }, [users, searchTerm]);

  return (
    <SidebarInset className="relative w-full">
      <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Quản lý Khách Hàng</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="container absolute top-17 .center-conditional left-1/2 -translate-x-1/2 space-y-4">
        <div className="px-6">
          <ServiceUserdHeader
            onSearch={setSearchTerm}
            onAddService={() => {}}
          />
        </div>
        <div className="px-6">
          <CustomerVehicleTable data={filteredUsers} />
        </div>
        {/* 
        <ServiceUsedDialog
          data={null}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={(d) => addServiceUsed(d)}
        />

        <ServiceUsedDetailDialog
          data={selected}
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
        /> */}
      </div>
    </SidebarInset>
  );
}
