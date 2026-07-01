export interface OrderCreateRequest {
  customerId?: string
  licensePlate: string
  brandCode: string
  modelCode: string
  imageUrl: string
  vehicleNote: string
  date: string          // LocalDateTime — "YYYY-MM-DDTHH:MM:SS"
  checkInTime: string   // LocalTime   — "HH:MM:SS"
  checkOutTime: string | null
  paymentType: string
  paymentStatus: string
  tip: number
  vat: number
  discount: number
  totalPrice: number
  note: string
  orderDetails: OrderDetail[]
}

export interface OrderDetail {
  employeeIds: number[]
  services: ServiceAdjust[]
  status: string
  note: string
  licensePlate: string
  brandCode: string
  modelCode: string
  imageUrl: string
  vehicleNote: string
}

export interface ServiceAdjust {
  serviceCatalogCode: string
  adjustedPrice: number
  adjustedPriceFlag: boolean
  adjustedPriceReason: string
  quantity: number
}
