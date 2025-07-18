"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Car, Plus, Minus, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { OrderDetail } from "../types/invoice";
import { Button } from "@/components/ui/button";

interface OrderDetailDisplayProps {
  orderDetails: OrderDetail[];
}

export default function OrderDetailDisplay({
  orderDetails,
}: OrderDetailDisplayProps) {
  const [isOpen, setIsOpen] = useState(true); // Default to open

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Chi Tiết Dịch Vụ
          </CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? (
                <Minus className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="sr-only">{isOpen ? "Thu gọn" : "Mở rộng"}</span>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {orderDetails.length > 0 ? (
              orderDetails.map((detail, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex flex-col items-start">
                    <p className="text-sm font-medium text-gray-500 mb-3">
                      Trang Thái Xe
                    </p>
                    <Badge
                      variant={
                        detail.status === "Hoàn thành" ? "default" : "secondary"
                      }
                    >
                      {detail.status}
                    </Badge>
                  </div>

                  {/* Vehicle Information */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Thông Tin Xe
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="p-2 bg-gray-50 rounded-md">
                        <span className="font-medium">Biển số:</span>{" "}
                        {detail.vehicle.licensePlate}
                      </div>
                      <div className="p-2 bg-gray-50 rounded-md">
                        <span className="font-medium">Hãng:</span>{" "}
                        {detail.vehicle.brandName}
                      </div>
                      <div className="p-2 bg-gray-50 rounded-md">
                        <span className="font-medium">Mẫu:</span>{" "}
                        {detail.vehicle.modelName}
                      </div>
                      <div className="p-2 bg-gray-50 rounded-md">
                        <span className="font-medium">Kích thước:</span>{" "}
                        {detail.vehicle.size}
                      </div>
                    </div>
                  </div>

                  {/* Service Information */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Thông Tin Dịch Vụ
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="p-2 bg-gray-50 rounded-md">
                        <span className="font-medium">Tên dịch vụ:</span>{" "}
                        {detail.service.serviceName}
                      </div>
                      <div className="p-2 bg-gray-50 rounded-md">
                        <span className="font-medium">Giá:</span>{" "}
                        {detail.serviceCatalog?.price != null
                          ? detail.serviceCatalog.price.toLocaleString(
                              "vi-VN"
                            ) + "đ"
                          : "N/A"}
                      </div>
                      <div className="p-2 bg-gray-50 rounded-md md:col-span-2">
                        <span className="font-medium">Ghi chú dịch vụ:</span>{" "}
                        {detail.service.note || "Không có"}
                      </div>
                    </div>
                  </div>

                  {/* Employee Selection */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Nhân Viên Thực Hiện
                    </p>
                    {detail.employees && detail.employees.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {detail.employees.map((employee) => (
                          <Badge key={employee.id} variant="outline">
                            <User className="h-3 w-3 mr-1" /> {employee.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md text-gray-600">
                        Chưa có nhân viên được chỉ định.
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Ghi chú chi tiết đơn hàng
                    </p>
                    <div className="p-2 bg-gray-50 rounded-md">
                      {detail.note || "Không có"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                <p className="text-sm">
                  Không có chi tiết dịch vụ nào cho hóa đơn này.
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
