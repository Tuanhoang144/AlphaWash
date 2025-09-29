"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Car, Users, Clock, FileText, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tool } from "@/utils/tool";
import { OrderDetailDTO } from "@/types/OrderResponse";

interface InvoiceSummaryProps {
  orderDetails: OrderDetailDTO[];
  totalPrice: number;
  statusPayment: string;
  deleteFlag?: boolean;
}

export default function InvoiceSummary({
  statusPayment,
  orderDetails,
  totalPrice,
  deleteFlag,
}: InvoiceSummaryProps) {
  const [isOpen, setIsOpen] = useState(true); // Default to open

  const totalServices = orderDetails.reduce(
    (sum, detail) => sum + detail.service.length,
    0
  );
  const totalEmployees = orderDetails.reduce(
    (sum, detail) => sum + detail.employees.length,
    0
  );
  const { getStatusVehicleColor, getStatusVehicleLabel } = tool();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tóm Tắt Đơn Hàng
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
          <CardContent className="space-y-4">
            {/* Quick Stats */}
            {deleteFlag && (
              <div className="rounded-xl bg-red-100 p-4 text-center shadow-sm">
                <div className="flex justify-center items-center gap-2 text-red-600 mb-1">
                  <span className="text-sm font-medium">
                    Đơn hàng đã bị hủy
                  </span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <Car className="h-4 w-4" />
                  <span className="text-sm font-medium">Dịch vụ</span>
                </div>
                <div className="text-xl font-bold text-blue-700">
                  {totalServices}
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Nhân viên</span>
                </div>
                <div className="text-xl font-bold text-green-700">
                  {totalEmployees}
                </div>
              </div>
            </div>

            <Separator />

            {/* Service Details */}
            {orderDetails && orderDetails.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Chi tiết dịch vụ:</h4>
                {orderDetails.map((detail, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="h-3 w-3" />
                        <span className="text-sm font-medium">
                          {detail.vehicle?.licensePlate || "Không rõ biển số"}
                        </span>
                        {detail.vehicle?.size && (
                          <Badge variant="outline" className="text-xs">
                            {detail.vehicle.size}
                          </Badge>
                        )}
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full border ${getStatusVehicleColor(
                          statusPayment
                        )}`}
                      >
                        {getStatusVehicleLabel(statusPayment)}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <div className="space-y-1">
                        {detail.service?.map((service) => (
                          <div
                            className="flex justify-between items-center"
                            key={service.id}
                          >
                            <div>
                              <span className="font-medium">
                                {service.serviceName || "Không rõ dịch vụ"}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {service.serviceCatalog ? (
                                <div className="price">
                                  {(service.adjustedPriceFlag == true &&
                                  service.adjustedPriceReason
                                    ? service.adjustedPrice
                                    : service.serviceCatalog
                                        ?.listedPrice)!.toLocaleString()}
                                  VNĐ
                                </div>
                              ) : (
                                "Không rõ giá"
                              )}
                            </div>
                          </div>
                        )) || "Không rõ dịch vụ"}
                      </div>
                    </div>

                    {detail.employees?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {detail.employees.map((employee) => (
                          <Badge
                            key={employee.id}
                            variant="outline"
                            className="text-xs"
                          >
                            {employee.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm">Tổng tiền:</span>
                      <span className="font-medium text-green-600">
                        {detail.service && detail.service.length > 0
                          ? (() => {
                              const total = detail.service.reduce((acc, curr) => {
                                const price =
                                  curr.adjustedPriceFlag === true &&
                                  curr.adjustedPriceReason
                                    ? curr.adjustedPrice ?? 0
                                    : curr.serviceCatalog?.listedPrice ?? 0;
                                return acc + (price ?? 0);
                              }, 0);

                              return total.toLocaleString("vi-VN") + "đ";
                            })()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
