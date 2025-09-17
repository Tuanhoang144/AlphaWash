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

import { ServiceDialog } from "./components/ServiceDialog";
import { CreateServiceDialog } from "./components/CreateServiceDialog";
import { ServiceTable } from "./components/ServiceTable";
import { ServiceManagementHeader } from "./components/ServiceManagementHeader";
import { useServiceManager } from "@/services/useServiceAll";
import { ServiceAll, ServiceFormData } from "@/types/ServiceAll";
import { addToast } from "@heroui/toast";

function ManageServices() {
  const [services, setServices] = useState<ServiceAll[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<ServiceAll | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const { getAllService, createService, updateService } = useServiceManager();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllService();
      setServices(data);
    };
    fetchData();
  }, [getAllService]);

  const handleAddService = () => {
    setCurrentService(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditService = (service: ServiceAll) => {
    setCurrentService(service);
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

  const handleSaveService = async (data: ServiceFormData & { id?: string }) => {
    try {
      if (currentService) {
        const serviceData = {
          serviceCode: data.serviceCode,
          serviceName: data.serviceName,
          duration: data.duration,
          size: data.size,
          price: data.price,
          note: data.note,
        };
        await updateService(serviceData);
        addToast({
          title: "Thành công",
          description: "Dịch vụ đã được cập nhật thành công!",
          color: "success",
        });
      } else {
        await createService(data);
      }
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

  const paginatedServices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredServices.slice(start, start + pageSize);
  }, [filteredServices, page]);

  return (
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
            onAddService={handleAddService}
            onSearch={setSearchTerm}
          />
          <ServiceTable
            services={paginatedServices}
            onEditService={handleEditService}
          />
          {/* Paging */}
          <div className="flex justify-center mt-4 gap-2">
            <button
              className="px-3 py-1 border rounded"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trước
            </button>
            <span>Trang {page}</span>
            <button
              className="px-3 py-1 border rounded"
              onClick={() =>
                setPage((p) =>
                  p * pageSize < filteredServices.length ? p + 1 : p
                )
              }
              disabled={page * pageSize >= filteredServices.length}
            >
              Sau
            </button>
          </div>
          <CreateServiceDialog
            isOpen={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onSave={handleCreateService}
          />
          <ServiceDialog
            isOpen={isDialogOpen}
            // getAllServiceType={getAllServiceType}
            // getAllServiceCode={getAllServiceCode}
            onOpenChange={setIsDialogOpen}
            service={currentService}
            onSave={handleSaveService}
          />
        </div>
      </div>
    </SidebarInset>
  );
}

export default ManageServices;
