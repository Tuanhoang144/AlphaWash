"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

import { CreateServiceDialog } from "./components/CreateServiceDialog";
import { ServiceManagementHeader } from "./components/ServiceManagementHeader";
import { useServiceManager } from "@/services/useServiceAll";
import type { ServiceAll } from "@/types/ServiceAll";
import { addToast } from "@heroui/toast";
import { ServiceTable } from "./components/ServiceTable";
import { ServiceDialog } from "./components/EditServiceDialog";

function ManageServices() {
  const [services, setServices] = useState<ServiceAll[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentServices, setCurrentServices] = useState<ServiceAll[] | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  const { getAllService, createService, updateService } = useServiceManager();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllService();
      setServices(data);
    };
    fetchData();
  }, [getAllService]);

  const handleAddService = () => {
    setCurrentServices(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditService = (services: ServiceAll[]) => {
    setCurrentServices(services);
    setIsDialogOpen(true);
  };

  const handleCreateService = async (data: {
    serviceTypeCode: string;
    serviceName: string;
    duration: string;
    size: string;
    price: number;
    note: string;
  }) => {
    try {
      const serviceData = {
        serviceName: data.serviceName,
        duration: data.duration,
        size: data.size,
        price: data.price,
        note: data.note,
        serviceTypeCode: data.serviceTypeCode,
      };
      await createService(serviceData as any);
      addToast({
        title: "Thành công",
        description: "Dịch vụ đã được tạo thành công!",
        color: "success",
      });
      const updated = await getAllService();
      setServices(updated);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Lỗi khi tạo dịch vụ:", error);
    }
  };

  const handleSaveService = async (data: {
    serviceTypeCode: string;
    serviceCode: string;
    serviceName: string;
    duration: string;
    note?: string;
    sizes: {
      S?: { price: number };
      M?: { price: number };
      L?: { price: number };
    };
  }) => {
    try {
      const serviceData = {
        serviceTypeCode: data.serviceTypeCode,
        serviceCode: data.serviceCode,
        serviceName: data.serviceName,
        duration: data.duration,
        note: data.note,
        sizes: data.sizes,
      };
      await updateService(serviceData);
      addToast({
        title: "Thành công",
        description: "Dịch vụ đã được cập nhật thành công!",
        color: "success",
      });
      const updated = await getAllService();
      setServices(updated);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Lỗi khi lưu dịch vụ:", error);
    }
  };

  const filteredServices = useMemo(() => {
    if (!searchTerm) return services;
    const lower = searchTerm.toLowerCase();
    return services.filter(
      (s) =>
        s.serviceName.toLowerCase().includes(lower) ||
        s.serviceCode.toLowerCase().includes(lower)
    );
  }, [services, searchTerm]);

  return (
    <SidebarInset className="relative w-full">
      <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Quản lý dịch vụ</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="container absolute top-16 left-1/2 -translate-x-1/2 .center-conditional p-6">
        <div className="container">
          <ServiceManagementHeader
            onAddService={handleAddService}
            onSearch={setSearchTerm}
          />
          <ServiceTable
            services={filteredServices}
            onEditService={handleEditService}
          />
          <CreateServiceDialog
            isOpen={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onSave={handleCreateService}
          />
          <ServiceDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            services={currentServices}
            onSave={handleSaveService}
          />
        </div>
      </div>
    </SidebarInset>
  );
}

export default ManageServices;
