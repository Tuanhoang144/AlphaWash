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
import { Car, Users, Clock, FileText, Plus, Minus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tool } from "@/utils/tool";
import { OrderDetailDTO } from "@/types/OrderResponse";
import { getProductLineTotal } from "@/shared/utils/order/calculatePrice";

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
  const totalProducts = orderDetails.reduce(
    (sum, detail) => sum + (detail.products || []).length,
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
            <div className={`grid gap-4 ${totalProducts > 0 ? "grid-cols-3" : "grid-cols-2"}`}>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <Car className="h-4 w-4" />
                  <span className="text-sm font-medium">Dịch vụ</span>
                </div>
                <div className="text-xl font-bold text-blue-700">
                  {totalServices}
                </div>
              </div>
              {totalProducts > 0 && (
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                    <Package className="h-4 w-4" />
                    <span className="text-sm font-medium">Sản phẩm</span>
                  </div>
                  <div className="text-xl font-bold text-purple-700">
                    {totalProducts}
                  </div>
                </div>
              )}
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
              <div
                key={
                  orderDetails[0].vehicle?.id
                    ? `detail-${orderDetails[0].vehicle.id}`
                    : `detail-${0}`
                }
                className="border rounded-lg p-3 space-y-2"
              >
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
                        {detail.service && detail.service.length > 0
                          ? detail.service.map((service, serviceIndex) => {
                              const safeName = (
                                service.serviceName || "no-name"
                              )
                                .toString()
                                .replace(/\s+/g, "_")
                                .replace(/[^a-zA-Z0-9_\-]/g, "");
                              const serviceKey = `${service.id ?? "s"}-${
                                service.serviceCatalog?.id ?? "c"
                              }-${safeName}-${serviceIndex}`;

                              return (
                                <div
                                  className="flex justify-between items-center"
                                  key={serviceKey}
                                >
                                  <div>
                                    <span className="font-medium">
                                      {service.serviceName ||
                                        "Không rõ dịch vụ"}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {service.serviceCatalog ? (
                                      <div className="price">
                                        {(
                                          ((service.adjustedPriceFlag === true &&
                                          service.adjustedPriceReason
                                            ? service.adjustedPrice
                                            : service.serviceCatalog
                                                ?.listedPrice) ?? 0) *
                                          (service.quantity || 1)
                                        ).toLocaleString("vi-VN")}
                                        VNĐ
                                        {(service.quantity || 1) > 1 && (
                                          <span className="text-[10px] text-gray-400 ml-1">
                                            (x{service.quantity})
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      "Không rõ giá"
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          : "Không rõ dịch vụ"}
                        {/* Product lines */}
                        {detail.products && detail.products.length > 0 && (
                          <>
                            <div className="text-xs text-purple-600 font-medium mt-2 pt-2 border-t border-dashed">
                              Sản phẩm:
                            </div>
                            {detail.products.map((product, pIndex) => (
                              <div
                                className="flex justify-between items-center"
                                key={`product-${product.productCode}-${pIndex}`}
                              >
                                <div>
                                  <span className="font-medium">
                                    {product.productName}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  <div className="price">
                                    {getProductLineTotal(product).toLocaleString("vi-VN")}
                                    VNĐ
                                    {product.quantity > 1 && (
                                      <span className="text-[10px] text-gray-400 ml-1">
                                        (x{product.quantity})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
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
                        {(() => {
                          const serviceTotal = (detail.service || []).reduce(
                            (acc, curr) => {
                              const unitPrice =
                                curr.adjustedPriceFlag === true &&
                                curr.adjustedPriceReason
                                  ? curr.adjustedPrice ?? 0
                                  : curr.serviceCatalog?.listedPrice ?? 0;
                              return acc + unitPrice * (curr.quantity || 1);
                            },
                            0
                          );
                          const productTotal = (detail.products || []).reduce(
                            (acc, p) => acc + getProductLineTotal(p),
                            0
                          );
                          const total = serviceTotal + productTotal;
                          return total > 0
                            ? total.toLocaleString("vi-VN") + "đ"
                            : "N/A";
                        })()}
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
