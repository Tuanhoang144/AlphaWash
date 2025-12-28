"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Car, Users, FileText, Plus, Minus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tool } from "@/utils/tool";
import type { OrderDetailDTO, ServiceDTO } from "@/types/OrderResponse";
import type { PromotionApiItem } from "@/shared/types/PromotionApiItem";
import type { ComboApiItem } from "@/shared/types/ComboApi";
import {
  getServiceDiscount,
  getServiceFinalPrice,
  calculateServicePromotionDiscount,
  calculateBillPromotionDiscount,
} from "@/shared/utils/order/promotionCalculator";

interface InvoiceSummaryProps {
  orderDetails: OrderDetailDTO[];
  totalPrice: number;
  statusPayment: string;
  deleteFlag?: boolean;
  promotion?: PromotionApiItem | null;
  combos?: ComboApiItem[];
}

export default function InvoiceSummary({
  statusPayment,
  orderDetails,
  totalPrice,
  deleteFlag,
  promotion,
  combos,
}: InvoiceSummaryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { getStatusVehicleColor, getStatusVehicleLabel } = tool();

  // ===== catalogCode -> info =====
  const catalogMap = useMemo(() => {
    const map = new Map<
      string,
      { comboName: string; size?: string; price?: number; comboCode?: string }
    >();

    (combos ?? []).forEach((c: any) => {
      const comboName = c?.comboName ?? c?.combo_name ?? c?.name ?? "";

      (c?.catalogs ?? c?.catalog ?? []).forEach((cat: any) => {
        const catalogCode =
          cat?.catalogCode ?? cat?.catalog_code ?? cat?.code ?? cat?.id;

        if (!catalogCode) return;

        map.set(String(catalogCode).toUpperCase(), {
          comboName,
          size: cat?.size ?? "",
          price: Number(cat?.price ?? cat?.listedPrice ?? 0),
          comboCode: c?.comboCode ?? c?.combo_code ?? "",
        });
      });
    });

    return map;
  }, [combos]);

  const isComboDetail = (d: OrderDetailDTO) =>
    (d.orderType || "").toUpperCase() === "COMBO";

  // ===== Quick stats =====
  const totalComboLines = useMemo(
    () => orderDetails.filter((d) => isComboDetail(d)).length,
    [orderDetails]
  );

  const totalServices = useMemo(() => {
    return orderDetails.reduce((sum, detail) => {
      if (isComboDetail(detail)) return sum;
      return sum + (detail.service?.length ?? 0);
    }, 0);
  }, [orderDetails]);

  const totalEmployees = useMemo(() => {
    return orderDetails.reduce((sum, detail) => {
      return sum + (detail.employees?.length ?? 0);
    }, 0);
  }, [orderDetails]);

  // ===== Totals (promotion) =====
  const calculateTotalBeforePromotion = (): number => {
    // Nếu có combo: dùng totalPrice (đã tính từ hook)
    const hasCombo = orderDetails.some((d) => isComboDetail(d));
    if (hasCombo) return Number(totalPrice ?? 0);

    return orderDetails.reduce((sum, detail) => {
      const sub = (detail.service ?? []).reduce((serviceSum, service) => {
        const price =
          service.adjustedPriceFlag === true && service.adjustedPriceReason
            ? Number(service.adjustedPrice ?? 0)
            : Number(service.serviceCatalog?.listedPrice ?? 0);
        return serviceSum + price;
      }, 0);
      return sum + sub;
    }, 0);
  };

  const calculateTotalServiceDiscount = (): number => {
    if (
      !promotion ||
      !["SERVICE_AMOUNT", "SERVICE_PERCENT"].includes(promotion.promoType)
    )
      return 0;

    // chỉ discount theo service lines
    const allServices = orderDetails.flatMap((detail) => detail.service ?? []);
    return calculateServicePromotionDiscount(allServices, promotion);
  };

  const calculateTotalBillDiscount = (): number => {
    if (
      !promotion ||
      !["BILL_AMOUNT", "BILL_PERCENT"].includes(promotion.promoType)
    )
      return 0;

    const totalBeforePromotion = calculateTotalBeforePromotion();
    const serviceDiscount = calculateTotalServiceDiscount();
    const totalAfterServiceDiscount = totalBeforePromotion - serviceDiscount;

    return calculateBillPromotionDiscount(totalAfterServiceDiscount, promotion);
  };

  const totalBeforePromotion = calculateTotalBeforePromotion();
  const serviceDiscount = calculateTotalServiceDiscount();
  const billDiscount = calculateTotalBillDiscount();
  const totalDiscountAmount = serviceDiscount + billDiscount;

  // ===== render helpers =====
  const renderComboLine = (detail: OrderDetailDTO) => {
    const comboLine: ServiceDTO = detail.service?.[0];
    // lấy catalogCode từ nhiều field có thể có
    const rawCatalogCombo = comboLine?.serviceComboCatalog;

    const comboName = rawCatalogCombo?.comboName ?? "Combo";
    const listedPrice = Number(rawCatalogCombo?.price ?? 0);

    const price =
      comboLine?.adjustedPriceFlag === true && comboLine?.adjustedPriceReason
        ? Number(comboLine?.adjustedPrice ?? 0)
        : listedPrice > 0
        ? listedPrice
        : Number(totalPrice ?? 0);

    return (
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-medium">{comboName}</span>
        </div>
        <div className="text-xs text-gray-500">
          {price.toLocaleString("vi-VN")} VNĐ
        </div>
      </div>
    );
  };

  const renderServiceLines = (detail: OrderDetailDTO) => {
    if (!detail.service || detail.service.length === 0)
      return "Không rõ dịch vụ";

    return detail.service.map((service: any, serviceIndex: number) => {
      const safeName = (service.serviceName || "no-name")
        .toString()
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_-]/g, "");

      const serviceKey = `${service.id ?? "s"}-${
        service.serviceCatalog?.id ?? "c"
      }-${safeName}-${serviceIndex}`;

      const basePrice =
        service.adjustedPriceFlag === true && service.adjustedPriceReason
          ? Number(service.adjustedPrice ?? 0)
          : Number(service.serviceCatalog?.listedPrice ?? 0);

      const discount = getServiceDiscount(service, promotion);
      const finalPrice = getServiceFinalPrice(service, promotion);

      return (
        <div className="flex justify-between items-center" key={serviceKey}>
          <div>
            <span className="font-medium">
              {service.serviceName || "Không rõ dịch vụ"}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {service.serviceCatalog ? (
              <div className="flex flex-col items-end gap-0.5">
                <div>{basePrice.toLocaleString("vi-VN")} VNĐ</div>
                {discount > 0 && (
                  <>
                    <div className="line-through text-red-500">
                      -{discount.toLocaleString("vi-VN")} VNĐ
                    </div>
                    <div className="font-semibold text-green-600">
                      {finalPrice.toLocaleString("vi-VN")} VNĐ
                    </div>
                  </>
                )}
              </div>
            ) : (
              "Không rõ giá"
            )}
          </div>
        </div>
      );
    });
  };

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
            {deleteFlag && (
              <div className="rounded-xl bg-red-100 p-4 text-center shadow-sm">
                <div className="flex justify-center items-center gap-2 text-red-600 mb-1">
                  <span className="text-sm font-medium">
                    Đơn hàng đã bị hủy
                  </span>
                </div>
              </div>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <Car className="h-4 w-4" />
                  <span className="text-sm font-medium">Dịch vụ</span>
                </div>
                <div className="text-xl font-bold text-blue-700">
                  {totalServices}
                </div>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                  <Tag className="h-4 w-4" />
                  <span className="text-sm font-medium">Combo</span>
                </div>
                <div className="text-xl font-bold text-purple-700">
                  {totalComboLines}
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

            {orderDetails && orderDetails.length > 0 && (
              <div
                key={
                  orderDetails[0].vehicle?.id
                    ? `detail-${orderDetails[0].vehicle.id}`
                    : `detail-${0}`
                }
                className="border rounded-lg p-3 space-y-2"
              >
                <h4 className="font-medium text-sm">Chi tiết:</h4>

                {orderDetails.map((detail, index) => {
                  const combo = isComboDetail(detail);

                  return (
                    <div
                      key={index}
                      className="border rounded-lg p-3 space-y-2"
                    >
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
                          {combo && (
                            <Badge variant="secondary" className="text-xs">
                              COMBO
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
                          {combo
                            ? renderComboLine(detail)
                            : renderServiceLines(detail)}
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
                    </div>
                  );
                })}
              </div>
            )}

            <Separator />

            <div className="space-y-2 bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-medium">
                  {totalBeforePromotion.toLocaleString("vi-VN")} VNĐ
                </span>
              </div>

              {serviceDiscount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Giảm giá dịch vụ:</span>
                  <span className="font-medium">
                    -{serviceDiscount.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              )}

              {billDiscount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Giảm giá hóa đơn:</span>
                  <span className="font-medium">
                    -{billDiscount.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              )}

              {totalDiscountAmount > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tổng giảm:</span>
                    <span className="font-semibold text-red-600">
                      -{totalDiscountAmount.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
