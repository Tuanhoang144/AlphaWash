import type { PromotionApiItem } from "@/shared/types/PromotionApiItem"
import type { ServiceDTO } from "@/types/OrderResponse"

/**
 * Get discount for a specific service based on promotion
 */
export const getServiceDiscount = (service: ServiceDTO, promotion: PromotionApiItem | null | undefined): number => {
  if (!promotion) return 0

  const serviceCode = service.serviceCatalog?.code
  if (!serviceCode) return 0

  const promoService = promotion.services?.find((s) => s.serviceCode === serviceCode)

  if (!promoService) return 0

  const basePrice =
    service.adjustedPriceFlag && service.adjustedPriceReason
      ? (service.adjustedPrice ?? 0)
      : (service.serviceCatalog?.listedPrice ?? 0)

  if (promoService.discountAmount !== null) {
    return promoService.discountAmount
  }

  if (promoService.discountPercent !== null) {
    return Math.round((basePrice * promoService.discountPercent) / 100)
  }

  return 0
}

/**
 * Get final price of a service after applying promotion
 */
export const getServiceFinalPrice = (service: ServiceDTO, promotion: PromotionApiItem | null | undefined): number => {
  const basePrice =
    service.adjustedPriceFlag && service.adjustedPriceReason
      ? (service.adjustedPrice ?? 0)
      : (service.serviceCatalog?.listedPrice ?? 0)

  const discount = getServiceDiscount(service, promotion)
  return Math.max(0, basePrice - discount)
}

/**
 * Calculate total discount for SERVICE type promotions
 */
export const calculateServicePromotionDiscount = (services: ServiceDTO[], promotion: PromotionApiItem): number => {
  if (!["SERVICE_AMOUNT", "SERVICE_PERCENT"].includes(promotion.promoType)) {
    return 0
  }

  return services.reduce((total, service) => {
    return total + getServiceDiscount(service, promotion)
  }, 0)
}

/**
 * Calculate discount for BILL type promotions (applied after service discounts)
 */
export const calculateBillPromotionDiscount = (
  totalAfterServiceDiscount: number,
  promotion: PromotionApiItem,
): number => {
  if (!["BILL_AMOUNT", "BILL_PERCENT"].includes(promotion.promoType)) {
    return 0
  }

  if (promotion.promoType === "BILL_AMOUNT") {
    return promotion.value ?? 0
  }

  if (promotion.promoType === "BILL_PERCENT") {
    return Math.round((totalAfterServiceDiscount * (promotion.value ?? 0)) / 100)
  }

  return 0
}

/**
 * Get promotion info text for display
 */
export const getPromotionInfoText = (promotion: PromotionApiItem): string => {
  if (promotion.promoType === "SERVICE_AMOUNT") {
    return "Giảm tiền theo dịch vụ"
  }
  if (promotion.promoType === "SERVICE_PERCENT") {
    return "Giảm % theo dịch vụ"
  }
  if (promotion.promoType === "BILL_AMOUNT") {
    return `Giảm ${promotion.value?.toLocaleString("vi-VN")} VNĐ`
  }
  if (promotion.promoType === "BILL_PERCENT") {
    return `Giảm ${promotion.value}%`
  }
  return "Khuyến mãi"
}
