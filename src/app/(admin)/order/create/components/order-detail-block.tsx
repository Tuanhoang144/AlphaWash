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
import { Plus, FileText } from "lucide-react";
import EmployeeSelector from "./employee-selector";
import ServiceInfoBlock from "./service-info-block";
import type { OrderDetailDTO } from "@/types/OrderResponse";

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
    const newService = {
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

  const updateService = (index: number, service: any) => {
    const newServices = [...orderDetail.service];
    newServices[index] = service;
    updateOrderDetail("service", newServices);
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
        {/* Services Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Danh sách dịch vụ</Label>
          </div>

          {orderDetail.service.map((service, index) => (
            <ServiceInfoBlock
              key={index}
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
            />
          ))}

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

        {/* Total Price for this order detail */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700">
              Tổng tiền các dịch vụ:
            </span>
            <span className="font-semibold text-blue-800">
              {orderDetail.service
                .reduce(
                  (sum, service) => sum + (service.serviceCatalog?.price || 0),
                  0
                )
                .toLocaleString("vi-VN")}{" "}
              VNĐ
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
