"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText, AlertTriangle } from "lucide-react";
import EmployeeSelector from "./employee-selector";
import ServiceInfoBlock from "./service-info-block";
import type { OrderDetailDTO, ServiceDTO } from "@/types/OrderResponse";

interface OrderDetailBlockProps {
  orderDetail: OrderDetailDTO;
  onOrderDetailChange: (orderDetail: OrderDetailDTO) => void;
  vehicleSize: string;
}

export default function OrderDetailBlock({
  orderDetail,
  onOrderDetailChange,
  vehicleSize,
}: OrderDetailBlockProps) {
  const updateOrderDetail = (field: string, value: any) => {
    onOrderDetailChange({
      ...orderDetail,
      [field]: value,
    });
  };

  const addService = () => {
    const newService: ServiceDTO = {
      id: 0,
      serviceCode: "",
      serviceName: "",
      serviceTypeCode: "",
      serviceCatalog: {
        id: 0,
        code: "",
        size: "",
        price: 0,
      },
    };
    updateOrderDetail("service", [...orderDetail.service, newService]);
  };

  const removeService = (index: number) => {
    const newServices = orderDetail.service.filter((_, i) => i !== index);
    updateOrderDetail("service", newServices);
  };

  const updateService = (index: number, service: ServiceDTO) => {
    const newServices = [...orderDetail.service];
    newServices[index] = service;
    updateOrderDetail("service", newServices);
  };

  const calculateTotal = () => {
    return orderDetail.service.reduce((sum, service) => {
      const price =
        service.serviceCatalog?.isException &&
        service.serviceCatalog?.exceptionPrice
          ? service.serviceCatalog.exceptionPrice
          : service.serviceCatalog?.price || 0;
      return sum + price;
    }, 0);
  };

  const hasExceptions = orderDetail.service.some(
    (service) => service.serviceCatalog?.isException
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Thông Tin Dịch Vụ & Nhân Viên
          {hasExceptions && (
            <div className="flex items-center gap-1 text-orange-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Có ngoại lệ</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Services Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Danh sách dịch vụ</Label>
          </div>

          {orderDetail.service.map((service, index) => {
            const selectedServiceIds = orderDetail.service
              .filter((_, i) => i !== index)
              .map((s) => s.id);
            return (
              <ServiceInfoBlock
                key={`service-${service.id}-${index}`}
                service={service}
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
            onClick={addService}
            size="sm"
            className="bg-black hover:bg-white hover:border-2 hover:text-black w-full text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm Dịch Vụ
          </Button>

          {orderDetail.service.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 mb-4">Chưa có dịch vụ nào</p>
              <Button type="button" onClick={addService} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Thêm Dịch Vụ Đầu Tiên
              </Button>
            </div>
          )}
        </div>

        {/* Employee Selection */}
        <div className="space-y-2">
          <EmployeeSelector
            selectedEmployees={orderDetail.employees}
            onEmployeesChange={(employees) =>
              updateOrderDetail("employees", employees)
            }
          />
        </div>

        {/* Status and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Trạng thái thi công</Label>
            <Select
              value={orderDetail.status || ""}
              onValueChange={(value) => updateOrderDetail("status", value)}
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
              onChange={(e) => updateOrderDetail("note", e.target.value)}
            />
          </div>
        </div>

        <div
          className={`border rounded-lg p-3 ${
            hasExceptions
              ? "bg-orange-50 border-orange-200"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <span
              className={`text-sm ${
                hasExceptions ? "text-orange-700" : "text-blue-700"
              }`}
            >
              Tổng tiền các dịch vụ {hasExceptions ? "(Có chỉnh sửa)" : ""}:
            </span>
            <span
              className={`font-semibold ${
                hasExceptions ? "text-orange-800" : "text-blue-800"
              }`}
            >
              {calculateTotal().toLocaleString("vi-VN")} VNĐ
            </span>
          </div>
          {hasExceptions && (
            <div className="mt-2 text-xs text-orange-600">
              * Một số dịch vụ đã được chỉnh sửa giá
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
