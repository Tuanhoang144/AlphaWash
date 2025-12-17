"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Car, Users, FileText, Plus, Minus, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { tool } from "@/utils/tool"
import type { OrderDetailDTO } from "@/types/OrderResponse"
import type { PromotionApiItem } from "@/shared/types/PromotionApiItem"
import {
  getServiceDiscount,
  getServiceFinalPrice,
  calculateServicePromotionDiscount,
  calculateBillPromotionDiscount,
  getPromotionInfoText,
} from "@/shared/utils/order/promotionCalculator"

interface InvoiceSummaryProps {
  orderDetails: OrderDetailDTO[]
  totalPrice: number
  statusPayment: string
  deleteFlag?: boolean
  promotion?: PromotionApiItem | null
}

export default function InvoiceSummary({
  statusPayment,
  orderDetails,
  totalPrice,
  deleteFlag,
  promotion,
}: InvoiceSummaryProps) {
  const [isOpen, setIsOpen] = useState(true)

  const totalServices = orderDetails.reduce((sum, detail) => sum + detail.service.length, 0)
  const totalEmployees = orderDetails.reduce((sum, detail) => sum + detail.employees.length, 0)
  const { getStatusVehicleColor, getStatusVehicleLabel } = tool()

  const calculateTotalBeforePromotion = (): number => {
    return orderDetails.reduce(
      (sum, detail) =>
        sum +
        detail.service.reduce((serviceSum, service) => {
          const price =
            service.adjustedPriceFlag === true && service.adjustedPriceReason
              ? (service.adjustedPrice ?? 0)
              : (service.serviceCatalog?.listedPrice ?? 0)
          return serviceSum + price
        }, 0),
      0,
    )
  }

  const calculateTotalServiceDiscount = (): number => {
    if (!promotion || !["SERVICE_AMOUNT", "SERVICE_PERCENT"].includes(promotion.promoType)) {
      return 0
    }

    const allServices = orderDetails.flatMap((detail) => detail.service)
    return calculateServicePromotionDiscount(allServices, promotion)
  }

  const calculateTotalBillDiscount = (): number => {
    if (!promotion || !["BILL_AMOUNT", "BILL_PERCENT"].includes(promotion.promoType)) {
      return 0
    }

    const totalBeforePromotion = calculateTotalBeforePromotion()
    const serviceDiscount = calculateTotalServiceDiscount()
    const totalAfterServiceDiscount = totalBeforePromotion - serviceDiscount

    return calculateBillPromotionDiscount(totalAfterServiceDiscount, promotion)
  }

  const totalBeforePromotion = calculateTotalBeforePromotion()
  const serviceDiscount = calculateTotalServiceDiscount()
  const billDiscount = calculateTotalBillDiscount()
  const totalDiscountAmount = serviceDiscount + billDiscount

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
              {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
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
                  <span className="text-sm font-medium">Đơn hàng đã bị hủy</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <Car className="h-4 w-4" />
                  <span className="text-sm font-medium">Dịch vụ</span>
                </div>
                <div className="text-xl font-bold text-blue-700">{totalServices}</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Nhân viên</span>
                </div>
                <div className="text-xl font-bold text-green-700">{totalEmployees}</div>
              </div>
            </div>

            <Separator />

            {orderDetails && orderDetails.length > 0 && (
              <div
                key={orderDetails[0].vehicle?.id ? `detail-${orderDetails[0].vehicle.id}` : `detail-${0}`}
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
                      <div className={`text-xs px-2 py-1 rounded-full border ${getStatusVehicleColor(statusPayment)}`}>
                        {getStatusVehicleLabel(statusPayment)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="space-y-1">
                        {detail.service && detail.service.length > 0
                          ? detail.service.map((service, serviceIndex) => {
                              const safeName = (service.serviceName || "no-name")
                                .toString()
                                .replace(/\s+/g, "_")
                                .replace(/[^a-zA-Z0-9_-]/g, "")
                              const serviceKey = `${service.id ?? "s"}-${
                                service.serviceCatalog?.id ?? "c"
                              }-${safeName}-${serviceIndex}`

                              const basePrice =
                                service.adjustedPriceFlag === true && service.adjustedPriceReason
                                  ? (service.adjustedPrice ?? 0)
                                  : (service.serviceCatalog?.listedPrice ?? 0)

                              const discount = getServiceDiscount(service, promotion)
                              const finalPrice = getServiceFinalPrice(service, promotion)

                              return (
                                <div className="flex justify-between items-center" key={serviceKey}>
                                  <div>
                                    <span className="font-medium">{service.serviceName || "Không rõ dịch vụ"}</span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {service.serviceCatalog ? (
                                      <div className="flex flex-col items-end gap-0.5">
                                        <div>
                                          {basePrice.toLocaleString("vi-VN")}
                                          VNĐ
                                        </div>
                                        {discount > 0 && (
                                          <>
                                            <div className="line-through text-red-500">
                                              -{discount.toLocaleString("vi-VN")}
                                              VNĐ
                                            </div>
                                            <div className="font-semibold text-green-600">
                                              {finalPrice.toLocaleString("vi-VN")}
                                              VNĐ
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    ) : (
                                      "Không rõ giá"
                                    )}
                                  </div>
                                </div>
                              )
                            })
                          : "Không rõ dịch vụ"}
                      </div>
                    </div>

                    {detail.employees?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {detail.employees.map((employee) => (
                          <Badge key={employee.id} variant="outline" className="text-xs">
                            {employee.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm">Tổng tiền:</span>
                      <span className="font-medium text-green-600">
                        {detail.service && detail.service.length > 0
                          ? (() => {
                              const total = detail.service.reduce((acc, curr) => {
                                const price = getServiceFinalPrice(curr, promotion)
                                return acc + price
                              }, 0)

                              return total.toLocaleString("vi-VN") + "đ"
                            })()
                          : "N/A"}
                      </span>
                    </div> */}
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <div className="space-y-2 bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng tiền dịch vụ:</span>
                <span className="font-medium">{totalBeforePromotion.toLocaleString("vi-VN")} VNĐ</span>
              </div>

              {serviceDiscount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Giảm giá dịch vụ:</span>
                  <span className="font-medium">-{serviceDiscount.toLocaleString("vi-VN")} VNĐ</span>
                </div>
              )}

              {billDiscount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Giảm giá hóa đơn:</span>
                  <span className="font-medium">-{billDiscount.toLocaleString("vi-VN")} VNĐ</span>
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
  )
}
