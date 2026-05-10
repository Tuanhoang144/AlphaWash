"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, FileText } from "lucide-react";
import type { OrderDetailDTO, ServiceDTO } from "@/types/OrderResponse";
import ServiceInfoBlock from "./ui/ServiceInfoBlock";
import { createNewService } from "@/shared/hooks/order/useService";
import EmployeeSelector from "./ui/EmployeeSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useServiceForm } from "@/shared/hooks/order/useServiceForm";
interface OrderDetailBlockProps {
  orderDetail: OrderDetailDTO;
  onServiceChange: (index: number, service: ServiceDTO) => void;
  onInfoChange: (field: string, value: any) => void;
  addService: (newService: ServiceDTO) => void;
  removeServiceAt: (index: number) => void;
  vehicleSize: string;
}

export default function ServiceForm({
  orderDetail,
  onServiceChange,
  onInfoChange,
  addService,
  removeServiceAt,
  vehicleSize,
}: OrderDetailBlockProps) {
  //Load danh sách dịch vụ
  const { services: allServices, loadingServices } = useServiceForm();

  //Dùng để update employee/status/note trong orderDetail
  const updateInfo = (field: string, value: any) => {
    onInfoChange(field, value);
  };

  //Dùng để update dịch vụ trong orderDetail
  const updateService = (index: number, updatedService: ServiceDTO) => {
    onServiceChange(index, updatedService);
  };

  //Xoá dịch vụ trong orderDetail
  const removeService = (index: number) => {
    removeServiceAt(index);
  };

  //Thêm mới dịch vụ trong orderDetail
  const addNewService = () => {
    addService(createNewService());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Thông Tin Dịch Vụ & Nhân Viên
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chọn dịch vụ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Danh sách dịch vụ</Label>
          </div>

          {orderDetail?.service?.map((service, index) => {
            const selectedServiceIds = orderDetail.service
              .filter((_, i) => i !== index)
              .map((s) => s.id);
            return (
              <ServiceInfoBlock
                key={index}
                service={service} //list dịch vụ trong orderDetail
                allServices={allServices}
                loadingServices={loadingServices}
                onServiceChange={(updatedService) =>
                  updateService(index, updatedService)
                }
                onRemove={
                  orderDetail.service.length > 1
                    ? () => removeService(index)
                    : undefined
                }
                vehicleSize={vehicleSize}
                canRemove={orderDetail.service.length > 1}
                serviceIndex={index}
                selectedServiceIds={selectedServiceIds}
              />
            );
          })}

          <Button
            type="button"
            onClick={addNewService}
            size="sm"
            className="bg-black hover:bg-white hover:border-2 hover:text-black w-full text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm Dịch Vụ
          </Button>

          {orderDetail?.service?.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 mb-4">Chưa có dịch vụ nào</p>
              <Button type="button" onClick={addNewService} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Thêm Dịch Vụ Đầu Tiên
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <EmployeeSelector
            selectedEmployees={orderDetail.employees}
            onEmployeesChange={(employees) =>
              updateInfo("employees", employees)
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Trạng thái thi công</Label>
            <Select
              value={orderDetail.status || ""}
              onValueChange={(value) => {
                if (value !== orderDetail.status) updateInfo("status", value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Chờ thi công</SelectItem>
                <SelectItem value="PROCESSING">Đang thi công</SelectItem>
                <SelectItem value="DONE">Thi công xong</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              placeholder="Ghi chú thêm..."
              value={orderDetail.note || ""}
              onChange={(e) => updateInfo("note", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
