export interface Service {
  serviceCode: string
  serviceName: string
  discountAmount: number | null
  discountPercent: number | null
}

export interface Promotion {
  id: string
  promoCode: string
  promoName: string
  promoType: "SERVICE_AMOUNT" | "SERVICE_PERCENT" | "BILL_AMOUNT" | "BILL_PERCENT"
  value: number | null
  usageLimit: number
  startDate: string
  endDate: string | null
  description: string
  status: "ACTIVE" | "INACTIVE" | "EXPIRED"
  promotionMethod: string
  campaignLink: string
  targetAudience: string
  createdBy: string
  createdAt: string
  updatedAt: string
  services: Service[]
}
